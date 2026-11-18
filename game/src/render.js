// Starfall — every pixel the game draws. The art is all canvas vector drawing:
// a gradient night sky, a twinkling starfield, two hill silhouettes, a little sky
// fox with a glowing trail, and bright chunky falling things that read at a glance.

import { VIEW, PLAYER, COLORS, RULES } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStarShape(ctx, x, y, r, points, inner) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawBackground(ctx, world) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  g.addColorStop(0, COLORS.skyTop);
  g.addColorStop(0.55, COLORS.skyMid);
  g.addColorStop(1, COLORS.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  // Twinkling stars.
  for (const s of world.starfield) {
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(world.time * s.speed + s.phase));
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // A sleepy moon, upper left, clear of the HUD panels.
  const mx = 120;
  const my = 122;
  const moon = ctx.createRadialGradient(mx, my, 8, mx, my, 46);
  moon.addColorStop(0, 'rgba(255, 248, 220, 0.95)');
  moon.addColorStop(0.5, 'rgba(255, 248, 220, 0.35)');
  moon.addColorStop(1, 'rgba(255, 248, 220, 0)');
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(mx, my, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6d8';
  ctx.beginPath();
  ctx.arc(mx, my, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(214, 196, 150, 0.7)';
  ctx.beginPath();
  ctx.arc(mx - 8, my - 5, 5, 0, Math.PI * 2);
  ctx.arc(mx + 7, my + 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Two hill silhouettes and the ground the fox runs on.
  ctx.fillStyle = COLORS.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(220, 380, 460, 460);
  ctx.quadraticCurveTo(680, 530, 960, 430);
  ctx.lineTo(960, VIEW.height);
  ctx.lineTo(0, VIEW.height);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.quadraticCurveTo(300, 460, 560, 510);
  ctx.quadraticCurveTo(780, 552, 960, 500);
  ctx.lineTo(960, VIEW.height);
  ctx.lineTo(0, VIEW.height);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, 552, VIEW.width, VIEW.height - 552);
  ctx.fillStyle = 'rgba(255, 215, 94, 0.25)';
  ctx.fillRect(0, 552, VIEW.width, 2);
}

function drawFox(ctx, world) {
  const p = world.player;
  const x = p.x;
  const y = PLAYER.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.tilt);

  // Glow trail behind the fox.
  const trail = ctx.createRadialGradient(0, -6, 4, 0, -6, 52);
  trail.addColorStop(0, 'rgba(255, 140, 66, 0.5)');
  trail.addColorStop(1, 'rgba(255, 140, 66, 0)');
  ctx.fillStyle = trail;
  ctx.beginPath();
  ctx.arc(0, -6, 52, 0, Math.PI * 2);
  ctx.fill();

  // Tail, wagging with time.
  const wag = Math.sin(world.time * 6) * 0.12;
  ctx.save();
  ctx.translate(-30, 6);
  ctx.rotate(0.5 + wag);
  ctx.fillStyle = COLORS.foxDark;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.foxBelly;
  ctx.beginPath();
  ctx.ellipse(-22, 0, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body.
  ctx.fillStyle = COLORS.fox;
  ctx.beginPath();
  ctx.ellipse(0, -4, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.foxBelly;
  ctx.beginPath();
  ctx.ellipse(4, 4, 20, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head.
  ctx.fillStyle = COLORS.fox;
  ctx.beginPath();
  ctx.arc(6, -30, 24, 0, Math.PI * 2);
  ctx.fill();
  // Ears.
  ctx.fillStyle = COLORS.fox;
  ctx.beginPath();
  ctx.moveTo(-12, -46);
  ctx.lineTo(-6, -68);
  ctx.lineTo(4, -50);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -50);
  ctx.lineTo(24, -66);
  ctx.lineTo(28, -44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.foxDark;
  ctx.beginPath();
  ctx.moveTo(-9, -50);
  ctx.lineTo(-6, -62);
  ctx.lineTo(0, -51);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(15, -51);
  ctx.lineTo(22, -60);
  ctx.lineTo(25, -47);
  ctx.closePath();
  ctx.fill();
  // Face: cheeks, eyes, nose.
  ctx.fillStyle = COLORS.foxBelly;
  ctx.beginPath();
  ctx.ellipse(2, -24, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241a2e';
  ctx.beginPath();
  ctx.arc(-2, -34, 3.4, 0, Math.PI * 2);
  ctx.arc(14, -34, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-1, -35, 1.2, 0, Math.PI * 2);
  ctx.arc(15, -35, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241a2e';
  ctx.beginPath();
  ctx.arc(6, -22, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Shield ring.
  if (p.shield) {
    ctx.save();
    ctx.strokeStyle = 'rgba(94, 200, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.lineDashOffset = -world.time * 30;
    ctx.beginPath();
    ctx.arc(x, y - 18, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Magnet aura.
  if (world.time < p.magnetUntil) {
    ctx.save();
    ctx.strokeStyle = 'rgba(192, 123, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 18, 66 + Math.sin(world.time * 5) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawItem(ctx, item, time) {
  ctx.save();
  ctx.translate(item.x, item.y);
  if (item.type === 'star') {
    ctx.rotate(Math.sin(item.angle) * 0.2);
    ctx.shadowColor = COLORS.gold;
    ctx.shadowBlur = 16;
    ctx.fillStyle = COLORS.gold;
    drawStarShape(ctx, 0, 0, item.size, 5, 0.45);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.goldSoft;
    drawStarShape(ctx, 0, 0, item.size * 0.55, 5, 0.45);
    ctx.fill();
  } else if (item.type === 'moon') {
    ctx.shadowColor = COLORS.silver;
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#f4f7ff';
    ctx.beginPath();
    ctx.arc(0, 0, item.size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#c9d4ef';
    ctx.beginPath();
    ctx.arc(-5, -4, 4, 0, Math.PI * 2);
    ctx.arc(6, 5, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'meteor') {
    // The flame tail always points up, against the fall; only a slight wobble
    // tilts it, so the meteor reads as falling even in a still frame.
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(Math.sin(item.wobble) * 0.12);
    ctx.shadowColor = COLORS.meteor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = COLORS.meteor;
    ctx.beginPath();
    ctx.arc(0, 0, item.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.meteorCore;
    ctx.beginPath();
    ctx.arc(-4, -5, 7, 0, Math.PI * 2);
    ctx.arc(8, 6, 5, 0, Math.PI * 2);
    ctx.fill();
    // Flame tail, trailing upward.
    ctx.fillStyle = 'rgba(255, 120, 60, 0.55)';
    ctx.beginPath();
    ctx.moveTo(-item.size * 0.5, -item.size * 0.4);
    ctx.lineTo(0, -item.size * 1.9);
    ctx.lineTo(item.size * 0.5, -item.size * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (item.type === 'heart') {
    const s = item.size / 20;
    ctx.scale(s, s);
    ctx.shadowColor = COLORS.heart;
    ctx.shadowBlur = 12;
    ctx.fillStyle = COLORS.heart;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-16, -2, -12, -14, 0, -6);
    ctx.bezierCurveTo(12, -14, 16, -2, 0, 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Power-ups: shield, magnet, slow — a glowing orb with a symbol.
    const color = item.type === 'shield' ? COLORS.shield : item.type === 'magnet' ? COLORS.magnet : COLORS.slow;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(20, 16, 48, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, item.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, item.size - 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.type === 'shield' ? 'S' : item.type === 'magnet' ? 'M' : 'Z', 0, 1);
  }
  ctx.restore();
  void time;
}

function drawParticles(ctx, world) {
  for (const part of world.particles) {
    ctx.globalAlpha = Math.max(0, part.life / part.max);
    ctx.fillStyle = part.color;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloaters(ctx, world) {
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function drawHearts(ctx, x, y, lives) {
  for (let i = 0; i < RULES.maxLives; i += 1) {
    const hx = x + i * 30;
    ctx.save();
    ctx.translate(hx, y);
    ctx.scale(0.85, 0.85);
    ctx.fillStyle = i < lives ? COLORS.heart : 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-14, -2, -10, -12, 0, -5);
    ctx.bezierCurveTo(10, -12, 14, -2, 0, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawHud(ctx, world) {
  // Top bar.
  ctx.fillStyle = 'rgba(10, 8, 32, 0.55)';
  roundRect(ctx, 14, 12, 300, 64, 12);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.dim;
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillText('SCORE', 28, 32);
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(String(world.score), 28, 62);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillText('BEST', 190, 32);
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(String(Math.max(world.best, world.score)), 190, 58);

  // Combo badge.
  if (world.multiplier > 1) {
    ctx.fillStyle = 'rgba(255, 215, 94, 0.9)';
    roundRect(ctx, 326, 12, 118, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`COMBO x${world.multiplier}`, 385, 38);
    ctx.textAlign = 'left';
  }

  // Lives and level, top right.
  ctx.fillStyle = 'rgba(10, 8, 32, 0.55)';
  roundRect(ctx, VIEW.width - 268, 12, 254, 64, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.dim;
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillText('LIVES', VIEW.width - 252, 32);
  drawHearts(ctx, VIEW.width - 246, 52, world.lives);
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('LEVEL', VIEW.width - 108, 32);
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText(String(world.level), VIEW.width - 108, 60);

  // Level progress bar.
  const intoLevel = world.score % RULES.pointsPerLevel;
  const frac = intoLevel / RULES.pointsPerLevel;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  roundRect(ctx, 14, 86, 220, 8, 4);
  ctx.fill();
  ctx.fillStyle = COLORS.gold;
  roundRect(ctx, 14, 86, Math.max(8, 220 * frac), 8, 4);
  ctx.fill();
  ctx.fillStyle = COLORS.dim;
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.fillText(`NEXT LEVEL ${RULES.pointsPerLevel - intoLevel} PTS`, 244, 94);

  // Active power-up timers.
  let badgeY = 104;
  const p = world.player;
  const badges = [];
  if (p.shield) badges.push(['SHIELD', COLORS.shield]);
  if (world.time < p.magnetUntil) badges.push([`MAGNET ${Math.ceil(p.magnetUntil - world.time)}s`, COLORS.magnet]);
  if (world.time < p.slowUntil) badges.push([`SLOW ${Math.ceil(p.slowUntil - world.time)}s`, COLORS.slow]);
  for (const [label, color] of badges) {
    ctx.fillStyle = 'rgba(10, 8, 32, 0.55)';
    roundRect(ctx, 14, badgeY, 132, 26, 13);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(label, 28, badgeY + 18);
    badgeY += 32;
  }
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(12, 9, 36, 0.82)';
  roundRect(ctx, x, y, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 94, 0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 20);
  ctx.stroke();
}

function drawTitle(ctx, world) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  panel(ctx, 200, 108, 560, 330);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 74px system-ui, sans-serif';
  ctx.shadowColor = 'rgba(255, 215, 94, 0.6)';
  ctx.shadowBlur = 30;
  ctx.fillText('STARFALL', VIEW.width / 2, 205);
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.ink;
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillText('A tiny fox, a falling sky, one brave night', VIEW.width / 2, 240);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Catch the golden stars  ·  Dodge the red meteors', VIEW.width / 2, 288);
  ctx.fillText('Moons are worth more  ·  Hearts heal  ·  Orbs grant powers', VIEW.width / 2, 314);
  ctx.fillStyle = COLORS.ink;
  ctx.font = '600 17px system-ui, sans-serif';
  ctx.fillText('Move:  ←  →  or mouse    ·    Start: Enter or click', VIEW.width / 2, 356);
  const pulse = 0.65 + 0.35 * Math.sin(world.time * 3);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('▶  PRESS ENTER TO PLAY', VIEW.width / 2, 408);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.dim;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('P pause   ·   M mute   ·   Best score is saved on this computer', VIEW.width / 2, 584);
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(8, 6, 26, 0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText('PAUSED', VIEW.width / 2, 280);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('Press P or click to keep playing', VIEW.width / 2, 322);
}

function drawGameOver(ctx, world) {
  ctx.fillStyle = 'rgba(8, 6, 26, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.textAlign = 'center';
  panel(ctx, 230, 120, 500, 330);
  ctx.fillStyle = COLORS.meteor;
  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.fillText('NIGHT OVER', VIEW.width / 2, 198);
  ctx.fillStyle = COLORS.ink;
  ctx.font = '600 19px system-ui, sans-serif';
  ctx.fillText('The meteors won this time — the sky will fall again.', VIEW.width / 2, 232);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText('FINAL SCORE', VIEW.width / 2, 282);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText(String(world.score), VIEW.width / 2, 336);
  ctx.fillStyle = COLORS.ink;
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText(`Best  ${Math.max(world.best, world.score)}    ·    Level ${world.level}    ·    Best combo x${Math.max(1, 1 + Math.floor(world.bestCombo / RULES.comboStep))}    ·    Stars caught ${world.stats.caught}`, VIEW.width / 2, 372);
  const pulse = 0.65 + 0.35 * Math.sin(world.time * 3);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 21px system-ui, sans-serif';
  ctx.fillText('↻  PRESS R TO PLAY AGAIN', VIEW.width / 2, 420);
  ctx.globalAlpha = 1;
}

function drawBanner(ctx, world) {
  if (!world.banner) return;
  ctx.textAlign = 'center';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.shadowColor = 'rgba(255, 215, 94, 0.7)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = COLORS.goldSoft;
  ctx.fillText(world.banner.text, VIEW.width / 2, 210);
  ctx.shadowBlur = 0;
}

export function render(ctx, world) {
  ctx.save();
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake);
  }
  drawBackground(ctx, world);
  for (const item of world.items) drawItem(ctx, item, world.time);
  drawParticles(ctx, world);
  drawFox(ctx, world);
  drawFloaters(ctx, world);
  if (world.mode === 'playing' || world.mode === 'paused') drawHud(ctx, world);
  drawBanner(ctx, world);
  if (world.mode === 'title') drawTitle(ctx, world);
  if (world.mode === 'paused') drawPaused(ctx);
  if (world.mode === 'over') drawGameOver(ctx, world);
  ctx.restore();

  // Red flash on taking a hit.
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255, 60, 40, ${world.flash * 0.45})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
}
