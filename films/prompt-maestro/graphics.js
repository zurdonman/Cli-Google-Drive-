// graphics.js — titles, title cards, borders, starbursts. Own type: Anton (fat poster), Eagle Lake (1930s hand lettering).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { P } from './cast.js';

const INK = P.ink;

export function font(g, spec) { g.font = spec; }
export function setSpace(g, px) { if ('letterSpacing' in g) g.letterSpacing = px + 'px'; }

// Fat poster title: ink outline + drop shadow + paper face; letters can hop (dy(i))
export function fatTitle(g, text, cx, cy, size, { bounce = null, face = P.white, shadow = INK, font: fam = 'Anton', track = 0, caseUp = true, bw = .115, maxW = 0 } = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  text = caseUp ? text.toUpperCase() : text;
  if (maxW > 0) { g.font = `${size}px ${fam}`; if ('letterSpacing' in g) g.letterSpacing = track + 'px'; const w0 = g.measureText(text).width; if (w0 > maxW) size = Math.floor(size * maxW / w0); }
  g.font = `${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineJoin = 'round';
  if ('letterSpacing' in g) g.letterSpacing = track + 'px';
  const ws = [...text].map(c => g.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + track * (text.length - 1);
  let x = cx - total / 2;
  const glyphs = [...text].map((c, i) => { const o = { c, x, dy: bounce ? bounce(i) : 0 }; x += ws[i] + track; return o; });
  const base = cy + size * .33;
  for (const L of glyphs) {
    g.fillStyle = shadow; g.strokeStyle = shadow; g.lineWidth = size * bw * 1.1;
    g.strokeText(L.c, L.x + size * .055, base + L.dy + size * .062); g.fillText(L.c, L.x + size * .055, base + L.dy + size * .062);
  }
  for (const L of glyphs) { g.strokeStyle = INK; g.lineWidth = size * bw * 1.35; g.strokeText(L.c, L.x, base + L.dy); }
  for (const L of glyphs) { g.strokeStyle = INK; g.lineWidth = size * bw; g.strokeText(L.c, L.x, base + L.dy); }
  for (const L of glyphs) { g.fillStyle = face; g.fillText(L.c, L.x, base + L.dy); }
  g.restore();
}

// Announcer card (subtitles): plaque with a double rule, corner rings, a little microphone
export function subCard(g, text, cx, cy, { size = 37, alpha = 1, font: fam = 'Eagle Lake', maxW = 1180 } = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha;
  g.font = `${size}px "${fam}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
  let s = size; while (g.measureText(text).width > maxW && s > 22) { s -= 1; g.font = `${s}px "${fam}"`; }
  const tw = g.measureText(text).width, padX = s * 1.05, micW = s * 1.15;
  const w = Math.min(tw + padX * 2 + micW, 1740), h = s * 1.95, x0 = cx - w / 2, y0 = cy - h / 2;
  g.fillStyle = 'rgba(12,11,10,.93)'; g.beginPath(); g.roundRect(x0, y0, w, h, s * .22); g.fill();
  g.strokeStyle = P.paper; g.lineWidth = 2.4; g.beginPath(); g.roundRect(x0 + 7, y0 + 7, w - 14, h - 14, s * .16); g.stroke();
  g.lineWidth = 1; g.beginPath(); g.roundRect(x0 + 12, y0 + 12, w - 24, h - 24, s * .12); g.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const ax = sx > 0 ? x0 + 12 : x0 + w - 12, ay = sy > 0 ? y0 + 12 : y0 + h - 12;
    g.fillStyle = P.paper; g.beginPath(); g.arc(ax + sx * 7, ay + sy * 7, 3.1, 0, 7); g.fill();
    g.lineWidth = 1.3; g.beginPath(); g.arc(ax + sx * 7, ay + sy * 7, 7, 0, 7); g.stroke();
  }
  g.save(); g.translate(x0 + padX * .55 + micW * .42, cy + 2); g.scale(s / 38, s / 38);
  g.strokeStyle = P.paper; g.fillStyle = P.paper; g.lineWidth = 2.3; g.lineCap = 'round';
  g.beginPath(); g.roundRect(-9, -21, 18, 27, 9); g.stroke();
  for (const yy of [-14, -8, -2, 4]) { g.beginPath(); g.moveTo(-5, yy); g.lineTo(5, yy); g.stroke(); }
  g.beginPath(); g.arc(0, -7, 13, .15 * Math.PI, .85 * Math.PI); g.stroke();
  g.beginPath(); g.moveTo(0, 7); g.lineTo(0, 16); g.moveTo(-8, 16); g.lineTo(8, 16); g.stroke();
  g.restore();
  g.fillStyle = P.paper; g.fillText(text, cx + micW / 2, cy + s * .05);
  g.restore();
  return { x0, y0, x1: x0 + w, y1: y0 + h };
}

