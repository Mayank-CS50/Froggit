/**
 * THE FROGGIT — 96-Row Winding Course Topology, Multi-Axis Obstacles & InstancedMesh World Builder
 * File: src/world/courseBuilder.js
 */
// =========================================================================
// 6. INDEPENDENT LEVEL ARCHITECTURES (`0F`, `+1F`, `-1F`, `+2F`, `-2F`, `+3F`, `-3F`)
// =========================================================================
const worldGroup = new THREE.Group();
scene.add(worldGroup);

const validRoadwayTiles = new Set();
const blockedTiles = new Set();
const tileElevationMap = new Map();
const obstacleMetaMap = new Map();
const fencedEdges = new Set();
const animatedProps = [];
const sweeperBeams = [];
const movingPlatforms = [];
const pushBlocks = [];
const bouncePads = [];
const cannonShooters = [];
const cannonProjectiles = [];
const pendulumAxes = [];
const crusherBlocks = [];
const rollingLogs = [];
const grappleTargets = [];

function tileKey(gx, gz) {
  return `${gx},${gz}`;
}

// Winding Complete-Left & Complete-Right Course Centerline Trajectory (Rows 0..96)
function getTrackCenterCol(level, gz) {
  if (gz <= 4) return 0;
  if (gz >= ROADWAY_LENGTH - 4) return 0;

  if (level === 0) {
    // 0F Ground Meadow: Complete Left Dogleg -> CP1 -> Complete Right Highland -> Split Island -> CP2 -> Deep Left Switchback -> CP3 -> Final Arena
    if (gz <= 10) return -Math.round(((gz - 4) / 6) * 6);       // Sweep far LEFT to gx = -6
    if (gz <= 19) return -6;                                    // Complete Left Path corridor (gx = -6)
    if (gz <= 28) return -6 + Math.round(((gz - 19) / 9) * 4);  // Cut back to CP1 Overlook at gx = -2
    if (gz <= 35) return -2 + Math.round(((gz - 28) / 7) * 8);  // Sweep far RIGHT to gx = +6
    if (gz <= 45) return 6;                                     // Complete Right Highland Plateau (gx = +6)
    if (gz <= 56) return 6 - Math.round(((gz - 45) / 11) * 5);  // Twin-Fork Island into CP2 at gx = +1
    if (gz <= 64) return 1 - Math.round(((gz - 56) / 8) * 6);   // Plunge far LEFT to gx = -5
    if (gz <= 72) return -5;                                    // Left Ridge Gauntlet (gx = -5)
    if (gz <= 78) return -5 + Math.round(((gz - 72) / 6) * 4);  // Climb to CP3 at gx = -1
    if (gz <= 85) return -1 + Math.round(((gz - 78) / 7) * 4);  // S-Bend Right to gx = +3
    return Math.round(((92 - gz) / 7) * 3);                     // Return to Center 0 for Guardian Boss & Hoops
  }

  if (level === 1) {
    // +1F Sky Gardens: Twin-Wing Split -> Far Right Cloud Walk -> CP1 -> Far Left Sky Bridge -> CP2 -> Serpentine Ascent
    if (gz <= 12) return 0;
    if (gz <= 22) return Math.round(Math.sin(((gz - 12) / 10) * Math.PI * 0.5) * 6); // Right to +6
    if (gz <= 28) return 6 - Math.round(((gz - 22) / 6) * 3); // CP1 at +3
    if (gz <= 42) return 3 - Math.round(((gz - 28) / 14) * 9); // Sweep all the way Left to -6
    if (gz <= 50) return -6;
    if (gz <= 56) return -6 + Math.round(((gz - 50) / 6) * 4); // CP2 at -2
    if (gz <= 70) return -2 + Math.round(((gz - 56) / 14) * 7); // Right to +5
    if (gz <= 78) return 5 - Math.round(((gz - 70) / 8) * 5); // CP3 at 0
    if (gz <= 86) return -Math.round(Math.sin(((gz - 78) / 8) * Math.PI) * 4);
    return 0;
  }

  if (level === -1) {
    // -1F Sunlit Coral Reef: Far Left Trench -> Atoll Ring -> CP1 -> Far Right Kelp Ledge -> CP2 -> Abyssal S-Curve
    if (gz <= 15) return -Math.round(Math.sin(((gz - 4) / 11) * Math.PI * 0.5) * 6); // Left to -6
    if (gz <= 28) return -6 + Math.round(((gz - 15) / 13) * 6); // CP1 at 0
    if (gz <= 40) return Math.round(((gz - 28) / 12) * 6); // Right to +6
    if (gz <= 48) return 6;
    if (gz <= 56) return 6 - Math.round(((gz - 48) / 8) * 4); // CP2 at +2
    if (gz <= 68) return 2 - Math.round(((gz - 56) / 12) * 7); // Left to -5
    if (gz <= 78) return -5 + Math.round(((gz - 68) / 10) * 5); // CP3 at 0
    if (gz <= 87) return Math.round(Math.sin(((gz - 78) / 9) * Math.PI) * 4);
    return 0;
  }

  // Higher/Deeper Tiers (+2F, -2F, +3F, -3F): Dramatic Winding S-Curves & Doglegs up to ±6
  const waveA = Math.sin(gz * 0.11 + level * 1.3) * 5.2;
  const waveB = Math.cos(gz * 0.06 - level * 0.8) * 1.8;
  return Math.round(THREE.MathUtils.clamp(waveA + waveB, -6, 6));
}

// Heighted Hills, Sloped Ramps & Elevated Highland Plateaus across the 96-Row Campaign
function getTileElevation(level, gx, gz) {
  if (gz <= 3 || gz >= ROADWAY_LENGTH - 3) return 0.0;
  if (CHECKPOINT_ROWS.includes(gz)) return 0.65; // Elevated Checkpoint Vista Overlooks!

  const centerCol = getTrackCenterCol(level, gz);
  let baseH = 0.0;
  if (gz >= 11 && gz <= 22) {
    // First Left-Dogleg Rolling Hill Ascent & Crest
    baseH = Math.sin(((gz - 11) / 11) * Math.PI) * 1.45;
  } else if (gz >= 32 && gz <= 46) {
    // Grand Right-Path Highland Plateau with Stepped Ramps (Rows 32..46)
    if (gz <= 35) baseH = ((gz - 31) / 4) * 1.95;
    else if (gz >= 43) baseH = ((47 - gz) / 4) * 1.95;
    else baseH = 1.95;
    if (Math.abs(gx - centerCol) >= 2 && gz >= 36 && gz <= 42) {
      baseH += 0.42;
    }
  } else if (gz >= 60 && gz <= 74) {
    // Left Switchback Canyon Ridge
    baseH = Math.sin(((gz - 60) / 14) * Math.PI) * 2.25;
  } else if (gz >= 81 && gz <= 88) {
    // Pre-Boss Citadel Terrace
    baseH = Math.sin(((gz - 81) / 7) * Math.PI) * 1.35;
  }

  if (level > 0) baseH *= (1.0 + level * 0.08);
  if (level < 0) baseH *= 0.92;
  return Math.round(baseH * 100) / 100;
}

function getSurfaceY(gx, gz) {
  const k = tileKey(gx, gz);
  if (tileElevationMap.has(k)) return tileElevationMap.get(k);
  return getTileElevation(state.floorLevel, gx, gz);
}

function evaluateLevelTile(level, gx, gz) {
  if (gz <= 3) {
    return { exists: gx >= -2 && gx <= 2, fencedL: gx === -2, fencedR: gx === 2 };
  }
  if (gz >= ROADWAY_LENGTH - 3) {
    return { exists: gx >= -4 && gx <= 4, fencedL: gx === -4, fencedR: gx === 4 };
  }

  const cCol = getTrackCenterCol(level, gz);
  const prevCol = getTrackCenterCol(level, Math.max(0, gz - 1));
  const nextCol = getTrackCenterCol(level, Math.min(ROADWAY_LENGTH, gz + 1));

  if (CHECKPOINT_ROWS.includes(gz)) {
    const minC = Math.min(cCol, prevCol, nextCol) - 3;
    const maxC = Math.max(cCol, prevCol, nextCol) + 3;
    return { exists: gx >= minC && gx <= maxC, fencedL: gx === minC, fencedR: gx === maxC };
  }

  // Ensure smooth lateral bridge continuity whenever centerline shifts left or right between rows
  const halfW = Math.abs(level) >= 3 ? 2 : 3;
  const minX = Math.min(cCol, prevCol) - halfW;
  const maxX = Math.max(cCol, prevCol) + halfW;

  // Intentional Split-Island Fork sections where center tile is a chasm and player must take Left or Right branch!
  const isSplitForkRow = (gz >= 48 && gz <= 52) || (level === 1 && gz >= 7 && gz <= 11) || (level === -1 && gz >= 19 && gz <= 23);
  if (isSplitForkRow) {
    const forkMin = cCol - 4;
    const forkMax = cCol + 4;
    if (gx === cCol) return { exists: false, fencedL: false, fencedR: false };
    return {
      exists: gx >= forkMin && gx <= forkMax,
      fencedL: gx === forkMin,
      fencedR: gx === forkMax
    };
  }

  // Mid-track ferry chasm rows (bridged by moving platforms)
  const ferryRows = getLevelMovingPlatformRows(level);
  if (ferryRows.includes(gz) && gx === cCol) {
    return { exists: false, fencedL: false, fencedR: false };
  }

  // Deterministic mid-track hazard holes (never blocking the entire row)
  const relX = gx - cCol;
  const isHazardHole = (gz > 6 && gz < ROADWAY_LENGTH - 8) &&
    !ferryRows.includes(gz) &&
    ((gz * 7 + relX * 5 + level * 3) % 19 === 0) &&
    Math.abs(relX) === 1;
  if (isHazardHole) {
    return { exists: false, fencedL: false, fencedR: false };
  }

  const exists = gx >= minX && gx <= maxX;
  return {
    exists,
    fencedL: exists && gx === minX && (gz % 3 !== 1),
    fencedR: exists && gx === maxX && (gz % 3 !== 2)
  };
}

