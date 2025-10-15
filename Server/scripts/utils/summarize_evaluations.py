import json
import os

import numpy as np


def summarize_results(results_dir: str):
    summary = {"eval": [], "test": []}

    for file_name in os.listdir(results_dir):
        file_path = os.path.join(results_dir, file_name)

        # Skip non-files
        if not os.path.isfile(file_path):
            continue

        # Detect file type (eval/test)
        if file_name.startswith("eval_Results_"):
            key = "eval"
        elif file_name.startswith("test_Results_"):
            key = "test"
        else:
            continue  # skip unrelated files

        results = {}
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    continue  # skip malformed lines
                epoch = data.get("epoch", 0)
                data = {
                    "epoch": epoch,
                    "prediction_valid": data.get("prediction_valid", 0),
                    "exact_match": data.get("exact_match", 0),
                    "exec_match": data.get("exec_match", 0),
                }
                results.setdefault(epoch, []).append(data)

            for epoch in results.keys():
                prediction_valid_avg = np.average(
                    [r["prediction_valid"] for r in results[epoch]]
                )
                exact_match_avg = np.average([r["exact_match"] for r in results[epoch]])
                exec_match_avg = np.average([r["exec_match"] for r in results[epoch]])
                results[epoch] = {
                    "epoch": epoch,
                    "prediction_valid": prediction_valid_avg,
                    "exact_match": exact_match_avg,
                    "exec_match": exec_match_avg,
                }

        summary[key].append(results)
    return summary
