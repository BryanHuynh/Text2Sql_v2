import os
import re


def delete_metric_results(results_dir: str, start=0):
    for file_name in os.listdir(results_dir):
        file_path = os.path.join(results_dir, file_name)
        if not os.path.isfile(file_path):
            continue

        m = re.match(r"^(.*?)_Results_(\d+)\.jsonl", file_name)
        if not m:
            continue
        stage_num = int(m.group(2))
        if stage_num >= start:
            print(f"removing file {file_name}")
            os.remove(file_path)