function getRowProfile(gz) {
  let minX = 12;
  let maxX = -12;
  let fencedL = false;
  let fencedR = false;
  for (let gx = -12; gx <= 12; gx++) {
    const res = evaluateLevelTile(state.floorLevel, gx, gz);
    if (res.exists) {
      if (gx < minX) { minX = gx; fencedL = res.fencedL; }
      if (gx > maxX) { maxX = gx; fencedR = res.fencedR; }
    }
  }
  if (minX > maxX) {
    const c = getTrackCenterCol(state.floorLevel, gz);
    return { minX: c - 2, maxX: c + 2, centerCol: c, fencedL: false, fencedR: false };
  }
  return { minX, maxX, centerCol: Math.round((minX + maxX) * 0.5), fencedL, fencedR };
}

function isMidTrackHole(gx, gz) {
  const prof = getRowProfile(gz);
  if (gx < prof.minX || gx > prof.maxX) return false;
  return !evaluateLevelTile(state.floorLevel, gx, gz).exists;
}

// 96-Row Winding Course Static Obstacles, Sweepers, Push-Blocks, Ferries, Bounce Pads,
// Bastion Cannons, Overhead Swinging Pendulum Axes, Vertical Thwomp Crushers & Rolling Logs!
function getLevelObstacles(level) {
  const rels = [
    [-2, 6], [2, 6], [0, 9], [-2, 13], [2, 13],
    [-2, 17], [2, 21], [-2, 25], [2, 25],
    [-2, 31], [2, 34], [-2, 38], [2, 38],
    [-2, 44], [2, 47], [-3, 50], [3, 50],
    [-2, 59], [2, 62], [-2, 67], [2, 67],
    [-2, 73], [2, 76], [-2, 82], [2, 82],
    [-2, 87], [2, 87], [-3, 91], [3, 91]
  ];
  return rels.map(([rx, gz]) => [getTrackCenterCol(level, gz) + rx, gz]);
}

function getLevelSweeperRows(level) {
  if (level === 0) return [16, 40, 66, 84];
  if (level === 1) return [15, 36, 62, 83];
  if (level === -1) return [13, 35, 63, 84];
  return [16, 38, 64, 84];
}

function getLevelPushBlockRows(level) {
  if (level === 0) return [12, 33, 61, 81];
  if (level === 1) return [18, 39, 65, 81];
  if (level === -1) return [10, 38, 60, 82];
  return [13, 36, 62, 81];
}

function getLevelBouncePads(level) {
  const rows = [7, 23, 45, 70];
  return rows.map((gz, i) => {
    const c = getTrackCenterCol(level, gz);
    const offset = (i % 2 === 0) ? 0 : (i === 1 ? -1 : 1);
    return [c + offset, gz];
  });
}

function getLevelMovingPlatformRows(level) {
  if (level === 0) return [14, 37, 54, 69, 83];
  if (level === 1) return [20, 34, 53, 68, 82];
  if (level === -1) return [11, 26, 42, 64, 83];
  return [14, 35, 53, 68, 83];
}

function getLevelCannonRows(level) {
  return [
    { gz: 15, side: -1 },
    { gz: 36, side: 1 },
    { gz: 58, side: -1 },
    { gz: 74, side: 1 },
    { gz: 86, side: -1 }
  ];
}

function getLevelPendulumAxeRows(level) {
  return [21, 43, 65, 85];
}

function getLevelCrusherConfigs(level) {
  const rows = [26, 46, 71, 88];
  return rows.map((gz, idx) => ({
    gx: getTrackCenterCol(level, gz) + (idx % 2 === 0 ? 0 : (idx === 1 ? -1 : 1)),
    gz
  }));
}

function getLevelRollingLogSpans(level) {
  return [
    { startGz: 20, endGz: 14, gx: getTrackCenterCol(level, 17), speed: 4.5 },
    { startGz: 44, endGz: 36, gx: getTrackCenterCol(level, 40) + 1, speed: 5.0 },
    { startGz: 72, endGz: 64, gx: getTrackCenterCol(level, 68) - 1, speed: 5.4 }
  ];
}

function createGuardrailSegment(x, zStart, zEnd, railColorHex, baseY = 0) {
  const g = new THREE.Group();
  const poleMat = createVoxelMaterial('wood_planks', railColorHex, 0x78350f, { roughness: 0.82 });
  const rodMat = createVoxelMaterial('stone_brick', 0xe2e8f0, 0x94a3b8, { roughness: 0.55, metalness: 0.25 });

  const poleGeo = new THREE.CylinderGeometry(0.14, 0.16, 1.15, 8);
  const pole1 = new THREE.Mesh(poleGeo, poleMat);
  pole1.position.set(x, baseY + 0.55, zStart);
  pole1.castShadow = true;
  g.add(pole1);

  const pole2 = new THREE.Mesh(poleGeo, poleMat);
  pole2.position.set(x, baseY + 0.55, zEnd);
  pole2.castShadow = true;
  g.add(pole2);

  const capGeo = new THREE.SphereGeometry(0.19, 8, 8);
  const cap1 = new THREE.Mesh(capGeo, rodMat);
  cap1.position.set(x, baseY + 1.15, zStart);
  g.add(cap1);

  const length = Math.abs(zEnd - zStart);
  const rodGeo = new THREE.CylinderGeometry(0.065, 0.065, length, 8);
  rodGeo.rotateX(Math.PI / 2);

  const upperRod = new THREE.Mesh(rodGeo, rodMat);
  upperRod.position.set(x, baseY + 0.88, (zStart + zEnd) * 0.5);
  upperRod.castShadow = true;
  g.add(upperRod);

  const lowerRod = new THREE.Mesh(rodGeo, rodMat);
  lowerRod.position.set(x, baseY + 0.46, (zStart + zEnd) * 0.5);
  lowerRod.castShadow = true;
  g.add(lowerRod);

  return g;
}

