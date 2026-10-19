function syncCornerMusicButtonUI() {
  const cornerBtn = document.getElementById('btn-corner-music-toggle');
  const iconOn = document.getElementById('icon-corner-music-on');
  const iconOff = document.getElementById('icon-corner-music-off');
  if (!cornerBtn) return;
  cornerBtn.setAttribute('aria-pressed', String(!audio.muted));
  cornerBtn.title = audio.muted ? 'Unmute Music & Audio [M]' : 'Mute Music & Audio [M]';
  if (audio.muted) {
    cornerBtn.classList.add('is-muted');
    if (iconOn) iconOn.classList.add('hidden');
    if (iconOff) iconOff.classList.remove('hidden');
  } else {
    cornerBtn.classList.remove('is-muted');
    if (iconOn) iconOn.classList.remove('hidden');
    if (iconOff) iconOff.classList.add('hidden');
  }
}

/**
 * Froggit — Sky and Abyss — Core Hopping, Forward-Only Tongue Grapple, Knockback & Modal Flows
 * File: src/gameplay/mechanicsAndModals.js
 */
// =========================================================================
// 11. CORE HOPPING, DIRECTIONAL FACING, FALLING DEATH & TONGUE GRAPPLE
// =========================================================================
function updateHUD() {
  ensurePlayerName();
  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
  document.getElementById('hud-realm-badge').textContent = `${floorCfg.icon} ${floorCfg.name}`;
  document.getElementById('hud-player-tag').textContent = state.playerName;
  document.getElementById('hud-score').textContent = state.score.toLocaleString();

  const cpBadge = document.getElementById('hud-checkpoint-badge');
  if (cpBadge) {
    if (state.lastCheckpointZ >= 24) {
      const cpIdx = CHECKPOINT_ROWS.indexOf(state.lastCheckpointZ) + 1;
      cpBadge.textContent = `🚩 SAVED ${cpIdx > 0 ? '#' + cpIdx : ''}`;
      cpBadge.className = 'font-mono-num text-[10px] font-extrabold uppercase tracking-wider text-amber-200 bg-amber-500/25 px-2 py-0.5 rounded-md border border-amber-400/50';
    } else {
      cpBadge.textContent = '🚩 START';
      cpBadge.className = 'font-mono-num text-[10px] font-bold uppercase tracking-wider text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-400/35';
    }
  }

  const heartsBadge = document.getElementById('hud-hearts-badge');
  if (heartsBadge) {
    if (!state.lethalOneHitMode) {
      heartsBadge.classList.remove('hidden');
      heartsBadge.textContent = `${'❤️'.repeat(Math.max(1, state.hearts))}`;
    } else {
      heartsBadge.classList.add('hidden');
    }
  }

  const mmFloor = document.getElementById('minimap-floor-code');
  const mmRow = document.getElementById('minimap-row-readout');
  const mmFill = document.getElementById('minimap-progress-fill');
  const pct = Math.min(100, Math.max(0, Math.round((state.gridZ / ROADWAY_LENGTH) * 100)));
  if (mmFloor) mmFloor.textContent = floorCfg.icon;
  if (mmRow) mmRow.textContent = `${pct}%`;
  if (mmFill) mmFill.style.width = `${pct}%`;
  renderSkinSelectorUI();
}

function syncHudGuideCardVisibility() {
  const card = document.getElementById('hud-howto-card');
  if (card) {
    if (state.showHudGuide) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  }
  const dot = document.getElementById('hud-helper-status-dot');
  const lbl = document.getElementById('hud-helper-status-label');
  if (dot && lbl) {
    if (state.showHudGuide) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      lbl.textContent = 'On-Screen Quick Guide: ON';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-slate-500';
      lbl.textContent = 'On-Screen Quick Guide: OFF';
    }
  }
}

function openHowToPlayModal() {
  if (state.mode !== 'PAUSED') {
    state.previousModeBeforePause = state.mode;
  }
  if (state.mode === 'PLAYING' || state.mode === 'TRANSITION_TO_PLAY') {
    state.mode = 'PAUSED';
  }
  syncHudGuideCardVisibility();
  const pauseModal = document.getElementById('pause-modal');
  if (pauseModal) {
    pauseModal.classList.add('hidden');
    pauseModal.classList.remove('flex');
  }
  const hm = document.getElementById('howto-modal');
  if (hm) {
    hm.classList.remove('hidden');
    hm.classList.add('flex');
  }
}

