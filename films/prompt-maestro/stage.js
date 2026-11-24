// stage.js — painted watercolour backgrounds, cached once (never boil), 1.4× so push-ins stay crisp.
import { hash, vnoise, clamp, lerp, TAU } from '/core/lib.js';

const GW = 2688, GH = 1512;   // 1920×1080 at 1.4×

function wash(c2, x, y, w, h, col, a = 1) { c2.globalAlpha = a; c2.fillStyle = col; c2.fillRect(x, y, w, h); c2.globalAlpha = 1; }
function blotch(c, x, y, r, col, a = .12, seed = 1) {
  const g = c.createRadialGradient(x, y, r * .1, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'transparent');
  c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.globalAlpha = 1;
}
function grainOver(c, W, H, amt = .07, seed = 5) {
  const d = c.getImageData(0, 0, W, H), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    const n = (hash(i * .017 + seed) - .5) * 255 * amt;
    a[i] = clamp(a[i] + n, 0, 255); a[i + 1] = clamp(a[i + 1] + n, 0, 255); a[i + 2] = clamp(a[i + 2] + n, 0, 255);
  }
  c.putImageData(d, 0, 0);
}
function vignette(c, W, H) {
  const g = c.createRadialGradient(W / 2, H / 2, W * .2, W / 2, H / 2, W * .72);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,9,8,.35)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

export const PAL = { paper: '#F1EEE6', light: '#C8C5BC', mid: '#9A978F', dmid: '#6B6963', dark: '#3B3A37', ink: '#0E0D0C', wall: '#A9A69C', wall2: '#9C9990', floor: '#7E7B74', floor2: '#8C8981', tile: '#B4B1A8' };

function makeCanvas(w = GW, h = GH) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }

// —— SET A: the hallway of the Congreso de los Prompts (a bank lobby that is also a runway) ——
export function paintHall() {
  const cv = makeCanvas(), c = cv.getContext('2d'), W = cv.width, H = cv.height;
  wash(c, 0, 0, W, H * .74, PAL.wall);
  wash(c, 0, H * .74, W, H * .26, PAL.floor);
  // wall panels
  for (let i = 0; i < 7; i++) {
    const x = 60 + i * (W - 120) / 6.6, w = (W - 120) / 8;
    wash(c, x, H * .10, w, H * .56, PAL.wall2, .55);
    c.strokeStyle = 'rgba(20,18,16,.35)'; c.lineWidth = 3; c.strokeRect(x, H * .10, w, H * .56);
    // pilaster capital
    wash(c, x - 10, H * .08, w + 20, 22, PAL.light, .5);
  }
  // skirting + cornice
  wash(c, 0, H * .74 - 26, W, 26, PAL.light, .8);
  wash(c, 0, H * .08, W, 16, PAL.light, .6);
  // floor checker (perspective: rows widen downward)
  const fy = H * .74;
  for (let r = 0; r < 7; r++) {
    const y0 = fy + (H - fy) * Math.pow(r / 7, 1.6), y1 = fy + (H - fy) * Math.pow((r + 1) / 7, 1.6);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const off = (r % 2) * .5;
      const xa = -W * .1 + (i + off) * W * 1.2 / n, xb = xa + W * 1.2 / n;
      wash(c, xa, y0, xb - xa, y1 - y0, (i + r) % 2 ? PAL.floor : PAL.floor2, .85);
    }
  }
  // the two automatic doors, closed, centre-back: a brass frame + dark glass
  const dx = W / 2 - 300, dw = 600, dy = H * .18, dh = H * .56;
  wash(c, dx - 18, dy - 18, dw + 36, dh + 36, PAL.light, .9);
  wash(c, dx, dy, dw, dh, '#2B2A27');
  c.fillStyle = 'rgba(240,238,230,.16)';
  c.beginPath(); c.moveTo(dx + 40, dy + dh); c.lineTo(dx + 240, dy); c.lineTo(dx + 330, dy); c.lineTo(dx + 130, dy + dh); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(240,238,230,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(W / 2, dy); c.lineTo(W / 2, dy + dh); c.stroke();
  // a strip of light under the doors
  wash(c, dx, dy + dh, dw, 8, '#F2EFE6', .5);
  // little brass plate "SALA 4"
  wash(c, dx + dw / 2 - 60, dy - 74, 120, 40, PAL.light, .95);
  c.fillStyle = 'rgba(20,18,16,.7)'; c.font = '600 26px sans-serif'; c.textAlign = 'center'; c.fillText('SALA 4', dx + dw / 2, dy - 46);
  // stains and blotches
  for (let i = 0; i < 26; i++) blotch(c, hash(i * 3.1) * W, hash(i * 7.7) * H * .8, 90 + hash(i) * 220, i % 2 ? '#ffffff' : '#5d5a53', .06 + hash(i * 2) * .06, i);
  vignette(c, W, H);
  grainOver(c, W, H, .07);
  return cv;
}

