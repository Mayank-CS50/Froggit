/**
 * THE FROGGIT — 60 FPS 2D Orthographic Course Minimap & 7-Realm World Showcase Modal
 * File: src/ui/minimapAndWorldMap.js
 */
// =========================================================================
// 9. LIVE TOP-DOWN ORTHOGRAPHIC MINIMAP RENDERER
//    Draws real-time course tiles, gaps, obstacles, moving platforms,
//    sweeper beams, checkpoints, finish gate, enemies, and Tode's position
//    & directional orientation chevron every frame!
// =========================================================================
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

function hexToCss(hexInt, alpha = 1) {
  const r = (hexInt >> 16) & 255;
  const g = (hexInt >> 8) & 255;
  const b = hexInt & 255;
  return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
}

function renderLiveMinimap() {
  if (!minimapCtx || state.mode === 'LANDING') return;

  const W = minimapCanvas.width;
  const H = minimapCanvas.height;
  minimapCtx.clearRect(0, 0, W, H);

  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];

  // 1. Biome-Themed Orthographic Backdrop (Deep River / Sky Clouds / Ocean Abyss)
  const bgGrad = minimapCtx.createLinearGradient(0, 0, 0, H);
  if (floorCfg.theme === 'heaven') {
    bgGrad.addColorStop(0, '#0c2d48');
    bgGrad.addColorStop(1, '#071626');
  } else if (floorCfg.theme === 'ocean') {
    bgGrad.addColorStop(0, '#042f40');
    bgGrad.addColorStop(1, '#021019');
  } else {
    bgGrad.addColorStop(0, '#082032');
    bgGrad.addColorStop(1, '#05131f');
  }
  minimapCtx.fillStyle = bgGrad;
  minimapCtx.fillRect(0, 0, W, H);

  // Continuous fractional row & column position of the frog (scrolling smoothly during hops!)
  const frogExactRow = -todeRoot.position.z / TILE_SIZE;
  const frogExactCol = todeRoot.position.x / TILE_SIZE;

  // Orthographic camera window: 11.5 rows tall, 9.6 columns wide
  const visibleRows = 11.5;
  const cellW = W / 9.4;
  const cellH = H / visibleRows;
  const frogScreenY = H * 0.72; // Toad positioned in lower third so upcoming course scrolls down from top

  const toScreenX = (colX) => (W * 0.5) + (colX - frogExactCol * 0.78) * cellW;
  const toScreenY = (rowZ) => frogScreenY - (rowZ - frogExactRow) * cellH;

  // Subtle scrolling water/wind lines in background
  minimapCtx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
  minimapCtx.lineWidth = 1;
  const scrollOffset = (frogExactRow * cellH) % 24;
  for (let y = scrollOffset; y < H; y += 24) {
    minimapCtx.beginPath();
    minimapCtx.moveTo(0, y);
    minimapCtx.lineTo(W, y);
    minimapCtx.stroke();
  }

  const startRow = Math.max(0, Math.floor(frogExactRow - 4));
  const endRow = Math.min(ROADWAY_LENGTH, Math.ceil(frogExactRow + 10));

  // 2. Draw Orthographic 3D-Beveled Course Tiles, Guardrails, Checkpoints & Static Obstacles
  for (let gz = endRow; gz >= startRow; gz--) {
    const sy = toScreenY(gz);
    const rowCenterCol = getTrackCenterCol(state.floorLevel, gz);
    for (let gx = -12; gx <= 12; gx++) {
      const key = tileKey(gx, gz);
      if (!validRoadwayTiles.has(key)) continue;

      const sx = toScreenX(gx);
      const isStart = (gz === 0 && gx === 0);
      const isCheckpoint = (CHECKPOINT_ROWS.includes(gz) && Math.abs(gx - rowCenterCol) <= 1);
      const isFinishGate = (gz >= ROADWAY_LENGTH - 3);
      const isBlocked = blockedTiles.has(key);

      const tileW = cellW * 0.92;
      const tileH = cellH * 0.92;
      const tx = sx - tileW * 0.5;
      const ty = sy - tileH * 0.5;

      // Cliff / 3D underside drop shadow
      minimapCtx.fillStyle = hexToCss(floorCfg.cliffColor, 0.85);
      minimapCtx.fillRect(tx, ty + tileH * 0.16, tileW, tileH);

      // Main Top Surface
      if (isFinishGate) {
        minimapCtx.fillStyle = gz >= 50 ? '#fbbf24' : '#cbd5e1';
      } else if (isCheckpoint) {
        minimapCtx.fillStyle = '#38bdf8';
      } else if (isStart) {
        minimapCtx.fillStyle = '#34d399';
      } else {
        const isEven = (gx + gz) % 2 === 0;
        minimapCtx.fillStyle = hexToCss(isEven ? floorCfg.tileA : floorCfg.tileB, 0.88);
      }
      minimapCtx.fillRect(tx, ty, tileW, tileH * 0.90);

      // Guardrails on fenced edges
      if (fencedEdges.has(`${gx},${gz},L`)) {
        minimapCtx.fillStyle = '#f59e0b';
        minimapCtx.fillRect(tx - 1.5, ty, 3, tileH);
      }
      if (fencedEdges.has(`${gx},${gz},R`)) {
        minimapCtx.fillStyle = '#f59e0b';
        minimapCtx.fillRect(tx + tileW - 1.5, ty, 3, tileH);
      }

      // Top-down 3D Static Obstacle reflecting its randomized shape, size & color
      if (isBlocked) {
        const meta = obstacleMetaMap.get(key) || { shape: 'circle', color: '#f97316', scale: 0.9 };
        const r = cellW * 0.33 * meta.scale;

        minimapCtx.fillStyle = meta.color;
        minimapCtx.strokeStyle = '#fffbeb';
        minimapCtx.lineWidth = 1.1;

        if (meta.shape === 'square') {
          minimapCtx.fillRect(sx - r, sy - r, r * 2, r * 2);
          minimapCtx.strokeRect(sx - r, sy - r, r * 2, r * 2);
        } else if (meta.shape === 'diamond') {
          minimapCtx.beginPath();
          minimapCtx.moveTo(sx, sy - r * 1.15);
          minimapCtx.lineTo(sx + r * 1.15, sy);
          minimapCtx.lineTo(sx, sy + r * 1.15);
          minimapCtx.lineTo(sx - r * 1.15, sy);
          minimapCtx.closePath();
          minimapCtx.fill();
          minimapCtx.stroke();
        } else {
          minimapCtx.beginPath();
          minimapCtx.arc(sx, sy, r, 0, Math.PI * 2);
          minimapCtx.fill();
          minimapCtx.stroke();
        }
      }
    }
  }

  // 3. Draw Moving Ferry Platforms in Real Time
  movingPlatforms.forEach((plat) => {
    if (plat.gz < startRow || plat.gz > endRow) return;
    const platCol = plat.mesh.position.x / TILE_SIZE;
    const sx = toScreenX(platCol);
    const sy = toScreenY(plat.gz);
    minimapCtx.fillStyle = '#06b6d4';
    minimapCtx.strokeStyle = '#ecfeff';
    minimapCtx.lineWidth = 1.4;
    minimapCtx.fillRect(sx - cellW * 0.46, sy - cellH * 0.42, cellW * 0.92, cellH * 0.84);
    minimapCtx.strokeRect(sx - cellW * 0.46, sy - cellH * 0.42, cellW * 0.92, cellH * 0.84);
  });

  // 4. Draw Grapple Lily-Posts (🪷), Golden Fireflies (✨), Bounce Pads & Push-Blocks
  grappleTargets.forEach((gt) => {
    if (!gt.alive || gt.gz < startRow || gt.gz > endRow) return;
    const sx = toScreenX(gt.gx);
    const sy = toScreenY(gt.gz);
    if (gt.kind === 'grapple_post') {
      const isPassed = gt.passed || state.gridZ >= gt.gz;
      minimapCtx.fillStyle = isPassed ? 'rgba(71, 85, 105, 0.55)' : '#f472b6';
      minimapCtx.beginPath();
      minimapCtx.arc(sx, sy, cellW * 0.28, 0, Math.PI * 2);
      minimapCtx.fill();
      minimapCtx.strokeStyle = isPassed ? '#64748b' : '#fef08a';
      minimapCtx.lineWidth = 1.4;
      minimapCtx.stroke();
    } else {
      minimapCtx.fillStyle = '#fef08a';
      minimapCtx.beginPath();
      minimapCtx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      minimapCtx.fill();
    }
  });

  bouncePads.forEach((bp) => {
    if (bp.gz < startRow || bp.gz > endRow) return;
    const sx = toScreenX(bp.gx);
    const sy = toScreenY(bp.gz);
    minimapCtx.fillStyle = '#10b981';
    minimapCtx.beginPath();
    minimapCtx.arc(sx, sy, cellW * 0.32, 0, Math.PI * 2);
    minimapCtx.fill();
    minimapCtx.strokeStyle = '#ffffff';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.stroke();
  });

  pushBlocks.forEach((pb) => {
    if (pb.gz < startRow || pb.gz > endRow) return;
    const pbCol = pb.mesh.position.x / TILE_SIZE;
    const sx = toScreenX(pbCol);
    const sy = toScreenY(pb.gz);
    minimapCtx.fillStyle = '#10b981';
    minimapCtx.strokeStyle = '#fef08a';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.fillRect(sx - cellW * 0.38, sy - cellH * 0.34, cellW * 0.76, cellH * 0.68);
    minimapCtx.strokeRect(sx - cellW * 0.38, sy - cellH * 0.34, cellW * 0.76, cellH * 0.68);
  });

  // 4B. Draw Side Cannons, Cannonballs, Swinging Pendulum Axes, Thwomps & Rolling Logs
  cannonShooters.forEach((cn) => {
    if (cn.gz < startRow - 1 || cn.gz > endRow + 1) return;
    const sx = toScreenX(cn.muzzleX / TILE_SIZE);
    const sy = toScreenY(cn.gz);
    minimapCtx.fillStyle = '#f97316';
    minimapCtx.fillRect(sx - 4, sy - 4, 8, 8);
  });
  cannonProjectiles.forEach((pr) => {
    const prRow = -pr.mesh.position.z / TILE_SIZE;
    if (prRow < startRow - 1 || prRow > endRow + 1) return;
    const sx = toScreenX(pr.mesh.position.x / TILE_SIZE);
    const sy = toScreenY(prRow);
    minimapCtx.fillStyle = '#f97316';
    minimapCtx.strokeStyle = '#fef08a';
    minimapCtx.lineWidth = 1.4;
    minimapCtx.beginPath();
    minimapCtx.arc(sx, sy, 4.8, 0, Math.PI * 2);
    minimapCtx.fill();
    minimapCtx.stroke();
  });
  pendulumAxes.forEach((ax) => {
    if (ax.gz < startRow - 1 || ax.gz > endRow + 1) return;
    const angle = Math.sin(ax.phase) * ax.maxAngle;
    const axeX = (ax.centerX || 0) + Math.sin(angle) * ax.rodLen;
    const sx = toScreenX(axeX / TILE_SIZE);
    const sy = toScreenY(ax.gz);
    minimapCtx.strokeStyle = '#f43f5e';
    minimapCtx.lineWidth = 2.6;
    minimapCtx.beginPath();
    minimapCtx.moveTo(sx - 7, sy);
    minimapCtx.lineTo(sx + 7, sy);
    minimapCtx.stroke();
  });
  crusherBlocks.forEach((cr) => {
    if (cr.gz < startRow - 1 || cr.gz > endRow + 1) return;
    const sx = toScreenX(cr.gx);
    const sy = toScreenY(cr.gz);
    minimapCtx.strokeStyle = '#f43f5e';
    minimapCtx.lineWidth = 1.6;
    minimapCtx.strokeRect(sx - 5, sy - 5, 10, 10);
  });
  rollingLogs.forEach((rl) => {
    if (rl.currentGz < startRow - 1 || rl.currentGz > endRow + 1) return;
    const sx = toScreenX(rl.gx);
    const sy = toScreenY(rl.currentGz);
    minimapCtx.fillStyle = '#b45309';
    minimapCtx.fillRect(sx - 9, sy - 3, 18, 6);
  });

  // 5. Draw Rotating Sweeper Beams & Center Turret
  sweeperBeams.forEach((sw) => {
    if (sw.gz < startRow - 1 || sw.gz > endRow + 1) return;
    const cx = toScreenX(getTrackCenterCol(state.floorLevel, sw.gz));
    const cy = toScreenY(sw.gz);
    const radiusCols = sw.halfLength / TILE_SIZE;
    const dx = Math.cos(sw.angle) * radiusCols * cellW;
    const dy = -Math.sin(sw.angle) * radiusCols * cellH;

    minimapCtx.strokeStyle = '#fef08a';
    minimapCtx.lineWidth = 3.2;
    minimapCtx.lineCap = 'round';
    minimapCtx.beginPath();
    minimapCtx.moveTo(cx - dx, cy - dy);
    minimapCtx.lineTo(cx + dx, cy + dy);
    minimapCtx.stroke();

    minimapCtx.fillStyle = '#f59e0b';
    minimapCtx.beginPath();
    minimapCtx.arc(cx, cy, 3.8, 0, Math.PI * 2);
    minimapCtx.fill();
  });

  // 6. Draw Live Patrol Enemies (Biome-Authentic Fish/Shark, Bird/Eagle, or Insect) & Floor Guardian Boss
  bees.forEach((b) => {
    if (!b.alive) return;
    const bRow = -b.mesh.position.z / TILE_SIZE;
    if (bRow < startRow - 1 || bRow > endRow + 1) return;
    const bCol = b.mesh.position.x / TILE_SIZE;
    const sx = toScreenX(bCol);
    const sy = toScreenY(bRow);

    const r = b.type === 'boss' ? 5.8 : 3.6;
    const col = b.minimapColor || (b.type === 'boss' ? '#f43f5e' : '#facc15');

    if (floorCfg.theme === 'ocean') {
      // Aquatic Fish / Shark / Squid Top-Down Silhouette with Forked Tail Fin
      minimapCtx.fillStyle = col;
      minimapCtx.beginPath();
      minimapCtx.moveTo(sx - r * 0.85, sy);
      minimapCtx.lineTo(sx - r * 1.55, sy - r * 0.65);
      minimapCtx.lineTo(sx - r * 1.30, sy);
      minimapCtx.lineTo(sx - r * 1.55, sy + r * 0.65);
      minimapCtx.closePath();
      minimapCtx.fill();

      minimapCtx.beginPath();
      minimapCtx.ellipse(sx, sy, r * 1.15, r * 0.72, 0, 0, Math.PI * 2);
      minimapCtx.fillStyle = col;
      minimapCtx.fill();
      minimapCtx.strokeStyle = '#0f172a';
      minimapCtx.lineWidth = 1;
      minimapCtx.stroke();
    } else if (floorCfg.theme === 'heaven') {
      // Soaring Sky Bird / Eagle / Parrot Top-Down Silhouette with Swept Wings
      minimapCtx.fillStyle = 'rgba(254, 240, 138, 0.92)';
      minimapCtx.beginPath();
      minimapCtx.moveTo(sx - r * 1.5, sy - r * 0.35);
      minimapCtx.quadraticCurveTo(sx, sy + r * 0.45, sx + r * 1.5, sy - r * 0.35);
      minimapCtx.quadraticCurveTo(sx, sy - r * 0.1, sx - r * 1.5, sy - r * 0.35);
      minimapCtx.fill();

      minimapCtx.beginPath();
      minimapCtx.arc(sx, sy, r * 0.85, 0, Math.PI * 2);
      minimapCtx.fillStyle = col;
      minimapCtx.fill();
      minimapCtx.strokeStyle = '#0f172a';
      minimapCtx.lineWidth = 1;
      minimapCtx.stroke();
    } else {
      // Ground Meadow Winged Insect Silhouette
      minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      minimapCtx.beginPath();
      minimapCtx.ellipse(sx - r * 0.9, sy, r * 0.65, r * 0.38, 0, 0, Math.PI * 2);
      minimapCtx.ellipse(sx + r * 0.9, sy, r * 0.65, r * 0.38, 0, 0, Math.PI * 2);
      minimapCtx.fill();

      minimapCtx.beginPath();
      minimapCtx.arc(sx, sy, r, 0, Math.PI * 2);
      minimapCtx.fillStyle = col;
      minimapCtx.fill();
      minimapCtx.strokeStyle = '#0f172a';
      minimapCtx.lineWidth = 1;
      minimapCtx.stroke();
    }
  });

  // 7. Draw Live Pink Tongue Grapple Beam if active!
  const fx = toScreenX(frogExactCol);
  const fy = frogScreenY;
  if (state.tongueState !== 'idle') {
    const tipCol = state.tongueTipPos.x / TILE_SIZE;
    const tipRow = -state.tongueTipPos.z / TILE_SIZE;
    const tx = toScreenX(tipCol);
    const ty = toScreenY(tipRow);

    minimapCtx.strokeStyle = '#f472b6';
    minimapCtx.lineWidth = 5.5;
    minimapCtx.lineCap = 'round';
    minimapCtx.beginPath();
    minimapCtx.moveTo(fx, fy);
    minimapCtx.lineTo(tx, ty);
    minimapCtx.stroke();

    minimapCtx.fillStyle = '#f472b6';
    minimapCtx.beginPath();
    minimapCtx.arc(tx, ty, 5.2, 0, Math.PI * 2);
    minimapCtx.fill();
  }

  // 8. Draw Top-Down Orthographic TOAD Sprite (Body, Kicking Hind Legs, Front Hands, Eyes)
  const mapHeading = Math.PI - state.currentYaw;
  const hopScale = state.hopActive ? 1.18 : 1.0;
  const legKickPx = state.hopActive ? 3.5 : 0;

  minimapCtx.save();
  minimapCtx.translate(fx, fy);
  minimapCtx.rotate(mapHeading);
  minimapCtx.scale(hopScale, hopScale);

  // Subtle glowing locator ring underneath toad
  minimapCtx.fillStyle = 'rgba(52, 211, 153, 0.24)';
  minimapCtx.beginPath();
  minimapCtx.arc(0, 0, 10.5, 0, Math.PI * 2);
  minimapCtx.fill();

  // Hind legs (kick backward during hop!)
  minimapCtx.fillStyle = '#15803d';
  minimapCtx.beginPath();
  minimapCtx.ellipse(-5.5, 4.2 + legKickPx, 3.0, 4.2, -0.35, 0, Math.PI * 2);
  minimapCtx.ellipse(5.5, 4.2 + legKickPx, 3.0, 4.2, 0.35, 0, Math.PI * 2);
  minimapCtx.fill();

  // Front hands
  minimapCtx.beginPath();
  minimapCtx.ellipse(-5.2, -3.2, 2.2, 2.8, 0.3, 0, Math.PI * 2);
  minimapCtx.ellipse(5.2, -3.2, 2.2, 2.8, -0.3, 0, Math.PI * 2);
  minimapCtx.fill();

  // Rounded Voxel Frog Torso
  minimapCtx.fillStyle = '#22c55e';
  minimapCtx.strokeStyle = '#dcfce7';
  minimapCtx.lineWidth = 1.3;
  minimapCtx.beginPath();
  minimapCtx.ellipse(0, 0, 6.2, 7.2, 0, 0, Math.PI * 2);
  minimapCtx.fill();
  minimapCtx.stroke();

  // Dorsal light-emerald stripe
  minimapCtx.fillStyle = '#86efac';
  minimapCtx.beginPath();
  minimapCtx.ellipse(0, 1.0, 3.2, 4.2, 0, 0, Math.PI * 2);
  minimapCtx.fill();

  // Bulging Frog Eyes at front of head (facing UP when yaw = Math.PI)
  [-3.2, 3.2].forEach((ex) => {
    minimapCtx.fillStyle = '#ffffff';
    minimapCtx.beginPath();
    minimapCtx.arc(ex, -5.0, 2.3, 0, Math.PI * 2);
    minimapCtx.fill();

    minimapCtx.fillStyle = '#0f172a';
    minimapCtx.beginPath();
    minimapCtx.arc(ex, -5.5, 1.15, 0, Math.PI * 2);
    minimapCtx.fill();
  });

  minimapCtx.restore();
}