// Pool of 8 Distinct 3D Obstacle Designs with Elevation Support
function createThemeObstacle(x, z, theme, variant = 0, baseY = 0) {
  const g = new THREE.Group();

  const themePools = {
    ground: ['gourd', 'cottage', 'mushroom', 'boulder', 'obelisk', 'totem'],
    heaven: ['obelisk', 'pillar', 'totem', 'mushroom', 'cottage', 'boulder'],
    ocean:  ['coral', 'mine', 'obelisk', 'boulder', 'mushroom', 'totem']
  };
  const pool = themePools[theme] || themePools.ground;
  const archetype = pool[Math.floor(Math.random() * pool.length)];

  const widthScale = 0.76 + Math.random() * 0.32;
  const heightScale = 0.80 + Math.random() * 0.58;
  const yawSteps = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  const randomYaw = yawSteps[Math.floor(Math.random() * yawSteps.length)];

  let minimapShape = 'circle';
  let minimapColor = '#f97316';

  if (archetype === 'gourd') {
    const gourdColors = [0xf97316, 0xf59e0b, 0xea580c];
    const colHex = gourdColors[Math.floor(Math.random() * gourdColors.length)];
    minimapColor = '#f97316';
    minimapShape = 'circle';

    const bodyMat = createVoxelMaterial('wood_planks', colHex, 0xc2410c, { roughness: 0.72 });
    const ribMat = createVoxelMaterial('cobble_moss', 0xc2410c, 0x9a3412, { roughness: 0.8 });
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const core = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.90, 1.18), bodyMat);
    core.position.y = 0.45;
    core.castShadow = true;
    g.add(core);

    const rib = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.84, 0.74), ribMat);
    rib.position.y = 0.45;
    g.add(rib);

    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.08), glowMat);
    eyeL.position.set(-0.24, 0.54, 0.62);
    g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.08), glowMat);
    eyeR.position.set(0.24, 0.54, 0.62);
    g.add(eyeR);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.14, 0.32, 6), stemMat);
    stem.position.y = 1.02;
    g.add(stem);
    animatedProps.push({ mesh: g, type: 'pulse', phase: x + z });
  } else if (archetype === 'cottage') {
    const roofColors = [0xd97706, 0xea580c, 0xb45309, 0xf59e0b];
    const rHex = roofColors[Math.floor(Math.random() * roofColors.length)];
    minimapColor = '#f43f5e';
    minimapShape = 'square';

    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.15, 1.32), createVoxelMaterial('stone_brick', 0xfefce8, 0xe2e8f0, { roughness: 0.78 }));
    wall.position.y = 0.575;
    wall.castShadow = true;
    g.add(wall);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.18, 0.92, 4), createVoxelMaterial('wood_planks', rHex, 0x881337, { roughness: 0.74 }));
    roof.position.y = 1.60;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
  } else if (archetype === 'mushroom') {
    const capColors = [0xf97316, 0xf59e0b, 0xea580c, 0xfbbf24];
    const cHex = capColors[Math.floor(Math.random() * capColors.length)];
    minimapColor = '#ec4899';
    minimapShape = 'circle';

    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.95, 10), createVoxelMaterial('wood_planks', 0xfef3c7, 0xfde68a, { roughness: 0.76 }));
    stalk.position.y = 0.475;
    stalk.castShadow = true;
    g.add(stalk);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.74, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), createVoxelMaterial('frog_skin', cHex, 0xffffff, { roughness: 0.64 }));
    cap.position.y = 0.82;
    cap.castShadow = true;
    g.add(cap);

    const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), spotMat);
      spot.position.set(Math.cos(ang) * 0.46, 1.18, Math.sin(ang) * 0.46);
      g.add(spot);
    }
    animatedProps.push({ mesh: g, type: 'pulse', phase: x * 0.7 + z });
  } else if (archetype === 'boulder') {
    minimapColor = '#94a3b8';
    minimapShape = 'diamond';

    const rockMat = createVoxelMaterial('cobble_moss', 0x64748b, 0x334155, { roughness: 0.88 });
    const mossMat = createVoxelMaterial('grass_top', 0x22c55e, 0x4ade80, { roughness: 0.78 });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const mainRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), rockMat);
    mainRock.position.y = 0.58;
    mainRock.castShadow = true;
    g.add(mainRock);

    const subRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), mossMat);
    subRock.position.set(0.32, 0.34, 0.25);
    g.add(subRock);

    const runeBand = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 6, 12), runeMat);
    runeBand.rotation.x = Math.PI / 2;
    runeBand.position.y = 0.65;
    g.add(runeBand);
  } else if (archetype === 'obelisk') {
    const gemColors = [0xfbbf24, 0xf59e0b, 0xfde047, 0xfb923c];
    const gHex = gemColors[Math.floor(Math.random() * gemColors.length)];
    minimapColor = '#facc15';
    minimapShape = 'diamond';

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.32, 8), createVoxelMaterial('stone_brick', 0xe2e8f0, 0x94a3b8, { roughness: 0.72 }));
    base.position.y = 0.16;
    g.add(base);

    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.64, 0), createVoxelMaterial('crystal_gem', gHex, 0xffffff, { roughness: 0.28, metalness: 0.35, emissive: gHex, emissiveIntensity: 0.18 }));
    crystal.position.y = 1.12;
    crystal.castShadow = true;
    g.add(crystal);
    animatedProps.push({ mesh: crystal, type: 'spinBob', baseY: 1.12, phase: x + z });
  } else if (archetype === 'pillar') {
    minimapColor = '#e2e8f0';
    minimapShape = 'square';

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 1.85, 10), createVoxelMaterial('stone_brick', 0xf8fafc, 0xcbd5e1, { roughness: 0.68 }));
    col.position.y = 0.925;
    col.castShadow = true;
    g.add(col);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.26, 1.18), createVoxelMaterial('stone_brick', 0xf59e0b, 0xfef08a, { roughness: 0.45, metalness: 0.3 }));
    cap.position.y = 1.92;
    g.add(cap);
  } else if (archetype === 'totem') {
    minimapColor = '#fbbf24';
    minimapShape = 'square';

    const tierColors = [0xd97706, 0xf59e0b, 0xfbbf24];
    for (let t = 0; t < 3; t++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.05 - t * 0.14, 0.52, 1.05 - t * 0.14),
        createVoxelMaterial('hazard_stripes', tierColors[t], 0xfef08a, { roughness: 0.68 })
      );
      box.position.y = 0.26 + t * 0.54;
      box.castShadow = true;
      g.add(box);
    }
  } else if (archetype === 'coral') {
    minimapColor = '#ec4899';
    minimapShape = 'circle';

    const coralMat = createVoxelMaterial('frog_skin', 0xec4899, 0xf472b6, { roughness: 0.65 });
    const glowRingMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const dome = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 1), coralMat);
    dome.position.y = 0.62;
    dome.castShadow = true;
    g.add(dome);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 6, 16), glowRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.92;
    g.add(ring);
    animatedProps.push({ mesh: g, type: 'pulse', phase: x + z });
  } else {
    minimapColor = '#f43f5e';
    minimapShape = 'circle';

    const mineMat = createVoxelMaterial('stone_brick', 0x334155, 0x0f172a, { roughness: 0.5, metalness: 0.4 });
    const spikeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 12), mineMat);
    sphere.position.y = 0.98;
    sphere.castShadow = true;
    g.add(sphere);
    for (let s = 0; s < 6; s++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 6), spikeMat);
      const angle = (s * Math.PI) / 3;
      spike.position.set(Math.cos(angle) * 0.62, 0.98, Math.sin(angle) * 0.62);
      spike.rotation.z = -Math.cos(angle) * (Math.PI / 2);
      spike.rotation.x = Math.sin(angle) * (Math.PI / 2);
      g.add(spike);
    }
    animatedProps.push({ mesh: g, type: 'bob', baseY: baseY, phase: x * 0.5 + z });
  }

  g.scale.set(widthScale, heightScale, widthScale);
  g.rotation.y = randomYaw;
  g.position.set(x, baseY, z);

  const gx = Math.round(x / TILE_SIZE);
  const gz = Math.round(-z / TILE_SIZE);
  obstacleMetaMap.set(tileKey(gx, gz), {
    shape: minimapShape,
    color: minimapColor,
    scale: widthScale
  });

  return g;
}

function createRotatingSweeper(gz, theme) {
  const prof = getRowProfile(gz);
  const centerX = prof.centerCol * TILE_SIZE;
  const baseY = getSurfaceY(prof.centerCol, gz);
  const pivot = new THREE.Group();
  pivot.position.set(centerX, baseY + 0.68, -gz * TILE_SIZE);

  const postColor = theme === 'heaven' ? 0xf59e0b : (theme === 'ocean' ? 0x06b6d4 : 0x0d9488);
  const beamColors = [0xfbbf24, 0xf59e0b, 0xfde68a];
  const beamColor = beamColors[Math.floor(Math.random() * beamColors.length)];

  const hubRadius = 0.32 + Math.random() * 0.14;
  const hubHeight = 0.95 + Math.random() * 0.35;
  const centerPost = new THREE.Mesh(
    new THREE.CylinderGeometry(hubRadius, hubRadius * 1.12, hubHeight, 12),
    createVoxelMaterial('stone_brick', postColor, 0x1e293b, { roughness: 0.55, metalness: 0.25 })
  );
  centerPost.castShadow = true;
  pivot.add(centerPost);

  const trackHalfWidth = Math.max(1.8, ((prof.maxX - prof.minX) * 0.5) * TILE_SIZE - 0.35);
  const lengthFactor = 1.65 + Math.random() * 0.28;
  const beamLength = Math.min(5.4, trackHalfWidth * lengthFactor);
  const barRadius = 0.17 + Math.random() * 0.08;

  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(barRadius, barRadius, beamLength, 10),
    createVoxelMaterial('hazard_stripes', beamColor, 0x0f172a, { roughness: 0.5, repeatX: 4, repeatY: 1 })
  );
  arm.rotation.z = Math.PI / 2;
  arm.castShadow = true;
  pivot.add(arm);

  [-beamLength * 0.46, beamLength * 0.46].forEach((endX) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(barRadius * 1.35, 8, 8),
      createVoxelMaterial('stone_brick', postColor, 0x1e293b, { roughness: 0.55, metalness: 0.25 })
    );
    cap.position.x = endX;
    pivot.add(cap);
  });

  worldGroup.add(pivot);
  sweeperBeams.push({
    pivot,
    gz,
    baseY,
    halfLength: beamLength * 0.5,
    angle: Math.random() * Math.PI * 2,
    speed: (gz % 2 === 0 ? 1 : -1) * (1.35 + Math.random() * 0.35)
  });
}

function createSlidingPushBlock(gz, theme, idx = 0) {
  const prof = getRowProfile(gz);
  const centerCol = (prof.minX + prof.maxX) * 0.5;
  const spanCols = Math.max(0.8, (prof.maxX - prof.minX) * 0.38);
  const baseY = getSurfaceY(Math.round(centerCol), gz);

  const blockGroup = new THREE.Group();
  const palette = [0xf59e0b, 0xf97316, 0xd97706];
  const bodyColor = palette[Math.floor(Math.random() * palette.length)];
  const trimColor = 0xfef08a;

  const designs = ['cushion_box', 'roller_drum', 'stepped_ram'];
  const design = designs[Math.floor(Math.random() * designs.length)];
  const wSize = 1.25 + Math.random() * 0.35;
  const hSize = 0.78 + Math.random() * 0.42;

  if (design === 'roller_drum') {
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(wSize * 0.48, wSize * 0.48, hSize, 14),
      createVoxelMaterial('cobble_moss', bodyColor, 0xd97706, { roughness: 0.68 })
    );
    drum.position.y = hSize * 0.5;
    drum.castShadow = true;
    blockGroup.add(drum);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(wSize * 0.49, 0.08, 8, 16),
      createVoxelMaterial('hazard_stripes', trimColor, 0xf59e0b, { roughness: 0.52 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = hSize * 0.5;
    blockGroup.add(ring);
  } else if (design === 'stepped_ram') {
    const lower = new THREE.Mesh(
      new THREE.BoxGeometry(wSize, hSize * 0.6, 1.22),
      createVoxelMaterial('cobble_moss', bodyColor, 0xd97706, { roughness: 0.68 })
    );
    lower.position.y = hSize * 0.3;
    lower.castShadow = true;
    blockGroup.add(lower);

    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(wSize * 0.72, hSize * 0.5, 0.96),
      createVoxelMaterial('hazard_stripes', trimColor, 0xf59e0b, { roughness: 0.52 })
    );
    upper.position.y = hSize * 0.82;
    upper.castShadow = true;
    blockGroup.add(upper);
  } else {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(wSize, hSize, 1.22),
      createVoxelMaterial('cobble_moss', bodyColor, 0xd97706, { roughness: 0.68 })
    );
    mesh.position.y = hSize * 0.5;
    mesh.castShadow = true;
    blockGroup.add(mesh);

    const bumperStrip = new THREE.Mesh(
      new THREE.BoxGeometry(wSize + 0.08, 0.22, 1.28),
      createVoxelMaterial('hazard_stripes', trimColor, 0xf59e0b, { roughness: 0.52 })
    );
    bumperStrip.position.y = hSize * 0.5;
    blockGroup.add(bumperStrip);
  }

  blockGroup.position.set(centerCol * TILE_SIZE, baseY, -gz * TILE_SIZE);
  worldGroup.add(blockGroup);

  pushBlocks.push({
    mesh: blockGroup,
    gz,
    baseY,
    halfRadius: wSize * 0.5 + 0.55,
    centerX: centerCol * TILE_SIZE,
    spanX: spanCols * TILE_SIZE,
    phase: idx * 1.7 + Math.random() * Math.PI,
    speed: 1.35 + Math.random() * 0.35,
    vx: 0
  });
}

