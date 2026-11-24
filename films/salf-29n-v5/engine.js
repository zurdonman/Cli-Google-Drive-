// engine.js — motor vectorial del corto SALF 29N.
// Todo se dibuja con Canvas 2D: sin imágenes, sin fotos, sin metraje.
// Paleta cerrada del encargo, trazo grueso, caras de dos ojos y sonrisa.

export const C = {
  ink: '#0B2C4A',      // azul SALF (tinta y fondos oscuros)
  ink2: '#123A5C',
  orange: '#E85D04',
  orange2: '#FB8B24',
  green: '#0A7A3E',
  green2: '#16A34A',
  yellow: '#EAB308',
  red: '#DC2626',
  paper: '#FBF4E6',
  paper2: '#F3E6CE',
  white: '#FFFFFF',
  cream: '#FFF9EE',
  grey: '#8A94A6',
  grey2: '#D8DCE4',
  purple: '#7C3AED',
  skin: '#F3C79B',
  skin2: '#E0A874',
  skin3: '#B97A4E',
  hair: '#2B2118',
  hair2: '#5A3A22',
  hairGrey: '#C9C4BC',
};

export let W = 1920, H = 1080;
export function setSize(w, h) { W = w; H = h; }
export const isPortrait = () => H > W;

// ——— matemáticas de animación ———
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (t, a, b) => clamp((t - a) / (b - a));
export const ease = t => (t = clamp(t), t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
export const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = t => Math.pow(clamp(t), 3);
export const back = (t, k = 1.70158) => { t = clamp(t); const u = t - 1; return 1 + (k + 1) * u * u * u + k * u * u; };
export const pulse = (t, every, duty = .5) => (t % every) / every < duty ? 1 : 0;
export const blink = (t, seed = 0) => { const p = (t * .37 + seed) % 3.1; return p < .13 ? 1 - Math.sin(p / .13 * Math.PI) : 0; };
export function seeded(n) { let s = n * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

// ——— primitivas ———
export function rr(g, x, y, w, h, r) {
  const k = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  g.beginPath();
  g.moveTo(x + k, y);
  g.arcTo(x + w, y, x + w, y + h, k);
  g.arcTo(x + w, y + h, x, y + h, k);
  g.arcTo(x, y + h, x, y, k);
  g.arcTo(x, y, x + w, y, k);
  g.closePath();
}
export function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); g.closePath(); }
export function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, Math.PI * 2); g.closePath(); }
export function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }

export function fill(g, col) { g.fillStyle = col; g.fill(); }
export function card(g, x, y, w, h, r, col, lw = 6, line = C.ink) {
  rr(g, x, y, w, h, r); fill(g, col);
  if (lw) { g.lineWidth = lw; g.strokeStyle = line; g.stroke(); }
}
export function capsule(g, x1, y1, x2, y2, wid, col) {
  g.lineCap = 'round'; g.lineWidth = wid; g.strokeStyle = col;
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
}
// trazo de grosor variable (para cuellos de camisa, dedos, etc.)
export function taper(g, x1, y1, x2, y2, w1, w2, col) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  poly(g, [[x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x2 + nx * w2 / 2, y2 + ny * w2 / 2],
          [x2 - nx * w2 / 2, y2 - ny * w2 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2]]);
  fill(g, col);
}

