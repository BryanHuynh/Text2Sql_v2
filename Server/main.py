import json
import os
from pathlib import Path
import time
from typing import Dict
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

BASE = Path(__file__).resolve().parent

QUEUE = BASE / "queue" / "requests"
PROCESSING = BASE / "queue" / "processing"
ARCHIVE = BASE / "queue" / "archive"

QUEUE_SUFFIX = "req"
PROCESSING_SUFFIX = "proc"
ARCHIVE_SUFFIX = "done"


QUEUE.mkdir(parents=True, exist_ok=True)
PROCESSING.mkdir(parents=True, exist_ok=True)
ARCHIVE.mkdir(parents=True, exist_ok=True)


app = FastAPI()


class Queue_Request(BaseModel):
    id: str
    question: str
    db_id: str
    schema: Dict
    callback_url: HttpUrl | None = None


def job_path(job_id: str, path: str, suffix: str):
    f = path / f"{job_id}.{suffix}"
    return f


def is_job_in_queue(job_id: str, directory: str, suffix: str):
    content = os.listdir(directory)
    if f"{job_id}.{suffix}" in content:
        return True
    else:
        return False


def write_job(job_id: str, payload: Dict):
    if is_job_in_queue(job_id, ARCHIVE, ARCHIVE_SUFFIX):
        return {"ok": True, "status": "complete", "msg": f"job {job_id} Done"}
    elif is_job_in_queue(job_id, PROCESSING, PROCESSING_SUFFIX):
        return {
            "ok": True,
            "status": "processing",
            "msg": f"job {job_id} is processing",
        }
    elif is_job_in_queue(job_id, QUEUE, QUEUE_SUFFIX):
        return {"ok": True, "status": "queued", "msg": f"job {job_id} is queued"}
    else:
        f = job_path(job_id, QUEUE, QUEUE_SUFFIX)
        tmp = f.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload, indent=4) + "\n", encoding="utf-8")
        tmp.replace(f)
        return {"ok": True, "status": "queued", "msg": f"job {job_id} is queued"}


@app.post("/queue")
async def create_request(req: Queue_Request):
    return write_job(
        req.id,
        {
            "input": {
                "question": req.question,
                "schema": req.schema,
                "db_id": req.db_id,
            },
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "callback_url": str(req.callback_url) if req.callback_url else None,
        },
    )
    

