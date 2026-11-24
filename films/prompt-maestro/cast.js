// cast.js — the two esperpento leads, drawn from primitives. Own designs.
// Character-local origin = the ground between the feet, y down. iván ≈ 300 px tall, zacarías ≈ 340.
import * as T from './toon.js';
import { clamp, lerp, TAU, hash } from '/core/lib.js';
const { shape, line, dot, push, pop, translate, rotate, scale, ell, arc, spline, quad, rr, rect, noodle, ribbon, S } = T;

export const P = {
  white: '#FCFBF7', paper: '#F1EEE6', pale: '#E4E1D8', light: '#C8C5BC', mid: '#9A978F',
  dmid: '#6B6963', dark: '#3B3A37', ink: '#0E0D0C'
};

// ————————————————————— shared parts —————————————————————
export function pieEye(cx, cy, rx, ry, o = {}) {
  const type = o.type || 'open', lw = S.lw * .85;
  if (type === 'happy') { line(arc(cx, cy + ry * .3, rx * .9, ry * .5, Math.PI * 1.1, Math.PI * 1.9, 12), lw * 1.2); return; }
  if (type === 'shut') { line(arc(cx, cy - ry * .1, rx * .9, ry * .35, Math.PI * .1, Math.PI * .9, 10), lw * 1.15); return; }
  if (type === 'squeeze') { const s = o.side ?? 1; line([[cx - rx * s, cy - ry * .55], [cx + rx * .8 * s, cy], [cx - rx * s, cy + ry * .55]], lw * 1.3); return; }
  const big = type === 'wide' ? 1.16 : 1, eR = rx * big, eY = ry * big;
  const lx = clamp(o.lx ?? 0, -1, 1), ly = clamp(o.ly ?? 0, -1, 1);
  const pr = type === 'wide' ? .44 : .64, pry = type === 'wide' ? .5 : .74;
  const pcx = cx + lx * eR * (1 - pr) * .9, pcy = cy + ly * eY * (1 - pry) * .85 + eY * .06;
  shape(ell(cx, cy, eR, eY), {
    fill: P.white, lw, shade: clip => {
      const w0 = -100 * Math.PI / 180, w1 = -40 * Math.PI / 180, prx = eR * pr, pry2 = eY * pry, pts = [];
      for (let i = 0; i <= 22; i++) { const a = w1 + i / 22 * (TAU - (w1 - w0)); pts.push([pcx + Math.cos(a) * prx, pcy + Math.sin(a) * pry2]); }
      pts.push([pcx + Math.cos((w0 + w1) / 2) * prx * .14, pcy + Math.sin((w0 + w1) / 2) * pry2 * .14]);
      clip(pts, P.ink);
      if (o.lid) {
        const yl = cy - eY + o.lid * 2 * eY;
        clip([[cx - eR * 1.2, cy - eY * 1.3], [cx + eR * 1.2, cy - eY * 1.3], [cx + eR * 1.2, yl], [cx - eR * 1.2, yl]], P.white);
      }
    }
  });
  if (o.lid) {
    const yl = cy - eY + o.lid * 2 * eY, hw = Math.sqrt(Math.max(0, 1 - Math.pow((yl - cy) / eY, 2))) * eR;
    if (hw > 2) line([[cx - hw, yl], [cx + hw, yl]], lw);
  }
}

export function brow(cx, cy, w, type, side = 1) {
  const s = side, lw = S.lw * 1.2, ix = cx - s * w * .5, ox = cx + s * w * .5;
  if (type === 'up') line(arc(cx, cy + w * .45, w * .55, w * .38, Math.PI * 1.15, Math.PI * 1.85, 8), lw);
  else if (type === 'sad') line(quad([ix, cy - w * .34], [cx, cy - w * .12], [ox, cy + w * .06]), lw);
  else if (type === 'angry') line(quad([ix, cy + w * .16], [cx, cy - w * .05], [ox, cy - w * .32]), lw);
  else if (type === 'flat') line([[cx - w * .45, cy], [cx + w * .45, cy]], lw);
}

