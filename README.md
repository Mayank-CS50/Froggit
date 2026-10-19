# 🐸 Froggit — Sky and Abyss ([Play Live](https://thefroggit.netlify.app))

> **🎮 Playable Link:** [https://thefroggit.netlify.app/](https://thefroggit.netlify.app/)

**Froggit — Sky and Abyss** is a 3D voxel obstacle-course game for the browser. Hop as **Tode** across floating islands, hills, and ferries—and choose whether to ascend into the clouds or dive into the deep ocean trenches.

## 🌍 How It Works

When you start a run (or click the **🎬 Intro** button on the title screen), a **24-second 3D camera showcase** pans across the world, Tode's mechanics, and the biomes. Press **any key** or **click/tap** anytime to jump straight into gameplay:

1. **The Course**: Navigate a winding 96-row causeway of grass tiles, steep highland ramps, split-island forks, and moving ferries starting from the **🌿 Ground Meadow (`0F`)**.
2. **Pink Tongue & Lily-Posts (`👅` & `🪷`)**: Touching patrolling creatures directly is lethal, but you can whip your **pink tongue** (`Spacebar` or `Left-Click`) to snipe enemies mid-air for combos, reel in **✨ Golden Fireflies** (to unlock 5 frog skins), or latch onto **🪷 Grapple Lily-Posts** to zip across chasms.
3. **Knockback Traps & Checkpoints (`🚩`)**: **Bastion Cannons**, **Swinging Axes**, **Vertical Thwomps**, **Rolling Logs**, and **Sweepers** physically shove Tode a tile away—watch your footing near unfenced ledges! Cross glowing **🚩 Checkpoints** (Rows `28`, `56`, `78`) to save your spot and press `Enter ↵` to revive.
4. **Sky or Abyss (`☀️` vs `🌊`)**: At Row `90`, strike the **Realm Guardian** 3 times with your tongue to shatter its shields, then leap into a **Portal Hoop**:
   - **☀️ Sky Ascent**: Climb through **☁️ Sky Gardens (`+1`)** and **✨ Star Temple (`+2`)** to the **👑 Sun Crown (`+3`)**.
   - **🌊 Ocean Dive**: Plunge through **🐠 Coral Reef (`-1`)** and **🪼 Kelp Trench (`-2`)** to the **🌊 Mariana Abyss (`-3`)**.

## 🎮 Controls

| Action | Desktop | Mobile / Touch | Gamepad |
| :--- | :--- | :--- | :--- |
| **Hop (`↑ ↓ ← →`)** | `W A S D` or `Arrow Keys` | Bottom-Left **D-Pad** or **Swipe** | **D-Pad** / **Left Stick** |
| **Whip Tongue** | `Spacebar` or **Left-Click** | **`👅 WHIP`** Button or **Tap** | **`A` / `Cross`** or **`RT`** |
| **Revive at Checkpoint** | `Enter ↵` | Tap **`🚩 REVIVE`** Banner | **`A` / `Cross`** on Wipeout |
| **Skip 3D Intro** | **Any Key** or **Click** | **Tap Anywhere** | **Any Button** |
| **Toggle Music** | `M` or **Bottom-Left `🔊`** | **Bottom-Left `🔊`** | In-Game Settings |
| **Pause / Guide** | `Esc` / `H` (`?`) | Top-Right **⚙️** / **`?`** | **`Start`** |

## 🎵 Custom Background Music (Optional)

Drop non-copyrighted `.mp3` files into `assets/audio/` to override the built-in Web Audio synthesizer:

- `assets/audio/calm-theme.mp3` — Plays during normal exploration; stops on wipeout; restarts on revive.
- `assets/audio/celebration.mp3` — Plays on realm clear and the Victory Sanctuary finale.

## 🚀 Run Locally

- **Standalone Build**: Double-click `dist/froggit.html` in any browser (no server required).
- **Local Dev Server**:
  ```bash
  npm install && npm run dev
  # or: python3 -m http.server 8080
  ```

## 📜 Code of Conduct, Attribution & License

- **Tech Stack**: Three.js (`r128`), Tailwind CSS (`3.4`), HTML5 Canvas, and the Web Audio API (100% procedural 3D geometry, shaders, and synth audio—no copyrighted third-party assets).
- **Community & Code of Conduct**: Built in accordance with open-source community standards and fair-play guidelines.
- **Challenge Attribution & AI Disclosure**: Created by **Mayank-cs50** as an original entry for the [JetBrains Academy Build Your Game Challenge](https://www.google.com/search?q=https%3A%2F%2Facademy.jetbrains.com%2Fcourse%2F30327) with development assistance from JetBrains Junie and Google Gemini.
- **License**: Released under the [MIT License](https://www.google.com/search?q=.%2FLICENSE).
