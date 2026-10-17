/**
 * THE FROGGIT — 5 Multi-Part 3D Enemy Archetypes, 3-Shield Guardian Boss & Particle Bursts
 * File: src/entities/enemiesAndParticles.js
 */
// =========================================================================
// 7. LEVEL-SPECIFIC ENEMY FORMATIONS & ANGER / DISPERSION SCALING
// =========================================================================
const beesGroup = new THREE.Group();
scene.add(beesGroup);
const bees = [];

function getLevelEnemyBlueprints(level) {
  const raw = [
    { relX: 0,  gz: 5,  type: 'sweeper', spanX: 1.2, speed: 1.8, phaseOffset: 0.0 },
    { relX: -1, gz: 9,  type: 'zigzag',  spanX: 2.0, spanZ: 1.1, speed: 2.0, phaseOffset: 1.1 },
    { relX: 1,  gz: 13, type: 'swooper', spanX: 1.8, spanZ: 1.3, speed: 2.2, phaseOffset: 0.4 },
    { relX: 0,  gz: 18, type: 'figure8', spanX: 2.4, spanZ: 1.2, speed: 2.3, phaseOffset: 2.1 },
    { relX: -1, gz: 22, type: 'sweeper', spanX: 2.2, speed: 2.4, phaseOffset: 0.9 },
    { relX: 1,  gz: 26, type: 'swooper', spanX: 2.0, spanZ: 1.4, speed: 2.5, phaseOffset: 1.7 },
    { relX: 0,  gz: 31, type: 'zigzag',  spanX: 2.2, spanZ: 1.2, speed: 2.6, phaseOffset: 0.3 },
    { relX: -1, gz: 35, type: 'loop',    spanX: 1.8, spanZ: 1.1, speed: 2.7, phaseOffset: 2.0 },
    { relX: 1,  gz: 40, type: 'swooper', spanX: 2.2, spanZ: 1.5, speed: 2.8, phaseOffset: 1.2 },
    { relX: 0,  gz: 44, type: 'figure8', spanX: 2.4, spanZ: 1.2, speed: 2.8, phaseOffset: 0.6 },
    { relX: -2, gz: 49, type: 'sweeper', spanX: 1.4, speed: 2.9, phaseOffset: 2.5 },
    { relX: 2,  gz: 51, type: 'zigzag',  spanX: 1.4, spanZ: 1.2, speed: 2.9, phaseOffset: 1.4 },
    { relX: 0,  gz: 59, type: 'swooper', spanX: 2.4, spanZ: 1.5, speed: 3.0, phaseOffset: 0.2 },
    { relX: -1, gz: 63, type: 'loop',    spanX: 2.0, spanZ: 1.1, speed: 3.1, phaseOffset: 1.9 },
    { relX: 1,  gz: 68, type: 'zigzag',  spanX: 2.2, spanZ: 1.3, speed: 3.1, phaseOffset: 0.8 },
    { relX: 0,  gz: 73, type: 'figure8', spanX: 2.5, spanZ: 1.2, speed: 3.2, phaseOffset: 2.9 },
    { relX: -1, gz: 77, type: 'sweeper', spanX: 2.2, speed: 3.2, phaseOffset: 0.5 },
    { relX: 1,  gz: 82, type: 'swooper', spanX: 2.4, spanZ: 1.5, speed: 3.3, phaseOffset: 1.6 },
    { relX: 0,  gz: 86, type: 'figure8', spanX: 2.5, spanZ: 1.2, speed: 3.4, phaseOffset: 2.2 },
    { relX: 0,  gz: 90, type: 'boss',    spanX: 2.8, spanZ: 1.6, speed: 3.0, phaseOffset: 0.0 }
  ];
  return raw.map((item) => ({
    gx: getTrackCenterCol(level, item.gz) + item.relX,
    gz: item.gz,
    type: item.type,
    spanX: item.spanX,
    spanZ: item.spanZ,
    speed: item.speed,
    phaseOffset: item.phaseOffset
  }));
}

