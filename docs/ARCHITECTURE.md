# 🏗️ THE FROGGIT — Codebase Architecture & Module Dependency Guide

## 1. Segregated Directory Structure

```
the-froggit/
├── index.html                         # Clean semantic DOM shell & UI modal templates
├── package.json                       # Dev server & build scripts
├── vite.config.js                     # Vite bundler configuration
├── README.md                          # Quickstart, controls & overview
├── dist/
│   └── froggit.html                   # Single-file zero-server standalone bundle
├── docs/
│   ├── GAME_DOCUMENTATION.md          # Complete Selling Points, GDD & Technical Reference
│   ├── ARCHITECTURE.md                # Module dependency graph & runtime lifecycle
│   └── AUDIO_SLOTS_GUIDE.md           # 25-slot custom audio integration guide
└── src/
    ├── styles/
    │   ├── tokens.css                 # Design tokens, typography & 6-tier z-index hierarchy
    │   ├── components.css             # Glassmorphic surfaces, HUD buttons, minimap & touch D-pad
    │   └── animations.css             # Keyframes, 300% floating callouts, safe-area & landscape rules
    ├── audio/
    │   └── ProceduralAudio.js         # 25-slot AUDIO_CUSTOM_SLOTS + Web Audio API synth engine
    ├── state/
    │   └── gameState.js               # Constants, 7 FLOORS, 5 FROG_SKINS, reactive state & localStorage
    ├── rendering/
    │   └── sceneAndShaders.js         # Three.js scene/camera/lights + 256x256 gradient/bump generator
    ├── entities/
    │   ├── todeRig.js                 # 3D Tode rig, dynamic skin switcher, pink tongue & 3D reticle
    │   └── enemiesAndParticles.js     # 5 enemy archetypes, 3-shield Guardian Boss & particle bursts
    ├── world/
    │   └── courseBuilder.js           # 96-row winding dogleg math, multi-axis obstacles & InstancedMesh
    ├── ui/
    │   └── minimapAndWorldMap.js      # 60 FPS 2D orthographic minimap & 7-Realm World Map showcase
    ├── gameplay/
    │   └── mechanicsAndModals.js      # Hopping, 1-slot buffer, tongue grapple, knockback & modals
    ├── input/
    │   └── controls.js                # Keyboard, Mouse Raycaster, Touch D-Pad/Swipe & UI bindings
    └── main.js                        # 60 FPS animation loop, hazard telegraphs, camera & Gamepad API

```

## 2. Module Responsibilities & Load Order

| Order | Module File | Lines | Primary Responsibility & Exported Symbols | 
| ----- | ----- | ----- | ----- | 
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