function createBouncePad(gx, gz, theme) {
  const baseY = getSurfaceY(gx, gz);
  const g = new THREE.Group();
  const padColor = theme === 'heaven' ? 0xfde047 : (theme === 'ocean' ? 0x22d3ee : 0x34d399);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.76, 0.22, 12),
    createVoxelMaterial('grass_top', padColor, 0xa7f3d0, { roughness: 0.55, emissive: padColor, emissiveIntensity: 0.15 })
  );
  base.position.y = 0.11;
  base.castShadow = true;
  g.add(base);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.06, 6, 16),
    ringMat
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.24;
  g.add(ring);

  g.position.set(gx * TILE_SIZE, baseY, -gz * TILE_SIZE);
  worldGroup.add(g);
  bouncePads.push({ mesh: g, gx, gz, baseY, jumpRows: 2 });
}

// -------------------------------------------------------------------------
// NEW INTERNET-FAVORITE OBSTACLE 1: SIDE BASTION CANNON TURRETS (X-Axis Projectiles)
// -------------------------------------------------------------------------
function createCannonTurret(gz, side, theme, idx = 0) {
  const prof = getRowProfile(gz);
  const edgeCol = side < 0 ? prof.minX : prof.maxX;
  const mountX = (side < 0 ? prof.minX - 1.65 : prof.maxX + 1.65) * TILE_SIZE;
  const baseY = getSurfaceY(edgeCol, gz);

  const cannonGrp = new THREE.Group();
  cannonGrp.position.set(mountX, baseY, -gz * TILE_SIZE);

  const pedestalMat = createVoxelMaterial('stone_brick', 0x475569, 0x1e293b, { roughness: 0.65 });
  const ironMat = createVoxelMaterial('stone_brick', 0x1e293b, 0x0f172a, { roughness: 0.35, metalness: 0.55 });
  const brassMat = createVoxelMaterial('hazard_stripes', 0xf59e0b, 0xd97706, { roughness: 0.38, metalness: 0.45 });

  const baseBlock = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.75, 1.45), pedestalMat);
  baseBlock.position.y = 0.375;
  baseBlock.castShadow = true;
  cannonGrp.add(baseBlock);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.40, 1.55, 12), ironMat);
  barrel.rotation.z = side < 0 ? -Math.PI / 2 : Math.PI / 2;
  barrel.position.set(side < 0 ? 0.35 : -0.35, 0.92, 0);
  barrel.castShadow = true;
  cannonGrp.add(barrel);

  const muzzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 8, 16), brassMat);
  muzzleRing.rotation.y = Math.PI / 2;
  muzzleRing.position.set(side < 0 ? 1.12 : -1.12, 0.92, 0);
  cannonGrp.add(muzzleRing);

  // Pre-Strike Laser Sightline across the track row (visible 0.55s before cannon fires)
  const trackSpanW = Math.max(8, (prof.maxX - prof.minX + 3) * TILE_SIZE);
  const laserGeo = new THREE.BoxGeometry(trackSpanW, 0.08, 0.08);
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.0, depthWrite: false });
  const laserMesh = new THREE.Mesh(laserGeo, laserMat);
  laserMesh.position.set(side < 0 ? trackSpanW * 0.5 + 1.1 : -trackSpanW * 0.5 - 1.1, 0.88, 0);
  cannonGrp.add(laserMesh);

  worldGroup.add(cannonGrp);
  cannonShooters.push({
    group: cannonGrp,
    barrel,
    laserMesh,
    laserMat,
    gz,
    side,
    baseY,
    muzzleX: mountX + (side < 0 ? 1.15 : -1.15),
    timer: idx * 1.15,
    interval: Math.max(2.1, 3.2 - Math.abs(state.floorLevel) * 0.22)
  });
}

// -------------------------------------------------------------------------
// NEW INTERNET-FAVORITE OBSTACLE 2: OVERHEAD SWINGING PENDULUM BATTLE-AXES (X-Y Plane)
// -------------------------------------------------------------------------
function createSwingingPendulumAxe(gz, theme, idx = 0) {
  const prof = getRowProfile(gz);
  const centerX = ((prof.minX + prof.maxX) * 0.5) * TILE_SIZE;
  const baseY = getSurfaceY(prof.centerCol, gz);
  const archHalfW = (((prof.maxX - prof.minX) * 0.5) + 1.15) * TILE_SIZE;
  const archHeight = 4.8;

  const frameGrp = new THREE.Group();
  frameGrp.position.set(centerX, baseY, -gz * TILE_SIZE);

  const pillarMat = createVoxelMaterial('stone_brick', 0x64748b, 0x334155, { roughness: 0.65 });
  const beamMat = createVoxelMaterial('wood_planks', 0x78350f, 0x451a03, { roughness: 0.78 });
  const bladeMat = createVoxelMaterial('crystal_gem', 0xe2e8f0, 0x94a3b8, { roughness: 0.25, metalness: 0.65 });
  const edgeMat = createVoxelMaterial('hazard_stripes', 0xf43f5e, 0xfbbf24, { roughness: 0.4 });

  [-archHalfW, archHalfW].forEach((px) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.58, archHeight, 0.58), pillarMat);
    col.position.set(px, archHeight * 0.5, 0);
    col.castShadow = true;
    frameGrp.add(col);
  });

  const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(archHalfW * 2 + 0.8, 0.44, 0.58), beamMat);
  crossBeam.position.set(0, archHeight, 0);
  crossBeam.castShadow = true;
  frameGrp.add(crossBeam);

  const pivot = new THREE.Group();
  pivot.position.set(0, archHeight - 0.1, 0);
  frameGrp.add(pivot);

  const rodLen = archHeight - 0.85;
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, rodLen, 8), beamMat);
  rod.position.y = -rodLen * 0.5;
  rod.castShadow = true;
  pivot.add(rod);

  // Double-sided crescent battle-axe head at bottom of pendulum rod
  const axeHead = new THREE.Group();
  axeHead.position.y = -rodLen;
  const hub = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.52, 0.34), edgeMat);
  axeHead.add(hub);

  const bladeL = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.16, 12, 1, false, 0, Math.PI), bladeMat);
  bladeL.rotation.x = Math.PI / 2;
  bladeL.rotation.z = Math.PI / 2;
  bladeL.position.x = -0.25;
  bladeL.castShadow = true;
  axeHead.add(bladeL);

  const bladeR = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.16, 12, 1, false, 0, Math.PI), bladeMat);
  bladeR.rotation.x = Math.PI / 2;
  bladeR.rotation.z = -Math.PI / 2;
  bladeR.position.x = 0.25;
  bladeR.castShadow = true;
  axeHead.add(bladeR);

  pivot.add(axeHead);

  // Floor Warning Shadow Strip & Live Blade Shadow Marker directly on the tile surface
  const arcSpanW = Math.sin(0.72) * rodLen * 2.0;
  const floorStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(arcSpanW, 0.36),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.28, depthWrite: false })
  );
  floorStrip.rotation.x = -Math.PI / 2;
  floorStrip.position.set(0, 0.03, 0);
  frameGrp.add(floorStrip);

  const bladeShadowDot = new THREE.Mesh(
    new THREE.RingGeometry(0.22, 0.52, 16),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.75, depthWrite: false })
  );
  bladeShadowDot.rotation.x = -Math.PI / 2;
  bladeShadowDot.position.set(0, 0.04, 0);
  frameGrp.add(bladeShadowDot);

  worldGroup.add(frameGrp);

  pendulumAxes.push({
    pivot,
    bladeShadowDot,
    centerX,
    gz,
    baseY,
    rodLen,
    phase: idx * 1.4 + 0.5,
    speed: 2.05 + Math.abs(state.floorLevel) * 0.18,
    maxAngle: 0.72,
    lastWhooshSign: 0
  });
}

// -------------------------------------------------------------------------
// NEW INTERNET-FAVORITE OBSTACLE 3: VERTICAL THWOMP CRUSHER MONOLITHS (Y-Axis Slam)
// -------------------------------------------------------------------------
function createCrusherMonolith(gx, gz, theme, idx = 0) {
  const baseY = getSurfaceY(gx, gz);
  const g = new THREE.Group();
  const stoneMat = createVoxelMaterial('stone_brick', 0x334155, 0x0f172a, { roughness: 0.62 });
  const bandMat = createVoxelMaterial('hazard_stripes', 0xf43f5e, 0xfef08a, { roughness: 0.45 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.52, 1.65, 1.42), stoneMat);
  body.position.y = 0.825;
  body.castShadow = true;
  g.add(body);

  const hazardBelt = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.26, 1.48), bandMat);
  hazardBelt.position.y = 0.35;
  g.add(hazardBelt);

  // Glowing angry eyes on front of Thwomp monolith
  [-0.34, 0.34].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.08), eyeMat);
    eye.position.set(ex, 1.02, 0.72);
    g.add(eye);
  });

  // Shadow target ring on the ground below the Thwomp
  const shadowRing = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.72, 16),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.52, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
  );
  shadowRing.rotation.x = -Math.PI / 2;
  shadowRing.position.set(gx * TILE_SIZE, baseY + 0.03, -gz * TILE_SIZE);
  worldGroup.add(shadowRing);

  g.position.set(gx * TILE_SIZE, baseY + 3.2, -gz * TILE_SIZE);
  worldGroup.add(g);

  crusherBlocks.push({
    mesh: g,
    shadowRing,
    gx,
    gz,
    baseY,
    cycleTimer: idx * 1.1,
    cycleDuration: 2.8,
    currentHeight: 3.2
  });
}