// =========================================================================
// 10. WORLD MAP CROSS-SECTION RENDERER
// =========================================================================
const WORLD_SHOWCASE_META = {
  3: {
    zone: 'APEX CELESTIAL CROWN',
    desc: 'Golden solar citadel suspended in high orbit with narrow marble sky-bridges, seraphim guardians, and high-velocity pendulums.',
    gradient: 'linear-gradient(135deg, rgba(254, 240, 138, 0.96) 0%, rgba(251, 191, 36, 0.92) 100%)',
    textClass: 'text-slate-950',
    borderClass: 'border-amber-300',
    elements: ['☀️ Solar Obelisks', '🦅 Golden Eagles', '🦜 Singing Parrots', '👑 Apex Finale'],
    dioramaBg: 'linear-gradient(180deg, #1e3a8a 0%, #3b82f6 45%, #fde047 100%)',
    svg: `
      <svg viewBox="0 0 360 200" class="w-full h-full">
        <defs>
          <radialGradient id="sunGlow3" cx="50%" cy="35%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="50%" stop-color="#fde047" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="180" cy="68" r="85" fill="url(#sunGlow3)"/>
        <ellipse cx="180" cy="68" rx="74" ry="18" fill="none" stroke="#fef08a" stroke-width="3" opacity="0.8"/>
        <ellipse cx="180" cy="68" rx="52" ry="34" fill="none" stroke="#fbbf24" stroke-width="2.5" opacity="0.7"/>
        <!-- Floating Marble Sanctuary & Golden Crown Arch -->
        <polygon points="85,152 275,152 248,182 112,182" fill="#cbd5e1"/>
        <rect x="95" y="138" width="170" height="16" rx="4" fill="#f8fafc" stroke="#fbbf24" stroke-width="2"/>
        <rect x="118" y="84" width="18" height="54" fill="#f59e0b"/>
        <rect x="224" y="84" width="18" height="54" fill="#f59e0b"/>
        <rect x="110" y="72" width="140" height="14" rx="4" fill="#fde047"/>
        <polygon points="155,72 168,44 180,64 192,40 205,72" fill="#fbbf24"/>
        <circle cx="72" cy="112" r="14" fill="#ffffff" opacity="0.85"/>
        <circle cx="292" cy="108" r="18" fill="#ffffff" opacity="0.85"/>
      </svg>
    `
  },
  2: {
    zone: 'UPPER ASTRAL SANCTUM',
    desc: 'Starlit marble colonnades and crystalline sky-ramps guarded by diving dragonfly wyverns and thwomp monoliths.',
    gradient: 'linear-gradient(135deg, rgba(241, 245, 249, 0.95) 0%, rgba(186, 230, 253, 0.92) 100%)',
    textClass: 'text-slate-950',
    borderClass: 'border-sky-300',
    elements: ['💎 Astral Crystals', '🦅 Peregrine Falcons', '🦜 Macaw Parrots', '🗿 Sky Thwomps'],
    dioramaBg: 'linear-gradient(180deg, #0f172a 0%, #2563eb 55%, #bae6fd 100%)',
    svg: `
      <svg viewBox="0 0 360 200" class="w-full h-full">
        <circle cx="65" cy="42" r="2.5" fill="#fef08a"/>
        <circle cx="130" cy="28" r="3" fill="#ffffff"/>
        <circle cx="255" cy="36" r="2.5" fill="#fef08a"/>
        <circle cx="305" cy="58" r="2" fill="#ffffff"/>
        <!-- Stepped Starlight Temple & Floating Crystal Obelisks -->
        <polygon points="70,155 290,155 260,185 100,185" fill="#64748b"/>
        <rect x="80" y="140" width="200" height="16" rx="4" fill="#f1f5f9"/>
        <rect x="110" y="88" width="16" height="52" fill="#e2e8f0"/>
        <rect x="172" y="76" width="16" height="64" fill="#e2e8f0"/>
        <rect x="234" y="88" width="16" height="52" fill="#e2e8f0"/>
        <polygon points="62,96 76,72 90,96 76,120" fill="#38bdf8"/>
        <polygon points="270,92 284,68 298,92 284,116" fill="#facc15"/>
      </svg>
    `
  },
  1: {
    zone: 'LOWER SKY SANCTUM',
    desc: 'Breezy cloud-top Causeways with twin-wing split forks, golden guardrails, and drifting pearlescent mist.',
    gradient: 'linear-gradient(135deg, rgba(224, 242, 254, 0.94) 0%, rgba(125, 211, 252, 0.90) 100%)',
    textClass: 'text-slate-950',
    borderClass: 'border-cyan-300',
    elements: ['☁️ Cloud Billows', '🔀 Twin-Wing Forks', '🎡 Golden Sweepers', '🚀 Bounce Pads'],
    dioramaBg: 'linear-gradient(180deg, #1e3a8a 0%, #38bdf8 60%, #fef9c3 100%)',
    svg: `
      <svg viewBox="0 0 360 200" class="w-full h-full">
        <ellipse cx="78" cy="128" rx="46" ry="18" fill="#ffffff" opacity="0.9"/>
        <ellipse cx="286" cy="118" rx="52" ry="20" fill="#ffffff" opacity="0.9"/>
        <!-- Twin Split Sky Bridge -->
        <polygon points="88,148 162,148 152,175 98,175" fill="#94a3b8"/>
        <rect x="86" y="134" width="78" height="15" rx="4" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
        <polygon points="198,148 272,148 262,175 208,175" fill="#94a3b8"/>
        <rect x="196" y="134" width="78" height="15" rx="4" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="180" cy="82" r="24" fill="none" stroke="#fbbf24" stroke-width="6"/>
      </svg>
    `
  },
  0: {
    zone: 'STARTING SURFACE REALM',
    desc: 'Lush emerald meadow flanked by cascading pine islands, downstream crystalline waters, and bastion cannon turrets.',
    gradient: 'linear-gradient(135deg, rgba(6, 78, 59, 0.94) 0%, rgba(16, 185, 129, 0.88) 100%)',
    textClass: 'text-emerald-50',
    borderClass: 'border-emerald-400',
    elements: ['🌲 Waterfall Isles', '💣 Bastion Cannons', '🪵 Spiked Timber Logs', '🐝 Royal Hornets'],
    dioramaBg: 'linear-gradient(180deg, #0b192e 0%, #2563eb 45%, #38bdf8 78%, #fef3c7 100%)',
    svg: `
      <svg viewBox="0 0 360 200" class="w-full h-full">
        <rect x="0" y="150" width="360" height="50" fill="#0284c7" opacity="0.8"/>
        <!-- Left Pine Waterfall Island -->
        <rect x="28" y="96" width="58" height="46" rx="4" fill="#475569"/>
        <rect x="26" y="88" width="62" height="12" rx="3" fill="#10b981"/>
        <rect x="48" y="98" width="14" height="58" fill="#7dd3fc" opacity="0.85"/>
        <polygon points="56,42 36,88 76,88" fill="#15803d"/>
        <!-- Center Emerald Meadow Track -->
        <polygon points="110,145 250,145 235,185 125,185" fill="#334155"/>
        <rect x="108" y="128" width="144" height="18" rx="4" fill="#34d399"/>
        <!-- Frog Silhouette on Track -->
        <rect x="166" y="104" width="28" height="24" rx="5" fill="#10b981"/>
        <circle cx="173" cy="102" r="5" fill="#ffffff"/>
        <circle cx="187" cy="102" r="5" fill="#ffffff"/>
      </svg>
    `
  },
  '-1': {
    zone: 'SHALLOW OCEAN REEF',
    desc: 'Sun-dappled turquoise coral atolls teeming with rising bubble vents, glowing sea-anemones, and ferry platforms.',
    gradient: 'linear-gradient(135deg, rgba(12, 74, 110, 0.94) 0%, rgba(14, 116, 144, 0.90) 100%)',
    textClass: 'text-cyan-100',
    borderClass: 'border-cyan-400',
    elements: ['🪸 Pink Bio-Corals', '🐠 Reef Angelfish', '🦈 Reef Sharks', '⛴️ Atoll Ferries'],
    dioramaBg: 'linear-gradient(180deg, #0f2942 0%, #0284c7 55%, #22d3ee 100%)',
    svg: `
      <svg viewBox="0 0 360 200" class="w-full h-full">
        <circle cx="90" cy="64" r="6" fill="#a5f3fc" opacity="0.65"/>
        <circle cx="110" cy="42" r="4" fill="#a5f3fc" opacity="0.65"/>
        <circle cx="275" cy="54" r="7" fill="#a5f3fc" opacity="0.65"/>
        <polygon points="95,148 265,148 245,182 115,182" fill="#1e3a5f"/>
        <rect x="92" y="132" width="176" height="16" rx="4" fill="#2dd4bf"/>
        <circle cx="132" cy="118" r="18" fill="#ec4899"/>
        <circle cx="228" cy="116" r="20" fill="#f472b6"/>
      </svg>
    `
  },
  '-2': {
    zone: 'TWILIGHT KELP TRENCH',
    desc: 'Deep indigo currents where giant bioluminescent kelp forests sway beside swinging battle-axes and naval mines.',
    gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.92) 100%)',
    textClass: 'text-sky-100',
    borderClass: 'border-blue-400',
    elements: ['🌿 Giant Kelp Stalks', '🦑 Giant Squids', '🦈 Trench Sharks', '🪼 Neon Jellyfish'],
    dioramaBg: 'linear-gradient(180deg, #060d18 0%, #1e3a8a 60%, #0284c7 100%)',
    svg: `
      <svg viewBox="0 0 360 200" class="w-full h-full">
        <path d="M55,190 Q42,130 62,70" stroke="#0d9488" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M82,190 Q96,140 76,85" stroke="#14b8a6" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M295,190 Q310,130 288,68" stroke="#0d9488" stroke-width="10" fill="none" stroke-linecap="round"/>
        <polygon points="105,150 255,150 238,184 122,184" fill="#1e293b"/>
        <rect x="102" y="134" width="156" height="16" rx="4" fill="#0d9488"/>
        <path d="M162,78 A18,18 0 0,1 198,78 Z" fill="#d946ef"/>
        <line x1="170" y1="78" x2="168" y2="102" stroke="#a3e635" stroke-width="2.5"/>
        <line x1="180" y1="78" x2="180" y2="105" stroke="#22d3ee" stroke-width="2.5"/>
        <line x1="190" y1="78" x2="192" y2="102" stroke="#a3e635" stroke-width="2.5"/>
      </svg>
    `
  },
  '-3': {
    zone: 'APEX ABYSSAL FRONTIER',
    desc: 'Crushingmidnight ocean trench illuminated by neon-cyan caustic rifts, volcanic monoliths, and the Abyssal Warlord.',
    gradient: 'linear-gradient(135deg, rgba(2, 6, 23, 0.96) 0%, rgba(15, 118, 110, 0.92) 100%)',
    textClass: 'text-cyan-200',
    borderClass: 'border-teal-400',
    elements: ['🔱 Abyssal Leviathan', '🌋 Obsidian Monoliths', '⚡ 1.45x Rapid Currents', '🏆 Abyss Finale'],
    dioramaBg: 'linear-gradient(180deg, #020617 0%, #0f172a 55%, #0f766e 100%)',
    svg: `
      <svg viewBox="0 0 360 200" class="w-full h-full">
        <circle cx="180" cy="84" r="64" fill="#06b6d4" opacity="0.16"/>
        <circle cx="180" cy="84" r="36" fill="none" stroke="#22d3ee" stroke-width="5"/>
        <polygon points="105,152 255,152 238,186 122,186" fill="#090d16"/>
        <rect x="102" y="136" width="156" height="16" rx="4" fill="#0f766e" stroke="#22d3ee" stroke-width="1.5"/>
        <polygon points="62,165 82,95 102,165" fill="#1e293b" stroke="#22d3ee" stroke-width="1.5"/>
        <polygon points="258,165 278,95 298,165" fill="#1e293b" stroke="#22d3ee" stroke-width="1.5"/>
      </svg>
    `
  }
};

