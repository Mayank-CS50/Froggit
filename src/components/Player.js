import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_SCALE = 112; // ~80% of a 140 cell cube — solid heroic presence filling the tile
// The model is tipped rotation.x = π/2 (Y-up → Z-up), so facing is YAW = rotation.y,
// not rotation.z (which rolls the frog on its side). glTF models face +Z; after the
// tip the nose heads −Y, so +π/2 lines it up with the travel direction.
// Calibration: if Tode faces 90° off while hopping, change this to 0 or −π/2.
const MODEL_YAW_OFFSET = Math.PI / 2;

export const PLAYER_RADIUS = 56; // half of the ~112-wide frog
export const MOVE_SPEED = 5; // hops per second (~0.2s hop, Crossy Road timing)
export const JUMP_HEIGHT = 45; // snappy arc (0.32 ratio against 140 cell)
export const JUMP_DISTANCE = 140;

// Map arrow keys to unit direction vectors in the XY plane.
const DIRECTIONS = {
  ArrowUp: new THREE.Vector3(0, 1, 0),
  ArrowDown: new THREE.Vector3(0, -1, 0),
  ArrowLeft: new THREE.Vector3(-1, 0, 0),
  ArrowRight: new THREE.Vector3(1, 0, 0),
};

export function createPlayer() {
  const group = new THREE.Group();

  new GLTFLoader().load('models/tode.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.setScalar(MODEL_SCALE);
    model.rotation.x = Math.PI / 2;
    // glTF models are Y-up; rotating to this Z-up world. Sit flush on the ground:
    // shift up by the lowest z of the rotated, scaled model.
    const box = new THREE.Box3().setFromObject(model);
    model.position.z = -box.min.z;
    group.add(model);
    group.userData.model = model;
    group.userData.baseScale = MODEL_SCALE;
  });

  group.userData.queue = [];
  group.userData.move = null; // { start, target, progress }

  return group;
}

export function updatePlayer(player, delta, moveSpeed, canMoveTo) {
  const { queue } = player.userData;

  // Start the next queued hop when idle — validate the landing spot first.
  if (!player.userData.move && queue.length > 0) {
    const dir = queue[0];
    const target = player.position.clone().addScaledVector(dir, JUMP_DISTANCE);
    if (canMoveTo && !canMoveTo(target, PLAYER_RADIUS)) {
      queue.shift(); // drop the blocked hop
    } else {
      player.userData.move = {
        dir: queue.shift(),
        startPos: player.position.clone(),
        progress: 0,
      };
    }
  }

  const current = player.userData.move;
  if (!current) return;

  current.progress = Math.min(1, current.progress + delta * moveSpeed);
  const p = current.progress;

  player.position.x = current.startPos.x + current.dir.x * JUMP_DISTANCE * p;
  player.position.y = current.startPos.y + current.dir.y * JUMP_DISTANCE * p;
  player.position.z = Math.sin(p * Math.PI) * JUMP_HEIGHT;

  const model = player.userData.model;

  // Crossy Road squash & stretch with volume preservation:
  // Apex (p ~ 0.5): vertically stretched (local Y), horizontally slimmed
  // Takeoff/Landing (p ~ 0 / 1): slight ground impact squash
  if (model) {
    const baseScale = player.userData.baseScale || MODEL_SCALE;
    const stretch = Math.sin(p * Math.PI); // 0 at ground, 1 at peak
    const yFactor = 1 + stretch * 0.22 - (1 - stretch) * 0.08;
    const xzFactor = 1 / Math.sqrt(Math.max(0.1, yFactor));
    model.scale.set(baseScale * xzFactor, baseScale * yFactor, baseScale * xzFactor);
  }

  // Rotate the model (not the group — camera is a child) to face travel direction —
  // unless the tongue has locked the head on a target.
  if (player.userData.facingLock > 0) {
    player.userData.facingLock -= delta;
  } else if (model && (current.dir.x !== 0 || current.dir.y !== 0)) {
    model.rotation.y = MODEL_YAW_OFFSET + Math.atan2(current.dir.y, current.dir.x);
  }

  if (p >= 1) {
    player.userData.move = null;
    player.position.z = 0;
    if (model) {
      const baseScale = player.userData.baseScale || MODEL_SCALE;
      model.scale.setScalar(baseScale);
    }
  }
}

export function startHop(player, key) {
  const dir = DIRECTIONS[key];
  if (!dir) return false;
  // Crossy Road single-buffer pattern: cap queue at 1 to eliminate input pileup and lag
  if (player.userData.queue.length >= 1) return false;
  player.userData.queue.push(dir);
  return true;
}

// Snap the model to face a world direction (dx, dy) — used by the tongue targeting.
export function faceDirection(player, dx, dy) {
  const model = player.userData.model;
  if (model) model.rotation.y = MODEL_YAW_OFFSET + Math.atan2(dy, dx);
}

// Unit vector of current facing in the XY plane (fallback: +X).
export function getFacing(player) {
  const model = player.userData.model;
  if (!model) return new THREE.Vector3(1, 0, 0);
  const a = model.rotation.y - MODEL_YAW_OFFSET;
  return new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
}

// Hold the current facing for the next `seconds` — the tongue locks the head
// on its target so hop turning doesn't yank it mid-eat.
export function lockFacing(player, seconds) {
  player.userData.facingLock = seconds;
}
// In src/components/Player.js

export class Player {
  // ... existing constructor & methods ...

  /**
   * Applies the Google Doodle-style defeat deflation expression.
   * @param {number} p Progress from 0.0 (fresh defeat) to 1.0 (fully deflated)
   */
  deflate(p) {
    // Smoothstep easing for organic deflation
    const ease = p * p * (3 - 2 * p);

    // Deflate vertically (-35%) and slightly spread horizontally (+15%)
    const zDeflate = 1.0 - 0.35 * ease;
    const xySpread = 1.0 + 0.15 * ease;

    if (this.mesh) {
      this.mesh.scale.set(
        this.baseScale * xySpread,
        this.baseScale * xySpread,
        this.baseScale * zDeflate
      );

      // Tilt forward slightly in defeat
      this.mesh.rotation.x = 0.25 * ease;
    }
  }

  /**
   * Resets Tode's transform and posture for a fresh run.
   */
  resetDefeat() {
    if (this.mesh) {
      this.mesh.scale.set(this.baseScale, this.baseScale, this.baseScale);
      this.mesh.rotation.set(0, 0, 0);
    }
  }
}