// -------------------------------------------------------------------------
// NEW INTERNET-FAVORITE OBSTACLE 4: ROLLING SPIKED TIMBER LOGS (Z-Axis Hill Rollers)
// -------------------------------------------------------------------------
function createRollingSpikedLog(cfg, idx = 0) {
  const logGrp = new THREE.Group();
  const woodMat = createVoxelMaterial('wood_planks', 0x78350f, 0x451a03, { roughness: 0.78 });
  const bandMat = createVoxelMaterial('stone_brick', 0x94a3b8, 0x475569, { roughness: 0.4, metalness: 0.5 });

  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3.2, 12), woodMat);
  cyl.rotation.z = Math.PI / 2;
  cyl.castShadow = true;
  logGrp.add(cyl);

  [-1.1, 0, 1.1].forEach((bx) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.06, 8, 16), bandMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = bx;
    logGrp.add(ring);
  });

  const startZ = -cfg.startGz * TILE_SIZE;
  const initY = getSurfaceY(cfg.gx, cfg.startGz) + 0.44;
  logGrp.position.set(cfg.gx * TILE_SIZE, initY, startZ);
  worldGroup.add(logGrp);

  rollingLogs.push({
    mesh: logGrp,
    gx: cfg.gx,
    startGz: cfg.startGz,
    endGz: cfg.endGz,
    currentGz: cfg.startGz,
    speed: cfg.speed,
    halfWidth: 1.65,
    progress: (idx * 0.37) % 1.0
  });
}

// -------------------------------------------------------------------------
// INTERACTIVE TONGUE GRAPPLE TARGETS: GOLDEN FIREFLIES (✨) & GRAPPLE POSTS (🪷)
// -------------------------------------------------------------------------
function createInteractiveGrappleTargets(level, theme) {
  // 1. Grapple Lily-Posts: Tongue-whipping these zips Tode 2-3 rows forward across chasms/traps!
  const postRows = [14, 37, 54, 69, 83];
  const postMat = createVoxelMaterial('wood_planks', 0x059669, 0x10b981, { roughness: 0.45 });
  const lotusMat = createVoxelMaterial('crystal_gem', 0xf472b6, 0xfbcfe8, { roughness: 0.28, emissive: 0xdb2777, emissiveIntensity: 0.32 });

  postRows.forEach((gz) => {
    const destGz = gz + 1;
    const cCol = getTrackCenterCol(level, destGz);
    if (!validRoadwayTiles.has(tileKey(cCol, destGz)) || blockedTiles.has(tileKey(cCol, destGz))) return;
    const baseY = getSurfaceY(cCol, destGz);

    const postGrp = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.85, 10), postMat);
    stem.position.y = 0.425;
    postGrp.add(stem);

    const lotusBulb = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), lotusMat);
    lotusBulb.position.y = 1.02;
    postGrp.add(lotusBulb);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.05, 8, 18),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.02;
    postGrp.add(ring);

    postGrp.position.set(cCol * TILE_SIZE, baseY, -destGz * TILE_SIZE);
    worldGroup.add(postGrp);
    animatedProps.push({ mesh: lotusBulb, type: 'spinBob', baseY: 1.02, phase: destGz * 0.5 });

    grappleTargets.push({
      kind: 'grapple_post',
      mesh: postGrp,
      gx: cCol,
      gz: destGz,
      baseY,
      alive: true,
      latched: false
    });
  });

  // 2. Golden Fireflies: Hovering collectibles on outer lanes that can be sniped with the pink tongue or hopped into!
  const fireflyRows = [8, 19, 30, 42, 50, 61, 75, 85];
  const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const auraMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.45 });

  fireflyRows.forEach((gz, idx) => {
    const prof = getRowProfile(gz);
    const gx = idx % 2 === 0 ? Math.max(prof.minX, prof.centerCol - 2) : Math.min(prof.maxX, prof.centerCol + 2);
    if (!validRoadwayTiles.has(tileKey(gx, gz)) || blockedTiles.has(tileKey(gx, gz))) return;
    const baseY = getSurfaceY(gx, gz);

    const ffGrp = new THREE.Group();
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), fireflyMat);
    ffGrp.add(core);
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.44, 10, 10), auraMat);
    ffGrp.add(aura);

    ffGrp.position.set(gx * TILE_SIZE, baseY + 1.18, -gz * TILE_SIZE);
    worldGroup.add(ffGrp);
    animatedProps.push({ mesh: ffGrp, type: 'spinBob', baseY: baseY + 1.18, phase: idx * 1.1 });

    grappleTargets.push({
      kind: 'firefly',
      mesh: ffGrp,
      gx,
      gz,
      baseY,
      alive: true,
      latched: false
    });
  });
}

function createVoxelGrassCluster(x, y, z, colorHex = 0x34d399) {
  const g = new THREE.Group();
  const bladeMat = createVoxelMaterial('grass_top', colorHex, 0xa7f3d0, { roughness: 0.38 });
  const offsets = [
    [-0.16, 0.24, 0.0, 0.22],
    [0.0, 0.30, 0.06, -0.04],
    [0.16, 0.22, -0.05, -0.24]
  ];
  offsets.forEach(([ox, h, oz, tilt]) => {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.075, h, 12), bladeMat);
    blade.position.set(ox, h * 0.5, oz);
    blade.rotation.z = tilt;
    blade.castShadow = true;
    g.add(blade);
  });
  g.position.set(x, y, z);
  return g;
}

function createTorchBrazier(x, y, z, addPointLight = false) {
  const torchGrp = new THREE.Group();
  const postMat = createVoxelMaterial('wood_planks', 0x78350f, 0x451a03, { roughness: 0.85 });
  const bracketMat = createVoxelMaterial('stone_brick', 0x334155, 0x1e293b, { roughness: 0.6, metalness: 0.35 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.45, 0.36), postMat);
  pillar.position.y = 0.725;
  pillar.castShadow = true;
  torchGrp.add(pillar);

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.46), bracketMat);
  collar.position.y = 1.38;
  torchGrp.add(collar);

  const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 16), coreMat);
  flameOuter.position.y = 1.68;
  torchGrp.add(flameOuter);

  const flameInner = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), flameMat);
  flameInner.position.y = 1.60;
  torchGrp.add(flameInner);

  if (addPointLight) {
    const pt = new THREE.PointLight(0xfbbf24, 1.15, 14, 2);
    pt.position.set(0, 1.85, 0);
    torchGrp.add(pt);
  }

  torchGrp.position.set(x, y, z);
  animatedProps.push({ mesh: flameOuter, type: 'spinBob', baseY: 1.66, phase: x + z });
  return torchGrp;
}

