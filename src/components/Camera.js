import * as THREE from 'three';

const FOV = 46; // wide board view
const FAR_PLANE = 9000;
const INITIAL_POSITION = new THREE.Vector3(500, -500, 500);

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    FAR_PLANE,
  );
  camera.up.set(0, 0, 1);
  camera.position.copy(INITIAL_POSITION);
  camera.lookAt(0, 0, 0);
  return camera;
}
