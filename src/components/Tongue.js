import * as THREE from 'three';
import { faceDirection, getFacing } from './Player.js';

export const TONGUE_RANGE = 220;
const EXTEND_TIME = 0.14; // s — the lunge
const REEL_TIME = 0.16; // s — pulling the bee back
const FLICK_TIME = 0.12; // s — a miss still flicks
const FLICK_DISTANCE = 90;
const TONGUE_RADIUS = 6;
const MOUTH_HEIGHT = 25;
const TONGUE_COLOR = 0xff69b4;
const UP = new THREE.Vector3(0, 1, 0);

export function createTongue() {
  const material = new THREE.MeshBasicMaterial({ color: TONGUE_COLOR });
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(TONGUE_RADIUS, TONGUE_RADIUS, 1, 8),
    material,
  );
  const tip = new THREE.Mesh(new THREE.SphereGeometry(TONGUE_RADIUS * 1.3, 8, 8), material);
  const group = new THREE.Group();
  group.add(rod, tip);
  group.visible = false;
  return { group, rod, tip, state: null };
}

export function tongueActive(tongue) {
  return tongue.state !== null;
}

// Fire at the nearest bee in range; snaps the frog to face it. No bee → flick.
// Returns the target bee, or null on a miss.
export function fireTongue(tongue, player, enemies) {
  if (tongue.state) return null;

  const mouth = mouthPos(player);
  let best = null;
  let bestDist = TONGUE_RANGE;
  for (const enemy of enemies) {
    const d = Math.hypot(enemy.position.x - mouth.x, enemy.position.y - mouth.y);
    if (d < bestDist) {
      best = enemy;
      bestDist = d;
    }
  }

  if (best) {
    faceDirection(
      player,
      best.position.x - player.position.x,
      best.position.y - player.position.y,
    );
    tongue.state = { phase: 'extend', t: 0, target: best };
    return best;
  }

  tongue.state = { phase: 'flick', t: 0, dir: getFacing(player) };
  return null;
}

// Animates extend → grab → reel → eat. speedFactor shrinks the cycle as difficulty rises.
// onGrab(bee): the bee is latched — remove it from the enemies array.
// onEat(bee): swallowed — remove from scene, award score.
export function updateTongue(tongue, player, delta, speedFactor, { onGrab, onEat }) {
  const state = tongue.state;
  if (!state) return;

  const mouth = mouthPos(player);
  const phaseTime =
    state.phase === 'extend' ? EXTEND_TIME : state.phase === 'reel' ? REEL_TIME : FLICK_TIME;
  state.t = Math.min(1, state.t + (delta * speedFactor) / phaseTime);
  const t = state.t;
  let tipPos;

  if (state.phase === 'extend') {
    const e = t * (2 - t); // ease-out: fast lunge
    tipPos = new THREE.Vector3().lerpVectors(mouth, state.target.position, e);
    if (t >= 1) {
      onGrab(state.target);
      state.phase = 'reel';
      state.t = 0;
      state.grabPos = state.target.position.clone();
    }
  } else if (state.phase === 'reel') {
    tipPos = new THREE.Vector3().lerpVectors(state.grabPos, mouth, t);
    state.target.position.copy(tipPos);
    if (t >= 1) {
      tongue.state = null;
      tongue.group.visible = false;
      onEat(state.target);
      return;
    }
  } else {
    // Flick: out and back on one sine.
    tipPos = mouth.clone().addScaledVector(state.dir, FLICK_DISTANCE * Math.sin(t * Math.PI));
    if (t >= 1) {
      tongue.state = null;
      tongue.group.visible = false;
      return;
    }
  }

  drawTongue(tongue, mouth, tipPos);
}

// Kill any in-flight tongue (game over / reset).
export function clearTongue(tongue) {
  tongue.state = null;
  tongue.group.visible = false;
}

function mouthPos(player) {
  return new THREE.Vector3(player.position.x, player.position.y, MOUTH_HEIGHT);
}

function drawTongue(tongue, from, to) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const dist = dir.length();
  tongue.group.visible = true;
  tongue.rod.position.copy(from).addScaledVector(dir, 0.5);
  tongue.rod.scale.set(1, Math.max(dist, 0.001), 1);
  if (dist > 0.001) tongue.rod.quaternion.setFromUnitVectors(UP, dir.normalize());
  tongue.tip.position.copy(to);
}
