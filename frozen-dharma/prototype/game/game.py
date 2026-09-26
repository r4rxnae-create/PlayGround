"""Headless game session: movement/camera/combat/quests/boss/weather integration."""
import math, random
from .character import Player
from .enemies import Enemy
from .bosses import Boss, FROSTBOUND_SCRIPT
from .combat import light_attack_damage, heavy_attack_damage, try_dodge, try_parry, combo_step
from .resonance import Dharma, BASE_POWER, fuse, weather_fire_mult, weather_conductivity, ResonanceState
from .world import region_for_level
from .quests import STARTER_QUESTS
from .weather import WeatherSystem

class Session:
    def __init__(self, level=1, seed=7):
        random.seed(seed)
        self.player = Player(name="Seal-Bearer", hp=120, max_hp=120, weapon="sword", level=level)
        self.resonance = ResonanceState()
        self.weather = WeatherSystem(region_id=region_for_level(level)[0])
        self.pos = [400.0, 300.0]
        self.cam_yaw = 0.0
        self.lock_on = None
        self.enemies = [Enemy.spawn("husk", level), Enemy.spawn("raider", level)]
        self.boss = Boss("frostbound_guardian", hp=900, max_hp=900)
        self.quests = [q for q in STARTER_QUESTS]
        self.hits_landed = 0
        self.kills = 0
        self.t = 0.0

    def step(self, dt, action: dict):
        self.t += dt
        self.weather.update(dt)
        # movement (8-dir)
        sp = 220.0 * (1.6 if action.get("sprint") and self.player.spend_stamina(10 * dt) else 1.0)
        dx = (action.get("mx", 0)) * sp * dt
        dy = (action.get("my", 0)) * sp * dt
        self.pos[0] += dx; self.pos[1] += dy
        self.player.regen(dt)
        for e in self.enemies:
            e.regen(dt)
        # player attacks nearest enemy
        log = []
        if action.get("attack") and self.enemies:
            tgt = min(self.enemies, key=lambda e: abs(e.hp))
            dmg, poise = light_attack_damage(self.player, aerial=action.get("aerial", False))
            dmg *= combo_step(self.hits_landed) * (weather_fire_mult(self.weather.current) if False else 1.0)
            r = tgt.take_hit(dmg, poise, self.t, blocked=False)
            self.hits_landed += 1
            self.resonance.gain(4)
            if not tgt.alive:
                self.kills += 1
                self.player.gain_xp(45)
                self.enemies.remove(tgt)
            log.append(f"hit {tgt.name} {dmg:.1f} {r}")
        if action.get("heavy") and self.enemies:
            tgt = self.enemies[0]
            dmg, poise = heavy_attack_damage(self.player)
            r = tgt.take_hit(dmg, poise, self.t)
            self.resonance.gain(7)
            log.append(f"heavy {dmg:.1f} {r}")
        if action.get("dharma"):
            d = action["dharma"]
            if isinstance(d, str):
                d = Dharma(d)
            if d in self.resonance.unlocked:
                base = BASE_POWER[d]
                mult = weather_fire_mult(self.weather.current) if d == Dharma.AGNI else 1.0
                mult *= weather_conductivity(self.weather.current) if d == Dharma.AKASHA else 1.0
                dmg = base["dmg"] * mult
                for e in list(self.enemies):
                    e.take_hit(dmg, 20, self.t)
                    if not e.alive:
                        self.kills += 1
                        self.enemies.remove(e)
                self.resonance.gain(6)
                log.append(f"dharma {d.value} {dmg:.1f}x{mult:.2f} {self.weather.current}")
        if action.get("fusion") and self.enemies:
            a, b = action["fusion"]
            name, dmg, fx = fuse(Dharma(a), Dharma(b))
            tgt = self.enemies[0]
            r = tgt.take_hit(dmg, 40, self.t)
            log.append(f"fusion {name} {dmg} {fx} {r}")
        # boss chip
        if action.get("boss_hit"):
            ph = self.boss.phase()
            script = FROSTBOUND_SCRIPT[ph]
            dmg = 30 * combo_step(self.hits_landed)
            self.boss.hp = max(0, self.boss.hp - dmg)
            log.append(f"boss p{ph} {script['moves']} -{dmg:.1f} hp={self.boss.hp:.0f}")
        return log