function syncSettingsModalUI() {
  // Audio Mute Button
  const btnAudio = document.getElementById('btn-option-audio');
  const muteInd = document.getElementById('audio-mute-indicator');
  const muteLbl = document.getElementById('audio-mute-label');
  if (btnAudio && muteInd && muteLbl) {
    btnAudio.setAttribute('aria-pressed', String(audio.muted));
    if (audio.muted) {
      muteLbl.textContent = 'Muted';
      muteInd.className = 'w-2 h-2 rounded-full bg-rose-400';
      btnAudio.className = 'ui-btn-secondary px-3.5 py-2 font-mono-num text-xs font-semibold flex items-center gap-2 shrink-0 border-rose-400/40 text-rose-300';
    } else {
      muteLbl.textContent = 'Sound: ON';
      muteInd.className = 'w-2 h-2 rounded-full bg-emerald-400';
      btnAudio.className = 'ui-btn-secondary px-3.5 py-2 font-mono-num text-xs font-semibold flex items-center gap-2 shrink-0 border-emerald-400/40 text-emerald-300';
    }
  }

  // Volume Sliders
  const masterPct = Math.round(audio.masterVolume * 100);
  const sfxPct = Math.round(audio.sfxVolume * 100);
  const sMaster = document.getElementById('slider-master-vol');
  const vMaster = document.getElementById('val-master-vol');
  const sSfx = document.getElementById('slider-sfx-vol');
  const vSfx = document.getElementById('val-sfx-vol');
  if (sMaster) sMaster.value = String(masterPct);
  if (vMaster) vMaster.textContent = `${masterPct}%`;
  if (sSfx) sSfx.value = String(sfxPct);
  if (vSfx) vSfx.textContent = `${sfxPct}%`;

  // Collision Rule Button
  const btnLethal = document.getElementById('btn-option-lethal');
  const descLethal = document.getElementById('collision-rule-desc');
  if (btnLethal && descLethal) {
    if (state.lethalOneHitMode) {
      btnLethal.textContent = '1-Hit Lethal';
      btnLethal.className = 'ui-btn-secondary px-3.5 py-2 font-mono-num text-xs font-semibold text-rose-300 border-rose-400/30 shrink-0';
      descLethal.textContent = '1-Hit Lethal: Moving enemy sprites are lethal; physical obstacles push Tode';
    } else {
      btnLethal.textContent = '3-Heart Casual';
      btnLethal.className = 'ui-btn-secondary px-3.5 py-2 font-mono-num text-xs font-semibold text-emerald-300 border-emerald-400/30 shrink-0';
      descLethal.textContent = `3-Heart Casual: Survive up to 3 hits (${state.hearts} HP remaining)`;
    }
  }

  // Hide inline restart confirmation until clicked
  const confirmBar = document.getElementById('restart-confirm-bar');
  if (confirmBar) {
    confirmBar.classList.add('hidden');
    confirmBar.classList.remove('flex');
  }

  // Update subtitle based on whether opened from Landing or Gameplay
  const subEl = document.getElementById('pause-status-subtitle');
  if (subEl) {
    const pct = Math.min(100, Math.max(0, Math.round((state.gridZ / ROADWAY_LENGTH) * 100)));
    subEl.textContent = state.previousModeBeforePause === 'LANDING'
      ? 'Title Screen Options'
      : `Paused • ${FLOORS[state.floorLevel].icon} ${FLOORS[state.floorLevel].name} (${pct}%)`;
  }

  syncHudGuideCardVisibility();
  syncCornerMusicButtonUI();
}

let checkpointBannerTimeout = null;
function triggerFirstTimeCheckpoint(cpRow = 28) {
  if (state.lastCheckpointZ >= cpRow) return;
  state.lastCheckpointZ = cpRow;
  audio.playCheckpointChime();
  spawnPollenBurst(todeRoot.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 14);

  const cpIdx = CHECKPOINT_ROWS.indexOf(cpRow) + 1;
  const toast = document.getElementById('checkpoint-toast-banner');
  setArcadeAlertText('checkpoint-toast-title', `CHECKPOINT ${cpIdx > 0 ? '#' + cpIdx : ''} SAVED!`);
  setArcadeAlertText('checkpoint-toast-sub', 'PRESS [ENTER] ON WIPEOUT TO REVIVE HERE');
  if (toast) {
    toast.classList.remove('hidden', 'animate-checkpoint-banner');
    void toast.offsetWidth;
    toast.classList.add('animate-checkpoint-banner');
    if (checkpointBannerTimeout) clearTimeout(checkpointBannerTimeout);
    checkpointBannerTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 1850);
  }
  updateHUD();
}

function attemptHop(dx, dz) {
  if (state.mode !== 'PLAYING' || isAnyModalOpen()) return;
  if (state.defeated || state.fallingDeath) return;
  // 1-Slot Pre-Input Buffer: Queue directional hop pressed during the second half of an active hop
  if (state.hopActive) {
    if (state.hopTime / HOP_DURATION >= 0.42) {
      state.queuedHop = { dx, dz };
    }
    return;
  }

  if (dx !== 0 || dz !== 0) {
    state.targetYaw = Math.atan2(dx, -dz);
  }

  const nextX = state.gridX + dx;
  const nextZ = state.gridZ + dz;

  if (nextZ < 0 || nextZ > ROADWAY_LENGTH) return;

  if (dx < 0 && fencedEdges.has(`${state.gridX},${state.gridZ},L`)) {
    state.cameraTrauma = Math.min(1, state.cameraTrauma + 0.14);
    state.bonkRecoilTimer = 0.25;
    audio.playBonk();
    return;
  }
  if (dx > 0 && fencedEdges.has(`${state.gridX},${state.gridZ},R`)) {
    state.cameraTrauma = Math.min(1, state.cameraTrauma + 0.14);
    state.bonkRecoilTimer = 0.25;
    audio.playBonk();
    return;
  }

  if (blockedTiles.has(tileKey(nextX, nextZ))) {
    state.cameraTrauma = Math.min(1, state.cameraTrauma + 0.14);
    state.bonkRecoilTimer = 0.25;
    audio.playBonk();
    return;
  }

  state.gridX = nextX;
  state.gridZ = nextZ;
  for (const cpRow of CHECKPOINT_ROWS) {
    if (nextZ >= cpRow && state.lastCheckpointZ < cpRow && validRoadwayTiles.has(tileKey(nextX, nextZ))) {
      triggerFirstTimeCheckpoint(cpRow);
    }
  }

  const destY = getSurfaceY(nextX, nextZ);
  state.hopActive = true;
  state.hopTime = 0;
  state.hopStartPos.copy(todeRoot.position);
  state.hopEndPos.set(nextX * TILE_SIZE, destY, -nextZ * TILE_SIZE);

  audio.playHop(state.scaleMultiplier);
  updateHUD();
}

