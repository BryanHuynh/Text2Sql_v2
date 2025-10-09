from distutils.command import config
import os
import re
from typing import TypedDict

from flask import json
import numpy as np
import torch
from transformers import AutoConfig, AutoModelForSeq2SeqLM, AutoTokenizer


TYPE_MAP = {
    "number": "num",
    "text": "str",
    "time": "dt",
    "date": "dt",
    "datetime": "dt",
    "boolean": "bool",
    "bool": "bool",
    "integer": "int",
    "real": "num",
}


def typeMapping(type):
    t = type.lower()
    return TYPE_MAP.get(
        t,
        (
            "int"
            if "int" in t
            else (
                "num"
                if any(k in t for k in ["real", "float", "double", "decimal"])
                else "str"
            )
        ),
    )


def latest_model_stage(models_dir: str):
    if not os.path.isdir(models_dir):
        return (None, None)

    best = (None, None)
    for name in os.listdir(models_dir):
        m = re.match(r"^(.*?)-Stage_(\d+)$", name)
        if not m:
            continue
        stage_num = int(m.group(2))
        path = os.path.join(models_dir, name)
        if best[0] is None or stage_num > best[0]:
            best = (stage_num, path)
    return best


def create_schema(schema_json):
    column_names = schema_json["column_names_original"]
    column_types = schema_json["column_types"]
    table_names = schema_json["table_names_original"]
    primary_keys = set(schema_json["primary_keys"])
    foreign_keys = schema_json["foreign_keys"]
    db_id = schema_json["db_id"]

    forward_foreign_keys = {}
    for source_idx, target_idx in foreign_keys:
        forward_foreign_keys.setdefault(source_idx, []).append(target_idx)

    def _format_foreign_key(column_idx, fk_map, arrow):
        formatted = []
        for related_idx in fk_map.get(column_idx, []):
            table_idx, col_name = column_names[related_idx]
            if table_idx == -1:
                continue
            related_table = table_names[table_idx]
            formatted.append(f"{arrow} {related_table}.{col_name}")
        return formatted

    table_chunks = []
    for table_idx, table_name in enumerate(table_names):
        column_chunks = []
        for column_idx, (col_table_idx, column_name) in enumerate(column_names):
            if col_table_idx != table_idx:
                continue

            contents = [typeMapping(column_types[column_idx])]

            if column_idx in primary_keys:
                contents.append("pk")

            contents.extend(
                _format_foreign_key(column_idx, forward_foreign_keys, "fk ->")
            )

            unique_contents = []
            seen_contents = set()
            for content in contents:
                if content not in seen_contents:
                    unique_contents.append(content)
                    seen_contents.add(content)

            content_str = " , ".join(unique_contents)
            column_chunks.append(f"{column_name} ( {content_str} )")

        if not column_chunks:
            continue

        table_chunks.append(f"{table_name} : {' , '.join(column_chunks)}")

    if not table_chunks:
        return db_id

    return f"{' | '.join(table_chunks)}"


def format_source(question, db_name, schema):
    return f"{question} | {db_name} | {schema}"


def get_latest_model_and_tokenizer(config):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch.cuda.empty_cache()
    if device == "cuda":
        torch.backends.cudnn.benchmark = True

    models_dir = config.get("model_save_location")
    last_stage_idx, ckpt = latest_model_stage(models_dir)
    pretrained_model = ckpt if ckpt else config.get("pretrained_source_model")
    print(f"using model: {pretrained_model}")

    tokenizer = AutoTokenizer.from_pretrained(pretrained_model)
    cfg = AutoConfig.from_pretrained(pretrained_model)
    model = AutoModelForSeq2SeqLM.from_pretrained(pretrained_model, config=cfg).to(
        device
    )
    return tokenizer, model, last_stage_idx, device


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
