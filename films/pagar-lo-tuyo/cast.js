// cast.js — the three of this film, drawn from primitives in the Mid-century Cartoon register:
// geometric people (egg heads, one open spline from the brow round the nose), held bodies, moving hands.
//   LUIS   — tall, thin, moustache, flat cap and a money bag he will not let go of.
//   NURIA  — bobbed hair, turtleneck, cigarette trousers, a handbag and an opinion.
//   PACO   — round, bald with side tufts, a chiringuito apron: he runs the bar on the beach.
// Units: feet at (0,0), head top ≈ −560 for Luis/Nuria, ≈ −520 for Paco. Facing +x unless dir = −1.
import { PAL, shape, plane, ink, ellipse, spline, xform, move, rrect, rect, rect as _r, path, TAU, clamp, lerp, star, text, measure, reg, fit } from './engine.js';

const NAVY = '#3C4A63', NAVY_D = '#2A3550';
const RUST = '#B4553A', RUST_D = '#8A3C28';

// ---------------------------------------------------------------- hands
// UPA four-finger hand: palm + three fingers + thumb, ONE ink outline round the union.
// kind: 'open' | 'flat' | 'point' | 'grip' | 'thumb'
export function hand(ctx, x, y, a, kind = 'open', side = 1, k = 1, col = PAL.skin, lineCol = PAL.ink) {
  const parts = [], seps = [];
  const E = (cx, cy, rx, ry, rot = 0) => parts.push(ellipse(cx, cy, rx, ry, 18, 0, TAU, rot));
  E(11, 0, 14, 12.5);
  if (kind === 'open') {
    [-.62, 0, .62].forEach(r => E(12 + Math.cos(r) * 24, Math.sin(r) * 24, 11.5, 4.6, r));
    E(3, -14 * side, 9.5, 4.8, -1.35 * side);
  } else if (kind === 'flat') {
    [-9, 0, 9].forEach((dy, i) => E(32 + (i === 1 ? 3 : 0), dy, 12.5, 4.6));
    E(9, -14 * side, 8.5, 4.8, -.9 * side);
    seps.push([[23, -5], [38, -5]], [[23, 5], [38, 5]]);
  } else if (kind === 'point') {
    E(37, -5 * side, 18, 4.6); E(24, 5 * side, 6.6, 5.6); E(19, 10 * side, 5.6, 5); E(7, -13 * side, 8, 4.8, -1 * side);
  } else if (kind === 'thumb') {
    E(30, -7, 6.4, 6.4); E(30, 2, 6.4, 6.4); E(27, 10, 5.8, 5.8); E(6, -20 * side, 12, 5.4, -1.15 * side);
    seps.push([[23, -3], [30, -3]], [[23, 5], [29, 5]]);
  } else if (kind === 'coin') {
    // pinched: thumb and index up, the rest curled
    E(26, -12, 8, 4.8, -.55); E(26, -1, 7.4, 5, .2); E(22, 7, 6.4, 5.4); E(4, -16 * side, 9, 5, -1.1 * side);
    seps.push([[20, -16], [32, -10]]);
  } else { E(25, -7, 6.2, 6.2); E(27, 1, 6.2, 6.2); E(24, 9, 5.8, 5.8); E(11, -13 * side, 8.6, 5.2, -.4 * side); seps.push([[21, -2], [29, -2]], [[21, 5], [28, 5]]); }
  const P = parts.map(p => xform(p, x, y, a, k));
  ctx.save();
  ctx.strokeStyle = lineCol; ctx.lineWidth = 5.4 * k; ctx.lineJoin = 'round';
  for (const p of P) { path(ctx, p); ctx.stroke(); }
  const o = reg(77, .5); ctx.fillStyle = col;
  for (const p of P) { path(ctx, move(p, o[0] * .5, o[1] * .5)); ctx.fill(); }
  ctx.lineWidth = 2.2 * k; ctx.lineCap = 'round'; ctx.strokeStyle = lineCol;
  for (const s2 of seps) { const q = xform(s2, x, y, a, k); ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.stroke(); }
  ctx.restore();
}

