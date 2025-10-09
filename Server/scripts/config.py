import yaml


class Config:
    _instance = None  # class-level cache

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Config, cls).__new__(cls)
            cls.from_yaml("config.yml")
        return cls._instance
    
    def update(self, key, value):
        setattr(self, key, value)
        return self
    
    def __getattr__(self, name):
        raise TypeError(f"unable to find property: {name}")
    
    def get(self, name, default):
        try:
            return getattr(self, name)
        except:
            return default

    @classmethod
    def from_yaml(cls, path: str):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line == '\n' or line == "" or ":" not in line:
                    continue
                try:
                    data = list(yaml.safe_load(line).items())[0]
                    if(" " in data[0]):
                        continue
                    cls().update(data[0], data[1])
                except:
                    continue
        
                