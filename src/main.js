/**
 * Froggit — Sky and Abyss — Main 60 FPS Animation Loop, Cannon Recoil/Muzzle-Flash/Ember Trail, Forward Grapple Lock & Camera Rig
 * File: src/main.js
 */
// =========================================================================
// 13. MAIN ANIMATION LOOP
// =========================================================================
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  const rawDt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  // Freeze gameplay simulation while PAUSED, while still rendering the 3D world behind the lightly dimmed Settings overlay
  if (state.mode === 'PAUSED') {
    renderer.render(scene, camera);
    return;
  }

  if (state.hitStopTimer > 0) {
    state.hitStopTimer -= rawDt;
    renderer.render(scene, camera);
    return;
  }

  const timeScale = (state.defeated || state.fallingDeath) ? 0.55 : 1.0;
  const dt = rawDt * timeScale;

  // Animate scrolling water, waterfall & alive floor textures (grass breeze, ocean caustics, cloud mist)
  scrollingWaterTextures.forEach((wTex) => {
    wTex.offset.y = (wTex.offset.y + dt * 0.55) % 1.0;
  });
  scrollingFloorTextures.forEach((fObj) => {
    fObj.map.offset.x = (fObj.map.offset.x + dt * fObj.vx) % 1.0;
    fObj.map.offset.y = (fObj.map.offset.y + dt * fObj.vy) % 1.0;
  });

  if (state.mode === 'LANDING') {
    const isPortraitLanding = window.innerWidth < window.innerHeight;
    const targetLandingX = isPortraitLanding ? 0.0 : 0.65;
    const targetLandingZ = isPortraitLanding ? -0.15 : 0.35;
    todeRoot.position.x = THREE.MathUtils.lerp(todeRoot.position.x, targetLandingX, rawDt * 5);
    todeRoot.position.z = THREE.MathUtils.lerp(todeRoot.position.z, targetLandingZ, rawDt * 5);
    state.targetYaw = (isPortraitLanding ? -0.12 : -0.38) + Math.sin(now * 0.0011) * 0.09;
    upperHeadPivot.rotation.z = Math.sin(now * 0.0016) * 0.035;
  } else if (state.mode === 'STORY_INTRO') {
    state.storyIntroStepTimer += rawDt;
    state.storyIntroTotalTimer += rawDt;
    const ch = STORY_INTRO_CHAPTERS[state.storyIntroStep] || STORY_INTRO_CHAPTERS[0];
    const beatDur = ch.duration || 4.2;
    const beatProgress = Math.min(1.0, state.storyIntroStepTimer / beatDur);

    // Update automated timeline progress bar & chapter countdown readout
    const progFill = document.getElementById('story-intro-progress-fill');
    if (progFill) {
      let elapsedBefore = 0;
      for (let i = 0; i < state.storyIntroStep; i++) {
        elapsedBefore += (STORY_INTRO_CHAPTERS[i].duration || 4.2);
      }
      const totalDur = state.storyIntroTotalDuration || 51.0;
      const pct = Math.min(100, ((elapsedBefore + state.storyIntroStepTimer) / totalDur) * 100);
      progFill.style.width = `${pct.toFixed(1)}%`;
    }
    const timerReadout = document.getElementById('story-intro-timer-readout');
    if (timerReadout) {
      const rem = Math.max(0, Math.ceil((state.storyIntroTotalDuration || 51.0) - state.storyIntroTotalTimer));
      timerReadout.textContent = `AUTO-NARRATING • ${rem}s`;
    }

    // Execute automated Tode choreography per beat!
    const triggerDemoHop = (dx, dz, isZip = false) => {
      if (state.hopActive) return;
      const nx = state.gridX + dx;
      const nz = state.gridZ + dz;
      state.gridX = nx;
      state.gridZ = nz;
      state.targetYaw = Math.atan2(dx, -dz);
      state.hopActive = true;
      state.hopTime = 0;
      state.hopStartPos.copy(todeRoot.position);
      state.hopEndPos.set(nx * TILE_SIZE, getSurfaceY(nx, nz), -nz * TILE_SIZE);
      audio.playHop(state.scaleMultiplier, isZip);
    };

    if (ch.todeAction === 'hero_awaken') {
      todeRoot.position.y = Math.abs(Math.sin(now * 0.0042)) * 0.24;
      state.targetYaw = Math.sin(now * 0.0022) * 0.55;
      upperHeadPivot.rotation.z = Math.sin(now * 0.003) * 0.06;
    } else if (ch.todeAction === 'wardrobe_expressions') {
      const skinKeys = ['emerald', 'cobalt', 'shogun', 'abyss', 'sakura'];
      const sIdx = Math.min(skinKeys.length - 1, Math.floor(beatProgress * skinKeys.length));
      if (state.activeSkin !== skinKeys[sIdx]) {
        state.activeSkin = skinKeys[sIdx];
        refreshFrogMaterialsForPack();
        spawnPollenBurst(todeRoot.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 10);
      }
      todeRoot.position.y = Math.abs(Math.sin(now * 0.0055)) * 0.32;
      state.targetYaw = beatProgress * Math.PI * 2;
      if (beatProgress > 0.65) {
        state.bonkRecoilTimer = 0.15; // Briefly show dizzy spiral eyes too!
      } else {
        state.chewTimer = 0.25; // Joyful happy chevron eyes!
      }
    } else if (ch.todeAction === 'first_person_hops') {
      if (state.storyIntroStepTimer > 0.7 && state.gridZ < 1) triggerDemoHop(0, 1);
      else if (state.storyIntroStepTimer > 1.7 && state.gridZ < 2) triggerDemoHop(0, 1);
      else if (state.storyIntroStepTimer > 2.7 && state.gridZ < 3) triggerDemoHop(0, 1);
    } else if (ch.todeAction === 'stalk_meadow_bugs') {
      todeRoot.position.y = getSurfaceY(state.gridX, state.gridZ) + Math.abs(Math.sin(now * 0.004)) * 0.16;
      state.targetYaw = Math.PI + Math.sin(now * 0.003) * 0.35;
    } else if (ch.todeAction === 'demo_tongue_snipe') {
      if (state.storyIntroStepTimer > 1.05 && !state.storyIntroActionTriggered) {
        state.storyIntroActionTriggered = true;
        const targetBug = bees.find((b) => b.alive && b.gz >= 4 && b.gz <= 12) || bees[0];
        if (targetBug) {
          state.latchedBee = targetBug;
          state.tongueTargetPos.copy(targetBug.mesh.position);
          state.tongueState = 'extending';
          state.tongueTimer = 0;
          state.jawAngle = 0.68;
          const dir = targetBug.mesh.position.clone().sub(todeRoot.position);
          state.targetYaw = Math.atan2(dir.x, dir.z);
          audio.playTongueWhip();
        }
      }
    } else if (ch.todeAction === 'demo_lily_zip') {
      if (state.storyIntroStepTimer > 1.0 && !state.storyIntroActionTriggered) {
        state.storyIntroActionTriggered = true;
        const post = grappleTargets.find((gt) => gt.kind === 'grapple_post' && gt.gz >= 10 && gt.gz <= 15) || grappleTargets[0];
        if (post) {
          state.latchedBee = post;
          state.tongueTargetPos.copy(post.mesh.position);
          state.tongueState = 'extending';
          state.tongueTimer = 0;
          state.jawAngle = 0.68;
          const dir = post.mesh.position.clone().sub(todeRoot.position);
          state.targetYaw = Math.atan2(dir.x, dir.z);
          audio.playTongueWhip();
        } else {
          triggerDemoHop(-1, 2, true);
        }
      }
    } else if (ch.todeAction === 'sky_realm_showcase' || ch.todeAction === 'ocean_realm_showcase') {
      if (state.storyIntroStepTimer > 0.9 && !state.storyIntroActionTriggered) {
        state.storyIntroActionTriggered = true;
        triggerDemoHop(0, 1);
      }
      if (!state.hopActive) {
        todeRoot.position.y = getSurfaceY(state.gridX, state.gridZ) + Math.abs(Math.sin(now * 0.004)) * 0.20;
      }
    } else if (ch.todeAction === 'hazard_gauntlet_dodge') {
      if (state.storyIntroStepTimer > 0.8 && !state.storyIntroActionTriggered) {
        state.storyIntroActionTriggered = true;
        triggerDemoHop(0, 1);
      }
      if (state.storyIntroStepTimer > 2.1 && state.gridZ === 35 && !state.hopActive) {
        state.bonkRecoilTimer = 0.35;
        triggerDemoHop(-1, 0);
        spawnFloatingPopup(todeRoot.position.clone().add(new THREE.Vector3(0, 1.3, 0)), 'DODGED CANNON!', '', 'obstacle');
      }
    } else if (ch.todeAction === 'checkpoint_celebrate') {
      if (state.storyIntroStepTimer > 0.75 && !state.storyIntroActionTriggered) {
        state.storyIntroActionTriggered = true;
        triggerDemoHop(0, 1);
        audio.playCheckpointChime();
        spawnPollenBurst(todeRoot.position.clone().add(new THREE.Vector3(0, 1.1, 0)), 18);
        spawnFloatingPopup(todeRoot.position.clone().add(new THREE.Vector3(0, 1.4, 0)), 'CHECKPOINT SAVED!', '', 'checkpoint');
      }
    } else if (ch.todeAction === 'boss_faceoff') {
      if (state.storyIntroStepTimer > 1.15 && !state.storyIntroActionTriggered) {
        state.storyIntroActionTriggered = true;
        const bossBee = bees.find((b) => b.type === 'boss') || bees[bees.length - 1];
        if (bossBee) {
          state.latchedBee = bossBee;
          state.tongueTargetPos.copy(bossBee.mesh.position);
          state.tongueState = 'extending';
          state.tongueTimer = 0;
          state.jawAngle = 0.68;
          audio.playTongueWhip();
        }
      }
    } else if (ch.todeAction === 'portal_finale_pose') {
      const baseFloorY = getSurfaceY(state.gridX, state.gridZ);
      const danceWave = Math.abs(Math.sin(now * 0.0075));
      todeRoot.position.y = baseFloorY + danceWave * 0.95;
      state.targetYaw = Math.PI + Math.sin(now * 0.004) * 0.45;
      state.chewTimer = 0.3;
    }

    // Automatically advance to the next story beat when the current beat's duration completes
    if (state.storyIntroStepTimer >= beatDur) {
      advanceStoryIntroStep();
    }
  } else if (state.mode === 'TRANSITION_TO_PLAY') {
    upperHeadPivot.rotation.z = 0;
    todeRoot.position.x = THREE.MathUtils.lerp(todeRoot.position.x, 0, rawDt * 6);
    todeRoot.position.z = THREE.MathUtils.lerp(todeRoot.position.z, 0, rawDt * 6);
    state.transitionProgress += rawDt / 1.45;
    if (state.transitionProgress >= 1.0) {
      state.transitionProgress = 1.0;
      todeRoot.position.set(0, 0, 0);
      state.mode = 'PLAYING';
      audio.playStartHorn();
    }
  }

  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
  }
  if (state.invulnTimer > 0) state.invulnTimer -= dt;
  if (state.bonkRecoilTimer > 0) state.bonkRecoilTimer -= dt;

  if (state.hoopTransitionActive) {
    state.hoopTransTimer += rawDt;
    const p = Math.min(1.0, state.hoopTransTimer / state.hoopTransDuration);
    const irisOverlay = document.getElementById('iris-transition-overlay');
    const irisBanner = document.getElementById('iris-stage-banner');

    // Project hoop center to screen percentages for the circular iris spotlight
    const hoopProj = state.hoopCenterPos.clone().project(camera);
    const ix = THREE.MathUtils.clamp((hoopProj.x * 0.5 + 0.5) * 100, 15, 85);
    const iy = THREE.MathUtils.clamp((-hoopProj.y * 0.5 + 0.5) * 100, 15, 85);

    if (p < 0.42) {
      // Phase 1: Parabolic Leap & 720-deg Spin directly into the spinning 3D Hoop
      const tLeap = p / 0.42;
      const easeLeap = 1 - Math.pow(1 - tLeap, 2);
      todeRoot.position.lerpVectors(state.hoopStartPos, state.hoopCenterPos, easeLeap);
      todeRoot.position.y += Math.sin(tLeap * Math.PI) * 1.65;
      todeRoot.rotation.y += rawDt * 14.0;
      todeRoot.rotation.z = Math.sin(tLeap * Math.PI * 2) * 0.35;

      const shrink = THREE.MathUtils.lerp(1.0, 0.14, Math.pow(tLeap, 1.6));
      state.zStretch = shrink;
      state.xySquash = shrink;

      if (irisOverlay) {
        irisOverlay.style.opacity = '1';
        irisOverlay.style.setProperty('--iris-x', `${ix}%`);
        irisOverlay.style.setProperty('--iris-y', `${iy}%`);
        const radVmax = THREE.MathUtils.lerp(135, 16, Math.pow(tLeap, 1.4));
        irisOverlay.style.setProperty('--iris-radius', `${radVmax}vmax`);
      }
    } else if (p < 0.68) {
      // Phase 2: Iris Closes around Hoop & Stage Banner Pops In; Swap World at Midpoint
      const tClose = (p - 0.42) / 0.26;
      if (irisOverlay) {
        irisOverlay.style.opacity = '1';
        const radVmax = tClose < 0.45
          ? THREE.MathUtils.lerp(16, 0, tClose / 0.45)
          : 0;
        irisOverlay.style.setProperty('--iris-radius', `${radVmax}vmax`);
      }
      if (irisBanner) {
        irisBanner.style.opacity = '1';
        irisBanner.style.transform = 'rotate(-2deg) scale(1)';
      }

      if (tClose >= 0.48 && !state.hoopTransSwapped) {
        state.hoopTransSwapped = true;
        state.floorLevel = state.hoopTargetLevel;
              state.defeated = false;
        state.fallingDeath = false;
        state.beesEaten = 0;
        state.hearts = state.lethalOneHitMode ? 1 : 3;
        state.bossHp = 3;
        state.gridX = 0;
        state.gridZ = 0;
        state.lastCheckpointZ = 0;

        buildRoadwayWorld();
        populateRoadwayBees();

        // Place Tode above the new floor's Start Pad for the drop-in entrance
        todeRoot.position.set(0, 3.6, 0);
        todeRoot.rotation.set(0, Math.PI, 0);
        state.targetYaw = Math.PI;
        state.currentYaw = Math.PI;
        state.hoopCenterPos.set(0, 1.0, 0);
        updateHUD();
        renderLiveMinimap();
      }
    } else {
      // Phase 3: Iris Expands Open & Tode Drops onto New Floor Start Pad with Landing Bounce
      const tOpen = (p - 0.68) / 0.32;
      const easeOpen = 1 - Math.pow(1 - tOpen, 3);
      todeRoot.position.x = 0;
      todeRoot.position.z = 0;
      const dropY = Math.max(0, (1 - Math.min(1, tOpen * 1.45)) * 3.6);
      const bounceY = tOpen > 0.68 ? Math.sin(((tOpen - 0.68) / 0.32) * Math.PI) * 0.45 : 0;
      todeRoot.position.y = dropY + bounceY;
      todeRoot.rotation.set(0, Math.PI, 0);

      state.zStretch = 1.0 + Math.sin(tOpen * Math.PI * 2) * 0.16;
      state.xySquash = 1.0 / Math.sqrt(state.zStretch);

      if (irisBanner) {
        irisBanner.style.opacity = String(Math.max(0, 1 - tOpen * 2.5));
        irisBanner.style.transform = `rotate(-2deg) scale(${THREE.MathUtils.lerp(1, 0.9, tOpen)})`;
      }
      if (irisOverlay) {
        irisOverlay.style.setProperty('--iris-x', '50%');
        irisOverlay.style.setProperty('--iris-y', '58%');
        const radVmax = THREE.MathUtils.lerp(0, 145, easeOpen);
        irisOverlay.style.setProperty('--iris-radius', `${radVmax}vmax`);
      }

      if (p >= 1.0) {
        state.hoopTransitionActive = false;
        todeRoot.position.set(0, 0, 0);
        state.zStretch = 1.0;
        state.xySquash = 1.0;
        if (irisOverlay) irisOverlay.style.opacity = '0';
        audio.playStartHorn();
        const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
        spawnFloatingPopup(
          new THREE.Vector3(0, 1.35, 0),
          `${floorCfg.name.toUpperCase()}`,
          '',
          'boost'
        );
      }
    }
  } else if (state.victoryCelebrationActive) {
    // Celebratory Achievement Replay Animation: Tode dances in joy while camera orbits 360°!
    state.victoryTimer += rawDt;
    state.victoryOrbitAngle += rawDt * 1.15;
    state.victoryFireworkTimer += rawDt;

    const baseFloorY = getSurfaceY(state.gridX, state.gridZ);
    const danceBeat = state.victoryTimer * 7.5;
    const jumpArc = Math.abs(Math.sin(danceBeat));
    todeRoot.position.y = baseFloorY + jumpArc * 1.45;
    todeRoot.rotation.y = state.victoryTimer * 4.2;
    todeRoot.rotation.z = Math.sin(danceBeat * 0.5) * 0.24;

    state.zStretch = 1.0 + Math.sin(danceBeat * 2.0) * 0.20;
    state.xySquash = 1.0 / Math.sqrt(state.zStretch);

    // Joyful kicking legs & waving front arms
    leftHindLeg.rotation.x = -jumpArc * 0.85;
    rightHindLeg.rotation.x = -jumpArc * 0.85;
    leftFrontLeg.rotation.z = Math.sin(danceBeat) * 0.55;
    rightFrontLeg.rotation.z = -Math.sin(danceBeat) * 0.55;

    if (state.victoryFireworkTimer > 0.55) {
      state.victoryFireworkTimer = 0;
      const fwOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 5.5,
        1.6 + Math.random() * 2.6,
        (Math.random() - 0.5) * 4.5
      );
      spawnPollenBurst(todeRoot.position.clone().add(fwOffset), 22);
    }
  } else if (state.fallingDeath) {
    state.fallVelocityY -= 18.0 * dt;
    todeRoot.position.y += state.fallVelocityY * dt;
    todeRoot.rotation.x += dt * 4.2;
    todeRoot.rotation.z += dt * 2.8;
  } else if (state.hopActive) {
    state.hopTime += rawDt;
    const t = Math.min(1.0, state.hopTime / HOP_DURATION);

    todeRoot.position.lerpVectors(state.hopStartPos, state.hopEndPos, t);
    const linearY = THREE.MathUtils.lerp(state.hopStartPos.y, state.hopEndPos.y, t);
    todeRoot.position.y = linearY + 1.15 * Math.sin(t * Math.PI);

    state.zStretch = 1.0 + Math.sin(t * Math.PI) * 0.22;
    state.xySquash = 1.0 / Math.sqrt(state.zStretch);

    const legKick = Math.sin(t * Math.PI) * 0.75;
    leftHindLeg.rotation.x = -legKick;
    rightHindLeg.rotation.x = -legKick;

    if (t >= 1.0) {
      state.hopActive = false;
      todeRoot.position.copy(state.hopEndPos);
      state.zStretch = 0.86;
      state.xySquash = 1.0 / Math.sqrt(state.zStretch);
      leftHindLeg.rotation.x = 0;
      rightHindLeg.rotation.x = 0;

      if (!validRoadwayTiles.has(tileKey(state.gridX, state.gridZ))) {
        const onPlat = movingPlatforms.find((p) => p.gz === state.gridZ && Math.abs(p.mesh.position.x - todeRoot.position.x) < 1.25);
        if (!onPlat) {
          triggerFallOffTrack(isMidTrackHole(state.gridX, state.gridZ) ? 'Fell Into Chasm' : 'Fell Off Unfenced Ledge');
          return;
        }
      }

      for (const cpRow of CHECKPOINT_ROWS) {
        if (state.gridZ >= cpRow && state.lastCheckpointZ < cpRow) {
          triggerFirstTimeCheckpoint(cpRow);
        }
      }

      // Check if Tode hopped directly onto a Golden Firefly collectible
      const touchedFirefly = grappleTargets.find((gt) => gt.kind === 'firefly' && gt.alive && gt.gx === state.gridX && gt.gz === state.gridZ);
      if (touchedFirefly) {
        onSwallowBee(touchedFirefly);
      }

      // Check if Tode landed on a non-lethal Spring Bounce Pad
      const pad = bouncePads.find((bp) => bp.gx === state.gridX && bp.gz === state.gridZ);
      if (pad) {
        let jumpDist = pad.jumpRows;
        while (jumpDist > 0 && blockedTiles.has(tileKey(state.gridX, state.gridZ + jumpDist))) {
          jumpDist--;
        }
        if (jumpDist > 0 && state.gridZ + jumpDist <= ROADWAY_LENGTH) {
          state.gridZ += jumpDist;
          for (const cpRow of CHECKPOINT_ROWS) {
            if (state.gridZ >= cpRow && state.lastCheckpointZ < cpRow) {
              triggerFirstTimeCheckpoint(cpRow);
            }
          }
          const destBounceY = getSurfaceY(state.gridX, state.gridZ);
          state.hopActive = true;
          state.hopTime = 0;
          state.hopStartPos.copy(todeRoot.position);
          state.hopEndPos.set(state.gridX * TILE_SIZE, destBounceY, -state.gridZ * TILE_SIZE);
          audio.playHop(state.scaleMultiplier * 0.8, true);
          spawnFloatingPopup(todeRoot.position.clone().add(new THREE.Vector3(0, 1.3, 0)), 'BOUNCE BOOST!', '', 'boost');
          updateHUD();
          return;
        }
      }

      // Finish Portal Hoops at Row >= ROADWAY_LENGTH - 2 (Row 70):
      // If on highest (+3F) or lowest (-3F) floor, trigger non-looping Victory Celebration!
      const hoopRowIdx = ROADWAY_LENGTH - 2;
      if (state.gridZ >= hoopRowIdx) {
        if (Math.abs(state.floorLevel) >= 3) {
          triggerCampaignVictoryFinale();
          return;
        }
        const nextAbyss = Math.max(-3, state.floorLevel > 0 ? -1 : state.floorLevel - 1);
        const nextSky = Math.min(3, state.floorLevel < 0 ? 1 : state.floorLevel + 1);
        if (state.gridX <= -1) {
          startHoopLevelTransition(nextAbyss, -2 * TILE_SIZE, -hoopRowIdx * TILE_SIZE - 0.4, false);
        } else if (state.gridX >= 1) {
          startHoopLevelTransition(nextSky, 2 * TILE_SIZE, -hoopRowIdx * TILE_SIZE - 0.4, true);
        } else {
          const autoNext = state.floorLevel < 0 ? nextAbyss : nextSky;
          startHoopLevelTransition(autoNext, 0, -ROADWAY_LENGTH * TILE_SIZE - 1.2, autoNext >= 0);
        }
        return;
      }

      // Execute Pre-Buffered Input Hop immediately on landing if queued!
      if (state.queuedHop) {
        const q = state.queuedHop;
        state.queuedHop = null;
        attemptHop(q.dx, q.dz);
      }
    }
  } else {
    state.zStretch = THREE.MathUtils.lerp(state.zStretch, 1.0, dt * 14);
    state.xySquash = 1.0 / Math.sqrt(state.zStretch);
  }

  if (!state.fallingDeath && !state.victoryCelebrationActive) {
    let yawDiff = state.targetYaw - state.currentYaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    state.currentYaw += yawDiff * Math.min(1, dt * 18);
    const bonkWobble = state.bonkRecoilTimer > 0 ? Math.sin(state.bonkRecoilTimer * 45) * 0.22 : 0;
    todeRoot.rotation.y = state.currentYaw + bonkWobble;
  }

  const s = BASE_FROG_SCALE * state.scaleMultiplier;
  if (state.defeated && !state.fallingDeath) {
    todeSquashGroup.scale.lerp(new THREE.Vector3(s * 1.34, s * 0.40, s * 1.30), rawDt * 2.8);
  } else {
    let chewStretch = 1.0;
    if (state.chewTimer > 0) {
      chewStretch = 1.0 + Math.sin(state.chewTimer * 38) * 0.09;
    }
    const finalY = s * state.zStretch * chewStretch;
    const finalXZ = s * state.xySquash * (1.0 / Math.sqrt(chewStretch));
    todeSquashGroup.scale.set(finalXZ, finalY, finalXZ);
  }

  // Living Tode Expressions
  state.breathPhase += dt * 3.4;
  state.sacInflation = 0.55 + Math.sin(state.breathPhase) * 0.25;
  throatSacMesh.scale.set(
    1.0 + state.sacInflation * 0.28,
    0.75 + state.sacInflation * 0.55,
    1.0 + state.sacInflation * 0.32
  );

  state.blinkTimer -= dt;
  if (state.blinkTimer <= 0 && !state.isBlinking) {
    state.isBlinking = true;
    state.blinkDuration = 0.15;
    state.blinkTimer = 2.5;
  }
  if (state.isBlinking) {
    state.blinkDuration -= dt;
    if (state.blinkDuration <= 0) state.isBlinking = false;
  }

  const showLids = Boolean(state.isBlinking || state.defeated);
  const lidScaleY = state.defeated ? 0.88 : 1.0;
  eyelids.forEach(({ upperLid, lowerLid }) => {
    upperLid.visible = showLids;
    lowerLid.visible = showLids;
    if (showLids) {
      upperLid.scale.y = lidScaleY;
      lowerLid.scale.y = lidScaleY;
    }
  });

  sweatDropMesh.visible = state.dangerAlert && !state.defeated && state.mode === 'PLAYING';
  if (sweatDropMesh.visible) {
    sweatDropMesh.position.y = 0.46 + Math.sin(now * 0.025) * 0.08;
  }

  if (state.chewTimer > 0) {
    state.chewTimer -= dt;
    const chewWave = Math.abs(Math.sin(state.chewTimer * 32));
    state.jawAngle = chewWave * 0.35;
    upperHeadPivot.position.y = 0.75 + chewWave * 0.06;
    leftCheek.scale.setScalar(1.35);
    rightCheek.scale.setScalar(1.35);
  } else if (state.tongueState === 'idle') {
    state.jawAngle = THREE.MathUtils.lerp(state.jawAngle, 0, dt * 16);
    upperHeadPivot.position.y = 0.75;
    leftCheek.scale.setScalar(1.0);
    rightCheek.scale.setScalar(1.0);
  }

  lowerJawPivot.rotation.x = state.jawAngle;
  upperHeadPivot.rotation.x = -state.jawAngle * 0.45;
  updateTodeFacialExpression(now, rawDt);

  // Natural Pinkish Tongue Grapple Originating Cleanly from Tode's Open Mouth
  const mouthForward = new THREE.Vector3(Math.sin(state.currentYaw), 0, Math.cos(state.currentYaw));
  const mouthOrigin = todeRoot.position.clone()
    .add(new THREE.Vector3(0, 0.72 * s, 0))
    .addScaledVector(mouthForward, 0.52 * s);

  if (state.tongueState !== 'idle') {
    state.tongueTimer += rawDt;
    tongueGroup.visible = true;
    tongueTipMesh.visible = true;

    if (state.tongueState === 'extending') {
      const extProgress = Math.min(1.0, state.tongueTimer / 0.09);
      if (state.latchedBee && state.latchedBee.alive) {
        state.tongueTargetPos.copy(state.latchedBee.mesh.position);
      }
      state.tongueTipPos.lerpVectors(mouthOrigin, state.tongueTargetPos, extProgress);

      if (extProgress >= 1.0) {
        if (state.latchedBee && state.latchedBee.alive) {
          if (state.latchedBee.kind === 'grapple_post') {
            // Grapple Lily-Post: Zip Tode directly to the post's tile!
            const post = state.latchedBee;
            state.latchedBee = null;
            state.tongueState = 'retracting';
            state.tongueTimer = 0;
            audio.playStickyPop();
            audio.playHop(state.scaleMultiplier * 0.75, true);
            spawnPollenBurst(state.tongueTipPos, 16);
            state.gridX = post.gx;
            state.gridZ = post.gz;
            state.hopActive = true;
            state.hopTime = 0;
            state.hopStartPos.copy(todeRoot.position);
            state.hopEndPos.set(post.gx * TILE_SIZE, post.baseY, -post.gz * TILE_SIZE);
            state.score += 150;
            spawnFloatingPopup(todeRoot.position.clone().add(new THREE.Vector3(0, 1.3, 0)), 'TONGUE ZIP! +150', '', 'boost');
            updateHUD();
          } else {
            state.latchedBee.latched = true;
            audio.playStickyPop();
            spawnPollenBurst(state.tongueTipPos, 8);
            state.tongueState = 'reeling';
            state.tongueTimer = 0;
          }
        } else {
          state.tongueState = 'retracting';
          state.tongueTimer = 0;
        }
      }
    } else if (state.tongueState === 'reeling') {
      const reelProgress = Math.min(1.0, state.tongueTimer / 0.13);
      state.tongueTipPos.lerpVectors(state.tongueTargetPos, mouthOrigin, reelProgress);
      if (state.latchedBee) {
        state.latchedBee.mesh.position.copy(state.tongueTipPos);
        state.latchedBee.mesh.rotation.z += rawDt * 25;
      }
      if (reelProgress >= 1.0) {
        if (state.latchedBee) {
          onSwallowBee(state.latchedBee);
          state.latchedBee = null;
        }
        state.tongueState = 'idle';
        tongueGroup.visible = false;
        tongueTipMesh.visible = false;
      }
    } else if (state.tongueState === 'retracting') {
      const retProgress = Math.min(1.0, state.tongueTimer / 0.09);
      state.tongueTipPos.lerpVectors(state.tongueTargetPos, mouthOrigin, retProgress);
      if (retProgress >= 1.0) {
        state.tongueState = 'idle';
        tongueGroup.visible = false;
        tongueTipMesh.visible = false;
      }
    }

    tongueGroup.position.copy(mouthOrigin);
    tongueGroup.lookAt(state.tongueTipPos);
    const dist = Math.max(0.05, mouthOrigin.distanceTo(state.tongueTipPos));
    tongueRibbonMesh.scale.set(1.0, 1.0, dist);
    tongueTipMesh.position.copy(state.tongueTipPos);
  }

  // Enemy Patrols & Anger Scaling
  let anyBugClose = false;
  const dispersionMult = 1.0 + state.beesEaten * 0.11;
  const angerSpeedMult = 1.0 + state.beesEaten * 0.09;

  bees.forEach((b) => {
    if (!b.alive || b.latched) return;

    b.phase += dt * b.baseSpeed * angerSpeedMult;
    const wingAngle = Math.sin(now * (0.05 + state.beesEaten * 0.004)) * 0.72;
    if (b.leftWing) b.leftWing.rotation.z = wingAngle;
    if (b.rightWing) b.rightWing.rotation.z = -wingAngle;

    if (state.beesEaten >= 4) {
      const angryFlash = Math.sin(now * 0.02 + b.id) > 0;
      b.bodyMesh.material.color.setHex(angryFlash ? 0xf43f5e : b.baseColorHex);
    } else {
      b.bodyMesh.material.color.setHex(b.baseColorHex);
    }

    const prof = getRowProfile(b.gz);
    const minWorldX = (prof.minX - 0.4) * TILE_SIZE;
    const maxWorldX = (prof.maxX + 0.4) * TILE_SIZE;

    const spanX = b.baseSpanX * dispersionMult;
    const spanZ = b.baseSpanZ * dispersionMult;

    let targetX = b.homeX;
    let targetZ = b.homeZ;
    const baseElev = b.baseY || 0;
    let targetY = baseElev + 1.22 + Math.sin(b.phase * 2.5) * 0.16;

    if (b.type === 'sweeper') {
      targetX = b.homeX + Math.sin(b.phase) * spanX;
      targetZ = b.homeZ + Math.cos(b.phase * 2) * (state.beesEaten * 0.08);
    } else if (b.type === 'loop') {
      targetX = b.homeX + Math.cos(b.phase) * spanX;
      targetZ = b.homeZ + Math.sin(b.phase) * spanZ;
    } else if (b.type === 'swooper') {
      // Multi-axis Y-Z aerial dive-bomber swooping high and diving low across the track!
      targetX = b.homeX + Math.sin(b.phase * 0.7) * (spanX * 0.75);
      targetZ = b.homeZ + Math.cos(b.phase) * (spanZ * 1.45);
      targetY = baseElev + 1.85 + Math.sin(b.phase * 2.0) * 0.95;
    } else if (b.type === 'zigzag') {
      // Multi-axis X-Z sharp sawtooth diagonal charger!
      const triWave = (2 / Math.PI) * Math.asin(Math.sin(b.phase * 1.3));
      targetX = b.homeX + triWave * spanX;
      targetZ = b.homeZ + Math.sin(b.phase * 2.6) * spanZ;
    } else if (b.type === 'figure8' || b.type === 'boss') {
      targetX = b.homeX + Math.sin(b.phase) * spanX;
      targetZ = b.homeZ + Math.sin(b.phase * 2.0) * spanZ;
    }

    targetX = THREE.MathUtils.clamp(targetX, minWorldX, maxWorldX);
    const prevX = b.mesh.position.x;
    const prevZ = b.mesh.position.z;

    b.mesh.position.x = THREE.MathUtils.lerp(b.mesh.position.x, targetX, dt * 6);
    b.mesh.position.z = THREE.MathUtils.lerp(b.mesh.position.z, targetZ, dt * 6);
    b.mesh.position.y = THREE.MathUtils.lerp(b.mesh.position.y, targetY, dt * 8);

    const vx = b.mesh.position.x - prevX;
    const vz = b.mesh.position.z - prevZ;
    if (Math.abs(vx) + Math.abs(vz) > 0.001) {
      b.mesh.rotation.y = Math.atan2(vx, vz);
    }

    if (state.mode === 'PLAYING' && !state.fallingDeath && !state.defeated) {
      const toFrog = todeRoot.position.clone().sub(b.mesh.position);
      toFrog.y = 0;
      const dist = toFrog.length();
      if (dist < 3.4) anyBugClose = true;

      const hitRadius = b.type === 'boss' ? 1.35 : 0.96;
      if (dist < hitRadius) {
        const curTheme = (FLOORS[state.floorLevel] || FLOORS[0]).theme;
        let hitMsg = 'Touched an Angry Enemy';
        if (b.type === 'boss') {
          hitMsg = curTheme === 'ocean' ? 'Struck by Abyssal Leviathan' : (curTheme === 'heaven' ? 'Struck by Thunder-Eagle Boss' : 'Struck by Floor Guardian');
        } else if (curTheme === 'ocean') {
          hitMsg = b.type === 'zigzag' ? 'Bitten by Reef Shark' : (b.type === 'swooper' ? 'Lashed by Giant Squid' : 'Struck by Sea Creature');
        } else if (curTheme === 'heaven') {
          hitMsg = b.type === 'swooper' ? 'Struck by Diving Eagle' : (b.type === 'sweeper' ? 'Pecked by Wild Parrot' : 'Struck by Sky Falcon');
        } else {
          hitMsg = 'Stung by Angry Bug';
        }
        damageTode(hitMsg);
      }
    }
  });


  movingPlatforms.forEach((plat) => {
    plat.phase += dt * plat.speed;
    const prevPlatX = plat.mesh.position.x;
    plat.mesh.position.x = (plat.centerX || 0) + Math.sin(plat.phase) * plat.spanX;
    if (state.mode === 'PLAYING' && !state.hopActive && state.gridZ === plat.gz && !validRoadwayTiles.has(tileKey(state.gridX, state.gridZ))) {
      todeRoot.position.x += (plat.mesh.position.x - prevPlatX);
      state.gridX = Math.round(todeRoot.position.x / TILE_SIZE);
    }
  });

  // Rotating Sweeper Beams: Physically push/move Tode instead of killing Tode!
  sweeperBeams.forEach((sw) => {
    sw.angle += dt * sw.speed;
    sw.pivot.rotation.y = sw.angle;

    if (state.mode === 'PLAYING' && !state.hopActive && !state.defeated && !state.fallingDeath) {
      if (Math.abs(state.gridZ - sw.gz) <= 1) {
        const dx = todeRoot.position.x - sw.pivot.position.x;
        const dz = todeRoot.position.z - sw.pivot.position.z;
        const cosA = Math.cos(-sw.angle);
        const sinA = Math.sin(-sw.angle);
        const localX = dx * cosA - dz * sinA;
        const localZ = dx * sinA + dz * cosA;
        if (Math.abs(localX) <= sw.halfLength && Math.abs(localZ) < 0.68) {
          // Compute tangential push direction from beam rotation
          const radialSign = localX >= 0 ? 1 : -1;
          const rotDir = sw.speed >= 0 ? 1 : -1;
          const tangentX = -Math.sin(sw.angle) * radialSign * rotDir;
          const tangentZ = -Math.cos(sw.angle) * radialSign * rotDir;
          const pushDx = Math.abs(tangentX) >= Math.abs(tangentZ) ? (tangentX >= 0 ? 1 : -1) : (dx >= 0 ? 1 : -1);
          const pushDz = Math.abs(tangentZ) > Math.abs(tangentX) ? (tangentZ <= 0 ? 1 : -1) : 0;
          knockbackTode(pushDx, pushDz, 'Pushed by Sweeper');
        }
      }
    }
  });

  // Sliding Lateral Push-Blocks: Physically shove Tode sideways without killing Tode!
  pushBlocks.forEach((pb) => {
    const prevX = pb.mesh.position.x;
    pb.phase += dt * pb.speed;
    pb.mesh.position.x = pb.centerX + Math.sin(pb.phase) * pb.spanX;
    pb.vx = pb.mesh.position.x - prevX;

    if (state.mode === 'PLAYING' && !state.hopActive && !state.defeated && !state.fallingDeath) {
      if (state.gridZ === pb.gz) {
        const distX = todeRoot.position.x - pb.mesh.position.x;
        if (Math.abs(distX) < 1.32) {
          const pushDirX = pb.vx !== 0 ? (pb.vx > 0 ? 1 : -1) : (distX >= 0 ? 1 : -1);
          knockbackTode(pushDirX, 0, 'Shoved by Push-Block');
        }
      }
    }
  });

  // Side Bastion Cannons & Giant Bomb Shells (Full Charge, Muzzle Blast, Recoil & Smoke Trail Animation)
  cannonShooters.forEach((cn) => {
    cn.timer += dt;
    const timeRemaining = cn.interval - cn.timer;

    // Smoothly recover cannon barrel recoil & pitch after firing
    if (cn.recoilOffset > 0.001) {
      cn.recoilOffset = THREE.MathUtils.lerp(cn.recoilOffset, 0, dt * 11.0);
    } else {
      cn.recoilOffset = 0;
    }
    const recoilDir = cn.side < 0 ? -1 : 1;
    cn.barrel.position.x = cn.baseBarrelX + recoilDir * cn.recoilOffset;
    cn.barrel.rotation.z = recoilDir * cn.recoilOffset * 0.28;

    // Animate 3D Muzzle Fireball & Shockwave Ring expansion
    if (cn.flashTimer > 0) {
      cn.flashTimer = Math.max(0, cn.flashTimer - dt);
      const fp = 1.0 - (cn.flashTimer / 0.22);
      if (cn.muzzleFlashGroup) {
        cn.muzzleFlashGroup.visible = true;
        const fScale = THREE.MathUtils.lerp(0.65, 1.85, fp);
        cn.muzzleFlashGroup.scale.setScalar(fScale);
        if (cn.shockRing) {
          cn.shockRing.scale.setScalar(1.0 + fp * 1.4);
        }
      }
      if (cn.flashTimer <= 0 && cn.muzzleFlashGroup) {
        cn.muzzleFlashGroup.visible = false;
      }
    }

    // Pre-Strike Charge-Up Swell, Tremor & Laser Sightline
    if (cn.laserMat) {
      if (timeRemaining <= 0.65 && timeRemaining > 0) {
        cn.laserMat.opacity = 0.42 + 0.48 * Math.abs(Math.sin(now * 0.03));
        const chargeRatio = (0.65 - timeRemaining) / 0.65;
        const swell = 1.0 + chargeRatio * 0.34;
        const tremor = Math.sin(now * 0.09) * 0.04 * chargeRatio;
        cn.barrel.scale.set(1.0 - chargeRatio * 0.10, swell + tremor, swell - tremor);
      } else {
        cn.laserMat.opacity = 0.0;
        cn.barrel.scale.set(1, 1, 1);
      }
    }

    if (cn.timer >= cn.interval) {
      cn.timer = 0;
      cn.recoilOffset = 0.58;
      cn.flashTimer = 0.22;
      if (Math.abs(state.gridZ - cn.gz) <= 10) {
        audio.playCustomSfx("sfx_cannon_fire", 0.85);
        audio.playBonk();
      }
      const spawnPos = new THREE.Vector3(cn.muzzleX, cn.baseY + 1.08, -cn.gz * TILE_SIZE);
      if (Math.abs(state.gridZ - cn.gz) <= 14) {
        spawnPollenBurst(spawnPos, 12);
      }
      const bombMesh = createBombShellMesh();
      bombMesh.position.copy(spawnPos);
      worldGroup.add(bombMesh);
      cannonProjectiles.push({
        mesh: bombMesh,
        gz: cn.gz,
        baseY: cn.baseY + 1.08,
        vx: (cn.side < 0 ? 1 : -1) * (8.5 + Math.abs(state.floorLevel) * 0.8),
        pushDir: cn.side < 0 ? 1 : -1,
        trailTimer: 0,
        life: 2.6
      });
    }
  });

  for (let i = cannonProjectiles.length - 1; i >= 0; i--) {
    const pr = cannonProjectiles[i];
    pr.life -= dt;
    pr.mesh.position.x += pr.vx * dt;
    // Bob and spin the giant bomb shell while flickering its burning fuse spark!
    pr.mesh.position.y = pr.baseY + Math.sin(now * 0.018 + i) * 0.08;
    if (pr.mesh.userData.coreSphere) {
      pr.mesh.userData.coreSphere.rotation.z -= pr.vx * dt * 1.4;
    }
    if (pr.mesh.userData.sparkGroup) {
      const sPulse = 0.82 + Math.sin(now * 0.055 + i * 2.1) * 0.35;
      pr.mesh.userData.sparkGroup.scale.setScalar(sPulse);
      pr.mesh.userData.sparkGroup.rotation.y += dt * 14.0;
    }

    // Emit live ember & smoke trail puffs behind the flying bomb shell
    pr.trailTimer += dt;
    if (pr.trailTimer >= 0.055 && Math.abs(state.gridZ - pr.gz) <= 14) {
      pr.trailTimer = 0;
      const isEmber = Math.random() > 0.45;
      const tMat = new THREE.MeshBasicMaterial({
        color: isEmber ? 0xf97316 : 0x94a3b8
      });
      const pMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), tMat);
      pMesh.position.copy(pr.mesh.position).add(new THREE.Vector3(-Math.sign(pr.vx) * 0.52, (Math.random() - 0.5) * 0.24, (Math.random() - 0.5) * 0.24));
      particlesGroup.add(pMesh);
      particles.push({
        mesh: pMesh,
        vel: new THREE.Vector3(-pr.vx * 0.18, 1.4 + Math.random() * 1.2, (Math.random() - 0.5) * 0.8),
        life: 0.32
      });
    }

    if (state.mode === 'PLAYING' && !state.hopActive && !state.defeated && !state.fallingDeath && !state.victoryCelebrationActive) {
      if (state.gridZ === pr.gz && Math.abs(todeRoot.position.x - pr.mesh.position.x) < 1.32) {
        state.cameraTrauma = Math.min(1.0, state.cameraTrauma + 0.38);
        knockbackTode(pr.pushDir, 0, 'BOMB BLAST!');
        spawnPollenBurst(pr.mesh.position, 26);
        pr.life = 0;
      }
    }

    if (pr.life <= 0 || Math.abs(pr.mesh.position.x) > 28) {
      worldGroup.remove(pr.mesh);
      cannonProjectiles.splice(i, 1);
    }
  }

  // Overhead Swinging Pendulum Battle-Axes (X-Y Plane Arc + Floor Shadow Dot + Whoosh SFX)
  pendulumAxes.forEach((ax) => {
    ax.phase += dt * ax.speed;
    const swingAngle = Math.sin(ax.phase) * ax.maxAngle;
    ax.pivot.rotation.z = swingAngle;
    if (ax.bladeShadowDot) {
      ax.bladeShadowDot.position.x = Math.sin(swingAngle) * ax.rodLen;
    }
    const curSign = Math.sign(swingAngle);
    if (curSign !== 0 && curSign !== ax.lastWhooshSign) {
      ax.lastWhooshSign = curSign;
      if (state.mode === 'PLAYING' && Math.abs(state.gridZ - ax.gz) <= 5) {
        audio.playAxeWhoosh();
      }
    }

    if (state.mode === 'PLAYING' && !state.hopActive && !state.defeated && !state.fallingDeath && !state.victoryCelebrationActive) {
      if (state.gridZ === ax.gz) {
        const bladeWorldX = (ax.centerX || 0) + Math.sin(swingAngle) * ax.rodLen;
        const bladeHeightAboveGround = (ax.rodLen + 0.85) - Math.cos(swingAngle) * ax.rodLen;
        if (bladeHeightAboveGround < 1.65 && Math.abs(todeRoot.position.x - bladeWorldX) < 1.15) {
          const pushDir = Math.cos(ax.phase) >= 0 ? 1 : -1;
          knockbackTode(pushDir, 0, 'Clipped by Swinging Axe!');
        }
      }
    }
  });

  // Vertical Thwomp Crusher Monoliths (Y-Axis Slam)
  crusherBlocks.forEach((cr) => {
    cr.cycleTimer = (cr.cycleTimer + dt) % cr.cycleDuration;
    const p = cr.cycleTimer / cr.cycleDuration;
    let h = 3.2;
    if (p < 0.45) {
      // Hovering & telegraph tremor
      h = 3.2 + (p > 0.32 ? Math.sin(now * 0.08) * 0.08 : 0);
    } else if (p < 0.56) {
      // Rapid vertical slam down Y-axis!
      const tSlam = (p - 0.45) / 0.11;
      h = THREE.MathUtils.lerp(3.2, 0.0, tSlam * tSlam);
    } else if (p < 0.72) {
      if (cr.currentHeight > 0.05) {
        if (Math.abs(state.gridZ - cr.gz) <= 8) {
          audio.playCustomSfx("sfx_thwomp_slam", 0.85);
          spawnPollenBurst(new THREE.Vector3(cr.gx * TILE_SIZE, cr.baseY + 0.15, -cr.gz * TILE_SIZE), 10);
        }
      }
      h = 0.0;
    } else {
      // Rise back up
      const tRise = (p - 0.72) / 0.28;
      h = THREE.MathUtils.lerp(0.0, 3.2, tRise);
    }
    cr.currentHeight = h;
    cr.mesh.position.y = cr.baseY + h;
    const ringScale = THREE.MathUtils.lerp(1.25, 0.55, h / 3.2);
    cr.shadowRing.scale.set(ringScale, ringScale, 1);

    if (state.mode === 'PLAYING' && !state.hopActive && !state.defeated && !state.fallingDeath && !state.victoryCelebrationActive) {
      if (state.gridZ === cr.gz && state.gridX === cr.gx && h < 1.15) {
        knockbackTode(0, -1, 'Repelled by Thwomp Slam!');
      }
    }
  });

  // Rolling Spiked Timber Logs (Z-Axis Hill Rollers)
  rollingLogs.forEach((rl) => {
    const spanRows = Math.abs(rl.startGz - rl.endGz);
    rl.progress = (rl.progress + (dt * rl.speed) / Math.max(1, spanRows * TILE_SIZE)) % 1.0;
    rl.currentGz = THREE.MathUtils.lerp(rl.startGz, rl.endGz, rl.progress);
    const curZ = -rl.currentGz * TILE_SIZE;
    const curY = getTileElevation(state.floorLevel, rl.gx, Math.round(rl.currentGz)) + 0.44;
    rl.mesh.position.set(rl.gx * TILE_SIZE, curY, curZ);
    rl.mesh.rotation.x -= dt * rl.speed * 2.2;

    if (state.mode === 'PLAYING' && !state.hopActive && !state.defeated && !state.fallingDeath && !state.victoryCelebrationActive) {
      if (Math.abs(todeRoot.position.z - curZ) < 0.95 && Math.abs(todeRoot.position.x - rl.mesh.position.x) < rl.halfWidth) {
        const sidePush = todeRoot.position.x >= rl.mesh.position.x ? 1 : -1;
        knockbackTode(sidePush, -1, 'Rolled by Spiked Log!');
      }
    }
  });

  state.dangerAlert = anyBugClose;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.vel.y -= 12.5 * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    p.mesh.rotation.x += dt * 8;
    p.mesh.scale.setScalar(Math.max(0.01, p.life * 2));
    if (p.life <= 0) {
      particlesGroup.remove(p.mesh);
      particles.splice(i, 1);
    }
  }

  animatedProps.forEach((prop) => {
    if (prop.type === 'portal') {
      prop.mesh.rotation.z += dt * prop.speed;
    } else if (prop.type === 'pulse') {
      const pulse = 1.0 + Math.sin(now * 0.004 + prop.phase) * 0.05;
      prop.mesh.scale.set(pulse, 1.0 / pulse, pulse);
    } else if (prop.type === 'spinBob') {
      prop.mesh.rotation.y += dt * 1.8;
      prop.mesh.position.y = prop.baseY + Math.sin(now * 0.003 + prop.phase) * 0.18;
    } else if (prop.type === 'bob') {
      prop.mesh.position.y = Math.sin(now * 0.003 + prop.phase) * 0.25;
    } else if (prop.type === 'tuft') {
      prop.mesh.rotation.z = Math.sin(now * 0.0025 + prop.phase) * 0.20;
    } else if (prop.type === 'cloud') {
      prop.mesh.position.y = prop.baseY + Math.sin(now * 0.0014 + prop.phase) * 0.55;
    } else if (prop.type === 'riverFlow') {
      prop.mesh.position.x += dt * 2.8;
      if (prop.mesh.position.x > 16) prop.mesh.position.x = -16;
    } else if (prop.type === 'bubbleRise') {
      prop.mesh.position.y = prop.baseY + ((now * 0.0008 + prop.phase) % 1.25);
      const s = 0.75 + Math.sin(now * 0.005 + prop.phase) * 0.25;
      prop.mesh.scale.setScalar(s);
    } else if (prop.type === 'fogDrift') {
      prop.mesh.position.x = prop.baseX + Math.sin(now * 0.0012 + prop.phase) * 0.85;
    } else if (prop.type === 'waterWave') {
      prop.mesh.position.y = prop.baseY + Math.sin(now * 0.0018) * 0.12;
    } else if (prop.type === 'singingParrot') {
      const songWave = now * 0.0065 + prop.phase;
      prop.mesh.position.y = Math.abs(Math.sin(songWave)) * 0.10;
      prop.mesh.rotation.z = Math.sin(songWave * 0.7) * 0.14;
      const flap = Math.sin(songWave * 2.2) * 0.35;
      if (prop.leftWing) prop.leftWing.rotation.z = flap;
      if (prop.rightWing) prop.rightWing.rotation.z = -flap;
      if (prop.noteSprite) {
        const noteCycle = (now * 0.0012 + prop.phase) % 1.0;
        prop.noteSprite.position.y = 0.88 + noteCycle * 0.55;
        prop.noteSprite.position.x = Math.sin(noteCycle * Math.PI * 2 + prop.phase) * 0.18;
        prop.noteSprite.material.opacity = Math.sin(noteCycle * Math.PI);
      }
    }
  });

  // Sync custom BGM slot hook based on current mode, floor biome, boss proximity (Row >= 82), or victory dance
  audio.syncStageBgm(state.floorLevel, state.mode, state.gridZ >= ROADWAY_LENGTH - 14, state.victoryCelebrationActive, Boolean(state.defeated || state.fallingDeath));

  // Update Live Orthographic Top-Down Minimap every frame during gameplay
  if (state.mode === 'PLAYING' || state.mode === 'TRANSITION_TO_PLAY') {
    renderLiveMinimap();
  }

  // -----------------------------------------------------------------------
  // CAMERA SYSTEM: INSTANT FROG-CENTERED GAMEPLAY TRACKING
  // Keeps Tode dead-center on the gameplay screen with instant responsiveness!
  // -----------------------------------------------------------------------
  if (state.cameraTrauma > 0) {
    state.cameraTrauma = Math.max(0, state.cameraTrauma - rawDt * 3.2);
  }
  const shakeMag = state.cameraTrauma * state.cameraTrauma * 0.12;
  const shakeX = (Math.random() - 0.5) * shakeMag;
  const shakeY = (Math.random() - 0.5) * shakeMag;

  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const isPortrait = aspect < 1.0;
  const isWide = window.innerWidth >= 1024;

  // Portrait horizontal-FOV compensation so Tode & the 3D arena never zoom-clip on phones
  const portraitZoomBack = isPortrait ? THREE.MathUtils.clamp((1.0 - aspect) * 6.2, 0, 3.8) : 0;
  const wideToggleExtra = state.mobileWideView ? 2.4 : 0;
  const targetLandingFov = isPortrait ? 48 : 38;
  const targetPlayFov = (isPortrait ? 54 : 42) + (state.mobileWideView ? 6 : 0);

  const faceCamPos = new THREE.Vector3(
    isWide ? -0.65 : (isPortrait ? 0.0 : 0.15),
    1.88 + portraitZoomBack * 0.22,
    5.75 + portraitZoomBack * 1.15
  );
  const faceLookAt = new THREE.Vector3(
    isWide ? -0.25 : (isPortrait ? 0.0 : 0.35),
    isPortrait ? 1.05 : 1.15,
    -4.5
  );

  // Instant Frog-Centered Tracking: X and Z lock directly to Tode's live position
  const currentHillY = getSurfaceY(state.gridX, state.gridZ);
  state.smoothFocusX = todeRoot.position.x;
  state.smoothFocusZ = todeRoot.position.z;
  state.smoothFocusY = THREE.MathUtils.lerp(state.smoothFocusY || 0, currentHillY, Math.min(1, rawDt * 16.0));

  const playCamPos = new THREE.Vector3(
    todeRoot.position.x + shakeX,
    12.4 + portraitZoomBack * 1.35 + wideToggleExtra + state.smoothFocusY * 0.85 + shakeY,
    todeRoot.position.z + 12.8 + portraitZoomBack * 1.45 + wideToggleExtra
  );
  // Subtle Dogleg Look-Ahead: Blend 0.55 units toward upcoming row centerline while keeping Tode centered
  const lookAheadCol = getTrackCenterCol(state.floorLevel, Math.min(ROADWAY_LENGTH, state.gridZ + 4));
  const doglegBiasX = THREE.MathUtils.clamp((lookAheadCol * TILE_SIZE - todeRoot.position.x) * 0.14, -0.65, 0.65);

  const playLookAt = new THREE.Vector3(
    todeRoot.position.x + doglegBiasX,
    0.75 + state.smoothFocusY * 0.85,
    todeRoot.position.z - (isPortrait ? 3.2 : 2.6)
  );

  if (state.mode === 'LANDING') {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetLandingFov, rawDt * 4);
    camera.updateProjectionMatrix();
    camera.position.lerp(faceCamPos, rawDt * 5);
    camera.lookAt(faceLookAt);
  } else if (state.mode === 'STORY_INTRO') {
    const ch = STORY_INTRO_CHAPTERS[state.storyIntroStep] || STORY_INTRO_CHAPTERS[0];
    const beatDur = ch.duration || 4.2;
    const rawT = THREE.MathUtils.clamp(state.storyIntroStepTimer / beatDur, 0, 1);
    const easeT = rawT * rawT * (3 - 2 * rawT); // Smoothstep interpolation

    const fovA = ch.fovStart || 40;
    const fovB = ch.fovEnd || fovA;
    const targetFov = THREE.MathUtils.lerp(fovA, fovB, easeT) + (isPortrait ? 7 : 0);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, Math.min(1, rawDt * 6.0));
    camera.updateProjectionMatrix();

    if (!window._storyLookVec) {
      window._storyLookVec = new THREE.Vector3(0, 1, -4);
    }

    if (ch.camMode === 'first_person_tode') {
      // True 1st-Person Toad Eye-Level POV looking down the winding 96-row causeway
      camera.up.set(0, 1, 0);
      const eyeWorldPos = todeRoot.position.clone().add(new THREE.Vector3(0, 1.48, -0.55));
      camera.position.lerp(eyeWorldPos, Math.min(1, rawDt * 12.0));
      const lookTarget = new THREE.Vector3(
        THREE.MathUtils.lerp(ch.lookStart.x, ch.lookEnd.x, easeT),
        THREE.MathUtils.lerp(ch.lookStart.y, ch.lookEnd.y, easeT),
        THREE.MathUtils.lerp(ch.lookStart.z, ch.lookEnd.z, easeT)
      );
      window._storyLookVec.lerp(lookTarget, Math.min(1, rawDt * 8.0));
      camera.lookAt(window._storyLookVec);
    } else if (ch.camMode === 'orbit_tode') {
      // 360-Degree Wardrobe Showcase Orbit around Tode
      camera.up.set(0, 1, 0);
      const orbitAng = easeT * Math.PI * 2.0;
      const radius = 4.6 + portraitZoomBack * 0.65;
      const desiredCam = new THREE.Vector3(
        todeRoot.position.x + Math.sin(orbitAng) * radius,
        todeRoot.position.y + 2.15 + Math.sin(easeT * Math.PI) * 0.55,
        todeRoot.position.z + Math.cos(orbitAng) * radius
      );
      camera.position.lerp(desiredCam, Math.min(1, rawDt * 8.0));
      const desiredLook = todeRoot.position.clone().add(new THREE.Vector3(0, 0.85, 0));
      window._storyLookVec.lerp(desiredLook, Math.min(1, rawDt * 10.0));
      camera.lookAt(window._storyLookVec);
    } else {
      // Keyframed Cinematic Dolly / Crane / Dutch-Angle Shot
      if (ch.camMode === 'dutch_action') {
        const tilt = Math.sin(easeT * Math.PI) * 0.085;
        camera.up.set( tilt, 1, 0 ).normalize();
      } else {
        camera.up.set(0, 1, 0);
      }
      const desiredCam = new THREE.Vector3(
        THREE.MathUtils.lerp(ch.camStart.x, ch.camEnd.x, easeT),
        THREE.MathUtils.lerp(ch.camStart.y, ch.camEnd.y, easeT) + portraitZoomBack * 0.55,
        THREE.MathUtils.lerp(ch.camStart.z, ch.camEnd.z, easeT) + portraitZoomBack * 0.75
      );
      const desiredLook = new THREE.Vector3(
        THREE.MathUtils.lerp(ch.lookStart.x, ch.lookEnd.x, easeT),
        THREE.MathUtils.lerp(ch.lookStart.y, ch.lookEnd.y, easeT),
        THREE.MathUtils.lerp(ch.lookStart.z, ch.lookEnd.z, easeT)
      );
      camera.position.lerp(desiredCam, Math.min(1, rawDt * 5.2));
      window._storyLookVec.lerp(desiredLook, Math.min(1, rawDt * 6.0));
      camera.lookAt(window._storyLookVec);
    }
  } else if (state.mode === 'TRANSITION_TO_PLAY') {
    const t = state.transitionProgress;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.fov = THREE.MathUtils.lerp(targetLandingFov, targetPlayFov, ease);
    camera.updateProjectionMatrix();
    camera.position.lerpVectors(faceCamPos, playCamPos, ease);
    const curLook = new THREE.Vector3().lerpVectors(faceLookAt, playLookAt, ease);
    camera.lookAt(curLook);
  } else if (state.victoryCelebrationActive) {
    // 360-Degree Celebratory Achievement Replay Orbit around Tode!
    camera.fov = THREE.MathUtils.lerp(camera.fov, 34, rawDt * 4.0);
    camera.updateProjectionMatrix();
    const orbitRadius = 6.8;
    const orbitCamPos = new THREE.Vector3(
      todeRoot.position.x + Math.sin(state.victoryOrbitAngle) * orbitRadius,
      todeRoot.position.y + 3.1 + Math.sin(state.victoryOrbitAngle * 2.0) * 0.45,
      todeRoot.position.z + Math.cos(state.victoryOrbitAngle) * orbitRadius
    );
    camera.position.lerp(orbitCamPos, rawDt * 6.5);
    camera.lookAt(todeRoot.position.clone().add(new THREE.Vector3(0, 0.85, 0)));
  } else if (state.hoopTransitionActive && !state.hoopTransSwapped) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, 30, rawDt * 5.5);
    camera.updateProjectionMatrix();
    const hoopCamPos = state.hoopCenterPos.clone().add(new THREE.Vector3(0, 3.2, 8.2));
    camera.position.lerp(hoopCamPos, rawDt * 6.0);
    camera.lookAt(state.hoopCenterPos);
  } else if (state.fallingDeath) {
    const fallCamPos = new THREE.Vector3(todeRoot.position.x * 0.7, 9.8, todeRoot.position.z + 9.5);
    camera.position.lerp(fallCamPos, rawDt * 2.4);
    camera.lookAt(todeRoot.position);
  } else if (state.defeated) {
    state.defeatFov = THREE.MathUtils.lerp(state.defeatFov, 28, rawDt * 2.0);
    camera.fov = state.defeatFov;
    camera.updateProjectionMatrix();
    const desiredPos = todeRoot.position.clone().add(new THREE.Vector3(0, 4.2, 7.6));
    camera.position.lerp(desiredPos, rawDt * 2.2);
    camera.lookAt(todeRoot.position.clone().add(new THREE.Vector3(0, 0.55, 0)));
  } else {
    camera.fov = targetPlayFov;
    camera.updateProjectionMatrix();
    // Instant responsive follow so Tode stays dead-center at all times
    camera.position.lerp(playCamPos, Math.min(1, rawDt * 24.0));
    camera.lookAt(playLookAt);
  }

  // Update Grapple Lily-Post active/passed states (deactivate once Tode reaches or passes their row!)
  grappleTargets.forEach((gt) => {
    if (gt.kind === 'grapple_post' && gt.alive) {
      const nowPassed = (state.gridZ >= gt.gz) || (gt.mesh.position.z >= todeRoot.position.z - 0.5);
      if (nowPassed !== gt.passed) {
        gt.passed = nowPassed;
        if (gt.ringMesh) gt.ringMesh.visible = !nowPassed;
        if (gt.lotusBulb && gt.passedLotusMat && gt.activeLotusMat) {
          gt.lotusBulb.material = nowPassed ? gt.passedLotusMat : gt.activeLotusMat;
        }
      }
    }
  });

  // Update Live 3D Pink Target Lock-On Reticle Ring on nearest in-range target
  if (state.mode === 'PLAYING' && !state.defeated && !state.fallingDeath && state.tongueState === 'idle') {
    const maxRange = 8.4 * state.scaleMultiplier;
    let lockCand = null;
    let lockBest = Infinity;
    const fwd = new THREE.Vector3(Math.sin(state.currentYaw), 0, Math.cos(state.currentYaw));
    const checkLock = (c) => {
      if (!c.alive || c.latched) return;
      if (c.kind === 'grapple_post' && (c.passed || state.gridZ >= c.gz || c.mesh.position.z >= todeRoot.position.z - 0.5)) {
        return;
      }
      const dVec = c.mesh.position.clone().sub(todeRoot.position);
      const dist = dVec.length();
      if (dist <= maxRange && dist > 0.1) {
        const score = dist - fwd.dot(dVec.clone().setY(0).normalize()) * 1.25;
        if (score < lockBest) {
          lockBest = score;
          lockCand = c;
        }
      }
    };
    bees.forEach(checkLock);
    grappleTargets.forEach(checkLock);
    if (lockCand) {
      targetReticleGroup.visible = true;
      targetReticleGroup.position.copy(lockCand.mesh.position);
      targetReticleGroup.position.y = (lockCand.baseY || 0) + 0.08;
      const pulse = 1.0 + Math.sin(now * 0.014) * 0.14;
      targetReticleGroup.scale.set(pulse, pulse, pulse);
    } else {
      targetReticleGroup.visible = false;
    }
  } else {
    targetReticleGroup.visible = false;
  }

  // Poll HTML5 Gamepad API for Native Bluetooth / USB Controller Support
  if (navigator.getGamepads) {
    const pads = navigator.getGamepads();
    const gp = pads && (pads[0] || pads[1] || pads[2] || pads[3]);
    if (gp) {
      if (!window._gpPrev) window._gpPrev = {};
      const pressed = (idx) => Boolean(gp.buttons[idx] && gp.buttons[idx].pressed);
      const justPressed = (key, cur) => {
        const was = Boolean(window._gpPrev[key]);
        window._gpPrev[key] = cur;
        return cur && !was;
      };
      const stickX = gp.axes[0] || 0;
      const stickY = gp.axes[1] || 0;
      if (justPressed('up', pressed(12) || stickY < -0.55)) attemptHop(0, 1);
      if (justPressed('down', pressed(13) || stickY > 0.55)) attemptHop(0, -1);
      if (justPressed('left', pressed(14) || stickX < -0.55)) attemptHop(-1, 0);
      if (justPressed('right', pressed(15) || stickX > 0.55)) attemptHop(1, 0);
      if (justPressed('action', pressed(0) || pressed(2) || pressed(7))) {
        if (state.defeated || state.fallingDeath) reviveAtLastCheckpoint();
        else if (state.mode === 'LANDING') startPlayFromLanding(0);
        else fireTongueGrapple();
      }
      if (justPressed('start', pressed(9))) {
        if (isAnyModalOpen()) closeAllModals(true);
        else openSettingsModal();
      }
    }
  }

  if (activeHeadPopups.length > 0) {
    updateActiveHeadPopups();
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.onload = () => {
  ensurePlayerName();
  renderLeaderboardUI();
  renderSkinSelectorUI();
  syncSettingsModalUI();
  syncCornerMusicButtonUI();
  state.floorLevel = 0;
  todeRoot.position.set(0.65, 0, 0.35);
  state.targetYaw = -0.38;
  state.currentYaw = -0.38;
  todeRoot.rotation.y = -0.38;
  buildRoadwayWorld();
  populateRoadwayBees();
  audio.playCalmTheme(true);
  requestAnimationFrame(animate);
};
