"""Timing-based third-person combat core (rendering-independent)."""
from dataclasses import dataclass, field
from .config import WEAPONS

PARRY_WINDOW = 0.18
PERFECT_DODGE_WINDOW = 0.12
IFRAMES = 0.25

@dataclass
class Fighter:
    name: str
    hp: float
    max_hp: float
    stamina: float = 100.0
    max_stamina: float = 100.0
    poise: float = 100.0
    max_poise: float = 100.0
    weapon: str = "sword"
    alive: bool = True
    blocking: bool = False
    last_hit_t: float = -999.0

    def weapon_stat(self, k):
        return WEAPONS[self.weapon][k]

    def spend_stamina(self, amt) -> bool:
        if self.stamina < amt:
            return False
        self.stamina -= amt
        return True

    def regen(self, dt, in_combat=True):
        rate = 14.0 if not self.blocking else 6.0
        self.stamina = min(self.max_stamina, self.stamina + rate * dt)
        if self.poise < self.max_poise:
            self.poise = min(self.max_poise, self.poise + 8.0 * dt)

    def take_hit(self, dmg, poise_dmg, t_now, blocked=False, parried=False):
        if parried:
            return {"dmg": 0, "parried": True}
        if blocked:
            dmg *= 0.25
            poise_dmg *= 1.2
        self.hp -= dmg
        self.poise -= poise_dmg
        self.last_hit_t = t_now
        broken = self.poise <= 0
        if broken:
            self.poise = self.max_poise * 0.4  # recover into punish window
        if self.hp <= 0:
            self.hp = 0
            self.alive = False
        return {"dmg": dmg, "poise_broken": broken, "killed": not self.alive}

def light_attack_damage(fig: Fighter, charge=0.0, aerial=False) -> tuple:
    w = WEAPONS[fig.weapon]
    mult = 1.0 + charge * 0.8 + (0.25 if aerial else 0.0)
    return (w["dmg"] * mult, w["poise_dmg"] * mult)

def heavy_attack_damage(fig: Fighter) -> tuple:
    w = WEAPONS[fig.weapon]
    return (w["dmg"] * 1.8, w["poise_dmg"] * 2.0)

def try_dodge(fig: Fighter, incoming_t: float, t_now: float) -> str:
    """Returns 'perfect' | 'normal' | 'fail' based on timing + stamina."""
    if not fig.spend_stamina(20):
        return "fail"
    dt = incoming_t - t_now
    if 0 <= dt <= PERFECT_DODGE_WINDOW:
        return "perfect"
    return "normal"

def try_parry(t_attack: float, t_now: float) -> str:
    dt = t_attack - t_now
    if 0 <= dt <= PARRY_WINDOW:
        return "parry"
    return "whiff"

def combo_step(hits_landed: int) -> float:
    """Combo scaling rewards sustained offense without infinite scaling."""
    return 1.0 + min(hits_landed, 8) * 0.06
