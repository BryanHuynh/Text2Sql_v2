import datetime
from itertools import chain
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
import re


def main():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(torch.cuda.get_device_name(0))
    print("bf16 support:", torch.cuda.is_bf16_supported())

    config = yaml.safe_load(open("config.yml"))

    print(device)
    torch.cuda.empty_cache()
    if device == "cuda":
        torch.backends.cudnn.benchmark = True

    training_args = Seq2SeqTrainingArguments(
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

    def latest_model_stage(models_dir: str):
        if not os.path.isdir(models_dir):
            return (None, None)

        best = (None, None)
        for name in os.listdir(models_dir):
            m = re.match(r"^(.*?)-Stage_(\d+)$", name)
            if not m:
                continue
            stage_num = int(m.group(2))
            path = os.path.join(models_dir, name)
            if best[0] is None or stage_num > best[0]:
                best = (stage_num, path)
        return best

    loaded_datasets = load_datasets()
    num_stages = len(loaded_datasets["datasets"]["training"])
    models_dir = config.get("model_save_location", "./models/")
    last_stage_idx, ckpt = latest_model_stage(models_dir)
    start_stage = (last_stage_idx + 1) if last_stage_idx is not None else 0

    if start_stage >= num_stages:
        print("[INFO] All stages already completed.")
        raise SystemExit(0)

    tokenizer = AutoTokenizer.from_pretrained(
        ckpt if ckpt else config.get("pretrained_source_model")
    )
    cfg = AutoConfig.from_pretrained(
        ckpt if ckpt else config.get("pretrained_source_model")
    )
    model = AutoModelForSeq2SeqLM.from_pretrained(
        ckpt if ckpt else config.get("pretrained_source_model"), config=cfg
    ).to(device)

    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer, model=model, label_pad_token_id=-100
    )

    for stage_index in range(start_stage, num_stages):
        print(f"[TRAINING ON STAGE {stage_index}]")

        trainingEncoder = Resolve_Encoder(
            loaded_datasets["tables"]["training"], tokenizer
        )
        testingEncoder = Resolve_Encoder(
            loaded_datasets["tables"]["testing"], tokenizer
        )
        trainingData = trainingEncoder(
            loaded_datasets["datasets"]["training"][stage_index]
        )

        total_steps = (
            ceil(
                len(trainingData)
                / (
                    training_args.train_batch_size
                    * training_args.gradient_accumulation_steps
                )
            )
            * training_args.num_train_epochs
        )
        print(total_steps, ceil(total_steps / 5))

        training_args.eval_steps = ceil(total_steps / 5)
        training_args.save_steps = ceil(total_steps / 5)
        training_args.logging_steps = ceil(total_steps / 5)

        eval_slices = list(
            chain.from_iterable(
                loaded_datasets["datasets"]["validation"][: stage_index + 1]
            )
        )
        evaluationData = trainingEncoder(eval_slices)

        test_slices = list(
            chain.from_iterable(
                loaded_datasets["datasets"]["testing"][: stage_index + 1]
            )
        )
        testingData = testingEncoder(test_slices)

        trainer = Seq2SeqTrainer(
            model=model,
            args=training_args,
            train_dataset=trainingData,
            eval_dataset=evaluationData,
            data_collator=data_collator,
            tokenizer=tokenizer,
            compute_metrics=make_compute_metrics(
                tokenizer,
                evaluationData,
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

        save_dir = os.path.join(
            config.get("model_save_location", "./models/"), f"model-Stage_{stage_index}"
        )
        model.save_pretrained(save_dir)
        tokenizer.save_pretrained(save_dir)


if __name__ == "__main__":
    main()
