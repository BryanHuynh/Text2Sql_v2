import json
from typing import Literal, TypedDict
from collections import defaultdict

from config import Config


def load_data(filepath):
    with open(filepath) as json_file:
        return json.load(json_file)


def _normalize_stage_buckets(stage_dict: dict, max_stage: int):
    """
    Returns a list of length max_stage where missing stages are [].
    Accepts stage_dict keyed by 0- or 1-based ints.
    """
    if not stage_dict:
        return [[] for _ in range(max_stage)]

    keys = list(stage_dict.keys())
    # tolerate string keys
    try:
        keys = [int(k) for k in keys]
    except Exception:
        pass

    zero_based = 0 in keys
    out = [[] for _ in range(max_stage)]
    for k, v in stage_dict.items():
        k = int(k)
        idx = k if zero_based else (k - 1)
        if 0 <= idx < max_stage:
            out[idx] = v
    return out


def _splitDataToStages(dataset):

    def stage_from_bits(bits):
        # Order from hardest to easiest for staging
        # Set ops > having > groupBy > order/limit > where/join > select
        if bits[7] == "1":
            return 6
        if bits[6] == "1":
            return 5
        if bits[3] == "1":
            return 4
        if bits[2] == "1":
            return 3
        if bits[4] == "1" or bits[5] == "1":
            return 2
        if bits[1] == "1" or bits[7] == "1":
            return 1
        return 0  # SELECT-only (or none detected)

    buckets_by_stage = defaultdict(list)

    for item in dataset:
        bits = ["0"] * 8
        tokens = item.get("query_toks_no_value") or []
        toks = [t.upper() for t in tokens]

        i = 0
        while i < len(toks):
            tok = toks[i]

            if tok == "SELECT":
                bits[0] = "1"

            elif tok == "WHERE":
                bits[1] = "1"

            elif tok == "GROUP" and i + 1 < len(toks) and toks[i + 1] == "BY":
                bits[2] = "1"
                i += 1

            elif tok == "HAVING":
                bits[3] = "1"

            elif tok == "ORDER" and i + 1 < len(toks) and toks[i + 1] == "BY":
                bits[4] = "1"
                i += 1

            elif tok == "LIMIT":
                bits[5] = "1"

            elif tok in ("UNION", "INTERSECT", "EXCEPT"):
                bits[6] = "1"

            elif tok in ("JOIN", "INNER", "LEFT", "RIGHT", "FULL", "CROSS"):
                bits[7] = "1"

            i += 1

        flag = "".join(bits)
        item["components_flag"] = flag

        stage_id = stage_from_bits(bits)
        buckets_by_stage[stage_id].append(item)

    return dict(buckets_by_stage)


def load_datasets(mode: Literal["TRAIN", "TEST"]):
    cfg = Config()
    if mode == "TRAIN":
        training_dataset = load_data(cfg.spider_training_dataset)
        training_dataset_stages = _splitDataToStages(training_dataset)
    else:
        training_dataset_stages = {0: []}
    training_databases = load_data(cfg.spider_training_tables_dataset)

    validation_dataset = load_data(cfg.spider_validation_dataset)
    validation_dataset_stages = _splitDataToStages(validation_dataset)

    testing_dataset = load_data(cfg.spider_test_dataset)
    testing_dataset_stages = _splitDataToStages(testing_dataset)
    testing_databases = load_data(cfg.spider_test_tables_dataset)

    all_stage_ids = set()
    for d in (
        training_dataset_stages,
        validation_dataset_stages,
        testing_dataset_stages,
    ):
        all_stage_ids.update(int(k) for k in d.keys())  # tolerate str keys
    max_stage = max(all_stage_ids) if all_stage_ids else 0

    # Normalize to lists with missing stages = []
    training_dataset_stages_list = _normalize_stage_buckets(
        training_dataset_stages, max_stage
    )
    validation_dataset_stages_list = _normalize_stage_buckets(
        validation_dataset_stages, max_stage
    )
    testing_dataset_stages_list = _normalize_stage_buckets(
        testing_dataset_stages, max_stage
    )

    training_databases = load_data(cfg.spider_training_tables_dataset)
    testing_databases = load_data(cfg.spider_test_tables_dataset)

    return {
        "datasets": {
            "training": training_dataset_stages_list,
            "validation": validation_dataset_stages_list,
            "testing": testing_dataset_stages_list,
        },
        "databases": {
            "training": training_databases,
            "testing": testing_databases,
        },
    }


if __name__ == "__main__":
    load_datasets()