// Multi-Part, Vastly Colored & Anatomically Distinct 3D Enemy Creatures by Archetype & Biome
function buildThemeEnemyMesh(theme, type) {
  const root = new THREE.Group();
  const isBoss = type === 'boss';
  const scale = isBoss ? 1.58 : 1.08;
  let bodyMesh = null;
  let leftWing = null;
  let rightWing = null;
  let minimapColor = '#facc15';

  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 });
  const rubyEyeMat = new THREE.MeshBasicMaterial({ color: 0xff1e56 });
  const limeGlowMat = new THREE.MeshBasicMaterial({ color: 0xa3e635 });
  const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const goldMat = createVoxelMaterial('crystal_gem', 0xfacc15, 0xfef08a, { roughness: 0.25, metalness: 0.45, emissive: 0xf59e0b, emissiveIntensity: 0.28 });

  if (isBoss) {
    // COLOSSAL CROWNED FLOOR GUARDIAN WARLORD (Multi-Limbed Armored Titan + 3 Shield Orbs)
    minimapColor = '#f43f5e';
    const bossPrimary = theme === 'heaven' ? 0xd97706 : (theme === 'ocean' ? 0x0284c7 : 0x7e22ce);
    const bossAccent = theme === 'heaven' ? 0x38bdf8 : (theme === 'ocean' ? 0xf43f5e : 0xfacc15);
    const armorMat = createVoxelMaterial('crystal_gem', bossPrimary, 0xffffff, { roughness: 0.28, metalness: 0.35, emissive: bossPrimary, emissiveIntensity: 0.22 });
    const trimMat = createVoxelMaterial('hazard_stripes', bossAccent, 0x0f172a, { roughness: 0.38 });

    // Armored core chest
    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95 * scale, 0.72 * scale, 1.05 * scale), armorMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Spiked shoulder pauldrons
    [-0.62 * scale, 0.62 * scale].forEach((px) => {
      const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.36 * scale, 0.42 * scale, 0.58 * scale), trimMat);
      pauldron.position.set(px, 0.22 * scale, 0.10 * scale);
      root.add(pauldron);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14 * scale, 0.42 * scale, 6), goldMat);
      spike.position.set(px, 0.56 * scale, 0.10 * scale);
      root.add(spike);
    });

    // Fierce horned head + blazing magma eyes
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.48 * scale, 0.52 * scale), darkMat);
    head.position.set(0, 0.14 * scale, 0.64 * scale);
    root.add(head);
    [-0.18 * scale, 0.18 * scale].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.16 * scale, 0.12 * scale, 0.04 * scale), rubyEyeMat);
      eye.position.set(ex, 0.18 * scale, 0.91 * scale);
      root.add(eye);
    });

    // 3-Pronged Golden Sovereign Crown
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34 * scale, 0.30 * scale, 0.18 * scale, 8), goldMat);
    crownBase.position.set(0, 0.48 * scale, 0.22 * scale);
    root.add(crownBase);
    [-0.20 * scale, 0, 0.20 * scale].forEach((cx, i) => {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.10 * scale, (i === 1 ? 0.38 : 0.26) * scale, 4), goldMat);
      spire.position.set(cx, (i === 1 ? 0.72 : 0.64) * scale, 0.22 * scale);
      root.add(spire);
    });

    // Dual Dragon Wing Groups
    const wingMat = new THREE.MeshBasicMaterial({ color: bossAccent, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    leftWing = new THREE.Group();
    leftWing.position.set(-0.52 * scale, 0.32 * scale, 0);
    const lwMain = new THREE.Mesh(new THREE.BoxGeometry(0.95 * scale, 0.06, 0.52 * scale), wingMat);
    lwMain.position.x = -0.45 * scale;
    leftWing.add(lwMain);
    root.add(leftWing);

    rightWing = new THREE.Group();
    rightWing.position.set(0.52 * scale, 0.32 * scale, 0);
    const rwMain = new THREE.Mesh(new THREE.BoxGeometry(0.95 * scale, 0.06, 0.52 * scale), wingMat);
    rwMain.position.x = 0.45 * scale;
    rightWing.add(rwMain);
    root.add(rightWing);
  } else if (type === 'sweeper') {
    // ARCHETYPE 1 (SWEEPER): CRIMSON & GOLD ROYAL HORNET WASP
    minimapColor = '#facc15';
    const thoraxMat = createVoxelMaterial('frog_skin', 0xf59e0b, 0xd97706, { roughness: 0.38 });
    const abdomenMat = createVoxelMaterial('hazard_stripes', 0xfacc15, 0x0f172a, { roughness: 0.42, repeatX: 2, repeatY: 2 });

    // Amber Thorax Core
    bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.36 * scale, 12, 10), thoraxMat);
    bodyMesh.scale.set(1.0, 0.88, 1.15);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Striped Gold & Black Segmented Abdomen + Rear Obsidian Stinger Cone
    const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.42 * scale, 12, 10), abdomenMat);
    abdomen.scale.set(0.92, 0.85, 1.35);
    abdomen.position.set(0, -0.04 * scale, -0.58 * scale);
    abdomen.castShadow = true;
    root.add(abdomen);

    const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.12 * scale, 0.38 * scale, 8), darkMat);
    stinger.rotation.x = -Math.PI / 2;
    stinger.position.set(0, -0.04 * scale, -1.22 * scale);
    root.add(stinger);

    // Head + Ruby Compound Eyes + Curved Antennae
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 10, 10), darkMat);
    head.position.set(0, 0.04 * scale, 0.44 * scale);
    root.add(head);

    [-0.18 * scale, 0.18 * scale].forEach((ex, i) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 8, 8), rubyEyeMat);
      eye.position.set(ex, 0.09 * scale, 0.58 * scale);
      root.add(eye);

      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * scale, 0.04 * scale, 0.38 * scale, 6), darkMat);
      ant.position.set(ex * 0.9, 0.32 * scale, 0.62 * scale);
      ant.rotation.z = i === 0 ? 0.35 : -0.35;
      ant.rotation.x = 0.45;
      root.add(ant);
    });

    // 6 Articulated Insect Legs
    [-0.26, 0, 0.26].forEach((lz) => {
      [-1, 1].forEach((side) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.32 * scale, 0.06 * scale, 0.06 * scale), darkMat);
        leg.position.set(side * 0.38 * scale, -0.22 * scale, lz * scale);
        leg.rotation.z = side * -0.45;
        root.add(leg);
      });
    });

    // Dual Iridescent Cyan-White Wings
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
    leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.04, 0.36 * scale), wingMat);
    leftWing.position.set(-0.46 * scale, 0.30 * scale, 0.05 * scale);
    root.add(leftWing);

    rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.04, 0.36 * scale), wingMat);
    rightWing.position.set(0.46 * scale, 0.30 * scale, 0.05 * scale);
    root.add(rightWing);
  } else if (type === 'zigzag') {
    // ARCHETYPE 2 (ZIGZAG): NEON-SCARLET & TOXIC-LIME CYBER-SCORPION BEETLE
    minimapColor = '#f43f5e';
    const shellMat = createVoxelMaterial('crystal_gem', 0xe11d48, 0xfb7185, { roughness: 0.30, metalness: 0.32, emissive: 0xbe123c, emissiveIntensity: 0.22 });
    const pincerMat = createVoxelMaterial('frog_skin', 0x84cc16, 0xbef264, { roughness: 0.35, emissive: 0x65a30d, emissiveIntensity: 0.20 });

    // Armored Scarlet Carapace
    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.76 * scale, 0.44 * scale, 0.88 * scale), shellMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Glowing Lime Dorsal Chevron Ridges
    [-0.22 * scale, 0.12 * scale].forEach((rz) => {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.08 * scale, 0.14 * scale), limeGlowMat);
      ridge.position.set(0, 0.25 * scale, rz);
      root.add(ridge);
    });

    // Snapping Toxic-Lime Front Mandibles / Pincers
    [-0.28 * scale, 0.28 * scale].forEach((mx, i) => {
      const mandible = new THREE.Mesh(new THREE.ConeGeometry(0.14 * scale, 0.52 * scale, 6), pincerMat);
      mandible.rotation.x = Math.PI / 2;
      mandible.rotation.z = i === 0 ? -0.28 : 0.28;
      mandible.position.set(mx, -0.02 * scale, 0.64 * scale);
      root.add(mandible);
    });

    // Arched Segmented Scorpion Tail + Cyan Venom Stinger
    for (let seg = 0; seg < 3; seg++) {
      const tSeg = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.22 * scale, 0.24 * scale), shellMat);
      tSeg.position.set(0, (0.18 + seg * 0.22) * scale, (-0.52 - seg * 0.14) * scale);
      root.add(tSeg);
    }
    const tailStinger = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 * scale, 0), cyanGlowMat);
    tailStinger.position.set(0, 0.82 * scale, -0.72 * scale);
    root.add(tailStinger);

    // Beetle Elytra Wing Casings
    leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.55 * scale, 0.05, 0.38 * scale), pincerMat);
    leftWing.position.set(-0.44 * scale, 0.24 * scale, 0);
    root.add(leftWing);

    rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.55 * scale, 0.05, 0.38 * scale), pincerMat);
    rightWing.position.set(0.44 * scale, 0.24 * scale, 0);
    root.add(rightWing);
  } else if (type === 'swooper') {
    // ARCHETYPE 3 (SWOOPER): ROYAL-VIOLET & EMERALD DRAGONFLY WYVERN
    minimapColor = '#a855f7';
    const wyvernMat = createVoxelMaterial('crystal_gem', 0x7c3aed, 0xc084fc, { roughness: 0.28, metalness: 0.30, emissive: 0x6d28d9, emissiveIntensity: 0.24 });
    const emeraldMat = createVoxelMaterial('frog_skin', 0x10b981, 0x6ee7b7, { roughness: 0.32 });

    // Armored Violet Thorax
    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54 * scale, 0.46 * scale, 0.72 * scale), wyvernMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Elongated 4-Segment Emerald & Gold Dragonfly Tail
    for (let t = 1; t <= 4; t++) {
      const r = (0.20 - t * 0.025) * scale;
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r * 0.85, 0.28 * scale, 8),
        t % 2 === 0 ? emeraldMat : goldMat
      );
      seg.rotation.x = Math.PI / 2;
      seg.position.set(0, 0.02 * scale, (-0.36 - t * 0.24) * scale);
      root.add(seg);
    }

    // Emerald Head + Huge Golden Compound Eyes
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 10, 10), emeraldMat);
    head.position.set(0, 0.08 * scale, 0.48 * scale);
    root.add(head);
    [-0.19 * scale, 0.19 * scale].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 8, 8), goldMat);
      eye.position.set(ex, 0.14 * scale, 0.58 * scale);
      root.add(eye);
    });

    // 4 Stained-Glass Magenta & Cyan Biplane Wings
    const foreWingMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.84, side: THREE.DoubleSide });
    const hindWingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.80, side: THREE.DoubleSide });

    leftWing = new THREE.Group();
    leftWing.position.set(-0.28 * scale, 0.24 * scale, 0.06 * scale);
    const lFore = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.04, 0.26 * scale), foreWingMat);
    lFore.position.set(-0.46 * scale, 0, 0.14 * scale);
    const lHind = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.04, 0.22 * scale), hindWingMat);
    lHind.position.set(-0.40 * scale, -0.04 * scale, -0.16 * scale);
    leftWing.add(lFore, lHind);
    root.add(leftWing);

    rightWing = new THREE.Group();
    rightWing.position.set(0.28 * scale, 0.24 * scale, 0.06 * scale);
    const rFore = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.04, 0.26 * scale), foreWingMat);
    rFore.position.set(0.46 * scale, 0, 0.14 * scale);
    const rHind = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.04, 0.22 * scale), hindWingMat);
    rHind.position.set(0.40 * scale, -0.04 * scale, -0.16 * scale);
    rightWing.add(rFore, rHind);
    root.add(rightWing);
  } else {
    // ARCHETYPE 4 (LOOP / FIGURE-8): BIOME SPECIALISTS
    //   - Heaven: 6-Winged Sapphire & Gold Seraphim Ophanim
    //   - Ocean:  Electric-Magenta & Lime Tentacled Abyssal Jellyfish
    //   - Ground: Solar-Orange & Fuchsia Monarch Swallowtail Butterfly-Moth
    minimapColor = theme === 'heaven' ? '#38bdf8' : (theme === 'ocean' ? '#ec4899' : '#f97316');

    if (theme === 'heaven') {
      const coreMat = createVoxelMaterial('crystal_gem', 0x0284c7, 0xe0f2fe, { roughness: 0.22, emissive: 0x38bdf8, emissiveIntensity: 0.35 });
      bodyMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.46 * scale, 1), coreMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      // Intersecting Golden Throne Rings (Ophanim)
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.62 * scale, 0.06 * scale, 8, 24), goldMat);
      ringA.rotation.x = Math.PI / 3;
      root.add(ringA);
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.62 * scale, 0.06 * scale, 8, 24), goldMat);
      ringB.rotation.y = Math.PI / 3;
      root.add(ringB);

      const seraphWingMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.88 });
      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.88 * scale, 0.07, 0.42 * scale), seraphWingMat);
      leftWing.position.set(-0.56 * scale, 0.14 * scale, 0);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.88 * scale, 0.07, 0.42 * scale), seraphWingMat);
      rightWing.position.set(0.56 * scale, 0.14 * scale, 0);
      root.add(rightWing);
    } else if (theme === 'ocean') {
      const domeMat = createVoxelMaterial('frog_skin', 0xd946ef, 0xf5d0fe, { roughness: 0.25, emissive: 0xc026d3, emissiveIntensity: 0.32 });
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.52 * scale, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.68), domeMat);
      bodyMesh.position.y = 0.10 * scale;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      // Glowing Cyan Rim & 6 Trailing Neon-Lime Tentacles
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.48 * scale, 0.06 * scale, 8, 20), cyanGlowMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -0.02 * scale;
      root.add(rim);

      for (let t = 0; t < 6; t++) {
        const ang = (t * Math.PI * 2) / 6;
        const tent = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04 * scale, 0.015 * scale, 0.68 * scale, 6),
          t % 2 === 0 ? limeGlowMat : cyanGlowMat
        );
        tent.position.set(Math.cos(ang) * 0.30 * scale, -0.36 * scale, Math.sin(ang) * 0.30 * scale);
        root.add(tent);
      }

      const finMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.78 });
      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.58 * scale, 0.06, 0.38 * scale), finMat);
      leftWing.position.set(-0.50 * scale, 0.02 * scale, 0);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.58 * scale, 0.06, 0.38 * scale), finMat);
      rightWing.position.set(0.50 * scale, 0.02 * scale, 0);
      root.add(rightWing);
    } else {
      // Solar-Orange & Fuchsia Monarch Swallowtail Moth
      const mothBodyMat = createVoxelMaterial('frog_skin', 0xf97316, 0xfef08a, { roughness: 0.40 });
      bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.18 * scale, 0.86 * scale, 10), mothBodyMat);
      bodyMesh.rotation.x = Math.PI / 2;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const wingUpperMat = createVoxelMaterial('hazard_stripes', 0xf97316, 0x0f172a, { roughness: 0.38 });
      const wingLowerMat = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.88 });

      leftWing = new THREE.Group();
      leftWing.position.set(-0.20 * scale, 0.12 * scale, 0);
      const lUp = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.05, 0.56 * scale), wingUpperMat);
      lUp.position.set(-0.42 * scale, 0, 0.12 * scale);
      const lLow = new THREE.Mesh(new THREE.BoxGeometry(0.58 * scale, 0.05, 0.44 * scale), wingLowerMat);
      lLow.position.set(-0.32 * scale, -0.02 * scale, -0.26 * scale);
      leftWing.add(lUp, lLow);
      root.add(leftWing);

      rightWing = new THREE.Group();
      rightWing.position.set(0.20 * scale, 0.12 * scale, 0);
      const rUp = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.05, 0.56 * scale), wingUpperMat);
      rUp.position.set(0.42 * scale, 0, 0.12 * scale);
      const rLow = new THREE.Mesh(new THREE.BoxGeometry(0.58 * scale, 0.05, 0.44 * scale), wingLowerMat);
      rLow.position.set(0.32 * scale, -0.02 * scale, -0.26 * scale);
      rightWing.add(rUp, rLow);
      root.add(rightWing);
    }
  }

  const shieldOrbs = [];
  if (isBoss) {
    const orbGroup = new THREE.Group();
    root.add(orbGroup);
    for (let i = 0; i < 3; i++) {
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.30, 0),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      const ang = (i * Math.PI * 2) / 3;
      orb.position.set(Math.cos(ang) * 1.50, 0.35, Math.sin(ang) * 1.50);
      orbGroup.add(orb);
      shieldOrbs.push(orb);
    }
    animatedProps.push({ mesh: orbGroup, type: 'spinBob', baseY: 0, phase: 0 });
  }
  return {
    root,
    bodyMesh,
    baseColorHex: bodyMesh.material.color ? bodyMesh.material.color.getHex() : 0xffffff,
    leftWing,
    rightWing,
    shieldOrbs,
    minimapColor
  };
}

