// scenes.js — marco 16:9 / 9:16, rótulo de bloque, subtítulos quemados y tarjetas del vertical.
import { C, W, H, clamp, inv, lerp, ease, back, circle, card, rr, capsule, txt, para, measure,
         chip, icon, paperBg, blueBg, setFont, isPortrait } from './engine.js';
import { DUR, SHOTS, SUBS, VCARDS } from './story.js';
import { DRAW } from './scenesV5.js';

export const SW = 1600, SH = 900;
const portrait = () => H > W;

export function frame() {
  if (!portrait()) return { x: 160, y: 26, w: SW, h: SH, s: 1 };
  const s = W / SW;
  return { x: 0, y: 250, w: SW * s, h: SH * s, s, crop: true };
}

// ——— subtítulos ———
const subAt = t => SUBS.find(([a, b]) => t >= a && t < b);

function caption(g, t) {
  const s2 = subAt(t);
  if (!s2) return;
  const [a2, b2, text, who] = s2;
  const k = clamp((t - a2) / .16) * clamp((b2 - t) / .2);
  const col = who === 'a' ? C.orange : who === 'p' ? C.ink2 : who === 't' ? C.red : C.ink;
  g.save();
  g.globalAlpha = clamp(k, 0, 1);
  if (!portrait()) {
    const maxW = 1460;
    let size = 46, arr, wmax;
    for (; size >= 30; size -= 2) {
      setFont(g, size, 800, 'Baloo');
      arr = []; let cur = '';
      for (const wd of text.split(' ')) {
        const tt = cur ? cur + ' ' + wd : wd;
        if (measure(g, tt, size, 800) > maxW && cur) { arr.push(cur); cur = wd; } else cur = tt;
      }
      if (cur) arr.push(cur);
      wmax = Math.max(...arr.map(l => measure(g, l, size, 800)));
      if (arr.length <= 2 && wmax <= maxW) break;
    }
    const w = Math.min(1600, wmax + 110), h = arr.length * size * 1.24 + size * .8, y = 1080 - 34 - h;
    card(g, W / 2 - w / 2, y, w, h, Math.min(46, h * .32), 'rgba(251,244,230,.97)', 5);
    card(g, W / 2 - w / 2, y, 12, h, 6, col, 0);
    arr.forEach((l, i) => txt(g, l, W / 2 + 8, y + h / 2 + (i - (arr.length - 1) / 2) * size * 1.24, size, C.ink, 800, 'Baloo'));
  } else {
    const size = 52;
    setFont(g, size, 800, 'Baloo');
    const maxW = W - 170;
    const words = text.split(' '); const arr = []; let cur = '';
    for (const wd of words) { const tt = cur ? cur + ' ' + wd : wd; if (measure(g, tt, size, 800) > maxW && cur) { arr.push(cur); cur = wd; } else cur = tt; }
    if (cur) arr.push(cur);
    const lh = size * 1.2, h = arr.length * lh + 84, y = 884;
    card(g, 50, y, W - 100, h, 26, C.white, 6);
    card(g, 50, y, 14, h, 7, col, 0);
    arr.forEach((l, i) => txt(g, l, W / 2 + 8, y + 44 + lh * (i + .5), size, C.ink, 800, 'Baloo'));
    g.restore();
    return { bottom: y };
  }
  g.restore();
}

// ——— rótulo de bloque ———
function head(g, t, kicker, title) {
  if (!portrait()) {
    const w1 = measure(g, kicker, 25, 800) + 52;
    card(g, 60, 24, w1, 54, 27, C.ink, 0);
    txt(g, kicker, 60 + w1 / 2, 52, 25, C.yellow, 800);
    return;
  }
  card(g, 0, 0, W, 236, 0, C.ink, 0);
  const kw = measure(g, kicker, 30, 800) + 72;
  card(g, W / 2 - kw / 2, 40, kw, 56, 28, C.orange, 0);
  txt(g, kicker, W / 2, 69, 30, C.white, 800);
  if (title) {
    const lines = title.split('\n');
    lines.forEach((l, i) => txt(g, l, W / 2, 152 + i * 54 - (lines.length - 1) * 27, 52, C.white, 800));
  }
}

// ——— barra inferior del vertical ———
function panel(g, t) {
  const top = 1806;
  g.fillStyle = C.paper; g.fillRect(0, top, W, H - top);
  capsule(g, 0, top, W, top, 7, C.ink);
  capsule(g, 60, 1878, W - 60, 1878, 5, 'rgba(11,44,74,.12)');
  capsule(g, 60, 1878, 60 + (W - 120) * t / DUR, 1878, 5, C.orange);
  const blocks = ['INTRO', 'CONST', 'VOTO', 'COORD', 'CASO 1', 'PAPEL', 'ACCES', 'ESCRUT', 'SOBRES', 'CIERRE'];
  const acts = SHOTS.map(s => s[0]);
  const act = Math.max(0, acts.findIndex((a, i) => t >= a && (i === acts.length - 1 || t < acts[i + 1])));
  const bw = (W - 120) / blocks.length;
  blocks.forEach((b2, i) => {
    const x = 60 + bw * (i + .5);
    txt(g, b2, x, 1912, i === act ? 18 : 17, i === act ? C.ink : 'rgba(11,44,74,.32)', 800);
  });
}