export function mouth(cx, cy, w, type = 'smile', o = {}) {
  const lw = S.lw * .95, h = w * (o.open ?? .55), clipFill = (pts, col) => { };
  if (type === 'smile') { line(quad([cx - w / 2, cy - w * .06], [cx, cy + w * .3], [cx + w / 2, cy - w * .06]), lw * 1.05); line(arc(cx - w / 2 - 2, cy - w * .06, w * .09, w * .09, Math.PI * .6, Math.PI * 1.4, 5), lw * .75); line(arc(cx + w / 2 + 2, cy - w * .06, w * .09, w * .09, -Math.PI * .4, Math.PI * .4, 5), lw * .75); return; }
  if (type === 'frown') { line(quad([cx - w / 2, cy + w * .1], [cx, cy - w * .2], [cx + w / 2, cy + w * .1]), lw * 1.05); return; }
  if (type === 'flat') { line([[cx - w * .38, cy], [cx + w * .38, cy + 2]], lw); return; }
  if (type === 'wavy') {
    const top = [], bot = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10, x = cx - w / 2 + u * w; top.push([x, cy - h * .22 + Math.sin(u * TAU * 2) * w * .045]); bot.push([x, cy + h * .32 + Math.sin(u * TAU * 2 + 1) * w * .045]); }
    shape([...top, ...bot.reverse()], { fill: P.ink, lw }); return;
  }
  if (type === 'o') { const r = w * .2; shape(ell(cx, cy + r * .2, r, r * 1.25), { fill: P.ink, lw, shade: c => c(ell(cx, cy + r * 1.1, r * .7, r * .5), P.dmid) }); return; }
  if (type === 'bleh') {
    mouth(cx, cy, w, 'open', { open: .45 });
    shape(spline([[cx - w * .15, cy + w * .12], [cx - w * .18, cy + w * .38], [cx, cy + w * .52], [cx + w * .18, cy + w * .38], [cx + w * .15, cy + w * .12]], true, 5), { fill: P.dmid, lw: lw * .85 });
    return;
  }
  // open / grin / beam / shout
  const up = type === 'beam' ? .1 : type === 'grin' ? .04 : -.03;
  const pts = [...quad([cx - w / 2, cy - w * up], [cx, cy + w * (up * .5)], [cx + w / 2, cy - w * up], 8),
               ...quad([cx + w / 2, cy - w * up], [cx, cy + h * 1.5], [cx - w / 2, cy - w * up], 12).slice(1)];
  shape(pts, {
    fill: P.ink, lw, shade: clip => {
      clip(ell(cx + w * .05, cy + h * .95, w * .25, h * .4), P.dmid);
      if (type === 'grin' || type === 'beam') clip([[cx - w / 2, cy - w * up - 30], [cx + w / 2, cy - w * up - 30], [cx + w / 2, cy + h * .2], [cx - w / 2, cy + h * .2]], P.white);
    }
  });
}

