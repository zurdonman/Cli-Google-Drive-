// scenes.js — the eight shots of PROMPT MAESTRO. Each shot draws into the 4:3 gate (x 240..1680),
// characters on twos, camera on ones.
import * as T from './toon.js';
import { P, ivan, zacarias, slideSheet, moneyBag, pieEye } from './cast.js';
import { clamp, lerp, seg, eo, ei, eio, back, spring, hash, TAU } from '/core/lib.js';
import { GATE } from './reel.js';
import { K, SHOTS, SUBS, BEAT, bar, DUR } from './story.js';
import { fatTitle, subCard, titleCard, decoBorder } from './graphics.js';

// the gate is the frame: everything is drawn inside it
export const GX = GATE.x, GY = GATE.y, GW = GATE.w, GH = GATE.h;
const GROUND = 900;      // the floor line every character stands on
const CXg = GX + GW / 2; // gate centre

// camera: shift + zoom around the gate centre
const cam = (ctx, x = 0, y = 0, s = 1) => { ctx.setTransform(1, 0, 0, 1, 0, 0); const cx = CXg, cy = 560; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx + x, -cy + y); };

// on twos: a stepped clock for character animation
export const twos = t => Math.floor(t * 12 + 1e-6) / 12;

let EV = [];
const E = (t, type, o = {}) => EV.push({ t: +(Math.max(0, t)).toFixed(4), type, ...o });

export function buildEvents() {
  EV = [];
  // A · card
  E(K.rollIn, 'shade', { d: K.rollOut - K.rollIn });
  for (let i = 0; i < 12; i++) E(K.hop0 + i * K.hopGap, 'hop', { i });
  // B · hall
  E(K.hallIn, 'doorOpen', { d: .5 });
  for (const [t] of K.doors) E(t, 'doorShut');
  E(K.drop1, 'plip'); E(K.drop1 + .12, 'plip'); E(K.drop1 + .28, 'plip');
  E(K.ivanIn, 'stepThrone'); E(K.zacIn, 'stepShoe');
  E(K.slideOut, 'whip');
  E(K.stamp, 'stamp');
  // C · corridor
  for (let t = K.run0; t < K.skid; t += BEAT / 2) E(t, 'stepRun');
  for (const t of K.doorsPass) E(t, 'doorWhoosh');
  E(K.brief1, 'briefOpen'); E(K.brief1 + .1, 'coins');
  E(K.leash, 'leash'); E(K.tangle, 'tangle'); E(K.skid, 'skid', { d: .7 });
  // D · boardroom
  E(K.chartIn, 'paper'); for (const t of K.flames) E(t, 'fwoosh');
  E(K.moneyIn, 'coinRain', { d: 1.2 });
  E(K.proof, 'stamp'); E(K.burn, 'burn', { d: 1.4 });
  // E · sky
  E(K.rise, 'whoosh', { d: .9 });
  E(K.chair, 'creak');
  for (let i = 0; i < K.promptN; i++) E(K.promptDrop + i * K.promptGap, 'plip');
  for (const t of K.numbers) E(t, 'chime');
  // F · bonus
  E(K.curtain, 'curtain', { d: .8 }); E(K.env, 'envelope', { d: .6 });
  E(K.news, 'fanfare'); E(K.confetti, 'confetti', { d: 2.2 });
  // G/H
  E(K.card2In, 'stamp2');
  E(K.iris1, 'irisShut');
  return EV.slice().sort((a, b) => a.t - b.t);
}

// ————————————————————————————— A · title card —————————————————————————————
function shotCard(ctx, t, bg) {
  const inK = back(seg(t, K.rollIn, K.rollIn + .75), 1.7), outK = eio(seg(t, K.rollOut, K.rollOut + .55));
  const vis = inK * (1 - outK);
  // the blank frame behind: paper, deco border, dust
  T.shape(T.rect(0, 0, 1920, 1080), { fill: '#F1EEE6', noStroke: true });
  decoBorder(ctx, 34, t, { x: GX, y: GY, w: GW, h: GH });
  // as the card lifts, it uncovers the hall behind it, so the wipe reveals a room and not paper
  if (bg && outK > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, outK * 3);
    ctx.drawImage(bg, -(bg.width - 1920) / 2, -(bg.height - 1080) / 2 - 20, bg.width, bg.height);
    ctx.restore();
  }
  if (vis <= .001) return;
  // the card is a physical object: it drops from above the gate and is lifted away at the end
  ctx.save(); ctx.translate(0, -lerp(1240, 0, inK) - outK * 900);
  titleCard(ctx, null, 960, 520, { w: 1260, h: 470, burst: t * .25 });
  const word = 'PROMPT MAESTRO';
  const hop = i => { const t0 = K.hop0 + i * K.hopGap, k = back(seg(t, t0, t0 + .24), 2.6); return (1 - k) * 70; };
  fatTitle(ctx, word, 960, 452, 126, { bounce: hop, track: 3, bw: .11, maxW: 1120 });
  // the tagline and the billing only arrive once the last letter has landed
  const a1 = seg(t, 2.50, 2.86), a2 = seg(t, 2.68, 3.04);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1; ctx.font = '36px "Eagle Lake"'; ctx.textAlign = 'center'; ctx.fillStyle = P.paper;
    ctx.fillText('una superproducción de la nada', 960, 552 + (1 - a1) * 16); ctx.restore();
  }
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2 * .85; ctx.font = '24px Limelight'; ctx.textAlign = 'center'; ctx.fillStyle = P.paper;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '5px';
    ctx.fillText('IVÁN · ZACARÍAS · Y UNA CARTERA', 960, 640 + (1 - a2) * 12); ctx.restore();
  }
  ctx.restore();
}

