"""Enemy archetypes + utility-ish FSM (flank/dodge/block/retreat/call)."""
from dataclasses import dataclass, field
from .combat import Fighter

ARCHETYPES = {
    "husk":      {"hp": 50,  "dmg": 10, "role": "swarmer",  "weak": "fire"},
    "raider":    {"hp": 90,  "dmg": 14, "role": "flanker",  "weak": "parry"},
    "warden":    {"hp": 160, "dmg": 20, "role": "tank",     "weak": "heavy"},
    "cantor":    {"hp": 70,  "dmg": 12, "role": "ranged",   "weak": "rush"},
    "sentinel":  {"hp": 120, "dmg": 16, "role": "guard",    "weak": "aerial"},
}

@dataclass
class Enemy(Fighter):
    archetype: str = "husk"
    state: str = "idle"  # idle/approach/flank/attack/dodge/block/retreat/call/cooldown/stagger
    allies_called: bool = False

    @classmethod
    def spawn(cls, archetype: str, level: int, name=""):
        base = ARCHETYPES[archetype]
        scale = 1.0 + (level - 1) * 0.06 + (level // 50) * 0.15
        return cls(name=name or archetype.title(), archetype=archetype,
                   hp=base["hp"] * scale, max_hp=base["hp"] * scale,
                   poise=60 + level, max_poise=60 + level)

    def decide(self, player_hp_frac: float, own_hp_frac: float, allies: int, weather: str) -> str:
        role = ARCHETYPES[self.archetype]["role"]
        if own_hp_frac < 0.25 and role != "tank":
            return "retreat"
        if allies < 2 and not self.allies_called and own_hp_frac < 0.6:
            self.allies_called = True
            return "call"
        if role == "flanker":
            return "flank"
        if role == "ranged":
            return "attack"  # keeps distance (handled by positioning)
        if role == "guard" and player_hp_frac > 0.5:
            return "block"
        if weather == "fog" and role == "swarmer":
            return "flank"
        return "attack"
