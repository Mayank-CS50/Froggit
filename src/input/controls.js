/**
 * Froggit — Sky and Abyss — Keyboard, Mouse Raycaster, Touch D-Pad/Swipe & Modal Event Listeners
 * File: src/input/controls.js
 */
// =========================================================================
// 12. INPUT & UI EVENT LISTENERS (Keyboard, Mouse, Touch Swipe/Tap, Modals)
// =========================================================================
window.addEventListener('keydown', (e) => {
  if (state.mode === 'STORY_INTRO' && !isAnyModalOpen()) {
    if (e.code === 'Escape') {
      e.preventDefault();
      audio.playUiClick();
      finishStoryIntroAndPlay();
      return;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      e.preventDefault();
      advanceStoryIntroStep();
      return;
    }
    if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && state.storyIntroStep > 0) {
      e.preventDefault();
      state.storyIntroStep -= 1;
      state.storyIntroStepTimer = 0;
      setupStoryIntroBeatScene(state.storyIntroStep);
      renderStoryIntroStepUI();
      return;
    }
    return;
  }

  if (e.code === 'KeyM' && document.activeElement !== document.getElementById('input-player-name')) {
    e.preventDefault();
    audio.toggleMute();
    persistSettings();
    syncSettingsModalUI();
    return;
  }

  if (e.code === 'Escape') {
    e.preventDefault();
    const lbModal = document.getElementById('leaderboard-modal');
    const mapModal = document.getElementById('map-modal');

    // If Full Leaderboard is open, return to Settings
    if (lbModal && !lbModal.classList.contains('hidden')) {
      lbModal.classList.add('hidden');
      lbModal.classList.remove('flex');
      const pm = document.getElementById('pause-modal');
      pm.classList.remove('hidden');
      pm.classList.add('flex');
      document.getElementById('btn-view-full-leaderboard').focus();
      return;
    }

    const howtoModal = document.getElementById('howto-modal');
    if (howtoModal && !howtoModal.classList.contains('hidden')) {
      closeAllModals(true);
      return;
    }

    // If World Map is open, close it and restore state
    if (mapModal && !mapModal.classList.contains('hidden')) {
      closeAllModals(true);
      return;
    }

    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal && !pauseModal.classList.contains('hidden')) {
      closeAllModals(true);
    } else if (state.mode === 'PLAYING' || state.mode === 'TRANSITION_TO_PLAY') {
      openSettingsModal();
    }
    return;
  }

  // Instant Enter-to-Revive at Last Checkpoint whenever Tode has died or Elimination Scorecard is open
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    const scorecardEl = document.getElementById('scorecard-modal');
    const isScorecardOpen = scorecardEl && !scorecardEl.classList.contains('hidden');
    if (state.defeated || state.fallingDeath || isScorecardOpen) {
      e.preventDefault();
      reviveAtLastCheckpoint();
      return;
    }
  }

  // Allow pressing [H] or [?] to open/close the How to Play Guide
  if ((e.code === 'KeyH' || e.key === '?') && document.activeElement !== document.getElementById('input-player-name')) {
    e.preventDefault();
    const howtoModal = document.getElementById('howto-modal');
    if (howtoModal && !howtoModal.classList.contains('hidden')) {
      closeAllModals(true);
    } else {
      openHowToPlayModal();
    }
    return;
  }

  // Strictly block gameplay inputs when paused, in hoop transition, or any modal is open
  if (state.mode !== 'PLAYING' || state.hoopTransitionActive || isAnyModalOpen()) return;

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
    e.preventDefault();
  }
  if (e.code === 'ArrowUp' || e.code === 'KeyW') attemptHop(0, 1);
  else if (e.code === 'ArrowDown' || e.code === 'KeyS') attemptHop(0, -1);
  else if (e.code === 'ArrowLeft' || e.code === 'KeyA') attemptHop(-1, 0);
  else if (e.code === 'ArrowRight' || e.code === 'KeyD') attemptHop(1, 0);
  else if (e.code === 'Space' || e.code === 'Enter') fireTongueGrapple();
});

