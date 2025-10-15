import yaml
import os

class Config:
    _instance = None  # class-level cache

    def __new__(cls):
        if cls._instance is None:
            inst = super(Config, cls).__new__(cls)
            cls._instance = inst
            # Load default config from this module's directory
            default_path = "config.yml"
            inst._load_yaml(default_path)
        return cls._instance

    def _load_yaml(self, path: str):
        """Load entire YAML once to preserve native types (floats, ints, bools)."""
        if not os.path.isfile(path):
            raise FileNotFoundError(f"Config file not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        if not isinstance(data, dict):
            raise TypeError("Top-level YAML must be a mapping of keys to values")
        for k, v in data.items():
            # Normalize keys: strip whitespace
            if isinstance(k, str):
                k = k.strip()
            self.update(k, v)

    def update(self, key, value):
        setattr(self, key, value)
        return self

    def __getattr__(self, name):
        raise TypeError(f"unable to find property: {name}")

    def get(self, name, default):
        try:
            return getattr(self, name)
        except Exception:
            return default

    @classmethod
    def from_yaml(cls, path: str):
        """Explicitly (re)load YAML from a provided path into the singleton."""
        inst = cls()
        inst._load_yaml(path)
        return inst