// four-finger glove: wrist at origin, fingers +x
export function glove(x, y, ang, type = 'open', k = 1, flip = false) {
  push(); translate(x, y); rotate(ang); scale(k * (flip ? -1 : 1), k);
  const fw = 13, parts = [];
  const finger = (a, len, w = fw, curl = 0) => {
    const b = [21 + Math.cos(a * Math.PI / 180) * len, Math.sin(a * Math.PI / 180) * len];
    const c = [21 + Math.cos(a * Math.PI / 180) * len * .55 + Math.cos((a + 90) * Math.PI / 180) * curl, Math.sin(a * Math.PI / 180) * len * .55 + Math.sin((a + 90) * Math.PI / 180) * curl];
    parts.push(ribbon(quad([21, 0], c, b, 6), w, w * .95));
  };
  if (type === 'open' || type === 'wave') { finger(-34, 29); finger(-4, 32); finger(27, 28); finger(-88, 21, fw * 1.05); }
  else if (type === 'point') { finger(-4, 44, fw * .9); finger(-95, 17, fw * 1.05); }
  else if (type === 'grab') { finger(-26, 23, fw, 9); finger(2, 25, fw, 9); finger(28, 21, fw, 9); finger(-88, 18, fw * 1.05); }
  else if (type === 'thumb') { finger(-90, 25, fw * 1.1); }
  else if (type === 'fist') { finger(-90, 13, fw * 1.1); }
  parts.push(ell(21, 0, 18, 17, 22));
  parts.push(spline([[-7, -12], [3, -20], [10, -14], [10, 14], [3, 20], [-7, 12], [-9, 0]], true, 4));
  // union outline: stroke all thick, then fill all
  T.g.globalCompositeOperation = 'source-over';
  const polys = parts.map(p => { const q = p.map(pt => T.tx(pt[0], pt[1])); return q; });
  const c2 = T.g; c2.lineJoin = 'round';
  for (const q of polys) { c2.beginPath(); c2.moveTo(q[0][0], q[0][1]); for (const pt of q) c2.lineTo(pt[0], pt[1]); c2.closePath(); c2.lineWidth = S.lw * 2; c2.strokeStyle = P.ink; c2.stroke(); }
  for (const q of polys) { c2.beginPath(); c2.moveTo(q[0][0], q[0][1]); for (const pt of q) c2.lineTo(pt[0], pt[1]); c2.closePath(); c2.fillStyle = P.white; c2.fill(); }
  // stitching
  const lwq = S.lw * .55;
  if (type !== 'fist' && type !== 'point' && type !== 'thumb') { for (const dy of [-6, 0, 6]) line([[13, dy], [24, dy * 1.35]], lwq); }
  else { line(arc(29, 0, 8, 12, -1.2, 1.2, 6), lwq); }
  line(quad([2, -15], [5, 0], [2, 15]), lwq);
  pop();
}

export function shoe(x, y, dir = 1, k = 1) {
  push(); translate(x, y); scale(dir * k, k);
  shape(spline([[-15, 0], [-17, -12], [-6, -19], [10, -21], [27, -18], [36, -8], [33, 3], [12, 5], [-8, 4]], true, 5), { fill: P.ink, lw: S.lw * .9 });
  shape(ell(21, -12, 6.5, 3.4), { fill: P.white, noStroke: true });
  pop();
}
export const hose = (a, b, bend, w) => shape(noodle(a, b, bend, w), { fill: P.ink, lw: S.lw * .8 });

