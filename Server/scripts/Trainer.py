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
        self.cfg = Config()
        self.model = model
        self.tokenizer = tokenizer
        self.training_args = Seq2SeqTrainingArguments(
            output_dir="./results",
            # ---- evaluation & saving ----
            eval_strategy="steps",
            eval_steps=500,
            save_strategy="steps",
            save_steps=1000,
            save_total_limit=3,
            load_best_model_at_end=True,
            metric_for_best_model="eval_valid_sql",
            greater_is_better=True,
            do_eval=True,
            # ---- optimization ----
            learning_rate=2e-4,
            lr_scheduler_type="cosine",
            warmup_ratio=0.03,
            optim="adafactor",
            weight_decay=0.01,
            label_smoothing_factor=0.1,
            # ---- batches / memory ----
            per_device_train_batch_size=4,
            per_device_eval_batch_size=8,
            gradient_accumulation_steps=32,  # effective batch ~128 seqs
            gradient_checkpointing=True,
            # ---- mixed precision ----
            bf16=True,
            # ---- generation for metrics ----
            predict_with_generate=True,
            generation_num_beams=6,
            generation_max_length=256,
            # ---- epochs/steps ----
            num_train_epochs=10,
            # ---- misc ----
            logging_steps=500,
            logging_first_step=True,
            dataloader_num_workers=4,
            seed=42,
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
