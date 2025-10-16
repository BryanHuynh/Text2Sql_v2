from enum import Enum
from Monitor import Monitor
from utils import QueryPayload
from trainer.load_datasets import load_datasets
from trainer.Model_Handler import Model_Handler

from config import Config
from utils import (
    delete_metric_results,
    summarize_results,
    plot_epoch_results,
)


class Mode(Enum):
    TRAIN = "train"
    TEST = "test"
    QUERY = "query"
    GRAPH = "graph"
    MONITOR = "monitor"

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


def main(mode: Mode, query_payload: QueryPayload = None):
    cfg = Config()
    if not isinstance(mode, Mode):
        raise TypeError(f"mode must be a member of Mode enum, got {mode!r}")

    if mode == Mode.QUERY and (
        query_payload == None or not isinstance(query_payload, QueryPayload)
    ):
        raise TypeError(f"mode is query but query is malformed or missing")

    model_handler = Model_Handler()
    if mode == Mode.TRAIN:
        loaded_datasets = load_datasets("TRAIN")
        model_handler.train(loaded_datasets)
    elif mode == Mode.TEST:
        compute_results_dir = cfg.compute_results_dir
        delete_metric_results(compute_results_dir)
        loaded_datasets = load_datasets("TEST")
        model_handler.test(loaded_datasets)
        results = summarize_results(compute_results_dir)
        plot_epoch_results(results["eval"], results["test"], compute_results_dir)
    elif mode == Mode.GRAPH:
        results = summarize_results(cfg.compute_results_dir)
        plot_epoch_results(results["eval"], results["test"], cfg.compute_results_dir)
    elif mode == Mode.QUERY:
        result = model_handler.query(
            query_payload.database_name,
            query_payload.formatted_schema,
            query_payload.question,
        )
        return result
    elif mode == Mode.MONITOR:
        monitor = Monitor(model_handler)
        monitor.start()


if __name__ == "__main__":
    main(Mode.MONITOR)
