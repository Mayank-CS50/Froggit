# 🔊 THE FROGGIT — 25-Slot Custom Audio Integration Guide

**THE FROGGIT** includes a hybrid audio architecture (`src/audio/ProceduralAudio.js`):
- By default, all 25 audio slots fall back to zero-latency **Web Audio API procedural synthesis** (zero external audio files needed).
- At any time, you can populate any slot in `AUDIO_CUSTOM_SLOTS` or call `window.registerFroggitAudio(slotName, url)` to override specific music loops or sound effects with custom `.mp3`, `.ogg`, or `.wav` assets.

## Runtime Registration API

```javascript
// Register a single custom track or SFX at runtime:
window.registerFroggitAudio('bgm_ground_0F', './assets/audio/meadow_loop.mp3');
window.registerFroggitAudio('sfx_tongue_whip', './assets/audio/tongue_whip.wav');
```

## Complete 25-Slot Reference Table

| # | Slot Name | Category | Recommended Duration & Style |
| :-: | :--- | :--- | :--- |
| 1 | `bgm_landing_title` | BGM Loop | `45–90s` seamless loop; upbeat voxel adventure overture |
| 2 | `bgm_ground_0F` | BGM Loop | `60–120s` seamless loop; bright acoustic/marimba meadow rhythm |
| 3 | `bgm_heaven_spire` | BGM Loop | `60–120s` seamless loop; airy celesta, harp & synth arpeggios |
| 4 | `bgm_ocean_abyss` | BGM Loop | `60–120s` seamless loop; deep aquatic pads & marimba plucks |
| 5 | `bgm_boss_guardian` | BGM Loop | `45–90s` seamless loop; driving 140 BPM boss encounter theme |
| 6 | `bgm_victory_dance` | BGM Loop | `30–60s` celebratory brass & chiptune dance fanfare |
| 7 | `sfx_hop` | Action SFX | `120–180ms` organic plucky hop |
| 8 | `sfx_bounce_pad` | Action SFX | `220–300ms` springy boing launch |
| 9 | `sfx_tongue_whip` | Action SFX | `100–140ms` elastic whip snap |
| 10 | `sfx_sticky_latch` | Action SFX | `60–90ms` wet sticky pop |
| 11 | `sfx_swallow_combo` | Action SFX | `250–350ms` gulp + bright chime |
| 12 | `sfx_boss_shield_break` | Combat SFX | `350–450ms` crystal shatter + power chord |
| 13 | `sfx_obstacle_knockback` | Hazard SFX | `120–180ms` wooden/stone thud bonk |
| 14 | `sfx_cannon_fire` | Hazard SFX | `300–450ms` punchy bastion cannon blast |
| 15 | `sfx_thwomp_slam` | Hazard SFX | `350–500ms` heavy stone monolith impact |
| 16 | `sfx_checkpoint_save` | Event SFX | `400–600ms` ascending 3-note flag fanfare |
| 17 | `sfx_hoop_warp_fanfare` | Event SFX | `1.2–1.8s` portal warp celebration |
| 18 | `sfx_fall_whistle` | Defeat SFX | `1.0–1.2s` descending cartoon cliff fall whistle |
| 19 | `sfx_defeat_wipeout` | Defeat SFX | `1.0–1.2s` low brass/synth wipeout slide |
| 20 | `amb_waterfall_river` | Ambient Loop | `30–60s` rushing stream & birdsong loop |
| 21 | `amb_underwater_bubbles` | Ambient Loop | `30–60s` deep reef bubble vent loop |
| 22 | `sfx_axe_whoosh` | Hazard SFX | `150–220ms` heavy metallic pendulum blade whoosh |
| 23 | `sfx_log_rumble` | Hazard SFX | `400–800ms` rolling timber log clatter |
| 24 | `sfx_ui_click` | UI SFX | `40–60ms` crisp tactile UI button tick |
| 25 | `sfx_frog_ribbit_idle` | Character SFX | `180–260ms` cute dual-pulse frog croak |
