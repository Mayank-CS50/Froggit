/**
 * THE FROGGIT — 25-Slot Custom Audio Registry & Web Audio Synthesizer
 * File: src/audio/ProceduralAudio.js
 */
// =========================================================================
// 1. PROCEDURAL WEB AUDIO SYNTHESIZER WITH REAL VOLUME & MUTE CONTROLS
// =========================================================================
// =========================================================================
// 1A. CUSTOM MUSIC & SFX HOOK REGISTRY ("AUDIO LOOPHOLES")
//     Drop any external .mp3 / .ogg / .wav URL or base64 data URI into
//     AUDIO_CUSTOM_SLOTS below (or call window.registerFroggitAudio(slot, url)).
//     Whenever a slot is non-null, ProceduralAudio plays your custom track/SFX;
//     when null, it seamlessly falls back to the built-in Web Audio synth!
// =========================================================================
const AUDIO_CUSTOM_SLOTS = {
  // --- Background Music (BGM) Loop Slots ---
  bgm_landing_title: null,   // Hook 1: Title Screen & Hero Diorama ambient loop
  bgm_ground_0F: null,       // Hook 2: 0F Ground Meadow main stage music loop
  bgm_heaven_spire: null,    // Hook 3: +1F / +2F / +3F Sky & Heaven Spire music loop
  bgm_ocean_abyss: null,     // Hook 4: -1F / -2F / -3F Coral Reef & Mariana Abyss music loop
  bgm_boss_guardian: null,   // Hook 5: Row 82..94 Floor Guardian Boss proximity theme
  bgm_victory_dance: null,   // Hook 6: +3F / -3F Apex Victory Celebration dance loop

  // --- Gameplay Action & Event SFX Slots ---
  sfx_hop: null,             // Hook 7: Tode directional tile hop (attemptHop)
  sfx_bounce_pad: null,      // Hook 8: Spring Bounce Pad 2-row launch boost
  sfx_tongue_whip: null,     // Hook 9: Electric indigo tongue grapple fire (fireTongueGrapple)
  sfx_sticky_latch: null,    // Hook 10: Tongue tip latches onto bug mid-air
  sfx_swallow_combo: null,   // Hook 11: Bug devoured + combo multiplier chime (onSwallowBee)
  sfx_boss_shield_break: null, // Hook 12: Guardian Boss crystal shield shattered
  sfx_obstacle_knockback: null, // Hook 13: Sweeper / Push-Block / Cannon / Axe / Thwomp / Log shove
  sfx_cannon_fire: null,     // Hook 14: Side Bastion Cannon muzzle blast
  sfx_thwomp_slam: null,     // Hook 15: Vertical Thwomp Monolith ground impact
  sfx_checkpoint_save: null, // Hook 16: First-time Checkpoint Overlook reached (Rows 28, 56, 78)
  sfx_hoop_warp_fanfare: null, // Hook 17: Jumping into Row 94 Portal Hoop iris transition
  sfx_fall_whistle: null,    // Hook 18: Falling into chasm / off unfenced ledge
  sfx_defeat_wipeout: null,  // Hook 19: Lethal enemy hit / wipeout slide

  // --- Bonus Ambient, Hazard & UI Sound Slots ---
  amb_waterfall_river: null,   // Hook 20: Ground Meadow rushing waterfall & birdsong ambient loop
  amb_underwater_bubbles: null,// Hook 21: Ocean Abyss deep coral bubble vent ambient loop
  sfx_axe_whoosh: null,        // Hook 22: Swinging pendulum battle-axe air slice whoosh
  sfx_log_rumble: null,        // Hook 23: Rolling spiked timber log clatter
  sfx_ui_click: null,          // Hook 24: Tactile UI button & D-pad click
  sfx_frog_ribbit_idle: null   // Hook 25: Cute mascot frog ribbit / croak
};

window.AUDIO_CUSTOM_SLOTS = AUDIO_CUSTOM_SLOTS;
window.registerFroggitAudio = function(slotName, audioUrl) {
  if (slotName in AUDIO_CUSTOM_SLOTS) {
    AUDIO_CUSTOM_SLOTS[slotName] = audioUrl;
    if (window.froggitAudio) window.froggitAudio.preloadSlot(slotName, audioUrl);
  }
};

class ProceduralAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.80;
    this.sfxVolume = 1.00;
    this.bgmVolume = 0.65;
    this.customAudioCache = new Map();
    this.activeBgmAudio = null;
    this.activeBgmSlot = null;
  }

  preloadSlot(slotName, url) {
    if (!url) return;
    const el = new Audio(url);
    el.preload = 'auto';
    this.customAudioCache.set(slotName, el);
  }

  playCustomSfx(slotName, volumeScale = 1.0) {
    if (this.muted) return false;
    const url = AUDIO_CUSTOM_SLOTS[slotName];
    if (!url) return false;
    try {
      let baseEl = this.customAudioCache.get(slotName);
      if (!baseEl) {
        baseEl = new Audio(url);
        this.customAudioCache.set(slotName, baseEl);
      }
      const clone = baseEl.cloneNode();
      clone.volume = Math.max(0, Math.min(1, this.masterVolume * this.sfxVolume * volumeScale));
      clone.play().catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  }

  switchBgmSlot(slotName) {
    if (this.activeBgmSlot === slotName) return;
    this.activeBgmSlot = slotName;
    if (this.activeBgmAudio) {
      this.activeBgmAudio.pause();
      this.activeBgmAudio = null;
    }
    const url = AUDIO_CUSTOM_SLOTS[slotName];
    if (!url || this.muted) return;
    try {
      const bgm = new Audio(url);
      bgm.loop = true;
      bgm.volume = Math.max(0, Math.min(1, this.masterVolume * this.bgmVolume));
      bgm.play().catch(() => {});
      this.activeBgmAudio = bgm;
    } catch (e) {}
  }

  syncStageBgm(floorLevel = 0, mode = "PLAYING", isBossNear = false, isVictory = false) {
    if (mode === "LANDING") {
      this.switchBgmSlot("bgm_landing_title");
    } else if (isVictory) {
      this.switchBgmSlot("bgm_victory_dance");
    } else if (isBossNear && AUDIO_CUSTOM_SLOTS.bgm_boss_guardian) {
      this.switchBgmSlot("bgm_boss_guardian");
    } else if (floorLevel > 0) {
      this.switchBgmSlot("bgm_heaven_spire");
    } else if (floorLevel < 0) {
      this.switchBgmSlot("bgm_ocean_abyss");
    } else {
      this.switchBgmSlot("bgm_ground_0F");
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getEffectiveGain(baseGain) {
    if (this.muted) return 0;
    return Math.max(0.0001, baseGain * this.masterVolume * this.sfxVolume);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.activeBgmAudio) {
      this.activeBgmAudio.muted = this.muted;
    }
    return this.muted;
  }

  setMasterVolume(val0to100) {
    this.masterVolume = Math.max(0, Math.min(1, val0to100 / 100));
    if (this.activeBgmAudio) {
      this.activeBgmAudio.volume = Math.max(0, Math.min(1, this.masterVolume * this.bgmVolume));
    }
  }

  setSfxVolume(val0to100) {
    this.sfxVolume = Math.max(0, Math.min(1, val0to100 / 100));
  }

  playHop(scaleMultiplier = 1, isBounce = false) {
    if (this.playCustomSfx(isBounce ? 'sfx_bounce_pad' : 'sfx_hop')) return;
    const peak = this.getEffectiveGain(0.16);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = (isBounce ? 240 : 180) / Math.pow(scaleMultiplier, 0.35);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.05, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.18);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  playTongueWhip() {
    if (this.playCustomSfx('sfx_tongue_whip')) return;
    const peak = this.getEffectiveGain(0.15);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.085);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playStickyPop() {
    if (this.playCustomSfx('sfx_sticky_latch')) return;
    const peak = this.getEffectiveGain(0.20);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.055);
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playSwallowAndChime(combo = 1, isShieldBreak = false) {
    if (this.playCustomSfx(isShieldBreak ? 'sfx_boss_shield_break' : 'sfx_swallow_combo')) return;
    const gulpPeak = this.getEffectiveGain(0.24);
    const chimePeak = this.getEffectiveGain(0.18);
    if (gulpPeak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const gulpOsc = this.ctx.createOscillator();
    const gulpGain = this.ctx.createGain();
    gulpOsc.type = 'sine';
    gulpOsc.frequency.setValueAtTime(290, now);
    gulpOsc.frequency.exponentialRampToValueAtTime(88, now + 0.14);
    gulpGain.gain.setValueAtTime(gulpPeak, now);
    gulpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    gulpOsc.connect(gulpGain);
    gulpGain.connect(this.ctx.destination);
    gulpOsc.start(now);
    gulpOsc.stop(now + 0.17);

    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const noteFreq = pentatonic[Math.min(combo - 1, pentatonic.length - 1)];

    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chimeOsc.type = 'triangle';
    chimeOsc.frequency.setValueAtTime(noteFreq, now + 0.04);
    chimeOsc.frequency.exponentialRampToValueAtTime(noteFreq * 1.015, now + 0.28);
    chimeGain.gain.setValueAtTime(0.0001, now + 0.04);
    chimeGain.gain.linearRampToValueAtTime(chimePeak, now + 0.06);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);
    chimeOsc.start(now + 0.04);
    chimeOsc.stop(now + 0.35);
  }

  playBonk() {
    if (this.playCustomSfx('sfx_obstacle_knockback')) return;
    const peak = this.getEffectiveGain(0.14);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.11);
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playFallWhistle() {
    if (this.playCustomSfx('sfx_fall_whistle')) return;
    const peak = this.getEffectiveGain(0.18);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(115, now + 1.15);
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  playDefeatSlide() {
    if (this.playCustomSfx('sfx_defeat_wipeout')) return;
    const peak = this.getEffectiveGain(0.20);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(98, now + 1.05);
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.12);
  }

  playCheckpointChime() {
    if (this.playCustomSfx('sfx_checkpoint_save')) return;
    const peak = this.getEffectiveGain(0.18);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 880.0, 1174.66];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const t0 = now + i * 0.065;
      osc.frequency.setValueAtTime(f, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.36);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.38);
    });
  }

  playStartHorn() {
    const peak = this.getEffectiveGain(0.14);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      gain.gain.setValueAtTime(0.0001, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(peak, now + i * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.42);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.45);
    });
  }

  playPortalChord(isSky = true) {
    const peak = this.getEffectiveGain(0.11);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = isSky ? [523.25, 659.25, 783.99, 1046.5] : [220.0, 277.18, 329.63, 440.0];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(peak, now + idx * 0.05 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.55);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.58);
    });
  }

  playUiClick() {
    if (this.playCustomSfx('sfx_ui_click', 0.7)) return;
    const peak = this.getEffectiveGain(0.09);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.045);
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  playAxeWhoosh() {
    if (this.playCustomSfx('sfx_axe_whoosh', 0.65)) return;
    const peak = this.getEffectiveGain(0.08);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(72, now + 0.16);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playFrogRibbit() {
    if (this.playCustomSfx('sfx_frog_ribbit_idle', 0.85)) return;
    const peak = this.getEffectiveGain(0.14);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.11].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const t0 = now + offset;
      osc.frequency.setValueAtTime(idx === 0 ? 145 : 175, t0);
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 230 : 290, t0 + 0.075);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.095);
    });
  }

  playCourseClearFanfare(isSky = true) {
    if (this.playCustomSfx('sfx_hoop_warp_fanfare')) return;
    const peak = this.getEffectiveGain(0.16);
    if (peak <= 0.0002) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = isSky
      ? [523.25, 659.25, 783.99, 1046.50, 987.77, 1174.66, 1318.51]
      : [392.00, 440.00, 523.25, 659.25, 587.33, 659.25, 783.99];
    melody.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === melody.length - 1 ? 'triangle' : 'sine';
      const t0 = now + idx * 0.075;
      const dur = idx === melody.length - 1 ? 0.52 : 0.16;
      osc.frequency.setValueAtTime(f, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    });
  }
}

const audio = new ProceduralAudio();
window.froggitAudio = audio;

