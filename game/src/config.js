// Starfall — game configuration: one place for every tuning number and the palette.
// The game is a night-sky catch-and-dodge arcade game: steer the little sky fox along
// the bottom of the screen, catch falling stars, dodge the meteors.

export const VIEW = { width: 960, height: 600 };

export const PLAYER = {
  y: 522, // baseline of the fox on the ground line
  halfWidth: 46, // catch radius around the centre
  speed: 560, // pixels per second, keyboard movement
  smooth: 14, // mouse follow responsiveness
};

export const RULES = {
  startLives: 3,
  maxLives: 4,
  pointsPerLevel: 200, // score needed for the next level
  starPoints: 10,
  moonPoints: 25,
  comboStep: 5, // every 5 catches without a miss, the multiplier grows by 1
  comboMax: 8,
  spawnStart: 0.85, // seconds between spawns at level 1
  spawnMin: 0.32, // fastest spawn gap, reached at high levels
  fallStart: 150, // pixels per second at level 1
  fallPerLevel: 26,
  magnetSeconds: 6,
  slowSeconds: 6,
};

export const ODDS = {
  star: 0.6,
  meteor: 0.2,
  moon: 0.05,
  heart: 0.02,
  powerup: 0.13, // split evenly between shield, magnet and slow
};

export const COLORS = {
  skyTop: '#0b1030',
  skyMid: '#241a4d',
  skyBottom: '#4b2360',
  hillFar: '#1c1440',
  hillNear: '#140e2e',
  ground: '#0d0a20',
  gold: '#ffd75e',
  goldSoft: '#ffe9a8',
  silver: '#dfe8ff',
  meteor: '#ff5d47',
  meteorCore: '#ffb199',
  heart: '#ff6b9d',
  shield: '#5ec8ff',
  magnet: '#c07bff',
  slow: '#5effe0',
  fox: '#ff8c42',
  foxDark: '#d96c1e',
  foxBelly: '#fff3e0',
  ink: '#f4f0ff',
  dim: '#b9b3d9',
};

export const SHOT = {
  playSeconds: 14, // how long the deterministic play screenshot simulates
  step: 1 / 60,
};
