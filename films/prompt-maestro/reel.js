// reel.js — the 1930s print: 4:3 gate in a black frame, weave, flicker, scratches, dust, vignette.
// Own code; the gate geometry lives here so every shot draws into the same window.
import { hash, vnoise, clamp } from '/core/lib.js';
export const GATE = { x: 240, y: 0, w: 1440, h: 1080, r: 26 };

export function makeReel(main) {
  const g = main.getContext('2d');
  const scene = document.createElement('canvas'); scene.width = 1920; scene.height = 1080;
  return { g, scene, sg: scene.getContext('2d') };
}

export function post(F, t, o = {}) {
  const g = F.g, f = Math.floor(t * 24 + 1e-6);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080);
  const wx = (vnoise(t * 1.3) - .5) * 2.2 + (hash(f * 7.1) > .99 ? (hash(f) - .5) * 4 : 0);
  const wy = (vnoise(t * 1.1 + 40) - .5) * 2.4 + (hash(f * 3.3) > .99 ? (hash(f + 9) - .5) * 5 : 0) + (o.jump || 0);
  const { x, y, w, h, r } = GATE;
  g.save();
  g.beginPath(); g.roundRect(x + .5, y - 4, w - 1, h + 8, r); g.clip();
  g.filter = 'blur(0.5px) contrast(1.13)';
  g.drawImage(F.scene, wx, wy);
  g.filter = 'none';
  if (!o.clean) {
    const fl = (hash(f * 1.618) - .5) * .075 + (vnoise(t * 3) - .5) * .035;
    g.fillStyle = fl > 0 ? `rgba(255,252,240,${fl})` : `rgba(0,0,0,${-fl})`; g.fillRect(x, y, w, h);
    const seg2 = Math.floor(t * 2.3);
    for (let i = 0; i < 3; i++) {
      if (hash(seg2 * 13.7 + i * 3.1) < .5) continue;
      const sx = x + hash(seg2 * 5.3 + i) * w + Math.sin(t * 7 + i) * 5, light = hash(seg2 + i * 9) > .4;
      g.strokeStyle = light ? 'rgba(245,242,230,.42)' : 'rgba(10,10,8,.36)'; g.lineWidth = .8 + hash(seg2 * 2 + i) * 1.2;
      const y0 = hash(seg2 * 3 + i) * h * .5; g.beginPath(); g.moveTo(sx, y0); g.lineTo(sx + (hash(f + i) - .5) * 3, y0 + h * (.4 + hash(seg2 + i * 5) * .6)); g.stroke();
    }
    const nd = 2 + Math.floor(hash(f * 2.7) * 5);
    for (let i = 0; i < nd; i++) {
      const dx = x + hash(f * 11.1 + i * 1.7) * w, dy = y + hash(f * 17.3 + i * 2.9) * h, rr = .8 + hash(f + i * 4.4) * 2.4, dark = hash(f * 1.3 + i) > .35;
      g.fillStyle = dark ? 'rgba(12,11,10,.7)' : 'rgba(250,248,240,.62)';
      g.beginPath(); g.ellipse(dx, dy, rr * (1 + hash(i + f) * 1.4), rr, hash(i * 3 + f) * 3, 0, 7); g.fill();
    }
    if (hash(Math.floor(t * 1.5) * 9.9) > .86) {
      const s0 = Math.floor(t * 1.5), hx = x + hash(s0 * 2.2) * w, hy = y + hash(s0 * 4.4) * h;
      g.strokeStyle = 'rgba(15,14,12,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(hx, hy);
      for (let i = 1; i <= 7; i++) g.lineTo(hx + i * 7 + Math.sin(i * 1.3 + s0) * 7, hy + Math.sin(i * .9 + s0 * 2) * 9 + i * 3);
      g.stroke();
    }
  }
  const vg = g.createRadialGradient(960, 540, 380, 960, 540, 920);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(.7, 'rgba(0,0,0,.16)'); vg.addColorStop(1, 'rgba(0,0,0,.58)');
  g.fillStyle = vg; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 12; g.filter = 'blur(6px)'; g.beginPath(); g.roundRect(x, y - 4, w, h + 8, r); g.stroke(); g.filter = 'none';
  g.restore();
}
