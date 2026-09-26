"""Boss registry (54 majors) + phase logic. Twin of UE AFDBossBase tables."""
from dataclasses import dataclass

# (id, region, phases, weakness, reward) — full 54 in WORLD_BIBLE; representative data table here
BOSS_REGISTRY = [
    ("frostbound_guardian", 1, 3, "fire+parry slam", "Ember Seal + Agni spark"),
    ("husk_matriarch", 1, 2, "aoe", "Frostweave"),
    ("stillflame_abbot", 1, 2, "water-steam stun", "Temple Key"),
    ("abyssal_maharaja", 2, 3, "lightning in water", "Varuna attunement"),
    ("drowned_librarian", 2, 2, "fire in air pockets", "Tide Bow"),
    ("sunken_colossus", 2, 3, "eye cores", "Palace Plate"),
    ("forest_deity", 3, 4, "burn blossoms", "Vayu attunement"),
    ("thorn_regent", 3, 2, "fire", "Thornmail"),
    ("mothmother", 3, 3, "wind", "Lumen Wings"),
    ("isle_warden", 3, 2, "lightning", "Isle Key"),
    ("ashen_emperor", 4, 4, "water+earth", "Prithvi ember"),
    ("siege_golem", 4, 2, "climb-attack cores", "Siege Plate"),
    ("cinder_twins", 4, 3, "separate them", "Twin Blades"),
    ("magma_cantor", 4, 2, "silence", "Cantor Bell"),
]
# Programmatically extend to 54 with regional/secret/endgame entries.
for i in range(15, 55):
    BOSS_REGISTRY.append((f"mythic_boss_{i:02d}", (i % 15) + 1, 3, "codex study", f"relic_{i:02d}"))

def boss_phase(boss_id: str, hp_frac: float) -> int:
    phases = next((p for (i, _, p, _, _) in BOSS_REGISTRY if i == boss_id), 3)
    if phases == 2:
        return 1 if hp_frac > 0.5 else 2
    if phases == 3:
        return 1 if hp_frac > 0.66 else (2 if hp_frac > 0.33 else 3)
    if phases == 4:
        if hp_frac > 0.75: return 1
        if hp_frac > 0.5: return 2
        if hp_frac > 0.25: return 3
        return 4
    return 1

FROSTBOUND_SCRIPT = {
    1: {"moves": ["cleave", "ice_shards"], "adds": []},
    2: {"moves": ["cleave", "ice_shards", "frost_nova"], "adds": ["husk", "husk"]},
    3: {"moves": ["cleave", "falling_stalactites(parry-only slam)", "frost_nova"], "adds": ["sentinel"]},
}

@dataclass
class Boss:
    boss_id: str
    hp: float
    max_hp: float
    def phase(self):
        return boss_phase(self.boss_id, self.hp / self.max_hp if self.max_hp else 0)
