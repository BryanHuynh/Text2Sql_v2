import json
import yaml


config = yaml.safe_load(open("config.yml"))


def load_data(filepath):
    with open(filepath) as json_file:
        return json.load(json_file)


def load_datasets():
    training_dataset = load_data(config["spider_training_dataset"])
    training_tables = load_data(config["spider_training_tables_dataset"])
    validation_dataset = load_data(config["spider_validation_dataset"])

    testing_dataset = load_data(config["spider_test_dataset"])
    testing_tables = load_data(config["spider_test_tables_dataset"])
    return {
        "datasets": {
            "training": training_dataset,
            "validation": validation_dataset,
            "testing": testing_dataset,
        },
        "tables": {"training": training_tables, "testing": testing_tables},
    }
