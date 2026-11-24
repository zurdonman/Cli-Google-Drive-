// scenes.js — the eleven shots of LAS CUENTAS CLARAS (PAGAR LO TUYO).
// Mid-century cartoon grammar: flat colour planes, an off-register cel on every fill, thin breathing ink,
// held bodies with moving hands, and the camera as "the stand" (push, tilt, colour-block wipe, iris).
import {
  PAL, setClock, shape, plane, ink, rays, ellipse, rect, rrect, spline, move, xform, star, sparkle, text, fit, measure, arrow,
  dashed, paperFinish, kidney, boomerang, subpath, pointAt, plen, clamp, lerp, seg, ss, eo, eio, back, twos, TAU, hash, reg
} from './engine.js';
import { drawLuis, drawNuria, drawPaco, drawBag, hand, banknote, basket, tray } from './cast.js';
import { SHOTS, K, SUBS, DUR, BPM, BEAT, BAR } from './story.js';

export const W = 1920, H = 1080;
const BEAT_S = BEAT;

// ————— palette roles (one ground per scene; the accent rotates) —————
export const COL = {
  paper: PAL.paper, ink: PAL.ink,
  ground: PAL.tealL, groundD: PAL.tealD,
  accent: PAL.tomato, accentD: PAL.tomatoD,
  second: PAL.mustard, secondD: PAL.mustardD,
};

// ————— camera: a stand, never handheld —————
function cam(ctx, cx, cy, z = 1) { ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); }
const B = (s, b) => s + b * BEAT_S;
const pop = (t, t0, d = .28) => back(seg(t, t0, t0 + d), 2.1);

// ————— the set: flat planes, a floor band, a horizon with gaps —————
function ground(ctx, wall, floor, y = 820, shadeCol) {
  ctx.fillStyle = wall; ctx.fillRect(-2000, -2000, 6000, 6000);
  plane(ctx, rect(-2000, y, 6000, 2000), floor, { grain: .3 });
  // the floor line, in pieces (the ink never quite closes a room)
  for (let i = 0; i < 6; i++) {
    const x0 = -300 + i * 420 + hash(i, 3) * 60;
    ink(ctx, [[x0, y + 1], [x0 + 320, y + 1]], 3.4, { seed: 10 + i, breaks: .3, taper: true });
  }
  if (shadeCol) plane(ctx, rect(-2000, y + 70, 6000, 14), shadeCol, { grain: .1, alpha: .5 });
}

// ————— the narrator's card: a paper slab, thin ink border, turning stars at the ends —————
function caption(ctx, t) {
  const cue = SUBS.find(s => t >= s[0] && t < s[1]); if (!cue) return null;
  const a = Math.min(ss(seg(t, cue[0], cue[0] + .16)), 1 - ss(seg(t, cue[1] - .18, cue[1])));
  const f = fit(ctx, cue[2], '500 {px}px Jost', 42, 1330, 1, 26);
  const w = measure(ctx, f.lines[0], f.font) + 150, h = 82, x = W / 2 - w / 2, y = H - 58 - h;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 12);
  shape(ctx, rrect(x, y, w, h, 13), { fill: PAL.cream, line: 3.4, seed: 901, grain: .16, breaks: .06, off: [6, 5] });
  star(ctx, x + 34, y + h / 2, 15, { n: 8, inner: .4, fill: PAL.tomato, off: [0, 0], rot: t * .7 });
  star(ctx, x + w - 34, y + h / 2, 15, { n: 8, inner: .4, fill: PAL.tomato, off: [0, 0], rot: -t * .7 });
  text(ctx, f.lines[0], W / 2, y + h / 2 + f.px * .34, { font: f.font, fill: PAL.ink, align: 'center' });
  ctx.restore();
  return { x, y, w, h };
}

// ————— a tag: a paper card with a star bullet that pops on its beat —————
function tagCard(ctx, t, t0, str, x, y, o = {}) {
  const k = pop(t, t0); if (k <= 0) return null;
  const f = fit(ctx, str, '600 {px}px Jost', o.px || 36, o.maxW || 560, 2, 22);
  const w = Math.max(...f.lines.map(l => measure(ctx, l, f.font))) + 104, h = 34 + f.lines.length * f.px * 1.22;
  const X = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.translate(X + w / 2, y + h / 2); ctx.scale(k, k); ctx.rotate((1 - k) * (o.rot || 0)); ctx.translate(-(X + w / 2), -(y + h / 2));
  shape(ctx, rrect(X, y, w, h, 14), { fill: o.fill || PAL.cream, line: 3.6, seed: 710, grain: .16, off: [6, 5] });
  star(ctx, X + 40, y + h / 2, 17, { n: 8, inner: .42, fill: o.bullet || PAL.tomato, off: [0, 0], rot: t * .6 });
  f.lines.forEach((l, i) => text(ctx, l, X + 70, y + 20 + f.px * .9 + i * f.px * 1.22, { font: f.font, fill: PAL.ink }));
  ctx.restore();
  return { x: X, y, w, h };
}

// ————— a rubber stamp: the seal that lands whole —————
function seal(ctx, t, t0, str, x, y, o = {}) {
  const k = back(seg(t, t0, t0 + .26), 3.2); if (k <= 0) return null;
  const rot = o.rot ?? -.08;
  const f = fit(ctx, str, '600 {px}px Jost', o.px || 44, o.maxW || 520, 1, 24);
  const w = measure(ctx, f.lines[0], f.font) + 78, h = (o.h || 92);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  shape(ctx, rrect(-w / 2, -h / 2, w, h, 10), { fill: o.fill || null, line: 6, seed: 720, grain: .1, breaks: 0, lineColor: o.col || PAL.tomatoD });
  shape(ctx, rrect(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 7), { fill: null, line: 2, seed: 721, breaks: .12, lineColor: o.col || PAL.tomatoD });
  text(ctx, f.lines[0], 0, f.px * .35, { font: f.font, fill: o.col || PAL.tomatoD, align: 'center' });
  ctx.restore();
  return { x: x - w / 2, y: y - h / 2, w, h };
}

// ————— a numbered medallion —————
function medal(ctx, t, t0, num, x, y, r, col = PAL.mustard) {
  const k = pop(t, t0, .3); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate((1 - k) * .5);
  star(ctx, 0, 0, r * 1.22, { n: 16, inner: .84, fill: PAL.white, off: [0, 0], rot: t * .1 });
  shape(ctx, ellipse(0, 0, r, r, 60), { fill: col, line: 5, seed: 740, grain: .32 });
  text(ctx, String(num), 0, r * .38, { font: `${Math.round(r * 1.12)}px Slab`, fill: PAL.ink, plate: PAL.white, off: [5, 5], align: 'center' });
  ctx.restore();
}

// ———————————————————————————————————— A · TITLE CARD
function shotCard(ctx, t) {
  const inK = back(seg(t, K.cardIn, K.cardIn + .5), 1.8), outK = eio(seg(t, K.cardOut, K.cardOut + .45));
  const vis = inK * (1 - outK);
  // the ground behind: warm paper with a slow starburst, so the card has weight
  ctx.fillStyle = PAL.paper; ctx.fillRect(-2000, -2000, 6000, 6000);
  rays(ctx, 960, 520, 28, 1600, PAL.mustardL, { rot: t * .06 + .2, alpha: .35 });
  if (vis <= .001) return;
  ctx.save();
  ctx.translate(0, -lerp(1180, 0, inK) - outK * 1250);
  // the card itself: a dark ink slab with a rule and corner rings
  shape(ctx, rrect(300, 150, 1320, 640, 26), { fill: PAL.ink, line: 0, seed: 1, grain: .2, off: [0, 0] });
  shape(ctx, rrect(316, 166, 1288, 608, 20), { fill: null, line: 2.6, seed: 2, breaks: .08, lineColor: PAL.paper });
  shape(ctx, rrect(332, 182, 1256, 576, 16), { fill: null, line: 1.6, seed: 3, breaks: .2, lineColor: PAL.paper });
  for (const [x, y] of [[332, 182], [1588, 182], [332, 758], [1588, 758]]) shape(ctx, ellipse(x, y, 6, 6, 10), { fill: PAL.paper, line: 0, grain: 0, off: [0, 0] });
  // kicker: a script line
  const kk = seg(t, K.cardTitle - .1, K.cardTitle + .25);
  if (kk > 0) text(ctx, 'la escuela del barrio presenta', 960, 268, { font: '700 50px Oleo', fill: PAL.mustardL, align: 'center', alpha: kk, rot: -.02 });
  // the title: slab plates, popping word-block by word-block on the beat
  const words = ['LAS', 'CUENTAS', 'CLARAS'];
  let px = 104;
  let tw = words.map(wd => measure(ctx, wd, `${px}px Slab`));
  let sp = 46;
  let totalW = tw.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  while (totalW > 1150) { px -= 4; tw = words.map(wd => measure(ctx, wd, `${px}px Slab`)); sp = Math.max(26, sp - 2); totalW = tw.reduce((a, b) => a + b, 0) + sp * (words.length - 1); }
  let x = 960 - totalW / 2;
  words.forEach((wd, i) => {
    const k = pop(t, K.cardTitle + i * BEAT_S * .55, .3);
    if (k > 0) {
      ctx.save(); ctx.translate(x + tw[i] / 2, 470); ctx.scale(k, k); ctx.translate(-(x + tw[i] / 2), -470);
      text(ctx, wd, x, 470, { font: `${px}px Slab`, fill: PAL.cream, align: 'left', plate: PAL.tomatoD, off: [7, 6] });
      ctx.restore();
    }
    x += tw[i] + sp;
  });
  // the sub-line, set in caps under a hairline
  const rk = eo(seg(t, K.cardRule, K.cardRule + .3));
  if (rk > 0) { ink(ctx, [[960 - 420 * rk, 542], [960 + 420 * rk, 542]], 2.6, { seed: 4, color: PAL.paper, breaks: .15, taper: true }); }
  const sk = seg(t, K.cardSub, K.cardSub + .3);
  if (sk > 0) text(ctx, 'EL DINERO ENTRE AMIGOS', 960, 604, { font: '600 38px Jost', fill: PAL.paper, align: 'center', track: 14, alpha: sk });
  if (sk > 0) text(ctx, 'UN CORTO DE 1958 · 78 SEGUNDOS', 960, 660, { font: '500 24px Jost', fill: PAL.mustardL, align: 'center', track: 8, alpha: sk * .9 });
  // a coin at each end of the rule, turning on the beat
  for (let i = 0; i < 2; i++) {
    const ph = Math.sin((t - i * .2) * 6.6);
    shape(ctx, ellipse(960 + (i ? 1 : -1) * 470, 542, 22 * Math.abs(ph) + 5, 26, 20), { fill: PAL.mustard, line: 3, seed: 5 + i, grain: .2 });
  }
  ctx.restore();
}

