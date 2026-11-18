// Starfall — boot, the game loop and the state machine (title -> playing -> paused
// -> game over -> playing again). The loop runs on requestAnimationFrame with a
// capped delta; screenshot mode instead steps the world a fixed number of times
// and renders once, so its pictures are deterministic.

import { VIEW } from './config.js';
import { mulberry32 } from './random.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createWorld, MODES } from './world.js';
import { render } from './render.js';
import { runShotMode } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const audio = createAudio();
const input = createInput(canvas);
const holder = createWorld(mulberry32((Math.random() * 1e9) | 0), audio);
let { world } = holder;

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// The small API the screenshot driver uses: the same world, stepped by hand.
let autoAxis = 0;
const api = {
  get world() {
    return world;
  },
  resetWithRng(rng) {
    const fresh = createWorld(rng, audio);
    world = fresh.world;
    holder.startGame = fresh.startGame;
    holder.update = fresh.update;
    holder.endGame = fresh.endGame;
  },
  startGame() {
    holder.startGame();
  },
  setAutoAxis(v) {
    autoAxis = v;
  },
  step(dt) {
    const fakeInput = {
      axis: () => autoAxis,
      hasMouse: () => false,
      mouseTarget: () => world.player.x,
    };
    holder.update(dt, fakeInput);
  },
  renderOnce() {
    render(ctx, world);
  },
};

function frame(now) {
  const dt = Math.min(0.05, (now - frame.last) / 1000 || 0.016);
  frame.last = now;

  if (input.consume('mute')) {
    const muted = audio.toggleMute();
    document.title = muted ? 'Starfall (muted)' : 'Starfall';
  }

  if (world.mode === MODES.TITLE) {
    holder.update(dt, input);
    if (input.consumeConfirm()) holder.startGame();
  } else if (world.mode === MODES.PLAYING) {
    if (input.consume('pause')) {
      world.mode = MODES.PAUSED;
    } else {
      holder.update(dt, input);
    }
  } else if (world.mode === MODES.PAUSED) {
    if (input.consume('pause') || input.consumeConfirm()) world.mode = MODES.PLAYING;
  } else if (world.mode === MODES.OVER) {
    holder.update(dt, input);
    if (input.consume('restart') || input.consumeConfirm()) holder.startGame();
  }

  render(ctx, world);
  input.endFrame();
  requestAnimationFrame(frame);
}
frame.last = 0;

// Screenshot mode takes over before the loop starts: no animation, one frozen frame.
if (!runShotMode(api, window.location.search)) {
  requestAnimationFrame(frame);
} else {
  // A one-line report of the frozen state, readable from the page title.
  document.title = `Starfall shot: mode=${world.mode} score=${world.score} lives=${world.lives} hits=${world.stats.hits} caught=${world.stats.caught}`;
}
