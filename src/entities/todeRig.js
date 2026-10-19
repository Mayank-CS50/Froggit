/**
 * THE FROGGIT — Mascot Tode 3D Rig, Dynamic Skin Switcher, Pink Tongue & 3D Lock-On Reticle
 * File: src/entities/todeRig.js
 */
// =========================================================================
// 4. JETBRAINS MASCOT TODE 3D RIG (With Real-Life Shading & Situational Faces)
//    Faithfully modeled after the uploaded JetBrains Mascot reference images:
//    - Twin raised rounded-box eye towers with a distinct central valley gap
//    - Wide protruding side cheek extensions ("ears"/jowls)
//    - Signature black pixel-corner grin mouth bar (morphs to open rectangle for tongue)
//    - Darker emerald torso block beneath brighter emerald head, darker outer
//      haunches, and stepped L-shaped brighter emerald front legs
//    - Situational Eye & Face States:
//      * Normal / Directional Gaze (looks left, right, up, or at nearest bug)
//      * Dizzy Square-Spiral Eyes (on bonk/knockback or wipeout — ref 155426.png)
//      * Joyful Happy Chevron Eyes (during victory dance, chewing, or boost)
//      * Open Mouth + Electric Indigo-Violet Tongue (#6366f1 — ref 155510.png)
// =========================================================================
const todeRoot = new THREE.Group();
scene.add(todeRoot);

const todeSquashGroup = new THREE.Group();
todeRoot.add(todeSquashGroup);

// Rich contrast emerald palette matching JetBrains mascot + real-life depth
const matFrogGreen = createVoxelMaterial('frog_skin', 0x10b981, 0x059669, { roughness: 0.38 }); // Bright emerald head & front legs (#10b981)
const matFrogDark = createVoxelMaterial('frog_skin', 0x059669, 0x047857, { roughness: 0.44 });  // Deeper emerald torso & outer haunches (#059669)
const matFrogDeepShadow = createVoxelMaterial('frog_skin', 0x047857, 0x064e3b, { roughness: 0.48 });
const matFrogBelly = createVoxelMaterial('frog_belly', 0x34d399, 0x10b981, { roughness: 0.46 });
const matThroatSac = createVoxelMaterial('frog_belly', 0x6ee7b7, 0x34d399, { roughness: 0.55 });
const matBlush = createVoxelMaterial('crystal_gem', 0xf472b6, 0xec4899, { roughness: 0.50 });
const matEyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18 });
const matPupil = new THREE.MeshStandardMaterial({ color: 0x05080f, roughness: 0.12 });
const matMouthBlack = new THREE.MeshStandardMaterial({ color: 0x05080f, roughness: 0.25 });
const matTonguePink = createVoxelMaterial('frog_belly', 0xf472b6, 0xfb7185, {
  roughness: 0.36,
  emissive: 0xdb2777,
  emissiveIntensity: 0.10
}); // Natural pinkish-rose frog tongue
const matSweatDrop = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

// Procedural Square-Spiral Dizzy Eye Texture (exact match to Screenshot 2026-10-12 155426.png)
function createDizzySpiralTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#05080f';
  ctx.lineWidth = 13;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';

  // Rectangular inward pixel spiral
  ctx.beginPath();
  ctx.moveTo(16, 112);
  ctx.lineTo(16, 16);
  ctx.lineTo(112, 16);
  ctx.lineTo(112, 112);
  ctx.lineTo(38, 112);
  ctx.lineTo(38, 40);
  ctx.lineTo(90, 40);
  ctx.lineTo(90, 88);
  ctx.lineTo(60, 88);
  ctx.lineTo(60, 62);
  ctx.lineTo(72, 62);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.encoding = THREE.sRGBEncoding;
  tex.needsUpdate = true;
  return tex;
}

// Procedural Joyful Chevron Eye Texture (for Victory Dance & Checkpoint Celebration)
function createHappyChevronEyeTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#10b981';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#05080f';
  ctx.lineWidth = 18;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(22, 82);
  ctx.lineTo(64, 38);
  ctx.lineTo(106, 82);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.encoding = THREE.sRGBEncoding;
  tex.needsUpdate = true;
  return tex;
}

