/**
 * THE FROGGIT — Three.js Scene, Lighting & 256x256 Procedural Gradient/Bump Shader Engine
 * File: src/rendering/sceneAndShaders.js
 */
// =========================================================================
// 3. THREE.JS SCENE, MINECRAFT SHADER LIGHTING & VOXEL TEXTURE PACK ENGINE
// =========================================================================
const container = document.getElementById('game-canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 280);
camera.position.set(-0.65, 1.95, 5.85);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.88);
scene.add(ambientLight);

// Golden-Hour Sun Light from Upper-Right (matches reference image lighting & casts crisp voxel shadows)
const dirLight = new THREE.DirectionalLight(0xfff1c1, 1.28);
dirLight.position.set(28, 36, 18);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 160;
const d = 44;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

// Subtle cool rim backlight for 3D voxel separation
const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.42);
rimLight.position.set(-24, 18, -20);
scene.add(rimLight);

// -------------------------------------------------------------------------
// SMOOTH REAL-LIFE GRADIENT SHADER & TEXTURE ENGINE (Zero Pixel/Blocky Noise)
// Generates silky 256x256 LinearFilter multi-stop radial & linear gradient
// textures with soft ambient-occlusion bevels and satin specular sheen.
// -------------------------------------------------------------------------
const SHADER_CONFIG = {
  warmth: 0.04,
  contrast: 1.0,
  exposure: 1.14
};

const textureCache = new Map();
const scrollingWaterTextures = [];
const scrollingFloorTextures = [];

