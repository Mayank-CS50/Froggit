import * as THREE from 'three';

const FOV = 30;
const FAR_PLANE = 9000;
const INITIAL_POSITION = new THREE.Vector3(300, -300, 300);

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