const matDizzySpiral = new THREE.MeshBasicMaterial({ map: createDizzySpiralTexture() });
const matHappyEye = new THREE.MeshBasicMaterial({ map: createHappyChevronEyeTexture() });

function refreshFrogMaterialsForPack() {
  const skin = FROG_SKINS[state.activeSkin] || FROG_SKINS.emerald;
  const applyGradientMat = (mat, pattern, baseHex, secHex, rough = 0.40) => {
    const pair = getVoxelTexturePair(pattern, baseHex, secHex);
    mat.color.setHex(0xffffff);
    mat.map = pair.map;
    mat.bumpMap = pair.bumpMap;
    mat.bumpScale = pair.bumpScale || 0.016;
    if (mat.emissive) mat.emissive.setHex(baseHex);
    mat.emissiveIntensity = 0.06;
    mat.roughness = rough;
    mat.metalness = 0.08;
    mat.needsUpdate = true;
  };
  applyGradientMat(matFrogGreen, 'frog_skin', skin.headHex, skin.torsoHex, 0.36);
  applyGradientMat(matFrogDark, 'frog_skin', skin.torsoHex, skin.shadowHex, 0.44);
  applyGradientMat(matFrogDeepShadow, 'frog_skin', skin.shadowHex, 0x064e3b, 0.48);
  applyGradientMat(matFrogBelly, 'frog_belly', skin.bellyHex, skin.headHex, 0.44);
  applyGradientMat(matThroatSac, 'frog_belly', skin.sacHex, skin.bellyHex, 0.52);
  applyGradientMat(matBlush, 'crystal_gem', 0xf472b6, 0xec4899, 0.48);
  applyGradientMat(matTonguePink, 'frog_belly', 0xf472b6, 0xfb7185, 0.36);
}

function renderSkinSelectorUI() {
  const landingFirefliesEl = document.getElementById('landing-fireflies-val');
  if (landingFirefliesEl) landingFirefliesEl.textContent = state.fireflies.toLocaleString();
  const hudFirefliesEl = document.getElementById('hud-fireflies-badge');
  if (hudFirefliesEl) hudFirefliesEl.textContent = `✨ ${state.fireflies}`;

  const bar = document.getElementById('landing-skin-selector');
  if (!bar) return;
  bar.innerHTML = Object.values(FROG_SKINS).map((sk) => {
    const isUnlocked = state.unlockedSkins.includes(sk.id) || sk.cost === 0;
    const isActive = state.activeSkin === sk.id;
    const canAfford = state.fireflies >= sk.cost;
    const label = isUnlocked ? sk.name : `${sk.name} (${sk.cost}✨)`;
    return `
      <button
        type="button"
        data-skin-id="${sk.id}"
        class="skin-chip-btn ${isActive ? 'active' : ''} ${!isUnlocked && !canAfford ? 'opacity-60' : ''}"
        title="${isUnlocked ? 'Equip ' + sk.name : 'Unlock for ' + sk.cost + ' Golden Fireflies'}"
      >
        <span>${sk.icon}</span>
        <span>${label}</span>
      </button>
    `;
  }).join('');

  bar.querySelectorAll('[data-skin-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const skId = btn.getAttribute('data-skin-id');
      const sk = FROG_SKINS[skId];
      if (!sk) return;
      const isUnlocked = state.unlockedSkins.includes(skId) || sk.cost === 0;
      if (isUnlocked) {
        state.activeSkin = skId;
        audio.playFrogRibbit();
        refreshFrogMaterialsForPack();
        persistSettings();
        renderSkinSelectorUI();
      } else if (state.fireflies >= sk.cost) {
        state.fireflies -= sk.cost;
        state.unlockedSkins.push(skId);
        state.activeSkin = skId;
        audio.playCheckpointChime();
        refreshFrogMaterialsForPack();
        persistSettings();
        renderSkinSelectorUI();
      } else {
        audio.playBonk();
      }
    });
  });
}