// ————————————————————— IVÁN —————————————————————
// IVÁN · the consultant-turned-pope: a mitre, huge eyes and a rubber-hose flutter.
// p: { x, y, k, sx, sy, lean, t, eyes, brows, mouth, sweat, armL, armR, legL, legR, staff, cape, lift, turn }
export function ivan(p = {}) {
  const k = p.k || 1, t = p.t || 0;
  push(); translate(p.x, p.y); scale(k * (p.mirror ? -1 : 1), k);
  if (p.lean) rotate(p.lean);
  scale(p.sx || 1, p.sy || 1);
  const lift = p.lift || 0;
  translate(0, -lift);
  const hip = -80, bodyTop = -230, headY = -258;
  // legs
  for (const [key, s] of [['legL', -1], ['legR', 1]]) {
    const L = p[key] || { x: s * 30, y: 0 };
    hose([s * 26, hip], [L.x, L.y - 10], L.bend ?? s * 5, 15);
  }
  for (const [key, s] of [['legL', -1], ['legR', 1]]) { const L = p[key] || { x: s * 30, y: 0 }; shoe(L.x - 8, L.y, L.dir ?? (s > 0 ? 1 : -1), 1.05); }
  // arms behind
  const arm = (A, s) => {
    if (!A) return;
    const sh = [s * 46, bodyTop + 46];
    hose(sh, [A.x, A.y], A.bend ?? s * -16, 14);
    const ang = A.rot ?? Math.atan2(A.y - sh[1], A.x - sh[0]);
    glove(A.x, A.y, ang, A.hand || 'open', A.hk || 1, s < 0);
  };
  if (p.armL && !p.armL.front) arm(p.armL, -1);
  if (p.armR && !p.armR.front) arm(p.armR, 1);
  // cassock body: a tall bell
  const body = spline([[-34, bodyTop], [34, bodyTop], [58, hip + 20], [66, 2], [0, 10], [-66, 2], [-58, hip + 20]], true, 6);
  shape(body, {
    fill: P.white, shade: clip => {
      // one hard shadow band on the right, light from upper left
      clip([[16, bodyTop - 10], [72, bodyTop - 10], [80, 20], [10, 20]], P.light);
      // sash
      clip([[-70, -128], [70, -128], [76, -104], [-76, -104]], P.dmid);
    }
  });
  // sash knot
  shape(ell(-6, -118, 16, 12), { fill: P.white, lw: S.lw * .8 });
  // collar + cape
  if (p.cape) {
    const kk = p.cape;
    shape(spline([[-40, bodyTop], [-46 - 10 * kk, -120], [-20, -70 + 10 * kk], [0, -66], [22, -70 + 10 * kk], [46 + 10 * kk, -120], [40, bodyTop]], true, 5), { fill: P.pale, lw: S.lw * .85 });
  }
  shape(spline([[-24, bodyTop - 4], [24, bodyTop - 4], [30, bodyTop + 26], [-30, bodyTop + 26]], true, 4), { fill: P.ink, lw: 0, noStroke: true });
  // head
  const head = spline([[0, headY - 52], [38, headY - 40], [52, headY + 6], [40, headY + 44], [0, headY + 54], [-40, headY + 44], [-52, headY + 6], [-38, headY - 40]], true, 6);
  shape(head, {
    fill: P.white, shade: clip => clip([[22, headY - 70], [70, headY - 70], [70, headY + 70], [26, headY + 70]], P.light)
  });
  // ears (flap out, cartoon size)
  for (const s of [-1, 1]) shape(ell(s * 54, headY + 4, 12, 18), { fill: P.white, lw: S.lw * .9 });
  // mitre: tall, with a band and a slight lean against the camera
  if (!p.noMitre) {
    const lean = p.mitreLean || 0;
    push(); translate(0, headY - 40); rotate(lean);
    shape(spline([[-34, 4], [-30, -60], [-14, -112], [0, -128], [14, -112], [30, -60], [34, 4]], true, 5), { fill: P.white, shade: clip => clip([[8, -140], [50, -140], [50, 10], [12, 10]], P.light) });
    shape(rect(-35, -14, 70, 20), { fill: P.ink, lw: S.lw * .8 });
    line([[0, -20], [0, -112]], S.lw * .8);
    pop();
  }
  // face
  const eyes = p.eyes || {}, mo = p.mouth || { type: 'flat' };
  const ey = headY + 2;
  pieEye(-17, ey, 13, 16, { ...eyes, side: -1 });
  pieEye(17, ey, 13, 16, { ...eyes, side: 1 });
  if (p.brows) { brow(-17, ey - 24, 18, p.brows, -1); brow(17, ey - 24, 18, p.brows, 1); }
  // nose: rubber-hose ball
  shape(ell(0, headY + 22, 9, 8), { fill: P.white, lw: S.lw * .9 });
  mouth(0, headY + 38, mo.w || 26, mo.type, mo);
  // sweat drops
  if (p.sweat) for (const [sx, sy, r] of p.sweat) {
    const wob = Math.sin(t * 6 + sx) * 2;
    shape(spline([[sx, sy - r * 2], [sx + r, sy + wob], [sx, sy + r * .9 + wob], [sx - r, sy + wob]], true, 4), { fill: P.white, lw: S.lw * .7 });
  }
  // hands in front
  if (p.armL && p.armL.front) arm(p.armL, -1);
  if (p.armR && p.armR.front) arm(p.armR, 1);
  // staff (his one prop: a crozier that is also an antenna)
  if (p.staff) {
    const [hx, hy] = p.staff;
    line([[hx, hy], [hx, 4]], 10, P.ink);
    shape(arc(hx, hy - 26, 22, 26, Math.PI * .95, Math.PI * 2.05, 14).concat([[hx + 22, hy - 22], [hx + 14, hy - 30], [hx + 8, hy - 18]]), { fill: P.ink, lw: 3 });
  }
  pop();
}

