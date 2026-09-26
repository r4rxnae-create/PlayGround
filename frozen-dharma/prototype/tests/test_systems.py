"""Systems verification (headless, no display)."""
from game.combat import Fighter, try_parry, try_dodge, light_attack_damage, combo_step
from game.resonance import Dharma, fuse, weather_fire_mult, ResonanceState
from game.bosses import boss_phase, BOSS_REGISTRY, Boss
from game.world import region_for_level, REGIONS
from game.quests import STARTER_QUESTS
from game.enemies import Enemy
from game.dungeons import TEN_BEATS
from game.weather import WeatherSystem
from game.character import Player
from game.game import Session
from game.config import GRAPHICS_PRESETS

def test_level_map_continuous():
    for n in [1, 50, 51, 100, 101, 200, 300, 1000]:
        rid, name = region_for_level(n)
        assert rid >= 1
    # no gaps
    prev_hi = 0
    for _, _, lo, hi in REGIONS:
        assert lo == prev_hi + 1
        prev_hi = hi
    assert prev_hi == 1000

def test_parry_dodge_windows():
    assert try_parry(0.1, 0.0) == "parry"
    assert try_parry(0.5, 0.0) == "whiff"
    f = Fighter(name="t", hp=100, max_hp=100)
    assert try_dodge(f, 0.05, 0.0) == "perfect"
    assert try_dodge(f, 5.0, 0.0) == "normal"

def test_fusions():
    name, dmg, _ = fuse(Dharma.VAYU, Dharma.AGNI)
    assert name == "Firestorm Vortex" and dmg == 70
    name, dmg, _ = fuse(Dharma.VARUNA, Dharma.AKASHA)
    assert name == "Tempest Snare"
    assert weather_fire_mult("rain") == 0.5

def test_boss_phases():
    assert boss_phase("frostbound_guardian", 0.9) == 1
    assert boss_phase("frostbound_guardian", 0.5) == 2
    assert boss_phase("frostbound_guardian", 0.1) == 3
    assert len(BOSS_REGISTRY) >= 50

def test_combat_kill_and_xp():
    s = Session(level=1)
    s.enemies = [Enemy.spawn("husk", 1)]
    s.enemies[0].hp = 1
    s.step(1/60, {"attack": True})
    assert s.kills >= 1

def test_quests_dungeons_weather_graphics():
    assert len(STARTER_QUESTS) >= 6
    assert TEN_BEATS[0] == "entrance" and TEN_BEATS[-1] == "reward"
    w = WeatherSystem(region_id=1)
    assert w.visibility() <= 1.0
    assert set(GRAPHICS_PRESETS) == {"LOW", "MEDIUM", "HIGH", "ULTRA", "CINEMATIC"}
    p = Player(name="t", hp=50, max_hp=50)
    assert p.xp_next() > 0

def test_session_smoke():
    s = Session(level=1)
    for i in range(60):
        s.step(1/60, {"attack": i % 5 == 0, "boss_hit": True})
    assert s.boss.hp < s.boss.max_hp