// A 1930s title card: plate, double rule, starburst behind the words
export function titleCard(g, lines, cx, cy, { w = 1180, h = 420, burst = 0, sub = null } = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const x0 = cx - w / 2, y0 = cy - h / 2;
  g.fillStyle = 'rgba(12,11,10,.94)'; g.beginPath(); g.roundRect(x0, y0, w, h, 26); g.fill();
  g.strokeStyle = P.paper; g.lineWidth = 3; g.beginPath(); g.roundRect(x0 + 10, y0 + 10, w - 20, h - 20, 20); g.stroke();
  g.lineWidth = 1.2; g.beginPath(); g.roundRect(x0 + 18, y0 + 18, w - 36, h - 36, 16); g.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const ax = sx > 0 ? x0 + 18 : x0 + w - 18, ay = sy > 0 ? y0 + 18 : y0 + h - 18;
    g.fillStyle = P.paper; g.beginPath(); g.arc(ax + sx * 9, ay + sy * 9, 3.6, 0, 7); g.fill();
    g.lineWidth = 1.6; g.beginPath(); g.arc(ax + sx * 9, ay + sy * 9, 8.5, 0, 7); g.stroke();
  }
  if (burst) {
    g.save(); g.translate(cx, cy); g.rotate(burst);
    g.fillStyle = 'rgba(241,238,230,.10)';
    for (let i = 0; i < 22; i++) {
      const a0 = i / 22 * TAU, a1 = a0 + TAU / 44;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a0) * w, Math.sin(a0) * w); g.lineTo(Math.cos(a1) * w, Math.sin(a1) * w); g.closePath(); g.fill();
    }
    g.restore();
  }
  g.restore();
  return { x0, y0, w, h };
}

// 1930s deco border used on the blank first + last frames
export function decoBorder(g, inset = 26, t = 0, box = null) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const B = box || { x: inset, y: inset, w: 1920 - inset * 2, h: 1080 - inset * 2 };
  if (box) {
    const i2 = inset, x = B.x + i2, y = B.y + i2, w = B.w - i2 * 2, h = B.h - i2 * 2;
    g.beginPath(); g.roundRect(x, y, w, h, 18); g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.roundRect(x + 10, y + 10, w - 20, h - 20, 12); g.stroke();
    for (const [cx, cy, sx, sy] of [[x + 10, y + 10, 1, 1], [x + w - 10, y + 10, -1, 1], [x + 10, y + h - 10, 1, -1], [x + w - 10, y + h - 10, -1, -1]]) {
      g.beginPath(); g.moveTo(cx + sx * 26, cy); g.lineTo(cx, cy); g.lineTo(cx, cy + sy * 26); g.stroke();
    }
    g.restore(); return;
  }
  g.strokeStyle = 'rgba(241,238,230,.55)'; g.lineWidth = 3;
  g.beginPath(); g.roundRect(inset, inset, 1920 - inset * 2, 1080 - inset * 2, 18); g.stroke();
  g.lineWidth = 1.4; g.beginPath(); g.roundRect(inset + 10, inset + 10, 1920 - (inset + 10) * 2, 1080 - (inset + 10) * 2, 12); g.stroke();
  for (const [x, y, sx, sy] of [[inset + 10, inset + 10, 1, 1], [1920 - inset - 10, inset + 10, -1, 1], [inset + 10, 1080 - inset - 10, 1, -1], [1920 - inset - 10, 1080 - inset - 10, -1, -1]]) {
    g.beginPath(); g.moveTo(x + sx * 26, y); g.lineTo(x, y); g.lineTo(x, y + sy * 26); g.stroke();
  }
  g.restore();
}