// ————————————————————————————— B · hall —————————————————————————————
const CARDS = ['Respuesta de Iván', 'Respuesta de Iván', 'Respuesta de Zacarías', 'Respuesta de Zacarías'];
function shotHall(ctx, t, bg) {
  cam(ctx, 0, -10, 1.02 + .03 * seg(t, SHOTS[1][0], SHOTS[1][1]));
  ctx.drawImage(bg, -(bg.width - 1920) / 2, -(bg.height - 1080) / 2 - 20, bg.width, bg.height);
  // the two doors behind: a strip of light under each
  const tt = twos(t);
  // — the three paper cards that fall from the ceiling —
  const cards = [
    { x: 660, y0: -200, t: K.drop1, land: 300, txt: 'Acceso al cielo' },
    { x: 940, y0: -320, t: K.drop1 + .4, land: 330, txt: 'Facturación de milagros' },
    { x: 1220, y0: -240, t: K.drop1 + .8, land: 300, txt: 'Premios' },
  ];
  for (const c of cards) {
    const k = seg(t, c.t, c.t + .55), fall = k <= 0 ? 0 : c.y0 + (c.land - c.y0) * Math.pow(k, 1.7);
    if (k <= 0) continue;
    const wob = Math.sin((t - c.t) * 7) * (1 - k) * 16;
    ctx.save(); ctx.translate(c.x + wob, fall); ctx.rotate(Math.sin(t * 2 + c.x) * .05 * (1 - k * .6));
    T.shape(T.rect(-104, -40, 208, 80), { fill: P.white, lw: 4 });
    ctx.save(); ctx.beginPath(); ctx.rect(-104, -40, 208, 80); ctx.clip();
    ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.font = '600 15px Anton'; ctx.fillText('RESPUESTA', 0, -14);
    ctx.font = '16px "Eagle Lake"'; ctx.fillText(c.txt, 0, 10);
    ctx.font = '600 13px Anton'; ctx.fillText('NO DISPONIBLE', 0, 30);
    ctx.restore(); ctx.restore();
  }
  // contact shadows: they keep the cast on the floor
  ctx.save(); ctx.globalAlpha = .16;
  T.shape(T.ell(860, GROUND + 2, 150, 16), { fill: P.ink, noStroke: true, lw: 0 });
  T.shape(T.ell(1290, GROUND + 22, 150, 15), { fill: P.ink, noStroke: true, lw: 0 });
  ctx.restore();
  // — IVÁN, centre, mitre first —
  ivanScene(ctx, t, tt);
  // — ZACARÍAS, at the right, back to camera-ish, working the crowd —
  zacScene(ctx, t, tt);
  // — the gorra that Zacarías passes —
  const pass = seg(t, 12.6, 13.4);
  if (pass > 0) {
    ctx.save(); ctx.translate(lerp(1180, 1500, pass), 860 - Math.sin(pass * Math.PI) * 40); ctx.rotate(.2);
    T.shape(T.spline([[-56, -18], [0, -26], [56, -18], [70, 20], [-70, 20]], true, 5), { fill: P.dark, lw: 4.5 });
    ctx.font = '600 18px Anton'; ctx.fillStyle = P.paper; ctx.textAlign = 'center'; ctx.fillText('SUBVENCIÓN', 0, 4);
    ctx.restore();
  }
  // — the seal: a rubber stamp that lands on the floor, one leg, the word swung round —
  if (t > K.stamp && t < K.stamp + 3.4) {
    const k = back(seg(t, K.stamp, K.stamp + .2), 3.2), a = 1 - seg(t, K.stamp + 2.9, K.stamp + 3.4);
    const bob = Math.sin(tt * 3) * 4;
    ctx.save(); ctx.translate(1120, GROUND + 18); ctx.rotate(-.07); ctx.scale(k * .78, k * .78); ctx.globalAlpha = a;
    // handle + stem
    T.shape(T.rr(-34, -300 + bob, 68, 120, 22), { fill: P.white, lw: 6 });
    T.shape(T.rect(-16, -190 + bob, 32, 90), { fill: P.white, lw: 6 });
    // the block, with the ink face
    T.shape(T.rr(-150, -110, 300, 96, 12), { fill: P.white, lw: 6 });
    T.shape(T.rect(-150, -26, 300, 20), { fill: P.ink, lw: 5 });
    ctx.font = '34px Anton'; ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.fillText('NO SUBVENCIÓN', 0, -48);
    ctx.restore();
    // the ink mark it has just left, stamped flat on the floor
    const mk = seg(t, K.stamp + .18, K.stamp + .42);
    if (mk > 0) {
      ctx.save(); ctx.globalAlpha = a * .9 * mk; ctx.translate(1440, GROUND + 40); ctx.rotate(-.05); ctx.scale(mk * .9 + .1, .9);
      ctx.font = '34px Anton'; ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.fillText('NO SUBVENCIÓN', 0, 0);
      ctx.restore();
    }
  }
  // — the phone that rings (little) then stops —
  if (t > 9.6 && t < 13.9) {
    const ring = Math.sin(t * 30) * 6 * seg(t, 9.6, 10.0) * (1 - seg(t, 13.3, 13.9));
    ctx.save(); ctx.translate(1520, 690); ctx.rotate(-.3 + ring * .02);
    T.shape(T.rr(-76, -48, 152, 96, 34), { fill: P.dark, lw: 5 });
    T.shape(T.rr(-44, -74, 88, 34, 15), { fill: P.dark, lw: 5 });
    ctx.font = '600 22px Anton'; ctx.fillStyle = P.paper; ctx.textAlign = 'center'; ctx.fillText('—', 0, 10);
    T.shape(T.rect(-58, -104, 116, 30), { fill: P.pale, lw: 4 });
    ctx.font = '600 16px Anton'; ctx.fillStyle = P.ink; ctx.fillText('TARJETA SIM', 0, -82);
    ctx.restore();
  }
}

