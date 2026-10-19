# 🐸 THE FROGGIT — Sky & Abyss 3D Voxel Action Campaign

<div align="center">

[![Version](https://img.shields.io/badge/version-8.0.0--ARGON-blue.svg?style=for-the-badge)](package.json)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black.svg?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural-emerald.svg?style=for-the-badge)](src/audio/ProceduralAudio.js)
[![Zero Binary Assets](https://img.shields.io/badge/Assets-100%25_Procedural-purple.svg?style=for-the-badge)](src/rendering/sceneAndShaders.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**"The Frog That Eats Back."**  
*A cross-platform 3D WebGL action-platformer and obstacle campaign built with Three.js, Procedural Web Audio, and zero external binary asset dependencies.*

[Play Standalone Build](dist/froggit.html) • [Architecture Guide](docs/ARCHITECTURE.md) • [Game Documentation](docs/GAME_DOCUMENTATION.md) • [Audio Slots API](docs/AUDIO_SLOTS_GUIDE.md)

</div>

---

## 📋 Table of Contents

- [🌟 Overview & Core Highlights](#-overview--core-highlights)
- [🗺️ The 7-Realm Vertical World Stack](#️-the-7-realm-vertical-world-stack)
- [👾 Biome-Authentic Sculpted Voxel Mascot Enemies](#-biome-authentic-sculpted-voxel-mascot-enemies)
- [👅 Core Gameplay & Combat Mechanics](#-core-gameplay--combat-mechanics)
- [📁 Project Architecture & File Structure](#-project-architecture--file-structure)
- [🚀 Quickstart & Getting Started](#-quickstart--getting-started)
- [🎮 Cross-Platform Controls](#-cross-platform-controls)
- [🔊 Custom Audio Hook API](#-custom-audio-hook-api)
- [🛠️ Tech Stack & Technical Specifications](#️-tech-stack--technical-specifications)
- [📚 Project Documentation](#-project-documentation)
- [📄 License](#-license)

---

## 🌟 Overview & Core Highlights

**THE FROGGIT** reimagines the classic lane-crossing arcade genre into a vertical, multi-realm 3D action campaign. Instead of passively dodging traffic on flat planes, players guide **Tode** across **96 winding rows** of rolling hills, highland plateaus, split-island forks, and moving ferries—using a **natural pink tongue grapple** to snipe patrolling creatures out of mid-air, zip across chasms via **🪷 Grapple Lily-Posts**, collect **✨ Golden Fireflies**, and shatter the 3 crystal shields of each realm's **Floor Guardian Boss**.

### 🌟 Key Pillars

| Pillar | Feature & Competitive Advantage |
| :--- | :--- |
| **👅 Offensive Tongue-Grapple Combat** | Snipe lethal patrolling creatures mid-air for pentatonic combo multipliers (`120 × combo` pts), reel in outer-lane **Golden Fireflies (`✨`)**, and latch onto **Grapple Lily-Posts (`🪷`)** to zip across chasms. |
| **🎯 Live 3D Target Lock-On Reticle** | A pulsing 3D reticle (`targetReticleGroup`) highlights the exact trajectory and entity Tode will strike next, eliminating depth-perception guesswork on isometric grids. |
| **🗺️ 7-Tier Vertical World Stack** | Branching progression at every finish shrine: leap into the **☀️ Sky Ascent Hoop** (`+1` to `+3` Sun Crown) or dive into the **🌊 Ocean Abyss Hoop** (`-1` to `-3` Mariana Abyss). |
| **🦅 Biome-Authentic Voxel Mascot Fauna** | 100% sculpted voxel mascot creatures: **Aquatic Fauna** in the Abyss (Reef Sharks, Squids, Reef Fishes, Jellyfish), **Sky Birds** in Heaven (Eagles, Falcons, Macaw Parrots, Swans), and **Meadow Insects** on Ground (Hornets, Scorpion-Beetles, Dragonflies, Moths). |
| **🪓 Fair Knockback vs. Lethal Hazard Split** | Traps (**Bastion Cannons**, **Swinging Battle-Axes**, **Vertical Thwomp Monoliths**, **Rolling Spiked Logs**, **Rotating Sweepers**, and **Push-Blocks**) feature pre-strike telegraphs and physically shove Tode rather than causing cheap instant deaths. |
| **🛡️ 3-Shield Floor Guardian Boss** | Encounter the crowned **Floor Guardian Warlord** at Row `90` of every realm (Kraken, Thunder-Eagle, Meadow Guardian), requiring 3 precision tongue strikes to break orbiting crystal shields before devouring the boss. |
| **📱 Universal Cross-Platform Ergonomics** | Runs at 60 FPS across **Desktop (WASD / Mouse Aim)**, **Mobile (Touch D-Pad + Swipe + Haptic `👅 WHIP` Button + Dynamic FOV Compensation)**, and **Bluetooth / USB Controllers (HTML5 Gamepad API)**. |
| **🎨 Meta-Progression & 5 3D Toad Skins** | Earn persistent **Golden Fireflies (`✨`)** to unlock and preview 5 custom 3D shader skins: **🐸 Emerald**, **💎 Cobalt Dart**, **👑 Gold Shogun**, **🪼 Bio-Abyss**, and **🌸 Sakura**. |
| **⚡ Zero-Asset Procedural Engine** | 100% procedural 256×256 canvas gradient and bump-map shaders, single-draw-call `THREE.InstancedMesh` cliff batching, and a **25-slot Web Audio synthesizer** with custom audio hooks. |

---

## 🗺️ The 7-Realm Vertical World Stack

Every realm spans **96 rows** (`ROADWAY_LENGTH = 96`, `TILE_SIZE = 2.0`), designed with mathematical dogleg centerlines (`getTrackCenterCol`), rolling elevation profiles (`getTileElevation`), split-island forks, and 3 safe **🚩 Checkpoint Vista Overlooks** (Rows `28`, `56`, and `78`).

| Floor | Realm Name | Theme | Width Scale | Speed Mult | Signature Visuals & Environment |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **`+3`** | **👑 Sun Crown** | `heaven` | `75%` | `1.45x` | Golden solar orbit citadel, marble colonnades, Apex Victory Finale. |
| **`+2`** | **✨ Star Temple** | `heaven` | `85%` | `1.30x` | Starlit astral causeways, diamond crystal obelisks, diving Peregrine Falcons. |
| **`+1`** | **☁️ Sky Gardens** | `heaven` | `92%` | `1.15x` | Pearlescent cloud billows, twin-wing sky bridges, spring bounce pads, Golden Eagles. |
| **`0`** | **🌿 Ground Meadow** | `ground` | `100%` | `1.00x` | Emerald clover turf, pine waterfall islands, dual-layer river, Royal Hornets. |
| **`-1`** | **🐠 Coral Reef** | `ocean` | `92%` | `1.15x` | Turquoise coral atolls, rising bubble vents, moving atoll ferries, Tropical Reef Fishes. |
| **`-2`** | **🪼 Kelp Trench** | `ocean` | `85%` | `1.30x` | Deep indigo currents, giant kelp forests, naval sea-mines, Neon Jellyfish & Squids. |
| **`-3`** | **🌊 Mariana Abyss** | `ocean` | `75%` | `1.45x` | Midnight caustic rifts, volcanic obsidian monoliths, Apex Abyss Megalodon/Kraken Finale. |

---

## 👾 Biome-Authentic Sculpted Voxel Mascot Enemies

Every creature is generated procedurally in Tode's rounded-voxel mascot aesthetic—complete with raised mascot eye sockets, white sclera plates, crisp catchlight glints, and articulated appendages:

| Biome Domain | Creature Archetypes | Signature Visuals & Articulation | Row 90 Guardian Boss |
| :--- | :--- | :--- | :--- |
| **🌊 Ocean Abyss (`-1F` to `-3F`)** | **Reef Shark**, **Giant Squid**, **Tropical Reef Fish**, **Neon Jellyfish** | Sweeping triangular dorsal fins, gill slits, articulated siphon mantles, undulating oral arms & translucent bell margins. | **Megalodon / Kraken Warlord** with 3 orbiting abyssal crystal shields. |
| **☁️ Sky & Heaven (`+1F` to `+3F`)** | **Golden Eagle**, **Peregrine Falcon**, **Scarlet Macaw**, **Celestial Swan** | Tiered swept aero-wings, curved hooked beaks, razor talons, S-curved necks & graduated tail fans. | **Thunder-Eagle Warlord** with 3 orbiting celestial solar shields. |
| **🌿 Ground Meadow (`0F`)** | **Royal Hornet**, **Scorpion-Beetle**, **Dragonfly**, **Monarch Moth** | Striped abdominal segments, dual iridescent wing pairs, arched tail stingers & feathered antennae fans. | **Meadow Guardian Warlord** with 3 orbiting emerald crystal shields. |

---

## 👅 Core Gameplay & Combat Mechanics

```
  [Patrolling Creature]  <---  (Pink Tongue Grapple)  <---  [Tode the Frog]
            │                                                     │
       Devoured (+120 × combo pts)                         Snaps Forward
            │                                                     │
       Combo Counter Up (1x → 8x+)                        Stat Stature Scale (+22%)
```

- **Tongue Sniping**: Press `Spacebar`, `Left-Click`, or tap `👅 WHIP` to fire Tode's high-velocity tongue beam toward lock-on targets up to `8.4` tiles away.
- **Chasm Grapple Traversal**: Target **🪷 Grapple Lily-Posts** located at chasm gaps (Rows `14, 37, 54, 69, 83`) to zip across hazards for `+150` style points.
- **Pre-Input Hop Buffering**: Inputs triggered during the final `>= 42%` of a hop are automatically buffered, ensuring zero dropped inputs during fast tapping.
- **Telegraphed Hazard Recovery**:
  - **Bastion Cannons**: Cast orange laser sightlines `0.60s` before firing projectile bursts.
  - **Swinging Battle-Axes**: Directional air-whoosh audio and floor shadow sweeps warning of pendulum arcs.
  - **Vertical Thwomps**: Quiver telegraph before crashing into the ground with dust shockwaves.

---

## 📁 Project Architecture & File Structure

The project uses a segregated, modular architecture designed for maintainability and asset-free execution:

```text
Froggit/
├── index.html                         # Semantic HTML5 shell, HUD overlays & modal templates
├── package.json                       # Scripts & Vite configuration
├── vite.config.js                     # Vite build & dev server config
├── README.md                          # Project documentation & reference manual
├── dist/
│   └── froggit.html                   # Zero-dependency standalone single-file build (453 KB)
├── docs/
│   ├── ARCHITECTURE.md                # Module dependency graph & state lifecycle
│   ├── AUDIO_SLOTS_GUIDE.md           # 25-slot custom audio integration guide
│   └── GAME_DOCUMENTATION.md          # Comprehensive Game Design Document (GDD)
└── src/
    ├── main.js                        # 60 FPS animation loop, hazard telegraphs & Gamepad API
    ├── styles/
    │   ├── tokens.css                 # Design tokens, typography & 6-tier z-index hierarchy
    │   ├── components.css             # Glassmorphic panels, HUD buttons, radar & touch D-pad
    │   └── animations.css             # Keyframes, floating score popups & mobile media queries
    ├── audio/
    │   └── ProceduralAudio.js         # 25-slot custom audio registry & Web Audio synth engine
    ├── state/
    │   └── gameState.js               # Reactive state, constants, 7 realms, 5 skins & persistence
    ├── rendering/
    │   └── sceneAndShaders.js         # Three.js scene, camera, lights & 256x256 shader engine
    ├── entities/
    │   ├── todeRig.js                 # Articulated 3D Tode rig, skin updater & 3D lock-on reticle
    │   └── enemiesAndParticles.js     # Biome voxel fauna (Sharks, Eagles, Hornets) & 3-shield Boss
    ├── world/
    │   └── courseBuilder.js           # 96-row track math, obstacles & InstancedMesh cliffs
    ├── ui/
    │   └── minimapAndWorldMap.js      # 60 FPS 2D orthographic minimap & 7-Realm World Showcase
    ├── gameplay/
    │   └── mechanicsAndModals.js      # Hopping, hop buffer, tongue grapple, knockback & modals
    └── input/
        └── controls.js                # Keyboard, Mouse Raycaster, Touch D-Pad/Swipe & UI events
```

---

## 🚀 Quickstart & Getting Started

### Prerequisites

- Modern Web Browser (Chrome, Firefox, Safari, Edge) supporting WebGL and Web Audio.
- [Node.js](https://nodejs.org/) (v18+ recommended) for local development server.

### Option 1: Local Development Server (Recommended)

1. Clone or navigate into the repository:
   ```bash
   cd Froggit
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite hot-reload development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

### Option 2: Zero-Install Static Server

Serve the application directly using any local HTTP static file server:

```bash
# Using Node npx
npx serve .

# Or using Python 3
python3 -m http.server 8080
```

### Option 3: Standalone Single-File Build (`dist/froggit.html`)

For immediate offline play, iframe embedding, or LMS submission, double-click or open [dist/froggit.html](dist/froggit.html) directly in any web browser without needing any server or build step.

---

## 🎮 Cross-Platform Controls

| Action | Desktop (Keyboard & Mouse) | Mobile & Tablet (Touch) | Gamepad (Xbox / PlayStation / Switch) |
| :--- | :--- | :--- | :--- |
| **Hop Forward / Back / Left / Right** | `W A S D` or `Arrow Keys` | On-Screen **3×3 Touch D-Pad** or **Swipe** | **D-Pad** or **Left Analog Stick** |
| **Fire Pink Tongue Grapple** | `Spacebar` or **Left-Click** (aims at cursor) | Bottom-Right **`👅 WHIP` Button** or **Tap** target | **`A` / `Cross`**, **`X` / `Square`**, or **Right Trigger (`RT`)** |
| **Instant Checkpoint Revive** | `Enter ↵` | Tap **`🚩 REVIVE`** Toast / Modal Button | **`A` / `Cross`** on Wipeout |
| **Settings & Pause Modal** | `Esc` | Top-Right **⚙️ Settings** Button | **`Start` / `Options`** Button |
| **How to Play Field Manual** | `H` or `?` | Top-Right **`?` Guide** Button | UI Navigation |
| **Minimap Toggle** | Click Radar Frame | Tap Minimap Frame | — |

---

## 🔊 Custom Audio Hook API

THE FROGGIT features a zero-dependency **Web Audio API procedural synthesizer** (`ProceduralAudio.js`) that produces real-time dynamic sound effects and melodic cues.

You can override any of the **25 audio slots** with custom `.mp3`, `.ogg`, or `.wav` audio files at runtime using `window.registerFroggitAudio(slotName, url)`:

```javascript
// Register custom soundtrack loops
window.registerFroggitAudio('bgm_ground_0F', '/assets/audio/meadow_theme.mp3');
window.registerFroggitAudio('bgm_boss_guardian', '/assets/audio/guardian_boss.mp3');

// Register custom action sound effects
window.registerFroggitAudio('sfx_tongue_whip', '/assets/audio/whip_crack.wav');
window.registerFroggitAudio('sfx_axe_whoosh', '/assets/audio/pendulum_swing.ogg');
```

> For the complete registry of all 25 hook slots, consult the [Audio Slots Integration Guide](docs/AUDIO_SLOTS_GUIDE.md).

---

## 🛠️ Tech Stack & Technical Specifications

- **3D Graphics Engine**: Three.js (`r128`) featuring ACES Filmic Tone Mapping, 2048×2048 PCF soft shadows, and exponential horizon fog.
- **Geometry Optimization**: `THREE.InstancedMesh` for cliff walls and barrier pillars, reducing draw calls by `~700` per realm.
- **Audio Synthesis**: Native Web Audio API with procedural oscillator graphs, envelope shaping, and custom slot overrides.
- **UI Framework & Tokens**: Tailwind CSS (`3.4`) paired with custom CSS variables (`tokens.css`) across a structured 6-tier z-index hierarchy.
- **Typography**: Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`, `Syne`, `Space Grotesk`).
- **Data Persistence**: `localStorage` state synchronization for high scores, custom player handles, firefly currency, unlocked skins, and audio preferences.

---

## 📚 Project Documentation

Detailed design specifications and architectural guidelines are available in the [`docs/`](docs/) directory:

- [Game Documentation (GDD)](docs/GAME_DOCUMENTATION.md) — Comprehensive game design document, narrative pillars, and mechanics breakdown.
- [Architecture Guide](docs/ARCHITECTURE.md) — Module dependency graph, state lifecycle, and execution pipelines.
- [Audio Slots Guide](docs/AUDIO_SLOTS_GUIDE.md) — 25-slot audio registry specification and implementation examples.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for the JetBrains Game Challenge.