function buildRealisticOuterEnvironment(floorCfg) {
  const theme = floorCfg.theme;
  scrollingWaterTextures.length = 0;

  const cobbleMat = createVoxelMaterial('stone_brick', 0x475569, 0x334155, { roughness: 0.46 });
  const darkStoneMat = createVoxelMaterial('stone_brick', 0x334155, 0x1e293b, { roughness: 0.52 });
  const mossTopMat = createVoxelMaterial('grass_top', 0x10b981, 0x34d399, { roughness: 0.40 });
  const woodMat = createVoxelMaterial('wood_planks', 0x78350f, 0x451a03, { roughness: 0.82 });
  const bannerMat = createVoxelMaterial('wood_planks', 0xb91c1c, 0xfbbf24, { roughness: 0.75 });
  const waterfallMat = createVoxelMaterial('water_flow', 0x38bdf8, 0xe0f2fe, {
    roughness: 0.25,
    transparent: true,
    opacity: 0.84,
    scrollWater: true,
    repeatX: 1,
    repeatY: 3
  });

  // Starting Terrace positioned cleanly at z = TILE_SIZE * 1.05 (z = +2.10) with zero overlap against Row 0 tiles (z = -1..+1)!
  const terraceGroup = new THREE.Group();
  for (let tx = -2; tx <= 2; tx++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(TILE_SIZE * 0.98, 0.52, TILE_SIZE * 0.96), cobbleMat);
    slab.position.set(tx * TILE_SIZE, -0.275, TILE_SIZE * 1.05);
    slab.receiveShadow = true;
    slab.castShadow = true;
    terraceGroup.add(slab);

    const cliffFront = new THREE.Mesh(new THREE.BoxGeometry(TILE_SIZE * 0.92, 2.6, TILE_SIZE * 0.92), darkStoneMat);
    cliffFront.position.set(tx * TILE_SIZE, -1.85, TILE_SIZE * 1.05);
    terraceGroup.add(cliffFront);

    if (tx !== 0) {
      const mossPatch = new THREE.Mesh(new THREE.BoxGeometry(TILE_SIZE * 0.70, 0.03, TILE_SIZE * 0.62), mossTopMat);
      mossPatch.position.set(tx * TILE_SIZE + (tx < 0 ? -0.14 : 0.14), 0.012, TILE_SIZE * 1.05);
      mossPatch.receiveShadow = true;
      terraceGroup.add(mossPatch);
    }
  }
  worldGroup.add(terraceGroup);

  const leftOutcrop = new THREE.Group();
  const leftBlocks = [
    [-3.4, -0.35, 3.2, 2.2, 1.4, 2.2],
    [-4.5, 0.25, 2.4, 1.9, 2.1, 2.1],
    [-5.4, 1.45, 1.5, 2.0, 3.4, 2.2],
    [-2.5, -0.55, 4.1, 1.8, 1.1, 1.8]
  ];
  leftBlocks.forEach(([bx, by, bz, bw, bh, bd]) => {
    const blk = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), cobbleMat);
    blk.position.set(bx, by, bz);
    blk.castShadow = true;
    blk.receiveShadow = true;
    leftOutcrop.add(blk);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(bw * 1.02, 0.24, bd * 1.02), mossTopMat);
    cap.position.set(bx, by + bh * 0.5 + 0.10, bz);
    cap.receiveShadow = true;
    leftOutcrop.add(cap);
  });
  leftOutcrop.add(createTorchBrazier(-4.35, 0.35, 3.45, true));
  leftOutcrop.add(createVoxelGrassCluster(-3.4, 0.45, 3.3));
  leftOutcrop.add(createVoxelGrassCluster(-2.2, 0.12, 3.8));
  worldGroup.add(leftOutcrop);

  const rightOutcrop = new THREE.Group();
  const rRock = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), cobbleMat);
  rRock.position.set(4.3, -0.85, 2.6);
  rRock.castShadow = true;
  rightOutcrop.add(rRock);

  const rCap = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.26, 2.45), mossTopMat);
  rCap.position.set(4.3, 0.32, 2.6);
  rightOutcrop.add(rCap);

  const postPole = new THREE.Mesh(new THREE.BoxGeometry(0.34, 3.4, 0.34), woodMat);
  postPole.position.set(4.15, 1.85, 2.35);
  postPole.castShadow = true;
  rightOutcrop.add(postPole);

  const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.26, 0.28), woodMat);
  crossArm.position.set(3.65, 3.15, 2.35);
  rightOutcrop.add(crossArm);

  const hangingBanner = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.85, 0.08), bannerMat);
  hangingBanner.position.set(3.55, 2.12, 2.42);
  hangingBanner.castShadow = true;
  rightOutcrop.add(hangingBanner);
  animatedProps.push({ mesh: hangingBanner, type: 'tuft', phase: 1.2 });

  worldGroup.add(rightOutcrop);

  if (theme === 'ground') {
    // Smooth, realistic dual-layer animated water expanse (zero ugly stripe lines!)
    const deepWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.18,
      metalness: 0.12
    });
    const deepBed = new THREE.Mesh(new THREE.PlaneGeometry(160, 260), deepWaterMat);
    deepBed.rotation.x = -Math.PI / 2;
    deepBed.position.set(0, -7.2, -96);
    worldGroup.add(deepBed);

    const riverMatA = createVoxelMaterial('water_flow', 0x0284c7, 0x38bdf8, {
      roughness: 0.16,
      metalness: 0.10,
      transparent: true,
      opacity: 0.78,
      scrollFloor: true,
      scrollFloorVx: 0.035,
      scrollFloorVy: 0.085,
      repeatX: 4,
      repeatY: 7
    });
    const riverPlaneA = new THREE.Mesh(new THREE.PlaneGeometry(160, 260, 24, 36), riverMatA);
    riverPlaneA.rotation.x = -Math.PI / 2;
    riverPlaneA.position.set(0, -6.4, -96);
    worldGroup.add(riverPlaneA);
    animatedProps.push({ mesh: riverPlaneA, type: 'waterWave', baseY: -6.4 });

    const riverMatB = createVoxelMaterial('ocean_caustics', 0x38bdf8, 0xbae6fd, {
      roughness: 0.14,
      transparent: true,
      opacity: 0.42,
      scrollFloor: true,
      scrollFloorVx: -0.028,
      scrollFloorVy: 0.065,
      repeatX: 5,
      repeatY: 8
    });
    const riverPlaneB = new THREE.Mesh(new THREE.PlaneGeometry(160, 260), riverMatB);
    riverPlaneB.rotation.x = -Math.PI / 2;
    riverPlaneB.position.set(0, -6.22, -96);
    worldGroup.add(riverPlaneB);
  } else if (theme === 'ocean') {
    const seabed = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 260),
      createVoxelMaterial('ocean_caustics', 0x082f49, 0x0d9488, {
        roughness: 0.35,
        scrollFloor: true,
        scrollFloorVx: 0.03,
        scrollFloorVy: 0.07,
        repeatX: 6,
        repeatY: 9
      })
    );
    seabed.rotation.x = -Math.PI / 2;
    seabed.position.set(0, -7.8, -96);
    worldGroup.add(seabed);

    for (let i = 0; i < 36; i++) {
      const gzApprox = Math.min(ROADWAY_LENGTH, Math.max(0, Math.round((i * 5.2) % ROADWAY_LENGTH)));
      const prof = getRowProfile(gzApprox);
      const side = i % 2 === 0 ? -1 : 1;
      const kx = side < 0 ? (prof.minX - 5.5 - (i % 4) * 1.8) * TILE_SIZE : (prof.maxX + 5.5 + (i % 4) * 1.8) * TILE_SIZE;
      const kz = -gzApprox * TILE_SIZE;
      const kelp = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 5.2 + (i % 3) * 1.4, 0.45),
        createVoxelMaterial('grass_top', i % 2 === 0 ? 0x0d9488 : 0x06b6d4, 0x2dd4bf)
      );
      kelp.position.set(kx, -5.2, kz);
      worldGroup.add(kelp);
      animatedProps.push({ mesh: kelp, type: 'tuft', phase: i * 0.7 });
    }
  }

  // Clouds placed well below or outside the track corridor so they never clip play tiles
  for (let i = 0; i < 42; i++) {
    const puffGroup = new THREE.Group();
    const cloudColor = theme === 'ocean' ? 0x0e7490 : (i % 3 === 0 ? 0xfef3c7 : 0xf8fafc);
    const cloudMat = createVoxelMaterial('frog_belly', cloudColor, 0x93c5fd, {
      roughness: 0.65,
      transparent: true,
      opacity: theme === 'ocean' ? 0.34 : 0.85
    });
    const mainPuff = new THREE.Mesh(new THREE.SphereGeometry(3.0, 18, 14), cloudMat);
    mainPuff.scale.set(1.45, 0.48, 1.05);
    puffGroup.add(mainPuff);
    const subPuff = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 12), cloudMat);
    subPuff.scale.set(1.2, 0.60, 1.0);
    subPuff.position.set(1.3, 0.65, 0.2);
    puffGroup.add(subPuff);

    const gzCloud = Math.min(ROADWAY_LENGTH, Math.max(0, Math.round(i * 2.3)));
    const prof = getRowProfile(gzCloud);
    const side = i % 2 === 0 ? -1 : 1;
    const cx = side < 0
      ? (prof.minX - 6.5 - (i % 5) * 2.2) * TILE_SIZE
      : (prof.maxX + 6.5 + (i % 5) * 2.2) * TILE_SIZE;
    const cy = -5.8 - (i % 3) * 1.8;
    const cz = -gzCloud * TILE_SIZE;
    puffGroup.position.set(cx, cy, cz);
    worldGroup.add(puffGroup);
    animatedProps.push({ mesh: puffGroup, type: 'cloud', baseY: cy, phase: i * 0.6 });
  }

  // Side Floating Islands dynamically offset outside the winding track bounds so they NEVER overlap the play arena!
  const islandRockMat = createVoxelMaterial(
    'stone_brick',
    theme === 'ocean' ? 0x1e3a5f : 0x475569,
    theme === 'ocean' ? 0x0f2942 : 0x334155,
    { roughness: 0.52 }
  );
  const islandMossMat = createVoxelMaterial(
    'grass_top',
    theme === 'heaven' ? 0xe2e8f0 : (theme === 'ocean' ? 0x0d9488 : 0x10b981),
    theme === 'heaven' ? 0xf8fafc : 0x34d399,
    { roughness: 0.42 }
  );
  const pineFoliageMat = createVoxelMaterial('grass_top', 0x15803d, 0x22c55e, { roughness: 0.78 });

  const islandRows = [8, 16, 26, 36, 46, 56, 66, 76, 86];
  islandRows.forEach((igz, idx) => {
    const side = idx % 2 === 0 ? -1 : 1;
    let minColSpan = 12;
    let maxColSpan = -12;
    for (let r = Math.max(0, igz - 4); r <= Math.min(ROADWAY_LENGTH, igz + 4); r++) {
      const p = getRowProfile(r);
      if (p.minX < minColSpan) minColSpan = p.minX;
      if (p.maxX > maxColSpan) maxColSpan = p.maxX;
    }
    const sz = 4.6 + (idx % 3) * 0.5;
    // Place island at least 12.5 world units outside the widest nearby track edge
    const ix = side < 0
      ? (minColSpan * TILE_SIZE) - 12.5 - (idx % 2) * 2.5
      : (maxColSpan * TILE_SIZE) + 12.5 + (idx % 2) * 2.5;
    const iy = 1.6 + (idx % 3) * 1.4;
    const iz = -igz * TILE_SIZE;

    const isle = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.BoxGeometry(sz, sz * 0.88, sz), islandRockMat);
    rock.castShadow = true;
    rock.receiveShadow = true;
    isle.add(rock);

    const underRock = new THREE.Mesh(new THREE.BoxGeometry(sz * 0.68, sz * 0.55, sz * 0.68), darkStoneMat);
    underRock.position.y = -sz * 0.68;
    isle.add(underRock);

    const moss = new THREE.Mesh(new THREE.BoxGeometry(sz * 1.04, 0.48, sz * 1.04), islandMossMat);
    moss.position.y = sz * 0.44 + 0.2;
    moss.receiveShadow = true;
    isle.add(moss);

    if (idx % 2 === 0 || idx === 1) {
      const wf = new THREE.Mesh(new THREE.BoxGeometry(sz * 0.30, sz * 1.85, 0.16), waterfallMat);
      wf.position.set(0, -sz * 0.62, sz * 0.53);
      isle.add(wf);
    }

    const treeTopY = sz * 0.44 + 0.44;
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.4, 0.42), woodMat);
    trunk.position.set(-sz * 0.22, treeTopY + 0.7, -sz * 0.18);
    trunk.castShadow = true;
    isle.add(trunk);

    const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.9, 20), pineFoliageMat);
    tier1.position.set(-sz * 0.22, treeTopY + 1.8, -sz * 0.18);
    tier1.rotation.y = Math.PI / 4;
    tier1.castShadow = true;
    isle.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.92, 1.55, 20), pineFoliageMat);
    tier2.position.set(-sz * 0.22, treeTopY + 2.75, -sz * 0.18);
    tier2.rotation.y = Math.PI / 4;
    tier2.castShadow = true;
    isle.add(tier2);

    isle.position.set(ix, iy, iz);
    worldGroup.add(isle);
    animatedProps.push({ mesh: isle, type: 'cloud', baseY: iy, phase: idx * 0.85 });
  });

  [-4.6, 4.6].forEach((tx) => {
    worldGroup.add(createTorchBrazier(tx, 0, -2.5, false));
  });
}

