from utils import typeMapping
from datasets import Dataset


def Resolve_Encoder(databases, tok):

    def _generate_database_index(databases):
        index_dictionary = {}
        for index, database in enumerate(databases):
            index_dictionary[database["db_id"]] = index
        return index_dictionary

    database_indexes = _generate_database_index(databases)

    def _generate_schema(db_id):
        database = databases[database_indexes[db_id]]
        column_names = database["column_names_original"]
        column_types = database["column_types"]
        table_names = database["table_names_original"]
        primary_keys = set(database["primary_keys"])
        foreign_keys = database["foreign_keys"]
        db_id = database["db_id"]

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

    def _generate_input(entry):
        question = entry["question"]
        target = entry["query"]
        db_id = entry["db_id"]
        schema = _generate_schema(db_id)
        source = f"{question} | {db_id} | {schema}"
        return {
            "db_id": db_id,
            "source": source,
            "target": target,
        }

    def _preprocess_data(examples):
        enc = tok(
            examples["source"],
            text_target=examples["target"],
            truncation=True,
            padding=False,
        )
        return enc

    def encode(dataset):
        parsed_dataset = [_generate_input(dataset[i]) for i in range(len(dataset))]
        print(parsed_dataset[0]["source"])
        parsed_dataset = Dataset.from_list(parsed_dataset)
        encoded_dataset = parsed_dataset.map(
            _preprocess_data, remove_columns=["source", "target"]
        )
        return encoded_dataset

    return encode
