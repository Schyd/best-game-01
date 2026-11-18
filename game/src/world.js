// Starfall — the world: game state, the fox, falling things, particles and the rules
// that turn a catch into points and a meteor into a lost life. Rendering lives in
// render.js; this file only decides what exists and how it moves.

import { VIEW, PLAYER, RULES, ODDS, SHOT } from './config.js';
import { range, weighted } from './random.js';

export const MODES = { TITLE: 'title', PLAYING: 'playing', PAUSED: 'paused', OVER: 'over' };

const POWERUPS = ['shield', 'magnet', 'slow'];

export function createWorld(rng, audio) {
  const world = {
    mode: MODES.TITLE,
    rng,
    audio,
    time: 0,
    score: 0,
    best: 0,
    combo: 0,
    bestCombo: 0,
    multiplier: 1,
    lives: RULES.startLives,
    level: 1,
    spawnIn: 0.6,
    powerupIndex: 0,
    player: { x: VIEW.width / 2, tilt: 0, shield: false, magnetUntil: 0, slowUntil: 0 },
    items: [],
    particles: [],
    floaters: [],
    banner: null, // { text, until } — big centre message, e.g. LEVEL UP
    shake: 0,
    flash: 0,
    stats: { caught: 0, missed: 0, hits: 0 },
    starfield: [],
  };

  // A fixed twinkling sky, generated once so the title screen is stable.
  for (let i = 0; i < 110; i += 1) {
    world.starfield.push({
      x: rng() * VIEW.width,
      y: rng() * VIEW.height * 0.62,
      r: range(rng, 0.6, 2.1),
      phase: rng() * Math.PI * 2,
      speed: range(rng, 0.4, 1.6),
    });
  }

  function levelFor(score) {
    return 1 + Math.floor(score / RULES.pointsPerLevel);
  }

  function fallSpeed() {
    const base = RULES.fallStart + (world.level - 1) * RULES.fallPerLevel;
    return world.time < world.player.slowUntil ? base * 0.55 : base;
  }

  function spawnGap() {
    const gap = RULES.spawnStart - (world.level - 1) * 0.07;
    return Math.max(RULES.spawnMin, gap);
  }

  function spawnItem() {
    const kind = weighted(world.rng, [
      [ODDS.star, 'star'],
      [ODDS.meteor, 'meteor'],
      [ODDS.moon, 'moon'],
      [ODDS.heart, 'heart'],
      [ODDS.powerup, 'powerup'],
    ]);
    let type = kind;
    let power = null;
    if (kind === 'powerup') {
      power = POWERUPS[world.powerupIndex % POWERUPS.length];
      world.powerupIndex += 1;
      type = power;
    }
    const speed = fallSpeed() * range(world.rng, 0.85, 1.25);
    world.items.push({
      type,
      x: range(world.rng, 30, VIEW.width - 30),
      y: -30,
      vy: speed,
      spin: range(world.rng, -1.4, 1.4),
      angle: range(world.rng, 0, Math.PI * 2),
      wobble: range(world.rng, 0, Math.PI * 2),
      size: type === 'meteor' ? 26 : 20,
    });
  }

  function burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = world.rng() * Math.PI * 2;
      const v = range(world.rng, speed * 0.3, speed);
      world.particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 40,
        life: range(world.rng, 0.35, 0.8),
        max: 0.8,
        size: range(world.rng, 2, 5),
        color,
      });
    }
  }

  function floater(x, y, text, color) {
    world.floaters.push({ x, y, text, color, life: 1.1 });
  }

  function addScore(base, x, y) {
    const points = base * world.multiplier;
    world.score += points;
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    world.multiplier = 1 + Math.min(RULES.comboMax - 1, Math.floor(world.combo / RULES.comboStep));
    floater(x, y, `+${points}`, '#ffe9a8');
    const next = levelFor(world.score);
    if (next > world.level) {
      world.level = next;
      world.banner = { text: `LEVEL ${next}`, until: world.time + 1.6 };
      world.audio.levelUp();
    }
    return points;
  }

  function loseCombo() {
    if (world.combo >= RULES.comboStep) floater(world.player.x, PLAYER.y - 70, 'combo lost', '#b9b3d9');
    world.combo = 0;
    world.multiplier = 1;
  }

  function takeHit(item) {
    world.stats.hits += 1;
    loseCombo();
    if (world.player.shield) {
      world.player.shield = false;
      floater(world.player.x, PLAYER.y - 70, 'shield saved you!', '#5ec8ff');
      burst(item.x, item.y, '#5ec8ff', 18, 220);
      world.audio.powerup();
      return;
    }
    world.lives -= 1;
    world.shake = 14;
    world.flash = 0.45;
    burst(item.x, item.y, '#ff5d47', 26, 300);
    world.audio.hit();
    if (world.lives <= 0) endGame();
  }

  function collect(item) {
    const p = world.player;
    if (item.type === 'star') {
      world.stats.caught += 1;
      addScore(RULES.starPoints, item.x, item.y);
      burst(item.x, item.y, '#ffd75e', 12, 180);
      world.audio.catch(world.combo);
    } else if (item.type === 'moon') {
      world.stats.caught += 1;
      addScore(RULES.moonPoints, item.x, item.y);
      burst(item.x, item.y, '#dfe8ff', 16, 200);
      world.audio.moon();
    } else if (item.type === 'heart') {
      if (world.lives < RULES.maxLives) {
        world.lives += 1;
        floater(item.x, item.y, '+1 life', '#ff6b9d');
      } else {
        addScore(RULES.starPoints * 2, item.x, item.y);
      }
      burst(item.x, item.y, '#ff6b9d', 14, 180);
      world.audio.moon();
    } else if (item.type === 'shield') {
      p.shield = true;
      floater(item.x, item.y, 'shield!', '#5ec8ff');
      world.audio.powerup();
    } else if (item.type === 'magnet') {
      p.magnetUntil = world.time + RULES.magnetSeconds;
      floater(item.x, item.y, 'magnet!', '#c07bff');
      world.audio.powerup();
    } else if (item.type === 'slow') {
      p.slowUntil = world.time + RULES.slowSeconds;
      floater(item.x, item.y, 'slow fall!', '#5effe0');
      world.audio.powerup();
    }
  }

  function endGame() {
    world.mode = MODES.OVER;
    world.best = Math.max(world.best, world.score);
    try {
      const saved = Number(window.localStorage.getItem('starfall-best') || 0);
      world.best = Math.max(world.best, saved);
      window.localStorage.setItem('starfall-best', String(world.best));
    } catch {
      // Storage may be unavailable; the in-memory best still shows.
    }
    world.audio.gameOver();
  }

  function startGame() {
    world.mode = MODES.PLAYING;
    world.time = 0;
    world.score = 0;
    world.combo = 0;
    world.bestCombo = 0;
    world.multiplier = 1;
    world.lives = RULES.startLives;
    world.level = 1;
    world.spawnIn = 0.5;
    world.items = [];
    world.particles = [];
    world.floaters = [];
    world.banner = { text: 'CATCH THE STARS!', until: 1.6 };
    world.player.x = VIEW.width / 2;
    world.player.shield = false;
    world.player.magnetUntil = 0;
    world.player.slowUntil = 0;
    try {
      world.best = Number(window.localStorage.getItem('starfall-best') || 0);
    } catch {
      world.best = 0;
    }
    world.audio.unlock();
    world.audio.click();
  }

  function updatePlaying(dt, input) {
    const p = world.player;
    // Steering: the mouse leads, the keys nudge.
    const axis = input.axis();
    if (axis !== 0) {
      p.x += axis * PLAYER.speed * dt;
      p.tilt = axis * 0.16;
    } else if (input.hasMouse()) {
      const target = Math.max(30, Math.min(VIEW.width - 30, input.mouseTarget()));
      const dx = target - p.x;
      p.x += dx * Math.min(1, PLAYER.smooth * dt);
      p.tilt = Math.max(-0.2, Math.min(0.2, dx * 0.0012));
    } else {
      p.tilt *= 0.9;
    }
    p.x = Math.max(28, Math.min(VIEW.width - 28, p.x));

    world.spawnIn -= dt;
    if (world.spawnIn <= 0) {
      spawnItem();
      world.spawnIn = spawnGap() * range(world.rng, 0.75, 1.25);
    }

    const magnetOn = world.time < p.magnetUntil;
    for (const item of world.items) {
      item.y += item.vy * dt;
      item.angle += item.spin * dt;
      item.wobble += dt * 2;
      item.x += Math.sin(item.wobble) * 12 * dt;
      if (magnetOn && (item.type === 'star' || item.type === 'moon' || item.type === 'heart')) {
        const dx = p.x - item.x;
        const dy = PLAYER.y - item.y;
        const d = Math.hypot(dx, dy) || 1;
        item.x += (dx / d) * 260 * dt;
        item.y += (dy / d) * 120 * dt;
      }
    }

    // Collisions and the ground.
    const kept = [];
    for (const item of world.items) {
      const nearY = Math.abs(item.y - PLAYER.y) < 52;
      const nearX = Math.abs(item.x - p.x) < PLAYER.halfWidth + item.size * 0.4;
      if (nearY && nearX) {
        if (item.type === 'meteor') takeHit(item);
        else collect(item);
        if (world.mode !== MODES.PLAYING) return; // game over ends the update
        continue;
      }
      if (item.y > VIEW.height + 30) {
        if (item.type === 'star' || item.type === 'moon') {
          world.stats.missed += 1;
          loseCombo();
        }
        continue;
      }
      kept.push(item);
    }
    world.items = kept;

    for (const part of world.particles) {
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vy += 260 * dt;
      part.life -= dt;
    }
    world.particles = world.particles.filter((part) => part.life > 0);
    for (const f of world.floaters) {
      f.y -= 42 * dt;
      f.life -= dt;
    }
    world.floaters = world.floaters.filter((f) => f.life > 0);
  }

  function update(dt, input) {
    world.time += dt;
    world.shake = Math.max(0, world.shake - 40 * dt);
    world.flash = Math.max(0, world.flash - dt * 1.4);
    if (world.banner && world.time > world.banner.until) world.banner = null;
    if (world.mode === MODES.PLAYING) updatePlaying(dt, input);
    else {
      // The title and end screens keep a gentle rain of stars behind them.
      world.spawnIn -= dt;
      if (world.spawnIn <= 0 && world.items.length < 14) {
        spawnItem();
        world.spawnIn = 0.55;
      }
      for (const item of world.items) {
        item.y += item.vy * 0.5 * dt;
        item.angle += item.spin * dt;
      }
      world.items = world.items.filter((item) => item.y < VIEW.height + 30);
    }
  }

  return { world, startGame, endGame, update, MODES };
}

export { SHOT };
