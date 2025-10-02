import sqlite3
from time import time
import json
import numpy as np


def clean_sql_query(s: str) -> str:
    if not s:
        return ""
    s = s.strip().rstrip(";")
    return " ".join(s.split())


def db_resolver(db_id: str) -> str:
    return f"../spider_data/database/{db_id}/{db_id}.sqlite"


def _normalize_result(cols, rows):
    """Sort rows (and optionally columns) to make comparison order-insensitive."""
    if cols is None or rows is None:
        return None, None
    # Rows as sorted list of tuples
    try:
        rows_sorted = tuple(sorted(tuple(r) for r in rows))
    except Exception:
        # Fallback if rows contain unorderables
        rows_sorted = tuple(rows)
    # Columns order is typically stable; if you want to ignore it, you could sort too.
    cols_tuple = tuple(cols)
    return cols_tuple, rows_sorted


def exec_sql(db_path: str, sql: str, timeout=2.0):
    start = time()
    try:
        conn = sqlite3.connect(db_path)

        # Abort long-running queries
        def process_handler():
            if time() - start > timeout:
                raise Exception("SQL timeout")
            return 0

        conn.set_progress_handler(process_handler, 1000)
        conn.execute("PRAGMA query_only = ON;")  # read-only safety
        cur = conn.execute(sql)
        cols = [d[0] for d in cur.description] if cur.description else []
        rows = cur.fetchall()
        conn.close()
        return _normalize_result(cols, rows)
    except Exception:
        return None, None


def make_compute_metrics(tokenizer, eval_dataset):
    pad_id = (
        tokenizer.pad_token_id
        if tokenizer.pad_token_id is not None
        else tokenizer.eos_token_id
    )

    def _to_token_ids(preds):
        # preds is either (ids) or (ids, ...) or logits
        if isinstance(preds, tuple):
            preds = preds[0]
        arr = np.asarray(preds)
        if arr.ndim == 3:  # logits: (bs, seq, vocab)
            arr = arr.argmax(axis=-1)
        return arr

    def compute_metrics(p):
        pred_ids = _to_token_ids(p.predictions)
        label_ids = np.asarray(p.label_ids)

        # Replace -100 with pad for decoding
        pred_ids = np.where(pred_ids == -100, pad_id, pred_ids)
        label_ids = np.where(label_ids == -100, pad_id, label_ids)

        pred_sqls = [
            clean_sql_query(s)
            for s in tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
        ]
        label_sqls = [
            clean_sql_query(s)
            for s in tokenizer.batch_decode(label_ids, skip_special_tokens=True)
        ]

        exact, valid, exec_ok = [], [], []
        json_lines = []

        # iterate aligned with eval_dataset (no shuffle in eval)
        for i, (p_sql, y_sql, item) in enumerate(
            zip(pred_sqls, label_sqls, eval_dataset)
        ):
            db_path = db_resolver(item["db_id"])

            # exact match (string)
            is_exact = int(p_sql == y_sql)
            exact.append(is_exact)

            # execution
            if p_sql == "":
                p_cols = p_rows = None
            else:
                p_cols, p_rows = exec_sql(db_path, p_sql)
            y_cols, y_rows = exec_sql(db_path, y_sql)

            is_valid = int(p_cols is not None and p_rows is not None)
            valid.append(is_valid)

            is_exec_ok = int(
                p_cols is not None
                and y_cols is not None
                and p_cols == y_cols
                and p_rows == y_rows
            )
            exec_ok.append(is_exec_ok)

            json_lines.append(
                {
                    "db_path": db_path,
                    "db_id": item.get("db_id"),
                    "prediction": p_sql,
                    "target": y_sql,
                    "prediction_valid": is_valid,
                    "exact_match": is_exact,
                    "exec_match": is_exec_ok,
                }
            )

        # Write one JSONL block per evaluation (append)
        with open("./eval_Results.jsonl", "a", encoding="utf-8") as f:
            for line in json_lines:
                f.write(json.dumps(line, ensure_ascii=False) + "\n")

        return {
            "exact_match": float(np.mean(exact)) if exact else 0.0,
            "valid_sql": float(np.mean(valid)) if valid else 0.0,
            "exec_acc": float(np.mean(exec_ok)) if exec_ok else 0.0,
        }

    return compute_metrics
