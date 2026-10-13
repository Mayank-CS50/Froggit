import * as THREE from 'three';

export const ATTACK_COOLDOWN = 1; // seconds
export const ATTACK_RADIUS = 150;

export function createAttackVisual() {
  const circle = new THREE.Mesh(
    new THREE.CircleGeometry(ATTACK_RADIUS, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffd400,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    }),
  );
  circle.visible = false;
  circle.position.z = 0.25;
  return circle;
}

export function triggerAttack(player, visual, enemies, onKill) {
  visual.visible = true;
  visual.material.opacity = 0.8;
  visual.position.set(player.position.x, player.position.y, 0.25);

  const pos2 = new THREE.Vector2(player.position.x, player.position.y);
  let killed = false;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i].position;
    if (pos2.distanceTo(new THREE.Vector2(e.x, e.y)) <= ATTACK_RADIUS) {
      onKill(enemies[i]);
      killed = true;
    }
  }
  return killed;
}

export function updateAttackVisual(visual, delta) {
  if (!visual.visible) return;
  visual.material.opacity -= delta * 4;
  if (visual.material.opacity <= 0) visual.visible = false;
}