function fireTongueGrapple(aimWorldPoint = null) {
  if (state.mode !== 'PLAYING' || isAnyModalOpen()) return;
  if (state.defeated || state.fallingDeath) return;
  if (state.tongueState !== 'idle') return;

  const maxRange = 8.4 * state.scaleMultiplier;
  let bestBee = null;
  let bestScore = Infinity;
  const forwardVec = new THREE.Vector3(Math.sin(state.currentYaw), 0, Math.cos(state.currentYaw));

  const evaluateCandidate = (cand) => {
    if (!cand.alive || cand.latched) return;
    // Forward-Only Tongue Grappler Rule: Grapplers behind or at Tode's row cannot be used!
    if (cand.kind === 'grapple_post' && (cand.passed || state.gridZ >= cand.gz || cand.mesh.position.z >= todeRoot.position.z - 0.5)) {
      return;
    }
    const toCand = cand.mesh.position.clone().sub(todeRoot.position);
    const distToFrog = toCand.length();
    if (distToFrog <= maxRange && distToFrog > 0.1) {
      const dirNorm = toCand.clone().setY(0).normalize();
      const forwardDot = forwardVec.dot(dirNorm); // Prefer targets in front of Tode on mobile/keyboard
      let score = distToFrog - forwardDot * 1.25;
      if (aimWorldPoint) {
        score = cand.mesh.position.distanceTo(aimWorldPoint) * 1.35 + distToFrog * 0.3;
      }
      if (score < bestScore) {
        bestScore = score;
        bestBee = cand;
      }
    }
  };

  bees.forEach(evaluateCandidate);
  grappleTargets.forEach(evaluateCandidate);

  state.tongueState = 'extending';
  state.tongueTimer = 0;
  state.jawAngle = 0.68;

  if (bestBee) {
    state.latchedBee = bestBee;
    state.tongueTargetPos.copy(bestBee.mesh.position);
    const dir = bestBee.mesh.position.clone().sub(todeRoot.position);
    state.targetYaw = Math.atan2(dir.x, dir.z);
  } else if (aimWorldPoint) {
    state.latchedBee = null;
    const dir = aimWorldPoint.clone().sub(todeRoot.position);
    dir.y = 0;
    if (dir.length() > maxRange) dir.setLength(maxRange);
    state.tongueTargetPos.copy(todeRoot.position).add(dir);
    state.tongueTargetPos.y = 1.1;
    state.targetYaw = Math.atan2(dir.x, dir.z);
  } else {
    state.latchedBee = null;
    const forward = new THREE.Vector3(Math.sin(state.targetYaw), 0, Math.cos(state.targetYaw));
    state.tongueTargetPos.copy(todeRoot.position).addScaledVector(forward, 5.4 * state.scaleMultiplier);
    state.tongueTargetPos.y = getSurfaceY(state.gridX, state.gridZ) + 0.82;
  }

  audio.playTongueWhip();
}