// ---------------------------------------------------------------- arms (ribbon sleeve + glove/hand)
function armPts(sh, el, ha) { return spline([sh, [(sh[0] + el[0]) / 2, (sh[1] + el[1]) / 2], el, [(el[0] + ha[0]) / 2, (el[1] + ha[1]) / 2], ha], false, 6); }
function limb(ctx, pts, w, col, seed) {
  ink(ctx, pts, w + 7, { seed, taper: false, wob: .07 });
  const o = reg(seed, 1);
  ink(ctx, move(pts, o[0] * .55, o[1] * .55), w, { seed: seed + 1, taper: false, wob: .05, color: col });
}
// two-bone arm in local units. a1 = upper-arm angle, a2 = forearm angle (0 = +x, π/2 = down)
function armAngles(a1, a2, shU = 100, fa = 92) { return { a1, a2, u: shU, f: fa }; }

// ---------------------------------------------------------------- heads
function eyes(ctx, E, look, blink, open = 1.2, kind = 'dot') {
  E.forEach(([x, y], i) => {
    const sx = 1;
    if (blink > .5) { ink(ctx, [[x - 8, y], [x + 8, y]], 3.6, { seed: 80 + i, taper: false }); return; }
    if (kind === 'happy') { ink(ctx, [[x - 8, y + 3], [x, y - 5], [x + 8, y + 3]], 3.8, { seed: 80 + i, taper: false }); return; }
    if (kind === 'worried') {
      shape(ctx, ellipse(x, y + 1, 7, 9 * open, 14), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
      shape(ctx, ellipse(x + 1.6, y - 2.4, 2.2, 2.4, 8), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] });
      ink(ctx, [[x - 9, y - 13], [x + 9, y - 16]], 3, { seed: 88 + i, taper: true }); return;
    }
    const r = 6.6 * open;
    shape(ctx, ellipse(x + look[0] * 2, y + look[1] * 2, r * .82, r * 1.28, 14), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
    shape(ctx, ellipse(x + look[0] * 2 + 1.6, y + look[1] * 2 - 3.2, 2.1, 2.5, 8), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] });
    const by = y - 17 + (kind === 'sad' ? -3 : 0), tilt = kind === 'sad' ? (i ? 4 : -3) : (i ? -2 : 1);
    ink(ctx, [[x - 9, by + tilt], [x + 9, by - tilt]], 3.2, { seed: 90 + i, taper: true });
  });
}
function mouth(ctx, x, y, kind, t = 0) {
  if (kind === 'open') shape(ctx, ellipse(x, y + 2, 8, 10, 16), { fill: PAL.tomatoD, line: 3.2, seed: 96, grain: 0, breaks: 0 });
  else if (kind === 'smile') ink(ctx, spline([[x - 13, y - 3], [x - 1, y + 5], [x + 11, y - 3]], false, 5), 3.6, { seed: 99 });
  else if (kind === 'grin') { shape(ctx, spline([[x - 17, y - 6], [x + 13, y - 8], [x + 5, y + 10], [x - 11, y + 8]], true, 6), { fill: PAL.tomatoD, line: 3.2, seed: 95, grain: 0, breaks: 0 }); ink(ctx, [[x - 12, y - 1], [x + 9, y - 2]], 2.4, { seed: 98, taper: false, color: PAL.white }); }
  else if (kind === 'flat') ink(ctx, [[x - 10, y], [x + 8, y - 1]], 3.2, { seed: 97 });
  else if (kind === 'wavy') { const pts = []; for (let i = 0; i <= 6; i++) pts.push([x - 13 + i * 4.4, y + Math.sin(i * 1.7) * 2.6]); ink(ctx, pts, 3, { seed: 97, taper: false }); }
  else ink(ctx, spline([[x - 11, y - 1], [x - 1, y + 4], [x + 9, y - 2]], false, 5), 3.2, { seed: 100 });
}
function cheeks(ctx, pts) { pts.forEach(([x, y], i) => shape(ctx, ellipse(x, y, 10, 7, 14), { fill: PAL.pink, line: 0, grain: 0, seed: 101 + i, alpha: .8 })); }

// a moustache: two comma strokes, the 50s factory of every Spanish uncle
function moustache(ctx, x, y, k = 1) {
  for (const s of [-1, 1]) {
    ink(ctx, spline([[x, y - 2 * k], [x + s * 10 * k, y - 5 * k], [x + s * 19 * k, y - 1 * k], [x + s * 15 * k, y + 4 * k]], false, 5), 7 * k, { taper: true, seed: 120 + s, wob: .2 });
  }
}