let selectedMapPreviewLevel = 0;

function updateArenaSpotlight(lvl) {
  selectedMapPreviewLevel = lvl;
  const cfg = FLOORS[lvl] || FLOORS[0];
  const meta = WORLD_SHOWCASE_META[lvl] || WORLD_SHOWCASE_META[0];
  const artEl = document.getElementById('map-spotlight-art');
  const zoneEl = document.getElementById('map-spotlight-zone');
  const speedEl = document.getElementById('map-spotlight-speed');
  const titleEl = document.getElementById('map-spotlight-title');
  const descEl = document.getElementById('map-spotlight-desc');
  const elemsEl = document.getElementById('map-spotlight-elements');
  const ctaTextEl = document.getElementById('map-spotlight-cta-text');
  const warpBtn = document.getElementById('btn-map-spotlight-warp');

  if (artEl) {
    artEl.style.background = meta.dioramaBg;
    artEl.innerHTML = meta.svg;
  }
  if (zoneEl) zoneEl.textContent = meta.zone;
  if (speedEl) speedEl.textContent = `${cfg.speedMult.toFixed(2)}x Pace • ${Math.round(cfg.widthScale * 100)}% Span`;
  if (titleEl) titleEl.textContent = `${cfg.icon} ${cfg.name}`;
  if (descEl) descEl.textContent = meta.desc;
  if (elemsEl) {
    elemsEl.innerHTML = meta.elements.map((tag) => `
      <span class="px-2.5 py-1 rounded-lg bg-white/8 border border-white/12 font-sans text-[11px] font-semibold text-slate-100">
        ${tag}
      </span>
    `).join('');
  }
  if (ctaTextEl) {
    ctaTextEl.textContent = lvl === state.floorLevel
      ? `RESUME ${cfg.name.toUpperCase()}`
      : `WARP TO ${cfg.name.toUpperCase()}`;
  }
  if (warpBtn) {
    warpBtn.onclick = () => {
      closeAllModals(false);
      if (state.mode === 'LANDING') {
        startPlayFromLanding(lvl);
      } else {
        state.mode = 'PLAYING';
        transitionToFloor(lvl, false);
      }
    };
  }
}

