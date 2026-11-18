// Starfall — deterministic screenshot mode, used for the entry's screenshots.
// ?shot=start shows the title screen, ?shot=play&seed=N simulates real play with a
// seeded random generator and a simple auto-player, and ?shot=end&seed=N simulates a
// run where the fox never moves, so it ends on the game-over screen. Every shot is a
// real render of the game's own code, frozen at a fixed moment, so the pictures the
// judge sees are exactly what a player sees.

import { SHOT } from './config.js';
import { mulberry32 } from './random.js';
import { MODES } from './world.js';

function parseShot(search) {
  const params = new URLSearchParams(search);
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number(params.get('seed') || 1) || 1;
  return { shot, seed };
}

// The auto-player: chase the lowest star or moon on screen.
function autoPlayer(world) {
  let best = null;
  for (const item of world.items) {
    if (item.type !== 'star' && item.type !== 'moon' && item.type !== 'heart') continue;
    if (!best || item.y > best.y) best = item;
  }
  if (!best) return 0;
  const dx = best.x - world.player.x;
  if (Math.abs(dx) < 8) return 0;
  return dx > 0 ? 1 : -1;
}

export function runShotMode(api, search) {
  const parsed = parseShot(search);
  if (!parsed) return false;
  const { shot, seed } = parsed;
  const rng = mulberry32(seed * 7919 + 13);

  if (shot === 'start') {
    api.resetWithRng(rng);
    api.world.time = 2.4; // a settled, pretty starfield
    api.renderOnce();
    return true;
  }

  if (shot === 'play') {
    api.resetWithRng(rng);
    api.startGame();
    const steps = Math.round(SHOT.playSeconds / SHOT.step);
    for (let i = 0; i < steps; i += 1) {
      // Feed the auto-player through the same input the human uses.
      api.setAutoAxis(autoPlayer(api.world));
      api.step(SHOT.step);
      if (api.world.mode !== MODES.PLAYING) break;
    }
    api.setAutoAxis(0);
    api.renderOnce();
    return true;
  }

  if (shot === 'end') {
    api.resetWithRng(rng);
    api.startGame();
    // Never move: meteors do their work, and the run ends on its own. The cap is
    // generous so the shot ends on the game-over screen even on an unlucky seed.
    const maxSteps = Math.round(600 / SHOT.step);
    for (let i = 0; i < maxSteps; i += 1) {
      api.step(SHOT.step);
      if (api.world.mode === MODES.OVER) break;
    }
    api.world.time += 1.2; // let the end panel settle
    api.renderOnce();
    return true;
  }

  return false;
}
