// =========================================================================
// 1. AUTOMATED 4-CHAPTER, 12-SHOT 3D STORYTELLING CUTSCENE CHOREOGRAPHY
//    Plays automatically on 1st-time play (or via the Title Cutscene button).
//    Showcases dynamic camera angles, 1st-person Toad POV, all 5 frog skins,
//    diverse biome sprites (Hornets, Beetles, Dragonflies, Sky Eagles, Parrots,
//    Reef Sharks, Squids, 3-Shield Guardian Boss), worlds (0F, +2F, -2F),
//    and Toad abilities (hopping, expressions, pink tongue snipe & lily-post zip)
//    with synchronized voiceover-style narrator subtitles.
// =========================================================================
const STORY_INTRO_CHAPTERS = [
  // ---------------- CHAPTER I: THE AWAKENING & TOAD’S WARDROBE ----------------
  {
    chapterNum: 1,
    step: 'CHAPTER I • 1 / 4',
    badge: '🌿 CHAPTER I — THE AWAKENING',
    povLabel: '🎥 LOW-ANGLE HERO CLOSE-UP',
    title: 'Meet Tode of the Floating Realms',
    narrator: '"High above the clouds and deep beneath the waves, a tiny voxel frog named Tode awakens on the edge of the Ground Meadow..."',
    hint: 'Automated 3D Story Cutscene • Press [ESC] Anytime to Skip',
    duration: 4.2,
    floorLevel: 0,
    skin: 'emerald',
    camMode: 'cinematic',
    camStart: { x: -3.4, y: 1.75, z: 4.8 },
    camEnd:   { x: 2.8,  y: 2.35, z: 4.4 },
    lookStart:{ x: 0.0,  y: 0.95, z: 0.0 },
    lookEnd:  { x: 0.0,  y: 1.15, z: -1.5 },
    fovStart: 34,
    fovEnd: 38,
    todeAction: 'hero_awaken'
  },
  {
    chapterNum: 1,
    step: 'CHAPTER I • 1 / 4',
    badge: '✨ CHAPTER I — 5 TOAD FORMS & EXPRESSIONS',
    povLabel: '🎥 360° WARDROBE SHOWCASE ORBIT',
    title: 'Living Expressions & Mythic Skins',
    narrator: '"Channeling the light of Golden Fireflies, Tode shifts from Emerald to Cobalt Dart, Gold Shogun, Bio-Abyss, and Sakura—ready for any realm."',
    hint: 'Collect ✨ Golden Fireflies in-game to unlock all 5 Tode skins',
    duration: 4.4,
    floorLevel: 0,
    skin: 'cycle',
    camMode: 'orbit_tode',
    camStart: { x: 0.0, y: 2.4, z: 4.6 },
    camEnd:   { x: 0.0, y: 2.6, z: 4.6 },
    lookStart:{ x: 0.0, y: 0.9, z: 0.0 },
    lookEnd:  { x: 0.0, y: 0.9, z: 0.0 },
    fovStart: 36,
    fovEnd: 36,
    todeAction: 'wardrobe_expressions'
  },
  {
    chapterNum: 1,
    step: 'CHAPTER I • 1 / 4',
    badge: '👁️ CHAPTER I — TOAD’S EYE VIEW',
    povLabel: '🎥 1ST-PERSON TOAD POV',
    title: 'The 96-Row Winding Causeway',
    narrator: '"Through Tode’s own eyes, the 96-row causeway stretches ahead—twisting across steep hills, split-island forks, and drifting ferries."',
    hint: 'Hop tile-by-tile with WASD, Arrow Keys, D-Pad, or Touch Swipes',
    duration: 4.0,
    floorLevel: 0,
    skin: 'emerald',
    camMode: 'first_person_tode',
    camStart: { x: 0.0, y: 1.8, z: -0.6 },
    camEnd:   { x: 0.0, y: 2.1, z: -6.8 },
    lookStart:{ x: -2.0, y: 1.4, z: -18.0 },
    lookEnd:  { x: -9.5, y: 2.2, z: -28.0 },
    fovStart: 58,
    fovEnd: 54,
    todeAction: 'first_person_hops'
  },

  // ---------------- CHAPTER II: SWARMS OF THE MEADOW & PINK TONGUE ----------------
  {
    chapterNum: 2,
    step: 'CHAPTER II • 2 / 4',
    badge: '🐝 CHAPTER II — SWARMS OF THE MEADOW',
    povLabel: '🎥 AERIAL SWARM TRACKING SHOT',
    title: 'Patrolling Hornets, Beetles & Dragonflies',
    narrator: '"The trail teems with life! Royal Bumble-Hornets, Crimson Stag-Beetles, Emerald Dragonflies, and Polka-Dot Ladybugs guard every turn—and one touch is lethal."',
    hint: 'Touching patrolling creatures directly will wipe Tode out!',
    duration: 4.2,
    floorLevel: 0,
    skin: 'emerald',
    camMode: 'cinematic',
    camStart: { x: -4.8, y: 5.2, z: -6.5 },
    camEnd:   { x: -11.5, y: 4.6, z: -20.5 },
    lookStart:{ x: -3.5, y: 1.6, z: -16.0 },
    lookEnd:  { x: -11.0, y: 2.2, z: -34.0 },
    fovStart: 42,
    fovEnd: 40,
    todeAction: 'stalk_meadow_bugs'
  },
  {
    chapterNum: 2,
    step: 'CHAPTER II • 2 / 4',
    badge: '👅 CHAPTER II — OFFENSIVE TONGUE WHIP',
    povLabel: '🎥 OVER-THE-SHOULDER ACTION POV',
    title: 'The Frog That Eats Back!',
    narrator: '"But Tode doesn’t just run away. With a lightning whip of his pink tongue, he snipes bugs right out of mid-air for combos and Golden Fireflies!"',
    hint: 'Press SPACE or Left-Click (or tap 👅 WHIP) to snipe bugs & fireflies',
    duration: 4.2,
    floorLevel: 0,
    skin: 'cobalt',
    camMode: 'cinematic',
    camStart: { x: -1.8, y: 2.6, z: -6.2 },
    camEnd:   { x: 2.6,  y: 2.9, z: -7.5 },
    lookStart:{ x: 0.0,  y: 1.3, z: -13.5 },
    lookEnd:  { x: -2.0, y: 1.5, z: -16.5 },
    fovStart: 38,
    fovEnd: 35,
    todeAction: 'demo_tongue_snipe'
  },
  {
    chapterNum: 2,
    step: 'CHAPTER II • 2 / 4',
    badge: '🪷 CHAPTER II — LILY-POST CHASM ZIP',
    povLabel: '🎥 LOW-WATER CHASM CAMERA',
    title: 'Zip Across Open Chasms',
    narrator: '"And when a chasm blocks the path, Tode latches onto glowing Lotus Lily-Posts—zipping across open water in a single bound!"',
    hint: 'Lock onto 🪷 Lily-Posts ahead of you to zip across gaps (+150 pts)',
    duration: 4.0,
    floorLevel: 0,
    skin: 'shogun',
    camMode: 'cinematic',
    camStart: { x: -15.5, y: 2.8, z: -16.5 },
    camEnd:   { x: -7.2,  y: 4.2, z: -20.0 },
    lookStart:{ x: -10.5, y: 1.4, z: -22.5 },
    lookEnd:  { x: -12.0, y: 1.8, z: -26.0 },
    fovStart: 42,
    fovEnd: 40,
    todeAction: 'demo_lily_zip'
  },

  // ---------------- CHAPTER III: THE SKY SANCTUMS & KNOCKBACK GAUNTLET ----------------
  {
    chapterNum: 3,
    step: 'CHAPTER III • 3 / 4',
    badge: '☀️ CHAPTER III — THE CELESTIAL SKY REALMS',
    povLabel: '🎥 SKY TEMPLE CRANE SWEEP',
    title: 'Soaring Eagles, Falcons & Singing Parrots',
    narrator: '"Ascend into the Star Temple and Sky Gardens, where Imperial Golden Eagles, Peregrine Sky-Hawks, and Scarlet Macaws soar past singing guardrail parrots."',
    hint: 'Sky Realms (+1F to +3F) feature faster patrols & narrow cloud bridges',
    duration: 4.4,
    floorLevel: 2,
    skin: 'shogun',
    camMode: 'cinematic',
    camStart: { x: -6.5, y: 5.5, z: -8.0 },
    camEnd:   { x: 6.5,  y: 6.2, z: -24.0 },
    lookStart:{ x: 0.0,  y: 1.8, z: -20.0 },
    lookEnd:  { x: 2.5,  y: 2.2, z: -38.0 },
    fovStart: 42,
    fovEnd: 44,
    todeAction: 'sky_realm_showcase'
  },
  {
    chapterNum: 3,
    step: 'CHAPTER III • 3 / 4',
    badge: '💣 CHAPTER III — KNOCKBACK TRAPS',
    povLabel: '🎥 CANNON SIGHTLINE DUTCH ANGLE',
    title: 'Cannons, Battle-Axes, Thwomps & Logs',
    narrator: '"Watch the ridge! Bastion Cannons lock on with orange laser sights, while Swinging Battle-Axes, Thwomp Monoliths, and Spiked Logs shove Tode toward the edge!"',
    hint: 'Physical traps shove Tode instead of killing on contact—watch unfenced ledges!',
    duration: 4.4,
    floorLevel: 0,
    skin: 'sakura',
    camMode: 'dutch_action',
    camStart: { x: 18.5, y: 5.2, z: -64.0 },
    camEnd:   { x: 5.5,  y: 4.8, z: -68.0 },
    lookStart:{ x: 11.5, y: 2.2, z: -74.0 },
    lookEnd:  { x: 12.0, y: 2.4, z: -84.0 },
    fovStart: 40,
    fovEnd: 42,
    todeAction: 'hazard_gauntlet_dodge'
  },
  {
    chapterNum: 3,
    step: 'CHAPTER III • 3 / 4',
    badge: '🚩 CHAPTER III — CHECKPOINT OVERLOOKS',
    povLabel: '🎥 HIGHLAND OVERLOOK DOLLY',
    title: 'Save Your Spot on the Climb',
    narrator: '"Cross glowing Checkpoint overlooks along the climb—so even if a trap knocks you into the abyss, a single tap of Enter revives you right back in the fight."',
    hint: 'Press [ENTER ↵] after any wipeout to revive at your last 🚩 Checkpoint',
    duration: 3.8,
    floorLevel: 0,
    skin: 'emerald',
    camMode: 'cinematic',
    camStart: { x: -9.5, y: 3.8, z: -49.5 },
    camEnd:   { x: 2.2,  y: 4.6, z: -51.5 },
    lookStart:{ x: -4.0, y: 1.2, z: -56.0 },
    lookEnd:  { x: -3.5, y: 1.5, z: -58.0 },
    fovStart: 38,
    fovEnd: 40,
    todeAction: 'checkpoint_celebrate'
  },

  // ---------------- CHAPTER IV: THE DEEP ABYSS, GUARDIAN BOSS & PORTAL HOOPS ----------------
  {
    chapterNum: 4,
    step: 'CHAPTER IV • 4 / 4',
    badge: '🌊 CHAPTER IV — THE BIOLUMINESCENT ABYSS',
    povLabel: '🎥 DEEP TRENCH SUBMERSIBLE POV',
    title: 'Reef Sharks, Giant Squids & Puffer-Bloats',
    narrator: '"Or plunge beneath the waves into the Coral Reef and Kelp Trench—where Great Reef Sharks, Ruby Octo-Squids, Clown-Tangs, and Puffer-Bloats prowl the neon currents."',
    hint: 'Ocean Realms (-1F to -3F) descend all the way to the Mariana Abyss',
    duration: 4.4,
    floorLevel: -2,
    skin: 'abyss',
    camMode: 'cinematic',
    camStart: { x: 6.8,  y: 4.4, z: -8.0 },
    camEnd:   { x: -6.8, y: 5.0, z: -24.0 },
    lookStart:{ x: 0.0,  y: 1.6, z: -20.0 },
    lookEnd:  { x: -2.0, y: 2.0, z: -38.0 },
    fovStart: 42,
    fovEnd: 44,
    todeAction: 'ocean_realm_showcase'
  },
  {
    chapterNum: 4,
    step: 'CHAPTER IV • 4 / 4',
    badge: '🛡️ CHAPTER IV — THE REALM GUARDIAN',
    povLabel: '🎥 BOSS ARENA LOW-ANGLE HERO SHOT',
    title: 'Shatter the Guardian’s 3 Crystal Shields',
    narrator: '"At Row 90 of every realm stands a colossal crowned Realm Guardian protected by three orbiting crystal shields. Strike it three times with your tongue to shatter its armor!"',
    hint: 'Each tongue strike shatters 1 shield (+300 pts); the 3rd devours the Boss!',
    duration: 4.4,
    floorLevel: 0,
    skin: 'shogun',
    camMode: 'cinematic',
    camStart: { x: -4.5, y: 2.6, z: -172.5 },
    camEnd:   { x: 4.5,  y: 3.4, z: -173.5 },
    lookStart:{ x: 0.0,  y: 1.8, z: -180.0 },
    lookEnd:  { x: 0.0,  y: 2.0, z: -181.5 },
    fovStart: 38,
    fovEnd: 36,
    todeAction: 'boss_faceoff'
  },
  {
    chapterNum: 4,
    step: 'CHAPTER IV • 4 / 4',
    badge: '👑 CHAPTER IV — SKY CROWN OR MARIANA ABYSS',
    povLabel: '🎥 PORTAL SHRINE CRANE FINALE',
    title: 'Choose Your Destiny: Sky or Abyss!',
    narrator: '"Beyond the Guardian await the Portal Hoops: leap through the Golden Sky Hoop toward the Sun Crown, or dive into the Cyan Ocean Hoop toward the Mariana Abyss. Your journey begins now!"',
    hint: 'Conquer Floor +3 or -3 to unlock the 360° Victory Sanctuary Finale!',
    duration: 4.6,
    floorLevel: 0,
    skin: 'emerald',
    camMode: 'cinematic',
    camStart: { x: -5.2, y: 3.6, z: -180.0 },
    camEnd:   { x: 0.0,  y: 6.8, z: -174.0 },
    lookStart:{ x: 0.0,  y: 2.4, z: -189.0 },
    lookEnd:  { x: 0.0,  y: 2.8, z: -192.0 },
    fovStart: 42,
    fovEnd: 46,
    todeAction: 'portal_finale_pose'
  }
];

