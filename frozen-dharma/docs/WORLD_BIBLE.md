# WORLD BIBLE — 15 Regions, Levels 1–1000, 14 Chapters, 50+ Bosses

All names/myths original. "Maharaja/Deity" used as generic titles only.

## Level → Region map (continuous, no gaps)
| Region | Levels | Chapters | Theme |
|---|---|---|---|
| 1 Frozen Valley | 1–50 | Ch.1 | alpine ice, villages, frozen falls |
| 2 Sunken Kingdom | 51–100 | Ch.2 | flooded temples, dive ruins |
| 3 Celestial Forest | 101–200 | Ch.3–4 | giant trees, floating isles |
| 4 Ashen Empire | 201–300 | Ch.5 | lava, siege forts, under-cities |
| 5 Desert of Forgotten Gods | 301–380 | Ch.6 | dunes, buried colossi |
| 6 City of a Thousand Temples | 381–460 | Ch.7 midpoint | vertical holy metropolis |
| 7 Underground Kingdom | 461–540 | Ch.8 | crystal caverns, deep cities |
| 8 Ocean of Eternity | 541–620 | Ch.9 | open sea, leviathans, storms |
| 9 Floating Celestial Kingdom | 621–700 | Ch.10 | sky islands, wind palaces |
| 10 Realm of Shadows | 701–770 | Ch.11 | dark mirror, stealth |
| 11 Giant Mountain Sanctuary | 771–830 | Ch.12 | monastery peaks, trials |
| 12 Storm Kingdom | 831–880 | Ch.12–13 | eternal tempest citadels |
| 13 Ancient Battlefield | 881–920 | Ch.13 | war-frozen time field |
| 14 Frozen Heaven | 921–970 | Ch.13–14 | celestial ice palace |
| 15 Final Mythic Realm | 971–1000 | Ch.14 | beyond-reality, final truth |

`region_for_level(n)` in prototype implements exactly this.

Each region (full authoring template): architecture, ecosystem, weather
table, enemy roster, NPC culture, myth, music motif/raga+orchestration,
palette, hazards, quest lines (≥1 main + 4 side + 1 mythic), puzzles,
≥1 dungeon, ≥1 regional boss, ≥2 hidden areas. Region 1 fully playable in
prototype; Regions 2–15 data-defined + streaming stubs (UE5 World Partition
cells reserved).

### Region 1 detail (playable slice)
Provinces: Thawline Hamlet → Shattered Bridge → Hollowpine Woods →
Sunless Caves → High Temple Approach. Settlements: Thawline (7 NPCs w/
schedules). Dungeon: Temple of the Still Flame (10-beat). Hidden: Frozen
Falls vault, Husk Warren. Hazards: blizzard whiteouts, thin ice.

### Regions 2–15 (summary stubs — expand per template)
2: dive meters, breath/Prana, underwater puzzles, library maze.
3: illusion gates, gravity sap, living bridges. 4: lava surf, siege
rams, heat armor. 5: mirage navigation, buried-god dungeons. 6: vertical
faction wards, bell-puzzle network. 7: light-crystal routing, deep trade.
8: sailing + leviathan hunts. 9: sky-grapple lanes. 10: light/shadow
duality. 11: trial ascents. 12: storm riding. 13: time-fracture arenas.
14: zero-friction ice duels. 15: reality-bending finale.

## Boss registry (54 majors — name / region / phases / weakness / reward)
1 Frostbound Guardian / R1 / 3 / fire+parry slam / Ember Seal + Agni spark
2 Husk Matriarch (mini) / R1 / 2 / AoE / Frostweave
3 Stillflame Abbot (dungeon) / R1 / 2 / water→steam stun / Temple Key
4 Abyssal Maharaja / R2 / 3 / lightning in water / Varuna attunement
5 Drowned Librarian / R2 / 2 / fire in air pockets / Tide Bow
6 Sunken Colossus (regional) / R2 / 3 / eye cores / Palace Plate
7 Forest Deity / R3 / 4 / burn blossoms / Vayu attunement
8–10 R3: Thorn Regent, Mothmother, Isle Warden …
11 Ashen Emperor / R4 / 4 / water+earth / Prithvi ember
12–14 R4: Siege Golem, Cinder Twins, Magma Cantor …
15 Buried God Vessan / R5 / 3 / expose core at mirage collapse / …
16–18 R5: Dune Revenant, Glass Prophet, Scarab King …
19 Thousand-Bell Hierophant / R6 / 4 / silence bells / Akasha spark
20–23 R6: Ward Justiciars (4, one per ward) …
24 Deep Crystal Sovereign / R7 / 3 / resonance shatter / …
25–27 R7: Blind Choir, Tunnel Tyrant, Gemhoarder …
28 Leviathan Eterna / R8 / 5 (sea phases) / harpoon conduits / …
29–30 R8: Stormcaller, Reef Mother …
31 Celestial Maharani / R9 / 4 / ground her with wind snare / Vayu crown
32–33 R9: Gale Knights, Sky Scribe …
34 Shadow of the Self (mirror boss) / R10 / 3 (mirrors player build) / light / Kala seed
35–37 R10: Gloom Abbots, Hollow Twin …
38 Mountain Saint / R11 / 3 (trial duel, no adds) / patience counters / …
39–40 R11: Avalanche Monk, Peak Warden …
41 Storm Raja / R12 / 4 / earth rods / Storm Spear
42 R12: Tempest Engine …
43 The Unfallen Army (100-soldier battle echo) / R13 / 3 / break banners / …
44 R13: War Chronicler …
45 Frozen Seraph / R14 / 4 / fire vortex / Heaven Key
46 R14: Choir of Stillness …
47–49 Final Mythic Realm: Herald, Gate, HEART OF STILLNESS (final, 6 phases) …
50–54 Secret/Endgame: Dream-Eater, Clockless King, Drowned Sun, Mother of Husk, True Stillness (NG+ only).

Mini/optional/secret/dungeon/regional/endgame distributed per region
(≥3 mini + 1 secret each). Full parity table drives `bosses.py` BOSS_REGISTRY.

## Dungeons (one per region min, unique identity)
R1 Temple of the Still Flame (ice/fire duality) … R15 Throne of Unbecoming
(reality rewrite). Each follows 10-beat structure; puzzle types rotate
(bells, water-levels, light-crystals, wind-lanes, time-echoes).

## Story chapters (14) — beats + boss gates
Ch.1 (R1) awakening + Guardian → Ch.2 (R2) drowned truth → Ch.3–4 (R3)
forest trial → Ch.5 (R4) empire's sin → Ch.6 (R5) god-graves → Ch.7 (R6)
midpoint: Dharma sealed by ancestors; protagonist is the Seal-Bearer →
Ch.8–10 descent/sea/sky → Ch.11–12 shadow/mountain/storm → Ch.13 war+heaven
siege → Ch.14 Unbecoming + endings (Restore/Reforge/Release via final
Resonance choice). Environmental storytelling carries 60% of lore.