// ———————————————————————————————————— B · THE BAR: the pile of papers
const PAPER_N = 8;
function shotTapas(ctx, t) {
  const u = t - K.tapasIn;
  cam(ctx, 960, 540, 1.0 + .02 * seg(t, K.tapasIn, K.manoloSale + 2));
  ground(ctx, PAL.tealL, PAL.teal, 790, PAL.tealD);
  // back wall: a shelf line, two bottles, and a hanging lamp
  ink(ctx, [[300, 300], [1620, 300]], 3.2, { seed: 20, breaks: .25 });
  for (let i = 0; i < 5; i++) {
    const bx = 640 + i * 120;
    shape(ctx, rrect(bx - 16, 214, 32, 86, 10), { fill: [PAL.tomato, PAL.mustard, PAL.avocado, PAL.plum, PAL.mustard][i], line: 3, seed: 21 + i, grain: .25 });
    shape(ctx, rrect(bx - 7, 196, 14, 22, 4), { fill: PAL.cream, line: 2.4, seed: 30 + i, grain: .1 });
  }
  // the lamp over the bar: a cone and a glow
  ctx.save(); ctx.globalAlpha = .22; ctx.fillStyle = PAL.mustardL;
  ctx.beginPath(); ctx.moveTo(960 - 40, 250); ctx.lineTo(960 - 330, 760); ctx.lineTo(960 + 330, 760); ctx.lineTo(960 + 40, 250); ctx.fill(); ctx.restore();
  ink(ctx, [[960, 90], [960, 240]], 2.4, { seed: 40, breaks: .2 });
  shape(ctx, spline([[960 - 110, 300], [960 - 90, 244], [960 + 90, 244], [960 + 110, 300], [960, 312]], true, 6), { fill: PAL.mustardL, line: 3.6, seed: 41, grain: .2 });
  // the counter: a cream slab with a dark front
  shape(ctx, rect(150, 700, 1620, 44), { fill: PAL.cream, line: 4, seed: 50, grain: .25, breaks: .1 });
  shape(ctx, rect(150, 744, 1620, 220), { fill: PAL.tomatoD, line: 0, seed: 51, grain: .3, off: [0, 0] });
  for (let i = 0; i < 7; i++) ink(ctx, [[150 + i * 240, 760], [150 + i * 240, 950]], 2.2, { seed: 52 + i, color: '#7E3320', taper: false, breaks: .2 });
  // Manolo: behind the bar, apron, towel, until he leaves
  const leave = eio(seg(t, K.manoloSale, K.manoloSale + .7));
  if (t < K.manoloSale + .8) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, 745); ctx.clip();
    drawPaco(ctx, {
      x: 1380 - leave * 620, y: 980 + leave * 300, s: .98, dir: -1, face: t > K.cuenta ? 'grin' : 'smile',
      blink: (Math.floor(t * 2) % 7 === 0) ? 1 : 0, look: [-.5, 0], bodyBob: Math.sin(twos(t) * 3) * 3,
      armF: t > K.cuenta ? { a1: 1.0, a2: .55 } : { a1: 1.35, a2: 1.6 },
      armB: { a1: 1.95, a2: 1.7 }, handF: t > K.cuenta ? 'flat' : 'open',
    }, t);
    // the towel over his shoulder, drawn as a ribbon
    ink(ctx, spline([[1380 - leave * 620 + 30, 690], [1380 - leave * 620 + 66, 730], [1380 - leave * 620 + 40, 762]], false, 5), 13, { color: PAL.cream, seed: 60, taper: false, wob: .2 });
    ctx.restore();
  }
  // the pile of papers, one per beat
  const pile = [];
  for (let i = 0; i < PAPER_N; i++) {
    const t0 = K.papel[i], k = seg(t, t0, t0 + .26);
    if (k <= 0) continue;
    const y = lerp(-120, 700 - i * 7, Math.pow(k, 1.6)), rot = (hash(i, 9) - .5) * .5, x = 800 + (hash(i, 4) - .5) * 90;
    pile.push([x, y, rot, i]);
  }
  for (const [x, y, rot, i] of pile) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    shape(ctx, rect(-140, -92, 280, 96), { fill: i % 3 === 0 ? PAL.cream : i % 3 === 1 ? PAL.mustardL : PAL.blueL, line: 3, seed: 70 + i, grain: .2, breaks: .2 });
    // printed lines on the paper
    for (let j = 0; j < 3; j++) ink(ctx, [[-116, -66 + j * 20], [116 - 30 * hash(i, j), -66 + j * 20]], 2.2, { seed: 80 + i * 3 + j, color: PAL.inkSoft, taper: false, alpha: .6 });
    ink(ctx, [[-116, -18], [30, -18]], 2.6, { seed: 90 + i, color: PAL.tomatoD, taper: true });
    ctx.restore();
  }
  // a receipts' spool on the counter
  shape(ctx, ellipse(610, 676, 34, 30, 20), { fill: PAL.cream, line: 3, seed: 96, grain: .2 });
  ink(ctx, spline([[610, 648], [616, 600], [590, 566]], false, 12), 9, { color: PAL.cream, seed: 97, taper: false });
  // the tray with the bill, sliding in at `cuenta`
  const tk = back(seg(t, K.cuenta, K.cuenta + .4), 1.6);
  if (tk > 0 && t < K.broncaIn) {
    const tx = lerp(1900, 1170, tk);
    tray(ctx, tx, 706, .86, -.03);
    ctx.save(); ctx.translate(tx + 6, 660); ctx.rotate(-.12); ctx.scale(.7, .7);
    shape(ctx, rect(-90, -60, 180, 120), { fill: PAL.cream, line: 3, seed: 98, grain: .2 });
    text(ctx, 'TOTAL', -6, -20, { font: '600 26px Jost', fill: PAL.ink, align: 'center', track: 3 });
    text(ctx, '∞', -6, 34, { font: '46px Slab', fill: PAL.tomatoD, align: 'center' });
    ctx.restore();
  }
  // Luis and Nuria arrive and take their places
  const lk = back(seg(t, K.luisIn, K.luisIn + .5), 1.6);
  const nk = back(seg(t, K.nuriaIn, K.nuriaIn + .5), 1.6);
  if (lk > 0) drawLuis(ctx, {
    x: lerp(-260, 330, lk), y: 1010, s: 1.0, dir: 1, face: t > K.senalan ? 'wow' : 'flat', blink: 0,
    look: [.6, .1], bodyBob: Math.sin(twos(t) * 2.6) * 2.4,
    armF: t > K.senalan ? { a1: -.35, a2: -.15 } : { a1: 1.25, a2: 1.55 }, handF: t > K.senalan ? 'point' : 'open',
    armB: { a1: 1.9, a2: 1.6 }, bag: { x: -120, y: -150, s: 1, rot: .12, face: true },
  }, t);
  if (nk > 0) drawNuria(ctx, {
    x: lerp(2180, 1660, nk), y: 1012, s: .96, dir: -1, face: t > K.senalan ? 'grin' : 'smile', blink: Math.floor(t * 3) % 9 === 0 ? 1 : 0,
    look: [-.5, 0], bodyBob: Math.sin(twos(t) * 2.2) * 2.2,
    armF: t > K.senalan ? { a1: 2.5, a2: 2.7 } : { a1: 1.35, a2: 1.55 }, handF: t > K.senalan ? 'point' : 'open',
    armB: { a1: 1.7, a2: 1.4 }, bagN: { dx: 8, dy: 44, rot: .04 },
  }, t);
}