/**
 * Froggit — Sky and Abyss — Game Constants, 7-Realm Floors, 5 Unlockable Skins & State Store
 * File: src/state/gameState.js
 */
// =========================================================================
// 2. NICKNAME POOL, LEADERBOARD & 7-TIER WORLD FLOOR DEFINITIONS (96 ROWS)
// =========================================================================
const NICKNAME_POOL = [
  'RIBBIT_RONIN', 'LILYPAD_LEGEND', 'HORIZON_HOPPER', 'CROAK_TITAN',
  'SWAMP_SOVEREIGN', 'TONGUE_SNIPER', 'LOTUS_SHOGUN', 'ABYSS_DIVER',
  'SKYWARD_TOAD', 'EMERALD_LEAPER'
];

const TILE_SIZE = 2.0;
const ROADWAY_LENGTH = 96;
const CHECKPOINT_ROWS = [28, 56, 78];
const HOP_DURATION = 0.18;

const BASE_FROG_SCALE = 0.88; // Mildly smaller base Tode proportion for cleaner tile clearance

const FLOORS = {
  3: {
    level: 3, code: '👑', name: 'Sun Crown', theme: 'heaven', icon: '👑',
    widthScale: 0.75, speedMult: 1.45,
    skyTop: '#1e3a5f', skyMid: '#4b7bec', skyHorizon: '#fde68a', fogHex: 0x93c5fd,
    tileA: 0xf8fafc, tileB: 0xe2e8f0, cliffColor: 0x64748b, railColor: 0xd97706,
    ambientTop: 0xffffff, ambientGround: 0x94a3b8
  },
  2: {
    level: 2, code: '✨', name: 'Star Temple', theme: 'heaven', icon: '✨',
    widthScale: 0.85, speedMult: 1.30,
    skyTop: '#1e3a5f', skyMid: '#38bdf8', skyHorizon: '#fef3c7', fogHex: 0xbae6fd,
    tileA: 0xf1f5f9, tileB: 0xdbeafe, cliffColor: 0x475569, railColor: 0xd97706,
    ambientTop: 0xffffff, ambientGround: 0x64748b
  },
  1: {
    level: 1, code: '☁️', name: 'Sky Gardens', theme: 'heaven', icon: '☁️',
    widthScale: 0.92, speedMult: 1.15,
    skyTop: '#1e3a5f', skyMid: '#38bdf8', skyHorizon: '#fef3c7', fogHex: 0xbae6fd,
    tileA: 0xf1f5f9, tileB: 0xe2e8f0, cliffColor: 0x475569, railColor: 0xd97706,
    ambientTop: 0xffffff, ambientGround: 0x64748b
  },
  0: {
    level: 0, code: '🌿', name: 'Ground Meadow', theme: 'ground', icon: '🌿',
    widthScale: 1.0, speedMult: 1.0,
    skyTop: '#172a45', skyMid: '#3b82f6', skyHorizon: '#fde68a', fogHex: 0x93c5fd,
    tileA: 0x34d399, tileB: 0x2dd4bf, cliffColor: 0x334155, railColor: 0xb45309,
    ambientTop: 0xf8fafc, ambientGround: 0x334155
  },
  '-1': {
    level: -1, code: '🐠', name: 'Coral Reef', theme: 'ocean', icon: '🐠',
    widthScale: 0.92, speedMult: 1.15,
    skyTop: '#0f2942', skyMid: '#0284c7', skyHorizon: '#22d3ee', fogHex: 0x0284c7,
    tileA: 0x2dd4bf, tileB: 0x14b8a6, cliffColor: 0x1e3a5f, railColor: 0x06b6d4,
    ambientTop: 0xe0f2fe, ambientGround: 0x1e3a5f
  },
  '-2': {
    level: -2, code: '🪼', name: 'Kelp Trench', theme: 'ocean', icon: '🪼',
    widthScale: 0.85, speedMult: 1.30,
    skyTop: '#0b192c', skyMid: '#1e3a8a', skyHorizon: '#0284c7', fogHex: 0x1e3a8a,
    tileA: 0x14b8a6, tileB: 0x0d9488, cliffColor: 0x1e293b, railColor: 0x38bdf8,
    ambientTop: 0xbae6fd, ambientGround: 0x1e293b
  },
  '-3': {
    level: -3, code: '🌊', name: 'Mariana Abyss', theme: 'ocean', icon: '🌊',
    widthScale: 0.75, speedMult: 1.45,
    skyTop: '#060d18', skyMid: '#0f172a', skyHorizon: '#1e3a8a', fogHex: 0x0f172a,
    tileA: 0x0d9488, tileB: 0x0f766e, cliffColor: 0x1e293b, railColor: 0x22d3ee,
    ambientTop: 0x7dd3fc, ambientGround: 0x0f172a
  }
};

