// Starfall — keyboard and mouse input, kept apart from the game logic so the world
// only ever asks "where does the player want to be, and what did they just press?".

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // edge-triggered keys, consumed once per frame
  let mouseX = null;
  let mouseActive = false;
  let clicked = false;

  function keyName(event) {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') return 'left';
    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') return 'right';
    if (event.key === 'Enter' || event.key === ' ') return 'confirm';
    if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') return 'pause';
    if (event.key === 'r' || event.key === 'R') return 'restart';
    if (event.key === 'm' || event.key === 'M') return 'mute';
    return null;
  }

  window.addEventListener('keydown', (event) => {
    const name = keyName(event);
    if (!name) return;
    event.preventDefault();
    if (!event.repeat) pressed.add(name);
    keys.add(name);
  });
  window.addEventListener('keyup', (event) => {
    const name = keyName(event);
    if (name) keys.delete(name);
  });

  function pointer(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouseActive = true;
  }
  canvas.addEventListener('pointermove', pointer);
  canvas.addEventListener('pointerdown', (event) => {
    pointer(event);
    clicked = true;
  });

  return {
    // -1, 0 or 1 from the held movement keys.
    axis() {
      return (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
    },
    hasMouse() {
      return mouseActive;
    },
    mouseTarget() {
      return mouseX;
    },
    // True once after a click or a confirm key, then cleared.
    consumeConfirm() {
      const hit = clicked || pressed.has('confirm');
      clicked = false;
      pressed.delete('confirm');
      return hit;
    },
    consume(name) {
      const hit = pressed.has(name);
      pressed.delete(name);
      return hit;
    },
    endFrame() {
      pressed.clear();
      clicked = false;
    },
  };
}
