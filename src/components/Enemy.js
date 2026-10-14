import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ENEMY_SCALE = 40; // half of the 90% fill
export const ENEMY_RADIUS = 28;
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

export function updateEnemy(enemy, target, speed, delta) {
  const dir = new THREE.Vector3()
    .subVectors(target.position, enemy.position);
  dir.z = 0;
  dir.normalize();
  enemy.position.addScaledVector(dir, speed * delta);
  // Face the target: rotate the tipped model's yaw (not the group — the group z-spin
  // would roll the bee). Stinger/face heads toward the player.
  const model = enemy.userData?.model;
  if (model) {
    model.rotation.y = YAW_OFFSET + Math.atan2(dir.y, dir.x);
  }
}
