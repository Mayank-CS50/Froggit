# 🐸 THE FROGGIT — Comprehensive Game Design, Selling Points & Technical Documentation

## 1. Executive Summary & Core Unique Selling Points (USPs)

**THE FROGGIT** is a cross-platform 3D voxel action-platformer and obstacle course campaign that evolves the classic grid-hopper formula into an offensive, vertical, multi-biome adventure. Built entirely on standard WebGL (`Three.js`), HTML5 Canvas, and the Web Audio API with zero external binary assets required, the game boots instantaneously on desktop browsers, mobile phones (portrait and landscape), and gamepad-connected devices.

### The 10 Core Selling Points of THE FROGGIT

| # | Selling Point | Competitive Advantage & Player Value |
| :--- | :--- | :--- |
| **1** | **Offensive Tongue-Grapple Combat ("The Frog That Eats Back")** | Unlike passive lane-crossers (*Crossy Road*, *Frogger*) where enemies are strictly untouchable hazards, Tode whips a natural pink tongue (`8.4×` dynamic range) to snipe patrolling insects mid-air, build `1x–8x+` pentatonic score combos, and grow up to `+22%` in stature. |
| **2** | **Grapple Lily-Post (`🪷`) Chasm Traversal** | The tongue mechanic doubles as a high-skill movement tool: locking onto **Grapple Lily-Posts (`🪷`)** at chasm rows (`14, 37, 54, 69, 83`) zips Tode directly across hazardous gaps for `+150` style bonus points. |
| **3** | **Live 3D Pink Target Lock-On Reticle (`targetReticleGroup`)** | Eliminates depth-perception guesswork on 3D isometric grids by projecting a pulsing 3D pink ring directly underneath whichever bug, **✨ Golden Firefly**, or **🪷 Grapple Post** Tode's tongue will strike next. |
| **4** | **7-Realm Vertical Sky & Abyss Campaign (`-3` to `+3`)** | Every 96-row course culminates in a triple-portal shrine where players choose their trajectory: ascend through the **☀️ Sky Hoop** toward the celestial **👑 Sun Crown (`+3`)** or dive through the **🌊 Ocean Hoop** into the bioluminescent **🌊 Mariana Abyss (`-3`)**. |
| **5** | **Fair Knockback Physics vs. Lethal Enemy Separation** | Physical traps (**Bastion Cannons**, **Swinging Battle-Axes**, **Vertical Thwomp Monoliths**, **Rolling Spiked Logs**, **Rotating Sweepers**, and **Sliding Push-Blocks**) physically shove Tode onto adjacent tiles rather than causing cheap instant deaths—creating emergent near-miss recoveries near unfenced cliff ledges. |
| **6** | **Pre-Strike Hazard Telegraphs & Impact VFX** | Every mechanical hazard telegraphs its strike window: Bastion Cannons project a pulsing orange laser sightline `0.60s` before firing, Swinging Battle-Axes trace a live yellow shadow ring across a crimson floor warning strip with directional whoosh audio, and Thwomps quiver before slamming with radial dust bursts. |
| **7** | **3-Shield Floor Guardian Boss Encounters** | At Row `90` of every realm, a colossal crowned **Floor Guardian Warlord** patrols the pre-shrine terrace with 3 orbiting crystal shields—requiring 3 timed tongue-whip strikes to shatter its armor (`+300` pts per shield) and devour the boss (`+600 × combo` pts). |
| **8** | **Live 60 FPS Orthographic Course Minimap** | A custom top-right 2D orthographic radar renders beveled 3D course tiles, guardrails, moving ferries, cannonballs, swinging axe arcs, patrolling enemies, Tode's live tongue beam, and an animated top-down frog sprite with kicking hind legs. |
| **9** | **Golden Fireflies (`✨`) Economy & 5 Unlockable 3D Skins** | Players earn persistent **✨ Golden Fireflies** from outer-lane risk-reward pickups, `2x+` bug combos, and boss takedowns to unlock and live-preview 5 custom 3D shader skins on the Landing Console Dock. |
| **10** | **Mobile-First Portrait/Landscape Camera & 1-Slot Hop Buffer** | Dynamic horizontal-FOV compensation prevents narrow phone screens (`9:16` / `9:20`) from clipping lateral lanes; 1-slot pre-input hop buffering (`>= 42%` of hop duration) guarantees zero dropped inputs during rapid rhythmic tapping across touch, keyboard, and Bluetooth gamepads. |

