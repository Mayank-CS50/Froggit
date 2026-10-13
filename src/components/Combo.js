export const COMBO_WINDOW = 2; // s between eats to keep the chain alive
export const COMBO_MAX = 8;

// Chain-eat state. Every eat inside the window bumps the multiplier; letting the
// window lapse resets it. Popups are returned to the caller for rendering.
export function createCombo() {
  return { count: 0, timer: 0 };
}

export function registerEat(combo, now) {
  combo.count = Math.min(combo.count + 1, COMBO_MAX);
  combo.timer = COMBO_WINDOW;
  return combo.count;
}

export function updateCombo(combo, delta) {
  if (combo.timer > 0) {
    combo.timer -= delta;
    if (combo.timer <= 0) combo.count = 0;
  }
}

export function comboMultiplier(combo) {
  return combo.count;
}