function createCrownGateArch(gateZ, scale = 1.0) {
  const g = new THREE.Group();
  const stoneMat = createVoxelMaterial('stone_brick', 0x64748b, 0x334155, { roughness: 0.75 });
  const goldMat = createVoxelMaterial('stone_brick', 0xfbbf24, 0xfef08a, {
    roughness: 0.35,
    metalness: 0.45,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.38
  });
  const portalGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide
  });

  [-3.4 * scale, 3.4 * scale].forEach((tx) => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.6 * scale, 5.8 * scale, 1.6 * scale), stoneMat);
    tower.position.set(tx, 2.9 * scale, gateZ);
    tower.castShadow = true;
    g.add(tower);
  });

  [-2.1 * scale, 2.1 * scale].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.75 * scale, 4.6 * scale, 0.85 * scale), goldMat);
    pillar.position.set(px, 2.3 * scale, gateZ);
    pillar.castShadow = true;
    g.add(pillar);
  });

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.2 * scale, 0.78 * scale, 0.95 * scale), goldMat);
  lintel.position.set(0, 4.65 * scale, gateZ);
  lintel.castShadow = true;
  g.add(lintel);

  const portalSheet = new THREE.Mesh(new THREE.PlaneGeometry(3.5 * scale, 4.2 * scale), portalGlowMat);
  portalSheet.position.set(0, 2.2 * scale, gateZ);
  g.add(portalSheet);

  const crownGrp = new THREE.Group();
  crownGrp.position.set(0, 5.55 * scale, gateZ);
  const crownBase = new THREE.Mesh(new THREE.BoxGeometry(1.65 * scale, 0.32 * scale, 0.36 * scale), goldMat);
  crownGrp.add(crownBase);
  [-0.55 * scale, 0, 0.55 * scale].forEach((cx, i) => {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.28 * scale, (i === 1 ? 0.78 : 0.58) * scale, 4),
      goldMat
    );
    spike.position.set(cx, (i === 1 ? 0.52 : 0.42) * scale, 0);
    spike.rotation.y = Math.PI / 4;
    crownGrp.add(spike);
  });
  g.add(crownGrp);
  animatedProps.push({ mesh: crownGrp, type: 'bob', baseY: 5.55 * scale, phase: 0.5 });

  return g;
}

function createPortalSignSprite(titleText, subText, borderHex = '#38bdf8') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext('2d');

  ctx.fillStyle = 'rgba(6, 12, 24, 0.90)';
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(12, 12, 488, 136, 28);
  ctx.fill();
  ctx.stroke();

  ctx.font = '900 42px Outfit, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(titleText, 256, 74);

  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.fillStyle = borderHex;
  ctx.fillText(subText, 256, 120);

  const tex = new THREE.CanvasTexture(c);
  tex.encoding = THREE.sRGBEncoding;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.2, 1.32, 1);
  return sprite;
}

function createFinishShrineAndPortals() {
  const hoopRowZ = -(ROADWAY_LENGTH - 2) * TILE_SIZE;
  const shrineZ = -ROADWAY_LENGTH * TILE_SIZE;
  const g = new THREE.Group();

  const stoneMat = createVoxelMaterial('stone_brick', 0xe2e8f0, 0x94a3b8, { roughness: 0.68, repeatX: 4, repeatY: 2 });

  const dais = new THREE.Mesh(new THREE.BoxGeometry(18, 0.55, 7.5), stoneMat);
  dais.position.set(0, 0.25, shrineZ - 1.2);
  dais.receiveShadow = true;
  g.add(dais);

  g.add(createCrownGateArch(shrineZ - 3.2, 1.05));

  const isApexFloor = Math.abs(state.floorLevel) >= 3;
  const nextAbyss = Math.max(-3, state.floorLevel > 0 ? -1 : state.floorLevel - 1);
  const nextSky = Math.min(3, state.floorLevel < 0 ? 1 : state.floorLevel + 1);
  const nextCenter = state.floorLevel < 0 ? nextAbyss : nextSky;

  const abyssPortalGroup = new THREE.Group();
  abyssPortalGroup.position.set(-2 * TILE_SIZE, 2.05, hoopRowZ - 0.4);
  abyssPortalGroup.add(new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.26, 12, 32),
    createVoxelMaterial('crystal_gem', 0x0891b2, 0x67e8f9, { emissive: 0x0891b2, emissiveIntensity: 0.42 })
  ));
  abyssPortalGroup.add(new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.10, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xa5f3fc })
  ));
  abyssPortalGroup.add(new THREE.Mesh(
    new THREE.CircleGeometry(1.42, 24),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
  ));
  g.add(abyssPortalGroup);
  animatedProps.push({ mesh: abyssPortalGroup, type: 'portal', speed: 2.2 });

  const abyssSign = createPortalSignSprite(
    isApexFloor ? '🏆 FINAL VICTORY' : `🌊 ${FLOORS[nextAbyss].name.toUpperCase()}`,
    isApexFloor ? 'CELEBRATION FINALE' : 'OCEAN DIVE HOOP',
    '#38bdf8'
  );
  abyssSign.position.set(-2 * TILE_SIZE, 4.55, hoopRowZ - 0.4);
  g.add(abyssSign);

  const skyPortalGroup = new THREE.Group();
  skyPortalGroup.position.set(2 * TILE_SIZE, 2.05, hoopRowZ - 0.4);
  skyPortalGroup.add(new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.26, 12, 32),
    createVoxelMaterial('crystal_gem', 0xf59e0b, 0xfef08a, { emissive: 0xf59e0b, emissiveIntensity: 0.42 })
  ));
  skyPortalGroup.add(new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.10, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  ));
  skyPortalGroup.add(new THREE.Mesh(
    new THREE.CircleGeometry(1.42, 24),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.84 })
  ));
  g.add(skyPortalGroup);
  animatedProps.push({ mesh: skyPortalGroup, type: 'portal', speed: -2.2 });

  const skySign = createPortalSignSprite(
    isApexFloor ? '👑 APEX VICTORY' : `☀️ ${FLOORS[nextSky].name.toUpperCase()}`,
    isApexFloor ? 'DANCE IN JOY!' : 'SKY ASCENT HOOP',
    '#fbbf24'
  );
  skySign.position.set(2 * TILE_SIZE, 4.55, hoopRowZ - 0.4);
  g.add(skySign);

  const centerPortalGroup = new THREE.Group();
  centerPortalGroup.position.set(0, 2.15, shrineZ - 1.2);
  centerPortalGroup.add(new THREE.Mesh(
    new THREE.TorusGeometry(1.50, 0.22, 10, 28),
    createVoxelMaterial('crystal_gem', 0x10b981, 0xa7f3d0, { emissive: 0x10b981, emissiveIntensity: 0.40 })
  ));
  centerPortalGroup.add(new THREE.Mesh(
    new THREE.CircleGeometry(1.32, 24),
    new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
  ));
  g.add(centerPortalGroup);
  animatedProps.push({ mesh: centerPortalGroup, type: 'portal', speed: 1.8 });

  const centerSign = createPortalSignSprite(
    isApexFloor ? '🎉 CAMPAIGN CLEAR' : `${FLOORS[nextCenter].icon} ${FLOORS[nextCenter].name.toUpperCase()}`,
    isApexFloor ? 'VICTORY FINALE' : 'NEXT REALM HOOP',
    '#34d399'
  );
  centerSign.position.set(0, 4.65, shrineZ - 1.2);
  g.add(centerSign);

  worldGroup.add(g);
}