function populateRoadwayBees() {
  while (beesGroup.children.length > 0) {
    beesGroup.remove(beesGroup.children[0]);
  }
  bees.length = 0;

  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
  const blueprints = getLevelEnemyBlueprints(state.floorLevel);

  blueprints.forEach((cfg, idx) => {
    const built = buildThemeEnemyMesh(floorCfg.theme, cfg.type);
    const prof = getRowProfile(cfg.gz);
    const clampedGx = THREE.MathUtils.clamp(cfg.gx, prof.minX, prof.maxX);
    const homeX = clampedGx * TILE_SIZE;
    const homeZ = -cfg.gz * TILE_SIZE;
    const baseY = getSurfaceY(clampedGx, cfg.gz);

    built.root.position.set(homeX, baseY + 1.30, homeZ);
    beesGroup.add(built.root);

    bees.push({
      id: idx,
      mesh: built.root,
      bodyMesh: built.bodyMesh,
      baseColorHex: built.baseColorHex,
      leftWing: built.leftWing,
      rightWing: built.rightWing,
      homeX,
      homeZ,
      baseY,
      gz: cfg.gz,
      type: cfg.type,
      baseSpanX: cfg.spanX * TILE_SIZE,
      baseSpanZ: (cfg.spanZ || 0.6) * TILE_SIZE,
      phase: cfg.phaseOffset,
      baseSpeed: cfg.speed * floorCfg.speedMult,
      shieldOrbs: built.shieldOrbs || [],
      minimapColor: built.minimapColor || '#facc15',
      hp: cfg.type === 'boss' ? 3 : 1,
      latched: false,
      alive: true
    });
  });

  state.totalFloorBees = bees.length;
}

