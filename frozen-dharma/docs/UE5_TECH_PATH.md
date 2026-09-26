# UE5 Technical Path (target, not yet built here)

Engine: Unreal Engine 5.5+, C++ + Blueprints, Perforce, Windows PC lead.

## Module map (skeletons in `ue5/Source/`)
- `AFDCharacter` — third-person, spring-arm + camera, locomotion/traversal,
  lock-on; AnimBP + Motion Matching + IK (feet/hands), cloth (cloak).
- `UFDCombatComponent` — GAS-based light/heavy/charged/aerial, stamina,
  parry windows, poise, hit-stop, executions; trace + physical reactions.
- `UFDResonanceSystem` — 6 attunements + fusion table (GameplayTags +
  GameplayCues/Niagara), meter, ultimates; weather modifiers.
- `AFDBossBase` — phase BT + Environment Query, arena actors, cinematic
  intro (Sequencer/LevelSequence), music switch (MetaSounds).
- `UFDQuestSystem` — data-table quests, stages, world-state reactions.
- `UFDWeatherSubsystem` + `UFD DayNight` — volumetric clouds/fog, Ultra
  Dynamic Sky-style, gameplay tags to abilities/AI.
- `UFDWorldConfig` — region/level map (mirrors prototype `world.py`), World
  Partition cells, Data Layers per province, streaming budgets.

## Rendering targets
Nanite (dense geo), Lumen GI+reflections, Virtual Shadow Maps, Temporal
Super Resolution, Niagara (snow/fire/water/magic/destruction), Chaos
destruction, MetaHuman-class heads, high-quality hair/cloth (groom + Chaos
cloth), water (FluidFlux-style or custom), foliage (procedural + hand-tuned),
volumetrics (fog/clouds), SSR fallback, DoF/motion-blur (cinematic tier).

## Budgets (per 1080p/60 HIGH)
Draw calls <2500, tris <8M visible, VRAM <10GB, streaming pool 2GB,
boss arena <12M tris w/ Nanite. Profiling: Unreal Insights + RenderDoc.

## Tiers LOW→CINEMATIC
Map to scalability groups (sg.ResolutionQuality, sg.ViewDistance,
sg.ShadowQuality, sg.GlobalIllumination, sg.ReflectionQuality,
sg.FoliageQuality, r.VolumetricFog, r.AmbientOcclusion, r.TSR).
Prototype `config.py` GRAPHICS_PRESETS mirrors these knobs numerically.

## Audio
Wwise/FMOD or MetaSounds; 3D attenuation, per-surface footsteps (physical
materials), adaptive boss stems.

## What the prototype proves
Pure-logic twins of every system above live in `prototype/game/` with the
same names/tables so gameplay tuning transfers 1:1 into UE data tables.
