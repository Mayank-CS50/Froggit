import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const HOUSE_SCALE = 63; // half of the 90% fill
const HOUSE_COUNT = 3;
// Keep houses inside the floor and clear of the corner spawn areas.
const MIN_POS = -820;
const MAX_POS = 820;

const loader = new GLTFLoader();

export function createHouses(onReady) {
  const group = new THREE.Group();
  const colliders = [];

  for (let i = 0; i < HOUSE_COUNT; i++) {
    loader.load('models/small_house.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(HOUSE_SCALE);
      model.rotation.x = Math.PI / 2;
      model.rotation.y = Math.PI / 2 * Math.floor(Math.random() * 4);

      const pos = new THREE.Vector3(
        rand(MIN_POS, MAX_POS),
        rand(MIN_POS, MAX_POS),
        0,
      );
      model.position.copy(pos);
      // Sit flush on the ground: shift up by the lowest z of the rotated, scaled model.
      const box = new THREE.Box3().setFromObject(model);
      model.position.z = -box.min.z;

      group.add(model);
      // Recompute after the z correction; world box for collision.
      colliders.push(new THREE.Box3().setFromObject(model));
      if (onReady && colliders.length === HOUSE_COUNT) onReady();
    });
  }

  return { group, colliders };
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}
