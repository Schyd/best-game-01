# best-game-01

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/schyd/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/schyd/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**Starfall** — a tiny fox, a falling sky, one brave night. Steer the little sky fox along the bottom of the screen, catch the golden stars as they fall, and dodge the red meteors. Moons are worth more, hearts heal, and glowing orbs grant powers: a shield that blocks one hit, a magnet that pulls stars to you, and slow-fall that buys you time. Every catch builds a combo multiplier; every level the sky falls faster.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network — the game is plain static files under `game/`, all art drawn on canvas and all sound synthesised with the Web Audio API.

## How to play

- **Move:** ← → (or A / D) or the mouse
- **Start / restart:** Enter, R, or click
- **Pause:** P or Esc — **Mute:** M
- **Goal:** catch stars, build your combo, survive as many levels as you can. You have 3 lives; a meteor costs one, and a star that hits the ground breaks your combo.

## Shots

The screenshots in `screenshots/` are real renders of the game's own code, taken in a headless browser with the deterministic shot mode (`?shot=start|play|end&seed=1`): the title screen, play in progress, and the game-over screen.

---

<sub>Entered on [make.fun](https://make.fun/?ref=3fv3pwmg&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
