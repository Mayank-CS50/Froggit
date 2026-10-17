import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ENEMY_SCALE = 28; // ~20% of a 140 cell cube — distinct flying insect prey, agile and swarming
export const ENEMY_RADIUS = 21;
export const ENEMY_SPEED = 130;
// Tipped model (rotation.x = π/2): rotate the inner model around ITS y-axis to face
// travel, same as the player fix. Same offset: glTF forward is +Z pre-tip; nose
// lands on −Y post-tip; π/2 realigns. Calibrate the same way if bees fly sideways.
const YAW_OFFSET = Math.PI / 2;

const loader = new GLTFLoader();

export function createEnemy(position) {
  const group = new THREE.Group();
  group.position.copy(position);

  loader.load('models/enemy.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.setScalar(ENEMY_SCALE);
    model.rotation.x = Math.PI / 2;
    const box = new THREE.Box3().setFromObject(model);
    model.position.z = -box.min.z;
    group.add(model);
    group.userData.model = model;
  });

  return group;
}

export function updateEnemy(enemy, target, speed, delta, stage = 1) {
  const toPlayer = new THREE.Vector3().subVectors(target.position, enemy.position);
  toPlayer.z = 0;
  const dist = toPlayer.length();

  let dir = toPlayer.clone().normalize();
  let currentSpeed = speed;

  // Pac-Man / Agar.io Flee AI: when Tode evolves to Stage 2 or 3, bees within danger range flee!
  if (stage >= 2 && dist < 420) {
    dir.negate();
    dir.x += (Math.random() - 0.5) * 0.25;
    dir.y += (Math.random() - 0.5) * 0.25;
    dir.normalize();
    currentSpeed = speed * (stage >= 3 ? 1.45 : 1.3);
  }

  enemy.position.addScaledVector(dir, currentSpeed * delta);
  // Face movement direction: rotate tipped model's yaw
  const model = enemy.userData?.model;
  if (model) {
    model.rotation.y = YAW_OFFSET + Math.atan2(dir.y, dir.x);
  }
}