// draw Iván with his three first-beat expressions
function ivanScene(ctx, t, tt) {
  const inK = back(seg(t, K.ivanIn, K.ivanIn + .5), 1.8);
  if (inK <= 0) return;
  const hop = Math.abs(Math.sin((tt - K.ivanIn) * 3.2)) * 10 * (1 - seg(t, K.ivanIn + .8, K.ivanIn + 1.6));
  const sway = Math.sin(tt * 1.9) * .02;
  const startled = t > K.drop1 && t < K.drop1 + 1.0;
  const preach = t > 10.9 && t < 13.0;
  const armRaise = preach ? .5 + .5 * Math.sin(tt * 5.5) : 0;
  ivan({
    x: 860, y: GROUND - 6 - hop, k: 1.18 * inK, t: tt, lean: sway,
    eyes: startled ? { type: 'wide', ly: -.3 } : { lx: .18, ly: -.1, lid: preach ? .12 : .3 },
    brows: startled ? 'up' : preach ? 'angry' : 'flat',
    mouth: startled ? { type: 'o' } : preach ? { type: 'open', open: .8 } : { type: 'flat', w: 22 },
    armR: { x: 120 + armRaise * 30, y: -250 - armRaise * 120, hand: 'point', rot: -1.2 + armRaise * .4 },
    armL: { x: -66, y: -96, hand: 'open' },
    legL: { x: -34, y: 0 }, legR: { x: 34, y: 0 },
    cape: preach ? 1 : .2, mitreLean: preach ? Math.sin(tt * 5.5) * .1 : 0,
    sweat: startled ? [[54, -300, 9]] : null,
  });
}

function zacScene(ctx, t, tt) {
  const inK = back(seg(t, K.zacIn, K.zacIn + .5), 1.8);
  if (inK <= 0) return;
  const bow = t > 11.8 && t < 13.6 ? .16 + .06 * Math.sin(tt * 6) : 0;
  const slideK = back(seg(t, K.slideOut, K.slideOut + .45), 1.6);
  zacarias({
    x: 1290, y: GROUND + 20, k: 1.02 * inK, t: tt, lean: .04 + bow,
    eyes: { lx: -.4, ly: .12, lid: .32 }, brows: 'sad',
    mouth: t > 12.2 ? { type: 'grin', open: .55 } : { type: 'smile', w: 26 },
    armR: t > 12.2 ? { x: 120, y: -170, hand: 'wave', rot: -.4 } : { x: 76, y: -120, hand: 'open' },
    armL: { x: -74, y: -130, hand: 'open' },
    cigar: [40, -238, 70, -.06], smoke: true,
    case: slideK > 0 ? [lerp(-20, 210, slideK), lerp(-120, -300, slideK), .95] : null, caseAng: -.4,
    sweat: t > K.stamp ? [[-52, -300, 10], [58, -276, 7]] : null,
  });
  // the slide sheet appears in his hand on "slideOut"
  const sk = back(seg(t, K.slideOut, K.slideOut + .4), 1.5);
  if (sk > 0) slideSheet(ctx, 1465, 566, 250, 160, sk * .86, { chart: true, coins: true, grow: seg(t, 12.8, 13.8) });
}

