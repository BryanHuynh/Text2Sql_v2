from pathlib import Path
import threading
import time, queue
from trainer.Model_Handler import Model_Handler
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, DirCreatedEvent, FileCreatedEvent

BASE = Path(__file__).resolve().parents[1]

QUEUE_DIR = BASE / "queue" / "requests"


class Monitor:
    def __init__(self, model_handler: Model_Handler | None):
        self.mh = model_handler
        self.observer = Observer()
        self._q = queue.Queue()

    def start(self):
        print(f"watching directory: {QUEUE_DIR}")
        self.observer.schedule(Handler(), str(QUEUE_DIR), recursive=False)
        self.observer.start()
        try:
            while True:
                time.sleep(1)
        finally:
            self.observer.stop()
            self.observer.join()

    def _mv_to_processing(path: Path):
        pass

    def _mv_to_archieve(path: Path):
        pass


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
        print(f"processing {src}")

    def _queue(self, path: Path):
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


if __name__ == "__main__":
    monitor = Monitor(None)
    monitor.start()