// ---------------------------------------------------------------- LUIS
// pose: { x, y, s, dir, view:'q'|'front', face, blink, look, armB:{a1,a2}, armF:{a1,a2},
//         handB, handF, bodyBob, bag:{x,y,s,rot,face}, kapK }
export function drawLuis(ctx, pose, t = 0) {
  const s = pose.s ?? 1, dir = pose.dir ?? 1, view = pose.view || 'q', face = pose.face || 'neutral';
  const blink = pose.blink ?? 0, look = pose.look || [0, 0];
  ctx.save(); ctx.translate(pose.x, pose.y + (pose.bodyBob || 0)); ctx.scale(s * dir, s);
  // floor shadow
  ctx.save(); ctx.globalAlpha = .15; ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(8, 3, 82, 10, 0, 0, TAU); ctx.fill(); ctx.restore();
  // the money bag he never puts down (behind the arm when it hangs)
  if (pose.bag) drawBag(ctx, pose.bag);
  // back arm
  const back = pose.armB || { a1: 1.72, a2: 1.62 };
  drawArmL(ctx, back, 'B', 70, pose.handB || 'open', pose.sleeve || PAL.tealD);
  // legs: narrow, slightly bandy, cuffs and big shoes
  const stride = pose.stride || 0;
  const legs = [[[-34, -276], [-6, -276], [-10 + stride * 26, -30], [-30 + stride * 26, -30]],
               [[0, -276], [30, -276], [30 - stride * 26, -30], [12 - stride * 26, -30]]];
  legs.forEach((L, i) => {
    const ax = (L[2][0] + L[3][0]) / 2;
    shape(ctx, rect(ax - 6, -34, 12, 16), { fill: PAL.skin, line: 0, seed: 40 + i, grain: 0 });
    shape(ctx, L, { fill: NAVY, line: 3.6, seed: 42 + i, grain: .28, breaks: .16,
      shade: i === 1 ? [{ pts: [[14, -280], [48, -280], [48, 0], [10, 0]], color: NAVY_D, alpha: .55 }] : null });
    const fx = ax;
    shape(ctx, spline([[fx - 22, -12], [fx + 10, -16], [fx + 34, -4], [fx + 30, 2], [fx - 22, 2]], true, 4), { fill: PAL.ink, line: 0, off: [0, 0], grain: 0 });
    shape(ctx, ellipse(fx + 12, -6, 9, 3, 10), { fill: PAL.chrome, line: 0, grain: 0, off: [0, 0], alpha: .7 });
  });
  // jacket: a long, thin rectangle with the hem kinked; shoulders at the torso corners
  const tw = view === 'front' ? 1.06 : 1;
  const torso = spline([[-48 * tw, -378], [-36 * tw, -396], [36 * tw, -396], [48 * tw, -378], [42 * tw, -300], [46 * tw, -258], [-44 * tw, -258], [-46 * tw, -300]], true, 6);
  shape(ctx, torso, { fill: PAL.avocadoD, line: 4.2, seed: 50, grain: .32, breaks: .18,
    shade: view === 'front' ? null : [{ pts: [[18, -400], [70, -400], [70, -250], [22, -250]], color: '#5C6230', alpha: .5 }] });
  // shirt wedge + tie
  shape(ctx, [[-14, -392], [14, -392], [8, -300], [-8, -300]], { fill: PAL.cream, line: 2.6, seed: 51, grain: .1, breaks: .2 });
  shape(ctx, [[-6, -370], [7, -370], [9, -322], [0, -310], [-9, -322]], { fill: RUST, line: 2.4, seed: 52, grain: .15, breaks: .2 });
  // jacket buttons and pocket square
  [0, 1].forEach(i => shape(ctx, ellipse(-2, -286 + i * 20, 4, 4, 8), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] }));
  shape(ctx, [[-34, -352], [-16, -352], [-12, -340], [-38, -338]], { fill: PAL.cream, line: 2, seed: 53, grain: .1, breaks: .3 });
  // neck + head
  shape(ctx, rect(-13, -410, 26, 26), { fill: PAL.skinD, line: 0, seed: 54, grain: 0 });
  drawHeadLuis(ctx, face, blink, look, view);
  // front arm (in front of the torso)
  const front = pose.armF || { a1: 1.34, a2: 1.5 };
  drawArmL(ctx, front, 'F', 60, pose.handF || 'open', pose.sleeve || PAL.avocadoD);
  ctx.restore();
}
function drawArmL(ctx, arm, which, seed, hk, col) {
  const sh = which === 'F' ? [34, -372] : [-32, -374];
  const el = [sh[0] + Math.cos(arm.a1) * 100, sh[1] + Math.sin(arm.a1) * 100];
  const ha = [el[0] + Math.cos(arm.a2) * 92, el[1] + Math.sin(arm.a2) * 92];
  limb(ctx, armPts(sh, el, ha), 25, col, seed);
  // cuff
  const a = arm.a2, cx = ha[0] - Math.cos(a) * 10, cy = ha[1] - Math.sin(a) * 10;
  ink(ctx, [[cx + Math.cos(a + 1.57) * 11, cy + Math.sin(a + 1.57) * 11], [cx - Math.cos(a + 1.57) * 11, cy - Math.sin(a + 1.57) * 11]], 3, { seed: seed + 2, taper: false, color: PAL.cream });
  hand(ctx, ha[0], ha[1], a, hk, which === 'F' ? -1 : 1, 1, PAL.skin);
  return { sh, el, ha, a };
}
function drawHeadLuis(ctx, face, blink, look, view) {
  // flat cap: a soft kidney laid on the crown, brim out front
  shape(ctx, spline([[-46, -536], [-6, -566], [40, -556], [56, -534], [34, -520], [-6, -514], [-38, -518]], true, 6), { fill: RUST, line: 3.6, seed: 62, grain: .3, breaks: .2 });
  shape(ctx, spline([[30, -540], [78, -534], [86, -522], [46, -518]], true, 5), { fill: RUST_D, line: 3.2, seed: 63, grain: .25, breaks: .2 });
  shape(ctx, ellipse(6, -560, 7, 6, 10), { fill: RUST_D, line: 2, seed: 64, grain: .2 });
  // head: ONE open spline from the brow, round the skull, down the jaw and out to the nose tip
  const chain = [[46, -506], [46, -530], [22, -546], [-14, -544], [-46, -522], [-52, -484], [-42, -448], [-14, -428], [16, -430], [34, -444], [40, -466], [46, -484]];
  const tip = [84, -486];
  shape(ctx, [...spline(chain, false, 6), tip], { fill: PAL.skin, line: 4, seed: 66, grain: .14, breaks: .1 });
  // ear
  shape(ctx, ellipse(-40, -486, 11, 15, 16), { fill: PAL.skinD, line: 3, seed: 67, grain: .1, breaks: .3 });
  // the eye
  eyes(ctx, [[28, -498]], look, blink, 1, face === 'wow' ? 'worried' : 'dot');
  // brow
  ink(ctx, [[17, -516], [40, -520]], 4, { seed: 71, taper: true });
  // nose is already in the outline; a nose crease
  ink(ctx, [[70, -478], [60, -470]], 2.6, { seed: 72, taper: true });
  mouth(ctx, 58, -456, face === 'wow' ? 'open' : face === 'grin' ? 'grin' : face === 'sad' ? 'wavy' : face === 'flat' ? 'flat' : 'smile');
  moustache(ctx, 56, -466, 1.05);
  if (face === 'grin' || face === 'wow') cheeks(ctx, [[36, -466]]);
  if (face === 'wow') ink(ctx, [[4, -556], [8, -576]], 3, { seed: 73, taper: true });
}