// ————————————————————— ZACARÍAS —————————————————————
// ZACARÍAS · the investor with the long face: lantern jaw, aviator cap, goggles, a cigar and a briefcase.
// p: { x, y, k, sx, sy, lean, t, eyes, brows, mouth, armL, armR, legL, legR, cigar, goggles, hat, case, sweat, ash }
export function zacarias(p = {}) {
  const k = p.k || 1, t = p.t || 0;
  push(); translate(p.x, p.y); scale(k * (p.mirror ? -1 : 1), k);
  if (p.lean) rotate(p.lean);
  scale(p.sx || 1, p.sy || 1);
  const hip = -86, waist = -140, chest = -232, headY = -262;
  // legs
  for (const [key, s] of [['legL', -1], ['legR', 1]]) { const L = p[key] || { x: s * 34, y: 0 }; hose([s * 30, hip], [L.x, L.y - 10], L.bend ?? s * 4, 17); }
  for (const [key, s] of [['legL', -1], ['legR', 1]]) { const L = p[key] || { x: s * 34, y: 0 }; shoe(L.x - 9, L.y, L.dir ?? (s > 0 ? 1 : -1), 1.2); }
  // arms behind
  const arm = (A, s) => {
    if (!A) return;
    const sh = [s * 58, chest + 34];
    hose(sh, [A.x, A.y], A.bend ?? s * -14, 16);
    const ang = A.rot ?? Math.atan2(A.y - sh[1], A.x - sh[0]);
    glove(A.x, A.y, ang, A.hand || 'open', (A.hk || 1) * 1.1, s < 0);
  };
  if (p.armL && !p.armL.front) arm(p.armL, -1);
  if (p.armR && !p.armR.front) arm(p.armR, 1);
  // body: a rounded slab, shoulders wider than hips
  const body = spline([[-40, chest], [40, chest], [62, chest + 40], [54, waist], [46, hip + 6], [0, hip + 16], [-46, hip + 6], [-54, waist], [-62, chest + 40]], true, 6);
  shape(body, {
    fill: P.white, shade: clip => {
      clip([[20, chest - 10], [80, chest - 10], [80, hip + 20], [14, hip + 20]], P.light);
      // waistcoat buttons
      clip([[-4, waist + 4], [26, waist + 4], [26, hip - 6], [-4, hip - 6]], P.pale);
    }
  });
  // tie + waistcoat V
  shape([[-20, chest], [20, chest], [8, waist + 6], [0, waist + 22], [-8, waist + 6]].map(q => q), { fill: P.dmid, lw: S.lw * .8 });
  for (let i = 0; i < 3; i++) dot(14, waist + 20 + i * 26, 4.2, P.ink);
  // collar flaps
  for (const s of [-1, 1]) shape([[-s * 6, chest - 6], [-s * 34, chest - 2], [-s * 16, chest + 34]], { fill: P.white, lw: S.lw * .9 });
  // head: long, heavy jaw
  const head = spline([[0, headY - 56], [40, headY - 44], [54, headY + 10], [46, headY + 58], [20, headY + 92], [0, headY + 98], [-20, headY + 92], [-46, headY + 58], [-54, headY + 10], [-40, headY - 44]], true, 6);
  shape(head, {
    fill: P.white, shade: clip => {
      clip([[22, headY - 70], [76, headY - 70], [76, headY + 110], [26, headY + 110]], P.light);
      // stubble shadow along the jaw
      clip([[-60, headY + 58], [60, headY + 58], [60, headY + 120], [-60, headY + 120]], P.pale);
    }
  });
  for (const s of [-1, 1]) shape(ell(s * 55, headY + 14, 11, 19), { fill: P.white, lw: S.lw * .9 });
  // aviator cap + goggles
  if (p.hat !== false) {
    shape(spline([[-52, headY - 6], [-48, headY - 52], [0, headY - 70], [48, headY - 52], [52, headY - 6], [36, headY - 16], [-36, headY - 16]], true, 5), {
      fill: P.dark, shade: clip => clip([[12, headY - 80], [70, headY - 80], [70, headY + 10], [16, headY + 10]], P.ink)
    });
    for (const s of [-1, 1]) shape(ell(s * 52, headY + 2, 16, 24), { fill: P.dark, lw: S.lw * .8 });
  }
  // goggles resting on the cap
  if (p.goggles !== false) {
    for (const s of [-1, 1]) {
      shape(ell(s * 22, headY - 44, 19, 14), { fill: P.pale, lw: S.lw * .8, shade: clip => clip([[-6, headY - 60], [46, headY - 60], [46, headY - 26], [-2, headY - 26]], P.white) });
    }
    line([[-2, headY - 44], [2, headY - 44]], S.lw * 1.2);
    line([[-41, headY - 44], [-52, headY - 40]], S.lw * .9); line([[41, headY - 44], [52, headY - 40]], S.lw * .9);
  }
  // face
  const eyes = p.eyes || {}, mo = p.mouth || { type: 'flat' };
  const ey = headY + 12;
  pieEye(-19, ey, 11, 14, { ...eyes, side: -1 });
  pieEye(19, ey, 11, 14, { ...eyes, side: 1 });
  if (p.brows) { brow(-19, ey - 22, 16, p.brows, -1); brow(19, ey - 22, 16, p.brows, 1); }
  // long nose
  shape(spline([[0, ey + 4], [16, ey + 12], [10, ey + 34], [-2, ey + 30]], true, 4), { fill: P.white, lw: S.lw * .85 });
  mouth(0, headY + 60, mo.w || 30, mo.type, mo);
  // cigar + smoke
  if (p.cigar) {
    const [cx, cy, len, ang] = p.cigar;
    push(); translate(cx, cy); rotate(ang);
    shape(rect(0, -6, len, 12), { fill: P.dark, lw: S.lw * .7 });
    shape(rect(len - 6, -6, 8, 12), { fill: P.ink, lw: 0, noStroke: true });
    if (p.ash) shape(rect(len - 2, -6, 6, 12), { fill: P.mid, lw: 0, noStroke: true });
    pop();
    if (p.smoke) for (let i = 0; i < 3; i++) {
      const u = i / 3, x0 = cx + Math.cos(ang) * len, y0 = cy + Math.sin(ang) * len;
      const wob = Math.sin(t * 2.2 + i * 1.7) * 8;
      shape(ell(x0 + wob + 6 + i * 4, y0 - 26 - i * 26 - u * 10, 10 + i * 4, 8 + i * 3), { fill: null, lw: S.lw * .55 });
    }
  }
  // briefcase
  if (p.case) {
    const [bx, by, kk] = p.case;
    push(); translate(bx, by); rotate(p.caseAng || 0); scale(kk);
    shape(rr(-46, -30, 92, 60, 8), { fill: P.dark, lw: S.lw * .9, shade: clip => clip([[10, -40], [60, -40], [60, 40], [12, 40]], P.ink) });
    line([[0, -30], [0, -44]], S.lw * .8); shape(rr(-12, -48, 24, 10, 4), { fill: P.ink, lw: 2 });
    shape(rect(-12, -6, 24, 12), { fill: P.pale, lw: S.lw * .6 });
    pop();
  }
  if (p.armL && p.armL.front) arm(p.armL, -1);
  if (p.armR && p.armR.front) arm(p.armR, 1);
  if (p.sweat) for (const [sx, sy, r] of p.sweat) {
    const wob = Math.sin(t * 5 + sx) * 2;
    shape(spline([[sx, sy - r * 2], [sx + r, sy + wob], [sx, sy + r * .9 + wob], [sx - r, sy + wob]], true, 4), { fill: P.white, lw: S.lw * .7 });
  }
  pop();
}