function seededRand(seed) {
  let s = (seed % 2147483647);
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hexToRgbObj(hexInt) {
  return {
    r: (hexInt >> 16) & 255,
    g: (hexInt >> 8) & 255,
    b: hexInt & 255
  };
}

function adjustColorCss(hexInt, lumDelta = 0, warmthDelta = 0, alpha = 1.0) {
  const { r, g, b } = hexToRgbObj(hexInt);
  const nr = Math.max(0, Math.min(255, Math.round(r + lumDelta * 255 + warmthDelta * 180)));
  const ng = Math.max(0, Math.min(255, Math.round(g + lumDelta * 255 + warmthDelta * 40)));
  const nb = Math.max(0, Math.min(255, Math.round(b + lumDelta * 255 - warmthDelta * 140)));
  return alpha < 1.0 ? `rgba(${nr},${ng},${nb},${alpha})` : `rgb(${nr},${ng},${nb})`;
}

function blendHexColors(hexA, hexB, t) {
  const a = hexToRgbObj(hexA);
  const b = hexToRgbObj(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return (r << 16) | (g << 8) | bl;
}

function getVoxelTexturePair(patternType, baseHex, secondaryHex = null, repeatX = 1, repeatY = 1) {
  const pack = SHADER_CONFIG;
  const cacheKey = `gradient:tactile_v2:${patternType}:${baseHex}:${secondaryHex}:${repeatX}:${repeatY}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = S;
  bumpCanvas.height = S;
  const bctx = bumpCanvas.getContext('2d');
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, S, S);

  const rand = seededRand((baseHex ^ (secondaryHex || 0x123456)) + patternType.length * 997);
  const w = pack.warmth * 0.6;
  const c = pack.contrast;
  const secHex = secondaryHex !== null
    ? blendHexColors(baseHex, secondaryHex, 0.34)
    : adjustHexLuminance(baseHex, -0.06);

  const baseGrad = ctx.createLinearGradient(0, 0, S * 0.35, S);
  baseGrad.addColorStop(0.0, adjustColorCss(baseHex, 0.06 * c, w));
  baseGrad.addColorStop(0.55, adjustColorCss(baseHex, 0.0, w));
  baseGrad.addColorStop(1.0, adjustColorCss(secHex, -0.06 * c, w));
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, S, S);

  let bumpScale = 0.018;

  if (patternType === 'water_flow') {
    bumpScale = 0.010;
    // Seamless, line-free organic water surface with soft radial specular dapples (wrapped across tile borders)
    const uniformWater = ctx.createLinearGradient(0, 0, S, S);
    uniformWater.addColorStop(0.0, adjustColorCss(baseHex, 0.02, w));
    uniformWater.addColorStop(0.5, adjustColorCss(secHex, 0.04, w));
    uniformWater.addColorStop(1.0, adjustColorCss(baseHex, 0.02, w));
    ctx.fillStyle = uniformWater;
    ctx.fillRect(0, 0, S, S);

    for (let i = 0; i < 28; i++) {
      const cx = rand() * S;
      const cy = rand() * S;
      const cr = 28 + rand() * 46;
      const isHighlight = i % 2 === 0;
      // Draw wrapped in 3x3 periodic offsets so tile edges have zero seams or lines!
      for (let ox = -S; ox <= S; ox += S) {
        for (let oy = -S; oy <= S; oy += S) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + cr < 0 || px - cr > S || py + cr < 0 || py - cr > S) continue;
          const g = ctx.createRadialGradient(px, py, 2, px, py, cr);
          if (isHighlight) {
            g.addColorStop(0.0, 'rgba(224, 242, 254, 0.22)');
            g.addColorStop(0.55, 'rgba(125, 211, 252, 0.10)');
            g.addColorStop(1.0, 'rgba(56, 189, 248, 0.0)');
          } else {
            g.addColorStop(0.0, 'rgba(3, 105, 161, 0.18)');
            g.addColorStop(0.6, 'rgba(2, 132, 199, 0.07)');
            g.addColorStop(1.0, 'rgba(2, 132, 199, 0.0)');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, cr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else if (patternType === 'ocean_caustics') {
    bumpScale = 0.014;
    // Seamless bioluminescent aquatic dapples (zero hard lines)
    for (let i = 0; i < 22; i++) {
      const cx = rand() * S;
      const cy = rand() * S;
      const cr = 24 + rand() * 40;
      for (let ox = -S; ox <= S; ox += S) {
        for (let oy = -S; oy <= S; oy += S) {
          const px = cx + ox;
          const py = cy + oy;
          if (px + cr < 0 || px - cr > S || py + cr < 0 || py - cr > S) continue;
          const g = ctx.createRadialGradient(px, py, 2, px, py, cr);
          g.addColorStop(0, 'rgba(165, 243, 252, 0.28)');
          g.addColorStop(0.55, 'rgba(34, 211, 238, 0.12)');
          g.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, cr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else if (patternType === 'cloud_mist') {
    bumpScale = 0.012;
    // Seamless pearlescent cloud billows (zero horizontal lines)
    for (let i = 0; i < 20; i++) {
      const mx = rand() * S;
      const my = rand() * S;
      const mr = 30 + rand() * 46;
      for (let ox = -S; ox <= S; ox += S) {
        for (let oy = -S; oy <= S; oy += S) {
          const px = mx + ox;
          const py = my + oy;
          if (px + mr < 0 || px - mr > S || py + mr < 0 || py - mr > S) continue;
          const mist = ctx.createRadialGradient(px, py, 4, px, py, mr);
          mist.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
          mist.addColorStop(0.55, 'rgba(254, 249, 195, 0.16)');
          mist.addColorStop(1, 'rgba(186, 230, 253, 0)');
          ctx.fillStyle = mist;
          ctx.beginPath();
          ctx.arc(px, py, mr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else if (patternType === 'grass_top') {
    bumpScale = 0.022;
    // Soft organic clover/turf dapple patches
    for (let i = 0; i < 18; i++) {
      const gx = rand() * S;
      const gy = rand() * S;
      const gr = 18 + rand() * 28;
      const dapple = ctx.createRadialGradient(gx, gy, 2, gx, gy, gr);
      const isLight = i % 2 === 0;
      dapple.addColorStop(0, adjustColorCss(baseHex, isLight ? 0.08 : -0.06, w, 0.28));
      dapple.addColorStop(1, adjustColorCss(baseHex, 0, w, 0));
      ctx.fillStyle = dapple;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    // Fine woven turf micro-blades
    ctx.lineCap = 'round';
    bctx.lineCap = 'round';
    for (let i = 0; i < 85; i++) {
      const bx = rand() * S;
      const by = rand() * S;
      const bh = 8 + rand() * 11;
      const tilt = (rand() - 0.5) * 6;
      ctx.strokeStyle = adjustColorCss(baseHex, (i % 2 === 0) ? 0.09 : -0.07, w, 0.32);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + tilt, by - bh);
      ctx.stroke();

      bctx.strokeStyle = (i % 2 === 0) ? '#9a9a9a' : '#686868';
      bctx.lineWidth = 2.2;
      bctx.beginPath();
      bctx.moveTo(bx, by);
      bctx.lineTo(bx + tilt, by - bh);
      bctx.stroke();
    }
    // Subtle sunlit tile bevel frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, S - 6, S - 6);
  } else if (patternType === 'stone_brick' || patternType === 'cobble_moss') {
    bumpScale = 0.028;
    const rows = 4;
    const cols = 2;
    const rowH = S / rows;
    const colW = S / cols;
    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2 === 1) ? colW * 0.5 : 0;
      for (let cIdx = -1; cIdx <= cols; cIdx++) {
        const bx = cIdx * colW + offsetX;
        const by = r * rowH;
        const tone = (rand() - 0.5) * 0.08;
        ctx.fillStyle = adjustColorCss(baseHex, tone, w, 0.55);
        ctx.fillRect(bx + 3, by + 3, colW - 6, rowH - 6);

        // Top-left bevel highlight on each carved stone block
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + 3, by + rowH - 4);
        ctx.lineTo(bx + 3, by + 3);
        ctx.lineTo(bx + colW - 4, by + 3);
        ctx.stroke();

        // Mortar groove in bump map and color map
        ctx.strokeStyle = adjustColorCss(baseHex, -0.14, w, 0.48);
        ctx.lineWidth = 3;
        ctx.strokeRect(bx + 1.5, by + 1.5, colW - 3, rowH - 3);

        bctx.strokeStyle = '#4a4a4a';
        bctx.lineWidth = 4;
        bctx.strokeRect(bx + 1.5, by + 1.5, colW - 3, rowH - 3);
      }
    }
    if (patternType === 'cobble_moss') {
      for (let m = 0; m < 14; m++) {
        const mx = rand() * S;
        const my = rand() * S;
        const mr = 10 + rand() * 20;
        const mossGrad = ctx.createRadialGradient(mx, my, 1, mx, my, mr);
        mossGrad.addColorStop(0, 'rgba(34, 197, 94, 0.34)');
        mossGrad.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
        ctx.fillStyle = mossGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternType === 'wood_planks') {
    bumpScale = 0.024;
    const planks = 4;
    const pH = S / planks;
    for (let p = 0; p < planks; p++) {
      const py = p * pH;
      ctx.fillStyle = adjustColorCss(baseHex, (p % 2 === 0 ? 0.03 : -0.03), w, 0.5);
      ctx.fillRect(0, py + 2, S, pH - 4);

      // Wood grain fibers
      for (let g = 0; g < 10; g++) {
        const gy = py + 5 + (g / 10) * (pH - 10);
        ctx.beginPath();
        for (let x = 0; x <= S; x += 16) {
          const wy = gy + Math.sin((x / S) * Math.PI * 2 + g) * 2.2;
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.strokeStyle = adjustColorCss(baseHex, (g % 2 === 0) ? 0.06 : -0.07, w, 0.25);
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // Plank seam
      ctx.fillStyle = adjustColorCss(baseHex, -0.15, w, 0.55);
      ctx.fillRect(0, py, S, 3);
      bctx.fillStyle = '#484848';
      bctx.fillRect(0, py, S, 4);
    }
  } else if (patternType === 'hazard_stripes') {
    bumpScale = 0.020;
    ctx.save();
    ctx.strokeStyle = adjustColorCss(secHex, -0.12, w, 0.42);
    ctx.lineWidth = 22;
    for (let d = -S; d < S * 2; d += 56) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d - S, S);
      ctx.stroke();

      bctx.strokeStyle = '#606060';
      bctx.lineWidth = 18;
      bctx.beginPath();
      bctx.moveTo(d, 0);
      bctx.lineTo(d - S, S);
      bctx.stroke();
    }
    ctx.restore();
  } else if (patternType === 'crystal_gem') {
    bumpScale = 0.016;
    // Faceted diamond prism reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.beginPath();
    ctx.moveTo(S * 0.5, 10);
    ctx.lineTo(S - 10, S * 0.5);
    ctx.lineTo(S * 0.5, S * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.beginPath();
    ctx.moveTo(10, S * 0.5);
    ctx.lineTo(S * 0.5, 10);
    ctx.lineTo(S * 0.5, S * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(12, 12, S - 24, S - 24);
  } else if (patternType === 'frog_skin' || patternType === 'frog_belly') {
    bumpScale = 0.015;
    const count = patternType === 'frog_skin' ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const sx = rand() * S;
      const sy = rand() * S;
      const sr = 8 + rand() * 16;
      ctx.fillStyle = adjustColorCss(baseHex, patternType === 'frog_skin' ? -0.07 : 0.05, w, 0.24);
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();

      bctx.fillStyle = '#929292';
      bctx.beginPath();
      bctx.arc(sx, sy, sr * 0.8, 0, Math.PI * 2);
      bctx.fill();
    }
  }

  const colorTex = new THREE.CanvasTexture(canvas);
  colorTex.magFilter = THREE.LinearFilter;
  colorTex.minFilter = THREE.LinearMipmapLinearFilter;
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(repeatX, repeatY);
  colorTex.encoding = THREE.sRGBEncoding;
  colorTex.needsUpdate = true;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.magFilter = THREE.LinearFilter;
  bumpTex.minFilter = THREE.LinearMipmapLinearFilter;
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(repeatX, repeatY);
  bumpTex.needsUpdate = true;

  const pair = { map: colorTex, bumpMap: bumpTex, bumpScale };
  textureCache.set(cacheKey, pair);
  return pair;
}

function adjustHexLuminance(hexInt, lumDelta) {
  const { r, g, b } = hexToRgbObj(hexInt);
  const nr = Math.max(0, Math.min(255, Math.round(r + lumDelta * 255)));
  const ng = Math.max(0, Math.min(255, Math.round(g + lumDelta * 255)));
  const nb = Math.max(0, Math.min(255, Math.round(b + lumDelta * 255)));
  return (nr << 16) | (ng << 8) | nb;
}

function createVoxelMaterial(patternType, baseHex, secondaryHex = null, opts = {}) {
  const pair = getVoxelTexturePair(
    patternType,
    baseHex,
    secondaryHex,
    opts.repeatX || 1,
    opts.repeatY || 1
  );
  if (opts.scrollWater) {
    scrollingWaterTextures.push(pair.map);
  }
  if (opts.scrollFloor) {
    scrollingFloorTextures.push({
      map: pair.map,
      vx: opts.scrollFloorVx || 0.08,
      vy: opts.scrollFloorVy || 0.14
    });
  }
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: pair.map,
    bumpMap: pair.bumpMap,
    bumpScale: pair.bumpScale || 0.018,
    roughness: opts.roughness !== undefined ? opts.roughness : 0.42,
    metalness: opts.metalness !== undefined ? opts.metalness : 0.08,
    emissive: opts.emissive !== undefined ? opts.emissive : baseHex,
    emissiveIntensity: opts.emissiveIntensity !== undefined ? opts.emissiveIntensity : 0.05,
    transparent: Boolean(opts.transparent),
    opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
    side: opts.side || THREE.FrontSide
  });
}

// Ultra-Smooth Real-Life Atmospheric Horizon & Sun-Bloom Sky Shader
function createSkyDomeTexture(topColor, midColor, horizonColor, theme = 'ground') {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  if (theme === 'ground') {
    // Real-life twilight-to-golden-hour smooth multi-stop sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0.0, '#0b192e');
    skyGrad.addColorStop(0.28, '#1d4ed8');
    skyGrad.addColorStop(0.58, '#38bdf8');
    skyGrad.addColorStop(0.82, '#bae6fd');
    skyGrad.addColorStop(1.0, '#fef3c7');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Smooth golden-hour sun bloom in upper-right sky
    const sunBloom = ctx.createRadialGradient(820, 110, 10, 820, 110, 460);
    sunBloom.addColorStop(0.0, 'rgba(255, 253, 240, 0.92)');
    sunBloom.addColorStop(0.22, 'rgba(253, 224, 71, 0.48)');
    sunBloom.addColorStop(0.55, 'rgba(251, 146, 60, 0.18)');
    sunBloom.addColorStop(1.0, 'rgba(251, 146, 60, 0.0)');
    ctx.fillStyle = sunBloom;
    ctx.fillRect(0, 0, 1024, 512);

    // Soft horizontal atmospheric mist bands near the horizon
    const mistGrad = ctx.createLinearGradient(0, 320, 0, 512);
    mistGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
    mistGrad.addColorStop(0.65, 'rgba(224, 242, 254, 0.28)');
    mistGrad.addColorStop(1.0, 'rgba(254, 249, 195, 0.42)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, 320, 1024, 192);
  } else if (theme === 'heaven') {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0.0, '#1e3a8a');
    skyGrad.addColorStop(0.35, '#38bdf8');
    skyGrad.addColorStop(0.72, '#bae6fd');
    skyGrad.addColorStop(1.0, '#fef08a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    const sunBloom = ctx.createRadialGradient(512, 95, 12, 512, 95, 480);
    sunBloom.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
    sunBloom.addColorStop(0.35, 'rgba(254, 240, 138, 0.45)');
    sunBloom.addColorStop(1.0, 'rgba(254, 240, 138, 0.0)');
    ctx.fillStyle = sunBloom;
    ctx.fillRect(0, 0, 1024, 512);
  } else {
    // Deep bioluminescent ocean abyss smooth gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0.0, topColor);
    skyGrad.addColorStop(0.50, midColor);
    skyGrad.addColorStop(1.0, horizonColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    const abyssGlow = ctx.createRadialGradient(512, 120, 20, 512, 120, 440);
    abyssGlow.addColorStop(0.0, 'rgba(34, 211, 238, 0.32)');
    abyssGlow.addColorStop(0.6, 'rgba(14, 116, 144, 0.12)');
    abyssGlow.addColorStop(1.0, 'rgba(2, 6, 23, 0.0)');
    ctx.fillStyle = abyssGlow;
    ctx.fillRect(0, 0, 1024, 512);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.encoding = THREE.sRGBEncoding;
  tex.needsUpdate = true;
  return tex;
}