function buildRoadwayWorld() {
  while (worldGroup.children.length > 0) {
    worldGroup.remove(worldGroup.children[0]);
  }
  validRoadwayTiles.clear();
  blockedTiles.clear();
  tileElevationMap.clear();
  obstacleMetaMap.clear();
  fencedEdges.clear();
  animatedProps.length = 0;
  sweeperBeams.length = 0;
  movingPlatforms.length = 0;
  pushBlocks.length = 0;
  bouncePads.length = 0;
  cannonShooters.length = 0;
  cannonProjectiles.length = 0;
  pendulumAxes.length = 0;
  crusherBlocks.length = 0;
  rollingLogs.length = 0;
  grappleTargets.length = 0;

  // Adaptive Mobile Shadow & Pixel Ratio Optimization
  const isMobileScreen = window.innerWidth < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileScreen ? 1.5 : 2.0));

  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
  renderer.toneMappingExposure = SHADER_CONFIG.exposure;
  refreshFrogMaterialsForPack();

  ambientLight.intensity = 0.88;
  dirLight.color.setHex(0xfff1c1);
  dirLight.intensity = 1.24;
  dirLight.position.set(28, 36, 18);
  rimLight.intensity = 0.40;
  scene.fog = new THREE.FogExp2(floorCfg.theme === 'ground' ? 0x8ab4d8 : floorCfg.fogHex, 0.0056);

  scene.background = createSkyDomeTexture(floorCfg.skyTop, floorCfg.skyMid, floorCfg.skyHorizon, floorCfg.theme);
  ambientLight.color.setHex(floorCfg.ambientTop);
  ambientLight.groundColor.setHex(floorCfg.ambientGround);

  buildRealisticOuterEnvironment(floorCfg);

  scrollingFloorTextures.length = 0;
  const floorPattern = floorCfg.theme === 'ocean'
    ? 'ocean_caustics'
    : (floorCfg.theme === 'heaven' ? 'cloud_mist' : 'grass_top');

  const matTileA = createVoxelMaterial(floorPattern, floorCfg.tileA, floorCfg.tileB, {
    roughness: floorCfg.theme === 'ocean' ? 0.24 : 0.36,
    scrollFloor: true,
    scrollFloorVx: floorCfg.theme === 'heaven' ? 0.06 : 0.04,
    scrollFloorVy: floorCfg.theme === 'ocean' ? 0.22 : 0.09
  });
  const matTileB = createVoxelMaterial(floorPattern, floorCfg.tileB, floorCfg.tileA, {
    roughness: floorCfg.theme === 'ocean' ? 0.28 : 0.40,
    scrollFloor: true,
    scrollFloorVx: floorCfg.theme === 'heaven' ? -0.05 : -0.03,
    scrollFloorVy: floorCfg.theme === 'ocean' ? 0.18 : 0.07
  });
  const matHighland = createVoxelMaterial('cobble_moss', floorCfg.tileA, 0xfef08a, { roughness: 0.42 });
  const matCliff = createVoxelMaterial('stone_brick', floorCfg.cliffColor, 0x0f172a, { roughness: 0.52 });
  const matStartPad = createVoxelMaterial('grass_top', 0x34d399, 0xa7f3d0, { roughness: 0.34 });
  const matCheckpoint = createVoxelMaterial('crystal_gem', 0x38bdf8, 0xe0f2fe, { roughness: 0.45, emissive: 0x0284c7, emissiveIntensity: 0.25 });

  // Shared materials for alive 3D floor surface details (swaying grass, rising ocean bubbles, drifting cloud mist)
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.68 });
  const mistOverlayMat = new THREE.MeshBasicMaterial({
    color: floorCfg.theme === 'heaven' ? 0xfef9c3 : 0xe0f2fe,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  });

  // Slightly inset tile geometry (0.992 * TILE_SIZE) prevents any adjacent face Z-fighting!
  const tileGeo = new THREE.BoxGeometry(TILE_SIZE * 0.992, 0.52, TILE_SIZE * 0.992);
  const cliffTransforms = [];

  for (let gz = 0; gz <= ROADWAY_LENGTH; gz++) {
    const wz = -gz * TILE_SIZE;
    const cCol = getTrackCenterCol(state.floorLevel, gz);
    for (let gx = -12; gx <= 12; gx++) {
      const cell = evaluateLevelTile(state.floorLevel, gx, gz);
      if (!cell.exists) continue;

      const elevY = getTileElevation(state.floorLevel, gx, gz);
      validRoadwayTiles.add(tileKey(gx, gz));
      tileElevationMap.set(tileKey(gx, gz), elevY);
      const wx = gx * TILE_SIZE;

      const isEven = (gx + gz) % 2 === 0;
      const isStart = (gz === 0 && gx === 0);
      const isCheckpoint = (CHECKPOINT_ROWS.includes(gz) && Math.abs(gx - cCol) <= 1);
      const isHighHill = elevY >= 1.1;

      const tileMesh = new THREE.Mesh(
        tileGeo,
        isStart ? matStartPad : (isCheckpoint ? matCheckpoint : (isHighHill && isEven ? matHighland : (isEven ? matTileA : matTileB)))
      );
      tileMesh.position.set(wx, elevY - 0.26, wz);
      tileMesh.receiveShadow = true;
      worldGroup.add(tileMesh);

      const cliffHeight = 2.8 + Math.max(0, elevY);
      cliffTransforms.push({ x: wx, y: elevY - 0.52 - cliffHeight * 0.5, z: wz, sy: cliffHeight });

      // Alive 3D Moving Floor Details on Tile Surfaces (Swaying Grass / Rising Water Bubbles / Drifting Cloud Fog)
      if (gz > 1 && gz < ROADWAY_LENGTH - 3 && !isCheckpoint && ((gx * 3 + gz * 5) % 7 === 0)) {
        if (floorCfg.theme === 'ground') {
          const tuft = createVoxelGrassCluster(wx + (isEven ? -0.58 : 0.58), elevY, wz + 0.52, isEven ? 0x22c55e : 0x4ade80);
          worldGroup.add(tuft);
          animatedProps.push({ mesh: tuft, type: 'tuft', phase: gz * 0.6 + gx });
        } else if (floorCfg.theme === 'ocean') {
          const bSphere = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), bubbleMat);
          bSphere.position.set(wx + (isEven ? -0.45 : 0.45), elevY + 0.18, wz);
          worldGroup.add(bSphere);
          animatedProps.push({ mesh: bSphere, type: 'bubbleRise', baseY: elevY + 0.12, phase: gz * 0.5 + gx });
        } else if (floorCfg.theme === 'heaven') {
          const mistPuff = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), mistOverlayMat);
          mistPuff.scale.set(1.4, 0.18, 1.1);
          mistPuff.position.set(wx, elevY + 0.08, wz);
          worldGroup.add(mistPuff);
          animatedProps.push({ mesh: mistPuff, type: 'fogDrift', baseX: wx, phase: gz * 0.4 + gx });
        }
      }

      if (cell.fencedL) {
        fencedEdges.add(`${gx},${gz},L`);
        const railX = wx - 0.92;
        worldGroup.add(createGuardrailSegment(railX, wz + TILE_SIZE * 0.5, wz - TILE_SIZE * 0.5, floorCfg.railColor, elevY));
      }
      if (cell.fencedR) {
        fencedEdges.add(`${gx},${gz},R`);
        const railX = wx + 0.92;
        worldGroup.add(createGuardrailSegment(railX, wz + TILE_SIZE * 0.5, wz - TILE_SIZE * 0.5, floorCfg.railColor, elevY));
      }
    }
  }

  // Render all ~700 cliff underside blocks in a SINGLE WebGL draw call via THREE.InstancedMesh!
  if (cliffTransforms.length > 0) {
    const unitCliffGeo = new THREE.BoxGeometry(TILE_SIZE * 0.92, 1.0, TILE_SIZE * 0.92);
    const cliffInstanced = new THREE.InstancedMesh(unitCliffGeo, matCliff, cliffTransforms.length);
    const dummy = new THREE.Object3D();
    cliffTransforms.forEach((ct, i) => {
      dummy.position.set(ct.x, ct.y, ct.z);
      dummy.scale.set(1, ct.sy, 1);
      dummy.updateMatrix();
      cliffInstanced.setMatrixAt(i, dummy.matrix);
    });
    cliffInstanced.instanceMatrix.needsUpdate = true;
    worldGroup.add(cliffInstanced);
  }

  const obstacleCoords = getLevelObstacles(state.floorLevel);
  obstacleCoords.forEach(([gx, gz], idx) => {
    if (validRoadwayTiles.has(tileKey(gx, gz))) {
      blockedTiles.add(tileKey(gx, gz));
      const elevY = getSurfaceY(gx, gz);
      worldGroup.add(createThemeObstacle(gx * TILE_SIZE, -gz * TILE_SIZE, floorCfg.theme, idx, elevY));
    }
  });

  getLevelSweeperRows(state.floorLevel).forEach((sgz) => {
    createRotatingSweeper(sgz, floorCfg.theme);
  });

  getLevelPushBlockRows(state.floorLevel).forEach((pgz, idx) => {
    createSlidingPushBlock(pgz, floorCfg.theme, idx);
  });

  getLevelBouncePads(state.floorLevel).forEach(([bgx, bgz]) => {
    if (validRoadwayTiles.has(tileKey(bgx, bgz)) && !blockedTiles.has(tileKey(bgx, bgz))) {
      createBouncePad(bgx, bgz, floorCfg.theme);
    }
  });

  getLevelMovingPlatformRows(state.floorLevel).forEach((pgz, idx) => {
    const cCol = getTrackCenterCol(state.floorLevel, pgz);
    const elevY = getTileElevation(state.floorLevel, cCol, pgz);
    const platColor = floorCfg.theme === 'heaven' ? 0xfde047 : (floorCfg.theme === 'ocean' ? 0x22d3ee : 0x10b981);
    const platMesh = new THREE.Mesh(
      new THREE.BoxGeometry(TILE_SIZE * 0.96, 0.56, TILE_SIZE * 0.96),
      createVoxelMaterial('stone_brick', platColor, 0xffffff, { roughness: 0.5, metalness: 0.2 })
    );
    platMesh.position.set(cCol * TILE_SIZE, elevY - 0.22, -pgz * TILE_SIZE);
    platMesh.receiveShadow = true;
    worldGroup.add(platMesh);
    movingPlatforms.push({
      mesh: platMesh,
      centerX: cCol * TILE_SIZE,
      gz: pgz,
      baseY: elevY,
      phase: idx * 1.5,
      speed: 1.4 + Math.abs(state.floorLevel) * 0.22,
      spanX: 1.8 * TILE_SIZE
    });
  });

  // Spawn New Diverse Multi-Axis Obstacles: Cannons, Swinging Pendulum Axes, Vertical Thwomps & Rolling Logs!
  getLevelCannonRows(state.floorLevel).forEach((cfg, idx) => {
    createCannonTurret(cfg.gz, cfg.side, floorCfg.theme, idx);
  });

  getLevelPendulumAxeRows(state.floorLevel).forEach((agz, idx) => {
    createSwingingPendulumAxe(agz, floorCfg.theme, idx);
  });

  getLevelCrusherConfigs(state.floorLevel).forEach((cfg, idx) => {
    if (validRoadwayTiles.has(tileKey(cfg.gx, cfg.gz)) && !blockedTiles.has(tileKey(cfg.gx, cfg.gz))) {
      createCrusherMonolith(cfg.gx, cfg.gz, floorCfg.theme, idx);
    }
  });

  getLevelRollingLogSpans(state.floorLevel).forEach((cfg, idx) => {
    createRollingSpikedLog(cfg, idx);
  });

  createInteractiveGrappleTargets(state.floorLevel, floorCfg.theme);
  createFinishShrineAndPortals();
}

