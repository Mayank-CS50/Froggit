import * as THREE from 'three';
import './style.css';
import { createPlayer, updatePlayer, startHop, PLAYER_RADIUS, MOVE_SPEED } from './components/Player.js';
import { createCamera } from './components/Camera.js';
import { createRenderer } from './components/Renderer.js';
import { createMap } from './components/Map.js';
import { createHouses } from './components/House.js';
import { createEnemy, updateEnemy, ENEMY_RADIUS, ENEMY_SPEED } from './components/Enemy.js';
import { createTongue, fireTongue, updateTongue, tongueActive, clearTongue, TONGUE_RANGE } from './components/Tongue.js';
import { createCombo, registerEat, updateCombo, comboMultiplier, COMBO_WINDOW } from './components/Combo.js';
import { sound } from './components/Audio.js';
import { createParticles, spawnBurst, updateParticles } from './components/Particles.js';

const SPAWN_LOCATIONS = [
  new THREE.Vector3(-1010, -1010, 0),
  new THREE.Vector3(1010, -1010, 0),
  new THREE.Vector3(-1010, 1010, 0),
  new THREE.Vector3(1010, 1010, 0),
];
const SPAWN_DELAY = 2; // seconds, base
const SCORE_PER_SECOND = 0.1;
const SCORE_PER_KILL = 10;
const DIFFICULTY_GROWTH = 0.02; // difficulty factor per score point
const FLOOR_LIMIT = 1040; // keep entities on the board (floor is 2100 wide)
const HIGH_SCORE_KEY = 'froggit-highscore';

// Scene
const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);
// Soft sky/ground fill from above — brightens the frog's back like the reference render.
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x228B22, 1.2);
scene.add(hemisphereLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(-100, -100, 200);
scene.add(directionalLight);

const map = createMap();
scene.add(map);
const houses = createHouses();
scene.add(houses.group);

const player = createPlayer();
scene.add(player);
const playerStart = new THREE.Vector3(0, 0, 0);

const camera = createCamera();
player.add(camera);

const renderer = createRenderer();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const tongue = createTongue();
scene.add(tongue.group);

const combo = createCombo();
const particles = createParticles();
scene.add(particles.group);

const DEFAULT_CAMERA_POS = new THREE.Vector3(700, -700, 700);
let cameraTrauma = 0;
let hitStop = 0;
let evolutionStage = 1; // 1: 0-4 bees, 2: 5-9 bees, 3: 10+ bees

// Score UI
const scoreDiv = document.createElement('div');
scoreDiv.className = 'score';
scoreDiv.textContent = '0';
document.body.appendChild(scoreDiv);

// High score (survives restarts; localStorage)
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
const highScoreDiv = document.createElement('div');
highScoreDiv.className = 'highscore';
highScoreDiv.textContent = '🏆 ' + highScore;
document.body.appendChild(highScoreDiv);

// Combo UI
const comboDiv = document.createElement('div');
comboDiv.className = 'combo';
comboDiv.style.display = 'none';
document.body.appendChild(comboDiv);

// Start prompt
const startPrompt = document.createElement('div');
startPrompt.className = 'start-prompt';
startPrompt.textContent = 'FROGGIT — press SPACE to start, arrows to hop';
document.body.appendChild(startPrompt);

// Stage banner (Evolution announcement)
const stageBanner = document.createElement('div');
stageBanner.className = 'stage-banner';
stageBanner.innerHTML = '<div class="title"></div><div class="subtitle"></div>';
document.body.appendChild(stageBanner);
let stageBannerTimer = 0;

function showStageBanner(title, subtitle) {
  stageBanner.querySelector('.title').textContent = title;
  stageBanner.querySelector('.subtitle').textContent = subtitle;
  stageBanner.classList.add('show');
  stageBannerTimer = 2.8;
}

// Game state
let enemies = [];
let score = 0;
let spawnTimer = 0;
let gameOver = false;
let started = false;
const clock = new THREE.Clock();

// Input
window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  if (event.code === 'Space') {
    event.preventDefault();
    if (gameOver) resetGame();
    else if (!started) startGame();
    else if (!tongueActive(tongue)) {
      fireTongue(tongue, player, enemies);
      sound.tongueFire();
    }
    return;
  }
  if (!started || gameOver) return;
  if (startHop(player, event.code)) {
    sound.hop();
  }
});

// Game flow
function startGame() {
  started = true;
  startPrompt.remove();
  clock.start();
  spawnTimer = SPAWN_DELAY; // spawn first wave promptly
}