// ——— texto ———
export function setFont(g, size, weight = 700, fam = 'Baloo') { g.font = `${weight} ${size}px ${fam}`; g.textAlign = 'center'; g.textBaseline = 'middle'; }
export function txt(g, s, x, y, size, col = C.ink, weight = 700, fam = 'Baloo', align = 'center', maxW = 0) {
  setFont(g, size, weight, fam); g.textAlign = align; g.fillStyle = col;
  if (maxW > 0) g.fillText(s, x, y, maxW); else g.fillText(s, x, y);
}
export function measure(g, s, size, weight = 700, fam = 'Baloo') { setFont(g, size, weight, fam); return g.measureText(s).width; }
export function wrap(g, s, maxW, size, weight = 700, fam = 'Baloo') {
  setFont(g, size, weight, fam);
  const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (g.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}
// texto en varias líneas, centrado; devuelve la altura usada
export function para(g, s, cx, cy, maxW, size, col, weight = 700, fam = 'Baloo', lh = 1.16) {
  const lines = wrap(g, s, maxW, size, weight, fam), h = lines.length * size * lh;
  lines.forEach((ln, i) => txt(g, ln, cx, cy - h / 2 + size * lh * (i + .5), size, col, weight, fam));
  return h;
}

// ——— fichas y chapas de UI ———
export function chip(g, s, x, y, size = 30, bg = C.ink, fg = C.white, pad = .6, fam = 'Baloo', weight = 700, border = 0, bcol = C.ink) {
  const w = measure(g, s, size, weight, fam) + size * pad * 2, h = size * 2.0;
  card(g, x, y - h / 2, w, h, h * .42, bg, border, bcol);
  txt(g, s, x + w / 2, y + 1, size, fg, weight, fam);
  return w;
}
export function pill(g, s, cx, cy, size, bg, fg, border = 0, bcol = C.ink) {
  const w = measure(g, s, size, 800, 'Baloo') + size * 1.5, h = size * 2.1;
  card(g, cx - w / 2, cy - h / 2, w, h, h / 2, bg, border, bcol);
  txt(g, s, cx, cy + 1, size, fg, 800, 'Baloo');
  return w;
}
// número en disco
export function numDisc(g, n, x, y, r, bg, fg = C.white) {
  circle(g, x, y, r); fill(g, bg); g.lineWidth = Math.max(3, r * .16); g.strokeStyle = C.ink; g.stroke();
  txt(g, String(n), x, y + r * .06, r * 1.05, fg, 400, 'Bungee');
}

// ——— bocadillo de diálogo ———
export function bubble(g, s, x, y, maxW, size, bg, fg, tailX, tailY, who = '', whoCol = null, alpha = 1) {
  const lines = wrap(g, s, maxW, size);
  const padX = size * .8, padY = size * .62, lh = size * 1.2;
  const tw = Math.max(...lines.map(l => measure(g, l, size)));
  const w = Math.min(maxW, tw) + padX * 2, h = lines.length * lh + padY * 2 + (who ? size * .9 : 0);
  g.save(); g.globalAlpha = alpha;
  // rabo
  const bx = x + (tailX !== undefined ? tailX : 0), by = y + h;
  poly(g, [[bx - size * .5, by - 4], [bx + size * .5, by - 4], [bx + (tailY || 0) * .2, by + size * 1.1]]);
  g.fillStyle = bg; g.fill(); g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke();
  card(g, x, y, w, h, size * .7, bg, 5);
  // tapar la costura del rabo
  g.fillStyle = bg; g.fillRect(bx - size * .42, by - 8, size * .84, 10);
  if (who) txt(g, who, x + padX, y + padY * .9 + size * .45, size * .82, whoCol || fg, 800, 'Baloo', 'left');
  lines.forEach((ln, i) => txt(g, ln, x + w / 2, y + padY + (who ? size * .9 : 0) + lh * (i + .5), size, fg, 700, 'Baloo'));
  g.restore();
  return { w, h };
}

// ——— iconos (trazo grueso, planos) ———
export const icon = {
  idcard(g, x, y, s, bg = C.white, name = 'SALF') {
    card(g, x - s * .5, y - s * .34, s, s * .68, s * .09, bg, 5);
    circle(g, x - s * .24, y - s * .05, s * .11); fill(g, C.skin2); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
    card(g, x + s * .02, y - s * .2, s * .34, s * .07, 3, C.grey2, 0);
    card(g, x + s * .02, y - s * .05, s * .34, s * .07, 3, C.grey2, 0);
    card(g, x + s * .02, y + s * .1, s * .22, s * .07, 3, C.green2, 0);
    // franja inferior con el nombre, limpia
    card(g, x - s * .5, y + s * .19, s, s * .15, 0, C.ink2, 0);
    txt(g, name, x, y + s * .266, s * .1, C.yellow, 400, 'Bungee');
  },
  dni(g, x, y, s, bg = C.cream) {
    card(g, x - s * .5, y - s * .34, s, s * .68, s * .07, bg, 5);
    card(g, x - s * .5, y - s * .34, s, s * .13, s * .07, C.ink2, 0);
    txt(g, 'DNI', x + s * .2, y - s * .272, s * .15, C.white, 400, 'Bungee');
    circle(g, x - s * .28, y + s * .02, s * .12); fill(g, C.skin2); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
    for (let i = 0; i < 3; i++) card(g, x + s * .02, y - s * .1 + i * s * .13, s * (.34 - i * .06), s * .05, 2, C.grey2, 0);
  },
  pen(g, x, y, s) {
    g.save(); g.translate(x, y); g.rotate(-.6);
    card(g, -s * .07, -s * .42, s * .14, s * .66, s * .06, C.ink2, 4);
    poly(g, [[-s * .07, s * .24], [s * .07, s * .24], [0, s * .44]]); fill(g, C.yellow); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
    card(g, -s * .07, -s * .42, s * .14, s * .14, s * .05, C.orange, 4);
    g.restore();
  },
  phone(g, x, y, s, screen = C.ink2) {
    card(g, x - s * .17, y - s * .34, s * .34, s * .68, s * .06, C.ink, 5);
    card(g, x - s * .14, y - s * .28, s * .28, s * .52, s * .03, screen, 0);
    circle(g, x, y + s * .3, s * .03); fill(g, C.grey);
    return { x: x - s * .14, y: y - s * .28, w: s * .28, h: s * .52 };
  },
  powerbank(g, x, y, s) {
    card(g, x - s * .2, y - s * .3, s * .4, s * .6, s * .07, C.ink2, 4);
    for (let i = 0; i < 4; i++) card(g, x - s * .13, y - s * .2 + i * s * .1, s * .26, s * .05, 2, i < 3 ? C.green2 : C.grey, 0);
    card(g, x - s * .04, y - s * .4, s * .08, s * .1, 2, C.grey2, 3);
  },
  bottle(g, x, y, s) {
    card(g, x - s * .13, y - s * .26, s * .26, s * .58, s * .08, '#7FC8F8', 4);
    card(g, x - s * .06, y - s * .4, s * .12, s * .16, 3, C.green2, 4);
    card(g, x - s * .13, y - s * .05, s * .26, s * .14, 2, C.white, 0);
  },
  backpack(g, x, y, s, open = 1) {
    card(g, x - s * .34, y - s * .3, s * .68, s * .62, s * .16, C.orange, 6);
    card(g, x - s * .24, y - s * .04, s * .48, s * .3, s * .1, C.orange2, 0);
    rr(g, x - s * .26, y - s * .42, s * .52, s * .2, s * .09); fill(g, C.ink); g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke();
    capsule(g, x - s * .34, y - s * .06, x - s * .42, y + s * .22, s * .07, C.ink);
    capsule(g, x + s * .34, y - s * .06, x + s * .42, y + s * .22, s * .07, C.ink);
  },
  camera(g, x, y, s) {
    card(g, x - s * .34, y - s * .2, s * .68, s * .46, s * .1, C.ink, 5);
    circle(g, x, y + s * .03, s * .15); fill(g, C.ink2); g.lineWidth = 4; g.strokeStyle = C.white; g.stroke();
    circle(g, x, y + s * .03, s * .07); fill(g, C.white);
    card(g, x - s * .18, y - s * .3, s * .24, s * .12, s * .04, C.ink, 4);
  },
  wa(g, x, y, s, col = C.green2) {
    circle(g, x, y, s * .34); fill(g, col); g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke();
    g.save(); g.translate(x, y); g.rotate(-.35);
    g.beginPath(); g.arc(0, -s * .02, s * .17, .35, Math.PI * 1.82); g.lineWidth = s * .06; g.strokeStyle = C.white; g.stroke();
    g.restore();
    poly(g, [[x - s * .3, y + s * .24], [x - s * .42, y + s * .38], [x - s * .16, y + s * .32]]);
    fill(g, col); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
  },
  folder(g, x, y, s, col = C.yellow) {
    card(g, x - s * .36, y - s * .26, s * .72, s * .52, s * .07, col, 5);
    card(g, x - s * .36, y - s * .34, s * .3, s * .14, s * .05, col, 5);
  },
  acta(g, x, y, s) {
    g.save(); g.translate(x, y); g.rotate(-.05);
    card(g, -s * .3, -s * .38, s * .6, s * .76, 4, C.white, 4);
    txt(g, 'ACTA', 0, -s * .26, s * .12, C.ink, 400, 'Bungee');
    for (let i = 0; i < 5; i++) card(g, -s * .22, -s * .12 + i * s * .11, s * (.44 - (i % 2) * .1), s * .035, 2, C.grey2, 0);
    g.restore();
  },
  ballot(g, x, y, s, col = C.orange2) {
    g.save(); g.translate(x, y); g.rotate(.06);
    card(g, -s * .3, -s * .4, s * .6, s * .8, 3, C.white, 4);
    card(g, -s * .24, -s * .34, s * .48, s * .18, 3, col, 0);
    for (let i = 0; i < 3; i++) card(g, -s * .24, -s * .08 + i * s * .12, s * .48, s * .04, 2, C.grey2, 0);
    g.restore();
  },
  urn(g, x, y, s, fillCol = C.white, hole = 0) {
    // urna transparente con hueco arriba
    card(g, x - s * .3, y - s * .22, s * .6, s * .58, s * .05, 'rgba(255,255,255,.55)', 5);
    card(g, x - s * .34, y - s * .34, s * .68, s * .14, s * .03, C.ink, 5);
    if (hole > 0) { card(g, x - s * .07, y - s * .355, s * .14, s * .07, 3, '#00000000', 0); g.save(); g.globalAlpha = hole; card(g, x - s * .07, y - s * .35, s * .14, s * .065, 2, '#1b1b1b', 0); g.restore(); }
    for (let i = 0; i < 5; i++) card(g, x - s * .2 + (i % 3) * s * .12, y - s * .02 + Math.floor(i / 3) * s * .14, s * .1, s * .12, 2, C.orange2, 3);
    txt(g, 'SALF', x, y + s * .3, s * .12, C.ink, 400, 'Bungee');
  },
  clockIcon(g, x, y, r, hh, mm, col = C.white, bg = C.ink, hot = false) {
    circle(g, x, y, r); fill(g, bg); g.lineWidth = Math.max(4, r * .11); g.strokeStyle = C.ink; g.stroke();
    circle(g, x, y, r * .86); g.lineWidth = 3; g.strokeStyle = hot ? C.red : 'rgba(255,255,255,.35)'; g.stroke();
    const aH = ((hh % 12) / 12 + mm / 720) * Math.PI * 2 - Math.PI / 2;
    const aM = (mm / 60) * Math.PI * 2 - Math.PI / 2;
    capsule(g, x, y, x + Math.cos(aH) * r * .45, y + Math.sin(aH) * r * .45, r * .13, col);
    capsule(g, x, y, x + Math.cos(aM) * r * .66, y + Math.sin(aM) * r * .66, r * .09, hot ? C.red : col);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      circle(g, x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, Math.max(1, r * .035)); fill(g, 'rgba(255,255,255,.5)');
    }
    circle(g, x, y, r * .06); fill(g, col);
  },
  pinG(g, x, y, s, col, label) {
    // pin de mapa: gota + rótulo
    g.beginPath();
    g.arc(x, y - s * .55, s * .42, Math.PI * .82, Math.PI * 2.18);
    g.lineTo(x, y + s * .28);
    g.closePath();
    fill(g, col); g.lineWidth = Math.max(3, s * .09); g.strokeStyle = C.ink; g.stroke();
    circle(g, x, y - s * .58, s * .15); fill(g, C.white);
    if (label) { setFont(g, s * .3, 800); txt(g, label, x, y - s * .55, s * .3, C.white, 800); }
  },
  bulb(g, x, y, s, on = 1) {
    if (on) { circle(g, x, y - s * .1, s * .52); g.fillStyle = 'rgba(234,179,8,.28)'; g.fill(); }
    circle(g, x, y - s * .12, s * .3); fill(g, on ? C.yellow : C.grey2); g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke();
    card(g, x - s * .12, y + s * .14, s * .24, s * .16, 3, C.grey, 4);
    capsule(g, x, y + s * .3, x, y + s * .36, s * .06, C.ink);
    if (!on) { capsule(g, x - s * .34, y - s * .44, x + s * .3, y + s * .24, s * .07, C.red); }
  },
  bulbOff(g, x, y, s) { icon.bulb(g, x, y, s, 0); },
  gps(g, x, y, r, t = 0) {
    circle(g, x, y, r * 2.4); g.fillStyle = 'rgba(37,99,235,.18)'; g.fill();
    circle(g, x, y, r * 1.5); g.fillStyle = 'rgba(37,99,235,.25)'; g.fill();
    circle(g, x, y, r); fill(g, '#2563EB'); g.lineWidth = 4; g.strokeStyle = C.white; g.stroke();
  },
  check(g, x, y, s, col = C.green2) {
    circle(g, x, y, s * .4); fill(g, col); g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke();
    g.beginPath(); g.moveTo(x - s * .18, y); g.lineTo(x - s * .04, y + s * .15); g.lineTo(x + s * .2, y - s * .16);
    g.lineWidth = s * .11; g.lineCap = 'round'; g.strokeStyle = C.white; g.stroke();
  },
  cross(g, x, y, s, col = C.red) {
    circle(g, x, y, s * .4); fill(g, col); g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke();
    capsule(g, x - s * .15, y - s * .15, x + s * .15, y + s * .15, s * .1, C.white);
    capsule(g, x + s * .15, y - s * .15, x - s * .15, y + s * .15, s * .1, C.white);
  },
};