// ———————————————————————————————————— C · THE NOTEBOOK: the total that doesn't add up
function shotNota(ctx, t) {
  const u = t - K.notaIn;
  cam(ctx, 960, 520, 1.0 + .04 * ss(u / 8));
  ctx.fillStyle = PAL.mustardL; ctx.fillRect(-2000, -2000, 6000, 6000);
  // the ground has a faint grid: it is the sheet's world
  for (let i = 0; i < 24; i++) ink(ctx, [[-200 + i * 100, -300], [-200 + i * 100, 1500]], 1.2, { seed: 200 + i, color: PAL.mustardD, taper: false, alpha: .18, breaks: .2 });
  const k = back(seg(t, K.hoja, K.hoja + .45), 1.5);
  if (k <= 0) return;
  ctx.save(); ctx.translate(960, 540); ctx.rotate(lerp(.12, -.022, k)); ctx.scale(k, k);
  // the sheet: ruled paper, the corner turned
  shape(ctx, rect(-620, -400, 1240, 800), { fill: PAL.cream, line: 4.4, seed: 210, grain: .22, breaks: .06 });
  for (let j = 0; j < 13; j++) ink(ctx, [[-600, -356 + j * 58], [600, -356 + j * 58]], 1.6, { seed: 220 + j, color: PAL.blueL, taper: false, alpha: .75, breaks: .08 });
  ink(ctx, [[-560, -392], [-560, 392]], 2, { seed: 240, color: PAL.tomatoL, taper: false, alpha: .8 });
  // a header in the corner
  text(ctx, 'CUENTAS', -540, -330, { font: '600 30px Jost', fill: PAL.ink, track: 5 });
  text(ctx, 'de la cena · de la bici · del cumpleaños', -540, -296, { font: '400 24px Jost', fill: PAL.inkSoft });
  // five lines of numbers, one per beat, with the little sum
  const lines = [['CENA', '38,40'], ['TAXI', '12,00'], ['CUMPLE', '60,00'], ['BICI', '25,00'], ['??', '9,99']];
  lines.forEach(([lab, val], i) => {
    const kk = seg(t, K.linea[i], K.linea[i] + .22);
    if (kk <= 0) return;
    const y = -200 + i * 74;
    const w = 260 * kk;
    text(ctx, lab, -520, y, { font: '600 40px Jost', fill: PAL.ink, alpha: kk });
    ink(ctx, [[-300, y], [-300 + w, y]], 2.2, { seed: 250 + i, color: PAL.inkSoft, taper: true, alpha: .7 });
    text(ctx, val, 520, y, { font: '600 44px Jost', fill: PAL.ink, align: 'right', alpha: kk });
    text(ctx, '€', 560, y, { font: '600 30px Jost', fill: PAL.inkSoft, alpha: kk });
  });
  // the total, circled twice by hand
  const tk = seg(t, K.total, K.total + .5);
  if (tk > 0) {
    const y = 190;
    ink(ctx, [[-520, y], [180, y]], 3.4, { seed: 260, breaks: .1, taper: true });
    text(ctx, 'TOTAL', -520, y - 14, { font: '600 34px Jost', fill: PAL.ink, track: 4 });
    text(ctx, '145,39', 460, y + 26, { font: '600 96px Slab', fill: PAL.ink, align: 'right', plate: PAL.mustard, off: [6, 5] });
    // two hand-drawn rings, each drawn on
    for (const [rr, ph, dur] of [[168, 0, .55], [196, .35, .5]]) {
      const k2 = seg(t, K.total + ph, K.total + ph + dur); if (k2 <= 0) continue;
      const pts = ellipse(330, y - 10, rr * 1.35, rr * .72, 60, -2.2, -2.2 + TAU * k2);
      ink(ctx, pts, 5.5, { seed: 261, color: PAL.tomatoD, taper: true, wob: .5 });
    }
    // an arrow from the total to the question
    const ak = eo(seg(t, K.pregunta - .5, K.pregunta));
    if (ak > 0) arrow(ctx, [330, y + 74], [120, y + 196], { u: ak, bend: -.2, w: 6, fill: PAL.tomato, head: 26, seed: 262 });
  }
  // "¿Y LO MÍO?" — the question that ends the friendship.
  // Va DENTRO del bloque de la hoja (que se cierra al acabar la escena): si la saco fuera,
  // desaparece en cuanto el pop() de tagCard ya ha pasado cuando la hoja se está yendo.
  tagCard(ctx, t, K.pregunta, '¿Y LO MÍO?', -300, 132, { px: 50, maxW: 620, bullet: PAL.teal, rot: -.03 });
  // two ticks against two names, on the last two beats
  const names = ['LUIS', 'NURIA'];
  names.forEach((nm, i) => {
    const kk = pop(t, K.tick[i], .24); if (kk <= 0) return;
    ctx.save(); ctx.translate(-150 + i * 300, -368); ctx.scale(kk * .82, kk * .82);
    shape(ctx, rect(-150, -58, 300, 116), { fill: PAL.paper, line: 3, seed: 270 + i, grain: .2 });
    text(ctx, nm, -126, 12, { font: '600 42px Jost', fill: PAL.ink, track: 2 });
    ink(ctx, [[52, 0], [76, 26], [126, -34]], 8, { seed: 272 + i, color: i ? PAL.tomatoD : PAL.tealDD, taper: true });
    ctx.restore();
  });
  ctx.restore();
}

// ———————————————————————————————————— D · THE TWO FACES: the split frame
function shotCara(ctx, t) {
  const u = t - K.caraIn;
  cam(ctx, 960, 540, 1.01 + .02 * ss(u / 7));
  // the split: two colour planes, right vs wrong, before vs after
  const w = W / 2;
  plane(ctx, rect(-10, -10, w + 20, H + 20), PAL.tomatoL, { grain: .3 });
  plane(ctx, rect(w, -10, w + 20, H + 20), PAL.tealL, { grain: .3 });
  // a horizon with gaps, high enough to read as a room
  ink(ctx, [[-20, 760], [560, 760]], 3, { seed: 300, breaks: .25 });
  ink(ctx, [[1000, 760], [1940, 760]], 3, { seed: 301, breaks: .25 });
  ink(ctx, [[w, 90], [w, 990]], 4, { seed: 302, color: PAL.ink, breaks: .12 });
  // Luis, left, holding the notebook; Nuria, right, holding her bag
  drawLuis(ctx, {
    x: 470, y: 900, s: 1.06, dir: 1, face: t > K.luisGlare ? 'flat' : 'smile', blink: 0, look: [.4, .1],
    bodyBob: Math.sin(twos(t) * 2.4) * 2.2,
    armF: { a1: 1.05, a2: .55 }, handF: 'flat', armB: { a1: 1.9, a2: 1.6 },
    bag: { x: 190, y: -120, s: 1.05, rot: -.08, face: true },
  }, t);
  drawNuria(ctx, {
    x: 1450, y: 902, s: 1.0, dir: -1, face: t > K.nuriaGlare ? 'flat' : 'smile', blink: 0, look: [-.4, .1],
    bodyBob: Math.sin(twos(t) * 2.1) * 2.1,
    armF: { a1: 1.15, a2: .5 }, handF: 'flat', armB: { a1: 1.75, a2: 1.5 },
    bagN: { dx: 0, dy: 40 },
  }, t);
  // the notebook, held up like evidence
  if (t > 21.1) {
    ctx.save(); ctx.translate(620, 640); ctx.rotate(-.06); ctx.scale(.62, .62);
    shape(ctx, rect(-160, -200, 320, 400), { fill: PAL.cream, line: 4, seed: 310, grain: .2 });
    for (let j = 0; j < 7; j++) ink(ctx, [[-140, -170 + j * 44], [140, -170 + j * 44]], 1.6, { seed: 311 + j, color: PAL.blueL, taper: false, breaks: .1 });
    text(ctx, '145,39', 0, 40, { font: '600 72px Slab', fill: PAL.ink, align: 'center' });
    ink(ctx, ellipse(0, 10, 130, 70, 40), 5, { seed: 320, color: PAL.tomatoD, closed: true, breaks: .15 });
    ctx.restore();
  }
  // the two tags: the words nobody says out loud
  tagCard(ctx, t, 22.9, 'ME DEBES 145,39 €', 150, 200, { px: 38, maxW: 520, rot: .03 });
  tagCard(ctx, t, 23.9, 'TE LO PAGO EL MARTES', 1130, 236, { px: 36, maxW: 520, rot: -.03, bullet: PAL.teal });
  // the seal across the split
  seal(ctx, t, K.deudaSello, 'DEUDA', 960, 560, { px: 96, h: 170, maxW: 640, rot: -.07, col: PAL.tomatoD });
  // the chain that snaps: two links drifting apart, right through the middle
  const snap = eio(seg(t, 25.4, 26.5));
  if (t > 24.9) {
    const dx = snap * 130;
    ctx.save(); ctx.translate(960 - dx, 880); ctx.rotate(-.3 - snap * .5);
    ink(ctx, ellipse(0, 0, 54, 26, 30, 0, TAU), 12, { seed: 330, closed: true, color: PAL.ink, breaks: 0 });
    ctx.restore();
    ctx.save(); ctx.translate(960 + dx, 880); ctx.rotate(.3 + snap * .5);
    ink(ctx, ellipse(54, 0, 54, 26, 30, 0, TAU), 12, { seed: 331, closed: true, color: PAL.ink, breaks: 0 });
    ctx.restore();
    if (snap > .2 && snap < .9) {
      for (let i = 0; i < 5; i++) {
        const a = -1.2 + i * .5, r = 60 + snap * 90;
        ink(ctx, [[960 + Math.cos(a) * r, 880 + Math.sin(a) * r], [960 + Math.cos(a) * (r + 26), 880 + Math.sin(a) * (r + 26)]], 4, { seed: 340 + i, taper: true });
      }
    }
  }
}