function resetGame() {
  player.position.copy(playerStart);
  player.userData.move = null;
  player.userData.queue.length = 0;
  player.userData.baseScale = 112;
  if (player.userData.model) {
    player.userData.model.scale.setScalar(112);
  }
  player.visible = true;
  enemies.forEach((e) => scene.remove(e));
  enemies = [];
  score = 0;
  beesEaten = 0;
  evolutionStage = 1;
  cameraTrauma = 0;
  hitStop = 0;
  stageBanner.classList.remove('show');
  gameOver = false;
  spawnTimer = SPAWN_DELAY;
  combo.count = 0;
  combo.timer = 0;
  clearTongue(tongue);
  hideOverlay();
  clock.start();
}

// Game over overlay
let overlay = null;
function showOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'game-over';
  const eaten = beesEaten;
  overlay.innerHTML =
    'GAME OVER<br><span>' +
    (eaten === 0
      ? 'SQUISHED. Zero bees eaten.'
      : eaten < 10
        ? 'The hive remembers you. ' + eaten + ' bees eaten.'
        : 'A legend among frogs. ' + eaten + ' bees eaten.') +
    '<br>Score ' + Math.floor(score) + ' · Best ' + Math.floor(highScore) +
    '<br>Press SPACE to restart</span>';
  document.body.appendChild(overlay);
}
function hideOverlay() {
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
}

// Difficulty scaling (per spec: enemies scale faster than the player)
function difficulty() {
  return 1 + Math.floor(score) * DIFFICULTY_GROWTH;
}

// Collision helpers — circle vs circle (rounded characters, not raw boxes)
function circleHit(a, b, minDist) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < minDist * minDist;
}

function hitsHouse(pos, radius) {
  const p = new THREE.Vector3(pos.x, pos.y, 0);
  for (const box of houses.colliders) {
    // Closest point on the box to the circle center.
    const cx = Math.max(box.min.x, Math.min(p.x, box.max.x));
    const cy = Math.max(box.min.y, Math.min(p.y, box.max.y));
    const dx = p.x - cx;
    const dy = p.y - cy;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

// Spawning
function spawnEnemy() {
  const loc = SPAWN_LOCATIONS[Math.floor(Math.random() * SPAWN_LOCATIONS.length)];
  const enemy = createEnemy(loc);
  scene.add(enemy);
  enemies.push(enemy);
}

// ---- Tongue callbacks ----
let beesEaten = 0;

function onGrab(bee) {
  const i = enemies.indexOf(bee);
  if (i !== -1) enemies.splice(i, 1); // latched bees stop being live threats
  sound.grab();
}

function onEat(bee) {
  scene.remove(bee);
  beesEaten++;
  const mult = registerEat(combo);
  const gained = SCORE_PER_KILL * mult;
  score += gained;
  sound.eat();
  if (mult > 1) {
    sound.combo(mult);
    comboDiv.classList.remove('pop');
    void comboDiv.offsetWidth;
    comboDiv.classList.add('pop');
  }

  // Hit-stop: 50ms tactile micro-pause on swallow
  hitStop = 0.05;

  // Camera trauma shake: Vlambeer formula
  cameraTrauma = Math.min(1, cameraTrauma + 0.45);

  // Pollen particle burst at bee position
  spawnBurst(particles, bee.position, 24);

  // Agar.io-style sub-perceptual growth (+2% per bee, capped at +40%)
  const growth = 1 + Math.min(0.40, beesEaten * 0.02);
  const newScale = 112 * growth;
  player.userData.baseScale = newScale;
  if (player.userData.model) {
    player.userData.model.scale.setScalar(newScale);
  }

  // Evolution stage check
  const prevStage = evolutionStage;
  if (beesEaten >= 10) {
    evolutionStage = 3;
  } else if (beesEaten >= 5) {
    evolutionStage = 2;
  }

  if (evolutionStage > prevStage) {
    if (evolutionStage === 2) {
      showStageBanner('Stage 2: The Bees Notice', 'Nearby bees panic & flee from your bulk!');
    } else if (evolutionStage === 3) {
      showStageBanner('Stage 3: The Hive Trembles', 'Apex predator! The entire swarm scatters!');
    }
  }

  popup('+' + gained + (mult > 1 ? '  x' + mult : ''), player.position);
}

// ---- Score popups (HTML, rise + fade, Doodle-style) ----
const popups = [];
function popup(text, pos) {
  const el = document.createElement('div');
  el.className = 'score-popup';
  el.textContent = text;
  document.body.appendChild(el);
  // Project world → screen. Camera is a child of the player and moves with it.
  const v = pos.clone();
  v.setZ(50);
  v.project(camera);
  el.style.left = ((v.x + 1) / 2) * window.innerWidth + 'px';
  el.style.top = ((1 - (v.y + 1) / 2) * window.innerHeight) + 'px';
  popups.push({ el, t: 0 });
}

function updatePopups(delta) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.t += delta;
    p.el.style.opacity = String(1 - p.t);
    p.el.style.transform = 'translate(-50%, -50%) translateY(' + -60 * p.t + 'px) scale(' + (1 + Math.min(p.t, 0.3)) + ')';
    if (p.t >= 1) {
      p.el.remove();
      popups.splice(i, 1);
    }
  }
}