function renderCrossSectionMap() {
  const containerEl = document.getElementById('cross-section-tiers');
  const floorCfg = FLOORS[state.floorLevel] || FLOORS[0];
  const progressPct = Math.min(100, Math.max(0, Math.round((state.gridZ / ROADWAY_LENGTH) * 100)));
  document.getElementById('map-current-floor-label').textContent =
    `${floorCfg.icon} ${floorCfg.name} (${progressPct}%)`;

  updateArenaSpotlight(state.floorLevel);

  const orderedLevels = [3, 2, 1, 0, -1, -2, -3];
  containerEl.innerHTML = orderedLevels.map((lvl) => {
    const cfg = FLOORS[lvl];
    const meta = WORLD_SHOWCASE_META[lvl] || WORLD_SHOWCASE_META[0];
    const isCurrent = (lvl === state.floorLevel);
    const widthPct = Math.round(cfg.widthScale * 92 + 8);
    const rowPct = isCurrent ? progressPct : 0;

    return `
      <button
        type="button"
        data-warp-floor="${lvl}"
        style="width: ${widthPct}%; background: ${meta.gradient};"
        class="group mx-auto relative py-2.5 px-4 rounded-xl border ${meta.borderClass} ${meta.textClass} ${isCurrent ? 'ring-2 ring-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.45)] scale-[1.01]' : 'opacity-92 hover:opacity-100 hover:scale-[1.01]'} transition-all duration-150 flex items-center justify-between gap-2 text-left"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-9 h-9 rounded-xl bg-black/20 border border-white/20 flex items-center justify-center text-lg shrink-0 shadow-inner">
            ${cfg.icon}
          </span>
          <div class="min-w-0">
            <div class="font-display font-black text-xs sm:text-sm uppercase tracking-tight truncate flex items-center gap-2">
              <span>${cfg.name}</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 mt-0.5 opacity-85 text-[10px] font-semibold truncate">
              <span>${meta.elements[0]}</span>
              <span>•</span>
              <span>${meta.elements[1]}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          ${isCurrent ? `
            <span class="frog-locator-dot inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-400 text-slate-950 font-mono-num text-[10px] font-extrabold shadow">
              🐸 ${rowPct}%
            </span>
          ` : `
            <span class="px-2.5 py-1 rounded-lg bg-black/20 border border-white/15 font-mono-num text-[10px] font-bold group-hover:bg-black/35 transition">
              Warp →
            </span>
          `}
        </div>
      </button>
    `;
  }).join('');

  containerEl.querySelectorAll('[data-warp-floor]').forEach((btn) => {
    const targetLvl = parseInt(btn.getAttribute('data-warp-floor'), 10);
    btn.addEventListener('mouseenter', () => {
      updateArenaSpotlight(targetLvl);
    });
    btn.addEventListener('focus', () => {
      updateArenaSpotlight(targetLvl);
    });
    btn.addEventListener('click', () => {
      closeAllModals(false);
      if (state.mode === 'LANDING') {
        startPlayFromLanding(targetLvl);
      } else {
        state.mode = 'PLAYING';
        transitionToFloor(targetLvl, false);
      }
    });
  });
}
