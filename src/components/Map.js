import * as THREE from 'three';

const FLOOR_SIZE = 800;
const CELL_SIZE = FLOOR_SIZE / 8; // matches JUMP_DISTANCE in Player.js — one hop = one box

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
  // 8 cells per axis (2-cell texture × 4 repeats) = 100-unit cells, exactly one
  // JUMP_DISTANCE — so every hop lands the frog centered in the next grid box.
  texture.repeat.set(4, 4);

  // PlaneGeometry already lies in the XY plane facing +Z — our ground in this Z-up world.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
  // Shift the pattern half a cell so (0,0) — the frog's start — is a cell CENTER,
  // and every 100-unit hop lands centered in the next box. Game logic untouched.
  floor.position.set(CELL_SIZE / 2, CELL_SIZE / 2, 0);
  group.add(floor);

  return group;
}
