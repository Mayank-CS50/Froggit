/**
 * THE FROGGIT — Froggit-Style Sculpted Voxel-Mascot Enemies & Diverse Callout Popups
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

// Multi-Part, Biome-Authentic 3D Enemy Creatures:
// - Ocean (-1F..-3F): Aquatic Animals Only (Reef Sharks, Giant Squids, Tropical Reef Fishes, Jellyfish & Megalodon/Kraken Boss)
// - Heaven (+1F..+3F): Sky Birds Only (Golden Eagles, Peregrine Falcons, Scarlet Macaw Parrots, Celestial Swans & Thunder-Eagle Boss)
// - Ground (0F): Meadow Insects (Royal Hornets, Scorpion-Beetles, Dragonflies, Monarch Moths & Meadow Guardian Boss)
// =========================================================================
// 7A. FROGGIT-STYLE SCULPTED VOXEL MASCOT ENEMY BUILDER
//     Every enemy is crafted in the exact same tactile rounded-voxel mascot
//     design language as The Froggit:
//     - Twin raised mascot eye sockets with white sclera plates, bold pupils,
//       crisp white catchlight glints & angled brow ridges
//     - Multi-tone procedural gradient & bump-mapped body + belly plates
//     - Clean, non-overlapping articulated wings, fins, pincers, talons & tails
// =========================================================================
function buildThemeEnemyMesh(theme, type) {
  const root = new THREE.Group();
  const isBoss = type === 'boss';
  const scale = isBoss ? 1.56 : 1.08;
  let bodyMesh = null;
  let leftWing = null;
  let rightWing = null;
  let minimapColor = '#facc15';

  const darkMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.22 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18 });
  const rubyEyeMat = new THREE.MeshBasicMaterial({ color: 0xff1e56 });
  const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const goldMat = createVoxelMaterial('crystal_gem', 0xfacc15, 0xfef08a, {
    roughness: 0.24,
    metalness: 0.42,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.26
  });
  const blushMat = createVoxelMaterial('crystal_gem', 0xf472b6, 0xec4899, { roughness: 0.45 });

  // Reusable helper that builds signature Froggit-style raised mascot eye towers
  // with white sclera, dark/ruby pupil, white catchlight glint, and fierce brow ridge!
  function addMascotEyes(parent, socketMat, spreadX, yPos, zPos, eyeScale = 1.0, browColorMat = darkMat, useRubyPupil = false) {
    [-spreadX, spreadX].forEach((ex, idx) => {
      const isLeft = idx === 0;
      const eyeGrp = new THREE.Group();
      eyeGrp.position.set(ex, yPos, zPos);

      // Sculpted Voxel Eye Socket Tower
      const socket = new THREE.Mesh(
        new THREE.BoxGeometry(0.28 * eyeScale, 0.28 * eyeScale, 0.30 * eyeScale),
        socketMat
      );
      socket.castShadow = true;
      eyeGrp.add(socket);

      // Crisp White Sclera Plate in front of socket (zero Z-fighting)
      const sclera = new THREE.Mesh(
        new THREE.BoxGeometry(0.22 * eyeScale, 0.22 * eyeScale, 0.02 * eyeScale),
        whiteMat
      );
      sclera.position.set(0, 0, 0.158 * eyeScale);
      eyeGrp.add(sclera);

      // Bold Mascot Pupil + Bright White Catchlight Glint
      const pupil = new THREE.Mesh(
        new THREE.BoxGeometry(0.14 * eyeScale, 0.16 * eyeScale, 0.02 * eyeScale),
        useRubyPupil ? rubyEyeMat : darkMat
      );
      pupil.position.set(0, -0.01 * eyeScale, 0.172 * eyeScale);

      const glint = new THREE.Mesh(
        new THREE.BoxGeometry(0.045 * eyeScale, 0.045 * eyeScale, 0.01 * eyeScale),
        whiteMat
      );
      glint.position.set(0.032 * eyeScale, 0.042 * eyeScale, 0.014 * eyeScale);
      pupil.add(glint);
      eyeGrp.add(pupil);

      // Expressive Angled Voxel Brow Ridge
      const brow = new THREE.Mesh(
        new THREE.BoxGeometry(0.26 * eyeScale, 0.065 * eyeScale, 0.08 * eyeScale),
        browColorMat
      );
      brow.position.set(0, 0.135 * eyeScale, 0.155 * eyeScale);
      brow.rotation.z = isLeft ? -0.22 : 0.22;
      eyeGrp.add(brow);

      parent.add(eyeGrp);
    });
  }

  // Reusable helper for a royal 3-prong voxel crown on Boss Guardians
  function addGuardianCrown(parent, yPos, zPos, s = 1.0) {
    const crownGrp = new THREE.Group();
    crownGrp.position.set(0, yPos, zPos);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.62 * s, 0.14 * s, 0.46 * s), goldMat);
    crownGrp.add(rim);
    [-0.22 * s, 0, 0.22 * s].forEach((cx, i) => {
      const prong = new THREE.Mesh(
        new THREE.BoxGeometry(0.12 * s, (i === 1 ? 0.26 : 0.18) * s, 0.12 * s),
        goldMat
      );
      prong.position.set(cx, (i === 1 ? 0.18 : 0.14) * s, 0.16 * s);
      crownGrp.add(prong);
    });
    parent.add(crownGrp);
  }

  // =====================================================================
  // BIOME A: OCEAN REALMS (-1F..-3F) — MASCOT SHARKS, SQUIDS & REEF FISH
  // =====================================================================
  if (theme === 'ocean') {
    if (isBoss) {
      // OCEAN BOSS: KING MEGALODON LEVIATHAN (Froggit-Style Armored Voxel Shark Monarch)
      minimapColor = '#f43f5e';
      const dorsalMat = createVoxelMaterial('frog_skin', 0x0284c7, 0x0f172a, { roughness: 0.30, metalness: 0.22 });
      const bellyMat = createVoxelMaterial('frog_belly', 0xe0f2fe, 0x7dd3fc, { roughness: 0.36 });
      const finMat = createVoxelMaterial('frog_skin', 0x0369a1, 0x1e3a8a, { roughness: 0.34 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.68 * scale, 1.24 * scale), dorsalMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.84 * scale, 0.42 * scale, 0.48 * scale), dorsalMat);
      snout.position.set(0, 0.06 * scale, 0.84 * scale);
      root.add(snout);

      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.22 * scale, 1.36 * scale), bellyMat);
      belly.position.set(0, -0.32 * scale, 0.18 * scale);
      root.add(belly);

      // Open Shark Jaw with Crisp White Voxel Teeth
      const mouthDark = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.18 * scale, 0.12 * scale), darkMat);
      mouthDark.position.set(0, -0.14 * scale, 1.02 * scale);
      root.add(mouthDark);
      for (let t = -2; t <= 2; t++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.10 * scale, 0.04 * scale), whiteMat);
        tooth.position.set(t * 0.13 * scale, -0.09 * scale, 1.07 * scale);
        root.add(tooth);
      }

      addMascotEyes(root, dorsalMat, 0.30 * scale, 0.42 * scale, 0.44 * scale, 1.15 * scale, goldMat, true);
      addGuardianCrown(root, 0.66 * scale, 0.12 * scale, scale);

      // Stepped Megalodon Dorsal Fin & Tail Fin
      const dorsalFin = new THREE.Mesh(new THREE.BoxGeometry(0.18 * scale, 0.62 * scale, 0.48 * scale), finMat);
      dorsalFin.position.set(0, 0.62 * scale, -0.18 * scale);
      dorsalFin.rotation.x = -0.22;
      root.add(dorsalFin);

      const tailStem = new THREE.Mesh(new THREE.BoxGeometry(0.46 * scale, 0.38 * scale, 0.52 * scale), dorsalMat);
      tailStem.position.set(0, 0.0, -0.86 * scale);
      root.add(tailStem);
      const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.88 * scale, 0.38 * scale), finMat);
      tailFin.position.set(0, 0.08 * scale, -1.22 * scale);
      root.add(tailFin);

      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.10 * scale, 0.44 * scale), finMat);
      leftWing.position.set(-0.76 * scale, -0.10 * scale, 0.18 * scale);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.10 * scale, 0.44 * scale), finMat);
      rightWing.position.set(0.76 * scale, -0.10 * scale, 0.18 * scale);
      root.add(rightWing);
    } else if (type === 'zigzag') {
      // OCEAN ZIGZAG: GREAT REEF SHARK (Sculpted Azure & Snow-White Voxel Shark with Mascot Eyes & Teeth)
      minimapColor = '#38bdf8';
      const sharkMat = createVoxelMaterial('frog_skin', 0x0284c7, 0x0369a1, { roughness: 0.32 });
      const bellyMat = createVoxelMaterial('frog_belly', 0xf8fafc, 0xbae6fd, { roughness: 0.38 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.84 * scale, 0.56 * scale, 1.12 * scale), sharkMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.72 * scale, 0.34 * scale, 0.42 * scale), sharkMat);
      snout.position.set(0, 0.04 * scale, 0.74 * scale);
      root.add(snout);

      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.74 * scale, 0.20 * scale, 1.18 * scale), bellyMat);
      belly.position.set(0, -0.28 * scale, 0.14 * scale);
      root.add(belly);

      // Toothy Grin Bar
      const grinBar = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.12 * scale, 0.06 * scale), darkMat);
      grinBar.position.set(0, -0.12 * scale, 0.94 * scale);
      root.add(grinBar);
      for (let t = -2; t <= 2; t++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.065 * scale, 0.07 * scale, 0.03 * scale), whiteMat);
        tooth.position.set(t * 0.11 * scale, -0.09 * scale, 0.97 * scale);
        root.add(tooth);
      }

      addMascotEyes(root, sharkMat, 0.25 * scale, 0.36 * scale, 0.36 * scale, 0.95 * scale, darkMat, false);

      // Iconic Dorsal Fin & Forked Tail
      const dorsalFin = new THREE.Mesh(new THREE.BoxGeometry(0.16 * scale, 0.52 * scale, 0.42 * scale), sharkMat);
      dorsalFin.position.set(0, 0.50 * scale, -0.12 * scale);
      dorsalFin.rotation.x = -0.25;
      root.add(dorsalFin);

      const tailPeduncle = new THREE.Mesh(new THREE.BoxGeometry(0.42 * scale, 0.32 * scale, 0.44 * scale), sharkMat);
      tailPeduncle.position.set(0, 0, -0.74 * scale);
      root.add(tailPeduncle);
      const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.72 * scale, 0.34 * scale), sharkMat);
      tailFin.position.set(0, 0.06 * scale, -1.04 * scale);
      root.add(tailFin);

      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.64 * scale, 0.09 * scale, 0.38 * scale), sharkMat);
      leftWing.position.set(-0.66 * scale, -0.08 * scale, 0.14 * scale);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.64 * scale, 0.09 * scale, 0.38 * scale), sharkMat);
      rightWing.position.set(0.66 * scale, -0.08 * scale, 0.14 * scale);
      root.add(rightWing);
    } else if (type === 'swooper') {
      // OCEAN SWOOPER: RUBY OCTO-SQUID MASCOT (Sculpted Coral Mantle, Big Mascot Eyes & Curling Voxel Tentacles)
      minimapColor = '#f43f5e';
      const squidMat = createVoxelMaterial('frog_skin', 0xf43f5e, 0xe11d48, { roughness: 0.32, emissive: 0xbe123c, emissiveIntensity: 0.16 });
      const squidBellyMat = createVoxelMaterial('frog_belly', 0xfda4af, 0xfb7185, { roughness: 0.38 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.68 * scale, 0.88 * scale), squidMat);
      bodyMesh.position.set(0, 0.14 * scale, 0.06 * scale);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const crownCap = new THREE.Mesh(new THREE.BoxGeometry(0.62 * scale, 0.18 * scale, 0.68 * scale), squidBellyMat);
      crownCap.position.set(0, 0.54 * scale, 0.04 * scale);
      root.add(crownCap);

      // Cute O-shaped siphon mouth on front
      const siphon = new THREE.Mesh(new THREE.CylinderGeometry(0.10 * scale, 0.12 * scale, 0.14 * scale, 10), darkMat);
      siphon.rotation.x = Math.PI / 2;
      siphon.position.set(0, 0.02 * scale, 0.52 * scale);
      root.add(siphon);

      addMascotEyes(root, squidMat, 0.24 * scale, 0.26 * scale, 0.38 * scale, 0.98 * scale, darkMat, false);

      // 6 Sculpted Stepped Voxel Tentacles with Cyan Suction Pads
      for (let t = 0; t < 6; t++) {
        const ang = (t * Math.PI * 2) / 6;
        const tx = Math.cos(ang) * 0.28 * scale;
        const ty = -0.22 * scale + Math.sin(ang) * 0.08 * scale;
        const tent = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.14 * scale, 0.62 * scale), squidBellyMat);
        tent.position.set(tx, ty, -0.54 * scale);
        tent.rotation.y = Math.cos(ang) * 0.18;
        root.add(tent);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.12 * scale), cyanGlowMat);
        pad.position.set(tx, ty - 0.06 * scale, -0.78 * scale);
        root.add(pad);
      }

      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.08 * scale, 0.38 * scale), squidBellyMat);
      leftWing.position.set(-0.56 * scale, 0.22 * scale, -0.06 * scale);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.08 * scale, 0.38 * scale), squidBellyMat);
      rightWing.position.set(0.56 * scale, 0.22 * scale, -0.06 * scale);
      root.add(rightWing);
    } else if (type === 'sweeper') {
      // OCEAN SWEEPER: ROYAL CLOWN-TANG REEF FISH (Plump Banded Coral-Orange & White Voxel Fish with Mascot Eyes)
      minimapColor = '#fb923c';
      const orangeMat = createVoxelMaterial('frog_skin', 0xf97316, 0xea580c, { roughness: 0.32 });
      const stripeWhiteMat = createVoxelMaterial('frog_belly', 0xffffff, 0xe0f2fe, { roughness: 0.28 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.68 * scale, 0.96 * scale), orangeMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      // Crisp White Clownfish Vertical Band Stripes
      [-0.22 * scale, 0.20 * scale].forEach((sz) => {
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.71 * scale, 0.70 * scale, 0.18 * scale), stripeWhiteMat);
        band.position.set(0, 0, sz);
        root.add(band);
      });

      // Plump Pouting Fish Lips & Rosy Cheeks
      const lips = new THREE.Mesh(new THREE.BoxGeometry(0.32 * scale, 0.16 * scale, 0.12 * scale), stripeWhiteMat);
      lips.position.set(0, -0.08 * scale, 0.52 * scale);
      root.add(lips);

      addMascotEyes(root, orangeMat, 0.22 * scale, 0.28 * scale, 0.34 * scale, 0.90 * scale, darkMat, false);

      const dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.34 * scale, 0.52 * scale), goldMat);
      dorsal.position.set(0, 0.48 * scale, -0.06 * scale);
      root.add(dorsal);

      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.58 * scale, 0.36 * scale), goldMat);
      tail.position.set(0, 0.02 * scale, -0.64 * scale);
      root.add(tail);

      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.08 * scale, 0.30 * scale), goldMat);
      leftWing.position.set(-0.52 * scale, -0.04 * scale, 0.12 * scale);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.48 * scale, 0.08 * scale, 0.30 * scale), goldMat);
      rightWing.position.set(0.52 * scale, -0.04 * scale, 0.12 * scale);
      root.add(rightWing);
    } else {
      // OCEAN LOOP / FIGURE8: PUFFER-BLOAT MASCOT (Chubby Spiky Golden-Teal Voxel Pufferfish with Big Froggit Eyes)
      minimapColor = '#2dd4bf';
      const pufferMat = createVoxelMaterial('frog_skin', 0x0d9488, 0x14b8a6, { roughness: 0.34 });
      const pufferBelly = createVoxelMaterial('frog_belly', 0xfef08a, 0xfde047, { roughness: 0.38 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.86 * scale, 0.68 * scale, 0.88 * scale), pufferMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.76 * scale, 0.28 * scale, 0.82 * scale), pufferBelly);
      belly.position.set(0, -0.26 * scale, 0.04 * scale);
      root.add(belly);

      // Rosy Puffer Cheeks & Cute Pixel Mouth
      [-0.36 * scale, 0.36 * scale].forEach((cx) => {
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.12 * scale, 0.14 * scale), blushMat);
        cheek.position.set(cx, -0.02 * scale, 0.44 * scale);
        root.add(cheek);
      });
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.28 * scale, 0.10 * scale, 0.04 * scale), darkMat);
      mouth.position.set(0, -0.06 * scale, 0.46 * scale);
      root.add(mouth);

      // Decorative Voxel Spines on Back & Sides
      [[-0.32, 0.40, 0], [0.32, 0.40, 0], [0, 0.42, -0.24], [-0.48, 0.12, -0.15], [0.48, 0.12, -0.15]].forEach(([sx, sy, sz]) => {
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.14 * scale, 0.12 * scale), pufferBelly);
        spine.position.set(sx * scale, sy * scale, sz * scale);
        root.add(spine);
      });

      addMascotEyes(root, pufferMat, 0.24 * scale, 0.38 * scale, 0.26 * scale, 0.94 * scale, darkMat, false);

      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.46 * scale, 0.08 * scale, 0.28 * scale), pufferBelly);
      leftWing.position.set(-0.60 * scale, -0.04 * scale, 0.08 * scale);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.46 * scale, 0.08 * scale, 0.28 * scale), pufferBelly);
      rightWing.position.set(0.60 * scale, -0.04 * scale, 0.08 * scale);
      root.add(rightWing);
    }
  }
  // =====================================================================
  // BIOME B: HEAVEN REALMS (+1F..+3F) — MASCOT EAGLES, PARROTS & FALCONS
  // =====================================================================
  else if (theme === 'heaven') {
    const beakGoldMat = createVoxelMaterial('frog_belly', 0xfacc15, 0xf59e0b, { roughness: 0.26 });
    if (isBoss) {
      // HEAVEN BOSS: SOVEREIGN THUNDER-GRIFFIN MONARCH (Armored Golden-Feather & Ivory Mascot Raptor)
      minimapColor = '#f43f5e';
      const bronzeMat = createVoxelMaterial('frog_skin', 0xb45309, 0x78350f, { roughness: 0.34 });
      const ivoryHeadMat = createVoxelMaterial('frog_belly', 0xffffff, 0xfef3c7, { roughness: 0.28 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.92 * scale, 0.68 * scale, 1.04 * scale), bronzeMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.48 * scale, 0.72 * scale), ivoryHeadMat);
      headBox.position.set(0, 0.38 * scale, 0.36 * scale);
      headBox.castShadow = true;
      root.add(headBox);

      // Stepped Sculpted Golden Hooked Beak
      const upperBeak = new THREE.Mesh(new THREE.BoxGeometry(0.34 * scale, 0.22 * scale, 0.38 * scale), goldMat);
      upperBeak.position.set(0, 0.34 * scale, 0.84 * scale);
      root.add(upperBeak);
      const beakHook = new THREE.Mesh(new THREE.BoxGeometry(0.24 * scale, 0.16 * scale, 0.14 * scale), goldMat);
      beakHook.position.set(0, 0.22 * scale, 0.96 * scale);
      root.add(beakHook);

      addMascotEyes(root, ivoryHeadMat, 0.26 * scale, 0.66 * scale, 0.42 * scale, 1.12 * scale, bronzeMat, true);
      addGuardianCrown(root, 0.88 * scale, 0.22 * scale, scale);

      const tailFan = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.12 * scale, 0.52 * scale), ivoryHeadMat);
      tailFan.position.set(0, 0.08 * scale, -0.74 * scale);
      root.add(tailFan);

      leftWing = new THREE.Group();
      leftWing.position.set(-0.46 * scale, 0.24 * scale, 0.08 * scale);
      const lwA = new THREE.Mesh(new THREE.BoxGeometry(1.14 * scale, 0.10 * scale, 0.52 * scale), bronzeMat);
      lwA.position.x = -0.56 * scale;
      const lwB = new THREE.Mesh(new THREE.BoxGeometry(1.04 * scale, 0.08 * scale, 0.28 * scale), goldMat);
      lwB.position.set(-0.52 * scale, -0.02 * scale, -0.22 * scale);
      leftWing.add(lwA, lwB);
      root.add(leftWing);

      rightWing = new THREE.Group();
      rightWing.position.set(0.46 * scale, 0.24 * scale, 0.08 * scale);
      const rwA = new THREE.Mesh(new THREE.BoxGeometry(1.14 * scale, 0.10 * scale, 0.52 * scale), bronzeMat);
      rwA.position.x = 0.56 * scale;
      const rwB = new THREE.Mesh(new THREE.BoxGeometry(1.04 * scale, 0.08 * scale, 0.28 * scale), goldMat);
      rwB.position.set(0.52 * scale, -0.02 * scale, -0.22 * scale);
      rightWing.add(rwA, rwB);
      root.add(rightWing);
    } else if (type === 'swooper') {
      // HEAVEN SWOOPER: IMPERIAL GOLDEN EAGLE (Snow-White Mascot Head, Hooked Beak, Talons & Tiered Wings)
      minimapColor = '#f59e0b';
      const plumageMat = createVoxelMaterial('frog_skin', 0x92400e, 0x78350f, { roughness: 0.38 });
      const whiteHeadMat = createVoxelMaterial('frog_belly', 0xffffff, 0xfef9c3, { roughness: 0.30 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.76 * scale, 0.56 * scale, 0.94 * scale), plumageMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.40 * scale, 0.62 * scale), whiteHeadMat);
      headBox.position.set(0, 0.30 * scale, 0.34 * scale);
      root.add(headBox);

      const beak = new THREE.Mesh(new THREE.BoxGeometry(0.28 * scale, 0.18 * scale, 0.32 * scale), beakGoldMat);
      beak.position.set(0, 0.26 * scale, 0.76 * scale);
      root.add(beak);
      const beakTip = new THREE.Mesh(new THREE.BoxGeometry(0.20 * scale, 0.12 * scale, 0.12 * scale), beakGoldMat);
      beakTip.position.set(0, 0.16 * scale, 0.86 * scale);
      root.add(beakTip);

      // Golden Raptor Talons underneath
      [-0.22 * scale, 0.22 * scale].forEach((tx) => {
        const talon = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.18 * scale, 0.22 * scale), beakGoldMat);
        talon.position.set(tx, -0.34 * scale, 0.16 * scale);
        root.add(talon);
      });

      addMascotEyes(root, whiteHeadMat, 0.22 * scale, 0.54 * scale, 0.38 * scale, 0.94 * scale, plumageMat, false);

      const tailFan = new THREE.Mesh(new THREE.BoxGeometry(0.54 * scale, 0.09 * scale, 0.44 * scale), whiteHeadMat);
      tailFan.position.set(0, 0.06 * scale, -0.64 * scale);
      root.add(tailFan);

      leftWing = new THREE.Group();
      leftWing.position.set(-0.38 * scale, 0.18 * scale, 0.06 * scale);
      const lMain = new THREE.Mesh(new THREE.BoxGeometry(0.98 * scale, 0.09 * scale, 0.44 * scale), plumageMat);
      lMain.position.x = -0.48 * scale;
      const lTip = new THREE.Mesh(new THREE.BoxGeometry(0.88 * scale, 0.07 * scale, 0.22 * scale), goldMat);
      lTip.position.set(-0.44 * scale, -0.01 * scale, -0.18 * scale);
      leftWing.add(lMain, lTip);
      root.add(leftWing);

      rightWing = new THREE.Group();
      rightWing.position.set(0.38 * scale, 0.18 * scale, 0.06 * scale);
      const rMain = new THREE.Mesh(new THREE.BoxGeometry(0.98 * scale, 0.09 * scale, 0.44 * scale), plumageMat);
      rMain.position.x = 0.48 * scale;
      const rTip = new THREE.Mesh(new THREE.BoxGeometry(0.88 * scale, 0.07 * scale, 0.22 * scale), goldMat);
      rTip.position.set(0.44 * scale, -0.01 * scale, -0.18 * scale);
      rightWing.add(rMain, rTip);
      root.add(rightWing);
    } else if (type === 'sweeper') {
      // HEAVEN SWEEPER: SCARLET MACAW PARROT MASCOT (Vibrant Red, Yellow & Cobalt Voxel Parrot)
      minimapColor = '#ef4444';
      const scarletMat = createVoxelMaterial('frog_skin', 0xef4444, 0xdc2626, { roughness: 0.34 });
      const wingYellowMat = createVoxelMaterial('frog_belly', 0xfacc15, 0xfef08a, { roughness: 0.34 });
      const wingBlueMat = createVoxelMaterial('crystal_gem', 0x2563eb, 0x60a5fa, { roughness: 0.32 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72 * scale, 0.56 * scale, 0.88 * scale), scarletMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.66 * scale, 0.42 * scale, 0.58 * scale), scarletMat);
      headBox.position.set(0, 0.28 * scale, 0.32 * scale);
      root.add(headBox);

      // White Macaw Cheek Plates & Two-Tone Curved Parrot Beak
      [-0.34 * scale, 0.34 * scale].forEach((cx) => {
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.06 * scale, 0.22 * scale, 0.28 * scale), whiteMat);
        cheek.position.set(cx, 0.24 * scale, 0.38 * scale);
        root.add(cheek);
      });
      const upperBeak = new THREE.Mesh(new THREE.BoxGeometry(0.28 * scale, 0.22 * scale, 0.28 * scale), beakGoldMat);
      upperBeak.position.set(0, 0.26 * scale, 0.72 * scale);
      root.add(upperBeak);
      const lowerBeak = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.12 * scale, 0.18 * scale), darkMat);
      lowerBeak.position.set(0, 0.14 * scale, 0.68 * scale);
      root.add(lowerBeak);

      addMascotEyes(root, scarletMat, 0.21 * scale, 0.52 * scale, 0.36 * scale, 0.92 * scale, darkMat, false);

      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.32 * scale, 0.08 * scale, 0.68 * scale), scarletMat);
      tail.position.set(0, 0.04 * scale, -0.72 * scale);
      root.add(tail);

      leftWing = new THREE.Group();
      leftWing.position.set(-0.36 * scale, 0.16 * scale, 0.04 * scale);
      const lwY = new THREE.Mesh(new THREE.BoxGeometry(0.86 * scale, 0.08 * scale, 0.38 * scale), wingYellowMat);
      lwY.position.x = -0.42 * scale;
      const lwB = new THREE.Mesh(new THREE.BoxGeometry(0.76 * scale, 0.07 * scale, 0.22 * scale), wingBlueMat);
      lwB.position.set(-0.38 * scale, -0.01 * scale, -0.16 * scale);
      leftWing.add(lwY, lwB);
      root.add(leftWing);

      rightWing = new THREE.Group();
      rightWing.position.set(0.36 * scale, 0.16 * scale, 0.04 * scale);
      const rwY = new THREE.Mesh(new THREE.BoxGeometry(0.86 * scale, 0.08 * scale, 0.38 * scale), wingYellowMat);
      rwY.position.x = 0.42 * scale;
      const rwB = new THREE.Mesh(new THREE.BoxGeometry(0.76 * scale, 0.07 * scale, 0.22 * scale), wingBlueMat);
      rwB.position.set(0.38 * scale, -0.01 * scale, -0.16 * scale);
      rightWing.add(rwY, rwB);
      root.add(rightWing);
    } else if (type === 'zigzag') {
      // HEAVEN ZIGZAG: PEREGRINE SKY-HAWK MASCOT (Slate-Cobalt Raptor with Barred Cream Belly & Mascot Eyes)
      minimapColor = '#38bdf8';
      const falconMat = createVoxelMaterial('frog_skin', 0x334155, 0x1e293b, { roughness: 0.34 });
      const breastMat = createVoxelMaterial('hazard_stripes', 0xf8fafc, 0x475569, { roughness: 0.36 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.74 * scale, 0.54 * scale, 0.92 * scale), falconMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const breast = new THREE.Mesh(new THREE.BoxGeometry(0.64 * scale, 0.22 * scale, 0.82 * scale), breastMat);
      breast.position.set(0, -0.24 * scale, 0.08 * scale);
      root.add(breast);

      const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.64 * scale, 0.38 * scale, 0.56 * scale), falconMat);
      headBox.position.set(0, 0.26 * scale, 0.32 * scale);
      root.add(headBox);

      const beak = new THREE.Mesh(new THREE.BoxGeometry(0.24 * scale, 0.18 * scale, 0.28 * scale), beakGoldMat);
      beak.position.set(0, 0.22 * scale, 0.70 * scale);
      root.add(beak);

      addMascotEyes(root, falconMat, 0.21 * scale, 0.50 * scale, 0.36 * scale, 0.90 * scale, beakGoldMat, false);

      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.46 * scale, 0.08 * scale, 0.46 * scale), falconMat);
      tail.position.set(0, 0.04 * scale, -0.62 * scale);
      root.add(tail);

      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.94 * scale, 0.08 * scale, 0.38 * scale), falconMat);
      leftWing.position.set(-0.56 * scale, 0.14 * scale, -0.02 * scale);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.94 * scale, 0.08 * scale, 0.38 * scale), falconMat);
      rightWing.position.set(0.56 * scale, 0.14 * scale, -0.02 * scale);
      root.add(rightWing);
    } else {
      // HEAVEN LOOP / FIGURE8: CELESTIAL SUN-COCKATIEL MASCOT (Pearl-White & Gold Songbird with Rosy Cheeks)
      minimapColor = '#fde047';
      const doveMat = createVoxelMaterial('frog_belly', 0xffffff, 0xfef08a, { roughness: 0.26, emissive: 0xfef08a, emissiveIntensity: 0.16 });

      bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72 * scale, 0.54 * scale, 0.88 * scale), doveMat);
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.64 * scale, 0.40 * scale, 0.56 * scale), doveMat);
      headBox.position.set(0, 0.26 * scale, 0.30 * scale);
      root.add(headBox);

      // Signature Cockatiel Rosy Cheek Blushes + Golden Crown Plume
      [-0.33 * scale, 0.33 * scale].forEach((cx) => {
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.06 * scale, 0.16 * scale, 0.18 * scale), blushMat);
        cheek.position.set(cx, 0.22 * scale, 0.38 * scale);
        root.add(cheek);
      });
      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.28 * scale, 0.22 * scale), goldMat);
      crest.position.set(0, 0.58 * scale, 0.24 * scale);
      crest.rotation.x = -0.28;
      root.add(crest);

      const beak = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.16 * scale, 0.24 * scale), goldMat);
      beak.position.set(0, 0.22 * scale, 0.66 * scale);
      root.add(beak);

      addMascotEyes(root, doveMat, 0.20 * scale, 0.50 * scale, 0.34 * scale, 0.90 * scale, goldMat, false);

      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.44 * scale, 0.08 * scale, 0.48 * scale), goldMat);
      tail.position.set(0, 0.04 * scale, -0.58 * scale);
      root.add(tail);

      leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.88 * scale, 0.08 * scale, 0.38 * scale), doveMat);
      leftWing.position.set(-0.54 * scale, 0.14 * scale, 0.02 * scale);
      root.add(leftWing);
      rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.88 * scale, 0.08 * scale, 0.38 * scale), doveMat);
      rightWing.position.set(0.54 * scale, 0.14 * scale, 0.02 * scale);
      root.add(rightWing);
    }
  }
  // =====================================================================
  // BIOME C: GROUND MEADOW (0F) — FROGGIT-STYLE BUMBLE-HORNETS, STAG-BEETLES,
  //          EMERALD DRAGONFLIES, LADYBUG SPRITES & SOVEREIGN GUARDIAN
  // =====================================================================
  else if (isBoss) {
    // GROUND BOSS: KING CROAK-HORNET SOVEREIGN (Armored Royal Violet & Gold Voxel Mascot Warlord)
    minimapColor = '#f43f5e';
    const armorMat = createVoxelMaterial('frog_skin', 0x7e22ce, 0x581c87, { roughness: 0.30, emissive: 0x6b21a8, emissiveIntensity: 0.18 });
    const stripeMat = createVoxelMaterial('hazard_stripes', 0xfacc15, 0x0f172a, { roughness: 0.35 });
    const wingMat = createVoxelMaterial('crystal_gem', 0xfef08a, 0x38bdf8, { roughness: 0.22, transparent: true, opacity: 0.86 });

    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.72 * scale, 1.06 * scale), armorMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    const abdomen = new THREE.Mesh(new THREE.BoxGeometry(0.84 * scale, 0.58 * scale, 0.64 * scale), stripeMat);
    abdomen.position.set(0, -0.04 * scale, -0.78 * scale);
    root.add(abdomen);

    // Armored Shoulder Pauldrons + Fierce Mascot Face
    [-0.58 * scale, 0.58 * scale].forEach((px) => {
      const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.30 * scale, 0.42 * scale, 0.58 * scale), stripeMat);
      pauldron.position.set(px, 0.20 * scale, 0.12 * scale);
      root.add(pauldron);
    });

    const mouthBar = new THREE.Mesh(new THREE.BoxGeometry(0.56 * scale, 0.10 * scale, 0.04 * scale), darkMat);
    mouthBar.position.set(0, 0.06 * scale, 0.55 * scale);
    root.add(mouthBar);

    addMascotEyes(root, armorMat, 0.27 * scale, 0.48 * scale, 0.28 * scale, 1.15 * scale, goldMat, true);
    addGuardianCrown(root, 0.74 * scale, 0.04 * scale, scale);

    leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.08 * scale, 0.48 * scale), wingMat);
    leftWing.position.set(-0.68 * scale, 0.38 * scale, 0.04 * scale);
    root.add(leftWing);
    rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.08 * scale, 0.48 * scale), wingMat);
    rightWing.position.set(0.68 * scale, 0.38 * scale, 0.04 * scale);
    root.add(rightWing);
  } else if (type === 'sweeper') {
    // GROUND SWEEPER: ROYAL BUMBLE-HORNET MASCOT (Plump Golden-Amber & Espresso Striped Voxel Bee with Froggit Eyes)
    minimapColor = '#facc15';
    const goldFurMat = createVoxelMaterial('frog_belly', 0xfacc15, 0xf59e0b, { roughness: 0.34 });
    const darkBandMat = createVoxelMaterial('frog_skin', 0x1e1b18, 0x090d16, { roughness: 0.40 });
    const wingMat = createVoxelMaterial('crystal_gem', 0xe0f2fe, 0xffffff, { roughness: 0.20, transparent: true, opacity: 0.84 });

    // Plump Sculpted Voxel Hornet Head/Thorax Block
    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.62 * scale, 0.78 * scale), goldFurMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Stepped Alternating Espresso & Gold Banded Abdomen
    const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.72 * scale, 0.56 * scale, 0.26 * scale), darkBandMat);
    band1.position.set(0, -0.02 * scale, -0.50 * scale);
    root.add(band1);
    const band2 = new THREE.Mesh(new THREE.BoxGeometry(0.64 * scale, 0.48 * scale, 0.24 * scale), goldFurMat);
    band2.position.set(0, -0.02 * scale, -0.74 * scale);
    root.add(band2);
    const band3 = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.38 * scale, 0.20 * scale), darkBandMat);
    band3.position.set(0, -0.02 * scale, -0.94 * scale);
    root.add(band3);
    const stinger = new THREE.Mesh(new THREE.BoxGeometry(0.16 * scale, 0.16 * scale, 0.24 * scale), darkMat);
    stinger.position.set(0, -0.02 * scale, -1.12 * scale);
    root.add(stinger);

    // Cute Mascot Grin & Bobbing Voxel Antennae
    const smileBar = new THREE.Mesh(new THREE.BoxGeometry(0.42 * scale, 0.08 * scale, 0.03 * scale), darkMat);
    smileBar.position.set(0, -0.06 * scale, 0.40 * scale);
    root.add(smileBar);

    [-0.18 * scale, 0.18 * scale].forEach((ax) => {
      const ant = new THREE.Mesh(new THREE.BoxGeometry(0.06 * scale, 0.22 * scale, 0.06 * scale), darkMat);
      ant.position.set(ax, 0.54 * scale, 0.32 * scale);
      ant.rotation.x = 0.35;
      root.add(ant);
    });

    addMascotEyes(root, goldFurMat, 0.22 * scale, 0.38 * scale, 0.22 * scale, 0.92 * scale, darkMat, false);

    leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.06 * scale, 0.42 * scale), wingMat);
    leftWing.position.set(-0.52 * scale, 0.32 * scale, -0.06 * scale);
    root.add(leftWing);
    rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.78 * scale, 0.06 * scale, 0.42 * scale), wingMat);
    rightWing.position.set(0.52 * scale, 0.32 * scale, -0.06 * scale);
    root.add(rightWing);
  } else if (type === 'zigzag') {
    // GROUND ZIGZAG: CRIMSON STAG-BEETLE MASCOT (Glossy Ruby Shell, Lime Belly, Twin Stag Pincers & Mascot Eyes)
    minimapColor = '#f43f5e';
    const shellMat = createVoxelMaterial('frog_skin', 0xe11d48, 0xbe123c, { roughness: 0.28, metalness: 0.22 });
    const hornMat = createVoxelMaterial('frog_belly', 0x84cc16, 0x4d7c0f, { roughness: 0.34 });

    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.86 * scale, 0.56 * scale, 0.96 * scale), shellMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Center Carapace Seam & Belly Plate
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.06 * scale, 0.58 * scale, 0.72 * scale), darkMat);
    seam.position.set(0, 0.02 * scale, -0.10 * scale);
    root.add(seam);

    // Articulated L-Shaped Stag Beetle Pincer Mandibles on Front
    [-0.28 * scale, 0.28 * scale].forEach((mx, idx) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.14 * scale, 0.42 * scale), hornMat);
      arm.position.set(mx, 0.02 * scale, 0.64 * scale);
      root.add(arm);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.18 * scale, 0.14 * scale, 0.14 * scale), hornMat);
      tip.position.set(mx + (idx === 0 ? 0.08 : -0.08) * scale, 0.02 * scale, 0.82 * scale);
      root.add(tip);
    });

    addMascotEyes(root, shellMat, 0.24 * scale, 0.36 * scale, 0.28 * scale, 0.94 * scale, hornMat, false);

    leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.62 * scale, 0.07 * scale, 0.40 * scale), hornMat);
    leftWing.position.set(-0.56 * scale, 0.24 * scale, -0.06 * scale);
    root.add(leftWing);
    rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.62 * scale, 0.07 * scale, 0.40 * scale), hornMat);
    rightWing.position.set(0.56 * scale, 0.24 * scale, -0.06 * scale);
    root.add(rightWing);
  } else if (type === 'swooper') {
    // GROUND SWOOPER: EMERALD DARNER DRAGONFLY MASCOT (Matching Froggit's Own Emerald & Gold Palette!)
    minimapColor = '#a855f7';
    const dragMat = createVoxelMaterial('frog_skin', 0x10b981, 0x059669, { roughness: 0.32 });
    const dragBelly = createVoxelMaterial('frog_belly', 0x6ee7b7, 0x34d399, { roughness: 0.36 });
    const wingMat = createVoxelMaterial('crystal_gem', 0xc084fc, 0x38bdf8, { roughness: 0.22, transparent: true, opacity: 0.84 });

    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72 * scale, 0.54 * scale, 0.78 * scale), dragMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Stepped Segmented Dragonfly Tail with Gold Rings
    for (let seg = 1; seg <= 4; seg++) {
      const sBox = new THREE.Mesh(
        new THREE.BoxGeometry((0.36 - seg * 0.04) * scale, (0.30 - seg * 0.03) * scale, 0.26 * scale),
        seg % 2 === 0 ? goldMat : dragBelly
      );
      sBox.position.set(0, 0.04 * scale, (-0.36 - seg * 0.24) * scale);
      root.add(sBox);
    }

    addMascotEyes(root, dragMat, 0.23 * scale, 0.36 * scale, 0.24 * scale, 0.96 * scale, goldMat, false);

    // Biplane Double Dragonfly Wings
    leftWing = new THREE.Group();
    leftWing.position.set(-0.36 * scale, 0.24 * scale, 0.04 * scale);
    const lFore = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.06 * scale, 0.26 * scale), wingMat);
    lFore.position.set(-0.46 * scale, 0, 0.14 * scale);
    const lHind = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.06 * scale, 0.22 * scale), goldMat);
    lHind.position.set(-0.40 * scale, -0.02 * scale, -0.16 * scale);
    leftWing.add(lFore, lHind);
    root.add(leftWing);

    rightWing = new THREE.Group();
    rightWing.position.set(0.36 * scale, 0.24 * scale, 0.04 * scale);
    const rFore = new THREE.Mesh(new THREE.BoxGeometry(0.96 * scale, 0.06 * scale, 0.26 * scale), wingMat);
    rFore.position.set(0.46 * scale, 0, 0.14 * scale);
    const rHind = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.06 * scale, 0.22 * scale), goldMat);
    rHind.position.set(0.40 * scale, -0.02 * scale, -0.16 * scale);
    rightWing.add(rFore, rHind);
    root.add(rightWing);
  } else {
    // GROUND LOOP / FIGURE8: POLKA-DOT LADYBUG / SUNSET MOTH MASCOT (Plump Spotted Shell & Cute Mascot Eyes)
    minimapColor = '#f97316';
    const ladyMat = createVoxelMaterial('frog_skin', 0xf97316, 0xea580c, { roughness: 0.32 });
    const spotMat = darkMat;

    bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.82 * scale, 0.58 * scale, 0.86 * scale), ladyMat);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Raised Polka-Dot Spots on Carapace
    [[-0.22, 0.31, -0.12], [0.22, 0.31, -0.12], [0, 0.31, -0.30]].forEach(([sx, sy, sz]) => {
      const spot = new THREE.Mesh(new THREE.BoxGeometry(0.16 * scale, 0.04 * scale, 0.16 * scale), spotMat);
      spot.position.set(sx * scale, sy * scale, sz * scale);
      root.add(spot);
    });

    addMascotEyes(root, ladyMat, 0.22 * scale, 0.36 * scale, 0.26 * scale, 0.92 * scale, darkMat, false);

    leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.76 * scale, 0.07 * scale, 0.44 * scale), goldMat);
    leftWing.position.set(-0.54 * scale, 0.20 * scale, -0.04 * scale);
    root.add(leftWing);
    rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.76 * scale, 0.07 * scale, 0.44 * scale), goldMat);
    rightWing.position.set(0.54 * scale, 0.20 * scale, -0.04 * scale);
    root.add(rightWing);
  }

  const shieldOrbs = [];
  if (isBoss) {
    const orbGroup = new THREE.Group();
    root.add(orbGroup);
    for (let i = 0; i < 3; i++) {
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.32, 0),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      const ang = (i * Math.PI * 2) / 3;
      orb.position.set(Math.cos(ang) * 1.55, 0.38, Math.sin(ang) * 1.55);
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

// Reusable helper to update any .arcade-alert__text element with crisp dual-layer extrude + warm gradient face
function setArcadeAlertText(elOrId, rawText) {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) return;
  const clean = String(rawText).replace(/^[⚡👑🌊🎉🚀💥💀👅✨☀️🚩☁️🐠🪼🌿]+\s*/u, '').trim().toUpperCase();
  el.setAttribute('data-text', clean);
  el.innerHTML = '';
  const extrudeSpan = document.createElement('span');
  extrudeSpan.className = 'arcade-alert__extrude';
  extrudeSpan.setAttribute('aria-hidden', 'true');
  extrudeSpan.textContent = clean;
  const faceSpan = document.createElement('span');
  faceSpan.className = 'arcade-alert__face';
  faceSpan.textContent = clean;
  el.appendChild(extrudeSpan);
  el.appendChild(faceSpan);
}