// ——— personajes ———
// o: {x, y, s, skin, hair, hairStyle, shirt, vest, lanyard, glasses, tie, mouth, eyes, brows,
//     armL:[a1,a2], armR:[a1,a2], legPhase, face, look, walk, lean}
const SK = [C.skin, C.skin2, C.skin3];

export function char(g, o) {
  const s = o.s, x = o.x, y = o.y;               // y = suelo (pies)
  const skin = SK[o.skin || 0], t = o.t || 0;
  const walk = o.walk || 0, ph = o.legPhase || 0;
  const bob = Math.sin(ph) * s * .022 * walk + Math.sin(t * 2.4 + (o.seed || 0)) * s * .006;
  const hipY = y - s * .40, shoY = y - s * .74, headR = s * .175;
  const headY = y - s * .87 - bob - s * .02;
  const lean = o.lean || 0;

  g.save();
  g.translate(x, 0);
  g.rotate(lean * .06);
  g.translate(-x, 0);

  // piernas
  const swing = Math.sin(ph) * .32 * walk;
  const legY = hipY;
  const footY = y - s * .02;
  const legs = [[-1, swing], [1, -swing]];
  for (const [side, a] of legs) {
    const hx = x + side * s * .085, hy = legY + Math.abs(a) * s * .02;
    const kx = hx + Math.sin(a) * s * .17, ky = hy + s * .2;
    const ax = kx + Math.sin(a) * s * .16, ay = Math.min(footY, ky + s * .2);
    capsule(g, hx, hy, kx, ky, s * .105, o.trousers || C.ink2);
    capsule(g, kx, ky, ax, ay, s * .095, o.trousers || C.ink2);
    // zapato
    card(g, ax - s * .085 + (side > 0 ? s * .02 : 0), ay - s * .03, s * .18, s * .075, s * .03, o.shoes || C.ink, 4);
  }

  // torso
  const torsoW = s * .40, torsoH = s * .40;
  rr(g, x - torsoW / 2, shoY, torsoW, torsoH + s * .04, s * .12);
  fill(g, o.shirt || C.orange2); g.lineWidth = s * .022; g.strokeStyle = C.ink; g.stroke();

  // chaleco SALF
  if (o.vest) {
    g.save(); rr(g, x - torsoW / 2, shoY, torsoW, torsoH + s * .04, s * .12); g.clip();
    g.fillStyle = o.vest; g.fillRect(x - torsoW / 2, shoY, torsoW, torsoH + s * .04);
    g.fillStyle = C.yellow; g.fillRect(x - torsoW / 2, shoY + torsoH * .68, torsoW, s * .05);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x - torsoW * .12, shoY, torsoW * .06, torsoH);
    g.restore();
    rr(g, x - torsoW / 2, shoY, torsoW, torsoH + s * .04, s * .12); g.lineWidth = s * .022; g.strokeStyle = C.ink; g.stroke();
    txt(g, 'SALF', x, shoY + torsoH * .48, s * .085, C.white, 400, 'Bungee');
  }
  if (o.tie) {
    poly(g, [[x - s * .035, shoY + s * .02], [x + s * .035, shoY + s * .02], [x + s * .02, shoY + torsoH * .78], [x, shoY + torsoH * .95], [x - s * .02, shoY + torsoH * .78]]);
    fill(g, o.tie); g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
  }
  if (o.lanyard) {
    capsule(g, x - s * .12, shoY + s * .01, x - s * .03, shoY + torsoH * .52, s * .022, C.orange);
    capsule(g, x + s * .12, shoY + s * .01, x + s * .03, shoY + torsoH * .52, s * .022, C.orange);
    const cy = shoY + torsoH * .56;
    card(g, x - s * .07, cy, s * .14, s * .18, s * .02, C.white, 3);
    card(g, x - s * .06, cy + s * .02, s * .12, s * .05, 2, C.orange, 0);
    txt(g, 'SALF', x, cy + s * .12, s * .05, C.ink, 400, 'Bungee');
  }

  // brazos
  const arms = [[-1, o.armL || [.15, .1]], [1, o.armR || [.15, .1]]];
  const hands = [];
  for (const [side, [a1, a2]] of arms) {
    const sx = x + side * torsoW * .46, sy = shoY + s * .07;
    const ex = sx + side * Math.sin(a1) * s * .19, ey = sy + Math.cos(a1) * s * .19;
    const hx = ex + side * Math.sin(a1 + a2) * s * .18, hy = ey + Math.cos(a1 + a2) * s * .18;
    capsule(g, sx, sy, ex, ey, s * .095, o.shirt || C.orange2);
    capsule(g, ex, ey, hx, hy, s * .083, o.sleeve === 'skin' || !o.longSleeve ? skin : (o.shirt || C.orange2));
    circle(g, hx, hy, s * .048); fill(g, skin); g.lineWidth = s * .016; g.strokeStyle = C.ink; g.stroke();
    hands.push({ x: hx, y: hy });
  }

  // cuello y cabeza
  capsule(g, x, shoY + s * .02, x, headY + headR * .8, s * .09, skin);
  // pelo de fondo (melena / nuca)
  if (o.hairStyle === 'long') { ell(g, x, headY + headR * .05, headR * 1.12, headR * 1.2); fill(g, o.hair || C.hair); g.lineWidth = s * .02; g.strokeStyle = C.ink; g.stroke(); }
  // orejas
  circle(g, x - headR * .98, headY + headR * .08, headR * .17); fill(g, skin); g.lineWidth = s * .016; g.strokeStyle = C.ink; g.stroke();
  circle(g, x + headR * .98, headY + headR * .08, headR * .17); fill(g, skin); g.lineWidth = s * .016; g.strokeStyle = C.ink; g.stroke();
  // cabeza
  ell(g, x, headY, headR, headR * 1.02);
  fill(g, skin); g.lineWidth = s * .022; g.strokeStyle = C.ink; g.stroke();

  // pelo
  const hair = o.hair || C.hair, hs = o.hairStyle || 'short';
  g.save();
  ell(g, x, headY, headR * 1.0, headR * 1.02); g.clip();
  if (hs === 'short') {
    g.beginPath(); g.ellipse(x, headY - headR * .28, headR * 1.02, headR * .82, 0, Math.PI, Math.PI * 2); g.fillStyle = hair; g.fill();
    g.fillRect(x - headR * 1.02, headY - headR * .28, headR * .16, headR * .34);
  } else if (hs === 'bald') {
    g.beginPath(); g.ellipse(x, headY + headR * .1, headR * 1.0, headR * .95, 0, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = 'rgba(0,0,0,.10)'; g.lineWidth = 8; g.stroke();
    g.beginPath(); g.ellipse(x, headY - headR * .02, headR * 1.02, headR * .7, 0, Math.PI, Math.PI * 2); g.fillStyle = hair; g.fill();
  } else if (hs === 'grey') {
    g.beginPath(); g.ellipse(x, headY - headR * .3, headR * 1.02, headR * .78, 0, Math.PI, Math.PI * 2); g.fillStyle = hair; g.fill();
    g.beginPath(); g.ellipse(x - headR * .55, headY - headR * .1, headR * .3, headR * .5, -.4, 0, 7); g.fillStyle = hair; g.fill();
    g.beginPath(); g.ellipse(x + headR * .55, headY - headR * .1, headR * .3, headR * .5, .4, 0, 7); g.fillStyle = hair; g.fill();
  } else if (hs === 'bun') {
    g.beginPath(); g.ellipse(x, headY - headR * .22, headR * 1.05, headR * .9, 0, Math.PI, Math.PI * 2); g.fillStyle = hair; g.fill();
    circle(g, x + headR * .78, headY - headR * 1.0, headR * .34); fill(g, hair); g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
    g.fillRect(x - headR * 1.05, headY - headR * .3, headR * 1.1, headR * .3);
  }
  g.restore();
  ell(g, x, headY, headR, headR * 1.02); g.lineWidth = s * .022; g.strokeStyle = C.ink; g.stroke();

  // cara
  const eyeY = headY + headR * .04, eyeDX = headR * .40, blinkK = blink(t, o.seed || 0);
  const eyeR = headR * .13, pupilR = headR * .075;
  const lookX = (o.look || 0) * headR * .05;
  for (const sx of [-1, 1]) {
    const ex = x + sx * eyeDX;
    if (blinkK > .55) {
      capsule(g, ex - eyeR, eyeY, ex + eyeR, eyeY, headR * .05, C.ink);
    } else {
      circle(g, ex, eyeY, eyeR); fill(g, C.white); g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
      circle(g, ex + lookX, eyeY + headR * .01, pupilR); fill(g, C.ink);
      circle(g, ex + lookX - pupilR * .3, eyeY - pupilR * .35, pupilR * .3); fill(g, C.white);
    }
    // ceja
    if (o.brows !== false) {
      const by = eyeY - headR * .3, bx = eyeDX * 1.0;
      const tilt = o.browTilt || 0;
      capsule(g, x + sx * bx - headR * .16, by + sx * tilt * headR * .12, x + sx * bx + headR * .16, by - sx * tilt * headR * .12, headR * .055, C.ink);
    }
  }
  // nariz
  dot: {
    if (o.nose !== false) { circle(g, x, headY + headR * .28, headR * .07); fill(g, 'rgba(0,0,0,.16)'); }
  }
  // boca
  const my = headY + headR * .52, mw = headR * .42;
  const mouth = o.mouth || 'smile';
  if (mouth === 'flat') { capsule(g, x - mw * .6, my, x + mw * .6, my, headR * .06, C.ink); }
  else if (mouth === 'open') {
    g.beginPath(); g.ellipse(x, my + headR * .04, mw * .56, headR * .24, 0, 0, Math.PI * 2); fill(g, '#7A2230'); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
    g.save(); g.beginPath(); g.ellipse(x, my + headR * .04, mw * .56, headR * .24, 0, 0, Math.PI); g.clip(); g.fillStyle = '#E5736F'; g.fillRect(x - mw, my + headR * .1, mw * 2, headR * .2); g.restore();
  } else if (mouth === 'smile2') {
    g.beginPath(); g.arc(x, my - headR * .05, mw * .7, .25, Math.PI - .25); g.lineWidth = headR * .065; g.strokeStyle = C.ink; g.stroke();
    circle(g, x - mw * .35, my - headR * .02, headR * .05); fill(g, 'rgba(232,93,4,.25)');
    circle(g, x + mw * .35, my - headR * .02, headR * .05); fill(g, 'rgba(232,93,4,.25)');
  } else if (mouth === 'worried') {
    g.beginPath(); g.arc(x, my + headR * .12, mw * .6, Math.PI + .3, -.3); g.lineWidth = headR * .06; g.strokeStyle = C.ink; g.stroke();
  } else {
    g.beginPath(); g.arc(x, my - headR * .12, mw * .78, .35, Math.PI - .35); g.lineWidth = headR * .06; g.strokeStyle = C.ink; g.stroke();
  }
  // barba / bigote
  if (o.moustache) {
    g.beginPath(); g.ellipse(x, my - headR * .12, mw * .5, headR * .09, 0, 0, 7); fill(g, o.hair || C.hair);
    g.beginPath(); g.ellipse(x - mw * .42, my - headR * .1, mw * .28, headR * .07, -.3, 0, 7); fill(g, o.hair || C.hair);
    g.beginPath(); g.ellipse(x + mw * .42, my - headR * .1, mw * .28, headR * .07, .3, 0, 7); fill(g, o.hair || C.hair);
  }
  // gafas
  if (o.glasses) {
    for (const sx of [-1, 1]) {
      circle(g, x + sx * eyeDX, eyeY, eyeR * 1.55); g.lineWidth = headR * .055; g.strokeStyle = C.ink; g.stroke();
    }
    capsule(g, x - eyeDX + eyeR * 1.5, eyeY, x + eyeDX - eyeR * 1.5, eyeY, headR * .045, C.ink);
    capsule(g, x - eyeDX - eyeR * 1.5, eyeY - headR * .02, x - headR * .96, eyeY - headR * .08, headR * .04, C.ink);
    capsule(g, x + eyeDX + eyeR * 1.5, eyeY - headR * .02, x + headR * .96, eyeY - headR * .08, headR * .04, C.ink);
  }
  // sombrero / gorra
  if (o.cap) {
    g.beginPath(); g.ellipse(x, headY - headR * .55, headR * 1.02, headR * .62, 0, Math.PI, Math.PI * 2); g.fillStyle = o.cap; g.fill();
    g.lineWidth = s * .02; g.strokeStyle = C.ink; g.stroke();
    card(g, x + headR * .1, headY - headR * .62, headR * 1.15, headR * .2, headR * .1, o.cap, 4);
  }
  g.restore();
  return { hands, head: { x, y: headY, r: headR }, top: headY - headR * 1.1 };
}

// ——— fondos ———
export function paperBg(g, seed = 3) {
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  // bloques planos muy suaves, sin degradados
  const r = seeded(seed);
  g.fillStyle = 'rgba(11,44,74,.035)';
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = r() * H, w = 40 + r() * 160, h = 10 + r() * 60;
    rr(g, x, y, w, h, 8); g.fill();
  }
}
export function blueBg(g) {
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)';
  const r = seeded(11);
  for (let i = 0; i < 18; i++) { circle(g, r() * W, r() * H, 30 + r() * 140); g.fill(); }
}
// suelo con línea gruesa
export function ground(g, y, col = C.paper2, line = C.ink) {
  g.fillStyle = col; g.fillRect(0, y, W, H - y);
  capsule(g, 0, y, W, y, 6, line);
}