// ———————————————————————————————————— E · THE ROW: the storm before the rule
function shotBronca(ctx, t) {
  const u = t - K.broncaIn;
  const frozen = t > K.silencio;
  const camShake = frozen ? 0 : Math.sin(t * 26) * 5 * (1 - seg(t, K.silencio - .5, K.silencio));
  cam(ctx, 960 + camShake, 540, 1.02 + .05 * ss(u / 7));
  if (!frozen) {
    ground(ctx, PAL.plum, PAL.plumD, 800);
    rays(ctx, 960, 420, 22, 1100, PAL.tomatoL, { rot: t * .3, alpha: .16 });
  } else {
    // the silence: the ground goes flat and the light leaves the room
    plane(ctx, rect(-2000, -2000, 6000, 6000), '#4B3248', { grain: .35 });
    plane(ctx, rect(-2000, 800, 6000, 2000), '#37243A', { grain: .3 });
  }
  // the table between them, knocked askew
  shape(ctx, rect(560, 852, 800, 40), { fill: PAL.kraft || '#C9955D', line: 4, seed: 400, grain: .3, breaks: .1 });
  ink(ctx, [[700, 892], [676, 1020]], 5, { seed: 401 });
  ink(ctx, [[1220, 892], [1244, 1020]], 5, { seed: 402 });
  // two stools
  shape(ctx, rrect(360, 880, 150, 26, 10), { fill: PAL.tomatoD, line: 3, seed: 403, grain: .25 });
  shape(ctx, rrect(1420, 880, 150, 26, 10), { fill: PAL.tealD, line: 3, seed: 404, grain: .25 });
  // the papers take off on the fourth shout
  const fly = seg(t, K.papeles, K.papeles + 2.2);
  for (let i = 0; i < 12; i++) {
    if (fly <= 0) break;
    const t0 = K.papeles + i * .05;
    const k = seg(t, t0, t0 + 1.6); if (k <= 0) break;
    const x = 700 + hash(i, 1) * 520 + Math.sin(t * 3 + i) * 40 * k;
    const y = 800 - k * (320 + hash(i, 2) * 380);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 4 + i) * .8 + i);
    shape(ctx, rect(-34, -24, 68, 26), { fill: i % 2 ? PAL.cream : PAL.mustardL, line: 2.4, seed: 410 + i, grain: .2, alpha: 1 - k * .4 });
    ctx.restore();
  }
  // Luis, left, shouting; Nuria, right, shouting back
  const shoutL = !frozen && t > K.gritos[0], shoutN = !frozen && t > K.gritos[1];
  drawLuis(ctx, {
    x: 470, y: 1010, s: 1.04, dir: 1, face: shoutL ? 'wow' : 'flat', blink: 0, look: [.7, -.1],
    bodyBob: frozen ? 0 : Math.sin(twos(t) * 5) * 4,
    armF: { a1: -.55, a2: -.9 }, handF: 'point', armB: { a1: 1.95, a2: 1.75 },
    bag: { x: 160, y: -70, s: 1.0, rot: -.1, face: true },
  }, t);
  drawNuria(ctx, {
    x: 1440, y: 1012, s: 1.0, dir: -1, face: shoutN ? 'wow' : 'flat', blink: 0, look: [-.7, -.1],
    bodyBob: frozen ? 0 : Math.sin(twos(t) * 4.4 + 2) * 4,
    armF: { a1: 2.35, a2: 2.0 }, handF: 'point', armB: { a1: 1.6, a2: 1.35 },
    bagN: { dx: -10, dy: 40 },
  }, t);
  // shout bursts on the beat: jagged balloons of pure noise
  if (!frozen) K.gritos.forEach((t0, i) => {
    const k = seg(t, t0, t0 + .5); if (k <= 0 || k >= 1) return;
    const a = Math.sin(k * Math.PI);
    const bx = i % 2 === 0 ? 410 + i * 12 : 1500 - i * 10, by = 330 - i * 26;
    const pts = [];
    for (let j = 0; j < 22; j++) {
      const ang = j / 22 * TAU, rr = (j % 2 ? 96 : 132) * (0.6 + a * .4);
      pts.push([bx + Math.cos(ang) * rr * 1.15, by + Math.sin(ang) * rr * .82]);
    }
    shape(ctx, pts, { fill: PAL.mustardL, line: 4, seed: 420 + i, grain: .2, alpha: a });
    text(ctx, '¡¡!!', bx, by + 22, { font: '700 62px Slab', fill: PAL.tomatoD, align: 'center', alpha: a });
    // the balloon's tail toward the mouth
    ink(ctx, [[bx + (i % 2 ? -80 : 80), by + 50], [i % 2 ? 1490 : 620, 780]], 4, { seed: 430 + i, taper: true, color: PAL.ink, alpha: a * .8 });
  });
  // the freeze: a paper plane of dust settles, one line of ink across the frame
  if (frozen) {
    const k = eo(seg(t, K.silencio, K.silencio + .45));
    ink(ctx, [[960 - 760 * k, 520], [960 + 760 * k, 520]], 2.4, { seed: 440, color: '#D8B7C6', breaks: .3, alpha: .8 });
  }
}

// ———————————————————————————————————— F · THE RULE CARD
function shotCierre1(ctx, t) {
  const inK = back(seg(t, K.cierre1In, K.cierre1In + .45), 1.8), outK = eio(seg(t, K.cierre1Out, K.cierre1Out + .4));
  const vis = inK * (1 - outK);
  ctx.fillStyle = PAL.avocadoL; ctx.fillRect(-2000, -2000, 6000, 6000);
  rays(ctx, 960, 520, 24, 1500, PAL.mustardL, { rot: -.1, alpha: .3 });
  if (vis <= .001) return;
  ctx.save(); ctx.translate(0, (1 - inK) * 900 - outK * 200);
  shape(ctx, rrect(300, 210, 1320, 620, 24), { fill: PAL.cream, line: 0, seed: 500, grain: .2, off: [0, 0] });
  shape(ctx, rrect(318, 228, 1284, 584, 18), { fill: null, line: 3, seed: 501, breaks: .1, lineColor: PAL.ink });
  medal(ctx, t, K.cierre1In + .3, 1, 452, 340, 78, PAL.mustard);
  text(ctx, 'REGLA DE ORO', 560, 358, { font: '600 30px Jost', fill: PAL.inkSoft, track: 10 });
  // the rule, in slabs, two lines
  const f1 = 'LO QUE SE COMPARTE,';
  const f2 = 'SE PAGA EN EL MOMENTO.';
  const k1 = pop(t, K.regla, .3), k2 = pop(t, K.regla + BEAT_S * .55, .3);
  if (k1 > 0) text(ctx, f1, 960, 500, { font: '64px Slab', fill: PAL.ink, align: 'center', plate: PAL.mustard, off: [6, 5], alpha: Math.min(1, k1), maxW: 1180 });
  if (k2 > 0) text(ctx, f2, 960, 588, { font: '64px Slab', fill: PAL.tomatoD, align: 'center', alpha: Math.min(1, k2), maxW: 1180 });
  // the little illustration under it: two coins, one glass, one line
  const ik = eo(seg(t, K.reglaSub, K.reglaSub + .5));
  if (ik > 0) {
    const y = 690;
    ink(ctx, [[760, y], [760 + 400 * ik, y]], 3, { seed: 510, breaks: .2, taper: true });
    for (let i = 0; i < 2; i++) shape(ctx, ellipse(820 + i * 56, y - 22, 24, 24, 22), { fill: PAL.mustard, line: 3, seed: 511 + i, grain: .2, alpha: ik });
    shape(ctx, spline([[1080, y - 4], [1120, y - 4], [1114, y - 70], [1086, y - 70]], true, 4), { fill: PAL.cream, line: 3, seed: 513, grain: .1, alpha: ik });
    shape(ctx, spline([[1086, y - 64], [1114, y - 64], [1110, y - 26], [1090, y - 26]], true, 4), { fill: PAL.mustardL, line: 0, grain: .1, off: [0, 0], alpha: ik });
  }
  // the script kicker
  const sk = seg(t, K.reglaSub + .2, K.reglaSub + .5);
  if (sk > 0) text(ctx, 'sin hojas, sin totales', 960, 780, { font: '700 44px Oleo', fill: PAL.tealDD, align: 'center', alpha: sk, rot: -.01 });
  ctx.restore();
}

