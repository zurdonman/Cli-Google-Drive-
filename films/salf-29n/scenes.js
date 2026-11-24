// scenes.js — el reparto de planos, el marco (16:9 / 9:16), los rótulos y los subtítulos quemados.
// Cada plano se dibuja en un escenario virtual de 1600×900 y se coloca en el marco con una transformación,
// así el mismo dibujo sirve para el máster horizontal y para la copia vertical.
import { C, W, H, clamp, inv, lerp, ease, easeOut, back, circle, ell, card, rr, poly, fill, capsule, txt, para,
         measure, chip, pill, numDisc, bubble, icon, char, paperBg, blueBg, ground, setFont, isPortrait } from './engine.js';
import { DUR, SHOTS, SUBS, K } from './story.js';
import { brian, eugenio, apoderado, apoderada, presidente } from './cast.js';
import { mapa, relojes, app } from './scenesA.js';
import { introCaso, puerta, presi, escalado, caso2a, caso2b, caso2c } from './scenesB.js';
import { acta, mochila, cierre } from './scenesC.js';

export const SW = 1600, SH = 900;
const portrait = () => H > W;

export function frame() {
  if (!portrait()) return { x: 160, y: 26, w: SW, h: SH, s: 1 };
  // 9:16 — la escena llena el ancho y se recorta arriba/abajo; la zona de tarjetas es papel
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
    // partir por palabras y medir: la caja se ajusta al ancho real de la línea más larga
    const maxW = 1460;
    let size = 46;
    let arr, wmax;
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
    const size = 58;
    setFont(g, size, 800, 'Baloo');
    const maxW = W - 180;
    const words = text.split(' '); const arr = []; let cur = '';
    for (const wd of words) { const tt = cur ? cur + ' ' + wd : wd; if (measure(g, tt, size, 800) > maxW && cur) { arr.push(cur); cur = wd; } else cur = tt; }
    if (cur) arr.push(cur);
    const lh = size * 1.2, h = arr.length * lh + 96, y = 884;
    card(g, 60, y, W - 120, h, 28, C.white, 6);
    card(g, 60, y + 20, 14, h - 40, 7, col, 0);
    arr.forEach((l, i) => txt(g, l, W / 2 + 8, y + 48 + lh * (i + .5), size, C.ink, 800, 'Baloo'));
    g.restore();
    return { bottom: y + h };
  }
  g.restore();
}

function head(g, t, kicker, title) {
  if (!portrait()) {
    const w1 = measure(g, kicker, 26, 800) + 56;
    card(g, 60, 26, w1, 56, 28, C.ink, 0);
    txt(g, kicker, 60 + w1 / 2, 55, 26, C.yellow, 800);
    return;
  }
  card(g, 0, 0, W, 250, 0, C.ink, 0);
  const kw = measure(g, kicker, 30, 800) + 72;
  card(g, W / 2 - kw / 2, 44, kw, 58, 29, C.orange, 0);
  txt(g, kicker, W / 2, 75, 30, C.white, 800);
  if (title) {
    const lines = title.split('\n');
    lines.forEach((l, i) => txt(g, l, W / 2, 168 + i * 56 - (lines.length - 1) * 28, 54, C.white, 800));
  }
}

function panel(g, t) {
  const top = 866;
  g.fillStyle = C.paper; g.fillRect(0, top, W, H - top);
  capsule(g, 0, top, W, top, 7, C.ink);
  // progreso y capítulos
  capsule(g, 60, 1846, W - 60, 1846, 5, 'rgba(11,44,74,.12)');
  capsule(g, 60, 1846, 60 + (W - 120) * t / DUR, 1846, 5, C.orange);
  const blocks = ['INTRO', 'MISIÓN', 'APP', 'CASO 1', 'CASO 2', 'CASO 3', 'CIERRE'];
  const spans = [[0, 11.1], [11.1, 26.8], [26.8, 44.3], [44.3, 68.9], [68.9, 86.7], [86.7, 103.8], [103.8, 120]];
  const act = spans.findIndex(([a2, b2]) => t >= a2 && t < b2);
  const bw = (W - 120) / blocks.length;
  blocks.forEach((b2, i) => {
    const x = 60 + bw * (i + .5);
    txt(g, b2, x, 1888, i === act ? 22 : 21, i === act ? C.ink : 'rgba(11,44,74,.32)', 800);
    if (i === act) capsule(g, x - 26, 1858, x + 26, 1858, 6, C.ink);
  });
}