// 1. Darker Emerald Textured Lower Torso Block (Zero Coplanar Box Overlap)
const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.64, 1.18), matFrogDark);
torsoMesh.position.set(0, 0.38, 0);
torsoMesh.castShadow = true;
torsoMesh.receiveShadow = true;
todeSquashGroup.add(torsoMesh);

// Front belly plate sits cleanly in front of torsoMesh (front face z = 0.59 -> belly z = 0.604)
const bellyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.44, 0.024), matFrogBelly);
bellyMesh.position.set(0, 0.35, 0.604);
todeSquashGroup.add(bellyMesh);

// Subtle dorsal texture warts sitting cleanly above torso top (y = 0.70 -> wart center 0.722)
const wartPositions = [
  [-0.32, 0.722, -0.28], [0.32, 0.722, -0.28],
  [0, 0.722, -0.42], [-0.25, 0.722, -0.08], [0.25, 0.722, -0.08]
];
wartPositions.forEach(([wx, wy, wz]) => {
  const wart = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.15), matFrogDeepShadow);
  wart.position.set(wx, wy, wz);
  todeSquashGroup.add(wart);
});

// 2. Upper Head & Wide Protruding Cheek Extensions (Flush Non-Overlapping Side Lobes)
const upperHeadPivot = new THREE.Group();
upperHeadPivot.position.set(0, 0.68, -0.06);
todeSquashGroup.add(upperHeadPivot);

// Wide cheek/snout bar (x: -0.87..+0.87, y: -0.06..+0.38, z: -0.43..+0.71)
const upperJawMesh = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.44, 1.14), matFrogGreen);
upperJawMesh.position.set(0, 0.16, 0.14);
upperJawMesh.castShadow = true;
upperJawMesh.receiveShadow = true;
upperHeadPivot.add(upperJawMesh);

// Flush outer cheek lobes (x = ±0.95, width = 0.16 -> inner face at ±0.87, zero overlap with upperJawMesh!)
const leftCheekLobe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.92), matFrogGreen);
leftCheekLobe.position.set(-0.95, 0.16, 0.14);
leftCheekLobe.castShadow = true;
upperHeadPivot.add(leftCheekLobe);

const rightCheekLobe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.92), matFrogGreen);
rightCheekLobe.position.set(0.95, 0.16, 0.14);
rightCheekLobe.castShadow = true;
upperHeadPivot.add(rightCheekLobe);

// Subtle rosy cheek glow plates cleanly in front of upperJawMesh front face (z = 0.71 -> 0.724)
const leftCheek = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), matBlush);
leftCheek.position.set(-0.72, 0.12, 0.724);
leftCheek.visible = false;
upperHeadPivot.add(leftCheek);

const rightCheek = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), matBlush);
rightCheek.position.set(0.72, 0.12, 0.724);
rightCheek.visible = false;
upperHeadPivot.add(rightCheek);

const sweatDropMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.14), matSweatDrop);
sweatDropMesh.position.set(0.92, 0.58, 0.35);
sweatDropMesh.visible = false;
upperHeadPivot.add(sweatDropMesh);

// 3. Twin Raised Eye Towers with Strictly Separated Z-Planes & Hidden-When-Open Eyelids!
//    (Eliminates the overlapping green eyelid bars & sclera/pupil Z-fighting from image_18b997.jpg)
const leftEyeGroup = new THREE.Group();
leftEyeGroup.position.set(-0.46, 0.60, 0.16);
upperHeadPivot.add(leftEyeGroup);

const rightEyeGroup = new THREE.Group();
rightEyeGroup.position.set(0.46, 0.60, 0.16);
upperHeadPivot.add(rightEyeGroup);

const eyelids = [];
const pupils = [];
const dizzyEyePlanes = [];
const happyEyePlanes = [];
const scleraMeshes = [];

