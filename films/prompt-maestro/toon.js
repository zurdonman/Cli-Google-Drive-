// toon.js — minimal rubber-hose vector engine (own code): affine stack, constant screen-space ink,
// 12 fps line boil, flat fill with hard-edged shadow clipped to the shape.
import { clamp, lerp, hash, vnoise, TAU } from '/core/lib.js';
export const W = 1920, H = 1080, INK = '#0E0D0C';
export let g = null;
export function init(cv) { g = cv.getContext('2d'); return g; }

let M = [1, 0, 0, 1, 0, 0]; const ST = [];
let TSEQ = 0; const dirty = () => { TSEQ++; };
export const push = () => { ST.push(M.slice()); dirty(); };
export const pop = () => { M = ST.pop() || [1, 0, 0, 1, 0, 0]; dirty(); };
export const nextSeq = () => TSEQ;
export const reset = () => { M = [1, 0, 0, 1, 0, 0]; ST.length = 0; };
export const getM = () => M.slice();
export const setM = m => { M = m.slice(); TSEQ++; };
export function mul(a, b, c, d, e, f) { M = [M[0] * a + M[2] * b, M[1] * a + M[3] * b, M[0] * c + M[2] * d, M[1] * c + M[3] * d, M[0] * e + M[2] * f + M[4], M[1] * e + M[3] * f + M[5]]; TSEQ++; }
export const translate = (x, y) => mul(1, 0, 0, 1, x, y);
export const scale = (sx, sy = sx) => mul(sx, 0, 0, sy, 0, 0);
export const rotate = a => { const c = Math.cos(a), s = Math.sin(a); mul(c, s, -s, c, 0, 0); };
export const tx = (x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
export const zoom = () => Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2]));

export const S = { boil: 0, amp: 1.2, lw: 6 };
export function frame(t, amp = 1.2) { S.boil = Math.floor(t * 12 + 1e-6) % 3; S.amp = amp; reset(); g.setTransform(1, 0, 0, 1, 0, 0); }

// —— point builders (character-local) ——
export function ell(cx, cy, rx, ry, n = 0, a0 = 0) {
  if (!n) n = Math.max(14, Math.min(80, Math.round((rx + ry) * zoom() * .22)));
  const p = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p;
}
export function arc(cx, cy, rx, ry, a0, a1, n = 20) { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
export function spline(c, closed = true, k = 7) {
  const n = c.length, out = [], Q = i => closed ? c[(i + n) % n] : c[clamp(i, 0, n - 1)], m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = Q(i - 1), p1 = Q(i), p2 = Q(i + 1), p3 = Q(i + 2);
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  if (!closed) out.push(c[n - 1]);
  return out;
}
export function quad(a, c, b, n = 12) { const p = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; p.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } return p; }
export const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const p = [];
  for (const [cx, cy, a] of [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]) {
    for (let i = 0; i <= 5; i++) { const b = a + i / 5 * Math.PI / 2; p.push([cx + Math.cos(b) * r, cy + Math.sin(b) * r]); }
  }
  return p;
}
// noodle limb: constant-width tube along a bent centre line
export function noodle(a, b, bend, w) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const c = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend];
  const mid = quad(a, c, b, 16), Lp = [], Rp = [];
  for (let i = 0; i < mid.length; i++) {
    const p = mid[i], q = mid[Math.min(mid.length - 1, i + 1)], o = mid[Math.max(0, i - 1)];
    let dx2 = q[0] - o[0], dy2 = q[1] - o[1]; const l = Math.hypot(dx2, dy2) || 1; dx2 /= l; dy2 /= l;
    Lp.push([p[0] - dy2 * w / 2, p[1] + dx2 * w / 2]); Rp.push([p[0] + dy2 * w / 2, p[1] - dx2 * w / 2]);
  }
  const eA = Math.atan2(mid[mid.length - 1][1] - mid[mid.length - 2][1], mid[mid.length - 1][0] - mid[mid.length - 2][0]);
  const bA = Math.atan2(mid[1][1] - mid[0][1], mid[1][0] - mid[0][0]);
  return [...Lp, ...arc(b[0], b[1], w / 2, w / 2, eA + Math.PI / 2, eA - Math.PI / 2, 7), ...Rp.reverse(), ...arc(a[0], a[1], w / 2, w / 2, bA - Math.PI / 2, bA - Math.PI * 1.5, 7)];
}
// ribbon: width along a centre line (steam, ties, paper strips)
export function ribbon(c, w0, w1 = w0) {
  const n = c.length, Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = lerp(w0, w1, i / (n - 1)) / 2;
    Lp.push([c[i][0] - dy * w, c[i][1] + dx * w]); Rp.push([c[i][0] + dy * w, c[i][1] - dx * w]);
  }
  return [...Lp, ...Rp.reverse()];
}

// —— transform to screen, resample, boil ——
function toScreen(pts, closed) {
  const s = pts.map(p => tx(p[0], p[1])), out = [], step = 7;
  const n = closed ? s.length : s.length - 1;
  out.push(s[0]);
  for (let i = 0; i < n; i++) {
    const a = s[i], b = s[(i + 1) % s.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(1, Math.round(d / step));
    for (let j = 1; j <= k; j++) {
      const u = j / k, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u);
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const off = (vnoise(i * .7 + j * 1.3 + S.boil * 31.7) - .5) * 2 * S.amp;
      out.push([x - dy * off, y + dx * off]);
    }
  }
  return out;
}
function build(pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }

export function shape(pts, o = {}) {
  const { fill = null, lw = S.lw, stroke = INK, closed = true, shade = null, noStroke = false } = o;
  if (pts.length < 3) return;
  const P = toScreen(pts, closed);
  build(P);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (shade) {
    g.save(); build(P); g.clip();
    shade((lp, col) => { const q = lp.map(p => tx(p[0], p[1])); build(q); g.fillStyle = col; g.fill(); });
    g.restore();
  }
  if (!noStroke && lw > 0) { build(P); g.lineWidth = lw; g.strokeStyle = stroke; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
}
export function line(pts, lw = S.lw, col = INK) {
  const P = toScreen(pts, false); g.beginPath(); g.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]);
  g.lineWidth = lw; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
}
export function dot(x, y, r, col = INK) { const [sx, sy] = tx(x, y); g.beginPath(); g.arc(sx, sy, r * zoom(), 0, TAU); g.fillStyle = col; g.fill(); }

// paper grain for painted backgrounds (cached canvases)
export function grain(cv, amt = .05, seed = 3) {
  const c = cv.getContext('2d'), d = c.getImageData(0, 0, cv.width, cv.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    const n = (hash(i * .013 + seed) - .5) * 255 * amt;
    a[i] = clamp(a[i] + n, 0, 255); a[i + 1] = clamp(a[i + 1] + n, 0, 255); a[i + 2] = clamp(a[i + 2] + n, 0, 255);
  }
  c.putImageData(d, 0, 0);
}
