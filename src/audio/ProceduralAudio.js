/**
 * Froggit — Sky and Abyss — Background Music (Calm Theme & Celebration Song) & Web Audio Synthesizer
 * File: src/audio/ProceduralAudio.js
 *
 * BGM Lifecycle Rules:
 *  1. Normal Play / Title / Story Intro -> Plays the Calm Theme Song (`bgm_calm_theme`).
 *  2. When Tode Dies -> Immediately STOPS the Calm Theme Song (`stopBgm()`).
 *  3. When Tode Revives / Retries / Starts New Run -> RESTARTS the Calm Theme Song from 0:00 (`restartCalmTheme()`).
 *  4. When Player Wins -> Plays the Celebration Song (`playCelebrationTheme()`).
 *
 * Drop your non-copyrighted audio files at:
 *  - ./assets/audio/calm-theme.mp3
 *  - ./assets/audio/celebration.mp3
 * Or register custom URLs/Data-URIs via `window.registerFroggitAudio('bgm_calm_theme', url)`.
 * If the external MP3 files are not found, a built-in Web Audio API polyphonic BGM sequencer
 * automatically plays a calm ambient melody and a joyful celebration fanfare!
 */
const AUDIO_CUSTOM_SLOTS = {
  // Primary User BGM Slots (Calm Theme & Celebration Song)
  bgm_calm_theme: './assets/audio/calm-theme.mp3',
  bgm_celebration: './assets/audio/celebration.mp3',

  // Legacy / Stage-Specific Optional Overrides (Fallback to bgm_calm_theme / bgm_celebration)
  bgm_landing_title: null,
  bgm_ground_0F: null,
  bgm_heaven_spire: null,
  bgm_ocean_abyss: null,
  bgm_boss_guardian: null,
  bgm_victory_dance: null,

  // Gameplay Action & Event SFX Slots
  sfx_hop: null,
  sfx_bounce_pad: null,
  sfx_tongue_whip: null,
  sfx_sticky_latch: null,
  sfx_swallow_combo: null,
  sfx_boss_shield_break: null,
  sfx_obstacle_knockback: null,
  sfx_cannon_fire: null,
  sfx_thwomp_slam: null,
  sfx_checkpoint_save: null,
  sfx_hoop_warp_fanfare: null,
  sfx_fall_whistle: null,
  sfx_defeat_wipeout: null,

  // Ambient, Hazard & UI Sound Slots
  amb_waterfall_river: null,
  amb_underwater_bubbles: null,
  sfx_axe_whoosh: null,
  sfx_log_rumble: null,
  sfx_ui_click: null,
  sfx_frog_ribbit_idle: null
};