// ———————————————————————————————————— G · THE TRAIN
function trainCar(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // a streamlined railcar: one long body, a raked nose, a chrome band
  shape(ctx, spline([[0, -60], [40, -250], [520, -250], [560, -60], [560, 56], [0, 56]], true, 5), { fill: PAL.teal, line: 4.4, seed: 600, grain: .3, breaks: .1,
    shade: [{ pts: [[0, 8], [560, 8], [560, 62], [0, 62]], color: PAL.tealDD, alpha: .5 }] });
  shape(ctx, spline([[40, -250], [520, -250], [516, -308], [80, -308]], true, 4), { fill: PAL.tealD, line: 4, seed: 601, grain: .25, breaks: .15 });
  // chrome band and the windows
  shape(ctx, rect(60, -216, 470, 24), { fill: PAL.chrome, line: 2.4, seed: 602, grain: .15 });
  for (let i = 0; i < 4; i++) shape(ctx, rrect(96 + i * 112, -180, 80, 108, 16), { fill: PAL.cream, line: 3, seed: 603 + i, grain: .1, breaks: .1 });
  // door and skirt
  shape(ctx, rrect(430, -60, 96, 118, 8), { fill: PAL.tealD, line: 3, seed: 608, grain: .2 });
  shape(ctx, ellipse(110, 70, 26, 26, 20), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  shape(ctx, ellipse(452, 70, 26, 26, 20), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  shape(ctx, ellipse(110, 70, 11, 11, 14), { fill: PAL.chrome, line: 2, seed: 609, grain: .1 });
  shape(ctx, ellipse(452, 70, 11, 11, 14), { fill: PAL.chrome, line: 2, seed: 610, grain: .1 });
  ctx.restore();
}
function shotTren(ctx, t) {
  const u = t - K.trenIn;
  const push = ss(u / 7.8);
  cam(ctx, 960 + push * 40, 540 + push * 10, 1.0 + .05 * push);
  ground(ctx, PAL.blueL, PAL.blue, 780, PAL.blueD);
  // platform edge + rails: long horizontals with a gap where the platform ends
  ink(ctx, [[-100, 782], [1900, 782]], 4, { seed: 620, breaks: .12 });
  for (let i = 0; i < 26; i++) ink(ctx, [[-60 + i * 80, 836], [-60 + i * 80, 862]], 6, { seed: 621 + i, color: PAL.inkSoft, taper: false, alpha: .55 });
  ink(ctx, [[-100, 850], [1900, 850]], 4, { seed: 650, breaks: .08, color: PAL.inkSoft });
  // the station sign, hanging from two wires
  ink(ctx, [[440, 0], [440, 104]], 2, { seed: 651, breaks: .2 });
  ink(ctx, [[760, 0], [760, 104]], 2, { seed: 652, breaks: .2 });
  shape(ctx, rrect(376, 104, 452, 104, 10), { fill: PAL.cream, line: 4, seed: 653, grain: .2, breaks: .1 });
  text(ctx, 'VALENCIA', 602, 162, { font: '600 52px Jost', fill: PAL.ink, align: 'center', track: 8 });
  text(ctx, 'vía 7', 602, 194, { font: '400 22px Jost', fill: PAL.tealDD, align: 'center', track: 4 });
  // the train arrives from the right and stops at the platform
  const TRAIN_S = 1.46, TRAIN_Y = 690;
  const DOOR = { x: 430, w: 104, top: -238, bot: 56 };   // en unidades del coche
  const arr = eio(seg(t, K.trenLlega, K.trenLlega + 1.22));
  const leave = eio(seg(t, K.trenSale, K.trenSale + 1.8));
  const trainX = lerp(2400, 660, arr) + leave * 1700;
  if (arr > .5) basket(ctx, trainX - 320, 782, .78, .06);
  trainCar(ctx, trainX, TRAIN_Y, TRAIN_S);
  // the doorway: a lit rectangle in the car's flank, open while they board
  const doorOpen = t > K.puerta - .35 && t < K.trenSale + .3;
  if (doorOpen) {
    const dx = trainX + DOOR.x * TRAIN_S, dy = TRAIN_Y + DOOR.top * TRAIN_S;
    const dw = DOOR.w * TRAIN_S, dh = (DOOR.bot - DOOR.top) * TRAIN_S;
    shape(ctx, rrect(dx, dy, dw, dh, 8), { fill: PAL.mustardL, line: 3, seed: 660, grain: .15 });
    shape(ctx, rrect(dx + 10, dy + 10, dw - 20, dh - 14, 6), { fill: null, line: 1.6, seed: 661, breaks: .2, lineColor: PAL.tealDD });
  }
  // the three walk right, in front of the car, and step up into the doorway, one at a time
  const doorX = trainX + (DOOR.x + DOOR.w * .45) * TRAIN_S;
  const people = [
    { t0: K.suben[0], draw: (x, y, f, sc = 1) => drawLuis(ctx, { x, y, s: .84 * sc, dir: 1, face: 'smile', blink: 0, look: [.4, -.1], stride: f ? Math.sin(t * 18) : 0, bodyBob: f ? Math.abs(Math.sin(t * 12)) * -4 : 0, armF: { a1: 1.3, a2: 1.5 }, armB: { a1: 1.8, a2: 1.6 }, bag: { x: -80, y: -120, s: .8, rot: .1, face: true } }, t) },
    { t0: K.suben[1], draw: (x, y, f, sc = 1) => drawNuria(ctx, { x, y, s: .82 * sc, dir: 1, face: 'grin', blink: 0, look: [.4, -.1], stride: f ? Math.sin(t * 17) : 0, bodyBob: f ? Math.abs(Math.sin(t * 11)) * -4 : 0, armF: { a1: 1.3, a2: 1.5 }, armB: { a1: 1.8, a2: 1.6 }, bagN: { dx: 6, dy: 40 } }, t) },
    { t0: K.suben[2], draw: (x, y, f, sc = 1) => drawPaco(ctx, { x, y, s: .84 * sc, dir: 1, face: 'grin', blink: 0, look: [.4, -.1], bodyBob: f ? Math.abs(Math.sin(t * 10)) * -4 : 0, armF: { a1: 1.2, a2: 1.45 }, armB: { a1: 1.9, a2: 1.6 } }, t) },
  ];
  people.forEach((p) => {
    const k = seg(t, p.t0, p.t0 + 1.35); if (k <= 0 || k >= 1) return;
    const x = lerp(-220, doorX, eio(k));
    const step = seg(k, .84, 1);
    const a = 1 - step;
    const y = 806 - 66 * eo(step);            // suben al estribo y se pierden en la puerta
    const sc = 1 - .16 * step;
    ctx.save(); ctx.globalAlpha = a;
    p.draw(x, y, k < .8, sc);
    ctx.restore();
  });
}

// ———————————————————————————————————— H · THE BEACH: each pays his own
function shotPlaya(ctx, t) {
  const u = t - K.playaIn;
  cam(ctx, 960, 540, 1.0 + .04 * ss(u / 7.8));
  // sky, sea, sand: three planes with the horizon broken by the parasol
  plane(ctx, rect(-2000, -2000, 6000, 6000), PAL.blueL, { grain: .25 });
  plane(ctx, rect(-2000, 520, 6000, 260), PAL.teal, { grain: .35 });
  plane(ctx, rect(-2000, 700, 6000, 2000), PAL.mustardL, { grain: .4 });
  ink(ctx, [[-100, 520], [1900, 520]], 3, { seed: 700, breaks: .3 });
  ink(ctx, [[-100, 780], [1900, 780]], 3, { seed: 701, breaks: .3, color: PAL.mustardD });
  // waves: three scalloped lines, sliding on twos
  for (let i = 0; i < 3; i++) {
    const pts = []; const y = 570 + i * 44;
    for (let x = -80; x <= 2000; x += 40) pts.push([x, y + Math.sin((x + twos(t) * (30 + i * 14)) / 70) * 8]);
    ink(ctx, pts, 3, { seed: 710 + i, breaks: .25, color: PAL.tealDD, alpha: .55 });
  }
  // the sun: a starburst with a face-free disc
  rays(ctx, 1560, 230, 20, 260, PAL.mustardL, { rot: t * .05, alpha: .65 });
  shape(ctx, ellipse(1560, 230, 96, 96, 40), { fill: PAL.mustard, line: 4, seed: 715, grain: .2 });
  // the parasol: a scalloped canopy on a stick, leaning
  ctx.save(); ctx.translate(560, 300); ctx.rotate(-.08);
  ink(ctx, [[-10, 40], [-30, 560]], 9, { seed: 720, color: PAL.cream, taper: false });
  const canopy = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI, rr = 220; canopy.push([Math.cos(a) * rr, Math.sin(a) * rr * .5 + 30]); }
  for (let i = 8; i >= 0; i--) { const a = Math.PI + i / 8 * Math.PI, rr = 176; canopy.push([Math.cos(a) * rr, Math.sin(a) * rr * .5 + 26]); }
  shape(ctx, canopy, { fill: PAL.tomato, line: 4, seed: 721, grain: .25, breaks: .1 });
  for (let i = 1; i < 8; i += 2) {
    const a0 = Math.PI + i / 8 * Math.PI, a1 = Math.PI + (i + 1) / 8 * Math.PI;
    shape(ctx, [[0, 30], [Math.cos(a0) * 218, Math.sin(a0) * 108 + 28], [Math.cos(a1) * 218, Math.sin(a1) * 108 + 28]], { fill: PAL.cream, line: 0, grain: .2, off: [0, 0], alpha: .92 });
  }
  ctx.restore();
  // Paco behind his counter
  drawPaco(ctx, {
    x: 1640, y: 1016, s: .93, dir: -1, face: t > K.pago[2] ? 'grin' : 'smile', blink: Math.floor(t * 2) % 8 === 0 ? 1 : 0, look: [-.4, 0],
    bodyBob: Math.sin(twos(t) * 2.4) * 2.4, armF: { a1: 1.1, a2: .6 }, handF: 'flat', armB: { a1: 1.9, a2: 1.7 },
  }, t);
  // the chiringuito: a little counter with a striped front
  shape(ctx, rect(1180, 640, 620, 44), { fill: PAL.cream, line: 4, seed: 730, grain: .22, breaks: .1 });
  shape(ctx, rect(1180, 684, 620, 200), { fill: PAL.tealD, line: 0, seed: 731, grain: .3, off: [0, 0] });
  for (let i = 0; i < 6; i++) shape(ctx, rect(1180 + i * 104, 684, 52, 200), { fill: PAL.cream, line: 0, grain: .2, off: [0, 0], alpha: .85 });
  ink(ctx, [[1180, 620], [1800, 620]], 3, { seed: 732, breaks: .1 });
  // the sign
  shape(ctx, spline([[1120, 404], [1860, 404], [1840, 494], [1140, 494]], true, 4), { fill: PAL.mustard, line: 4, seed: 733, grain: .25, breaks: .12 });
  text(ctx, 'CHIRINGUITO PACO', 1490, 466, { font: '600 44px Jost', fill: PAL.ink, align: 'center', track: 4 });
  // three beers on the counter
  for (let i = 0; i < 3; i++) {
    const x = 1245 + i * 132;
    shape(ctx, spline([[x - 26, 596], [x + 26, 596], [x + 18, 640], [x - 18, 640]], true, 4), { fill: PAL.cream, line: 3, seed: 740 + i, grain: .1 });
    shape(ctx, spline([[x - 22, 604], [x + 22, 604], [x + 16, 636], [x - 16, 636]], true, 4), { fill: PAL.mustardL, line: 0, grain: .1, off: [0, 0], alpha: .95 });
    // foam
    for (let j = 0; j < 3; j++) shape(ctx, ellipse(x - 14 + j * 14, 594, 10, 7, 12), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] });
  }
  // Luis and Nuria at the bar, from the left
  drawLuis(ctx, {
    x: 940, y: 1010, s: 1.0, dir: 1, face: 'grin', blink: Math.floor(t * 3) % 11 === 0 ? 1 : 0, look: [.5, .1],
    bodyBob: Math.sin(twos(t) * 2.2) * 2.4,
    armF: t > K.pago[0] ? { a1: .55, a2: .1 } : { a1: 1.25, a2: 1.5 }, handF: t > K.pago[0] ? 'coin' : 'open',
    armB: { a1: 1.85, a2: 1.6 }, bag: { x: -110, y: -130, s: .9, rot: .1, face: true },
  }, t);
  drawNuria(ctx, {
    x: 1100, y: 1012, s: .94, dir: 1, face: 'happy', blink: 0, look: [.5, .1],
    bodyBob: Math.sin(twos(t) * 2) * 2,
    armF: t > K.pago[1] ? { a1: .6, a2: .15 } : { a1: 1.35, a2: 1.55 }, handF: t > K.pago[1] ? 'coin' : 'open',
    armB: { a1: 1.7, a2: 1.45 }, bagN: { dx: 4, dy: 40 },
  }, t);
  // each pays his own: a banknote landing in front of his glass, on his beat
  K.pago.forEach((t0, i) => {
    const k = back(seg(t, t0 + .1, t0 + .4), 1.7); if (k <= 0) return;
    const x = 1245 + i * 132;
    banknote(ctx, x, 664 - (1 - k) * 40, .56 * k, -.08 + i * .07, { val: i === 2 ? '20' : '10' });
    // the arrow from the hand to his own note, briefly
    const ak = seg(t, t0, t0 + .6);
    if (ak > .05 && ak < .95) {
      const from = [[1010, 800], [1130, 810], [1490, 700]][i];
      arrow(ctx, from, [x, 620], { u: Math.sin(ak * Math.PI), bend: .18, w: 5, head: 22, fill: PAL.tomato, seed: 750 + i });
    }
  });
  // the three receipts, in a row: equality, drawn as three identical cards
  const ck = eo(seg(t, K.cuentas, K.cuentas + .5));
  if (ck > 0) {
    for (let i = 0; i < 3; i++) {
      const k = back(seg(t, K.cuentas + i * .12, K.cuentas + i * .12 + .34), 1.6);
      if (k <= 0) continue;
      const x = 300 + i * 172, y = 862 - i * 16;
      ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1) * .07); ctx.scale(k * .62, k * .62);
      shape(ctx, rect(-98, -118, 196, 236), { fill: PAL.cream, line: 3.2, seed: 760 + i, grain: .2 });
      for (let j = 0; j < 5; j++) ink(ctx, [[-74, -86 + j * 24], [74 - 26 * hash(i, j), -86 + j * 24]], 2, { seed: 770 + i * 6 + j, color: PAL.inkSoft, taper: false, alpha: .55 });
      ink(ctx, [[-74, 78], [74, 78]], 2.6, { seed: 790 + i, color: PAL.tomatoD, taper: true });
      text(ctx, '10 €', 0, 18, { font: '600 40px Jost', fill: PAL.ink, align: 'center' });
      ctx.restore();
    }
    text(ctx, 'A ESCOTE', 470, 726, { font: '700 58px Oleo', fill: PAL.tealDD, align: 'center', alpha: ck, rot: -.03 });
  }
}