// ————————————————————————————— C · corridor —————————————————————————————
function shotCorridor(ctx, t, bg) {
  const run = seg(t, K.run0, K.skid);
  const shake = Math.sin(t * 22) * 3.5 * (run > 0 && t < K.skid ? 1 : 0);
  cam(ctx, shake + Math.sin(t * 3.4) * 6, 0, 1.0 + .04 * run);
  ctx.drawImage(bg, -(bg.width - 1920) / 2 - 20, -(bg.height - 1080) / 2, bg.width, bg.height);
  const tt = twos(t);
  // the corridor scroll: door plates pass right to left
  for (let i = 0; i < 6; i++) {
    const t0 = K.doorsPass[i], u = seg(t, t0, t0 + .7);
    if (u <= 0) continue;
    const x = lerp(1700, 120, u), y = 500 - (i % 2) * 40;
    ctx.save(); ctx.globalAlpha = 1 - Math.pow(u, 3) * .3; ctx.translate(x, y);
    T.shape(T.rect(-84, -26, 168, 52), { fill: P.light, lw: 3.5 });
    ctx.font = '600 19px Anton'; ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.fillText(i < 2 ? 'PREMIO' : i < 4 ? 'GRACIAS' : 'ADELANTO', 0, 7);
    ctx.restore();
  }
  const runCycle = tt * 10;
  // ZACARÍAS runs first (he has the bag), dragging IVÁN by a leash
  const zx = lerp(1460, 900, eio(seg(t, K.run0, K.skid + .5)));
  const zy = GROUND + 40 - Math.abs(Math.sin(runCycle)) * (t < K.skid ? 26 : 0);
  const bagK = seg(t, K.brief1, K.brief1 + .35);
  zacarias({
    x: zx, y: zy, k: 1.06, t: tt, lean: .22 + (t > K.skid ? .05 : 0),
    eyes: { type: t > K.skid ? 'wide' : 'open', lx: -.6, ly: 0, lid: t > K.skid ? 0 : .25 }, brows: 'sad',
    mouth: { type: t > K.skid ? 'wavy' : 'grin', open: .6 },
    legL: { x: -52 + Math.sin(runCycle) * 44, y: -Math.abs(Math.sin(runCycle)) * 34 }, legR: { x: 52 - Math.sin(runCycle) * 44, y: -Math.abs(Math.cos(runCycle)) * 34 },
    armR: { x: 120, y: -240 + Math.sin(runCycle) * 24, hand: 'grab' },
    armL: { x: -110, y: -150, hand: 'fist' },
    cigar: [40, -238, 70, -.06], smoke: true,
    case: bagK > 0 ? [-150, -130, .35] : null, caseAng: .8,
    sweat: t > K.skid ? [[-50, -300, 9]] : null,
  });
  // the briefcase bursting open (coins spring out)
  if (bagK > 0 && bagK < 1) {
    for (let i = 0; i < 10; i++) {
      const a = i * .9, d = bagK * (120 + i * 12);
      T.shape(T.ell(zx - 150 + Math.cos(a) * d, zy - 200 + Math.sin(a) * d * .7, 12, 7), { fill: P.pale, lw: 3.5 });
    }
  }
  // IVÁN on the leash, tumbling
  const ix = lerp(1080, 560, eio(seg(t, K.run0, K.skid + .6)));
  const tumble = seg(t, K.tangle, K.tangle + 1.2) * TAU * 1.4;
  const iy = GROUND - (t > K.tangle ? Math.abs(Math.sin((t - K.tangle) * 6)) * 40 * (1 - seg(t, K.tangle + 1, K.skid)) : 0);
  ctx.save(); ctx.translate(ix, iy); if (t > K.tangle) ctx.rotate(tumble * .35);
  ivan({
    x: 0, y: 0, k: 1.06, t: tt, lean: -.16,
    eyes: { type: t > K.tangle ? 'squeeze' : 'wide', lx: .5, ly: -.2 }, brows: 'sad',
    mouth: { type: t > K.tangle ? 'bleh' : 'wavy', open: .7 },
    legL: { x: -44 + Math.sin(runCycle + 1) * 40, y: -Math.abs(Math.sin(runCycle + 1)) * 30 }, legR: { x: 44 - Math.sin(runCycle + 1) * 40, y: -Math.abs(Math.cos(runCycle + 1)) * 30 },
    armR: { x: 110, y: -210, hand: 'grab' }, armL: { x: -96, y: -230, hand: 'open' },
    cape: .9, mitreLean: -.24,
    sweat: [[46, -300, 10]],
  });
  ctx.restore();
  // the leash: a rubber-hose line that tangles
  const lk = t > K.leash;
  if (lk) {
    const kx = (zx - 120 + ix + 90) / 2, ky = (zy - 200 + iy - 200) / 2 + (t > K.tangle ? Math.sin(t * 9) * 40 : 0);
    T.line(T.quad([zx - 120, zy - 200], [kx, ky], [ix + 90, iy - 200], 18), 7, P.ink);
  }
  // the skid marks
  if (t > K.skid) {
    ctx.globalAlpha = seg(t, K.skid, K.skid + .4);
    for (let i = 0; i < 5; i++) T.line([[zx + 40 + i * 34, GROUND + 40], [zx - 160 + i * 40, GROUND + 34]], 6);
    ctx.globalAlpha = 1;
  }
}