const state = {
  mode: 'LANDING', // 'LANDING' | 'STORY_INTRO' | 'TRANSITION_TO_PLAY' | 'PLAYING' | 'PAUSED'
  storyIntroStep: 0,
  storyIntroStepTimer: 0,
  storyIntroTotalTimer: 0,
  storyIntroTotalDuration: 51.0,
  storyIntroActionTriggered: false,
  storyIntroSavedSkin: 'emerald',
  storyIntroSeen: false,
  previousModeBeforePause: 'LANDING',
  transitionProgress: 0,
  playerName: '',
  floorLevel: 0,
  score: 0,
  highScore: 2400,
  highScoreHolder: 'RIBBIT_RONIN',
  leaderboard: [
    { name: 'RIBBIT_RONIN', score: 2400, floor: '✨' },
    { name: 'HORIZON_HOPPER', score: 1850, floor: '🪼' },
    { name: 'LILYPAD_LEGEND', score: 1400, floor: '☁️' },
    { name: 'SWAMP_SOVEREIGN', score: 950, floor: '🌿' }
  ],

  beesEaten: 0,
  totalFloorBees: 18,
  fireflies: 8,
  activeSkin: 'emerald',
  unlockedSkins: ['emerald'],
  lethalOneHitMode: true,
  showHudGuide: window.innerWidth >= 768,
  hearts: 1,
  combo: 0,
  maxCombo: 1,
  comboTimer: 0,
  stage: 1,
  scaleMultiplier: 1.0,

  gridX: 0,
  gridZ: 0,
  lastCheckpointZ: 0,
  hopActive: false,
  hopIsGrappleZip: false,
  queuedHop: null,
  hopTime: 0,
  hopStartPos: new THREE.Vector3(0, 0, 0),
  hopEndPos: new THREE.Vector3(0, 0, 0),

  targetYaw: Math.PI,
  currentYaw: Math.PI,

  zStretch: 1.0,
  xySquash: 1.0,

  breathPhase: 0,
  sacInflation: 0.15,
  blinkTimer: 2.2,
  blinkDuration: 0,
  isBlinking: false,
  jawAngle: 0,
  chewTimer: 0,
  bonkRecoilTimer: 0,
  dangerAlert: false,

  tongueState: 'idle',
  tongueTimer: 0,
  tongueTargetPos: new THREE.Vector3(),
  tongueTipPos: new THREE.Vector3(),
  latchedBee: null,

  fallingDeath: false,
  fallVelocityY: 0,
  deathSlowMoTimer: 0,

  hitStopTimer: 0,
  cameraTrauma: 0,
  invulnTimer: 0,

  defeated: false,
  defeatFov: 42,

  hoopTransitionActive: false,
  hoopTransTimer: 0,
  hoopTransDuration: 2.10,
  hoopTransSwapped: false,
  hoopTargetLevel: 1,
  hoopIsSky: true,
  hoopStartPos: new THREE.Vector3(),
  hoopCenterPos: new THREE.Vector3(),

  victoryCelebrationActive: false,
  victoryTimer: 0,
  victoryOrbitAngle: 0,
  victoryFireworkTimer: 0,
  faceMood: 'normal',

  bossMaxHp: 3,
  bossHp: 3,
  camLateralOffset: 0,
  camYawAngle: 0,
  smoothFocusX: 0,
  smoothFocusY: 0,
  smoothFocusZ: 0
};