// ———————————————————————————————————— I · NIGHT: the last round
function shotNoche(ctx, t) {
  const u = t - K.nocheIn;
  cam(ctx, 960, 566, 1.06 + .06 * ss(u / 7));
  plane(ctx, rect(-2000, -2000, 6000, 6000), '#3B2C3F', { grain: .35 });
  plane(ctx, rect(-2000, 780, 6000, 2000), '#2E2032', { grain: .32 });
  // the moon with a starburst halo
  rays(ctx, 1520, 226, 24, 268, PAL.mustardL, { rot: t * .04, alpha: .3 });
  shape(ctx, ellipse(1520, 226, 84, 84, 40), { fill: PAL.cream, line: 4, seed: 800, grain: .2 });
  shape(ctx, ellipse(1552, 200, 58, 58, 30), { fill: '#3B2C3F', line: 0, grain: 0, off: [0, 0] });
  // a string of lights across the top, dipping
  const wire = []; for (let x = -40; x <= 1960; x += 40) wire.push([x, 110 + Math.sin(x / 420) * 44]);
  ink(ctx, wire, 2.4, { seed: 801, breaks: .15 });
  for (let i = 0; i < 11; i++) {
    const x = 60 + i * 178, y = 110 + Math.sin(x / 420) * 44 + 22;
    const on = .55 + .45 * Math.sin(t * 3 + i * 1.3);
    ctx.save(); ctx.globalAlpha = .3 + on * .35; ctx.fillStyle = PAL.mustardL;
    ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill(); ctx.restore();
    shape(ctx, ellipse(x, y, 10, 12, 16), { fill: on > .6 ? PAL.mustardL : PAL.mustard, line: 2.4, seed: 810 + i, grain: .1 });
  }
  // the three, seated behind the table: drawn first, the table cuts them at the waist
  drawLuis(ctx, { x: 636, y: 1012, s: .95, dir: 1, face: t > K.brindis ? 'grin' : 'smile', blink: Math.floor(t * 2.6) % 9 === 0 ? 1 : 0, look: [.3, -.2], bodyBob: Math.sin(twos(t) * 2) * 2, armF: t > K.brindis ? { a1: -.85, a2: -1.35 } : { a1: 1.2, a2: 1.5 }, handF: 'grip', armB: { a1: 1.9, a2: 1.6 } }, t);
  drawPaco(ctx, { x: 960, y: 1042, s: .9, dir: 1, face: 'grin', blink: 0, look: [.2, -.2], bodyBob: Math.sin(twos(t) * 2.1) * 2, armF: t > K.brindis ? { a1: -.9, a2: -1.4 } : { a1: 1.2, a2: 1.5 }, handF: 'grip', armB: { a1: 1.9, a2: 1.6 } }, t);
  drawNuria(ctx, { x: 1300, y: 1014, s: .92, dir: -1, face: 'happy', blink: 0, look: [-.3, -.2], bodyBob: Math.sin(twos(t) * 1.9) * 2, armF: t > K.brindis ? { a1: 2.05, a2: 2.45 } : { a1: 1.3, a2: 1.55 }, handF: 'grip', armB: { a1: 1.7, a2: 1.4 }, bagN: { dx: 0, dy: 40 } }, t);
  // the table, in front of them
  shape(ctx, rect(432, 828, 1056, 38), { fill: PAL.kraft || '#C9955D', line: 4, seed: 820, grain: .3, breaks: .1 });
  shape(ctx, rect(432, 866, 1056, 16), { fill: '#8E5F33', line: 0, grain: .2, off: [0, 0], alpha: .75 });
  ink(ctx, [[600, 882], [576, 1010]], 6, { seed: 821 });
  ink(ctx, [[1320, 882], [1344, 1010]], 6, { seed: 822 });
  const clink = t > K.brindis && t < K.brindis + .5 ? Math.sin((t - K.brindis) * 22) * 3 : 0;
  for (let i = 0; i < 3; i++) {
    const x = 748 + i * 212 + clink * (i - 1);
    shape(ctx, spline([[x - 30, 744], [x + 30, 744], [x + 20, 828], [x - 20, 828]], true, 4), { fill: PAL.cream, line: 3.2, seed: 830 + i, grain: .12, alpha: .95 });
    shape(ctx, spline([[x - 25, 754], [x + 25, 754], [x + 17, 818], [x - 17, 818]], true, 4), { fill: PAL.mustardL, line: 0, grain: .1, off: [0, 0], alpha: .95 });
  }
  // the bill arrives: one small paper, slid on by a hand from the dark
  const bk = back(seg(t, K.cuenta2, K.cuenta2 + .45), 1.6);
  if (bk > 0) {
    ctx.save(); ctx.translate(lerp(1900, 520, bk), 780); ctx.rotate(-.05);
    shape(ctx, rect(-110, -30, 220, 58), { fill: PAL.cream, line: 3, seed: 840, grain: .2 });
    text(ctx, 'LA CUENTA', 0, 8, { font: '600 26px Jost', fill: PAL.ink, align: 'center', track: 2, alpha: bk });
    ctx.restore();
  }
  // three stacks of coins, one per person, each on his beat
  K.cadaUno.forEach((t0, i) => {
    const k = seg(t, t0, t0 + .5); if (k <= 0) return;
    const x = 720 + i * 250;
    for (let j = 0; j < 4; j++) {
      const kk = seg(t, t0 + j * .07, t0 + j * .07 + .2); if (kk <= 0) continue;
      shape(ctx, ellipse(x, 820 - j * 16 - (1 - kk) * 90, 34, 13, 22), { fill: PAL.mustard, line: 2.6, seed: 850 + i * 4 + j, grain: .2 });
    }
  });
  // a name banner over each head, in revue order
  [[K.cadaUno[0], 'LUIS', 636, 380, PAL.tomato], [K.cadaUno[2], 'NURIA', 1300, 384, PAL.teal], [K.cadaUno[1], 'PACO', 960, 448, PAL.mustard]]
    .forEach(([t0, nm, x, y, col]) => tagCard(ctx, t, t0 + .3, nm, x - 92, y, { px: 30, maxW: 200, bullet: col }));
  // the toast
  if (t > K.brindis) for (let i = 0; i < 5; i++) {
    const k = seg(t, K.brindis + i * .04, K.brindis + .5 + i * .05);
    sparkle(ctx, 860 + i * 56, 700 - k * 130, 20 * (1 - k * .6), { fill: PAL.mustardL, alpha: 1 - k });
  }
}