// ————————————————————————————— D · boardroom —————————————————————————————
function shotBoard(ctx, t, bg) {
  cam(ctx, 0, 0, 1.02);
  ctx.drawImage(bg, -(bg.width - 1920) / 2, -(bg.height - 1080) / 2, bg.width, bg.height);
  const tt = twos(t);
  // the slide he is presenting (the plate on the screen)
  const chartK = back(seg(t, K.chartIn, K.chartIn + .5), 1.5);
  if (chartK > 0) {
    ctx.save(); ctx.translate(1330, 330); ctx.rotate(-.02); ctx.scale(chartK * 1.45, chartK * 1.45);
    // paper shadow, then the sheet
    ctx.save(); ctx.globalAlpha = .22; T.shape(T.rect(-304, -196, 322, 218), { fill: P.ink, noStroke: true, lw: 0 }); ctx.restore();
    slideSheet(ctx, 0, 0, 300, 200, 1, { chart: true, grow: t > 26.4 ? 1 : 0 });
    const f0 = seg(t, K.char0, K.char0 + 2.6);
    if (f0 > 0) {
      // the paper chars and curls from its bottom edge up
      const edge = [];
      for (let i = 0; i <= 16; i++) {
        const x = -152 + (i / 16) * 304;
        edge.push([x, 100 - (10 + hash(i * 3.3) * 60) * f0 * f0 - Math.sin(t * 7 + i) * 5 * f0]);
      }
      T.shape([[-152, 104], ...edge, [152, 104]], { fill: P.ink, lw: 3.5 });
      // the surviving top of the sheet is scorched grey
      T.shape([[-152, -104], [152, -104], [152, 100 - 44 * f0], [-152, 100 - 44 * f0]], { fill: 'rgba(120,117,110,.35)', noStroke: true, lw: 0 });
      // smoke puffs rising off the burn
      for (let i = 0; i < 3; i++) {
        const u = (t * .55 + i * .33) % 1;
        ctx.save(); ctx.globalAlpha = (1 - u) * .85;
        T.shape(T.ell(-60 + i * 70 + Math.sin(u * 5 + i) * 12, 96 - u * 190, 16 + u * 26, 13 + u * 20), { fill: null, lw: 3.5 });
        ctx.restore();
      }
    }
    ctx.restore();
  }
  // IVÁN at the table, tiny, with the pointer
  const point = Math.sin(tt * 2.4) * .3;
  ivan({
    x: 980, y: GROUND + 60, k: 1.0, t: tt, lean: -.06,
    eyes: { lx: -.5, ly: .1, lid: .3 }, brows: 'angry', mouth: { type: 'open', open: .75 },
    armR: { x: 150 + point * 40, y: -300, hand: 'point', rot: -1.5 + point },
    armL: { x: -70, y: -110, hand: 'open' }, cape: .6,
  });
  // ZACARÍAS with the money bag growing in his arms
  const bagK = seg(t, K.moneyIn, K.moneyIn + .9);
  const squash = 1 + .06 * Math.sin(tt * 4);
  zacarias({
    x: 520, y: GROUND + 60, k: 1.04, t: tt, lean: .03,
    eyes: { lx: .5, ly: .2, lid: .3 }, brows: 'up', mouth: { type: 'grin', open: .6 },
    armR: { x: 90, y: -150 - bagK * 40, hand: bagK > 0 ? 'grab' : 'open' },
    armL: { x: -90, y: -150 - bagK * 40, hand: bagK > 0 ? 'grab' : 'open' },
    cigar: [40, -238, 70, -.06], smoke: true,
  });
  if (bagK > 0) moneyBag(ctx, 520, GROUND + 60 - 300 - bagK * 20, bagK * 1.5 * squash, { face: true, eyes: { lx: .2 }, mouth: 'grin' });
  // PRUEBA DE CONCEPTO card, then burnt
  const pK = back(seg(t, K.proof, K.proof + .22), 2.2);
  if (pK > 0) {
    ctx.save(); ctx.translate(960, 300); ctx.rotate(-.04); ctx.scale(pK, pK);
    T.shape(T.rr(-330, -54, 660, 108, 10), { fill: P.white, lw: 5 });
    ctx.font = '54px Anton'; ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.fillText('PRUEBA DE CONCEPTO', 0, 18);
    ctx.restore();
  }
  // the flames climb the frame, then all goes to paper
  const burn = seg(t, K.burn + .4, K.burn + 1.9);
  if (burn > 0) {
    ctx.save(); ctx.globalAlpha = 1;
    for (let i = 0; i < 30; i++) {
      const x = GX - 40 + (i / 29) * (GW + 80);
      const hh = (40 + hash(i * 3.7) * 260) * burn;
      const up = i % 2 === 0;
      T.shape(T.spline([[x - 70, up ? GY - 20 : GH + 20], [x - 40, up ? GY - 20 + hh * .5 : GH + 20 - hh * .5], [x, up ? GY - 20 + hh : GH + 20 - hh], [x + 40, up ? GY - 20 + hh * .5 : GH + 20 - hh * .5], [x + 70, up ? GY - 20 : GH + 20]], true, 4), { fill: P.paper, noStroke: true, lw: 0 });
    }
    for (let i = 0; i < 30; i++) {
      const y = GY - 40 + (i / 29) * (GH + 80);
      const ww = (40 + hash(i * 5.1) * 240) * burn;
      const left = i % 2 === 0;
      T.shape(T.spline([[left ? GX - 20 : GX + GW + 20, y - 70], [left ? GX - 20 + ww * .5 : GX + GW + 20 - ww * .5, y - 40], [left ? GX - 20 + ww : GX + GW + 20 - ww, y], [left ? GX - 20 + ww * .5 : GX + GW + 20 - ww * .5, y + 40], [left ? GX - 20 : GX + GW + 20, y + 70]], true, 4), { fill: P.paper, noStroke: true, lw: 0 });
    }
    ctx.restore();
  }
  if (t > K.burn + .9) {
    ctx.globalAlpha = seg(t, K.burn + .9, K.burn + 1.7);
    T.shape(T.rect(GX - 40, GY - 40, GW + 80, GH + 80), { fill: P.paper, noStroke: true });
    ctx.globalAlpha = 1;
  }
}