// =========================================================================
// 8. POLLEN SPARKS & FLOATING POPUPS
// =========================================================================
const particlesGroup = new THREE.Group();
scene.add(particlesGroup);
const particles = [];

function spawnPollenBurst(worldPos, count = 20) {
  for (let i = 0; i < count; i++) {
    const isPink = i % 3 === 0;
    const mat = new THREE.MeshBasicMaterial({
      color: isPink ? 0xff5ea2 : (i % 2 === 0 ? 0xfacc15 : 0x4ade80)
    });
    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.20, 0.20), mat);
    pMesh.position.copy(worldPos);
    particlesGroup.add(pMesh);

    const angle = (Math.PI * 2 * i) / count;
    const speed = 4.2 + (i % 4) * 1.1;
    particles.push({
      mesh: pMesh,
      vel: new THREE.Vector3(Math.cos(angle) * speed, 3.5 + (i % 3) * 1.4, Math.sin(angle) * speed),
      life: 0.52
    });
  }
}

const popupLayer = document.getElementById('popup-layer');
let popupAlternateSide = 1;

function spawnSurpriseEmojiBurst(sx, sy, emojis, count = 6) {
  if (!popupLayer) return;
  for (let i = 0; i < count; i++) {
    const em = document.createElement('div');
    em.className = 'surprise-emoji-particle';
    em.textContent = emojis[i % emojis.length];
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
    const dist = 48 + Math.random() * 54;
    const ex = Math.round(Math.cos(angle) * dist);
    const ey = Math.round(Math.sin(angle) * dist - 18);
    const erot = Math.round((Math.random() - 0.5) * 90);
    em.style.left = `${sx}px`;
    em.style.top = `${sy}px`;
    em.style.setProperty('--ex', `${ex}px`);
    em.style.setProperty('--ey', `${ey}px`);
    em.style.setProperty('--erot', `${erot}deg`);
    popupLayer.appendChild(em);
    setTimeout(() => {
      if (em.parentNode) em.parentNode.removeChild(em);
    }, 1050);
  }
}