try {
  const savedLb = localStorage.getItem('froggit_leaderboard_v5');
  if (savedLb) {
    const parsed = JSON.parse(savedLb);
    if (Array.isArray(parsed) && parsed.length > 0) {
      state.leaderboard = parsed;
      state.highScore = parsed[0].score;
      state.highScoreHolder = parsed[0].name;
    }
  }
  const savedName = localStorage.getItem('froggit_player_name_v3');
  if (savedName) {
    state.playerName = savedName;
    document.getElementById('input-player-name').value = savedName;
  }
  const savedSettings = localStorage.getItem('froggit_settings_v3');
  if (savedSettings) {
    const sObj = JSON.parse(savedSettings);
    if (typeof sObj.muted === 'boolean') audio.muted = sObj.muted;
    if (typeof sObj.masterVolume === 'number') audio.masterVolume = sObj.masterVolume;
    if (typeof sObj.sfxVolume === 'number') audio.sfxVolume = sObj.sfxVolume;
    if (typeof sObj.lethalOneHitMode === 'boolean') {
      state.lethalOneHitMode = sObj.lethalOneHitMode;
      state.hearts = state.lethalOneHitMode ? 1 : 3;
    }
    if (typeof sObj.showHudGuide === 'boolean') {
      state.showHudGuide = sObj.showHudGuide;
    }
    if (typeof sObj.fireflies === 'number') {
      state.fireflies = sObj.fireflies;
    }
    if (typeof sObj.activeSkin === 'string') {
      state.activeSkin = sObj.activeSkin;
    }
    if (Array.isArray(sObj.unlockedSkins)) {
      state.unlockedSkins = sObj.unlockedSkins;
    }
    if (typeof sObj.storyIntroSeen === 'boolean') {
      state.storyIntroSeen = sObj.storyIntroSeen;
    }
  }
} catch (e) {}