// ———————————————————————————————————— J · THE WAY BACK: three reflections
function shotVuelta(ctx, t) {
  const u = t - K.vueltaIn;
  cam(ctx, 960, 540, 1.0 + .04 * ss(u / 8));
  plane(ctx, rect(-2000, -2000, 6000, 6000), '#4E5A63', { grain: .3 });
  // the carriage wall, two long bands
  plane(ctx, rect(-2000, -2000, 6000, 420), '#5A6670', { grain: .25 });
  plane(ctx, rect(-2000, 900, 6000, 1200), '#3C4650', { grain: .3 });
  // the window: a rounded aperture with the landscape scrolling past
  const wx = 600, wy = 200, ww = 760, wh = 470;
  shape(ctx, rrect(wx - 26, wy - 26, ww + 52, wh + 52, 44), { fill: PAL.cream, line: 4, seed: 900, grain: .2, breaks: .1 });
  ctx.save(); ctx.beginPath(); ctx.moveTo(wx + 44, wy); ctx.arcTo(wx + ww, wy, wx + ww, wy + wh, 40); ctx.arcTo(wx + ww, wy + wh, wx, wy + wh, 40); ctx.arcTo(wx, wy + wh, wx, wy, 40); ctx.arcTo(wx, wy, wx + ww, wy, 40); ctx.closePath(); ctx.clip();
  plane(ctx, rect(wx, wy, ww, wh), PAL.blueL, { grain: .2 });
  plane(ctx, rect(wx, wy + 300, ww, wh), PAL.avocado, { grain: .3 });
  const scroll = t * 210;
  for (let i = 0; i < 7; i++) {
    const x = wx - 200 + ((i * 260 - scroll) % (ww + 400) + (ww + 400)) % (ww + 400);
    const pts = boomerang(x + 120, wy + 330, 120 + (i % 3) * 26, .05);
    shape(ctx, pts, { fill: PAL.avocadoD, line: 3, seed: 901 + i, grain: .3, alpha: .9 });
  }
  // poles going the other way, fast, on twos
  for (let i = 0; i < 5; i++) {
    const x = wx - 100 + ((i * 380 - t * 900) % (ww + 500) + (ww + 500)) % (ww + 500);
    ink(ctx, [[x, wy + 60], [x, wy + wh - 40]], 5, { seed: 910 + i, color: PAL.inkSoft, alpha: .5 });
  }
  ctx.restore();
  // the seats (backs seen from behind) are drawn after the three, so they sit behind them
  const sleep = t > K.dormidos;
  const nod = (i) => sleep ? Math.sin(t * 1.3 + i) * 8 : Math.sin(twos(t) * 2 + i) * 3;
  // Luis
  drawLuis(ctx, { x: 500, y: 1012, s: .92, dir: 1, face: sleep ? 'flat' : 'smile', blink: sleep ? 1 : (Math.floor(t * 2.4) % 8 === 0 ? 1 : 0), look: [.2, .2], bodyBob: nod(0), armF: { a1: 1.2, a2: 1.5 }, handF: 'open', armB: { a1: 1.85, a2: 1.6 }, bag: { x: -120, y: -120, s: .85, rot: .12, face: sleep } }, t);
  drawNuria(ctx, { x: 978, y: 1014, s: .88, dir: -1, face: sleep ? 'flat' : 'happy', blink: sleep ? 1 : 0, look: [-.2, .2], bodyBob: nod(1), armF: { a1: 1.3, a2: 1.55 }, handF: 'open', armB: { a1: 1.7, a2: 1.45 }, bagN: { dx: 0, dy: 40 } }, t);
  drawPaco(ctx, { x: 1430, y: 1030, s: .84, dir: 1, face: sleep ? 'flat' : 'grin', blink: sleep ? 1 : 0, look: [.3, .2], bodyBob: nod(2), armF: { a1: 1.2, a2: 1.5 }, handF: 'open', armB: { a1: 1.9, a2: 1.6 } }, t);
  // los respaldos, delante: solo asoman cabezas
  for (let i = 0; i < 3; i++) shape(ctx, rrect(322 + i * 428, 806, 384, 274, 38), { fill: '#38424C', line: 3.4, seed: 920 + i, grain: .25 });
  for (let i = 0; i < 3; i++) ink(ctx, [[340 + i * 428, 862], [688 + i * 428, 862]], 2, { seed: 924 + i, color: '#4A5560', taper: false, breaks: .3 });
  // the three reflections on the glass, one per beat
  if (t > K.tresReflejos) for (let i = 0; i < 3; i++) {
    // a single tick above each head: nobody owes anybody
    const k = pop(t, K.tresReflejos + i * .2, .26); if (k <= 0) continue;
    const x = [500, 978, 1430][i], y = 470;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    shape(ctx, ellipse(0, 0, 46, 46, 30), { fill: PAL.cream, line: 3.4, seed: 930 + i, grain: .2 });
    ink(ctx, [[-18, 0], [-4, 16], [20, -18]], 7, { seed: 933 + i, color: PAL.tealDD, taper: true });
    ctx.restore();
  }
  // a little "ZZZ" over the sleepers
  if (sleep) for (let i = 0; i < 3; i++) {
    const k = (t - K.dormidos) * .5 + i * .3, f = k % 1;
    text(ctx, 'Z', 1400 + i * 30 + Math.sin(k * 2) * 10, 700 - f * 150 - i * 30,
      { font: `${26 + i * 7}px Jost`, fill: PAL.cream, alpha: Math.max(0, 1 - f) * .9 });
  }
}

