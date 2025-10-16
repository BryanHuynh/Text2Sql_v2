import os
import re

import torch
from transformers import AutoConfig, AutoModelForSeq2SeqLM, AutoTokenizer, GenerationConfig

from config import Config


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


def get_latest_model_and_tokenizer():
    config = Config()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch.cuda.empty_cache()
    if device == "cuda":
        torch.backends.cudnn.benchmark = True

    models_dir = config.model_save_location
    last_stage_idx, ckpt = latest_model_stage(models_dir)
    pretrained_model = ckpt if ckpt else config.pretrained_source_model

    tokenizer = AutoTokenizer.from_pretrained(pretrained_model)
    cfg = AutoConfig.from_pretrained(pretrained_model)
    gen_config = GenerationConfig.from_pretrained(pretrained_model)
    gen_config.num_beams = 6
    gen_config.length_penalty = 0.0
    gen_config.no_repeat_ngram_size = 3
    model = AutoModelForSeq2SeqLM.from_pretrained(pretrained_model, config=cfg).to(
        device
    )
    model.resize_token_embeddings(len(tokenizer))
    model.generation_config = gen_config
    return tokenizer, model, last_stage_idx, device
