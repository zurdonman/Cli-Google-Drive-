// main.js — entry: builds the sets, the cast and the reel; exposes the page contract.
// Contract: window.DUR, window.render(t), window.READY, window.EV, window.TEXTS(t), window.SUBS, window.SUBBOX(t)
import * as T from './toon.js';
import { makeReel, post, GATE } from './reel.js';
import { paintAll } from './stage.js';
import { buildEvents, useScenes } from './scenes.js';
import { DUR, SUBS, SHOTS, K } from './story.js';
import { subCard } from './graphics.js';

const Q = new URLSearchParams(location.search);
const NOSUB = Q.get('nosub') === '1';
const cv = document.getElementById('c');
const F = makeReel(cv);
T.init(F.scene);

const BGS = paintAll();
const drawScene = useScenes(BGS);
const cutAt = SHOTS.map(s => s[0]);

// — the contract: text boxes for readcheck —
let REC = null;
const TEXTS_AT = new Map();
function pushText(str, x0, y0, x1, y1, id) { if (REC) REC.push({ id, text: str, x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x1), y1: Math.round(y1) }); }

// subtitle box in screen space (gate is centred)
function subBox(t) {
  const cue = SUBS.find(([a, b]) => t >= a && t < b);
  if (!cue || NOSUB) return null;
  const g = F.sg;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = '37px "Eagle Lake"';
  const tw = Math.min(g.measureText(cue[2]).width, 1120);
  g.restore();
  const w = Math.min(tw + 2 * 37 * 1.05 + 37 * 1.15, 1740), h = 37 * 1.95;
  return { text: cue[2], x0: Math.round(960 - w / 2), y0: Math.round(986 - h / 2), x1: Math.round(960 + w / 2), y1: Math.round(986 + h / 2) };
}

window.DUR = DUR;
window.SUBS = SUBS.map(([t0, t1, text]) => ({ t0, t1, text }));
window.SUBBOX = t => { const b = subBox(t); return b ? { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 } : null; };
window.EV = buildEvents();

// Which text is "on screen" at t, without needing the drawing to report it:
// derived from the same clock as the drawing, so the two can never disagree.
function textsAt(t) {
  const out = [];
  // A · title card
  if (t > K.rollIn + .45 && t < K.rollOut + .35) {
    out.push({ id: 'title', text: 'PROMPT MAESTRO', x0: 960 - 560, y0: 400, x1: 960 + 560, y1: 545 });
    out.push({ id: 'tagline', text: 'una superproducción de la nada', x0: 960 - 300, y0: 560, x1: 960 + 300, y1: 620 });
  }
  // B · hall: the falling cards say one thing, read once
  if (t > K.drop1 + .55 && t < 13.9) out.push({ id: 'cards-txt', text: 'RESPUESTA NO DISPONIBLE', x0: 540, y0: 240, x1: 1330, y1: 380 });
  if (t > K.stamp && t < K.stamp + 2.6) out.push({ id: 'stamp', text: 'NO SUBVENCIÓN', x0: 830, y0: 640, x1: 1190, y1: 760 });
  // C · corridor: the plates, one word each, read once as they pass
  if (t > K.doorsPass[0] && t < K.doorsPass[5] + .6) out.push({ id: 'plates', text: 'PREMIO GRACIAS ADELANTO', x0: 200, y0: 400, x1: 1740, y1: 600 });
  // D · boardroom
  if (t > K.proof + .12 && t < 35.2) out.push({ id: 'proof', text: 'PRUEBA DE CONCEPTO', x0: 640, y0: 250, x1: 1280, y1: 345 });
  // E · sky: the numbers
  if (t > K.numbers[0] && t < K.numbers[2] + .85) out.push({ id: 'numbers', text: '20 M 80 M 900 M', x0: 790, y0: 40, x1: 1130, y1: 300 });
  // F · bonus
  if (t > K.news + .2 && t < K.news + 3.4) out.push({ id: 'news', text: '¡+900 M!', x0: 560, y0: 720, x1: 800, y1: 830 });
  // G · end card
  if (t > K.card2In + .3 && t < SHOTS[6][1]) {
    out.push({ id: 'fin', text: 'FIN', x0: 960 - 260, y0: 380, x1: 960 + 260, y1: 600 });
    out.push({ id: 'fin-sub', text: 'o el principio de la siguiente ronda', x0: 960 - 330, y0: 570, x1: 960 + 330, y1: 630 });
  }
  return out;
}
window.TEXTS = textsAt;

window.render = t => {
  t = Math.min(Math.max(0, t), DUR - 1e-4);
  const sg = F.sg;
  sg.setTransform(1, 0, 0, 1, 0, 0);
  sg.clearRect(0, 0, 1920, 1080);
  T.frame(t, 1.15);
  drawScene(sg, t);
  // gate mask: black outside the 4:3 window (the print is inside it)
  sg.setTransform(1, 0, 0, 1, 0, 0);
  const f = Math.round(t * 24), jump = cutAt.some(c => c > 0 && Math.abs(Math.round(c * 24) - f) === 0) ? 3 : 0;
  post(F, t, { jump });
};

window.READY = false;
(async () => {
  await document.fonts.ready;
  for (const f of ['132px Anton', '38px "Eagle Lake"', '38px Limelight', '27px Limelight']) await document.fonts.load(f).catch(() => {});
  // a first frame so READY only fires once the sets are painted and the fonts measured
  window.render(6.2);
  window.READY = true;
})();
