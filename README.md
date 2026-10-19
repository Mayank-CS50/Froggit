# 🐸 Froggit — Sky and Abyss

Hey! This is **Froggit — Sky and Abyss**, a 3D obstacle-course game I built for the browser. You play as **Tode**, a little voxel frog hopping across floating islands, hills, and moving ferries—trying to either climb all the way up into the clouds or dive down into the deep ocean trenches.

**[Play Live in Your Browser (thefroggit.netlify.app)](https://www.google.com/search?q=https%3A%2F%2Fthefroggit.netlify.app%2F)** · **[GitHub Repository](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2FMayank-CS50%2FFroggit)** · **[Offline Single-File Build](https://www.google.com/search?q=dist%2Ffroggit.html)**

## 🌍 Welcome to the World & How Things Work

When you start a run, a short **3D story intro** pans across the course to show you around before you take your first hop:

1. **Meet Tode & The Floating Course**: You start on a quiet stone terrace at the edge of the **🌿 Ground Meadow (`0F`)**. Ahead of you is a winding 96-row path made of grass tiles, steep highland ramps, split-island forks, and moving ferry platforms suspended over open water.
2. **Your Pink Tongue & Lily-Posts (`👅` & `🪷`)**: Unlike classic lane-crossing games where you can only run away, Tode can fight back. Touching patrolling creatures directly will wipe you out, so use your **pink tongue** (`Spacebar` or `Left-Click`) to snipe them out of mid-air for points and combos. You can also latch onto **🪷 Grapple Lily-Posts** to zip right across chasms, or reel in hovering **✨ Golden Fireflies** to unlock five 3D frog skins (**Emerald**, **Cobalt Dart**, **Gold Shogun**, **Bio-Abyss**, and **Sakura**).
3. **Traps That Shove & Checkpoints (`🚩`)**: Along the trail, you'll run into **Bastion Cannons**, **Swinging Battle-Axes**, **Vertical Thwomp Monoliths**, **Rolling Logs**, and **Spinning Sweepers**. These physical traps telegraph their strikes and won't instantly kill you—they **shove Tode** a tile away, so watch your footing near unfenced cliff edges. Cross any glowing **🚩 Checkpoint** pad (Rows `28`, `56`, and `78`) to save your spot and press `Enter ↵` to revive right there if you fall.
4. **The Goal — Sky or Abyss (`☀️` vs `🌊`)**: At the end of each realm (Row `90`), you'll face the **Realm Guardian**, which takes **3 tongue strikes** to shatter its orbiting crystal shields. Past the guardian stand the **Portal Hoops**:
   - Jump into the **☀️ Sky Ascent Hoop** to climb through **☁️ Sky Gardens (`+1`)**, **✨ Star Temple (`+2`)**, and reach the **👑 Sun Crown (`+3`)**.
   - Jump into the **🌊 Ocean Dive Hoop** to plunge through **🐠 Coral Reef (`-1`)**, **🪼 Kelp Trench (`-2`)**, and reach the **🌊 Mariana Abyss (`-3`)**.
   - Conquer either the `+3` Sun Crown or `-3` Mariana Abyss to trigger the **Victory Sanctuary Celebration**!

## 🎮 Controls

You can play with a keyboard and mouse, touch controls on mobile or tablet, or any standard Bluetooth/USB controller.

| Action | Desktop (Keyboard & Mouse) | Mobile & Tablet (Touch) | Controller (Xbox / PlayStation / Switch) |
| :--- | :--- | :--- | :--- |
| **Hop Forward / Back / Left / Right** | `W A S D` or `Arrow Keys` | Bottom-Left **D-Pad** or **Swipe** | **D-Pad** or **Left Stick** |
| **Whip Pink Tongue** | `Spacebar` or **Left-Click** (aims at cursor) | Bottom-Right **`👅 WHIP`** or **Tap** target | **`A` / `Cross`**, **`X` / `Square`**, or **`RT`** |
| **Revive at Checkpoint** | `Enter ↵` | Tap **`🚩 REVIVE`** Banner | **`A` / `Cross`** on Wipeout |
| **Toggle Music On / Off** | `M` Key or **Bottom-Left `🔊` Button** | **Bottom-Left Circular `🔊` Button** | In-Game Settings |
| **Advance / Skip 3D Story Intro** | `Space` / `Enter` (`Esc` to Skip) | Tap **`Next →`** or **`Skip Intro`** | **`A` / `Cross`** |
| **Pause & Settings** | `Esc` | Top-Right **⚙️ Button** | **`Start` / `Options`** |
| **How to Play Guide** | `H` or `?` | Top-Right **`?` Button** | UI Navigation |
| **Toggle Minimap** | Click Minimap Frame | Tap Minimap Frame | — |

## 🗺️ The 7 Realms

You begin at **Ground Meadow (`0F`)**. At the end of each 96-row stage, the portal hoop you choose moves you one floor higher into the **Sky (`+1` to `+3`)** or one floor deeper into the **Abyss (`-1` to `-3`)**. Higher and deeper floors narrow the path and speed up hazards.

| Floor | Realm | Environment & Obstacles | Local Creatures | Row 90 Guardian |
| :---: | :--- | :--- | :--- | :--- |
| **`+3`** | **👑 Sun Crown** | Golden solar citadel, marble colonnades, narrowest high-speed lanes (`1.45x` speed) | Golden Eagles, Peregrine Falcons, Scarlet Macaws, Celestial Swans | **Thunder-Eagle Guardian** |
| **`+2`** | **✨ Star Temple** | Starlit causeways, crystal obelisks, diving aerial patrols (`1.30x` speed) | Peregrine Falcons, Celestial Swans, Eagles, Macaws | **Thunder-Eagle Guardian** |
| **`+1`** | **☁️ Sky Gardens** | Cloud bridges, twin-wing sky islands, spring bounce pads (`1.15x` speed) | Golden Eagles, Scarlet Macaws, Falcons, Swans | **Thunder-Eagle Guardian** |
| **`0`** | **🌿 Ground Meadow** | Clover turf, pine waterfall islands, dual-layer rivers (`1.00x` speed) | Royal Hornets, Scorpion-Beetles, Dragonflies, Monarch Moths | **Meadow Guardian** |
| **`-1`** | **🐠 Coral Reef** | Turquoise coral atolls, bubble vents, moving atoll ferries (`1.15x` speed) | Tropical Reef Fish, Reef Sharks, Giant Squids, Neon Jellyfish | **Kraken / Megalodon Guardian** |
| **`-2`** | **🪼 Kelp Trench** | Deep indigo currents, kelp forests, drifting sea-mines (`1.30x` speed) | Neon Jellyfish, Giant Squids, Reef Sharks, Reef Fish | **Kraken / Megalodon Guardian** |
| **`-3`** | **🌊 Mariana Abyss** | Midnight volcanic rifts, obsidian monoliths, deep-sea finale (`1.45x` speed) | Reef Sharks, Giant Squids, Neon Jellyfish, Reef Fish | **Kraken / Megalodon Guardian** |

## 🎵 Adding Your Own Background Music (BGM)

The game is wired to play a **calm theme song** during normal exploration (and on the title/3D story intro), **stop** the music when Tode dies, **restart** the calm theme from the beginning (`0:00`) when you revive or retry, and switch to a **celebration song** when you win a realm hoop or conquer the campaign finale.

Place your two non-copyrighted audio files in `assets/audio/`:

```text
assets/
└── audio/
    ├── calm-theme.mp3       # Plays normally; stops on death; restarts from 0:00 on revive/retry
    └── celebration.mp3      # Plays when you clear a realm hoop or reach the Victory Sanctuary
```

If those `.mp3` files aren't in the folder yet, the game automatically falls back to a built-in Web Audio melody synthesizer so you still get calm background music, sound effects, and victory tunes out of the box—and you can toggle music anytime with the **`M` key** or the circular **`🔊` button** in the bottom-left corner.

You can also register custom audio files at runtime from the browser console or your own script:

```javascript
window.registerFroggitAudio('bgm_calm_theme', './assets/audio/calm-theme.mp3');
window.registerFroggitAudio('bgm_celebration', './assets/audio/celebration.mp3');
```

See [docs/AUDIO\_SLOTS\_GUIDE.md](https://www.google.com/search?q=docs%2FAUDIO_SLOTS_GUIDE.md) for the full list of audio slots.

## 🚀 Running the Game Locally

If you just want to play right away, head to **[thefroggit.netlify.app](https://www.google.com/search?q=https%3A%2F%2Fthefroggit.netlify.app%2F)** or double-click **[dist/froggit.html](https://www.google.com/search?q=dist%2Ffroggit.html)** to open the standalone build in any browser—no server or setup needed.

To run or tweak the source code locally with hot reload:

```bash
git clone https://github.com/Mayank-CS50/Froggit.git
cd Froggit
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser. You can also serve the folder directly without installing packages using Python (`python3 -m http.server 8080`) or Node (`npx serve .`).

## 🗂️ Project Structure & Tech Stack

```text
Froggit/
├── README.md                          # Game intro, controls & setup guide
├── package.json                       # Vite dev server & build scripts
├── vite.config.js                     # Vite configuration
├── index.html                         # Main HTML shell, HUD, 3D intro overlay & modals
├── assets/
│   └── audio/                         # Drop calm-theme.mp3 and celebration.mp3 here
├── dist/
│   └── froggit.html                   # Single-file standalone build
├── docs/
│   ├── ARCHITECTURE.md                # Module structure & state lifecycle notes
│   ├── AUDIO_SLOTS_GUIDE.md           # Custom audio slot reference
│   └── GAME_DOCUMENTATION.md          # Detailed game design notes
└── src/
    ├── main.js                        # 60 FPS game loop, 3D story intro camera & bootstrap
    ├── styles/
    │   ├── tokens.css                 # CSS variables & color palette
    │   ├── components.css             # UI panels, HUD buttons & corner music toggle
    │   └── animations.css             # Keyframes, floating callouts & iris transitions
    ├── audio/
    │   └── ProceduralAudio.js         # BGM lifecycle manager (calm/stop/restart/celebrate) + Web Audio synth
    ├── state/
    │   └── gameState.js               # 7 realms, 5 frog skins, story intro chapters & localStorage
    ├── rendering/
    │   └── sceneAndShaders.js         # Three.js scene, lighting & procedural canvas textures
    ├── entities/
    │   ├── todeRig.js                 # 3D Tode rig, facial expressions, tongue & target reticle
    │   └── enemiesAndParticles.js     # Biome creatures, Realm Guardian boss & particle bursts
    ├── world/
    │   └── courseBuilder.js           # 96-row winding course, traps, ferries & finish shrine
    ├── ui/
    │   └── minimapAndWorldMap.js      # Top-down minimap & 7-realm world map modal
    ├── gameplay/
    │   └── mechanicsAndModals.js      # Hopping, story intro flow, tongue grapple, knockback & modals
    └── input/
        └── controls.js                # Keyboard, mouse, touch D-pad & corner music button bindings
```

- **Built with**: Three.js (`r128`), Tailwind CSS (`3.4`), Vite (`5.4+`), HTML5 Canvas, and the Web Audio API.
- **Attribution & License**: Released under the [MIT License](https://www.google.com/search?q=LICENSE). Built as a personal creative project for the [JetBrains Academy Build a Game with an AI Coding Agent](https://www.google.com/search?q=https%3A%2F%2Facademy.jetbrains.com%2Fcourse%2F30327) challenge with assistance from JetBrains Junie and Gemini.