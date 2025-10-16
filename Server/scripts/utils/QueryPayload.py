from .schema_format import create_schema


class QueryPayload:
    def __init__(self, question, database_name, schema_json):
        self.question = question
        self.database_name = database_name
        self.formatted_schema = create_schema(schema_json)