function onSwallowBee(bee) {
  if (bee.kind === 'firefly') {
    bee.alive = false;
    bee.latched = false;
    bee.mesh.visible = false;
    state.fireflies += 2;
    state.combo = state.comboTimer > 0 ? state.combo + 1 : 1;
    state.comboTimer = 4.0;
    const pts = 250 * state.combo;
    state.score += pts;
    persistSettings();
    recordScoreToLeaderboard();
    const mouthWorldPos = todeRoot.position.clone().add(new THREE.Vector3(0, 1.0, 0));
    spawnPollenBurst(mouthWorldPos, 24);
    spawnFloatingPopup(mouthWorldPos, `FIREFLY +${pts}`, '', 'boost');
    audio.playSwallowAndChime(state.combo);
    updateHUD();
    return;
  }

  if (bee.type === 'boss' && bee.hp > 1) {
    bee.hp -= 1;
    state.bossHp = bee.hp;
    bee.latched = false;
    bee.mesh.position.set(bee.homeX, 1.30, bee.homeZ);
    if (bee.shieldOrbs && bee.shieldOrbs[bee.hp - 1]) {
      bee.shieldOrbs[bee.hp - 1].visible = false;
    }
    state.hitStopTimer = 0.050;
    state.cameraTrauma = Math.min(1.0, state.cameraTrauma + 0.30);
    state.score += 300;
    spawnPollenBurst(todeRoot.position.clone().add(new THREE.Vector3(0, 1.1, 0)), 16);
    spawnFloatingPopup(
      todeRoot.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
      `SHIELD SHATTERED! (${bee.hp} LEFT) +300`,
      'text-cyan-300 text-lg sm:text-xl'
    );
    audio.playSwallowAndChime(state.combo + 1, true);
    updateHUD();
    return;
  }

  if (bee.type === 'boss') {
    state.bossHp = 0;
  }
  bee.alive = false;
  bee.latched = false;
  bee.mesh.visible = false;

  state.beesEaten += 1;
  state.scaleMultiplier = 1.0 + Math.min(state.beesEaten * 0.012, 0.22);

  state.combo = state.comboTimer > 0 ? state.combo + 1 : 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.comboTimer = 4.0;
  const basePts = bee.type === 'boss' ? 600 : 120;
  const points = basePts * state.combo;
  state.score += points;
  if (state.combo >= 2 || bee.type === 'boss') {
    state.fireflies += (bee.type === 'boss' ? 5 : 1);
    persistSettings();
  }

  recordScoreToLeaderboard();

  state.hitStopTimer = 0.050;
  state.cameraTrauma = Math.min(1.0, state.cameraTrauma + 0.32);
  const mouthWorldPos = todeRoot.position.clone().add(new THREE.Vector3(0, 1.0, 0));
  spawnPollenBurst(mouthWorldPos, 20);
  spawnFloatingPopup(
    mouthWorldPos,
    bee.type === 'boss'
      ? `GUARDIAN DEVOURED! +${points}`
      : (state.combo >= 2 ? `COMBO ${state.combo}X! +${points}` : `BUG EATEN! +${points}`),
    '',
    bee.type === 'boss' ? 'boss' : (state.combo >= 2 ? 'combo' : 'bug')
  );

  state.chewTimer = 0.52;
  state.jawAngle = 0;
  audio.playSwallowAndChime(state.combo);
  updateHUD();
}

function showDeathReviveBanner() {
  const banner = document.getElementById('death-revive-banner');
  const sub = document.getElementById('death-revive-sub');
  const hint = document.getElementById('scorecard-checkpoint-hint');
  const cpRow = state.lastCheckpointZ || 0;
  const cpIdx = CHECKPOINT_ROWS.indexOf(cpRow) + 1;
  const cpLabel = cpRow > 0 ? `Checkpoint #${cpIdx}` : 'Realm Start Pad';
  if (sub) sub.textContent = `Respawn at ${cpLabel} • Keep Score`;
  if (hint) hint.textContent = `REVIVE AT ${cpLabel.toUpperCase()}`;
  if (banner) banner.classList.remove('hidden');
}

function hideDeathReviveBanner() {
  const banner = document.getElementById('death-revive-banner');
  if (banner) banner.classList.add('hidden');
}

function findSafeReviveColumn(targetZ) {
  const cCol = getTrackCenterCol(state.floorLevel, targetZ);
  if (validRoadwayTiles.has(tileKey(cCol, targetZ)) && !blockedTiles.has(tileKey(cCol, targetZ))) return cCol;
  for (let d = 1; d <= 6; d++) {
    if (validRoadwayTiles.has(tileKey(cCol - d, targetZ)) && !blockedTiles.has(tileKey(cCol - d, targetZ))) return cCol - d;
    if (validRoadwayTiles.has(tileKey(cCol + d, targetZ)) && !blockedTiles.has(tileKey(cCol + d, targetZ))) return cCol + d;
  }
  return cCol;
}

function reviveAtLastCheckpoint() {
  closeAllModals(false);
  hideDeathReviveBanner();
  state.mode = 'PLAYING';
  state.defeated = false;
  state.fallingDeath = false;
  state.fallVelocityY = 0;
  state.hopActive = false;
  state.hoopTransitionActive = false;
  state.tongueState = 'idle';
  state.latchedBee = null;
  tongueGroup.visible = false;
  tongueTipMesh.visible = false;

  state.hearts = state.lethalOneHitMode ? 1 : 3;
  state.invulnTimer = 2.0;

  const cpZ = state.lastCheckpointZ || 0;
  const safeX = findSafeReviveColumn(cpZ);
  state.gridX = safeX;
  state.gridZ = cpZ;

  todeRoot.position.set(safeX * TILE_SIZE, getSurfaceY(safeX, cpZ), -cpZ * TILE_SIZE);
  state.smoothFocusX = todeRoot.position.x;
  state.smoothFocusY = todeRoot.position.y;
  state.smoothFocusZ = todeRoot.position.z;
  todeRoot.rotation.set(0, Math.PI, 0);
  state.targetYaw = Math.PI;
  state.currentYaw = Math.PI;
  state.zStretch = 1.0;
  state.xySquash = 1.0;

  camera.fov = 42;
  camera.updateProjectionMatrix();
  audio.restartCalmTheme();
  audio.playStartHorn();
  spawnPollenBurst(todeRoot.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 14);
  spawnFloatingPopup(
    todeRoot.position.clone().add(new THREE.Vector3(0, 1.35, 0)),
    cpZ > 0 ? `⚡ REVIVED AT ROW ${cpZ}!` : '⚡ REVIVED AT START!',
    '',
    'boost'
  );
  updateHUD();
  renderLiveMinimap();
}

