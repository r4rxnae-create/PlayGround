"""Protagonist: customization + stats + progression."""
from dataclasses import dataclass, field
from .combat import Fighter

@dataclass
class ProtagonistConfig:
    face: str = "traveler"
    skin: str = "umber"
    hair: str = "topknot-black"
    proportions: str = "athletic"
    armor: str = "ash-cloak"
    accessory: str = "ember-sigil"

@dataclass
class Player(Fighter):
    level: int = 1
    xp: int = 0
    skill_points: int = 0
    mastery: dict = field(default_factory=lambda: {"sword": 0, "dual": 0, "spear": 0, "bow": 0, "heavy": 0, "divine": 0})
    custom: ProtagonistConfig = field(default_factory=ProtagonistConfig)
    traversal: str = "ground"  # ground/climb/swim/glide/mount/grapple

    def gain_xp(self, amt: int):
        self.xp += amt
        leveled = False
        while self.xp >= self.xp_next():
            self.xp -= self.xp_next()
            self.level += 1
            self.skill_points += 1
            self.max_hp += 6
            self.hp = self.max_hp
            leveled = True
        return leveled

    def xp_next(self) -> int:
        return 80 + self.level * 40