// ————————————————————————————— E · sky —————————————————————————————
// "The cloud" is a nightclub: a bored cloud bouncer, a velvet rope, and a paper island to stand on.
function shotSky(ctx, t, bg) {
  const rise = eio(seg(t, K.rise, K.rise + 2.4));
  const crane = eio(seg(t, K.chair, K.chair + 2.4));
  cam(ctx, Math.sin(t * .7) * 18, -rise * 60 - crane * 40 + Math.sin(t * 1.1) * 6, 1.0 + rise * .03 + crane * .05);
  ctx.drawImage(bg, -(bg.width - 1920) / 2, -(bg.height - 1080) / 2 + 40, bg.width, bg.height);
  const tt = twos(t);
  // —— the cloud bouncer: a heavy paper cloud with a face, breathing ——
  const breathe = 1 + .035 * Math.sin(tt * 1.5);
  ctx.save(); ctx.translate(960, 318); ctx.scale(breathe * .94, .94 / breathe);
  const blobs = [[-300, 20, 140], [-170, -50, 175], [10, -80, 195], [180, -40, 160], [310, 30, 130], [-60, 40, 165], [130, 60, 150], [-250, 90, 115]];
  for (const [bx, by, br] of blobs) T.shape(T.ell(bx, by, br, br * .74), { fill: P.white, lw: 7, shade: q => q([[bx - br, by + br * .2], [bx + br, by + br * .2], [bx + br, by + br], [bx - br, by + br]], P.light) });
  pieEye(-62, 26, 26, 33, { lx: .35, ly: .3, lid: .26 });
  pieEye(62, 26, 26, 33, { lx: .35, ly: .3, lid: .26 });
  T.shape(T.quad([-52, 92], [0, 112], [52, 92], 12), { fill: null, lw: 6 });
  ctx.restore();
  // —— the paper island they stand on: a torn sheet floating in the sky, ragged underside ——
  const isl = back(seg(t, K.rise, K.rise + .9), 1.4);
  if (isl > 0) {
    const y = 826 + (1 - isl) * 300, w = 650 * isl, cx0 = 960;
    const top = [];
    for (let i = 0; i <= 12; i++) top.push([cx0 - w + (i / 12) * w * 2, y + (i % 2 ? 7 : -5) + Math.sin(i * 2.3) * 4]);
    const under = [];
    const uw = w * .78;
    for (let i = 0; i <= 10; i++) {
      const u = i / 10, x = cx0 + uw - u * uw * 2;
      under.push([x, y + 26 + Math.sin(u * 7.4) * 12 + hash(i * 4.7) * 34 + Math.sin(Math.PI * u) * 96]);
    }
    ctx.save();
    ctx.globalAlpha = .12; T.shape(T.ell(cx0, y + 24, 340, 22), { fill: P.ink, noStroke: true, lw: 0 });
    ctx.restore();
    T.shape([...top, [cx0 + uw, y + 26], ...under, [cx0 - uw, y + 26]],
      { fill: '#FCFAF4', lw: 7, shade: q => q([[cx0 - w, y + 30], [cx0 + w, y + 30], [cx0 + w, y + 130], [cx0 - w, y + 130]], P.light) });
    T.line(top, 5, P.ink);
  }
  const baseY = 824;
  // —— the velvet rope: two brass posts and the cord, dropped on the beat ——
  const ropeK = back(seg(t, K.chair, K.chair + .5), 1.5);
  if (ropeK > 0) {
    for (const px of [1180, 1520]) {
      T.line([[px, baseY + 6], [px, baseY - 150 * ropeK]], 9, P.ink);
      T.shape(T.ell(px, baseY - 156 * ropeK, 15, 15), { fill: P.white, lw: 5 });
      T.shape(T.ell(px, baseY + 6, 30, 9), { fill: P.ink, lw: 4 });
    }
    const sag = 70 * ropeK + Math.sin(tt * 2) * 6;
    T.shape(T.ribbon(T.quad([1180, baseY - 146 * ropeK], [1350, baseY - 146 * ropeK + sag], [1520, baseY - 146 * ropeK], 16), 16, 16), { fill: P.dark, lw: 4 });
  }
  // —— the prompt drops fall from the sky into the cloud's mouth ——
  for (let i = 0; i < K.promptN; i++) {
    const t0 = K.promptDrop + i * K.promptGap, u = seg(t, t0, t0 + .7);
    if (u <= 0) continue;
    const x = 900 + (i % 2 ? 1 : -1) * (40 + i * 18), y = lerp(-60, 300, Math.pow(u, 1.7)), sz = 26 + i;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 7 + i) * .25);
    T.shape(T.spline([[0, -sz * .4], [sz * .6, -sz * .1], [sz * .6, sz * .95], [sz * .2, sz * .95]], true, 4), { fill: P.white, lw: 4 });
    T.shape(T.spline([[sz * .95, -sz * .4], [sz * 1.55, -sz * .1], [sz * 1.55, sz * .95], [sz * 1.15, sz * .95]], true, 4), { fill: P.white, lw: 4 });
    ctx.restore();
  }
  // —— the two of them, on the island, looking up — Iván points, Zacarías holds the bag ——
  ivan({ x: 700, y: baseY, k: 1.0, t: tt, lean: .03, eyes: { lx: .3, ly: -.55, lid: .08 }, brows: 'up', mouth: { type: 'o' },
    armR: { x: 110, y: -330, hand: 'point', rot: -1.5 }, armL: { x: -60, y: -110, hand: 'open' }, cape: .7 });
  zacarias({ x: 1230, y: baseY, k: .97, t: tt, lean: -.05, eyes: { lx: -.35, ly: -.5, lid: .18 }, brows: 'up', mouth: { type: 'grin', open: .5 },
    armR: { x: 92, y: -160, hand: 'open' }, armL: { x: -86, y: -160, hand: 'open' }, cigar: [-40, -238, 70, Math.PI + .06], smoke: true, mirror: true });
  if (t > K.moneyIn) moneyBag(ctx, 1230, baseY - 300, .95 * back(seg(t, K.moneyIn, K.moneyIn + .4), 1.6), { face: true, eyes: { lx: -.3 }, mouth: 'grin' });
}

// the cloud answers in figures: one plaque at a time, in its belly
function ticker(ctx, t) {
  const nums = ['20 M', '80 M', '900 M'];
  let last = -1;
  K.numbers.forEach((tn, i) => { if (t >= tn) last = i; });
  if (last < 0) return;
  const tn = K.numbers[last], k = back(seg(t, tn, tn + .3), 2.6);
  ctx.save(); ctx.translate(960, 690); ctx.scale(k, k); ctx.rotate(-.02);
  // the answer condenses out of the cloud: three little bubbles, growing downwards
  for (let i = 0; i < 3; i++) {
    const r = 9 + i * 6;
    T.shape(T.ell(Math.sin(i * 1.7) * 12, -70 - i * 62, r, r * .92), { fill: P.white, lw: 4 });
  }
  T.shape(T.rr(-168, -46, 336, 92, 14), { fill: P.ink, lw: 5 });
  ctx.font = '58px Anton'; ctx.fillStyle = P.paper; ctx.textAlign = 'center'; ctx.fillText(nums[last], 0, 21);
  ctx.restore();
}