const FROG_SKINS = {
  emerald: {
    id: 'emerald', name: 'Emerald', icon: '🐸', cost: 0,
    headHex: 0x10b981, torsoHex: 0x059669, shadowHex: 0x047857, bellyHex: 0x34d399, sacHex: 0x6ee7b7
  },
  cobalt: {
    id: 'cobalt', name: 'Cobalt Dart', icon: '💎', cost: 5,
    headHex: 0x3b82f6, torsoHex: 0x1d4ed8, shadowHex: 0x1e3a8a, bellyHex: 0x38bdf8, sacHex: 0x7dd3fc
  },
  shogun: {
    id: 'shogun', name: 'Gold Shogun', icon: '👑', cost: 12,
    headHex: 0xf59e0b, torsoHex: 0xd97706, shadowHex: 0x92400e, bellyHex: 0xfde047, sacHex: 0xfef08a
  },
  abyss: {
    id: 'abyss', name: 'Bio-Abyss', icon: '🪼', cost: 20,
    headHex: 0x8b5cf6, torsoHex: 0x6d28d9, shadowHex: 0x4c1d95, bellyHex: 0x2dd4bf, sacHex: 0x99f6e4
  },
  sakura: {
    id: 'sakura', name: 'Sakura', icon: '🌸', cost: 30,
    headHex: 0xf472b6, torsoHex: 0xdb2777, shadowHex: 0x9d174d, bellyHex: 0xfbcfe8, sacHex: 0xfce7f3
  }
};

