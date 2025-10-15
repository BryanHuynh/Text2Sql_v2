from typing import Dict

from config import Config
from utils.type_mapping import typeMapping


def create_schema(
    schema_json: Dict[str, any],
    db_path=None,
    question: str = "",
):
    column_names = schema_json["column_names_original"]
    column_types = schema_json["column_types"]
    table_names = schema_json["table_names_original"]
    primary_keys = set(schema_json["primary_keys"])
    foreign_keys = schema_json["foreign_keys"]
    db_id = schema_json["db_id"]
    cfg = Config()
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
            contents = [f"{typeMapping(column_types[column_idx])}"]

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

        table_chunks.append(f"{table_name} {' '.join(column_chunks)}")

    if not table_chunks:
        return db_id

    return " \n ".join(table_chunks)


def format_source(question, db_name, schema):
    return f"{question} | {db_name} | {schema} "