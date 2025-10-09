import gc
from itertools import chain
import os

import torch
from encoder import Resolve_Encoder
from Trainer import Trainer
from utils import delete_metric_results, format_source, get_latest_model_and_tokenizer


class Model_Handler:
    def __init__(self, config):
        self.config = config

    def _load_model_and_tokenizer(self):
        self.tokenizer, self.model, self.last_stage_idx, self.device = (
            get_latest_model_and_tokenizer(self.config)
        )

    def train(self, datasets):
        num_stages = len(datasets["datasets"]["training"])

        self._load_model_and_tokenizer()
        start_stage = (
            (self.last_stage_idx + 1) if self.last_stage_idx is not None else 0
        )

        if start_stage >= num_stages:
            print("[INFO] All stages already completed.")
            raise SystemExit(0)

        delete_metric_results(self.config.get("compute_results_dir"), start=start_stage)

        training_encoder = Resolve_Encoder(
            datasets["databases"]["training"], self.tokenizer, self.device
        )
        for stage_index in range(start_stage, num_stages):
            self._load_model_and_tokenizer()
            print(f"[TRAINING ON STAGE {stage_index}]")

            training_data = training_encoder(
                datasets["datasets"]["training"][stage_index]
            )

            eval_slices = list(
                chain.from_iterable(
                    datasets["datasets"]["validation"][: stage_index + 1]
                )
            )
            evaluation_data = training_encoder(eval_slices)

            trainer = Trainer(self.model, self.tokenizer, self.config)
            self.model, self.tokenizer = trainer.train(
                training_data, evaluation_data, stage_index
            )
            save_dir = os.path.join(
                self.config.get("model_save_location", "models/"),
                f"model-Stage_{stage_index}",
            )
            self.model.save_pretrained(save_dir)
            self.tokenizer.save_pretrained(save_dir)

            del trainer
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

            self.model.to(self.device)

    def test_individual_dataset(self, dataset, encoder, is_training_database=True):
        stage_results = []
        num_stages = len(dataset)
        for stage_index in range(num_stages):
            data_slices = list(chain.from_iterable(dataset[: stage_index + 1]))
            encoded_data = encoder(data_slices)
            trainer = Trainer(self.model, self.tokenizer, self.config)
            stage_results.append(
                trainer.evaluate(encoded_data, stage_index, is_training_database)
            )
        return stage_results

    def test(self, datasets):
        self._load_model_and_tokenizer()
        validation_encoder = Resolve_Encoder(
            datasets["databases"]["training"], self.tokenizer, self.device
        )
        testing_encoder = Resolve_Encoder(
            datasets["databases"]["testing"], self.tokenizer, self.device
        )
        evaluation_stage_results = self.test_individual_dataset(
            datasets["datasets"]["validation"], validation_encoder
        )
        test_stage_results = self.test_individual_dataset(
            datasets["datasets"]["testing"], testing_encoder, is_training_database=False
        )
        return evaluation_stage_results, test_stage_results

    def query(self, database_name: str, formated_schema: str, question: str):
        self._load_model_and_tokenizer()
        source = format_source(question, database_name, formated_schema)
        input = self.tokenizer(
            source, truncation=True, padding=False, return_tensors="pt"
        )
        output = self.model.generate(**input)
        return self.tokenizer.decode(output[0], skip_special_tokens=True)
