import * as THREE from 'three';
import './style.css';
import { createPlayer, updatePlayer, startHop, PLAYER_RADIUS, MOVE_SPEED } from './components/Player.js';
import { createCamera } from './components/Camera.js';
import { createRenderer } from './components/Renderer.js';
import { createMap } from './components/Map.js';
import { createHouses } from './components/House.js';
import { createEnemy, updateEnemy, ENEMY_RADIUS, ENEMY_SPEED } from './components/Enemy.js';
import { createAttackVisual, triggerAttack, updateAttackVisual, ATTACK_COOLDOWN } from './components/Attack.js';

const SPAWN_LOCATIONS = [
  new THREE.Vector3(-380, -380, 0),
  new THREE.Vector3(380, -380, 0),
  new THREE.Vector3(-380, 380, 0),
  new THREE.Vector3(380, 380, 0),
];
const SPAWN_DELAY = 2; // seconds, base
const SCORE_PER_SECOND = 0.1;
const SCORE_PER_KILL = 10;
const DIFFICULTY_GROWTH = 0.02; // difficulty factor per score point
const FLOOR_LIMIT = 390; // keep entities on the board

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
const attackVisual = createAttackVisual();
scene.add(attackVisual);

// Score UI
const scoreDiv = document.createElement('div');
scoreDiv.className = 'score';
scoreDiv.textContent = '0';
document.body.appendChild(scoreDiv);

// Start prompt
const startPrompt = document.createElement('div');
startPrompt.className = 'start-prompt';
startPrompt.textContent = 'FROGGIT — press SPACE to start, arrows to hop';
document.body.appendChild(startPrompt);

// Game state
let enemies = [];
let score = 0;
let spawnTimer = 0;
let attackCooldown = 0;
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
    else if (attackCooldown <= 0) {
      attackCooldown = ATTACK_COOLDOWN;
      triggerAttack(player, attackVisual, enemies, (enemy) => {
        scene.remove(enemy);
        enemies.splice(enemies.indexOf(enemy), 1);
        score += SCORE_PER_KILL;
      });
    }
    return;
  }
  if (!started || gameOver) return;
  startHop(player, event.code);
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
  player.visible = true;
  enemies.forEach((e) => scene.remove(e));
  enemies = [];
  score = 0;
  gameOver = false;
  attackCooldown = 0;
  spawnTimer = SPAWN_DELAY;
  hideOverlay();
  clock.start();
}

// Game over overlay
let overlay = null;
function showOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'game-over';
  overlay.innerHTML = 'GAME OVER<br><span>Press SPACE to restart</span>';
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

// Main loop
renderer.setAnimationLoop(() => {
  const delta = Math.min(clock.getDelta(), 0.1);

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

    // Enemy movement + collisions
    const enemySpeed = ENEMY_SPEED * diff;
    for (const enemy of enemies) {
      const next = enemy.position.clone();
      updateEnemy({ position: next }, player, enemySpeed, delta);

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
        updateEnemy({ position: enemy.position, userData: enemy.userData }, player, 0, 0); // face only
      }
    }

    // Attack cooldown + visual fade
    attackCooldown = Math.max(0, attackCooldown - delta);
    updateAttackVisual(attackVisual, delta);
  }

  renderer.render(scene, camera);
});

function endGame() {
  gameOver = true;
  player.visible = false;
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
