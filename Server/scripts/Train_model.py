import datetime
import os
from matplotlib.pylab import ceil
import numpy as np
from transformers import (
    AutoConfig,
    AutoTokenizer,
    EarlyStoppingCallback,
    T5Model,
)
from transformers import (
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq,
    AutoModelForSeq2SeqLM,
)
import torch.nn.functional as F
from torch.utils.data import DataLoader
from datasets import Dataset, DatasetDict
import torch
import yaml
from datasets import load_dataset
import matplotlib.pyplot as plt
from compute_metrics import make_compute_metrics
from load_datasets import load_datasets
from encoder import Resolve_Encoder


def main():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    config = yaml.safe_load(open("config.yml"))

    print(device)
    torch.cuda.empty_cache()
    if device == "cuda":
        torch.backends.cudnn.benchmark = True

    auto_config = AutoConfig.from_pretrained(config["pretrained_source_model"])
    tokenizer = AutoTokenizer.from_pretrained(config["pretrained_source_model"])
    model = AutoModelForSeq2SeqLM.from_pretrained(
        config["pretrained_source_model"], config=auto_config
    )

    loaded_datasets = load_datasets()
    trainingEncoder = Resolve_Encoder(loaded_datasets["tables"]["training"], tokenizer)
    testingEncoder = Resolve_Encoder(loaded_datasets["tables"]["testing"], tokenizer)

    trainingData = trainingEncoder(loaded_datasets["datasets"]["training"])
    evaluationData = trainingEncoder(loaded_datasets["datasets"]["validation"])
    testingData = testingEncoder(loaded_datasets["datasets"]["testing"])

    print(trainingData.column_names)

    model.to(device)
    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer, model=model, label_pad_token_id=-100
    )

    training_args = Seq2SeqTrainingArguments(
        output_dir="./results",
        eval_strategy="steps",
        eval_steps=config.get("evaluation_steps", 64),
        logging_steps=config.get("logging_steps", 64),
        learning_rate=config.get("learning_rate", 1e-4),
        per_device_train_batch_size=config.get("batch_size", 8),
        gradient_accumulation_steps=config.get("gradient_accumulation_steps", 1),
        gradient_checkpointing=config.get("gradient_checkpointing", False),
        num_train_epochs=config.get("num_train_epochs", 3072),
        lr_scheduler_type="constant",
        save_strategy="steps",
        save_steps=8,
        seed=42,
        data_seed=42,
        per_device_eval_batch_size=4,
        save_total_limit=2,
        predict_with_generate=True,
        warmup_steps=config.get("warmup_steps", 0),
        adafactor=True,
        weight_decay=0.01,
        adam_epsilon=1e-6,
        generation_num_beams=6,
        greater_is_better=True,
        load_best_model_at_end=True,
        metric_for_best_model="valid_sql",
        optim="adafactor",
        label_names=["labels"],
        do_eval=True,
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=trainingData,
        eval_dataset=evaluationData,
        data_collator=data_collator,
        tokenizer=tokenizer,
        compute_metrics=make_compute_metrics(tokenizer, evaluationData),
        callbacks=[
            EarlyStoppingCallback(
                early_stopping_patience=5,
                early_stopping_threshold=0.0,
            )
        ],
    )

    trainer.train()

    test_output = trainer.evaluate(testingData)
    print(test_output)

    # Save the model
    model.save_pretrained(config["model_save_location"])
    tokenizer.save_pretrained(config["model_save_location"])


if __name__ == "__main__":
    main()