// ——— tarjetas del 9:16: rellenan la zona de papel con lo esencial del bloque ———
const VCARDS = {
  mapa: [['24', 'colegios'], ['112', 'mesas'], ['31', 'plazas libres']],
  relojes: [['08:00', 'foto de la constitución'], ['14:00', 'reporta por WhatsApp'], ['18:00', 'reporta por WhatsApp'], ['20:00', 'acta antes de las 21:00'], ['21:00', 'todo enviado por Scrutinia']],
  app: [['1', 'activa el GPS'], ['2', 'toca tu colegio'], ['3', 'estado + nota'], ['4', 'foto'], ['5', 'log a WhatsApp']],
  introCaso: [['1', 'respira'], ['2', 'acreditación + DNI'], ['3', 'art. 79 LOREG'], ['4', 'documenta']],
  puerta: [['OK', 'acreditación'], ['OK', 'DNI'], ['OK', 'la frase, sin gritar']],
  presi: [['NO', '«no puede pasar»'], ['·', 'no discutas'], ['!', 'mesa sin constituir']],
  escalado: [['1', 'foto de la puerta'], ['2', 'incidencia morada'], ['3', 'WhatsApp a Brian']],
  caso2a: [['!', 'faltan papeletas'], ['·', 'pide por favor'], ['OK', 'foto + incidencia']],
  caso2b: [['9 m', 'propaganda cerca'], ['·', 'mide con pasos'], ['OK', 'foto + incidencia']],
  caso2c: [['OK', 'corte de luz: quédate'], ['OK', 'urna rota: documenta'], ['OK', 'compañero ausente: cubre']],
  acta: [['1', 'mira el recuento'], ['2', 'foto del acta'], ['3', 'no firmes conforme']],
  mochila: [['OK', 'acreditación'], ['OK', 'DNI + boli'], ['OK', 'móvil cargado'], ['OK', 'agua + guía']],
  cierre: [['22', 'plazas por cubrir'], ['7/24', 'colegios cubiertos']],
};

function vcards(g, t, startY) {
  if (!portrait()) return;
  const shot = SHOTS.find(s2 => t >= s2[0] && t < s2[1]) || SHOTS[SHOTS.length - 1];
  const name = shot[2];
  const items = VCARDS[name];
  if (!items) return;
  const bottom = 1800, n = items.length, gap = 18;
  const avail = bottom - startY;
  const h = clamp((avail - gap * (n - 1)) / n, 92, 156);
  const used = n * h + (n - 1) * gap;
  const from = startY;
  items.forEach(([big, small], i) => {
    const t0 = shot[0] + .2 + i * .32;
    const k = clamp((t - t0) / .45);
    const kb = back(k);
    if (k <= 0) return;
    const y = from + i * (h + gap) + Math.max(0, (avail - used)) / 2;
    g.save(); g.globalAlpha = clamp(k, 0, 1);
    const x = 70 + (1 - kb) * 34;
    card(g, x, y, W - 2 * 70, h, 20, C.white, 6);
    card(g, x, y, 14, h, 7, [C.ink, C.orange, C.green][i % 3], 0);
    const fs = big.length > 3 ? Math.min(48, h * .42) : h * .52;
    const bw = measure(g, big, fs, 400, 'Bungee');
    txt(g, big, x + 44, y + h / 2, fs, C.ink, 400, 'Bungee', 'left');
    txt(g, small, x + 44 + bw + 28, y + h / 2, h * .26, C.ink, 800, 'Baloo', 'left');
    g.restore();
  });
}

