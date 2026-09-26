"""Graphics tiers + game tuning (mirrors UE5 scalability groups)."""
GRAPHICS_PRESETS = {
    "LOW":       {"res_scale": 0.5,  "shadows": 0, "foliage": 0.25, "fx": 0.3,  "reflections": 0, "ao": 0, "volumetric": 0,   "aa": 0, "view_dist": 300},
    "MEDIUM":    {"res_scale": 0.75, "shadows": 1, "foliage": 0.5,  "fx": 0.6,  "reflections": 0, "ao": 1, "volumetric": 0.5, "aa": 1, "view_dist": 600},
    "HIGH":      {"res_scale": 1.0,  "shadows": 2, "foliage": 0.8,  "fx": 0.85, "reflections": 1, "ao": 1, "volumetric": 0.8, "aa": 2, "view_dist": 1000},
    "ULTRA":     {"res_scale": 1.25, "shadows": 3, "foliage": 1.0,  "fx": 1.0,  "reflections": 2, "ao": 2, "volumetric": 1.0, "aa": 3, "view_dist": 1600},
    "CINEMATIC": {"res_scale": 1.5,  "shadows": 3, "foliage": 1.2,  "fx": 1.2,  "reflections": 2, "ao": 2, "volumetric": 1.2, "aa": 3, "view_dist": 2200},
}
BASE_RES = (1280, 720)
WEAPONS = {
    "sword":   {"dmg": 22, "speed": 1.0, "poise_dmg": 18, "stamina": 12},
    "dual":    {"dmg": 14, "speed": 1.6, "poise_dmg": 10, "stamina": 9},
    "spear":   {"dmg": 20, "speed": 1.1, "poise_dmg": 16, "stamina": 11, "range": 1.4},
    "bow":     {"dmg": 18, "speed": 0.9, "poise_dmg": 8,  "stamina": 10, "ranged": True},
    "heavy":   {"dmg": 38, "speed": 0.6, "poise_dmg": 34, "stamina": 25},
    "divine":  {"dmg": 45, "speed": 1.0, "poise_dmg": 30, "stamina": 18},
}
