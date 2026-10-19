# Froggit — Sky and Abyss

A 3D arcade hop-and-grapple game built for the browser. You play as **Tode**, making your way across 96-row obstacle courses, snapping up patrolling creatures mid-air with your tongue, zipping across chasms on lily-posts, and choosing at the end of every stage whether to climb toward the sky or dive into the deep ocean.

**[Play Live in Your Browser (thefroggit.netlify.app)](https://www.google.com/search?q=https%3A%2F%2Fthefroggit.netlify.app%2F)** · **[GitHub Repository](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2FMayank-CS50%2FFroggit)** · **[Offline Single-File Build](https://www.google.com/search?q=dist%2Ffroggit.html)**

## About the Game

**Froggit — Sky and Abyss** started from a simple idea: what if a classic lane-crossing game let you fight back and explore vertically? Instead of just dodging traffic on a flat road, you hop across rolling hills, split-island paths, and moving ferries while using your tongue as both a weapon and a grappling hook.

- **Tongue-Grapple Combat & Traversal**: Lock onto nearby creatures to eat them mid-air for combo multipliers, reel in **Golden Fireflies** from outer lanes, or latch onto **Lily-Posts** to zip across wide gaps.
- **Branching Sky & Abyss Worlds**: Every stage ends with a choice—jump through the **Sky Hoop** to ascend into cloud gardens and star temples, or dive into the **Abyss Hoop** to explore coral reefs, kelp trenches, and the ocean floor.
- **Knockback Traps & Checkpoints**: Swinging axes, cannons, thwomps, and rolling logs telegraph their attacks before striking and shove you back rather than ending your run on a single mistake. Each 96-row stage has three **Checkpoint Overlooks** (rows 28, 56, and 78) so you can revive right where the action gets tough.
- **Floor Guardian Bosses**: At row 90 of every world, a guardian blocks the shrine with three orbiting crystal shields. Crack all three shields with tongue strikes to leave the boss vulnerable and clear the floor.
- **Unlockable Skins**: Collect Golden Fireflies across runs to unlock five 3D toad skins: **Emerald**, **Cobalt Dart**, **Gold Shogun**, **Bio-Abyss**, and **Sakura**.

## Controls

You can play with a keyboard and mouse, touch controls on mobile/tablet, or any standard Bluetooth/USB controller.

| Action | Desktop (Keyboard & Mouse) | Mobile & Tablet (Touch) | Controller (Xbox / PlayStation / Switch) |
| :--- | :--- | :--- | :--- |
| **Hop (Up / Down / Left / Right)** | `W A S D` or `Arrow Keys` | On-screen **D-Pad** or **Swipe** | **D-Pad** or **Left Stick** |
| **Tongue Grapple / Attack** | `Spacebar` or **Left-Click** (aims at cursor) | **`WHIP` Button** or **Tap** target | **`A` / `Cross`**, **`X` / `Square`**, or **`RT`** |
| **Revive at Checkpoint** | `Enter` | Tap **`REVIVE`** button | **`A` / `Cross`** on wipeout |
| **Pause & Settings** | `Esc` | Top-right **Settings** button | **`Start` / `Options`** |
| **How to Play Guide** | `H` or `?` | Top-right **`?`** button | Menu navigation |
| **Toggle Minimap** | Click minimap frame | Tap minimap frame | — |

## The 7 Worlds

You begin at **Ground Meadow (`0F`)**. At the end of each 96-row stage, the portal hoop you choose moves you one floor higher into the **Sky (`+1` to `+3`)** or one floor deeper into the **Abyss (`-1` to `-3`)**. Higher and deeper floors narrow the path and speed up hazards.

| Floor | World | Environment & Obstacles | Local Creatures | Row 90 Guardian |
| :---: | :--- | :--- | :--- | :--- |
| **`+3`** | **Sun Crown** | Golden solar citadel, marble colonnades, narrowest high-speed lanes (`1.45x` speed) | Golden Eagles, Peregrine Falcons, Scarlet Macaws, Celestial Swans | **Thunder-Eagle Guardian** |
| **`+2`** | **Star Temple** | Starlit causeways, crystal obelisks, diving aerial patrols (`1.30x` speed) | Peregrine Falcons, Celestial Swans, Eagles, Macaws | **Thunder-Eagle Guardian** |
| **`+1`** | **Sky Gardens** | Cloud bridges, twin-wing sky islands, spring bounce pads (`1.15x` speed) | Golden Eagles, Scarlet Macaws, Falcons, Swans | **Thunder-Eagle Guardian** |
| **`0`** | **Ground Meadow** | Clover turf, pine waterfall islands, dual-layer rivers (`1.00x` speed) | Royal Hornets, Scorpion-Beetles, Dragonflies, Monarch Moths | **Meadow Guardian** |
| **`-1`** | **Coral Reef** | Turquoise coral atolls, bubble vents, moving atoll ferries (`1.15x` speed) | Tropical Reef Fish, Reef Sharks, Giant Squids, Neon Jellyfish | **Kraken / Megalodon Guardian** |
| **`-2`** | **Kelp Trench** | Deep indigo currents, kelp forests, drifting sea-mines (`1.30x` speed) | Neon Jellyfish, Giant Squids, Reef Sharks, Reef Fish | **Kraken / Megalodon Guardian** |
| **`-3`** | **Mariana Abyss** | Midnight volcanic rifts, obsidian monoliths, deep-sea finale (`1.45x` speed) | Reef Sharks, Giant Squids, Neon Jellyfish, Reef Fish | **Kraken / Megalodon Guardian** |

## Running Locally

If you just want to play, head straight to **[thefroggit.netlify.app](https://www.google.com/search?q=https%3A%2F%2Fthefroggit.netlify.app%2F)** or open **[dist/froggit.html](https://www.google.com/search?q=dist%2Ffroggit.html)** directly in any browser—no server or install required.

To run or tweak the source code locally with hot reload:

```bash
git clone https://github.com/Mayank-CS50/Froggit.git
cd Froggit
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser. You can also serve the root folder with any simple static server (such as `npx serve .` or `python3 -m http.server 8080`).

## Project Structure & Technical Notes

Everything in the game—from the 3D models and textures to the sound effects—is generated in code so the entire build stays lightweight and self-contained.

| Path | What It Does |
| :--- | :--- |
| `index.html` | Main HTML shell, HUD overlays, and menu modals |
| `dist/froggit.html` | Self-contained single-file build for offline play |
| `src/main.js` | Main 60 FPS loop, hazard telegraphs, and controller polling |
| `src/state/gameState.js` | Game state, world definitions, skin unlocks, and `localStorage` saves |
| `src/entities/todeRig.js` | 3D Tode character rig, skin shaders, and target reticle |
| `src/entities/enemiesAndParticles.js` | Creature models, particle bursts, and row-90 guardian bosses |
| `src/world/courseBuilder.js` | 96-row terrain generation, elevation math, and instanced cliff walls |
| `src/gameplay/mechanicsAndModals.js` | Hopping physics, input buffering, tongue grapple, and knockback logic |
| `src/input/controls.js` | Keyboard, mouse raycasting, touch D-pad/swipe, and UI bindings |
| `src/ui/minimapAndWorldMap.js` | 2D minimap radar and 7-world progression map |
| `src/audio/ProceduralAudio.js` | Web Audio API sound synthesizer and 25 custom audio slots |
| `src/rendering/sceneAndShaders.js` | Three.js scene setup, lighting, fog, and procedural canvas textures |
| `docs/` | Additional notes on [Architecture](https://www.google.com/search?q=docs%2FARCHITECTURE.md), [Game Design](https://www.google.com/search?q=docs%2FGAME_DOCUMENTATION.md), and [Audio Slots](https://www.google.com/search?q=docs%2FAUDIO_SLOTS_GUIDE.md) |

### Custom Audio Overrides

By default, all music and sound effects are synthesized via the browser's Web Audio API. If you want to swap in your own `.mp3`, `.ogg`, or `.wav` files at runtime, use `window.registerFroggitAudio(slotName, url)`:

```javascript
window.registerFroggitAudio('bgm_ground_0F', '/assets/audio/meadow_theme.mp3');
window.registerFroggitAudio('sfx_tongue_whip', '/assets/audio/whip_crack.wav');
```

See [docs/AUDIO\_SLOTS\_GUIDE.md](https://www.google.com/search?q=docs%2FAUDIO_SLOTS_GUIDE.md) for the full list of 25 audio slots.

### Tech Stack & License

- **Built with**: Three.js (`r128`), Web Audio API, Vite (`5.4+`), and Tailwind CSS (`3.4`).
- **License**: Released under the [MIT License](https://www.google.com/search?q=LICENSE).