function persistSettings() {
  try {
    localStorage.setItem('froggit_settings_v3', JSON.stringify({
      muted: audio.muted,
      masterVolume: audio.masterVolume,
      sfxVolume: audio.sfxVolume,
      lethalOneHitMode: state.lethalOneHitMode,
      showHudGuide: state.showHudGuide,
      fireflies: state.fireflies,
      activeSkin: state.activeSkin,
      unlockedSkins: state.unlockedSkins,
      storyIntroSeen: state.storyIntroSeen
    }));
  } catch (e) {}
}

function isAnyModalOpen() {
  return ['map-modal', 'pause-modal', 'leaderboard-modal', 'howto-modal', 'scorecard-modal', 'victory-modal'].some((id) => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });
}

function ensurePlayerName() {
  const raw = document.getElementById('input-player-name').value.trim().toUpperCase();
  if (raw) {
    state.playerName = raw;
  } else if (!state.playerName) {
    state.playerName = NICKNAME_POOL[Math.floor(Math.random() * NICKNAME_POOL.length)];
    document.getElementById('input-player-name').value = state.playerName;
  }
  try {
    localStorage.setItem('froggit_player_name_v3', state.playerName);
  } catch (e) {}
}

function recordScoreToLeaderboard() {
  ensurePlayerName();
  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
  if (state.score > 0) {
    state.leaderboard.push({
      name: state.playerName,
      score: state.score,
      floor: floorCfg.code
    });
    state.leaderboard.sort((a, b) => b.score - a.score);
    state.leaderboard = state.leaderboard.slice(0, 8);
    state.highScore = state.leaderboard[0].score;
    state.highScoreHolder = state.leaderboard[0].name;
    try {
      localStorage.setItem('froggit_leaderboard_v5', JSON.stringify(state.leaderboard));
    } catch (e) {}
  }
  renderLeaderboardUI();
}