[leftEyeGroup, rightEyeGroup].forEach((eyeGrp) => {
  // Outer bright-green eye tower: depth 0.80 -> front face at z = +0.400, top at y = +0.290
  const socket = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.58, 0.80), matFrogGreen);
  socket.castShadow = true;
  socket.receiveShadow = true;
  eyeGrp.add(socket);

  // Crown bevel cap sitting cleanly on top of socket (bottom at y = +0.290, center at y = +0.320)
  const socketCap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.72), matFrogGreen);
  socketCap.position.set(0, 0.32, 0);
  eyeGrp.add(socketCap);

  // Crisp white rectangular eye sclera plate in front of socket (back at 0.402, front at 0.422)
  const sclera = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.02), matEyeWhite);
  sclera.position.set(0, -0.01, 0.412);
  eyeGrp.add(sclera);
  scleraMeshes.push(sclera);

  // Large rectangular black mascot pupil cleanly in front of sclera (back at 0.424, front at 0.444)
  const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.02), matPupil);
  pupil.position.set(0, -0.01, 0.434);

  // Crisp white catchlight glint on pupil front (z = +0.014 local -> 0.448 world)
  const glint = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.008), matEyeWhite);
  glint.position.set(0.065, 0.08, 0.014);
  pupil.add(glint);

  eyeGrp.add(pupil);
  pupils.push(pupil);

  // Dizzy Square-Spiral Eye Overlay (z = 0.436, only visible when dizzy)
  const dizzyPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.44), matDizzySpiral);
  dizzyPlane.position.set(0, -0.01, 0.436);
  dizzyPlane.visible = false;
  eyeGrp.add(dizzyPlane);
  dizzyEyePlanes.push(dizzyPlane);

  // Joyful Happy Chevron Eye Overlay (z = 0.437, only visible when happy)
  const happyPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.45), matHappyEye);
  happyPlane.position.set(0, -0.01, 0.437);
  happyPlane.visible = false;
  eyeGrp.add(happyPlane);
  happyEyePlanes.push(happyPlane);

  // Eyelids sit at z = 0.456 and are COMPLETELY HIDDEN unless blinking or defeated!
  const upperLid = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.23, 0.02), matFrogDark);
  upperLid.position.set(0, 0.11, 0.456);
  upperLid.visible = false;
  eyeGrp.add(upperLid);

  const lowerLid = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.23, 0.02), matFrogGreen);
  lowerLid.position.set(0, -0.12, 0.456);
  lowerLid.visible = false;
  eyeGrp.add(lowerLid);

  eyelids.push({ upperLid, lowerLid });
});

// 4. Signature JetBrains Mascot Black Pixel-Corner Smile & Open Tongue Mouth (Strictly Non-Overlapping Z = 0.725)
const lowerJawPivot = new THREE.Group();
lowerJawPivot.position.set(0, 0.56, 0.02);
todeSquashGroup.add(lowerJawPivot);

const lowerJawMesh = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.18, 0.96), matFrogGreen);
lowerJawMesh.position.set(0, -0.02, 0.14);
lowerJawPivot.add(lowerJawMesh);

const mouthCenterBar = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.11, 0.024), matMouthBlack);
mouthCenterBar.position.set(0, 0.13, 0.725);
upperHeadPivot.add(mouthCenterBar);

const mouthCornerL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.024), matMouthBlack);
mouthCornerL.position.set(-0.54, 0.23, 0.725);
upperHeadPivot.add(mouthCornerL);

const mouthCornerR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.024), matMouthBlack);
mouthCornerR.position.set(0.54, 0.23, 0.725);
upperHeadPivot.add(mouthCornerR);

const mouthOpenBox = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.24, 0.028), matMouthBlack);
mouthOpenBox.position.set(0, 0.16, 0.727);
mouthOpenBox.visible = false;
upperHeadPivot.add(mouthOpenBox);

const throatSacMesh = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.28, 0.64), matThroatSac);
throatSacMesh.position.set(0, -0.25, 0.20);
lowerJawPivot.add(throatSacMesh);