function triggerFallOffTrack(reason = 'Fell Off the Track') {
  if (state.mode === 'STORY_INTRO') return;
  if (state.fallingDeath || state.defeated || state.hoopTransitionActive) return;
  state.fallingDeath = true;
  state.fallVelocityY = -1.8;
  state.deathSlowMoTimer = 1.35;
  audio.stopBgm();
  showDeathReviveBanner();
  audio.playFallWhistle();
  spawnFloatingPopup(todeRoot.position.clone().add(new THREE.Vector3(0, 1.2, 0)), reason, '', 'danger');

  setTimeout(() => {
    if (state.fallingDeath) {
      triggerDefeatCinematic(reason);
    }
  }, 1150);
}

// Physical Obstacles (Rotating Sweepers, Sliding Push-Blocks, Bounce Pads) ONLY move/displace Tode—never kill Tode on contact!
function knockbackTode(pushDx, pushDz, label = 'Pushed by Obstacle') {
  if (state.mode !== 'PLAYING' || state.defeated || state.fallingDeath) return;
  if (state.hopActive || state.bonkRecoilTimer > 0.05) return;

  // Choose primary displacement tile (or fallback lateral/backward tile that isn't a static 3D obstacle)
  const candidates = [
    [pushDx, pushDz],
    [pushDx, 0],
    [0, pushDz !== 0 ? pushDz : -1],
    [-pushDx, 0],
    [0, -1]
  ];

  let chosenDx = 0;
  let chosenDz = 0;
  for (const [cx, cz] of candidates) {
    if (cx === 0 && cz === 0) continue;
    const nx = state.gridX + cx;
    const nz = state.gridZ + cz;
    if (nz < 0 || nz > ROADWAY_LENGTH) continue;
    if (cx < 0 && fencedEdges.has(`${state.gridX},${state.gridZ},L`)) continue;
    if (cx > 0 && fencedEdges.has(`${state.gridX},${state.gridZ},R`)) continue;
    // Never push Tode into a static 3D obstacle!
    if (blockedTiles.has(tileKey(nx, nz))) continue;
    chosenDx = cx;
    chosenDz = cz;
    break;
  }

  state.bonkRecoilTimer = 0.28;
  state.cameraTrauma = Math.min(0.28, state.cameraTrauma + 0.14);
  audio.playBonk();
  spawnFloatingPopup(
    todeRoot.position.clone().add(new THREE.Vector3(0, 1.35, 0)),
    label,
    'text-emerald-300 text-sm sm:text-base'
  );

  if (chosenDx !== 0 || chosenDz !== 0) {
    state.gridX += chosenDx;
    state.gridZ += chosenDz;
    state.hopActive = true;
    state.hopTime = 0;
    state.hopStartPos.copy(todeRoot.position);
    state.hopEndPos.set(state.gridX * TILE_SIZE, getSurfaceY(state.gridX, state.gridZ), -state.gridZ * TILE_SIZE);
    updateHUD();
  }
}

function damageTode(reason = 'Touched an Angry Enemy') {
  if (state.mode === 'STORY_INTRO') return;
  if (state.invulnTimer > 0 || state.defeated || state.fallingDeath) return;

  if (state.lethalOneHitMode) {
    state.hearts = 0;
  } else {
    state.hearts = Math.max(0, state.hearts - 1);
  }

  state.invulnTimer = 1.4;
  state.cameraTrauma = Math.min(0.35, state.cameraTrauma + 0.22);
  audio.playDefeatSlide();
  updateHUD();

  if (state.hearts <= 0) {
    spawnFloatingPopup(todeRoot.position.clone().add(new THREE.Vector3(0, 1.5, 0)), reason, 'text-rose-300 text-xl');
    triggerDefeatCinematic(reason);
  } else {
    spawnFloatingPopup(todeRoot.position.clone().add(new THREE.Vector3(0, 1.5, 0)), `${reason} (${state.hearts} HP Left)`, 'text-amber-300 text-lg');
  }
}