window.AUDIO_CUSTOM_SLOTS = AUDIO_CUSTOM_SLOTS;
window.registerFroggitAudio = function(slotName, audioUrl) {
  if (slotName in AUDIO_CUSTOM_SLOTS) {
    AUDIO_CUSTOM_SLOTS[slotName] = audioUrl;
    if (window.froggitAudio) {
      window.froggitAudio.failedSlots.delete(slotName);
      window.froggitAudio.preloadSlot(slotName, audioUrl);
    }
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
    this.failedSlots = new Set();
    this.activeBgmAudio = null;
    this.activeBgmSlot = null;
    this.bgmState = 'stopped'; // 'calm' | 'celebration' | 'stopped'

    // Built-in Web Audio polyphonic BGM sequencer state (used when external MP3 isn't loaded yet)
    this.synthBgmTimer = null;
    this.synthStepIndex = 0;
    this.usingSynthBgmFallback = false;
  }

  preloadSlot(slotName, url) {
    if (!url) return;
    const el = new Audio();
    el.preload = 'auto';
    el.addEventListener('error', () => {
      this.failedSlots.add(slotName);
    });
    el.src = url;
    this.customAudioCache.set(slotName, el);
  }

  playCustomSfx(slotName, volumeScale = 1.0) {
    if (this.muted) return false;
    const url = AUDIO_CUSTOM_SLOTS[slotName];
    if (!url || this.failedSlots.has(slotName)) return false;
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

  // -------------------------------------------------------------------------
  // CORE BGM LIFECYCLE: CALM THEME, STOP ON DEATH, RESTART, CELEBRATION ON WIN
  // -------------------------------------------------------------------------
  stopSynthBgmLoop() {
    if (this.synthBgmTimer) {
      clearInterval(this.synthBgmTimer);
      this.synthBgmTimer = null;
    }
    this.usingSynthBgmFallback = false;
  }

  startSynthBgmLoop(mode = 'calm') {
    this.stopSynthBgmLoop();
    this.usingSynthBgmFallback = true;
    this.synthStepIndex = 0;

    // Calm acoustic marimba/harp-like pentatonic progression vs. joyful celebration fanfare loop
    const calmSequence = [
      { note: 261.63, bass: 130.81, dur: 0.42 }, // C4
      { note: 329.63, bass: 0,      dur: 0.38 }, // E4
      { note: 392.00, bass: 196.00, dur: 0.42 }, // G4
      { note: 440.00, bass: 0,      dur: 0.38 }, // A4
      { note: 392.00, bass: 146.83, dur: 0.42 }, // G4
      { note: 329.63, bass: 0,      dur: 0.38 }, // E4
      { note: 293.66, bass: 146.83, dur: 0.46 }, // D4
      { note: 261.63, bass: 0,      dur: 0.40 }, // C4
      { note: 329.63, bass: 164.81, dur: 0.42 }, // E4
      { note: 392.00, bass: 0,      dur: 0.38 }, // G4
      { note: 523.25, bass: 174.61, dur: 0.46 }, // C5
      { note: 440.00, bass: 0,      dur: 0.38 }, // A4
      { note: 392.00, bass: 196.00, dur: 0.42 }, // G4
      { note: 329.63, bass: 0,      dur: 0.38 }, // E4
      { note: 293.66, bass: 130.81, dur: 0.52 }, // D4
      { note: 0,      bass: 130.81, dur: 0.35 }  // Gentle breath
    ];

    const celebrationSequence = [
      { note: 523.25, bass: 261.63, dur: 0.22 }, // C5
      { note: 659.25, bass: 0,      dur: 0.22 }, // E5
      { note: 783.99, bass: 392.00, dur: 0.22 }, // G5
      { note: 1046.50,bass: 261.63, dur: 0.36 }, // C6
      { note: 783.99, bass: 0,      dur: 0.20 }, // G5
      { note: 1046.50,bass: 349.23, dur: 0.38 }, // C6
      { note: 880.00, bass: 220.00, dur: 0.24 }, // A5
      { note: 987.77, bass: 246.94, dur: 0.24 }, // B5
      { note: 1046.50,bass: 261.63, dur: 0.44 }, // C6
      { note: 783.99, bass: 196.00, dur: 0.24 }, // G5
      { note: 659.25, bass: 261.63, dur: 0.24 }, // E5
      { note: 523.25, bass: 130.81, dur: 0.38 }  // C5
    ];

    const seq = mode === 'celebration' ? celebrationSequence : calmSequence;
    const stepMs = mode === 'celebration' ? 240 : 460;

    const playStep = () => {
      if (this.muted || this.bgmState !== mode) return;
      this.init();
      if (!this.ctx || this.ctx.state !== 'running') return;

      const item = seq[this.synthStepIndex % seq.length];
      this.synthStepIndex = (this.synthStepIndex + 1) % seq.length;
      const now = this.ctx.currentTime;
      const vol = Math.max(0.0001, (mode === 'celebration' ? 0.11 : 0.075) * this.masterVolume * this.bgmVolume);

      if (item.note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = mode === 'celebration' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(item.note, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + item.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + item.dur + 0.02);
      }

      if (item.bass > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(item.bass, now);
        bGain.gain.setValueAtTime(0.0001, now);
        bGain.gain.linearRampToValueAtTime(vol * 0.65, now + 0.03);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + item.dur * 1.15);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + item.dur * 1.2);
      }
    };

    playStep();
    this.synthBgmTimer = setInterval(playStep, stepMs);
  }

  stopBgm() {
    this.bgmState = 'stopped';
    this.activeBgmSlot = null;
    this.stopSynthBgmLoop();
    if (this.activeBgmAudio) {
      try {
        this.activeBgmAudio.pause();
        this.activeBgmAudio.currentTime = 0;
      } catch (e) {}
      this.activeBgmAudio = null;
    }
  }

  playTrackSlot(slotName, modeLabel, forceRestart = false) {
    if (this.bgmState === modeLabel && this.activeBgmSlot === slotName && !forceRestart) {
      return;
    }

    if (this.activeBgmAudio && (this.activeBgmSlot !== slotName || forceRestart)) {
      try {
        this.activeBgmAudio.pause();
        this.activeBgmAudio.currentTime = 0;
      } catch (e) {}
      this.activeBgmAudio = null;
    }
    this.stopSynthBgmLoop();

    this.bgmState = modeLabel;
    this.activeBgmSlot = slotName;

    const url = AUDIO_CUSTOM_SLOTS[slotName];
    if (!url || this.failedSlots.has(slotName)) {
      this.startSynthBgmLoop(modeLabel);
      return;
    }

    try {
      const bgm = new Audio(url);
      bgm.loop = true;
      bgm.muted = this.muted;
      bgm.volume = Math.max(0, Math.min(1, this.masterVolume * this.bgmVolume));
      bgm.addEventListener('error', () => {
        this.failedSlots.add(slotName);
        if (this.bgmState === modeLabel) {
          this.startSynthBgmLoop(modeLabel);
        }
      });
      const playPromise = bgm.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // If file is missing or blocked, fall back cleanly to Web Audio BGM synth
          if (bgm.error) {
            this.failedSlots.add(slotName);
          }
          if (this.bgmState === modeLabel && !this.activeBgmAudio) {
            this.startSynthBgmLoop(modeLabel);
          }
        });
      }
      this.activeBgmAudio = bgm;
    } catch (e) {
      this.startSynthBgmLoop(modeLabel);
    }
  }

  playCalmTheme(forceRestart = false) {
    const slot = AUDIO_CUSTOM_SLOTS.bgm_ground_0F ? 'bgm_ground_0F' : 'bgm_calm_theme';
    this.playTrackSlot(slot, 'calm', forceRestart);
  }

  restartCalmTheme() {
    this.stopBgm();
    this.playCalmTheme(true);
  }

  playCelebrationTheme() {
    const slot = AUDIO_CUSTOM_SLOTS.bgm_victory_dance ? 'bgm_victory_dance' : 'bgm_celebration';
    this.playTrackSlot(slot, 'celebration', true);
  }

  syncStageBgm(floorLevel = 0, mode = 'PLAYING', isBossNear = false, isVictory = false, isDead = false) {
    if (isDead) {
      if (this.bgmState !== 'stopped') {
        this.stopBgm();
      }
      return;
    }
    if (isVictory) {
      if (this.bgmState !== 'celebration') {
        this.playCelebrationTheme();
      }
      return;
    }
    if (this.bgmState !== 'calm') {
      this.playCalmTheme(false);
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
    if (this.activeBgmAudio && this.activeBgmAudio.paused && !this.muted && this.bgmState !== 'stopped') {
      this.activeBgmAudio.play().catch(() => {});
    }
  }

  getEffectiveGain(baseGain) {
    if (this.muted) return 0;
    return Math.max(0.0001, baseGain * this.masterVolume * this.sfxVolume);
  }

  toggleMute() {
    this.muted = !this.muted;
    this.init();
    if (this.activeBgmAudio) {
      this.activeBgmAudio.muted = this.muted;
      if (!this.muted && this.activeBgmAudio.paused && this.bgmState !== 'stopped') {
        this.activeBgmAudio.play().catch(() => {});
      }
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