// ---------------------------------------------------------------- the money bag
export function drawBag(ctx, b) {
  const s = b.s ?? 1, rot = b.rot || 0;
  ctx.save(); ctx.translate(b.x || 0, b.y || 0); ctx.rotate(rot); ctx.scale(s, s);
  // sack
  const body = spline([[-46, -10], [-70, 46], [-44, 96], [10, 104], [58, 70], [56, 20], [28, -8]], true, 8);
  shape(ctx, body, { fill: PAL.kraft || '#C9955D', line: 4, seed: 200, grain: .35, breaks: .15,
    shade: [{ pts: [[16, -20], [80, -20], [80, 110], [22, 110]], color: '#9C6C3C', alpha: .45 }] });
  // neck tie
  shape(ctx, rrect(-12, -26, 40, 20, 8), { fill: '#8E5F33', line: 3, seed: 201, grain: .3, breaks: .2 });
  ink(ctx, [[-26, -14], [24, -18]], 4.5, { seed: 202, taper: false, color: '#6E4524' });
  // € on the sack, printed a little off
  text(ctx, '€', 4, 66, { font: '600 62px Jost', fill: PAL.cream, align: 'center', plate: '#6E4524', off: [3, 3] });
  if (b.face) {
    // the sack has a face (it is a character in this style): two eyes and a smirk
    eyes(ctx, [[-16, 22], [16, 22]], [0, 0], 0, .9);
    ink(ctx, spline([[-14, 40], [0, 46], [14, 38]], false, 5), 3.4, { seed: 205 });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- NURIA
export function drawNuria(ctx, pose, t = 0) {
  const s = pose.s ?? 1, dir = pose.dir ?? 1, view = pose.view || 'q', face = pose.face || 'neutral';
  const blink = pose.blink ?? 0, look = pose.look || [0, 0];
  ctx.save(); ctx.translate(pose.x, pose.y + (pose.bodyBob || 0)); ctx.scale(s * dir, s);
  ctx.save(); ctx.globalAlpha = .15; ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(8, 3, 74, 9, 0, 0, TAU); ctx.fill(); ctx.restore();
  drawArmN(ctx, pose.armB || { a1: 1.85, a2: 1.55 }, 'B', 170, pose.handB || 'open');
  // legs: cigarette trousers, flats
  const stride = pose.stride || 0;
  [[[-30, -290], [-2, -290], [-8 + stride * 20, -24], [-26 + stride * 20, -24]], [[0, -290], [28, -290], [26 - stride * 20, -24], [10 - stride * 20, -24]]].forEach((L, i) => {
    const ax = (L[2][0] + L[3][0]) / 2;
    shape(ctx, L, { fill: PAL.plum, line: 3.6, seed: 180 + i, grain: .28, breaks: .16,
      shade: i === 1 ? [{ pts: [[12, -292], [44, -292], [44, 0], [8, 0]], color: PAL.plumD, alpha: .5 }] : null });
    shape(ctx, spline([[ax - 18, -10], [ax + 8, -14], [ax + 30, -3], [ax + 26, 3], [ax - 18, 3]], true, 4), { fill: PAL.ink, line: 0, off: [0, 0], grain: 0 });
  });
  // blouse (turtleneck), tucked; a thin belt
  const torso = spline([[-44, -392], [-30, -410], [30, -410], [44, -392], [36, -318], [40, -282], [-40, -282], [-36, -318]], true, 6);
  shape(ctx, torso, { fill: PAL.mustard, line: 4.2, seed: 182, grain: .32, breaks: .18,
    shade: view === 'front' ? null : [{ pts: [[14, -412], [60, -412], [60, -276], [18, -276]], color: PAL.mustardD, alpha: .5 }] });
  shape(ctx, rrect(-38, -296, 78, 12, 5), { fill: PAL.tomatoD, line: 2.6, seed: 183, grain: .2, breaks: .3 });
  shape(ctx, rrect(-16, -430, 34, 26, 9), { fill: PAL.mustard, line: 3.2, seed: 184, grain: .28, breaks: .2 });
  ink(ctx, [[-12, -424], [16, -424]], 2.2, { seed: 185, taper: false, color: PAL.mustardD });
  // neck + head
  shape(ctx, rect(-11, -424, 22, 24), { fill: PAL.skinD, line: 0, seed: 186, grain: 0 });
  drawHeadNuria(ctx, face, blink, look);
  // handbag, hanging from the front hand if given
  const front = pose.armF || { a1: 1.3, a2: 1.55 };
  const J = drawArmN(ctx, front, 'F', 160, pose.handF || 'open');
  if (pose.bagN || pose.bag) {
    // a handbag dangling from the wrist
    const bag = pose.bagN || pose.bag;
    ctx.save(); ctx.translate(J.ha[0] + (bag.dx ?? 6), J.ha[1] + (bag.dy ?? 46)); ctx.rotate(bag.rot ?? .06);
    ink(ctx, [[-12, -30], [2, -46], [16, -30]], 3.4, { seed: 187 });
    shape(ctx, rrect(-30, -32, 60, 58, 12), { fill: PAL.tomato, line: 3.6, seed: 188, grain: .3, breaks: .15 });
    shape(ctx, rrect(-30, -32, 60, 16, 8), { fill: PAL.tomatoD, line: 3, seed: 189, grain: .2, breaks: .2 });
    shape(ctx, ellipse(0, -2, 5, 4, 8), { fill: PAL.mustard, line: 2, seed: 190, grain: .1 });
    ctx.restore();
  }
  ctx.restore();
}
function drawArmN(ctx, arm, which, seed, hk) {
  const sh = which === 'F' ? [30, -386] : [-28, -388];
  const el = [sh[0] + Math.cos(arm.a1) * 94, sh[1] + Math.sin(arm.a1) * 94];
  const ha = [el[0] + Math.cos(arm.a2) * 84, el[1] + Math.sin(arm.a2) * 84];
  limb(ctx, armPts(sh, el, ha), 21, PAL.mustard, seed);
  const a = arm.a2, cx = ha[0] - Math.cos(a) * 8, cy = ha[1] - Math.sin(a) * 8;
  ink(ctx, [[cx + Math.cos(a + 1.57) * 9, cy + Math.sin(a + 1.57) * 9], [cx - Math.cos(a + 1.57) * 9, cy - Math.sin(a + 1.57) * 9]], 2.6, { seed: seed + 2, taper: false, color: PAL.mustardD });
  hand(ctx, ha[0], ha[1], a, hk, which === 'F' ? -1 : 1, .86, PAL.skin);
  return { sh, el, ha, a };
}
function drawHeadNuria(ctx, face, blink, look) {
  // hair: a bob with a soft wave; the head is an egg with the nose part of its outline
  shape(ctx, spline([[-56, -520], [-10, -556], [44, -548], [62, -512], [56, -470], [64, -450], [40, -452], [30, -486], [-6, -470], [-40, -476], [-58, -504]], true, 6), { fill: PAL.hair, line: 3.6, seed: 191, grain: .3, breaks: .2 });
  const chain = [[44, -500], [42, -524], [16, -540], [-14, -538], [-40, -516], [-46, -482], [-36, -450], [-10, -434], [14, -436], [30, -448], [36, -464], [42, -480]];
  const tip = [80, -482];
  shape(ctx, [...spline(chain, false, 6), tip], { fill: PAL.skin, line: 4, seed: 192, grain: .14, breaks: .1 });
  // fringe over the brow
  shape(ctx, spline([[-40, -528], [-4, -556], [40, -546], [50, -520], [26, -526], [0, -520], [-22, -526]], true, 6), { fill: PAL.hair, line: 2.6, seed: 193, grain: .25, breaks: .25 });
  eyes(ctx, [[24, -494]], look, blink, 1.12, face === 'wow' ? 'worried' : face === 'happy' ? 'happy' : 'dot');
  ink(ctx, [[14, -512], [34, -515]], 3.2, { seed: 195, taper: true });
  // earring
  shape(ctx, ellipse(-34, -470, 4.6, 4.6, 10), { fill: PAL.mustard, line: 2, seed: 196, grain: .1 });
  mouth(ctx, 52, -456, face === 'wow' ? 'open' : face === 'grin' ? 'grin' : face === 'flat' ? 'flat' : face === 'sad' ? 'wavy' : 'smile');
  // the beauty spot
  shape(ctx, ellipse(46, -466, 2.4, 2.4, 8), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  if (face === 'grin' || face === 'wow') cheeks(ctx, [[32, -466]]);
}

// ---------------------------------------------------------------- PACO (the chiringuito)
export function drawPaco(ctx, pose, t = 0) {
  const s = pose.s ?? 1, dir = pose.dir ?? 1, view = pose.view || 'q', face = pose.face || 'neutral';
  const blink = pose.blink ?? 0, look = pose.look || [0, 0];
  ctx.save(); ctx.translate(pose.x, pose.y + (pose.bodyBob || 0)); ctx.scale(s * dir, s);
  ctx.save(); ctx.globalAlpha = .15; ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(8, 3, 96, 11, 0, 0, TAU); ctx.fill(); ctx.restore();
  // shorts + sandals
  [[[-40, -230], [-4, -230], [-6, -34], [-34, -34]], [[2, -230], [40, -230], [36, -34], [8, -34]]].forEach((L, i) => {
    const ax = (L[2][0] + L[3][0]) / 2;
    shape(ctx, L, { fill: PAL.blue, line: 3.6, seed: 220 + i, grain: .3, breaks: .16,
      shade: i === 1 ? [{ pts: [[18, -234], [52, -234], [52, 0], [14, 0]], color: PAL.blueD, alpha: .5 }] : null });
    shape(ctx, spline([[ax - 26, -14], [ax + 6, -18], [ax + 32, -4], [ax + 28, 4], [ax - 26, 4]], true, 4), { fill: PAL.kraft || '#C9955D', line: 3, seed: 224 + i, grain: .25, breaks: .2 });
  });
  // the belly: a big avocado egg, apron across it
  const torso = spline([[-64, -322], [-46, -352], [0, -366], [46, -352], [64, -322], [58, -240], [30, -214], [-30, -214], [-58, -240]], true, 8);
  shape(ctx, torso, { fill: PAL.skin, line: 4.2, seed: 230, grain: .18, breaks: .12,
    shade: view === 'front' ? null : [{ pts: [[24, -370], [76, -370], [76, -206], [28, -206]], color: PAL.skinD, alpha: .45 }] });
  ink(ctx, [[-10, -300], [-6, -252]], 2.6, { seed: 231, taper: true, color: PAL.skinD });
  ink(ctx, [[-32, -268], [30, -266]], 2.4, { seed: 232, taper: true, color: PAL.skinD, alpha: .8 });
  // apron
  shape(ctx, spline([[-52, -282], [52, -282], [46, -212], [-46, -212]], true, 4), { fill: PAL.cream, line: 3.4, seed: 233, grain: .3, breaks: .2 });
  ink(ctx, [[-52, -282], [-58, -342]], 3, { seed: 234, color: PAL.cream, taper: false });
  ink(ctx, [[52, -282], [58, -338]], 3, { seed: 235, color: PAL.cream, taper: false });
  // the apron pocket with a bottle in it
  shape(ctx, rrect(-24, -268, 48, 34, 6), { fill: PAL.cream, line: 2.6, seed: 236, grain: .2, breaks: .25 });
  shape(ctx, rrect(-8, -292, 14, 30, 4), { fill: PAL.teal, line: 2.4, seed: 237, grain: .15 });
  // head: a big ball with side tufts, a moustache and an unlit cigarette
  shape(ctx, ellipse(2, -420, 66, 62, 40), { fill: PAL.skin, line: 4.2, seed: 240, grain: .14, breaks: .1,
    shade: [{ pts: [[10, -484], [80, -484], [80, -356], [12, -356]], color: PAL.skinD, alpha: .35 }] });
  // tufts
  for (const sd of [-1, 1]) shape(ctx, spline([[sd * 56, -462], [sd * 76, -452], [sd * 62, -436], [sd * 54, -444]], true, 4), { fill: PAL.hair, line: 2.6, seed: 241 + sd, grain: .2, breaks: .2 });
  // eyes, brows, nose, mouth
  eyes(ctx, [[-16, -430], [26, -430]], look, blink, 1.05);
  for (const [x0, y0] of [[-26, -452], [16, -452]]) ink(ctx, [[x0, y0], [x0 + 20, y0 - 2]], 3.4, { seed: 244, taper: true, color: PAL.hair });
  shape(ctx, spline([[-4, -430], [4, -412], [12, -416], [8, -430]], true, 4), { fill: PAL.skinD, line: 2.6, seed: 245, grain: .1 });
  mouth(ctx, 4, -392, face === 'open' ? 'open' : face === 'grin' ? 'grin' : 'smile');
  moustache(ctx, 4, -402, .85);
  // cigarette
  if (pose.cig !== false) {
    ctx.save(); ctx.translate(16, -394); ctx.rotate(-.12);
    shape(ctx, rrect(0, -4, 40, 8, 3), { fill: PAL.cream, line: 2, seed: 246, grain: .1 });
    shape(ctx, ellipse(40, 0, 4, 4, 8), { fill: PAL.tomato, line: 0, grain: 0, off: [0, 0] });
    ctx.restore();
  }
  // arms
  drawArmP(ctx, pose.armB || { a1: 1.9, a2: 1.5 }, 'B', 250, pose.handB || 'open');
  drawArmP(ctx, pose.armF || { a1: 1.35, a2: 1.5 }, 'F', 260, pose.handF || 'open');
  ctx.restore();
}
function drawArmP(ctx, arm, which, seed, hk) {
  const sh = which === 'F' ? [56, -330] : [-54, -332];
  const el = [sh[0] + Math.cos(arm.a1) * 88, sh[1] + Math.sin(arm.a1) * 88];
  const ha = [el[0] + Math.cos(arm.a2) * 80, el[1] + Math.sin(arm.a2) * 80];
  limb(ctx, armPts(sh, el, ha), 30, PAL.skin, seed);
  ctx.save(); ctx.globalAlpha = .1;
  hand(ctx, ha[0], ha[1], arm.a2, hk, which === 'F' ? -1 : 1, 1);
  ctx.restore();
  return { sh, el, ha, a: arm.a2 };
}

// ---------------------------------------------------------------- small props, drawn flat
// a folded banknote with its corner turned: 50 euros, hand-inked
export function banknote(ctx, x, y, s = 1, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  shape(ctx, rrect(-64, -32, 128, 64, 7), { fill: o.col || PAL.avocadoL, line: 3.4, seed: 300, grain: .3, breaks: .12,
    shade: [{ pts: [[-64, 6], [64, 6], [64, 32], [-64, 32]], color: o.colD || PAL.avocadoD, alpha: .35 }] });
  shape(ctx, rrect(-52, -22, 40, 44, 5), { fill: null, line: 2.2, seed: 301, breaks: .2 });
  text(ctx, o.val || '50', 22, 14, { font: '600 40px Jost', fill: PAL.ink, align: 'center' });
  text(ctx, '€', 52, 30, { font: '600 22px Jost', fill: PAL.ink, align: 'center' });
  ctx.restore();
}
// a shopping basket with the evening's provisions
export function basket(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ink(ctx, [[-38, -34], [0, -70], [38, -34]], 4, { seed: 310 });
  shape(ctx, spline([[-46, -34], [46, -34], [34, 26], [-34, 26]], true, 4), { fill: '#C9955D', line: 4, seed: 311, grain: .35, breaks: .15 });
  for (let i = 0; i < 4; i++) ink(ctx, [[-40 + i * 4, -24 + i * 0], [40 - i * 4, -24]], 2, { seed: 312 + i, color: '#8E5F33', taper: false });
  // a bottle neck and a baguette sticking out
  shape(ctx, rrect(-24, -78, 14, 44, 4), { fill: PAL.teal, line: 2.6, seed: 316, grain: .2 });
  shape(ctx, xform(rrect(-6, -92, 46, 16, 8), 0, 0), { fill: PAL.mustardL, line: 2.6, seed: 317, grain: .25 });
  ctx.restore();
}
// a round serving tray with two glasses
export function tray(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  shape(ctx, ellipse(0, 0, 92, 22, 40), { fill: PAL.chrome, line: 3.6, seed: 320, grain: .2, breaks: .1 });
  shape(ctx, ellipse(0, -4, 78, 16, 40), { fill: PAL.chromeD, line: 0, grain: .15, off: [0, 0], alpha: .55 });
  for (const dx of [-34, 26]) {
    shape(ctx, spline([[dx - 14, -62], [dx + 14, -62], [dx + 8, -8], [dx - 8, -8]], true, 4), { fill: PAL.cream, line: 2.6, seed: 322, grain: .1, alpha: .92 });
    shape(ctx, spline([[dx - 12, -52], [dx + 12, -52], [dx + 7, -12], [dx - 7, -12]], true, 4), { fill: PAL.mustardL, line: 0, grain: .1, off: [0, 0], alpha: .9 });
  }
  ctx.restore();
}
