"""Save/load (JSON)."""
import json, os
SAVE_PATH = os.path.join(os.path.dirname(__file__), "..", "save.json")

def save_game(state: dict, path=SAVE_PATH):
    with open(path, "w") as f:
        json.dump(state, f, indent=2)
    return path

def load_game(path=SAVE_PATH):
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)