// 5. Darker Outer Hind Haunches & Brighter Stepped L-Shaped Front Legs (ref 155426.png & 155445.png)
const leftHindLeg = new THREE.Group();
leftHindLeg.position.set(-0.68, 0.28, -0.10);
const leftHaunch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.46, 0.72), matFrogDark);
leftHaunch.castShadow = true;
leftHindLeg.add(leftHaunch);
const leftHindFoot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.82), matFrogDark);
leftHindFoot.position.set(-0.02, -0.20, 0.12);
leftHindFoot.castShadow = true;
leftHindLeg.add(leftHindFoot);
todeSquashGroup.add(leftHindLeg);

const rightHindLeg = new THREE.Group();
rightHindLeg.position.set(0.68, 0.28, -0.10);
const rightHaunch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.46, 0.72), matFrogDark);
rightHaunch.castShadow = true;
rightHindLeg.add(rightHaunch);
const rightHindFoot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.82), matFrogDark);
rightHindFoot.position.set(0.02, -0.20, 0.12);
rightHindFoot.castShadow = true;
rightHindLeg.add(rightHindFoot);
todeSquashGroup.add(rightHindLeg);

// Stepped L-shaped brighter green front legs & inward-turned toes
const leftFrontLeg = new THREE.Group();
leftFrontLeg.position.set(-0.44, 0.24, 0.48);
const leftFrontUpper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.26), matFrogGreen);
leftFrontUpper.castShadow = true;
leftFrontLeg.add(leftFrontUpper);
const leftFrontFoot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.30), matFrogGreen);
leftFrontFoot.position.set(0.08, -0.16, 0.06);
leftFrontFoot.castShadow = true;
leftFrontLeg.add(leftFrontFoot);
todeSquashGroup.add(leftFrontLeg);

const rightFrontLeg = new THREE.Group();
rightFrontLeg.position.set(0.44, 0.24, 0.48);
const rightFrontUpper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.26), matFrogGreen);
rightFrontUpper.castShadow = true;
rightFrontLeg.add(rightFrontUpper);
const rightFrontFoot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.30), matFrogGreen);
rightFrontFoot.position.set(-0.08, -0.16, 0.06);
rightFrontFoot.castShadow = true;
rightFrontLeg.add(rightFrontFoot);
todeSquashGroup.add(rightFrontLeg);

