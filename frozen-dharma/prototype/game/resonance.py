"""Dharma Resonance: 6 attunements + fusion table + weather modifiers."""
from enum import Enum

class Dharma(str, Enum):
    AGNI = "Agni"        # fire
    VAYU = "Vayu"        # wind / mobility
    VARUNA = "Varuna"    # water
    PRITHVI = "Prithvi"  # earth / defense
    AKASHA = "Akasha"    # cosmic / lightning-ish spark
    KALA = "Kala"        # time

BASE_POWER = {
    Dharma.AGNI:    {"dmg": 30, "dot": 6,  "cc": None,       "desc": "fire burst + burn"},
    Dharma.VAYU:    {"dmg": 16, "dot": 0,  "cc": "group",    "desc": "gale pull + mobility"},
    Dharma.VARUNA:  {"dmg": 20, "dot": 0,  "cc": "slow",     "desc": "tide slam + slow"},
    Dharma.PRITHVI: {"dmg": 24, "dot": 0,  "cc": "shield",   "desc": "stone guard + slam"},
    Dharma.AKASHA:  {"dmg": 34, "dot": 0,  "cc": "stun",     "desc": "starfall beam"},
    Dharma.KALA:    {"dmg": 8,  "dot": 0,  "cc": "slowfield","desc": "time dilation field"},
}

# Order-independent fusions: frozenset({a,b}) -> (name, dmg, effect)
FUSIONS = {
    frozenset({Dharma.VAYU, Dharma.AGNI}): ("Firestorm Vortex", 70, "large AoE + spreading burn"),
    frozenset({Dharma.VARUNA, Dharma.AKASHA}): ("Tempest Snare", 62, "chain lightning in wet area"),
    frozenset({Dharma.PRITHVI, Dharma.AGNI}): ("Volcanic Strike", 75, "magma pillars + heavy poise dmg"),
    frozenset({Dharma.VARUNA, Dharma.VAYU}): ("Frostbind Gale", 55, "freeze in snow zones, heavy slow otherwise"),
    frozenset({Dharma.PRITHVI, Dharma.VARUNA}): ("Quake Mire", 50, "knockdown + slow field"),
    frozenset({Dharma.AKASHA, Dharma.VAYU}): ("Comet Shear", 68, "piercing beam + pull"),
}

def fuse(a: Dharma, b: Dharma):
    if a == b:
        base = BASE_POWER[a]
        return (f"{a.value} Surge", int(base["dmg"] * 1.4), base["desc"] + " (empowered)")
    return FUSIONS.get(frozenset({a, b}), ("Resonant Burst", 40, "generic fusion"))

def weather_fire_mult(weather: str) -> float:
    return {"rain": 0.5, "storm": 0.5, "snow": 0.8, "fog": 0.9}.get(weather, 1.0)

def weather_conductivity(weather: str) -> float:
    return 1.5 if weather in ("rain", "storm") else 1.0

class ResonanceState:
    def __init__(self):
        self.unlocked = {Dharma.AGNI, Dharma.VAYU}
        self.meter = 0.0  # 0..100; perfect actions build it
    def unlock(self, d: Dharma):
        self.unlocked.add(d)
    def gain(self, amt: float):
        self.meter = min(100.0, self.meter + amt)
    def can_ultimate(self) -> bool:
        return self.meter >= 100.0
    def spend_ultimate(self) -> bool:
        if self.can_ultimate():
            self.meter = 0.0
            return True
        return False