const activeHeadPopups = [];

function updateActiveHeadPopups() {
  const headHeight = 2.15 * BASE_FROG_SCALE * state.scaleMultiplier;
  const headWorld = todeRoot.position.clone().add(new THREE.Vector3(0, headHeight, 0));
  const projected = headWorld.project(camera);
  const padX = Math.min(140, Math.round(window.innerWidth * 0.24));
  const sx = THREE.MathUtils.clamp((projected.x * 0.5 + 0.5) * window.innerWidth, padX, window.innerWidth - padX);
  const sy = THREE.MathUtils.clamp((-projected.y * 0.5 + 0.5) * window.innerHeight, 96, window.innerHeight - 90);
  for (let i = activeHeadPopups.length - 1; i >= 0; i--) {
    const item = activeHeadPopups[i];
    if (!item.el.parentNode) {
      activeHeadPopups.splice(i, 1);
      continue;
    }
    item.el.style.left = `${sx}px`;
    item.el.style.top = `${sy - item.stackOffsetPx}px`;
  }
}

function spawnFloatingPopup(worldPos, text, colorClass = '', situation = 'auto') {
  // Strip any accidental leading/trailing emoji clutter passed in text
  const cleanText = String(text).replace(/^[⚡👑🌊🎉🚀💥💀👅✨]+\s*/u, '').trim();
  const upper = cleanText.toUpperCase();
  let variantClass = 'score-popup-combo';

  if (situation === 'boss' || upper.includes('GUARDIAN') || upper.includes('SHIELD') || upper.includes('CLEARED') || upper.includes('WARP') || upper.includes('CONQUERED')) {
    variantClass = 'score-popup-boss';
  } else if (situation === 'checkpoint' || upper.includes('CHECKPOINT')) {
    variantClass = 'score-popup-checkpoint';
  } else if (situation === 'boost' || upper.includes('BOUNCE') || upper.includes('REVIVE') || upper.includes('STAGE')) {
    variantClass = 'score-popup-boost';
  } else if (situation === 'push' || upper.includes('PUSH') || upper.includes('SHOVE') || upper.includes('BLAST') || upper.includes('CLIP') || upper.includes('REPEL') || upper.includes('ROLL')) {
    variantClass = 'score-popup-push';
  } else if (situation === 'danger' || upper.includes('FELL') || upper.includes('STRUCK') || upper.includes('TOUCHED') || upper.includes('HP LEFT')) {
    variantClass = 'score-popup-danger';
  } else {
    variantClass = 'score-popup-combo';
  }

  // Compute screen position directly above Tode's head
  const headHeight = 2.15 * BASE_FROG_SCALE * state.scaleMultiplier;
  const headWorld = todeRoot.position.clone().add(new THREE.Vector3(0, headHeight, 0));
  const projected = headWorld.project(camera);
  const padX = Math.min(140, Math.round(window.innerWidth * 0.24));
  const sx = THREE.MathUtils.clamp((projected.x * 0.5 + 0.5) * window.innerWidth, padX, window.innerWidth - padX);
  const sy = THREE.MathUtils.clamp((-projected.y * 0.5 + 0.5) * window.innerHeight, 96, window.innerHeight - 90);

  // Keep at most 1 previous popup stacked cleanly above if rapid events occur
  while (activeHeadPopups.length >= 2) {
    const oldest = activeHeadPopups.shift();
    if (oldest && oldest.el && oldest.el.parentNode) {
      oldest.el.parentNode.removeChild(oldest.el);
    }
  }
  const stackOffsetPx = activeHeadPopups.length * 52;

  const el = document.createElement('div');
  el.className = `score-popup ${variantClass}`;
  el.style.left = `${sx}px`;
  el.style.top = `${sy - stackOffsetPx}px`;
  el.textContent = cleanText;
  popupLayer.appendChild(el);

  const tracker = { el, stackOffsetPx };
  activeHeadPopups.push(tracker);

  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
    const idx = activeHeadPopups.indexOf(tracker);
    if (idx !== -1) activeHeadPopups.splice(idx, 1);
  }, 1080);
}