// ————————————————————— props —————————————————————
// The plate: a paper sheet with a printed diagram (a "pitch deck" that is also a collection plate).
export function slideSheet(_ctx, x, y, w, h, k, o = {}) {
  push(); translate(x, y); scale(Math.max(0.0001, k), Math.max(0.0001, k));
  const hw = w / 2, hh = h / 2;
  // the sheet
  shape(rect(-hw, -hh, w, h), { fill: '#FCFAF4', lw: S.lw * 1.4, shade: q => q([[-hw, hh - 22], [hw, hh - 22], [hw, hh], [-hw, hh]], P.light) });
  // slide furniture: a title bar and a footer rule
  shape(rect(-hw + 24, -hh + 20, w * .52, 16), { fill: P.ink, lw: 0, noStroke: true });
  line([[-hw + 24, hh - 18], [hw - 24, hh - 18]], 2.5, P.ink);
  if (o.chart) {
    const n = 4, base = hh - 46, x0 = -hw + 40, span = w - 84;
    // axes
    line([[x0 - 10, base], [x0 - 10, -hh + 58]], 3.5, P.ink);
    line([[x0 - 10, base], [hw - 30, base]], 3.5, P.ink);
    for (let i = 0; i < n; i++) {
      const last = i === n - 1;
      const bh = (h * .16 + i * h * .14) * (last ? 1.55 : 1) * (1 + (o.grow || 0) * .12 * i);
      const bx = x0 + i * span / n;
      shape(rect(bx, base - bh, span / n - 26, bh), { fill: last ? P.dark : i % 2 ? P.mid : P.dmid, lw: 3.5, stroke: P.ink });
      // value ticks on top of each bar
      shape(rect(bx + 6, base - bh - 14, span / n - 38, 7), { fill: P.ink, lw: 0, noStroke: true });
    }
    // the line that climbs, then falls off the last bar
    const pts = [];
    for (let i = 0; i < n; i++) {
      const bh = (h * .16 + i * h * .14) * (i === n - 1 ? 1.55 : 1) * (1 + (o.grow || 0) * .12 * i);
      pts.push([x0 + i * span / n + (span / n - 26) / 2, base - bh - 22]);
    }
    pts.push([pts[n - 1][0] + 30, base - 10]);
    line(pts, 5.5, P.ink);
    // a little arrowhead at the crash
    const [ax, ay] = pts[pts.length - 1];
    shape([[ax - 4, ay - 14], [ax + 12, ay], [ax - 16, ay + 4]], { fill: P.ink, lw: 2 });
  }
  if (o.coins) for (let i = 0; i < 7; i++) {
    const a = i * 2.4, rr2 = 18 + i * 5;
    shape(ell(Math.cos(a) * rr2, Math.sin(a) * rr2 + hh * .2, 10, 6), { fill: P.pale, lw: S.lw * .6 });
  }
  pop();
}

