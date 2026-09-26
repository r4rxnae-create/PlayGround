"""Dungeons: 10-beat structure, unique identity per region."""
TEN_BEATS = ["entrance", "exploration", "env_puzzle", "combat", "hidden_room",
             "lore", "mini_boss", "major_puzzle", "final_boss", "reward"]

DUNGEON_IDENTITY = {
    1: {"name": "Temple of the Still Flame", "puzzle": "melt-freeze braziers", "boss": "stillflame_abbot"},
    2: {"name": "Drowned Library", "puzzle": "water-level scriptorium", "boss": "drowned_librarian"},
    3: {"name": "Hollow of Masks", "puzzle": "illusion gates", "boss": "thorn_regent"},
    4: {"name": "Siege Deep", "puzzle": "siege-ram routing", "boss": "siege_golem"},
}

def dungeon_run(beats_cleared: int):
    return TEN_BEATS[:beats_cleared]