// Main loop
renderer.setAnimationLoop(() => {
  const delta = Math.min(clock.getDelta(), 0.1);

  // Hit-stop: freeze game state updates during impact while keeping particle simulation alive
  if (hitStop > 0) {
    hitStop -= delta;
    updateParticles(particles, delta);
    renderer.render(scene, camera);
    return;
  }

  if (stageBannerTimer > 0) {
    stageBannerTimer -= delta;
    if (stageBannerTimer <= 0) {
      stageBanner.classList.remove('show');
    }
  }

  if (started && !gameOver) {
    // Score: survival
    score += delta * SCORE_PER_SECOND;
    scoreDiv.textContent = String(Math.floor(score));

    // Difficulty
    const diff = difficulty();

    // Spawning (accumulated timer)
    spawnTimer -= delta;
    if (spawnTimer <= 0) {
      spawnEnemy();
      spawnTimer = Math.max(0.3, SPAWN_DELAY / diff);
    }

    // Player movement — one keypress = one queued hop (spec behavior)
    updatePlayer(player, delta, MOVE_SPEED * (1 + (diff - 1) * 0.5), canPlayerMoveTo);

    // Tongue animation (grab → reel → eat)
    updateTongue(tongue, player, delta, 1 + (diff - 1) * 0.4, { onGrab, onEat });

    // Combo window + UI
    updateCombo(combo, delta);
    if (combo.count >= 2) {
      comboDiv.style.display = 'block';
      comboDiv.textContent = 'COMBO x' + combo.count;
      comboDiv.style.opacity = String(Math.min(1, combo.timer / 0.4));
    } else {
      comboDiv.style.display = 'none';
    }

    // Enemy movement + collisions with Stage Flee AI
    const enemySpeed = ENEMY_SPEED * diff;
    for (const enemy of enemies) {
      const next = enemy.position.clone();
      updateEnemy({ position: next }, player, enemySpeed, delta, evolutionStage);

      // Enemy vs enemy: only move if clear
      let blocked = false;
      for (const other of enemies) {
        if (other === enemy) continue;
        if (circleHit(next, other.position, ENEMY_RADIUS * 2)) {
          blocked = true;
          break;
        }
      }
      // Enemy vs house
      if (!blocked && hitsHouse(next, ENEMY_RADIUS)) blocked = true;

      // Enemy vs player => game over (priority)
      if (circleHit(next, player.position, ENEMY_RADIUS + PLAYER_RADIUS)) {
        endGame();
        return;
      }

      if (!blocked) {
        enemy.position.copy(next);
        updateEnemy({ position: enemy.position, userData: enemy.userData }, player, 0, 0, evolutionStage); // face only
      }
    }

    updatePopups(delta);
  }

  // Camera trauma shake: Vlambeer decay formula
  if (cameraTrauma > 0) {
    cameraTrauma = Math.max(0, cameraTrauma - delta * 3.5);
    const shake = cameraTrauma * cameraTrauma;
    const maxOffset = 7.0;
    camera.position.x = DEFAULT_CAMERA_POS.x + (Math.random() * 2 - 1) * maxOffset * shake;
    camera.position.y = DEFAULT_CAMERA_POS.y + (Math.random() * 2 - 1) * maxOffset * shake;
    camera.position.z = DEFAULT_CAMERA_POS.z + (Math.random() * 2 - 1) * maxOffset * shake;
  } else {
    camera.position.copy(DEFAULT_CAMERA_POS);
  }

  updateParticles(particles, delta);
  renderer.render(scene, camera);
});

function endGame() {
  gameOver = true;
  sound.gameOver();
  clearTongue(tongue);
  player.visible = false;
  if (Math.floor(score) > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    highScoreDiv.textContent = '🏆 ' + highScore;
  }
  showOverlay();
}

// Landing-spot validation for player hops: clear of enemies, houses, and inside the floor.
function canPlayerMoveTo(target) {
  if (Math.abs(target.x) > FLOOR_LIMIT || Math.abs(target.y) > FLOOR_LIMIT) return false;
  if (hitsHouse(target, PLAYER_RADIUS)) return false;
  for (const enemy of enemies) {
    if (circleHit(target, enemy.position, ENEMY_RADIUS + PLAYER_RADIUS)) return false;
  }
  return true;
}
// In src/main.js

