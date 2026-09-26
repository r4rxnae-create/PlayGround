"""Quest graph: main/side/mythic/exploration/companion/world-event. No fetch-10 filler."""
from dataclasses import dataclass, field

@dataclass
class Quest:
    qid: str
    kind: str  # main/side/mythic/exploration/companion/event
    name: str
    stages: list
    stage: int = 0
    done: bool = False
    def advance(self):
        if not self.done:
            self.stage += 1
            if self.stage >= len(self.stages):
                self.done = True
        return self.done
    @property
    def current(self):
        return None if self.done else self.stages[self.stage]

STARTER_QUESTS = [
    Quest("m1_awaken", "main", "Ember in the Ice",
          ["Wake in Thawline", "Cross the Shattered Bridge", "Cleanse the Hollowpine shrine", "Enter the Temple of the Still Flame", "Slay the Frostbound Guardian"]),
    Quest("s1_bells", "side", "The Silent Bells",
          ["Find the bell-keeper's daughter", "Ring the three thaw-bells", "Defend Thawline from husks"]),
    Quest("my1_dream", "mythic", "Dream of the Sealed Sun",
          ["Sleep at the Hollowpine shrine", "Survive the dream-echo", "Claim Vayu spark"]),
    Quest("e1_falls", "exploration", "Vault Beneath the Falls",
          ["Find the frozen falls vault", "Solve the melt-freeze puzzle", "Claim Frostweave"]),
    Quest("c1_keeper", "companion", "Keeper's Oath",
          ["Earn keeper's trust (rep 3)", "Aid the bridge repair", "Stand vigil at nightfall"]),
    Quest("ev1_storm", "event", "Frozen-Time Anomaly",
          ["Reach the anomaly", "Shatter 3 still-crystals before the wave hits"]),
]