function renderLeaderboardUI() {
  document.getElementById('landing-highscore-val').textContent = state.highScore.toLocaleString();
  document.getElementById('landing-highscore-holder').textContent = state.highScoreHolder;

  // Compact Top-3 Preview in Settings
  const top3El = document.getElementById('pause-leaderboard-list');
  if (top3El) {
    const top3 = state.leaderboard.slice(0, 3);
    top3El.innerHTML = top3.map((item, idx) => `
      <div class="flex items-center justify-between py-1 px-2.5 rounded border border-white/8 ${idx === 0 ? 'bg-amber-400/12 text-amber-200 font-semibold' : 'text-slate-300'}">
        <span class="truncate">#${idx + 1} ${item.name} <span class="text-[10px] text-slate-400">(${item.floor})</span></span>
        <span class="font-mono-num">${item.score.toLocaleString()}</span>
      </div>
    `).join('');
  }

  // Full Leaderboard Modal List
  const fullEl = document.getElementById('full-leaderboard-list');
  if (fullEl) {
    fullEl.innerHTML = state.leaderboard.map((item, idx) => `
      <div class="flex items-center justify-between py-2 px-3 rounded-lg border border-white/10 ${idx === 0 ? 'bg-amber-400/15 text-amber-200 font-semibold border-amber-400/30' : 'bg-white/5 text-slate-200'}">
        <div class="flex items-center gap-2.5">
          <span class="font-mono-num text-xs w-6 text-slate-400">#${idx + 1}</span>
          <span class="font-semibold">${item.name}</span>
          <span class="font-mono-num text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 border border-white/10">${item.floor}</span>
        </div>
        <span class="font-mono-num font-bold text-sm">${item.score.toLocaleString()}</span>
      </div>
    `).join('');
  }
}
