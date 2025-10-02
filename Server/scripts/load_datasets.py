import json
import yaml
from collections import defaultdict


config = yaml.safe_load(open("config.yml"))


def load_data(filepath):
    with open(filepath) as json_file:
        return json.load(json_file)


def _splitTrainingDataToStages(dataset):

    def stage_from_bits(bits):
        # Order from hardest to easiest for staging
        # Set ops > having > groupBy > order/limit > where/join > select
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


def load_datasets():
    training_dataset = load_data(config["spider_training_dataset"])
    training_dataset_stages = _splitTrainingDataToStages(training_dataset)
    training_tables = load_data(config["spider_training_tables_dataset"])

    validation_dataset = load_data(config["spider_validation_dataset"])
    validation_dataset_stages = _splitTrainingDataToStages(validation_dataset)
    
    testing_dataset = load_data(config["spider_test_dataset"])
    testing_dataset_stages = _splitTrainingDataToStages(testing_dataset)
    testing_tables = load_data(config["spider_test_tables_dataset"])
    return {
        "datasets": {
            "training": training_dataset_stages,
            "validation": validation_dataset_stages,
            "testing": testing_dataset_stages,
        },
        "tables": {"training": training_tables, "testing": testing_tables},
    }


if __name__ == "__main__":
    load_datasets()
