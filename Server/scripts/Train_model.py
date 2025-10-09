from enum import Enum
from matplotlib.pylab import ceil
from transformers import (
    AutoConfig,
    AutoTokenizer,
)
from transformers import (
    AutoModelForSeq2SeqLM,
)
import torch
import yaml
import matplotlib.pyplot as plt
from load_datasets import load_datasets
from Model_Handler import Model_Handler

from plot_results import plot_epoch_results
from utils import create_schema, delete_metric_results, summarize_results


class Mode(Enum):
    TRAIN = "train"
    TEST = "test"
    QUERY = "query"
    GRAPH = "graph"

    @staticmethod
    def from_str(label: str):
        if not isinstance(label, str):
            raise TypeError(f"Expected string, got {type(label).__name__}")

        label = label.lower()
        for mode in Mode:
            if mode.value == label:
                return mode
        raise ValueError(
            f"Invalid mode: {label}. Valid options are {[m.value for m in Mode]}"
        )


class QueryPayload:
    def __init__(self, question, database_name, schema_json):
        self.question = question
        self.database_name = database_name
        self.formatted_schema = create_schema(schema_json)


def main(mode: Mode, query_payload: QueryPayload = None):
    if not isinstance(mode, Mode):
        raise TypeError(f"mode must be a member of Mode enum, got {mode!r}")

    if mode == Mode.QUERY and (
        query_payload == None or not isinstance(query_payload, QueryPayload)
    ):
        raise TypeError(f"mode is query but query is malformed or missing")

    config = yaml.safe_load(open("config.yml"))

    model_handler = Model_Handler(config)
    if mode == Mode.TRAIN:
        loaded_datasets = load_datasets("TRAIN")
        model_handler.train(loaded_datasets)
    elif mode == Mode.TEST:
        compute_results_dir = config.get("compute_results_dir")
        delete_metric_results(compute_results_dir)
        loaded_datasets = load_datasets("TEST")
        model_handler.test(loaded_datasets)
        results = summarize_results(compute_results_dir)
        plot_epoch_results(results["eval"], results["test"], compute_results_dir)
    elif mode == Mode.GRAPH:
        results = summarize_results(config.get("compute_results_dir"))
        plot_epoch_results(
            results["eval"], results["test"], config.get("compute_results_dir")
        )
    elif mode == Mode.QUERY:
        result = model_handler.query(
            query_payload.database_name,
            query_payload.formatted_schema,
            query_payload.question,
        )
        return result


if __name__ == "__main__":
    main(Mode.TEST)