// Money bag with a coin face (a bank, in the 1930s sense)
export function moneyBag(x, y, k, o = {}) {
  push(); translate(x, y); scale(k);
  shape(spline([[-16, -48], [16, -48], [30, -70], [10, -84], [-10, -84], [-30, -70]], true, 5), { fill: P.pale, lw: S.lw * .8 });
  const body = spline([[-24, -46], [24, -46], [52, 6], [40, 54], [0, 70], [-40, 54], [-52, 6]], true, 6);
  shape(body, { fill: P.white, shade: clip => clip([[10, -50], [60, -50], [60, 80], [8, 80]], P.light) });
  shape(ell(0, 10, 20, 20), { fill: P.pale, lw: S.lw * .8 });
  if (o.face) { pieEye(-7, 4, 5, 7, o.eyes || {}); pieEye(7, 4, 5, 7, o.eyes || {}); mouth(0, 20, 14, o.mouth || 'smile'); }
  shape(rect(-26, -50, 52, 10), { fill: P.ink, lw: 3 });
  pop();
}

// A drop of a "prompt": a quotation mark that behaves like a raindrop
export function quoteDrop(x, y, s, k = 1) {
  push(); translate(x, y); scale(k);
  shape(spline([[0, -s], [s * .7, s * .2], [0, s], [-s * .7, s * .2]], true, 5), { fill: P.white, lw: S.lw * .7 });
  pop();
}
