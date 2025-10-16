from pathlib import Path
import threading
import time, queue
import shutil
from flask import json
from utils.QueryPayload import QueryPayload
from trainer.Model_Handler import Model_Handler
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, DirCreatedEvent, FileCreatedEvent

BASE = Path(__file__).resolve().parents[1]

QUEUE_DIR = BASE / "queue" / "requests"
PROCESSING_DIR = BASE / "queue" / "processing"
ARCHIVE_DIR = BASE / "queue" / "archive"

QUEUE_SUFFIX = ".req"
PROCESSING_SUFFIX = ".proc"
ARCHIVE_SUFFIX = ".done"


class Monitor:
    def __init__(self, model_handler: Model_Handler):
        self.mh = model_handler
        self.observer = Observer()
        self._q = queue.Queue()
        self.handler = Handler(self._q)
        self._t = Consumer(
            model_handler,
            self._q,
            self.handler,
            name="worker-1",
            daemon=True,
        )

    def start(self):
        print(f"watching directory: {QUEUE_DIR}")
        for p in sorted(QUEUE_DIR.glob("*.req")):
            self.handler.queue(p)

        self.observer.schedule(self.handler, str(QUEUE_DIR), recursive=False)
        self.observer.start()
        self._t.start()
        try:
            while True:
                time.sleep(1)
        finally:
            self.observer.stop()
            self.observer.join()


class Handler(FileSystemEventHandler):
    def __init__(self, q):
        super().__init__()
        self.q = q
        self._enqueued = set()
        self._lock = threading.Lock()

    def on_moved(self, event):
        if event.is_directory or not event.dest_path.endswith(".req"):
            return
        src = Path(event.dest_path)
        self.queue(src)

    def queue(self, path: Path):
        if path.suffix != ".req" or path.is_dir():
            return
        with self._lock:
            ap = path.resolve()
            if ap in self._enqueued:
                return
            self._enqueued.add(ap)
            self.q.put(ap)

    def mark_done(self, path: Path):
        with self._lock:
            self._enqueued.discard(path.resolve())


class Consumer(threading.Thread):
    def __init__(
        self,
        model_handler: Model_Handler,
        queue: queue.Queue,
        handler: Handler,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.model_handler = model_handler
        self.queue = queue
        self.handler = handler
        self.daemon = True
        self._stop_event = threading.Event()

    def _mv_to_directory(self, path: Path, to_directory: Path, suffix: str):
        new_path = Path(to_directory / path.name).with_suffix(suffix)
        file_path = shutil.move(path, new_path)
        return Path(file_path)

    def stop(self):
        self._stop_event.set()

    def stopped(self) -> bool:
        return self._stop_event.is_set()

    def process_file(self, path: Path):
        print(f"processing: {path}")
        path = self._mv_to_directory(path, PROCESSING_DIR, PROCESSING_SUFFIX)
        with open(path, "r") as f:
            data = json.load(f)
            input = data["input"]

        payload: QueryPayload = QueryPayload(
            input["question"], input["db_id"], input["schema"]
        )
        result = self.model_handler.query(
            payload.database_name,
            payload.formatted_schema,
            payload.question,
        )
        data["response"] = result
        with open(path, "w") as f:
            json.dump(data, f, indent=4)
        self._mv_to_directory(path, ARCHIVE_DIR, ARCHIVE_SUFFIX)

    def run(self):
        while not self.stopped():
            try:
                path = self.queue.get(timeout=1.0)
            except queue.Empty:
                continue

            try:
                self.process_file(path)
            finally:
                self.handler.mark_done(path)
                self.queue.task_done()

        print(f"[{self.name}] stopped")

