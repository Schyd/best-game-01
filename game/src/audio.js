// Starfall — all sound is synthesised with the Web Audio API, so the game ships no
// audio files and makes no network request. Every effect is a short oscillator blip
// with an envelope; the little level-up fanfare is a few notes in a row.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, at, dur, type, gain) {
    const ac = ensure();
    if (!ac || muted) return;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + at);
    amp.gain.setValueAtTime(0.0001, ac.currentTime + at);
    amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + at + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(ac.currentTime + at);
    osc.stop(ac.currentTime + at + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    // A catch rings higher the bigger the combo is.
    catch(combo) {
      const base = 620 + Math.min(combo, 12) * 32;
      tone(base, 0, 0.12, 'sine', 0.16);
      tone(base * 1.5, 0.05, 0.14, 'sine', 0.12);
    },
    moon() {
      tone(880, 0, 0.14, 'triangle', 0.16);
      tone(1318, 0.07, 0.2, 'triangle', 0.12);
    },
    powerup() {
      tone(523, 0, 0.1, 'square', 0.07);
      tone(659, 0.08, 0.1, 'square', 0.07);
      tone(784, 0.16, 0.16, 'square', 0.07);
    },
    hit() {
      tone(160, 0, 0.28, 'sawtooth', 0.2);
      tone(90, 0.02, 0.32, 'sine', 0.22);
    },
    levelUp() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.18, 'triangle', 0.14));
    },
    gameOver() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.14));
    },
    click() {
      tone(700, 0, 0.06, 'sine', 0.1);
    },
  };
}
