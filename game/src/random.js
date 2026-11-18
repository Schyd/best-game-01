// Starfall — deterministic random numbers.
// The live game uses Math.random; screenshot mode seeds this generator so a shot can
// be reproduced exactly. Mulberry32 is small, fast and good enough for a game.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A tiny helper around a random function: pick a value in [min, max).
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

// Pick one entry from a weighted table: [[weight, value], ...].
export function weighted(rng, table) {
  let total = 0;
  for (const [w] of table) total += w;
  let roll = rng() * total;
  for (const [w, value] of table) {
    roll -= w;
    if (roll <= 0) return value;
  }
  return table[table.length - 1][1];
}