// ————————————————————————————— F · bonus —————————————————————————————
function shotBonus(ctx, t, bg) {
  cam(ctx, 0, Math.sin(t * .9) * 10, 1.03);
  ctx.drawImage(bg, -(bg.width - 1920) / 2, -(bg.height - 1080) / 2, bg.width, bg.height);
  // the curtain
  const ck = eio(seg(t, K.curtain, K.curtain + 1.0));
  // two drapes, gathered at the sides: each one slides out and bunches into folds
  for (const side of [0, 1]) {
    const inner = GX + GW / 2 - ck * (GW / 2 + 40) * (side ? -1 : 1) * (side ? -1 : 1);
    const x0 = side ? GX + GW / 2 + ck * (GW / 2 + 40) : GX;
    const x1 = side ? GX + GW : GX + GW / 2 - ck * (GW / 2 + 40);
    const w = Math.max(0, x1 - x0);
    if (w < 2) continue;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, GY, w, GH); ctx.clip();
    T.shape(T.rect(x0, GY, w, GH), { fill: '#2A2825', lw: 0, noStroke: true });
    const folds = Math.max(3, Math.round(w / 90));
    for (let i = 0; i < folds; i++) {
      const fx = x0 + (i / folds) * w;
      const fw = w / folds;
      T.shape(T.rect(fx, GY, fw * .55, GH), { fill: i % 2 ? '#121110' : '#3B3833', lw: 0, noStroke: true });
      T.shape(T.rect(fx + fw * .55, GY, fw * .45, GH), { fill: '#1B1A18', lw: 0, noStroke: true });
    }
    // valance across the top
    T.shape(T.rect(x0, GY, w, 70), { fill: '#3F3C37', lw: 0, noStroke: true });
    ctx.restore();
  }
  const tt = twos(t);
  // the envelope: a giant white envelope with a wax seal, behind them
  const ek = back(seg(t, K.env, K.env + .6), 1.12);
  if (ek > 0) {
    ctx.save(); ctx.translate(960, 372); ctx.scale(ek * 1.06, ek * 1.06); ctx.rotate(-.02);
    T.shape(T.rect(-330, -200, 660, 400), { fill: P.white, lw: 6 });
    T.line([[-330, -200], [0, 70], [330, -200]], 5, P.ink);
    T.shape(T.ell(0, 60, 78, 78), { fill: P.dark, lw: 5 });
    ctx.font = '34px Anton'; ctx.fillStyle = P.paper; ctx.textAlign = 'center'; ctx.fillText('BONUS', 0, 72);
    ctx.restore();
  }
  // the news flashes: big, on the beat, above the heads
  if (t > K.news) {
    for (let i = 0; i < 3; i++) {
      const t0 = K.news + i * .32, a = back(seg(t, t0, t0 + .18), 2.6) * (1 - seg(t, t0 + .78, t0 + .95));
      if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.translate(i % 2 ? 520 : 1400, 520 + (i % 2) * 26); ctx.scale(a * .96, a * .96); ctx.rotate(i % 2 ? -.09 : .07);
      ctx.font = '92px Anton'; ctx.fillStyle = P.paper; ctx.textAlign = 'center';
      ctx.lineWidth = 12; ctx.strokeStyle = P.ink; ctx.strokeText(['¡+900 M!', '¡SIN RIESGO!', '¡OTRA RONDA!'][i], 0, 0);
      ctx.fillText(['¡+900 M!', '¡SIN RIESGO!', '¡OTRA RONDA!'][i], 0, 0);
      ctx.restore();
    }
  }
  // the two leads, in front, taking the picture
  const flash = t > 55.4 && t < 55.55 || (t > 55.8 && t < 55.95);
  ivan({ x: 820, y: GROUND + 8, k: 1.0, t: tt, lean: -.02, eyes: { type: flash ? 'squeeze' : 'happy', lid: .1 }, mood: 1,
    brows: 'up', mouth: { type: 'beam', open: .6 }, armR: { x: 100, y: -290, hand: 'wave', rot: -1.2 }, armL: { x: -70, y: -120, hand: 'open' }, cape: .8 });
  zacarias({ x: 1080, y: GROUND + 8, k: 1.0, t: tt, lean: .03, eyes: { type: flash ? 'squeeze' : 'open', lx: -.2, lid: .2 }, brows: 'up',
    mouth: { type: 'grin', open: .6 }, armR: { x: 90, y: -180, hand: 'open' }, armL: { x: -80, y: -170, hand: 'thumb' },
    cigar: [40, -238, 70, -.06], smoke: true });
  if (flash) { T.shape(T.rect(GX - 20, GY - 20, GW + 40, GH + 40), { fill: '#FFFFFF', noStroke: true }); }
  // confetti: torn paper bits
  for (let i = 0; i < 40; i++) {
    const t0 = K.confetti + hash(i * 3.1) * 1.6, u = seg(t, t0, t0 + 3.2);
    if (u <= 0) continue;
    const x = GX + hash(i * 7.7) * GW, y = GY - 40 + u * (GH + 80) * (1 + hash(i) * .4);
    ctx.save(); ctx.translate(x + Math.sin(u * 6 + i) * 30, y); ctx.rotate(u * 6 + i);
    T.shape(T.rect(-8, -5, 16, 10), { fill: P.paper, lw: 2 });
    ctx.restore();
  }
}

// ————————————————————————————— G · end card —————————————————————————————
function shotCard2(ctx, t) {
  T.shape(T.rect(0, 0, 1920, 1080), { fill: '#F1EEE6', noStroke: true });
  decoBorder(ctx, 34, t, { x: GX, y: GY, w: GW, h: GH });
  const k = back(seg(t, K.card2In, K.card2In + .45), 1.8);
  if (k > 0) {
    titleCard(ctx, null, 960, 520, { w: 1200, h: 430, burst: t * .18 });
    fatTitle(ctx, 'FIN', 960, 500, 180, { track: 10, bw: .12 });
    ctx.save(); ctx.font = '34px "Eagle Lake"'; ctx.textAlign = 'center'; ctx.fillStyle = P.paper;
    ctx.fillText('o el principio de la siguiente ronda', 960, 610); ctx.restore();
    ctx.save(); ctx.font = '22px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(241,238,230,.75)'; ctx.fillText('PROMPT MAESTRO · 1933 / 2026', 960, 690); ctx.restore();
  }
}

