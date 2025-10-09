from math import ceil
from transformers import (
    DataCollatorForSeq2Seq,
    EarlyStoppingCallback,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
)

from compute_metrics import make_compute_metrics
from config import Config


class Trainer:
    def __init__(
        self,
        model,
        tokenizer,
    ):
        cfg = Config()
        self.model = model
        self.tokenizer = tokenizer
        self.training_args = Seq2SeqTrainingArguments(
            # ---- output / checkpoints ----
            output_dir=cfg.get("checkpoint_dir", "ckpt/"),
            save_total_limit=cfg.get("save_total_limit", 3),
            save_strategy=cfg.get("save_strategy", "steps"),
            eval_strategy=cfg.get("eval_strategy", "steps"),
            load_best_model_at_end=cfg.get("load_best_model_at_end", True),
            metric_for_best_model=cfg.get("metric_for_best_model", "eval_valid_sql"),
            greater_is_better=cfg.get("greater_is_better", True),
            # ---- optimization ----
            learning_rate=cfg.get("learning_rate", 2e-4),
            lr_scheduler_type=cfg.get("lr_scheduler_type", "cosine"),
            warmup_ratio=cfg.get("warmup_ratio", 0.03),
            optim=cfg.get("optimizer", "adafactor"),
            weight_decay=cfg.get("weight_decay", 0.01),
            label_smoothing_factor=cfg.get("label_smoothing_factor", 0.1),
            # ---- batching & memory ----
            per_device_train_batch_size=cfg.get("train_batch_size", 4),
            per_device_eval_batch_size=cfg.get("eval_batch_size", 8),
            gradient_accumulation_steps=cfg.get("gradient_accumulation_steps", 32),
            gradient_checkpointing=cfg.get("gradient_checkpointing", True),
            # ---- mixed precision ----
            bf16=cfg.get("bf16", True),
            fp16=cfg.get("fp16", False), 
            # ---- generation parameters ----
            predict_with_generate=cfg.get("predict_with_generate", True),
            generation_num_beams=cfg.get("generation_num_beams", 6),
            generation_max_length=cfg.get("generation_max_length", 256),
            # ---- training length ----
            num_train_epochs=cfg.get("num_train_epochs", 10),
            # ---- data loading ----
            dataloader_num_workers=cfg.get("dataloader_num_workers", 4),
            # ---- reproducibility ----
            seed=cfg.get("seed", 42),
        )
        self.data_collator = DataCollatorForSeq2Seq(
            tokenizer=tokenizer, model=model, label_pad_token_id=-100
        )

    def train(self, training_data, evaluation_data, stage_index):
        total_steps = (
            ceil(
                len(training_data)
                / (
                    self.training_args.train_batch_size
                    * self.training_args.gradient_accumulation_steps
                )
            )
            * self.training_args.num_train_epochs
        )

        self.training_args.eval_steps = ceil(total_steps / 5)
        self.training_args.save_steps = ceil(total_steps / 5)
        self.training_args.logging_steps = ceil(total_steps / 5)
        trainer = Seq2SeqTrainer(
            model=self.model,
            args=self.training_args,
            train_dataset=training_data,
            eval_dataset=evaluation_data,
            data_collator=self.data_collator,
            tokenizer=self.tokenizer,
            compute_metrics=make_compute_metrics(
                self.tokenizer,
                evaluation_data,
                stage_index,
                get_epoch=lambda: trainer.state.epoch,
            ),
            callbacks=[
                EarlyStoppingCallback(
                    early_stopping_patience=5, early_stopping_threshold=0.0
                )
            ],
        )
        trainer.train()
        return trainer.model, trainer.tokenizer

    def evaluate(self, dataset, stage_index, is_training_database=True):
        trainer = Seq2SeqTrainer(
            model=self.model,
            args=self.training_args,
            eval_dataset=dataset,
            data_collator=self.data_collator,
            tokenizer=self.tokenizer,
            compute_metrics=make_compute_metrics(
                self.tokenizer,
                dataset,
                stage_index,
                get_epoch=lambda: trainer.state.epoch,
                training_database=is_training_database,
            ),
        )
        return trainer.evaluate()