// —— SET B: the corridor to the pitch (a bank of locked doors, each with a plate) ——
export function paintCorridor() {
  const cv = makeCanvas(), c = cv.getContext('2d'), W = cv.width, H = cv.height;
  wash(c, 0, 0, W, H, PAL.wall2);
  // perspective: a vanishing point at (W*.5, H*.46); doors recede left and right
  const vpx = W * .5, vpy = H * .46;
  wash(c, 0, H * .8, W, H * .2, PAL.floor);
  const doors = [[.04, .34], [.30, .22], [.66, .22], [.90, .34]];
  for (const [u, hh] of [[.04, .30], [.30, .20]]) {
    // left wall doors
    for (let i = 0; i < 3; i++) {
      const t = i / 3, x = lerp(0, vpx, t * .9), y = lerp(H * .08, vpy - H * .16, t * .9), w = lerp(W * .18, 20, t), h = lerp(H * .62, 30, t);
      wash(c, x + w * .18, y, w * .55, h, PAL.dark, .75);
      wash(c, x + w * .18, y, w * .55, 8, PAL.light, .5);
    }
  }
  for (const [u, hh] of [[.66, .22], [.90, .34]]) {
    for (let i = 0; i < 3; i++) {
      const t = i / 3, x = lerp(W, vpx, t * .9), y = lerp(H * .08, vpy - H * .16, t * .9), w = lerp(W * .18, 20, t), h = lerp(H * .62, 30, t);
      wash(c, x - w * .73, y, w * .55, h, PAL.dark, .75);
      wash(c, x - w * .73, y, w * .55, 8, PAL.light, .5);
    }
  }
  // a runner on the floor pointing at the vanishing point
  c.fillStyle = 'rgba(70,67,62,.5)';
  c.beginPath(); c.moveTo(W * .18, H); c.lineTo(W * .82, H); c.lineTo(vpx + 30, vpy + H * .18); c.lineTo(vpx - 30, vpy + H * .18); c.closePath(); c.fill();
  // ceiling lamp cones
  for (const x of [W * .32, W * .5, W * .68]) {
    const gr = c.createLinearGradient(x, 0, x, H * .7);
    gr.addColorStop(0, 'rgba(255,252,240,.30)'); gr.addColorStop(1, 'rgba(255,252,240,0)');
    c.fillStyle = gr; c.beginPath(); c.moveTo(x - 16, 0); c.lineTo(x + 16, 0); c.lineTo(x + 200, H * .74); c.lineTo(x - 200, H * .74); c.closePath(); c.fill();
  }
  for (let i = 0; i < 22; i++) blotch(c, hash(i * 5.3) * W, hash(i * 9.1) * H, 110 + hash(i * 2) * 260, i % 3 ? '#ffffff' : '#4a4744', .05 + hash(i) * .05, i);
  vignette(c, W, H);
  grainOver(c, W, H, .08, 9);
  return cv;
}

