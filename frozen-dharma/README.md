# FROZEN DHARMA: THE MYTHIC REAWAKENING

Original premium PC/console third-person action-adventure RPG IP.
Unreal Engine 5 target (Windows PC + PS/Xbox-class). This repo contains:

1. **Full design + world bible** (`docs/`) — the complete game on paper.
2. **UE5 production blueprint** (`ue5/`) — `.uproject`, configs, C++ module
   skeletons for character/combat/resonance/boss/world/quest/weather systems,
   tuned for Nanite/Lumen/World Partition/Niagara/MetaHuman-class pipelines.
3. **Standalone PC prototype** (`prototype/`) — a native desktop (pygame/SDL,
   no browser, no Roblox, no voxel/low-poly) systems-complete vertical slice:
   Region 1 playable, third-person action combat, Dharma Resonance combos,
   phased boss, quests, dungeons, weather, day/night, graphics presets.

> Honest scope note: a true AAA UE5 build (4K PBR, MetaHuman, MoCap, 15
> handcrafted regions, 50+ bosses, 1000 levels, full VO/score) is a
> multi-year, 100+ person effort with licensed engine + hardware. What is
> delivered here is the complete IP foundation + a runnable systems slice
> that proves every pillar loop, plus the exact UE5 path to scale it.

## Quick start (prototype — native PC, no browser)

```bash
cd frozen-dharma/prototype
pip install -r requirements.txt
python3 main.py            # native SDL desktop window
# headless smoke / tests (CI-safe, no display):
SDL_VIDEODRIVER=dummy python3 main.py --smoke
python3 -m pytest tests/ -q
```

Controls: WASD move · mouse/arrow camera · J light · K heavy · Space dodge ·
L block · Q parry · 1-6 Dharma · E interact · Shift sprint · Tab lock-on.

## Docs

- `docs/GDD.md` — pillars, combat, resonance, RPG, AI, dungeons, quests,
  audio, cinematic, UI, graphics tiers, camera, story (14 chapters), endgame.
- `docs/WORLD_BIBLE.md` — 15 regions × provinces, 1→1000 level mapping,
  50+ boss registry, dungeon identity table, NPC cultures, secrets.
- `docs/UE5_TECH_PATH.md` — Nanite/Lumen/World Partition/Niagara/GAS
  mapping, asset budgets, streaming, optimization tiers.

## UE5 blueprint

Open `ue5/FrozenDharma.uproject` in UE 5.5+. C++ module `FrozenDharma`
declares: `AFDCharacter`, `UFDCombatComponent`, `UFDResonanceSystem`,
`AFDBossBase`, `UFDQuestSystem`, `UFDWeatherSubsystem`, `UFDWorldConfig`
(region/level mapping). Blueprints extend these; data tables in
`ue5/Content/` (to be authored by art team) drive regions/bosses/quests.

## Originality

All mythology is original fiction inspired by the philosophy/aesthetics of
ancient Indian thought — no direct copying of copyrighted characters,
stories, locations, or assets. Names below (Agni/Vayu/etc. as elemental
words, Frostbound Guardian, Abyssal Maharaja…) are generic/descriptive or
original; art, music, dialogue must be newly created.