function spawnFloatingPopup(worldPos, text, colorClass = '', situation = 'auto') {
  const cleanText = String(text).replace(/^[⚡👑🌊🎉🚀💥💀👅✨☀️🚩💣]+\s*/u, '').trim().toUpperCase();
  let sizeTierClass = 'arcade-alert--md';
  let moodClass = 'arcade-alert--score';

  if (situation === 'bomb' || cleanText.includes('BOMB') || cleanText.includes('CANNON') || cleanText.includes('BLASTED')) {
    sizeTierClass = 'arcade-alert--lg';
    moodClass = 'arcade-alert--bomb';
  } else if (situation === 'death' || situation === 'danger' || cleanText.includes('FELL') || cleanText.includes('STRUCK') || cleanText.includes('TOUCHED') || cleanText.includes('BITTEN') || cleanText.includes('PECKED') || cleanText.includes('LASHED') || cleanText.includes('STUNG') || cleanText.includes('WIPED')) {
    sizeTierClass = 'arcade-alert--xl';
    moodClass = 'arcade-alert--death';
  } else if (situation === 'combo' || cleanText.includes('COMBO') || /\([2-9]\d*X\)/.test(cleanText)) {
    sizeTierClass = 'arcade-alert--lg';
    moodClass = 'arcade-alert--combo';
  } else if (situation === 'bug' || cleanText.includes('BUG') || /\(1X\)/.test(cleanText)) {
    sizeTierClass = 'arcade-alert--sm';
    moodClass = 'arcade-alert--bug';
  } else if (situation === 'obstacle' || situation === 'push' || cleanText.includes('PUSH') || cleanText.includes('SHOVE') || cleanText.includes('CLIP') || cleanText.includes('REPEL') || cleanText.includes('ROLL') || cleanText.includes('SWEEPER') || cleanText.includes('AXE') || cleanText.includes('THWOMP') || cleanText.includes('LOG')) {
    sizeTierClass = 'arcade-alert--sm';
    moodClass = 'arcade-alert--obstacle';
  } else if (situation === 'boss' || cleanText.includes('GUARDIAN') || cleanText.includes('SHIELD') || cleanText.includes('CLEAR') || cleanText.includes('WARP') || cleanText.includes('CONQUERED') || cleanText.includes('LEVIATHAN')) {
    sizeTierClass = 'arcade-alert--xl';
    moodClass = 'arcade-alert--achievement';
  } else if (situation === 'checkpoint' || cleanText.includes('CHECKPOINT') || situation === 'boost' || cleanText.includes('BOOST') || cleanText.includes('REVIVED') || cleanText.includes('ZIP') || cleanText.includes('FIREFLY')) {
    sizeTierClass = cleanText.includes('CHECKPOINT') ? 'arcade-alert--lg' : 'arcade-alert--md';
    moodClass = 'arcade-alert--achievement';
  } else {
    sizeTierClass = 'arcade-alert--md';
    moodClass = 'arcade-alert--score';
  }

  const curTheme = (FLOORS[state.floorLevel] || FLOORS[0]).theme;
  const biomeClass = curTheme === 'heaven'
    ? 'arcade-alert--biome-heaven'
    : (curTheme === 'ocean' ? 'arcade-alert--biome-ocean' : 'arcade-alert--biome-ground');

  // Compute screen position directly above Tode's head
  const headHeight = 2.15 * BASE_FROG_SCALE * state.scaleMultiplier;
  const headWorld = todeRoot.position.clone().add(new THREE.Vector3(0, headHeight, 0));
  const projected = headWorld.project(camera);
  const padX = Math.min(140, Math.round(window.innerWidth * 0.24));
  const sx = THREE.MathUtils.clamp((projected.x * 0.5 + 0.5) * window.innerWidth, padX, window.innerWidth - padX);
  const sy = THREE.MathUtils.clamp((-projected.y * 0.5 + 0.5) * window.innerHeight, 96, window.innerHeight - 90);

  while (activeHeadPopups.length >= 2) {
    const oldest = activeHeadPopups.shift();
    if (oldest && oldest.el && oldest.el.parentNode) {
      oldest.el.parentNode.removeChild(oldest.el);
    }
  }
  const stackOffsetPx = activeHeadPopups.length * 56;

  const el = document.createElement('div');
  el.className = `score-popup arcade-alert ${sizeTierClass} ${moodClass} ${biomeClass}`;
  el.style.left = `${sx}px`;
  el.style.top = `${sy - stackOffsetPx}px`;

  const span = document.createElement('span');
  span.className = 'arcade-alert__text';
  setArcadeAlertText(span, cleanText);
  el.appendChild(span);

  popupLayer.appendChild(el);

  const tracker = { el, stackOffsetPx };
  activeHeadPopups.push(tracker);

  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
    const idx = activeHeadPopups.indexOf(tracker);
    if (idx !== -1) activeHeadPopups.splice(idx, 1);
  }, 1160);
}