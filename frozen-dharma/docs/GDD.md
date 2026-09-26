# FROZEN DHARMA — Game Design Document (condensed production GDD)

## 1. Pillars
1. **Mythic scale**: "something beyond that mountain / temple / world."
2. ** timing-based combat** over button-mashing (stamina, parry windows, positioning).
3. **Dharma Resonance combos** transform combat (6 elements → emergent fusions).
4. **Dense handcrafted regions**, not empty procedural terrain.
5. **Progressive revelation** storytelling (inscriptions, dreams, ruins, artifacts).

## 2. World structure: Regions → Provinces → Settlements → Dungeons → Hidden → Mythic
15 regions cover levels 1–1000 (see WORLD_BIBLE.md). Each region defines:
architecture, ecosystem, weather, enemies, NPC culture, mythology, music,
palette, hazards, quests, puzzles, dungeons, bosses, hidden areas.
Streaming via UE5 World Partition; provinces stream at 500m–2km tiles.

## 3. Character
Customizable: face/skin/hair/style/proportions/clothing/armor/accessories/
weapons. Cinematic silhouette: ash-grey traveler cloak + ember-thread sash +
floating resonance sigil (changes per attuned Dharma).
Animation set: locomotion (walk/run/sprint), climb/swim/glide/mount/grapple,
dodge/parry/block/hit-react, light/heavy/charged/aerial/finisher/interact,
traversal (ledge, vault, wall-run short), cinematic reactions.
Target: MoCap-quality; prototype uses parametric state machine (see game.py).

## 4. Combat (third-person, real-time)
Weapons: sword, dual blades, spear, bow, heavy (gada/hammer), divine
(unlocked), each with mastery XP.
Moves: light/heavy/charged, ground & aerial chains, dodge (i-frames 0.25s,
perfect 0.12s pre-hit window), block (directional, chip), parry (0.18s
window → riposte), counters, executions (<20% poise-broken elites),
environmental (kick into braziers/cliffs, collapsing ice).
Enemies react physically: hit-stop 60–90ms, knockback by poise damage,
interrupt windows, dismemberment-free stagger states.
Rewarded: timing, spacing, knowledge (codex weaknesses), stamina, combos,
weapon matchups. Stamina: dodge 20, sprint 10/s, heavy 25, parry 0 but
whiff punish. See `prototype/game/combat.py`.

## 5. Dharma Resonance (6 attunements)
- **AGNI** (fire): DoT, melt ice, -50% in rain unless empowered.
- **VAYU** (wind): mobility, grouping, spreads fire.
- **VARUNA** (water): slows, conducts lightning, freezes in snow zones.
- **PRITHVI** (earth): shields, poise, ground slams.
- **AKASHA** (cosmic): beams, gravity wells, true damage.
- **KALA** (time): slow-field, rewind-dodge (ultimate).
Fusion examples: Wind+Fire=Firestorm Vortex; Water+Lightning(Akasha spark)=
Tempest Snare; Earth+Fire=Volcanic Strike; Water+Wind=Frostbind (in frozen
zones); Time+any extends debuff 2×. Meter: Resonance builds on perfect
actions; ultimates cost 100. See `resonance.py`.

## 6. Bosses (50+ majors + mini/optional/secret/dungeon/regional/endgame)
Every major: unique model/arena/patterns/multi-phase/cinematic intro/
environment interaction/weakness/reward/theme.
Phase philosophy: evolve (new moves, arena change, adds), never just HP+.
Example — Frostbound Guardian (Region 1): P1 cleaves + ice shards; P2 (66%)
arena frost + summoned Husk Sentinels; P3 (33%) time-frozen falling
stalactites + parry-only slam. See `bosses.py`.

## 7. NPCs (living world)
Schedules (work/eat/sleep/worship), professions, relations, factions,
reputation-gated dialogue, rumors, trade. React to weather/attacks/
reputation/story/events. Key NPCs get cinematic dialogue (camera + MoCap).

## 8. Quests
Types: Main (14 chapters), Side (character arcs), Mythic (supernatural),
Exploration (ruins), Companion, World Events (dynamic, no activation).
Rule: no "collect 10" filler; every quest changes state (NPC, area, lore).
Prototype implements quest graph with stages + rewards (`quests.py`).

## 9. Exploration/traversal
Climb, swim, glide (Vayu cloak), mounts (hill-yak → sky-serpent late),
grapple (temple hook), wall-traversal, underwater, hidden caves/temples,
treasure vaults with physics puzzles. Discovery-first: 30% of shrines
unmarked.

## 10. Dungeons (10-beat structure)
1 entrance → 2 exploration → 3 env puzzle → 4 combat → 5 hidden room →
6 lore → 7 mini-boss → 8 major puzzle → 9 final boss → 10 reward.
Each with unique identity table (see WORLD_BIBLE).

## 11. World events & weather
Invasions, temple sieges, stormfalls, eruptions, migrations, frozen-time
anomalies, emergencies, merchants, wandering legendaries, celestial events.
Weather: rain/storm/snow/fog/sandstorm/supernatural/clear/overcast/cosmic.
Gameplay: snow −visibility; rain −50% fire, +conductivity; storms lightning
hazards; fog stealth bonus. See `weather.py`.

## 12. Audio
Original score: ancient-Indian-inspired (bansuri-like flutes, mridangam-like
drums, tanpura drones, choir) + modern orchestra. Per-region + per-boss
themes, positional 3D audio (bells, wind, falls, crowds, impacts, surface
footsteps, thunder, supernatural). Prototype stubs mixer channels.

## 13. Cinematics
Dynamic angles, close-ups, wide establishes, slow-mo kill-cams & perfect
parries, boss intros, seamless gameplay↔cutscene (no loads within region).
Cinematic: letterbox + DoF + time-dilation events in prototype.

## 14. UI/UX
Minimal mythic-futuristic HUD: health/stamina/abilities/weapon/objective/
minimap/quest tracker. No clutter; damage numbers off by default.

## 15. RPG/inventory
Weapons/armor/accessories/materials/consumables/artifacts/relics with
tradeoff affixes (not just +N). Trees: skills, abilities, weapon mastery,
armor tempering, artifact sets, crafting. Meaningful choices (e.g.,
Frostweave vs Emberplate).

## 16. Enemy AI
Utility AI: flank, dodge, block, retreat, call adds, ranged coordination,
punish whiffs, react to weather. Bosses: phase behavior trees.
Prototype: FSM + aggro/poise/team roles (`enemies.py`).

## 17. Graphics tiers: LOW/MEDIUM/HIGH/ULTRA/CINEMATIC
Scale: resolution %, textures, shadows, foliage, FX, reflections, AO,
volumetrics, AA, view distance. High-end = full; low-end = playable 30fps
720p. See `config.py` + UE5_TECH_PATH.

## 18. Camera
Third-person: dynamic distance (combat zoom-out), obstacle avoidance
(sphere-cast), lock-on (soft/hard), cinematic overrides, sensitivity/FOV/
shake toggles.

## 19. Story (14 chapters, spoiler-structured)
Ch.1 Frozen Valley awakening → … → Ch.7 midpoint truth (Dharma was sealed,
not broken) → … → Ch.13 Frozen Heaven siege → Ch.14 Final Mythic Realm
confrontation + 3 endings (Restore / Reforge / Release). Full beat sheet in
WORLD_BIBLE; protagonist linked via past-life seal.

## 20. Endgame
NG+, legendaries, mythic/secret bosses, brutal dungeons, hidden regions,
arenas, advanced Resonance, secret quests, alt endings. Power via new
mechanics (Kala Attunement+), not HP bloat.
