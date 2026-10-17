import * as THREE from 'three';

// Lightweight particle burst system using THREE.Points for instant arcade juice
const MAX_PARTICLES = 160;

export function createParticles() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(MAX_PARTICLES * 3);
  const colors = new Float32Array(MAX_PARTICLES * 3);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 7,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  // Active particle objects pool
  const pool = [];

  return {
    group: points,
    pool,
    positions,
    colors,
    geometry,
  };
}

export function spawnBurst(system, origin, count = 22) {
  const { pool, positions, colors, geometry } = system;

  // Yellow, amber, and gold pollen colors
  const palette = [
    new THREE.Color(0xffd700), // Gold
    new THREE.Color(0xffaa00), // Amber
    new THREE.Color(0xffff66), // Bright Yellow
    new THREE.Color(0xff69b4), // Tongue Pink spark
  ];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 200;
    const c = palette[Math.floor(Math.random() * palette.length)];

    pool.push({
      x: origin.x,
      y: origin.y,
      z: origin.z + 10 + Math.random() * 15,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: 60 + Math.random() * 120,
      life: 0.35 + Math.random() * 0.15,
      maxLife: 0.5,
      color: c,
    });

    if (pool.length > MAX_PARTICLES) pool.shift();
  }
}

export function updateParticles(system, delta) {
  const { pool, positions, colors, geometry, group } = system;

  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.life -= delta;
    if (p.life <= 0) {
      pool.splice(i, 1);
      continue;
    }

    // Motion & gravity
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.z += p.vz * delta;
    p.vz -= 300 * delta; // gravity
  }

  // Update buffer geometry
  const posArr = geometry.attributes.position.array;
  const colArr = geometry.attributes.color.array;

  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (i < pool.length) {
      const p = pool[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      posArr[i * 3] = p.x;
      posArr[i * 3 + 1] = p.y;
      posArr[i * 3 + 2] = p.z;

      colArr[i * 3] = p.color.r * alpha;
      colArr[i * 3 + 1] = p.color.g * alpha;
      colArr[i * 3 + 2] = p.color.b * alpha;
    } else {
      // Offscreen parked
      posArr[i * 3] = 0;
      posArr[i * 3 + 1] = 0;
      posArr[i * 3 + 2] = -9999;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}
