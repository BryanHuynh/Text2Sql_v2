from utils import create_schema, format_source
from datasets import Dataset


def Resolve_Encoder(databases, tok, device, db_path):

    def _generate_database_index(databases):
        index_dictionary = {}
        for index, database in enumerate(databases):
            index_dictionary[database["db_id"]] = index
        return index_dictionary

    database_indexes = _generate_database_index(databases)

    def _generate_schema(db_id: str, question: str):
        database = databases[database_indexes[db_id]]
        return create_schema(database, db_path=db_path, question=question)

    def _generate_input(entry):
        question = entry["question"]
        target = entry["query"]
        db_id = entry["db_id"]
        schema = _generate_schema(db_id, question)
        source = format_source(question, db_id, schema)
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
        ).to(device)
        return enc

    def encode(dataset):
        parsed_dataset = [_generate_input(dataset[i]) for i in range(len(dataset))]
        parsed_dataset = Dataset.from_list(parsed_dataset)
        encoded_dataset = parsed_dataset.map(
            _preprocess_data, remove_columns=["source", "target"]
        )
        return encoded_dataset

    return encode