// ——— tarjetas del vertical ———
function vcards(g, t, startY) {
  if (!portrait()) return;
  const shot = SHOTS.find(s2 => t >= s2[0] && t < s2[1]) || SHOTS[SHOTS.length - 1];
  const items = VCARDS[shot[2]];
  if (!items) return;
  const bottom = 1786, n = items.length, gap = 16;
  const avail = bottom - startY;
  const h = clamp((avail - gap * (n - 1)) / n, 70, 150);
  const used = n * h + (n - 1) * gap;
  items.forEach(([big, small], i) => {
    const t0 = shot[0] + .25 + i * .3;
    const k = clamp((t - t0) / .45);
    if (k <= 0) return;
    const y = startY + i * (h + gap);   // ancladas arriba: el hueco queda al fondo, no en medio
    g.save(); g.globalAlpha = clamp(k, 0, 1);
    const x = 70 + (1 - back(k)) * 30;
    card(g, x, y, W - 2 * 70, h, 20, C.white, 6);
    card(g, x, y, 14, h, 7, [C.ink, C.orange, C.green][i % 3], 0);
    const fs = big.length > 3 ? Math.min(44, h * .40) : h * .48;
    const bw = measure(g, big, fs, 400, 'Bungee');
    txt(g, big, x + 42, y + h / 2, fs, C.ink, 400, 'Bungee', 'left');
    para(g, small, x + 42 + bw + 24 + (W - 140 - 42 - bw - 24) / 2, y + h / 2, W - 140 - 42 - bw - 24, h * .27, C.ink, 800, 'Baloo', 1.1);
    g.restore();
  });
}

function bar16(g, t) {
  card(g, 60, 1062, 1800, 8, 4, 'rgba(11,44,74,.14)', 0);
  card(g, 60, 1062, Math.max(8, 1800 * t / DUR), 8, 4, C.orange, 0);
}

const HEADS = {
  intro: ['29N · CASTELLÓN', 'TÚ DEFIENDES\nCASU02 + CASU03'],
  constitucion: ['CONSTITUCIÓN · 08:00', 'LA MESA SE\nCONSTITUYE'],
  votacion: ['VOTACIÓN · 09:00', 'DNI, SOBRE\nY UNA EQUIS'],
  coordina: ['COORDINACIÓN', 'WHATSAPP PRINCIPAL\nAPP OPCIONAL'],
  caso1: ['CASO 1', 'NO ME DEJAN\nENTRAR'],
  papeletas: ['IMPREVISTOS', 'PAPELETAS\nY 10 METROS'],
  accesibilidad: ['ACCESIBILIDAD', 'PREGUNTA\nANTES'],
  escrutinio: ['ESCRUTINIO · 20:00', 'EL ACTA\nANTES DE LAS 21:00'],
  sobres: ['SOBRES', 'TRES SOBRES\nCON RECIBO'],
  cierre: ['CIERRE', 'LOS DIEZ\nPASOS'],
};

// marco del cuadro: filete azul para que la escena no flote sobre el papel
function strokeFrame(g) {
  const f = frame();
  g.save();
  g.lineWidth = 6; g.strokeStyle = C.ink;
  g.strokeRect(f.x - 3, f.y - 3, f.w + 6, f.h + 6);
  g.restore();
}

export function drawScene(g, t) {
  const shot = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
  const name = shot[2];
  if (name === 'cierre') blueBg(g); else paperBg(g, name.length * 7 + 3);
  strokeFrame(g);

  const f = frame();
  if (portrait()) { g.fillStyle = C.paper; g.fillRect(0, 0, W, H); }
  const hd = HEADS[name] || ['', ''];
  const headLate = !portrait();

  g.save();
  g.translate(f.x, f.y); g.scale(f.s, f.s);
  g.beginPath(); g.rect(0, 0, SW, SH); g.clip();
  g.save();
  (DRAW[name] || (() => {}))(g, t);
  g.restore();
  g.restore();
  if (headLate) head(g, t, hd[0], hd[1]);

  if (portrait()) {
    g.lineWidth = 6; g.strokeStyle = C.ink;
    g.beginPath(); g.moveTo(0, f.y + 2); g.lineTo(W, f.y + 2); g.stroke();
    g.beginPath(); g.moveTo(0, f.y + f.h - 2); g.lineTo(W, f.y + f.h - 2); g.stroke();
    panel(g, t);
    const cap = caption(g, t);
    vcards(g, t, (cap && cap.bottom ? cap.bottom : 884) + 18);
  } else {
    head(g, t, hd[0], hd[1]);
    caption(g, t);
    bar16(g, t);
  }
}

// textos para readcheck y .srt
export function textsAt(t) {
  const out = [];
  const s = SUBS.find(([a, b]) => t >= a && t < b);
  if (s) out.push({ text: s[2], size: 46, x: W / 2, y: isPortrait() ? 1780 : 1030, w: 1500 });
  return out;
}