// Pointer / Touch Gesture Support on 3D Canvas (Tap to Tongue-Grapple, Swipe to Hop on Touch Devices)
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.0);
let pointerDownPos = null;

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (state.mode !== 'PLAYING' || isAnyModalOpen() || state.defeated || state.fallingDeath) return;
  pointerDownPos = { x: e.clientX, y: e.clientY, pointerType: e.pointerType };
  if (e.pointerType !== 'touch') {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    const hitPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, hitPoint);
    fireTongueGrapple(hitPoint);
  }
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (!pointerDownPos || pointerDownPos.pointerType !== 'touch') {
    pointerDownPos = null;
    return;
  }
  if (state.mode !== 'PLAYING' || isAnyModalOpen() || state.defeated || state.fallingDeath) {
    pointerDownPos = null;
    return;
  }
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  pointerDownPos = null;

  if (Math.hypot(dx, dy) > 28) {
    if (Math.abs(dx) > Math.abs(dy)) {
      attemptHop(dx > 0 ? 1 : -1, 0);
    } else {
      attemptHop(0, dy < 0 ? 1 : -1);
    }
  } else {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    const hitPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, hitPoint);
    fireTongueGrapple(hitPoint);
  }
});

// Mobile Touch D-Pad, Pink Tongue Grapple & Orientation / Fullscreen Controls
function triggerHapticPulse(ms = 12) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {}
}

const bindTouchHop = (btnId, dx, dz) => {
  const el = document.getElementById(btnId);
  if (!el) return;
  el.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    triggerHapticPulse(10);
    attemptHop(dx, dz);
  });
};
bindTouchHop('btn-touch-up', 0, 1);
bindTouchHop('btn-touch-down', 0, -1);
bindTouchHop('btn-touch-left', -1, 0);
bindTouchHop('btn-touch-right', 1, 0);

const btnTouchTongue = document.getElementById('btn-touch-tongue');
if (btnTouchTongue) {
  btnTouchTongue.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    triggerHapticPulse(18);
    fireTongueGrapple();
  });
}

const btnTouchOrient = document.getElementById('btn-touch-orient');
if (btnTouchOrient) {
  btnTouchOrient.addEventListener('click', async (ev) => {
    ev.stopPropagation();
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation && screen.orientation.lock) {
        const curType = screen.orientation.type || '';
        const nextLock = curType.includes('portrait') ? 'landscape' : 'portrait';
        await screen.orientation.lock(nextLock);
      }
    } catch (err) {
      // Fallback: toggle camera zoom overview mode on mobile browsers that restrict orientation lock
      state.mobileWideView = !state.mobileWideView;
      const lbl = document.getElementById('touch-orient-label');
      if (lbl) lbl.textContent = state.mobileWideView ? 'Wide FOV' : 'Standard';
    }
  });
}

document.getElementById('btn-random-name').addEventListener('click', () => {
  const pick = NICKNAME_POOL[Math.floor(Math.random() * NICKNAME_POOL.length)];
  state.playerName = pick;
  document.getElementById('input-player-name').value = pick;
});

document.getElementById('btn-start-play').addEventListener('click', () => {
  startPlayFromLanding(0);
});

document.getElementById('btn-landing-map').addEventListener('click', () => {
  state.previousModeBeforePause = state.mode;
  renderCrossSectionMap();
  const m = document.getElementById('map-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
});

document.getElementById('btn-landing-options').addEventListener('click', () => {
  openSettingsModal();
});

document.getElementById('btn-hud-pause').addEventListener('click', () => {
  openSettingsModal();
});

document.getElementById('btn-hud-map').addEventListener('click', () => {
  if (state.mode !== 'PAUSED') {
    state.previousModeBeforePause = state.mode;
  }
  if (state.mode === 'PLAYING' || state.mode === 'TRANSITION_TO_PLAY') {
    state.mode = 'PAUSED';
  }
  renderCrossSectionMap();
  const m = document.getElementById('map-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
});

document.getElementById('btn-close-map').addEventListener('click', () => {
  closeAllModals(true);
});

document.getElementById('btn-resume-game').addEventListener('click', () => {
  closeAllModals(true);
});

// Audio Settings Controls (Mute + Master Volume + SFX Volume)
document.getElementById('btn-option-audio').addEventListener('click', () => {
  audio.toggleMute();
  persistSettings();
  syncSettingsModalUI();
  if (!audio.muted) audio.playStickyPop();
});

document.getElementById('slider-master-vol').addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  audio.setMasterVolume(val);
  if (val > 0 && audio.muted) audio.muted = false;
  persistSettings();
  syncSettingsModalUI();
});