## 2. The 7-Realm Vertical World & Level Design Architecture

Each realm in **THE FROGGIT** spans **96 grid rows** (`ROADWAY_LENGTH = 96`, `TILE_SIZE = 2.0` world units), engineered with mathematical dogleg centerlines (`getTrackCenterCol`), rolling elevation hills (`getTileElevation`), split-island forks, and 3 elevated **🚩 Checkpoint Vista Overlooks** (Rows `28`, `56`, and `78`).

### 2.1 Complete 7-Realm Biome Matrix

| Level | Realm Name | Theme | Width Scale | Speed Mult | Signature Visuals & Environmental Shaders |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **`+3`** | **👑 Sun Crown** | `heaven` | `75%` | `1.45x` | Golden solar orbit citadel, marble colonnades, 6-winged Seraphim Ophanim, Apex Victory Finale. |
| **`+2`** | **✨ Star Temple** | `heaven` | `85%` | `1.30x` | Starlit astral Causeways, diamond crystal obelisks, diving Dragonfly Wyverns, sky thwomps. |
| **`+1`** | **☁️ Sky Gardens** | `heaven` | `92%` | `1.15x` | Pearlescent cloud billows, twin-wing split sky bridges, golden sweepers, spring bounce pads. |
| **`0`** | **🌿 Ground Meadow** | `ground` | `100%` | `1.00x` | Sunlit emerald clover turf, pine waterfall islands, dual-layer crystalline river, Royal Hornets. |
| **`-1`** | **🐠 Coral Reef** | `ocean` | `92%` | `1.15x` | Turquoise coral atolls, rising bubble vents, pink bio-corals, atoll ferries, Reef Scorpions. |
| **`-2`** | **🪼 Kelp Trench** | `ocean` | `85%` | `1.30x` | Deep indigo currents, swaying giant kelp forests, spiked naval sea-mines, Neon Jellyfish. |
| **`-3`** | **🌊 Mariana Abyss** | `ocean` | `75%` | `1.45x` | Midnight caustic rifts, volcanic obsidian monoliths, rapid abyssal currents, Apex Abyss Finale. |

### 2.2 Winding 96-Row Course Topology & Elevation Profile

Rather than a straight corridor, each realm's centerline shifts up to `±6` columns (`±12` world units) left and right while rising and falling across 9 distinct structural zones:

