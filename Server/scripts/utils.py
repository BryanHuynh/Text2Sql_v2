TYPE_MAP = {
    "number": "num",
    "text": "str",
    "time": "dt",
    "date": "dt",
    "datetime": "dt",
    "boolean": "bool",
    "bool": "bool",
    "integer": "int",
    "real": "num",
}


def typeMapping(type):
    t = type.lower()
    return TYPE_MAP.get(
        t,
        (
            "int"
            if "int" in t
            else (
                "num"
                if any(k in t for k in ["real", "float", "double", "decimal"])
                else "str"
            )
        ),
    )