document.getElementById('slider-sfx-vol').addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  audio.setSfxVolume(val);
  if (val > 0 && audio.muted) audio.muted = false;
  persistSettings();
  syncSettingsModalUI();
});

// How to Play Guide Listeners (Open & Shut Down Anytime)
document.getElementById('btn-landing-howto').addEventListener('click', openHowToPlayModal);
document.getElementById('btn-hud-howto').addEventListener('click', openHowToPlayModal);
document.getElementById('btn-open-howto-from-pause').addEventListener('click', openHowToPlayModal);
document.getElementById('btn-hud-howto-expand').addEventListener('click', openHowToPlayModal);

document.getElementById('btn-hud-howto-dismiss').addEventListener('click', () => {
  state.showHudGuide = false;
  persistSettings();
  syncHudGuideCardVisibility();
});

document.getElementById('btn-toggle-hud-helper').addEventListener('click', () => {
  state.showHudGuide = !state.showHudGuide;
  persistSettings();
  syncHudGuideCardVisibility();
});

document.getElementById('btn-close-howto-top').addEventListener('click', () => {
  closeAllModals(true);
});
document.getElementById('btn-close-howto-bottom').addEventListener('click', () => {
  closeAllModals(true);
});

// Gameplay Collision Rule Toggle
document.getElementById('btn-option-lethal').addEventListener('click', () => {
  state.lethalOneHitMode = !state.lethalOneHitMode;
  state.hearts = state.lethalOneHitMode ? 1 : 3;
  persistSettings();
  syncSettingsModalUI();
  updateHUD();
});

// View Full Leaderboard Link & Back to Settings
document.getElementById('btn-view-full-leaderboard').addEventListener('click', () => {
  renderLeaderboardUI();
  document.getElementById('pause-modal').classList.add('hidden');
  document.getElementById('pause-modal').classList.remove('flex');
  const lb = document.getElementById('leaderboard-modal');
  lb.classList.remove('hidden');
  lb.classList.add('flex');
  document.getElementById('btn-close-leaderboard').focus();
});

document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
  document.getElementById('leaderboard-modal').classList.add('hidden');
  document.getElementById('leaderboard-modal').classList.remove('flex');
  const pm = document.getElementById('pause-modal');
  pm.classList.remove('hidden');
  pm.classList.add('flex');
  document.getElementById('btn-view-full-leaderboard').focus();
});

// Restart Floor with Confirmation before discarding active progress
document.getElementById('btn-option-Restart').addEventListener('click', () => {
  if (state.previousModeBeforePause === 'LANDING') {
    startPlayFromLanding(state.floorLevel);
    closeAllModals(false);
    return;
  }
  const hasProgress = state.gridZ > 0 || state.score > 0 || state.beesEaten > 0;
  const confirmBar = document.getElementById('restart-confirm-bar');
  if (hasProgress && confirmBar && confirmBar.classList.contains('hidden')) {
    confirmBar.classList.remove('hidden');
    confirmBar.classList.add('flex');
    document.getElementById('btn-confirm-restart-yes').focus();
  } else {
    transitionToFloor(state.floorLevel, true);
  }
});

document.getElementById('btn-confirm-restart-yes').addEventListener('click', () => {
  transitionToFloor(state.floorLevel, true);
});