1. **Rows `0–3` (Starting Sanctuary Terrace)**: Fenced `5-tile` wide starting pad flanked by torch braziers and waterfall outcrops.
2. **Rows `4–27` (First Dogleg & Rolling Hill Crest)**: Sweeps far left/right up a `1.45`-unit sine-wave hill, traversed by a ferry chasm (Row `14` + `🪷` Grapple Post), Bastion Cannon (Row `15`), Rotating Sweeper (Row `16`), Rolling Spiked Log (Rows `14–20`), Swinging Battle-Axe (Row `21`), and Vertical Thwomp (Row `26`).
3. **Row `28` (🚩 Checkpoint #1 Vista Overlook)**: Wide fenced plateau (`+0.65` elevation) that auto-saves respawn progress on first crossing.
4. **Rows `29–55` (Grand Highland Plateau & Split-Island Fork)**: Climbs stepped ramps to a `1.95`-unit highland plateau (Rows `32–46`) before splitting into a **Twin-Fork Island** (Rows `48–52`) where the center lane opens into a chasm and players must commit to the Left or Right branch.
5. **Row `56` (🚩 Checkpoint #2 Vista Overlook)**: Second mid-course safe overlook.
6. **Rows `57–77` (Deep Switchback Canyon Ridge)**: Climbs a `2.25`-unit canyon ridge guarded by cross-track cannonfire (Row `58`), push-blocks (Row `61`), swinging axes (Row `65`), sweepers (Row `66`), ferry chasm (Row `69`), and rolling logs (Rows `64–72`).
7. **Row `78` (🚩 Checkpoint #3 Pre-Boss Overlook)**: Final checkpoint before the citadel gauntlet.
8. **Rows `79–92` (Pre-Boss Citadel Terrace & Floor Guardian Arena)**: S-bend terrace culminating at Row `90`, where the **3-Shield Floor Guardian Warlord** patrols in a figure-8 pattern.
9. **Rows `93–96` (Finish Shrine & Triple Portal Hoops)**: Grand marble dais featuring the **🌊 Ocean Dive Hoop** (`gx <= -1`), **🌀 Next Realm Center Hoop** (`gx === 0`), and **☀️ Sky Ascent Hoop** (`gx >= 1`). Completing `+3` or `-3` triggers the non-looping **360° Victory Dance Finale**.

## 3. Multi-Axis Obstacles, Enemies & Combat Mechanics

### 3.1 Physical Knockback Obstacles (Non-Lethal Displacement)

All mechanical hazards invoke `knockbackTode(pushDx, pushDz, label)`—computing a safe displacement vector that shoves Tode 1 tile away with camera trauma and a `300%` floating callout, only eliminating the player if they position themselves next to an unfenced cliff or chasm:

| Hazard | Axis | Row Locations | Telegraph & Physics Behavior |
| :--- | :---: | :--- | :--- |
| **Rotating Sweeper Beam** | `X–Z` Yaw | `16, 40, 66, 84` | Central turret spinning a hazard-striped bar; shoves Tode tangentially along the beam's rotation vector. |
| **Sliding Push-Block** | `X` Lateral | `12, 33, 61, 81` | Cushion boxes, roller drums, and stepped rams oscillating across the track width. |
| **Bastion Cannon Turret** | `X` Projectile | `15, 36, 58, 74, 86` | Projects a **pulsing orange laser sightline** and swells its iron barrel `0.60s` before firing high-speed cannonballs. |
| **Swinging Battle-Axe** | `X–Y` Arc | `21, 43, 65, 85` | Overhead timber gallows swinging a double crescent blade; renders a **crimson floor strip + live yellow blade shadow ring** and triggers `playAxeWhoosh()`. |
| **Vertical Thwomp Monolith** | `Y` Vertical | `26, 46, 71, 88` | Quivers at `y = +3.2` before slamming to `y = 0.0`, shrinking its ground target ring and bursting radial dust particles. |
| **Rolling Spiked Log** | `Z` Longitudinal | `14–20, 36–44, 64–72` | 3.2-unit iron-banded timber logs rolling downhill along the track spine. |
| **Spring Bounce Pad** | `Y–Z` Boost | `7, 23, 45, 70` | Launches Tode `2 rows` forward in a high arc with a celebratory `BOUNCE BOOST!` callout. |

### 3.2 Multi-Part 3D Enemy Archetypes & Anger Scaling

Every bug eaten increases `state.beesEaten`, dynamically scaling remaining enemies' patrol span (`+11%` per bug) and speed (`+9%` per bug), and flashing their carapaces crimson once `4+` bugs are devoured:

1. **Royal Hornet Wasp (`sweeper`)**: Amber thorax, striped gold-and-black abdomen, obsidian stinger, ruby compound eyes, 6 legs, and cyan-white wings; sweeps horizontally across the lane.
2. **Cyber-Scorpion Beetle (`zigzag`)**: Scarlet armored carapace, toxic-lime dorsal chevrons, snapping front mandibles, and arched 3-segment scorpion tail; charges in sharp sawtooth `X–Z` diagonals.
3. **Dragonfly Wyvern (`swooper`)**: Royal-violet thorax, 4-segment emerald/gold tail, and 4 stained-glass biplane wings; swoops high and dives low across the `Y–Z` plane.
4. **Biome Specialists (`loop` / `figure8`)**:
   - **Sky Realms (`+1..+3`)**: *Seraphim Ophanim* — sapphire octahedron core surrounded by intersecting golden throne rings.
   - **Ocean Realms (`-1..-3`)**: *Abyssal Jellyfish* — bioluminescent magenta bell dome with 6 trailing neon-lime tentacles.
   - **Ground Meadow (`0`)**: *Monarch Swallowtail Moth* — solar-orange and fuchsia dual-wing moth.
5. **Crowned Floor Guardian Boss (`boss`, Row `90`)**: Colossal armored warlord with spiked pauldrons, 3-pronged golden crown, and **3 orbiting cyan crystal shield orbs**. Requires 3 tongue strikes (`+300` pts each) before the final devour (`+600 × combo` pts + `+5 ✨` Golden Fireflies).

## 4. Meta-Progression, Economy & Unlockable Wardrobe

Players accumulate **Golden Fireflies (`✨`)** across runs, persisted automatically in `localStorage` (`froggit_settings_v3`):

- **Outer-Lane Golden Fireflies (`✨`)**: Hovering golden octahedrons at rows `8, 19, 30, 42, 50, 61, 75, 85` award **`+2 ✨`** and **`+250 × combo` pts** when sniped with the pink tongue or hopped onto directly.
- **Combo Feast Bonus**: Devouring any patrolling bug at a `2x` or higher combo awards **`+1 ✨`**.
- **Guardian Boss Bounty**: Devouring a Realm Guardian Boss awards **`+5 ✨`**.

### Unlockable 3D Toad Skins (`FROG_SKINS`)

All 5 skins dynamically re-synthesize Tode's procedural gradient and bump-map textures (`refreshFrogMaterialsForPack`) in real time:

| Skin ID | Display Name | Cost | Head Hex | Torso Hex | Belly Hex | Vocal Sac Hex |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `emerald` | **🐸 Emerald** | Free (`0 ✨`) | `#10b981` | `#059669` | `#34d399` | `#6ee7b7` |
| `cobalt` | **💎 Cobalt Dart** | `5 ✨` | `#3b82f6` | `#1d4ed8` | `#38bdf8` | `#7dd3fc` |
| `shogun` | **👑 Gold Shogun** | `12 ✨` | `#f59e0b` | `#d97706` | `#fde047` | `#fef08a` |
| `abyss` | **🪼 Bio-Abyss** | `20 ✨` | `#8b5cf6` | `#6d28d9` | `#2dd4bf` | `#99f6e4` |
| `sakura` | **🌸 Sakura** | `30 ✨` | `#f472b6` | `#db2777` | `#fbcfe8` | `#fce7f3` |

## 5. Cross-Platform Mobile, Desktop & Gamepad Engineering

### 5.1 Standardized 6-Tier CSS Z-Index Hierarchy

To prevent UI overlaps between 3D world callouts, top HUD bars, mobile thumb controls, and modal dialogs across portrait and landscape screens, all layers follow strict CSS custom properties in `tokens.css`:

- `--z-canvas: 1` — Three.js WebGL viewport (`#game-canvas-container`).
- `--z-world-popups: 20` — 300% extra-bold head-tracked floating callouts (`#popup-layer`).
- `--z-hud-bars: 30` — Top status crest, square orthographic minimap, and quick guide (`#gameplay-hud`).
- `--z-touch-controls: 35` — Mobile thumb-zone D-Pad + `👅 WHIP` button (`#mobile-touch-controls`) and checkpoint toast (`#checkpoint-toast-banner`).
- `--z-revive-iris: 40` — Instant `ENTER ↵` checkpoint revive banner (`#death-revive-banner`) and circular Super Mario-style iris transition overlay (`#iris-transition-overlay`, `z-index: 45`).
- `--z-modals: 50` — World Map, Settings, Leaderboard, How to Play, Wipeout Scorecard, and Victory Finale modals.

### 5.2 Portrait Aspect-Ratio Camera Compensation & Dogleg Look-Ahead

Three.js `PerspectiveCamera` locks vertical FOV by default, which causes narrow portrait mobile screens (`aspect < 1.0`) to severely crop horizontal viewing width. **THE FROGGIT** solves this with three coordinated camera adjustments in `animate()`:

1. **Dynamic Portrait Pullback (`portraitZoomBack`)**:
   ```javascript
   const aspect = window.innerWidth / Math.max(1, window.innerHeight);
   const isPortrait = aspect < 1.0;
   const portraitZoomBack = isPortrait ? THREE.MathUtils.clamp((1.0 - aspect) * 6.2, 0, 3.8) : 0;
   const targetPlayFov = (isPortrait ? 54 : 42) + (state.mobileWideView ? 6 : 0);
   ```
2. **Subtle Dogleg Look-Ahead (`doglegBiasX`)**: Blends `14%` (clamped to `±0.65` units) toward `getTrackCenterCol(level, gridZ + 4)` so upcoming left/right dogleg turns enter view early while keeping Tode centered.
3. **Safe-Area Insets & Landscape Compact Mode**: Applies `env(safe-area-inset-*)` via `.safe-top-pad` and `.safe-bottom-pad`, plus `@media (max-height: 520px) and (orientation: landscape)` rules for horizontal phone play.

## 6. WebGL Rendering & 25-Slot Audio Engine

### 6.1 `THREE.InstancedMesh` Cliff Batching & Procedural Textures

- **Single-Draw-Call Cliff Undersides**: Each 96-row realm contains `~700` cliff underside blocks. Batching all cliff transforms into a single `THREE.InstancedMesh` (`cliffInstanced`) reduces WebGL draw calls by over `50%`, sustaining 60 FPS on mobile GPUs alongside a `1.5x` mobile `devicePixelRatio` cap.
- **256×256 Procedural Gradient & Bump-Map Synthesizer (`sceneAndShaders.js`)**: Generates cached `THREE.CanvasTexture` color + bump map pairs for 11 surface archetypes (`water_flow`, `ocean_caustics`, `cloud_mist`, `grass_top`, `stone_brick`, `cobble_moss`, `wood_planks`, `hazard_stripes`, `crystal_gem`, `frog_skin`, `frog_belly`) with seamless `3×3` periodic wrapping so scrolling water and cloud tiles exhibit zero visible seams.

### 6.2 Complete 25-Slot Audio Registry (`AUDIO_CUSTOM_SLOTS`)

| Slot Key | Type | Trigger Event | Built-In Web Audio Synth Fallback |
| :--- | :---: | :--- | :--- |
| `bgm_landing_title` | Loop | Title Screen & Hero Diorama | Silent / Ready for custom MP3/OGG |
| `bgm_ground_0F` | Loop | `0F` Ground Meadow stage | Silent / Ready for custom MP3/OGG |
| `bgm_heaven_spire` | Loop | `+1F` to `+3F` Sky realms | Silent / Ready for custom MP3/OGG |
| `bgm_ocean_abyss` | Loop | `-1F` to `-3F` Ocean realms | Silent / Ready for custom MP3/OGG |
| `bgm_boss_guardian` | Loop | Rows `82–94` Boss proximity | Silent / Ready for custom MP3/OGG |
| `bgm_victory_dance` | Loop | `+3F` / `-3F` Victory Finale | Silent / Ready for custom MP3/OGG |
| `sfx_hop` | SFX | Directional tile hop | Pitch-scaled triangle wave (`180Hz → 369Hz`) |
| `sfx_bounce_pad` | SFX | Spring Bounce Pad launch | High-arc triangle wave (`240Hz → 492Hz`) |
| `sfx_tongue_whip` | SFX | Pink tongue grapple fire | Fast sawtooth upward whip (`260Hz → 1180Hz`) |
| `sfx_sticky_latch` | SFX | Tongue latches target | Crisp sine pop (`480Hz → 960Hz`) |
| `sfx_swallow_combo` | SFX | Bug or Firefly devoured | Low sine gulp + 8-note pentatonic combo chime |
| `sfx_boss_shield_break` | SFX | Boss crystal shield shattered | Gulp + harmonic shield chime |
| `sfx_obstacle_knockback`| SFX | Physical hazard shove | Square-wave low bonk (`140Hz → 75Hz`) |
| `sfx_cannon_fire` | SFX | Bastion Cannon fires | Custom slot hook (`0.75` gain) |
| `sfx_thwomp_slam` | SFX | Thwomp Monolith hits `h = 0` | Custom slot hook (`0.85` gain) |
| `sfx_checkpoint_save` | SFX | Checkpoint Overlook crossed | Ascending 3-note triangle arpeggio (`D5–A5–D6`) |
| `sfx_hoop_warp_fanfare` | SFX | Portal Hoop leap & Victory | 7-note celebratory melody fanfare |
| `sfx_fall_whistle` | SFX | Falling into chasm / off ledge | Descending sine slide (`580Hz → 115Hz`, `1.2s`) |
| `sfx_defeat_wipeout` | SFX | Lethal enemy hit / wipeout | Descending triangle slide (`380Hz → 98Hz`) |
| `amb_waterfall_river` | Loop | Meadow river ambiance | Ready for custom ambient loop |
| `amb_underwater_bubbles`| Loop | Ocean reef bubble vents | Ready for custom ambient loop |
| `sfx_axe_whoosh` | SFX | Pendulum Battle-Axe pass | Low-pass sine air whoosh (`190Hz → 72Hz`) |
| `sfx_log_rumble` | SFX | Rolling spiked timber log | Ready for custom loop/SFX |
| `sfx_ui_click` | SFX | UI button click | Crisp tactile triangle tick (`520Hz → 780Hz`) |
| `sfx_frog_ribbit_idle` | SFX | Equipping Toad skin on dock | Dual-pulse sawtooth frog croak (`145Hz` / `175Hz`) |

## 7. Segregated Modular Codebase Reference

| Order | Module File | Lines | Primary Responsibility & Exported Symbols |
| :---: | :--- | :---: | :--- |
| **1** | `src/styles/tokens.css` | `135` | CSS custom properties (`--font-*`, `--bg-*`, `--z-canvas` to `--z-modals`) and base reset. |
| **2** | `src/styles/components.css` | `299` | Glassmorphic `.ui-panel`, `.hud-icon-btn`, `.minimap-frame`, `.touch-dpad-btn`, `.touch-grapple-btn`, and range sliders. |
| **3** | `src/styles/animations.css` | `367` | Hero logo lockup, 300% `.score-popup-*` callouts, `.safe-top-pad`/`.safe-bottom-pad`, mobile landscape media queries, and circular iris wipe. |
| **4** | `src/audio/ProceduralAudio.js` | `487` | `AUDIO_CUSTOM_SLOTS` (25 slots), `window.registerFroggitAudio()`, and `ProceduralAudio` synthesizer class (`audio`). |
| **5** | `src/state/gameState.js` | `315` | `TILE_SIZE`, `ROADWAY_LENGTH`, `CHECKPOINT_ROWS`, `FLOORS` (7 realms), `FROG_SKINS` (5 skins), `state` store, and `localStorage` persistence. |
| **6** | `src/rendering/sceneAndShaders.js` | `528` | Three.js `scene`, `camera`, `renderer`, lights, and 256×256 procedural gradient + bump-map texture generator (`createVoxelMaterial`). |
| **7** | `src/entities/todeRig.js` | `522` | Articulated 3D Tode rig (`todeRoot`), live skin switcher (`refreshFrogMaterialsForPack`), pink tongue (`tongueGroup`), and 3D lock-on reticle (`targetReticleGroup`). |
| **8** | `src/world/courseBuilder.js` | `1,733` | 96-row winding centerline math (`getTrackCenterCol`), hill elevations (`getTileElevation`), `THREE.InstancedMesh` cliff batching, and all 9 obstacle/target spawners. |
| **9** | `src/entities/enemiesAndParticles.js` | `564` | 5 multi-part 3D enemy archetypes (`buildThemeEnemyMesh`), 3-shield Guardian Boss, 3D pollen bursts (`spawnPollenBurst`), and 300% floating callouts (`spawnFloatingPopup`). |
| **10** | `src/ui/minimapAndWorldMap.js` | `677` | 60 FPS 2D orthographic minimap (`renderLiveMinimap`) and interactive 7-Realm World Showcase modal (`renderCrossSectionMap`). |
| **11** | `src/gameplay/mechanicsAndModals.js` | `769` | `attemptHop` (1-slot pre-input buffer), `fireTongueGrapple`, `onSwallowBee`, `knockbackTode`, `damageTode`, `reviveAtLastCheckpoint`, and circular iris transitions. |
| **12** | `src/input/controls.js` | `399` | Keyboard (`WASD`/Arrows/`Space`/`Enter`/`Esc`/`H`), Mouse raycaster, Touch D-Pad/Swipe + Haptics, and modal button event listeners. |
| **13** | `src/main.js` | `989` | `animate(now)` 60 FPS loop: scrolling shaders, pre-strike hazard telegraphs, enemy patrols, dogleg look-ahead camera, 3D reticle lock-on, and HTML5 Gamepad API polling. |