// —— SET C: the boardroom, after hours: a long table, a projector screen, blinds ——
export function paintBoardroom() {
  const cv = makeCanvas(), c = cv.getContext('2d'), W = cv.width, H = cv.height;
  wash(c, 0, 0, W, H, '#9F9C93');
  wash(c, 0, H * .70, W, H * .30, '#6F6C66');
  // window with venetian blinds, left
  const wx = W * .06, wy = H * .12, ww = W * .30, wh = H * .46;
  wash(c, wx, wy, ww, wh, '#D9D6CD', .9);
  for (let i = 0; i < 16; i++) wash(c, wx, wy + i * wh / 16, ww, wh / 32, '#3A3936', .55);
  wash(c, wx - 14, wy - 14, ww + 28, 14, PAL.light, .9); wash(c, wx - 14, wy + wh, ww + 28, 14, PAL.light, .9);
  // the projector screen, right: pale cloth, a visible frame and a shadow gap so it reads as an object
  const sx = W * .56, sy = H * .10, sw = W * .38, sh = H * .50;
  wash(c, sx + 16, sy + 18, sw, sh, '#4A4742', .5);          // drop shadow on the wall
  wash(c, sx, sy, sw, sh, '#DFDBD1', .96);
  wash(c, sx, sy, sw, sh * .5, '#EAE6DC', .5);
  c.strokeStyle = 'rgba(14,13,12,.72)'; c.lineWidth = 6; c.strokeRect(sx, sy, sw, sh);
  c.strokeStyle = 'rgba(14,13,12,.22)'; c.lineWidth = 2; c.strokeRect(sx + 14, sy + 14, sw - 28, sh - 28);
  // the roller housing at the top, the pull cord
  wash(c, sx - 26, sy - 34, sw + 52, 34, '#55524C', .95);
  c.strokeStyle = 'rgba(14,13,12,.6)'; c.lineWidth = 3; c.strokeRect(sx - 26, sy - 34, sw + 52, 34);
  c.beginPath(); c.moveTo(sx + sw - 30, sy + sh); c.lineTo(sx + sw - 30, sy + sh + 46); c.strokeStyle = 'rgba(14,13,12,.5)'; c.lineWidth = 3; c.stroke();
  // table: a huge dark slab across the foreground
  c.fillStyle = '#3A3936';
  c.beginPath(); c.moveTo(W * .02, H * .78); c.lineTo(W * .98, H * .78); c.lineTo(W * 1.02, H); c.lineTo(-W * .02, H); c.closePath(); c.fill();
  c.fillStyle = 'rgba(240,238,230,.14)';
  c.beginPath(); c.moveTo(W * .02, H * .78); c.lineTo(W * .98, H * .78); c.lineTo(W * .99, H * .805); c.lineTo(W * .01, H * .805); c.closePath(); c.fill();
  // chairs, barely seen
  for (const x of [W * .18, W * .48, W * .78]) {
    wash(c, x - 90, H * .56, 180, H * .22, '#4A4844', .8);
    wash(c, x - 70, H * .565, 140, 18, '#5A5852', .8);
  }
  for (let i = 0; i < 20; i++) blotch(c, hash(i * 4.7) * W, hash(i * 8.3) * H, 120 + hash(i) * 240, i % 2 ? '#ffffff' : '#403d39', .05 + hash(i * 3) * .05, i);
  vignette(c, W, H);
  grainOver(c, W, H, .075, 13);
  return cv;
}

// —— SET D: a sky of paper, the clouds of "the cloud", and a chair of air ——
export function paintSky() {
  const cv = makeCanvas(), c = cv.getContext('2d'), W = cv.width, H = cv.height;
  const gr = c.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#C9C6BD'); gr.addColorStop(.6, '#E8E5DC'); gr.addColorStop(1, '#D6D3CA');
  c.fillStyle = gr; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) blotch(c, hash(i * 6.1) * W, hash(i * 2.9) * H, 140 + hash(i * 5) * 300, i % 2 ? '#ffffff' : '#6d6a63', .07, i);
  // a bank of clouds low on the right
  c.fillStyle = 'rgba(246,244,236,.6)';
  for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(W * .72 + i * 34, H * .84 - Math.sin(i * 1.7) * 40, 90 + hash(i) * 60, 0, TAU); c.fill(); }
  vignette(c, W, H);
  grainOver(c, W, H, .06, 17);
  return cv;
}

// —— SET E: the bonus hall (a stage with a giant envelope and a curtain, seen from the pit) ——
export function paintBonus() {
  const cv = makeCanvas(), c = cv.getContext('2d'), W = cv.width, H = cv.height;
  wash(c, 0, 0, W, H, '#2E2C29');
  // curtain folds, both sides
  for (let i = 0; i < 26; i++) {
    const x = i * W / 26;
    const a = .12 + .16 * Math.abs(Math.sin(i * 1.9));
    c.fillStyle = i % 2 ? 'rgba(10,9,8,' + (a + .2) + ')' : 'rgba(74,71,66,' + a + ')';
    c.fillRect(x, 0, W / 26 + 1, H);
  }
  // stage floor + footlights
  wash(c, 0, H * .72, W, H * .28, '#4E4B46');
  for (let i = 0; i < 9; i++) {
    const x = W * .08 + i * W * .11;
    const g = c.createRadialGradient(x, H * .74, 4, x, H * .74, 70);
    g.addColorStop(0, 'rgba(255,252,236,.85)'); g.addColorStop(1, 'rgba(255,252,236,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, H * .74, 70, 0, TAU); c.fill();
  }
  vignette(c, W, H);
  grainOver(c, W, H, .07, 21);
  return cv;
}

export function paintAll() {
  return { hall: paintHall(), corridor: paintCorridor(), boardroom: paintBoardroom(), sky: paintSky(), bonus: paintBonus() };
}