// Helper to dynamically update Tode's facial expression for all gameplay situations & edge cases
function updateTodeFacialExpression(now, dt) {
  const isDizzy = state.defeated || state.fallingDeath || state.bonkRecoilTimer > 0.02;
  const isHappy = state.victoryCelebrationActive || state.hoopTransitionActive || state.chewTimer > 0.05;
  const isTongueOut = state.tongueState !== 'idle';

  // Toggle Dizzy Spiral vs. Happy Chevron vs. Normal Sclera+Pupils
  dizzyEyePlanes.forEach((p, idx) => {
    p.visible = isDizzy;
    if (isDizzy) {
      // Subtle hypnotic pulse on spiral eyes
      const sPulse = 1.0 + Math.sin(now * 0.018 + idx * Math.PI) * 0.05;
      p.scale.set(sPulse, sPulse, 1);
    }
  });

  happyEyePlanes.forEach((p) => {
    p.visible = !isDizzy && isHappy;
  });

  scleraMeshes.forEach((s) => {
    s.visible = !isDizzy && !isHappy;
  });

  pupils.forEach((p) => {
    p.visible = !isDizzy && !isHappy;
  });

  // Situational Pupil Gaze Tracking (matches 155433.png, 155445.png, 155453.png, 155510.png)
  if (!isDizzy && !isHappy) {
    let targetPx = 0.0;
    let targetPy = -0.01;
    let pupilScale = 1.0;

    if (isTongueOut) {
      // Look up and toward the tongue grapple target (like Screenshot 2026-10-12 155510.png!)
      const localDir = state.tongueTargetPos.clone().sub(todeRoot.position);
      targetPx = THREE.MathUtils.clamp(-localDir.x * 0.03, -0.075, 0.075);
      targetPy = 0.045;
    } else if (state.mode === 'LANDING') {
      // Playful periodic glance left, right, and up on the title screen
      const cycle = (now * 0.0008) % 4.0;
      if (cycle < 1.0) { targetPx = -0.065; targetPy = -0.01; }
      else if (cycle < 2.0) { targetPx = 0.065; targetPy = -0.01; }
      else if (cycle < 3.0) { targetPx = -0.045; targetPy = 0.045; }
      else { targetPx = 0.0; targetPy = -0.01; }
    } else {
      // Look toward nearest nearby bug or current lateral hop direction
      let nearestBug = null;
      let nearestDist = 7.5;
      for (const b of bees) {
        if (!b.alive) continue;
        const d = b.mesh.position.distanceTo(todeRoot.position);
        if (d < nearestDist) {
          nearestDist = d;
          nearestBug = b;
        }
      }
      if (nearestBug) {
        const dx = nearestBug.mesh.position.x - todeRoot.position.x;
        targetPx = THREE.MathUtils.clamp(-dx * 0.025, -0.075, 0.075);
        targetPy = 0.035;
      }
      if (state.dangerAlert) {
        pupilScale = 0.82; // Nervous dilated white border when danger is close
      }
    }

    pupils.forEach((p) => {
      p.position.x = THREE.MathUtils.lerp(p.position.x, targetPx, dt * 14);
      p.position.y = THREE.MathUtils.lerp(p.position.y, targetPy, dt * 14);
      p.scale.set(pupilScale, pupilScale, 1);
    });
  }

  // Mouth State: Open rectangle when tongue is active (155510.png), Upturned Pixel Grin otherwise
  if (isTongueOut) {
    mouthOpenBox.visible = true;
    mouthCenterBar.visible = false;
    mouthCornerL.visible = false;
    mouthCornerR.visible = false;
  } else {
    mouthOpenBox.visible = false;
    mouthCenterBar.visible = true;
    mouthCornerL.visible = true;
    mouthCornerR.visible = true;
    // Extra wide joyful grin during Victory Celebration
    const cornerLift = isHappy ? 0.26 : (isDizzy ? 0.19 : 0.23);
    mouthCornerL.position.y = cornerLift;
    mouthCornerR.position.y = cornerLift;
  }

  leftCheek.visible = isHappy;
  rightCheek.visible = isHappy;
}

// =========================================================================
// 5. NATURAL PINKISH ORGANIC TONGUE GRAPPLE (Balanced Proportion & Shape)
// =========================================================================
const tongueGroup = new THREE.Group();
scene.add(tongueGroup);

// Wide, thick, meaty natural pink frog tongue stem
const tongueRibbonGeo = new THREE.CylinderGeometry(0.22, 0.26, 1.0, 16);
tongueRibbonGeo.rotateX(Math.PI / 2);
tongueRibbonGeo.scale(1.32, 0.84, 1.0);
tongueRibbonGeo.translate(0, 0, 0.5);
const tongueRibbonMesh = new THREE.Mesh(tongueRibbonGeo, matTonguePink);
tongueRibbonMesh.castShadow = true;
tongueGroup.add(tongueRibbonMesh);

// Plump, wide, thick sticky tongue pad tip
const tongueTipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 14), matTonguePink);
tongueTipMesh.scale.set(1.28, 0.85, 1.24);
tongueTipMesh.castShadow = true;
scene.add(tongueTipMesh);
tongueGroup.visible = false;
tongueTipMesh.visible = false;

// Live 3D Pink Target Lock-On Reticle Ring (Highlights nearest in-range bug, firefly, or grapple post!)
const targetReticleGroup = new THREE.Group();
const reticleOuterRing = new THREE.Mesh(
  new THREE.RingGeometry(0.62, 0.78, 24),
  new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false })
);
reticleOuterRing.rotation.x = -Math.PI / 2;
targetReticleGroup.add(reticleOuterRing);
targetReticleGroup.visible = false;
scene.add(targetReticleGroup);