// ———————————————————————————————————— K · THE POSTER
function shotCierre2(ctx, t) {
  const inK = eio(seg(t, K.cierre2In, K.cierre2In + .5)), outK = seg(t, K.fuera, DUR);
  if (inK <= 0) return;
  // iris in from a small circle to the full frame, and out again at the end
  const r = lerp(0, 1200, inK) * (1 - outK);
  ctx.save();
  ctx.beginPath(); ctx.arc(960, 520, Math.max(1, r), 0, TAU); ctx.clip();
  ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, W, H);
  rays(ctx, 960, 500, 30, 1500, '#3A2F28', { rot: t * .03, alpha: .9 });
  // the title block
  const k1 = pop(t, K.titulo, .32), k2 = pop(t, K.sub, .3);
  if (k1 > 0) {
    ctx.save(); ctx.translate(960, 400); ctx.scale(.9 + .1 * k1, .9 + .1 * k1);
    text(ctx, 'PAGAR LO TUYO', 0, 30, { font: '128px Slab', fill: PAL.cream, align: 'center', plate: PAL.tomatoD, off: [8, 7], maxW: 1560 });
    ctx.restore();
  }
  if (k2 > 0) {
    text(ctx, 'no te hace tacaño', 960, 520, { font: '700 62px Oleo', fill: PAL.mustardL, align: 'center', alpha: Math.min(1, k2), rot: -.015 });
    text(ctx, 'TE HACE BUEN AMIGO', 960, 606, { font: '600 46px Jost', fill: PAL.cream, align: 'center', track: 12, alpha: Math.min(1, k2) });
  }
  // the three of them, tiny, under the title, waving
  const wk = seg(t, K.pie - .3, K.pie);
  if (wk > 0) {
    drawLuis(ctx, { x: 706, y: 1086, s: .58, dir: 1, face: 'grin', blink: 0, look: [0, 0], bodyBob: Math.sin(twos(t) * 2) * 2, armF: { a1: 1.25, a2: 1.5 }, handF: 'open', armB: { a1: 1.9, a2: 1.6 }, bag: { x: -90, y: -110, s: .8, rot: .1, face: true } }, t);
    drawNuria(ctx, { x: 960, y: 1088, s: .57, dir: 1, face: 'happy', blink: 0, look: [0, 0], bodyBob: Math.sin(twos(t) * 1.8) * 2, armF: { a1: 1.25, a2: 1.5 }, handF: 'open', armB: { a1: 1.7, a2: 1.4 }, bagN: { dx: 0, dy: 36 } }, t);
    drawPaco(ctx, { x: 1214, y: 1100, s: .54, dir: -1, face: 'grin', blink: 0, look: [0, 0], bodyBob: Math.sin(twos(t) * 2.2) * 2, armF: { a1: 1.2, a2: 1.45 }, handF: 'open', armB: { a1: 1.9, a2: 1.6 } }, t);
    for (let i = 0; i < 7; i++) {
      const a = t * .8 + i * .9, r2 = 300 + (i % 3) * 70;
      sparkle(ctx, 960 + Math.cos(a) * r2 * 1.5, 880 + Math.sin(a) * r2 * .42, 14 + (i % 3) * 5, { fill: i % 2 ? PAL.mustardL : PAL.cream, alpha: .5 + .3 * Math.sin(t * 2 + i) });
    }
  }
  // the footer plates
  const pk = seg(t, K.pie, K.pie + .4);
  if (pk > 0) {
    text(ctx, 'VALENCIA · ESTE VERANO', 960, 660, { font: '500 30px Jost', fill: PAL.cream, align: 'center', track: 10, alpha: pk });
    ink(ctx, [[760 - 200 * pk, 692], [1160 + 200 * pk, 692]], 2, { seed: 950, color: PAL.mustardL, breaks: .2, alpha: pk });
    text(ctx, 'UNA PELÍCULA DE LA ESCUELA DEL BARRIO · 1958 / 2026', 960, 742, { font: '400 20px Jost', fill: 'rgba(244,234,213,.55)', align: 'center', track: 4, alpha: pk, pass: true });
  }
  ctx.restore();
}

// ———————————————————————————————————— dispatcher
const FN = { card: shotCard, tapas: shotTapas, nota: shotNota, cara: shotCara, bronca: shotBronca, cierre1: shotCierre1,
  tren: shotTren, playa: shotPlaya, noche: shotNoche, vuelta: shotVuelta, cierre2: shotCierre2 };

export function drawScene(ctx, t) {
  setClock(t);
  const name = (SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1])[2];
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  FN[name](ctx, t);
  ctx.restore();
  // the caption sits above the picture, in the print
  caption(ctx, t);
  paperFinish(ctx, W, H, 1);
}

// ————— what the readcheck reads: every block of text, with its screen box —————
export function textsAt(t) {
  const out = [];
  const push = (id, str, x, y, px, extra = {}) => out.push({ id, text: str, x0: Math.round(x - 4), y0: Math.round(y - px * 1.05), x1: Math.round(x + (extra.w || str.length * px * .58) + 4), y1: Math.round(y + px * .35), ...extra });
  if (t >= K.cardTitle - .1 && t < K.cardOut) {
    push('kicker', 'la escuela del barrio presenta', 960, 268, 50, { x0: 480, x1: 1440 });
    if (t >= K.cardTitle) push('title', 'LAS CUENTAS CLARAS', 960, 470, 96, { x0: 350, x1: 1570 });
    if (t >= K.cardSub) push('sub', 'EL DINERO ENTRE AMIGOS', 960, 604, 38, { x0: 620, x1: 1300 });
  }
  if (t > K.senalan && t < K.broncaIn) out.push({ id: 'total-doc', text: '145,39', x0: 552, y0: 588, x1: 706, y1: 668 });
  if (t > K.hoja && t < K.caraIn) {
    push('nota-cab', 'CUENTAS', 420, 232, 30, { x0: 416, y0: 196, x1: 560, y1: 240 });
    if (t > K.total) out.push({ id: 'nota-total', text: '145,39', x0: 780, y0: 620, x1: 1030, y1: 740 });
    if (t > K.pregunta) push('nota-preg', '¿Y LO MÍO?', 760, 214, 50, { x0: 630, y0: 128, x1: 1160, y1: 250 });
  }
  if (t > 22.9 && t < K.broncaIn) {
    push('tag-debes', 'ME DEBES 145,39 €', 400, 240, 38, { x0: 150, y0: 170, x1: 640, y1: 300 });
    push('tag-martes', 'TE LO PAGO EL MARTES', 1380, 276, 36, { x0: 1130, y0: 206, x1: 1620, y1: 336 });
  }
  if (t > K.deudaSello && t < K.broncaIn) out.push({ id: 'sello-deuda', text: 'DEUDA', x0: 620, y0: 470, x1: 1300, y1: 650 });
  if (t > K.regla && t < K.cierre1Out) {
    push('regla1', 'LO QUE SE COMPARTE,', 960, 500, 64, { x0: 340, x1: 1580 });
    if (t > K.regla + BEAT_S * .55) push('regla2', 'SE PAGA EN EL MOMENTO.', 960, 588, 64, { x0: 300, x1: 1620 });
    push('regla-tag', 'REGLA DE ORO', 700, 296, 30, { x0: 560, y0: 330, x1: 880, y1: 372 });
  }
  if (t > K.trenIn && t < K.playaIn) push('estacion', 'VALENCIA', 602, 166, 52, { x0: 400, y0: 114, x1: 810, y1: 174 });
  if (t > K.playaIn && t < K.nocheIn) {
    push('chiringuito', 'CHIRINGUITO PACO', 1490, 466, 44, { x0: 1160, y0: 404, x1: 1820, y1: 480 });
    if (t > K.cuentas) push('a-escote', 'A ESCOTE', 470, 726, 58, { x0: 300, y0: 650, x1: 640, y1: 740 });
  }
  if (t > K.cuenta2 && t < K.vueltaIn) push('la-cuenta', 'LA CUENTA', 1122, 750, 26, { x0: 1012, y0: 722, x1: 1232, y1: 760 });
  if (t > K.titulo && t < DUR) {
    out.push({ id: 'poster-title', text: 'PAGAR LO TUYO', x0: 210, y0: 300, x1: 1710, y1: 500 });
    if (t > K.sub) { push('poster-sub', 'no te hace tacaño', 960, 520, 62, { x0: 480, y0: 440, x1: 1440, y1: 540 }); push('poster-sub2', 'TE HACE BUEN AMIGO', 960, 606, 46, { x0: 460, y0: 550, x1: 1460, y1: 620 }); }
    if (t > K.pie) push('poster-pie', 'VALENCIA · ESTE VERANO', 960, 660, 30, { x0: 620, y0: 650, x1: 1300, y1: 700 });
  }
  return out;
}

// ————— sound events: the score (score.py) reads these —————
export function buildEvents() {
  const ev = [];
  const at = (t, k, x = 0) => ev.push({ t: +t.toFixed(3), k, x });
  // title
  at(K.cardIn, 'whoosh'); at(K.cardTitle, 'stab'); at(K.cardTitle + BEAT_S * .6, 'stab'); at(K.cardTitle + BEAT_S * 1.2, 'stab');
  at(K.cardSub, 'bell', .25); at(K.cardOut, 'whoosh', -.2);
  // bar
  at(K.papel[0], 'paper'); K.papel.forEach(p => at(p, 'paper'));
  at(K.luisIn, 'step'); at(K.nuriaIn, 'step'); at(K.cuenta, 'tray');
  at(K.senalan, 'boing'); at(K.manoloSale, 'door');
  // notebook
  at(K.hoja, 'paper'); K.linea.forEach((l, i) => at(l, 'tick', i / 5)); at(K.total, 'stab');
  at(K.pregunta, 'boing'); K.tick.forEach((x, i) => at(x, 'stamp', i ? .2 : -.2));
  // the two faces
  at(K.split, 'whoosh'); at(K.luisGlare, 'thud'); at(K.nuriaGlare, 'thud');
  at(K.deudaSello, 'stamp'); at(25.4, 'crack');
  // row
  K.gritos.forEach(g => at(g, 'shout')); at(K.papeles, 'flutter'); at(K.silencio, 'silence');
  // rule card
  at(K.cierre1In, 'whoosh'); at(K.regla, 'stab'); at(K.regla + BEAT_S * .55, 'stab'); at(K.reglaSub, 'bell');
  // train
  at(K.trenIn, 'whistle'); at(K.trenLlega, 'train'); at(K.puerta, 'door'); K.suben.forEach(s => at(s, 'step'));
  at(K.trenSale, 'train', -.3);
  // beach
  at(K.playaIn, 'waves'); at(K.sombrilla, 'whoosh'); at(K.paco, 'boing');
  K.pago.forEach((p, i) => at(p, 'coin', i * .2)); at(K.cuentas, 'chime');
  // night
  at(K.nocheIn, 'night'); at(K.cuenta2, 'paper'); K.cadaUno.forEach(c => at(c, 'coin')); at(K.brindis, 'clink');
  // back
  at(K.vueltaIn, 'train', -.15); at(K.tresReflejos, 'chime'); at(K.dormidos, 'snooze');
  // poster
  at(K.cierre2In, 'whoosh'); at(K.titulo, 'stab'); at(K.sub, 'bell'); at(K.fuera, 'whoosh', -.2);
  return ev;
}