document.getElementById('btn-confirm-restart-no').addEventListener('click', () => {
  const confirmBar = document.getElementById('restart-confirm-bar');
  confirmBar.classList.add('hidden');
  confirmBar.classList.remove('flex');
  document.getElementById('btn-option-Restart').focus();
});

function returnToLandingScreen() {
  closeAllModals(false);
  hideDeathReviveBanner();
  const storyOverlay = document.getElementById('story-intro-overlay');
  if (storyOverlay) {
    storyOverlay.classList.add('hidden');
    storyOverlay.classList.remove('flex');
  }
  document.body.classList.remove('is-playing-touch');
  state.mode = 'LANDING';
  state.previousModeBeforePause = 'LANDING';
  state.defeated = false;
  state.fallingDeath = false;
  const wasVictory = state.victoryCelebrationActive;
  state.victoryCelebrationActive = false;
  state.gridX = 0;
  state.gridZ = 0;
  if (wasVictory || state.floorLevel !== 0) {
    state.floorLevel = 0;
    buildRoadwayWorld();
    populateRoadwayBees();
  }
  audio.restartCalmTheme();
  todeRoot.position.set(0.65, 0, 0.35);
  todeRoot.rotation.set(0, -0.38, 0);
  state.targetYaw = -0.38;
  state.currentYaw = -0.38;
  document.getElementById('gameplay-hud').classList.add('hidden');
  const ls = document.getElementById('landing-screen');
  ls.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  renderLeaderboardUI();
}

document.getElementById('btn-return-landing').addEventListener('click', returnToLandingScreen);

document.getElementById('btn-open-map-from-pause').addEventListener('click', () => {
  document.getElementById('pause-modal').classList.add('hidden');
  document.getElementById('pause-modal').classList.remove('flex');
  renderCrossSectionMap();
  const m = document.getElementById('map-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
});

document.getElementById('btn-scorecard-retry').addEventListener('click', () => {
  transitionToFloor(state.floorLevel, true);
});

document.getElementById('btn-scorecard-continue').addEventListener('click', reviveAtLastCheckpoint);
const btnBannerRevive = document.getElementById('btn-banner-revive-enter');
if (btnBannerRevive) {
  btnBannerRevive.addEventListener('click', reviveAtLastCheckpoint);
}

document.getElementById('btn-scorecard-map').addEventListener('click', () => {
  document.getElementById('scorecard-modal').classList.add('hidden');
  document.getElementById('scorecard-modal').classList.remove('flex');
  renderCrossSectionMap();
  const m = document.getElementById('map-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
});

document.getElementById('btn-scorecard-home').addEventListener('click', returnToLandingScreen);

document.getElementById('btn-victory-replay').addEventListener('click', () => {
  transitionToFloor(0, true);
});
document.getElementById('btn-victory-map').addEventListener('click', () => {
  document.getElementById('victory-modal').classList.add('hidden');
  document.getElementById('victory-modal').classList.remove('flex');
  renderCrossSectionMap();
  const m = document.getElementById('map-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
});
document.getElementById('btn-victory-home').addEventListener('click', returnToLandingScreen);


// Left-Corner Circular Music Toggle Button & 3D Story Intro Buttons
const btnCornerMusic = document.getElementById('btn-corner-music-toggle');
if (btnCornerMusic) {
  btnCornerMusic.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.toggleMute();
    persistSettings();
    syncSettingsModalUI();
    if (!audio.muted) audio.playStickyPop();
  });
}

const btnStoryNext = document.getElementById('btn-story-intro-next');
if (btnStoryNext) {
  btnStoryNext.addEventListener('click', (e) => {
    e.stopPropagation();
    advanceStoryIntroStep();
  });
}

const btnStorySkip = document.getElementById('btn-story-intro-skip');
if (btnStorySkip) {
  btnStorySkip.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.playUiClick();
    finishStoryIntroAndPlay();
  });
}

const btnReplayStory = document.getElementById('btn-landing-story');
if (btnReplayStory) {
  btnReplayStory.addEventListener('click', () => {
    state.storyIntroSeen = false;
    startPlayFromLanding(0, true);
  });
}
