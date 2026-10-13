import * as THREE from 'three';

export function createRenderer() {
  const canvas = document.querySelector('canvas.game');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  // Render at native device resolution — without this, high-DPI displays upscale a blurry canvas.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}