import { SFX } from './components/Audio.js';

// --- Cinematic Constants ---
const DEFAULT_FOV = 50;
const CINEMATIC_TARGET_FOV = 28;
const CINEMATIC_DURATION = 0.55; // seconds

let gameState = 'PLAYING'; // 'PLAYING' | 'GAMEOVER_CINEMATIC' | 'GAMEOVER'
let cinematicTimer = 0;
let initialCameraPos = new THREE.Vector3();
let initialLookAt = new THREE.Vector3();
let cameraLookAtTarget = new THREE.Vector3();

// --- Inside your Collision / Defeat handler ---
function onPlayerDefeated() {
  if (gameState !== 'PLAYING') return;

  gameState = 'GAMEOVER_CINEMATIC';
  cinematicTimer = 0;

  // 1. Play procedural game-over audio
  SFX.gameOver();

  // 2. Snapshot current camera position and target
  initialCameraPos.copy(camera.position);
  initialLookAt.set(player.position.x, player.position.y, 0);
  cameraLookAtTarget.copy(initialLookAt);
}

// --- Inside your main animate/update loop ---
function update(delta) {
  // Always update particles for smooth ambient decay
  particleSystem.update(delta);

  if (gameState === 'PLAYING') {
    // 1. Check hit-stop freeze from swallow
    if (hitStopTimer > 0) {
      hitStopTimer -= delta;
      return;
    }

    // 2. Update player & enemies
    player.update(delta);
    enemies.forEach(bee => bee.update(delta, player, evolutionStage));
    tongue.update(delta, player, enemies);

    // 3. Collision Check: Bee touching Tode
    for (const bee of enemies) {
      const dist = player.position.distanceTo(bee.position);
      if (dist < PLAYER_RADIUS + ENEMY_RADIUS) {
        onPlayerDefeated();
        break;
      }
    }

  } else if (gameState === 'GAMEOVER_CINEMATIC') {
    cinematicTimer += delta;
    const p = Math.min(1.0, cinematicTimer / CINEMATIC_DURATION);
    const ease = p * p * (3 - 2 * p); // smoothstep

    // A. Lerp FOV from 50 to 28 (smooth push into Tode's face)
    camera.fov = THREE.MathUtils.lerp(DEFAULT_FOV, CINEMATIC_TARGET_FOV, ease);
    camera.updateProjectionMatrix();

    // B. Smoothly pan camera focus to Tode's face (Z: MOUTH_HEIGHT = 35)
    const todeFacePos = new THREE.Vector3(
      player.position.x,
      player.position.y,
      35
    );
    cameraLookAtTarget.lerpVectors(initialLookAt, todeFacePos, ease);
    camera.lookAt(cameraLookAtTarget);

    // C. Deflate Tode's posture
    player.deflate(p);

    // D. Cinematic complete -> Display Scorecard
    if (p >= 1.0) {
      gameState = 'GAMEOVER';
      showScorecard();
    }
  }

  // Camera trauma shake (Vlambeer juice)
  updateCameraShake(camera, defaultCamPos, delta);
}

// --- Scorecard Presentation ---
function showScorecard() {
  const scorecardEl = document.getElementById('scorecard-modal');
  document.getElementById('final-score').textContent = score;
  document.getElementById('bees-eaten').textContent = beesEaten;
  document.getElementById('max-combo').textContent = `${maxCombo}x`;

  let stageName = 'Stage 1: Tadpole';
  if (beesEaten >= 10) stageName = 'Stage 3: The Hive Trembles';
  else if (beesEaten >= 5) stageName = 'Stage 2: The Bees Notice';
  document.getElementById('highest-stage').textContent = stageName;

  scorecardEl.classList.remove('hidden');
}

// --- Reset / Play Again ---
function restartGame() {
  gameState = 'PLAYING';
  cinematicTimer = 0;

  // Reset Camera
  camera.fov = DEFAULT_FOV;
  camera.updateProjectionMatrix();
  camera.position.copy(defaultCamPos);
  camera.lookAt(0, 0, 0);

  // Reset Player & Entities
  player.resetDefeat();
  player.resetPosition();
  resetEnemies();
  resetScoreAndCombos();

  // Hide Scorecard
  document.getElementById('scorecard-modal').classList.add('hidden');
}

// Listen for retry keys
window.addEventListener('keydown', (e) => {
  if (gameState === 'GAMEOVER' && (e.code === 'KeyR' || e.code === 'Space')) {
    restartGame();
  }
});