function triggerDefeatCinematic(reason = 'Eliminated') {
  state.defeated = true;
  audio.stopBgm();
  state.defeatFov = camera.fov;
  showDeathReviveBanner();
  recordScoreToLeaderboard();

  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
  document.getElementById('scorecard-badge').textContent = reason;
  document.getElementById('card-final-score').textContent = state.score.toLocaleString();
  document.getElementById('card-high-score').textContent = state.highScore.toLocaleString();
  document.getElementById('card-bees-eaten').textContent = `${state.beesEaten}`;
  document.getElementById('card-floor-reached').textContent = `${floorCfg.icon} ${floorCfg.name}`;

  setTimeout(() => {
    if (state.defeated) {
      const modal = document.getElementById('scorecard-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }, 1100);
}

function openSettingsModal() {
  if (state.mode !== 'PAUSED') {
    state.previousModeBeforePause = state.mode;
  }
  if (state.mode === 'PLAYING' || state.mode === 'TRANSITION_TO_PLAY') {
    state.mode = 'PAUSED';
  }
  renderLeaderboardUI();
  syncSettingsModalUI();
  const pm = document.getElementById('pause-modal');
  pm.classList.remove('hidden');
  pm.classList.add('flex');
  const resumeBtn = document.getElementById('btn-resume-game');
  if (resumeBtn) resumeBtn.focus();
}

function closeAllModals(restorePreviousMode = true) {
  ['map-modal', 'pause-modal', 'leaderboard-modal', 'howto-modal', 'scorecard-modal', 'victory-modal'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  });
  if (restorePreviousMode && state.mode === 'PAUSED') {
    state.mode = (state.previousModeBeforePause === 'LANDING' || state.previousModeBeforePause === 'STORY_INTRO') ? state.previousModeBeforePause : 'PLAYING';
  }
}

// Non-Looping Celebratory Achievement Replay Animation & Thank-You Finale when completing +3F or -3F!
function triggerCampaignVictoryFinale() {
  if (state.victoryCelebrationActive) return;
  closeAllModals(false);
  hideDeathReviveBanner();

  state.victoryCelebrationActive = true;
  state.victoryTimer = 0;
  state.victoryOrbitAngle = 0;
  state.victoryFireworkTimer = 0;
  state.hopActive = false;
  state.tongueState = 'idle';
  tongueGroup.visible = false;
  tongueTipMesh.visible = false;

  // Replace the finish-shrine hoops environment with the dedicated Victory Celebration Sanctuary!
  buildVictoryCelebrationSanctuary();

  state.score += 1500;
  recordScoreToLeaderboard();
  updateHUD();

  const isHeavenApex = state.floorLevel > 0;
  audio.playCelebrationTheme();
  audio.playCourseClearFanfare(isHeavenApex);
  const centerPos = todeRoot.position.clone().add(new THREE.Vector3(0, 1.5, 0));
  spawnPollenBurst(centerPos, 42);
  spawnFloatingPopup(
    centerPos,
    isHeavenApex ? 'SUN CROWN CONQUERED! +1500' : 'MARIANA ABYSS CONQUERED! +1500',
    '',
    'boss'
  );

  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
  document.getElementById('victory-crest-icon').textContent = isHeavenApex ? '👑' : '🌊';
  document.getElementById('victory-realm-badge').textContent = isHeavenApex
    ? '☀️ SKY CROWN CONQUERED'
    : '🌊 MARIANA ABYSS CONQUERED';
  document.getElementById('victory-final-score').textContent = state.score.toLocaleString();
  document.getElementById('victory-high-score').textContent = state.highScore.toLocaleString();
  document.getElementById('victory-floor-reached').textContent = `${floorCfg.icon} ${floorCfg.name}`;
  document.getElementById('victory-bees-eaten').textContent = `${state.beesEaten} Eaten (${state.maxCombo}x Max)`;

  // Let the camera orbit Tode while Tode dances in joy for 4.2 seconds, then show Thank-You screen while orbit continues!
  setTimeout(() => {
    if (state.victoryCelebrationActive) {
      audio.playCourseClearFanfare(isHeavenApex);
      const vModal = document.getElementById('victory-modal');
      if (vModal) {
        vModal.classList.remove('hidden');
        vModal.classList.add('flex');
      }
    }
  }, 4200);
}

// Smooth Automated Super Mario-Inspired 3D Hoop Dive & Circular Iris Level Transition (Zero Manual Popup!)
function startHoopLevelTransition(targetLevel, hoopX, hoopZ, isSky) {
  // Do NOT loop if the player just completed the highest (+3F) or lowest (-3F) floor!
  if (Math.abs(state.floorLevel) >= 3) {
    triggerCampaignVictoryFinale();
    return;
  }
  if (state.hoopTransitionActive) return;
  closeAllModals(false);
  hideDeathReviveBanner();

  const clampedTarget = THREE.MathUtils.clamp(targetLevel, -3, 3);
  const nextCfg = FLOORS[clampedTarget] || FLOORS[0];

  state.hoopTransitionActive = true;
  state.hoopTransTimer = 0;
  state.hoopTransDuration = 2.10;
  state.hoopTransSwapped = false;
  state.hoopTargetLevel = clampedTarget;
  state.hoopIsSky = isSky;
  state.hopActive = false;
  state.tongueState = 'idle';
  tongueGroup.visible = false;
  tongueTipMesh.visible = false;

  state.hoopStartPos.copy(todeRoot.position);
  state.hoopCenterPos.set(hoopX, 2.05, hoopZ);

  state.score += 600;
  recordScoreToLeaderboard();
  updateHUD();

  audio.playCelebrationTheme();
  audio.playCourseClearFanfare(isSky);
  spawnPollenBurst(state.hoopCenterPos, 28);
  spawnFloatingPopup(
    state.hoopCenterPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
    `HOOP CLEAR! -> ${nextCfg.code}`,
    '',
    'boss'
  );

  setArcadeAlertText('iris-stage-overline', `${isSky ? 'HEAVEN HOOP ASCENSION' : 'ABYSS HOOP DIVE'} +600 PTS`);
  setArcadeAlertText('iris-stage-title', `${nextCfg.name.toUpperCase()}`);
  setArcadeAlertText('iris-stage-sub', isSky ? 'ASCENDING TO NEXT SKY REALM...' : 'DIVING TO NEXT OCEAN REALM...');
}

function transitionToFloor(targetLevel, resetRun = false) {
  state.floorLevel = THREE.MathUtils.clamp(targetLevel, -3, 3);
  closeAllModals(false);
  hideDeathReviveBanner();
  state.hoopTransitionActive = false;
  state.victoryCelebrationActive = false;
  const irisOverlay = document.getElementById('iris-transition-overlay');
  if (irisOverlay) irisOverlay.style.opacity = '0';
  state.mode = 'PLAYING';
  state.previousModeBeforePause = 'PLAYING';
  state.defeated = false;
  state.fallingDeath = false;
  state.fallVelocityY = 0;
  state.defeatFov = 42;
  camera.fov = 42;
  camera.updateProjectionMatrix();

  if (resetRun) {
    state.score = 0;
    state.beesEaten = 0;
    state.combo = 0;
    state.maxCombo = 1;
    state.scaleMultiplier = 1.0;
  } else {
    state.score += 600;
    state.beesEaten = 0;
    recordScoreToLeaderboard();
  }

  state.hearts = state.lethalOneHitMode ? 1 : 3;
  state.bossHp = 3;
  state.gridX = 0;
  state.gridZ = 0;
  state.lastCheckpointZ = 0;
  state.hopActive = false;
  state.tongueState = 'idle';
  state.latchedBee = null;
  tongueGroup.visible = false;
  tongueTipMesh.visible = false;
  todeRoot.position.set(0, 0, 0);
  state.smoothFocusX = 0;
  state.smoothFocusY = 0;
  state.smoothFocusZ = 0;
  todeRoot.rotation.set(0, Math.PI, 0);
  state.targetYaw = Math.PI;
  state.currentYaw = Math.PI;

  buildRoadwayWorld();
  populateRoadwayBees();
  updateHUD();
  renderLiveMinimap();

  audio.restartCalmTheme();
  audio.playPortalChord(state.floorLevel >= 0);
}

function getStoryIntroTotalDuration() {
  return STORY_INTRO_CHAPTERS.reduce((acc, ch) => acc + (ch.duration || 4.0), 0);
}

function clearStoryShowcaseActors() {
  if (window._storyShowcaseGroup) {
    scene.remove(window._storyShowcaseGroup);
    window._storyShowcaseGroup = null;
  }
  window._storyShowcaseActors = [];
}

function spawnStoryShowcaseActors() {
  clearStoryShowcaseActors();
  const grp = new THREE.Group();
  const actors = [];
  // Spawn lightweight showcase representatives of Sky Birds (+F) and Ocean Creatures (-F) around Row 42..46
  const specs = [
    { theme: 'heaven', type: 'swooper', x: 8.5, y: 4.8, z: -84.0, speed: 2.6, spanX: 3.2, phase: 0.0 },
    { theme: 'heaven', type: 'sweeper', x: 14.5, y: 4.5, z: -86.0, speed: 2.8, spanX: 2.8, phase: 1.5 },
    { theme: 'ocean',  type: 'zigzag',  x: 9.2, y: 3.4, z: -88.0, speed: 2.5, spanX: 3.0, phase: 0.8 },
    { theme: 'ocean',  type: 'swooper', x: 14.0, y: 3.6, z: -83.0, speed: 2.4, spanX: 2.6, phase: 2.2 }
  ];
  specs.forEach((sp) => {
    const built = buildThemeEnemyMesh(sp.theme, sp.type);
    built.root.position.set(sp.x, sp.y, sp.z);
    grp.add(built.root);
    actors.push({
      mesh: built.root,
      leftWing: built.leftWing,
      rightWing: built.rightWing,
      homeX: sp.x,
      homeY: sp.y,
      homeZ: sp.z,
      speed: sp.speed,
      spanX: sp.spanX,
      phase: sp.phase
    });
  });
  scene.add(grp);
  window._storyShowcaseGroup = grp;
  window._storyShowcaseActors = actors;
}

function setupStoryIntroBeatScene(stepIdx) {
  const ch = STORY_INTRO_CHAPTERS[stepIdx] || STORY_INTRO_CHAPTERS[0];
  state.defeated = false;
  state.fallingDeath = false;
  state.fallVelocityY = 0;
  state.hopActive = false;
  state.queuedHop = null;
  state.tongueState = 'idle';
  state.latchedBee = null;
  state.bonkRecoilTimer = 0;
  state.cameraTrauma = 0;
  tongueGroup.visible = false;
  tongueTipMesh.visible = false;

  // Never rebuild the 96-row world mid-cutscene (eliminates all lag spikes!)
  if (state.floorLevel !== 0) {
    state.floorLevel = 0;
    buildRoadwayWorld();
    populateRoadwayBees();
  }

  if (ch.beat === 'biome_enemies') {
    spawnStoryShowcaseActors();
  } else {
    clearStoryShowcaseActors();
  }

  // Ensure all bees are alive & unlatched for clean visual presentation
  bees.forEach((b) => {
    b.alive = true;
    b.latched = false;
    b.mesh.visible = true;
    if (b.type === 'boss') {
      b.hp = 3;
      if (b.shieldOrbs) b.shieldOrbs.forEach((o) => { o.visible = true; });
    }
  });

  // Ensure safe tile placement for Tode on every shot
  const gx = ch.frogPos ? ch.frogPos.gx : 0;
  const gz = ch.frogPos ? ch.frogPos.gz : 0;
  const safeX = (validRoadwayTiles.has(tileKey(gx, gz)) && !blockedTiles.has(tileKey(gx, gz)))
    ? gx
    : findSafeReviveColumn(gz);
  state.gridX = safeX;
  state.gridZ = gz;
  const surfY = getSurfaceY(safeX, gz);
  todeRoot.position.set(safeX * TILE_SIZE, surfY, -gz * TILE_SIZE);
  todeRoot.rotation.set(0, ch.frogYaw !== undefined ? ch.frogYaw : Math.PI, 0);
  state.targetYaw = ch.frogYaw !== undefined ? ch.frogYaw : Math.PI;
  state.currentYaw = state.targetYaw;
  state.zStretch = 1.0;
  state.xySquash = 1.0;
  state.demoActionDone = false;
  state.demoSecondaryDone = false;

  // Snap camera cleanly on shot 0 so there is no wild whip-pan
  if (stepIdx === 0) {
    camera.position.set(ch.camStart.x, ch.camStart.y, ch.camStart.z);
    if (!window._storyLookVec) window._storyLookVec = new THREE.Vector3();
    window._storyLookVec.set(ch.lookStart.x, ch.lookStart.y, ch.lookStart.z);
    camera.lookAt(window._storyLookVec);
  }
}

function renderStoryIntroStepUI() {
  // No captions or sub-text during the introductory animation
  const overlay = document.getElementById('story-intro-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function advanceStoryIntroStep() {
  if (state.mode !== 'STORY_INTRO') return;
  if (state.storyIntroStep < STORY_INTRO_CHAPTERS.length - 1) {
    state.storyIntroStep += 1;
    state.storyIntroStepTimer = 0;
    setupStoryIntroBeatScene(state.storyIntroStep);
  } else {
    finishStoryIntroAndPlay();
  }
}

function finishStoryIntroAndPlay() {
  if (state.mode !== 'STORY_INTRO') return;
  state.storyIntroSeen = true;
  clearStoryShowcaseActors();
  const overlay = document.getElementById('story-intro-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
  hideDeathReviveBanner();

  // Since floorLevel is already 0, we do NOT need a laggy world rebuild here!
  if (state.floorLevel !== 0) {
    state.floorLevel = 0;
    buildRoadwayWorld();
  }
  // Reset any bee eaten during the demo tongue shot
  bees.forEach((b) => {
    b.alive = true;
    b.latched = false;
    b.mesh.visible = true;
    b.mesh.position.set(b.homeX, (b.baseY || 0) + 1.30, b.homeZ);
  });
  grappleTargets.forEach((gt) => {
    gt.alive = true;
    gt.latched = false;
    gt.passed = false;
    gt.mesh.visible = true;
    if (gt.ringMesh) gt.ringMesh.visible = true;
    if (gt.lotusBulb && gt.activeLotusMat) gt.lotusBulb.material = gt.activeLotusMat;
  });

  state.score = 0;
  state.beesEaten = 0;
  state.combo = 0;
  state.scaleMultiplier = 1.0;
  state.defeated = false;
  state.fallingDeath = false;
  state.fallVelocityY = 0;
  state.gridX = 0;
  state.gridZ = 0;
  state.lastCheckpointZ = 0;
  state.hopActive = false;
  state.queuedHop = null;
  state.tongueState = 'idle';
  state.latchedBee = null;
  tongueGroup.visible = false;
  tongueTipMesh.visible = false;
  todeRoot.position.set(0, 0, 0);
  todeRoot.rotation.set(0, Math.PI, 0);
  state.targetYaw = Math.PI;
  state.currentYaw = Math.PI;
  state.zStretch = 1.0;
  state.xySquash = 1.0;

  document.getElementById('gameplay-hud').classList.remove('hidden');
  document.body.classList.add('is-playing-touch');
  state.mode = 'TRANSITION_TO_PLAY';
  state.previousModeBeforePause = 'PLAYING';
  state.transitionProgress = 0;
  updateHUD();
  renderLiveMinimap();
}

function startPlayFromLanding(initialFloor = 0, forceStoryIntro = true) {
  ensurePlayerName();
  audio.init();
  audio.restartCalmTheme();
  state.floorLevel = initialFloor;
  state.hearts = state.lethalOneHitMode ? 1 : 3;
  buildRoadwayWorld();
  populateRoadwayBees();

  document.getElementById('landing-screen').classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    document.getElementById('landing-screen').classList.add('hidden');
    if (forceStoryIntro && initialFloor === 0 && !state.storyIntroSeen) {
      state.mode = 'STORY_INTRO';
      state.previousModeBeforePause = 'STORY_INTRO';
      state.storyIntroStep = 0;
      state.storyIntroStepTimer = 0;
      state.storyIntroElapsed = 0;
      setupStoryIntroBeatScene(0);
    } else {
      state.targetYaw = Math.PI;
      state.mode = 'TRANSITION_TO_PLAY';
      state.previousModeBeforePause = 'PLAYING';
      state.transitionProgress = 0;
      document.getElementById('gameplay-hud').classList.remove('hidden');
      document.body.classList.add('is-playing-touch');
      updateHUD();
      renderLiveMinimap();
    }
  }, 320);
}