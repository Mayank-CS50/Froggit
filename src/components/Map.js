import * as THREE from 'three';

const FLOOR_SIZE = 800;

export function createMap() {
  const group = new THREE.Group();

  // Checkerboard: 2x2 canvas (two dark, two light squares), tiled with nearest filtering.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillRect(1, 1, 1, 1);
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(1, 0, 1, 1);
  ctx.fillRect(0, 1, 1, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);

  // PlaneGeometry already lies in the XY plane facing +Z — our ground in this Z-up world.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
  group.add(floor);

  return group;
}