function bar16(g, t) {
  card(g, 60, 1062, 1800, 8, 4, 'rgba(11,44,74,.14)', 0);
  card(g, 60, 1062, Math.max(8, 1800 * t / DUR), 8, 4, C.orange, 0);
}

const DRAW = { mapa, relojes, app, introCaso, puerta, presi, escalado, caso2a, caso2b, caso2c, acta, mochila, cierre };
const HEADS = {
  mapa: ['29N · CASTELLÓN', 'TÚ DEFIENDES\nCASU02 + CASU03'],
  relojes: ['MISIÓN DEL DÍA', 'CUATRO COSAS\nOBLIGATORIAS'],
  app: ['LA APP · SALF RUTAS', 'DEL GPS AL LOG\nEN 20 SEGUNDOS'],
  introCaso: ['CASO 1', 'NO ME DEJAN\nENTRAR'],
  puerta: ['CASO 1', 'ACREDITACIÓN,\nDNI Y LA FRASE'],
  presi: ['CASO 1', '«NO PUEDE\nPASAR»'],
  escalado: ['CASO 1', 'FOTO, APP\nY AVISO'],
  caso2a: ['CASO 2', 'FALTAN\nPAPELETAS'],
  caso2b: ['CASO 2', 'PROPAGANDA\n< 10 METROS'],
  caso2c: ['CASO 2', 'LUZ, URNA\nY COMPAÑERO'],
  acta: ['CASO 3', 'EL ACTA\nNO CUADRA'],
  mochila: ['QUÉ LLEVAR', 'TU MOCHILA'],
  cierre: ['CIERRE', 'FALTAN 22'],
};

export function drawScene(g, t) {
  const shot = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
  const [, , name] = shot;
  // fondo a sangre
  if (name === 'introCaso' || name === 'cierre') blueBg(g);
  else paperBg(g, name.length * 7 + 3);

  const f = frame();
  // en vertical, papel a sangre: la escena se recorta sobre papel, no sobre bandas
  if (portrait()) { g.fillStyle = C.paper; g.fillRect(0, 0, W, H); }
  const hd = HEADS[name] || ['', ''];
  // la cinta va encima del plano: en 9:16 el marco nace en y=250 (banda de papel, no la tapa);
  // en 16:9 el marco nace en x=160 y=26 y taparía el rótulo → siempre por delante
  const headLate = name === 'caso2c' || !portrait();
  if (!headLate) head(g, t, hd[0], hd[1]);

  g.save();
  g.translate(f.x, f.y); g.scale(f.s, f.s);
  g.beginPath(); g.rect(0, 0, SW, SH); g.clip();
  // aislar el plano: un clip() suelto dentro de una escena recortaría todo el panel de tarjetas
  g.save();
  (DRAW[name] || (() => {}))(g, t);
  g.restore();
  g.restore();
  if (headLate) head(g, t, hd[0], hd[1]);

  if (portrait()) {
    // filete de cierre bajo la escena
    g.lineWidth = 6; g.strokeStyle = C.ink;
    g.beginPath(); g.moveTo(0, f.y + 2); g.lineTo(W, f.y + 2); g.stroke();
    g.beginPath(); g.moveTo(0, f.y + f.h - 2); g.lineTo(W, f.y + f.h - 2); g.stroke();
    panel(g, t);
    const cap = caption(g, t);
    vcards(g, t, (cap && cap.bottom ? cap.bottom : 884) + 22);
  } else {
    caption(g, t);
    bar16(g, t);
  }
}

// ¿qué dice cada instante? (para readcheck y para el .srt)
export function textsAt(t) {
  const out = [];
  const s = subAt(t);
  if (s) out.push({ text: s[2], size: 46, x: W / 2, y: portrait() ? 1800 : 1030, w: 1500 });
  return out;
}
