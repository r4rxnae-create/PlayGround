"""World: 15 regions, provinces, level map 1..1000 (continuous)."""
REGIONS = [
    (1, "Frozen Valley", 1, 50),
    (2, "Sunken Kingdom", 51, 100),
    (3, "Celestial Forest", 101, 200),
    (4, "Ashen Empire", 201, 300),
    (5, "Desert of Forgotten Gods", 301, 380),
    (6, "City of a Thousand Temples", 381, 460),
    (7, "Underground Kingdom", 461, 540),
    (8, "Ocean of Eternity", 541, 620),
    (9, "Floating Celestial Kingdom", 621, 700),
    (10, "Realm of Shadows", 701, 770),
    (11, "Giant Mountain Sanctuary", 771, 830),
    (12, "Storm Kingdom", 831, 880),
    (13, "Ancient Battlefield", 881, 920),
    (14, "Frozen Heaven", 921, 970),
    (15, "Final Mythic Realm", 971, 1000),
]

REGION_PROVINCES = {
    1: ["Thawline Hamlet", "Shattered Bridge", "Hollowpine Woods", "Sunless Caves", "High Temple Approach"],
}

def region_for_level(level: int):
    assert 1 <= level <= 1000, "level out of range"
    for rid, name, lo, hi in REGIONS:
        if lo <= level <= hi:
            return (rid, name)
    raise AssertionError("unreachable")

def enemy_level_scale(level: int) -> float:
    return 1.0 + (level - 1) * 0.06 + (level // 50) * 0.15