// ————————————————————————————— H · pixels —————————————————————————————
function shotPixels(ctx, t) {
  T.shape(T.rect(0, 0, 1920, 1080), { fill: '#F1EEE6', noStroke: true });
  decoBorder(ctx, 34, t, { x: GX, y: GY, w: GW, h: GH });
  const tt = twos(t);
  // the two of them, tiny, waving, inside a blank card
  ctx.save(); ctx.translate(960, 700);
  ivan({ x: -110, y: 0, k: .8, t: tt, eyes: { type: 'happy' }, mouth: { type: 'beam', open: .5 }, armR: { x: 90, y: -260, hand: 'wave', rot: -1.2 } });
  zacarias({ x: 110, y: 0, k: .78, t: tt, eyes: { type: 'open', lx: -.2, lid: .2 }, mouth: { type: 'grin', open: .5 }, armR: { x: 80, y: -170, hand: 'wave', rot: -1.1 }, cigar: [40, -238, 70, -.06] });
  ctx.restore();
  // the iris: a shrinking hole in black paper, pulled shut by a gloved hand (Iván's arm)
  const close = eio(seg(t, K.iris0, K.iris1));
  const r = lerp(1000, 0, close);
  // inside the hole the picture itself breaks up into blocks
  const px = seg(t, K.pixelize, K.pixelize + 1.05);
  if (px > 0 && r > 8) {
    const cols = Math.max(6, Math.round(lerp(96, 8, Math.pow(px, .8))));
    const rows = Math.max(4, Math.round(cols * 1080 / 1920));
    const tmp = document.createElement('canvas'); tmp.width = cols; tmp.height = rows;
    const tc = tmp.getContext('2d'); tc.imageSmoothingEnabled = true;
    tc.drawImage(ctx.canvas, 0, 0, 1920, 1080, 0, 0, cols, rows);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath(); ctx.arc(960, 600, r, 0, TAU); ctx.clip();
    ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, 1920, 1080);
    ctx.restore();
  }
  if (r > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, 1080); ctx.arc(960, 600, r, 0, TAU, true);
    ctx.fillStyle = '#0A0908'; ctx.fill('evenodd'); ctx.restore();
  } else {
    ctx.save(); ctx.fillStyle = '#0A0908'; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
  }
  // the hand on the iris edge
  if (close > .04 && close < .96) {
    const hx = 960 + Math.cos(-.6) * r, hy = 600 + Math.sin(-.6) * r;
    T.line(T.quad([1730, 1010], [hx + 150, hy + 130], [hx, hy], 14), 15, P.ink);
    gloveAt(ctx, hx, hy, Math.PI * .8);
  }
  // once it has shut: a last printed card, typed onto the black
  const ek = seg(t, K.iris1 + .5, K.iris1 + 1.0);
  if (ek > 0) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = ek; ctx.textAlign = 'center';
    ctx.fillStyle = '#EFEBE0';
    ctx.font = '52px Limelight'; if ('letterSpacing' in ctx) ctx.letterSpacing = '18px';
    ctx.fillText('PROMPT MAESTRO', 960, 528);
    ctx.globalAlpha = ek * .55; ctx.font = '20px Limelight'; if ('letterSpacing' in ctx) ctx.letterSpacing = '8px';
    ctx.fillText('UNA PELÍCULA DE LA NADA · 1933 / 2026', 960, 586);
    ctx.restore();
  }
}
function gloveAt(ctx, x, y, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(.9, .9);
  const parts = [];
  const finger = (a, len) => { parts.push(T.quad([20, 0], [20 + Math.cos(a) * len * .6, Math.sin(a) * len * .6], [20 + Math.cos(a) * len, Math.sin(a) * len], 6)); };
  for (const a of [-.5, -.1, .42, -1.5]) finger(a, 34);
  parts.push(T.ell(18, 0, 19, 18, 20));
  for (const p of parts) { const q = T.noodle(p[0], p[p.length - 1], 0, 13); T.shape(q, { fill: P.white, lw: 4.5 }); }
  ctx.restore();
}

// ————————————————————————————— dispatcher —————————————————————————————
export function useScenes(bgs) {
  const B = bgs;
  return function drawScene(ctx, t) {
    const tIn = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
    const name = tIn[2];
    T.reset();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 1920, 1080);
    if (name === 'card') shotCard(ctx, t, B.hall);
    else if (name === 'hall') shotHall(ctx, t, B.hall);
    else if (name === 'corridor') shotCorridor(ctx, t, B.corridor);
    else if (name === 'boardroom') shotBoard(ctx, t, B.boardroom);
    else if (name === 'sky') { shotSky(ctx, t, B.sky); ctx.setTransform(1, 0, 0, 1, 0, 0); ticker(ctx, t); }
    else if (name === 'bonus') shotBonus(ctx, t, B.bonus);
    else if (name === 'card2') shotCard2(ctx, t);
    else if (name === 'pixels') shotPixels(ctx, t);
    ctx.restore();
    // subtitles stay outside the camera and the boil
    const cue = SUBS.find(([a, b]) => t >= a && t < b);
    if (cue) subCard(ctx, cue[2], 960, 986, { size: 37 });
  };
}
