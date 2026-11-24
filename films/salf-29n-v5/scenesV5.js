// scenesV5.js — los diez bloques del SALF 29N V5 (330 s).
// Todo vectorial sobre el escenario de 1600×900; el marco y los subtítulos los pone scenes.js.
import { C, clamp, inv, lerp, ease, easeOut, back, circle, ell, card, rr, poly, fill, capsule,
         txt, para, measure, pill, numDisc, bubble, icon, ground, seeded, setFont, char } from './engine.js';
import { K, VCARDS } from './story.js';
import { brian, eugenio, apoderado, apoderada, presidente } from './cast.js';

const SW = 1600, SH = 900;

// ficha centrada (el chip del motor ancla a la izquierda)
function chipc(g, s, cx, y, size, bg = C.ink, fg = C.white, alpha = 1) {
  if (alpha <= 0) return 0;
  g.save(); g.globalAlpha = clamp(alpha);
  const w = measure(g, s, size, 800, 'Baloo') + size * 1.3, h = size * 2;
  card(g, cx - w / 2, y - h / 2, w, h, h * .45, bg, 5, C.ink);
  txt(g, s, cx, y + 1, size, fg, 800);
  g.restore();
  return w;
}

// parte un texto en líneas que caben en maxW (para no salirse de las tarjetas)
function wrapTxt(g, s, maxW, size, weight = 800) {
  setFont(g, size, weight, 'Baloo');
  const words = s.split(' '), out = []; let cur = '';
  for (const w of words) {
    const tt = cur ? cur + ' ' + w : w;
    if (measure(g, tt, size, weight) > maxW && cur) { out.push(cur); cur = w; } else cur = tt;
  }
  if (cur) out.push(cur);
  return out;
}

// vocal de mesa
function vocal(g, { x, y, s, t, look = 0, seed = 1, tie = C.ink2 }) {
  return char(g, {
    x, y, s, t, armL: [.25, .15], armR: [.25, .15], mouth: 'flat', look,
    skin: seed % 3, hair: C.hairGrey, hairStyle: 'grey', shirt: C.white, tie,
    trousers: '#3A3F4A', shoes: C.ink, longSleeve: true, seed,
  });
}

// sello de precinto sobre una urna
function precinto(g, x, y, w) {
  card(g, x - w / 2, y - 13, w, 26, 4, C.yellow, 3, C.ink);
  txt(g, 'JEC · PRECINTADO', x, y + 1, 14, C.ink, 400, 'Bungee');
}

// ————————————————————————— 1 · INTRO · 24 PINES —————————————————————————
const MESAS = [5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 6, 7, 6, 6, 5, 5, 4, 4, 4, 4, 4, 4, 9];
const MAP_PINS = (() => {
  const L = [[120, 150], [300, 128], [470, 158], [632, 136], [132, 330], [312, 308], [482, 338], [642, 316],
             [142, 528], [322, 506], [492, 536], [652, 514]];
  const R = [[908, 150], [1088, 128], [1258, 158], [1420, 136], [918, 330], [1098, 308], [1268, 338], [1430, 316],
             [928, 528], [1108, 506], [1278, 536], [1438, 514]];
  return [...L.map(([x, y]) => [x, y, 0]), ...R.map(([x, y]) => [x, y, 1])];
})();

function mapBase(g) {
  card(g, 20, 20, 1560, 860, 26, '#EDF1E4', 7);
  g.save(); rr(g, 20, 20, 1560, 860, 26); g.clip();
  const r = seeded(7);
  for (let i = 0; i < 26; i++) {
    const x = 40 + r() * 1480, y = 60 + r() * 760, w = 60 + r() * 150, h = 40 + r() * 90;
    card(g, x, y, w, h, 10, '#E2E7D5', 3, 'rgba(11,44,74,.10)');
  }
  // río
  g.save(); g.beginPath(); g.moveTo(0, 440);
  [[200, 462], [420, 430], [640, 470], [860, 436], [1080, 474], [1300, 438], [1600, 470]].forEach(([x, y]) => g.lineTo(x, y));
  g.lineWidth = 44; g.strokeStyle = '#AFD3E8'; g.lineCap = 'round'; g.stroke();
  g.restore();
  // etiquetas de zona
  chipc(g, 'CASU02 · 12 COLEGIOS', 210, 812, 22, C.ink, C.white);
  chipc(g, 'CASU03 · 12 COLEGIOS', 1410, 812, 22, C.orange, C.white);
  g.restore();
  // sello
  card(g, 1180, 742, 350, 120, 18, C.ink, 5);
  txt(g, 'CASTELLÓN', 1355, 784, 26, C.yellow, 800);
  txt(g, '29 · NOVIEMBRE', 1355, 826, 26, C.white, 400, 'Bungee');
}

function pinNum(g, x, y, s, col, n) {
  const cy = y - s * .62, r = s * .46;
  g.beginPath();
  g.arc(x, cy, r, Math.PI * .82, Math.PI * 2.18);
  g.lineTo(x, y + s * .22);
  g.closePath();
  fill(g, col); g.lineWidth = Math.max(3, s * .08); g.strokeStyle = C.ink; g.stroke();
  circle(g, x, cy, r * .62); fill(g, C.white);
  txt(g, String(n), x, cy + 2, r * .95, col, 400, 'Bungee');
}

export function intro(g, t) {
  mapBase(g);
  // pines cayendo
  MAP_PINS.forEach(([x, y, casu], i) => {
    const t0 = K.pins0 + i * K.pinStep;
    const k = inv(t, t0, t0 + .34);
    if (k <= 0) return;
    const sc = back(k), dy = -80 * (1 - sc);
    g.save();
    g.globalAlpha = clamp(k * 2);
    g.translate(x, y + dy); g.scale(sc, sc);
    ell(g, 0, 4, 20, 6); fill(g, 'rgba(11,44,74,.18)');
    pinNum(g, 0, 0, 88, casu ? C.orange : C.ink, MESAS[i]);
    g.restore();
  });
  // contador
  const n = MAP_PINS.filter((_, i) => t >= K.pins0 + i * K.pinStep).length;
  const cnt = 1 - inv(t, K.personsIn - .2, K.personsIn + .2);
  if (cnt > 0) {
    g.save(); g.globalAlpha = cnt;
    card(g, 52, 44, 300, 92, 16, 'rgba(251,244,230,.97)', 5);
    txt(g, String(n).padStart(2, '0') + ' / 24', 202, 76, 30, C.orange, 400, 'Bungee');
    txt(g, 'colegios en el mapa', 202, 110, 20, C.ink, 700);
    g.restore();
  }
  // zoom y presentación
  const zk = ease(inv(t, K.mapZoom, K.mapZoom + 1.2));
  if (zk > 0 && t >= K.personsIn - .6) {
    const bk = ease(inv(t, K.personsIn - .6, K.personsIn + .3));
    card(g, 20, 20, 1560, 860, 26, `rgba(251,244,230,${bk})`, 0);
    g.save(); g.globalAlpha = bk;
    card(g, 360, 120, 880, 640, 30, 'rgba(251,244,230,.98)', 7);
    txt(g, 'BRIAN · subinspector', 640, 186, 28, C.orange, 800);
    txt(g, 'EUGENIO · inspector', 960, 186, 28, C.ink2, 800);
    capsule(g, 800, 220, 800, 520, 3, 'rgba(11,44,74,.15)');
    brian(g, { x: 620, y: 720, s: 300, t, armL: [.5 - .3 * Math.sin(t * 3), .9], armR: [.2, .1], mouth: 'smile', phone: 1 });
    eugenio(g, { x: 980, y: 720, s: 300, t, armL: [.2, .1], armR: [1.1 + .18 * Math.sin(t * 3), .5], mouth: 'smile', folder: 1 });
    chipc(g, '24 COLEGIOS · 112 MESAS · 31 PLAZAS', 800, 300, 22, C.ink, C.yellow);
    g.restore();
  }
}

// ———————————————————— 2 · CONSTITUCIÓN 08:00 ————————————————————
const CHECK2 = [
  ['OK', '2 urnas precintadas · Congreso y Senado'],
  ['OK', 'papeletas de todas las candidaturas'],
  ['OK', 'cabina y papeletas a la vista'],
  ['!', 'letra C = voto por correo: no vota aquí'],
  ['OK', 'callejero colgado y acta de constitución'],
  ['OK', 'pide tu copia del acta'],
];

export function constitucion(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 700, '#E9DCC4');
  // mesa y mesa electoral
  const mk = ease(inv(t, K.mesaIn, K.mesaIn + .6));
  g.save(); g.globalAlpha = mk;
  vocal(g, { x: 430, y: 700, s: 250, t, look: 0, seed: 2, tie: C.ink2 });
  vocal(g, { x: 560, y: 700, s: 250, t, look: 1, seed: 3, tie: C.red });
  presidente(g, { x: 320, y: 700, s: 260, t, arms: [.2, .1], mouth: 'flat', look: 1 });
  card(g, 240, 640, 760, 34, 8, '#C89B63', 6);
  capsule(g, 280, 674, 280, 780, 10, C.ink2); capsule(g, 960, 674, 960, 780, 10, C.ink2);
  g.restore();
  // urnas
  const uk = ease(back(inv(t, K.urnasIn, K.urnasIn + .7)));
  if (uk > 0) {
    g.save(); g.globalAlpha = clamp(uk);
    icon.urn(g, 700, 540, 220, C.white, 0);
    precinto(g, 700, 480, 170);
    icon.urn(g, 890, 540, 220, '#E7D9BE', 0);
    precinto(g, 890, 480, 170);
    txt(g, 'CONGRESO', 700, 618, 19, C.ink, 400, 'Bungee');
    txt(g, 'SENADO', 890, 618, 19, C.ink, 400, 'Bungee');
    g.restore();
  }
  // lista de comprobación
  card(g, 1080, 60, 480, 640, 24, 'rgba(255,255,255,.96)', 6);
  txt(g, 'CHECK 08:00', 1320, 108, 26, C.ink, 400, 'Bungee');
  capsule(g, 1110, 136, 1530, 136, 3, 'rgba(11,44,74,.2)');
  CHECK2.forEach(([ty, s], i) => {
    const k = ease(back(inv(t, K.check0 + i * K.checkStep, K.check0 + i * K.checkStep + .45)));
    if (k <= 0) return;
    const y = 196 + i * 82;
    g.save(); g.globalAlpha = clamp(k);
    g.translate(1110, y + 40); g.scale(k, k); g.translate(-1110, -(y + 40));
    if (ty === 'OK') icon.check(g, 1132, y + 22, 40);
    else icon.cross(g, 1132, y + 22, 40);
    const tw = 1530 - 1170 - 10;
    const lines = wrapTxt(g, s, tw, 18, 800);
    lines.forEach((l, li) => txt(g, l, 1170, y + 22 + (li - (lines.length - 1) / 2) * 21, 18, C.ink, 800, 'Baloo', 'left'));
    g.restore();
  });
  // apoderado pide copia
  apoderado(g, { x: 120, y: 840, s: 250, t, armL: [.3, .2], armR: [1.2, .55], mouth: 'smile', look: 1 });
  const ck = ease(back(inv(t, K.actaIn, K.actaIn + .6)));
  if (ck > 0) {
    g.save(); g.globalAlpha = clamp(ck);
    g.translate(340, 640); g.rotate(-.08);
    card(g, -110, -70, 220, 140, 6, C.white, 4);
    txt(g, 'ACTA', 0, -40, 20, C.ink, 400, 'Bungee');
    for (let i = 0; i < 3; i++) card(g, -88, -14 + i * 26, 176, 10, 3, 'rgba(11,44,74,.22)', 0);
    txt(g, 'COPIA', 0, 52, 18, C.green2, 400, 'Bungee');
    g.restore();
  }
}

// ———————————————————— 3 · VOTACIÓN 09:00–20:00 ————————————————————
function tarjetaVoto(g, x, y, w, h, modo, t) {
  card(g, x, y, w, h, 18, C.white, 5);
  if (modo === 'dni') {
    icon.dni(g, x + 110, y + h / 2 - 10, 150);
    icon.check(g, x + 110, y + h - 54, 46);
    txt(g, 'DNI ORIGINAL', x + 110, y + 34, 18, C.ink, 400, 'Bungee');
    txt(g, 'caducado vale', x + 110, y + 62, 18, C.green2, 800);
    para(g, 'Solo original.\nNunca fotocopia.', x + 300, y + h / 2, 180, 19, C.ink, 800, 'Baloo', 1.16);
  } else if (modo === 'foto') {
    icon.dni(g, x + 110, y + h / 2 - 10, 150);
    icon.cross(g, x + 110, y + h - 54, 46);
    txt(g, 'FOTOCOPIA', x + 110, y + 34, 18, C.ink, 400, 'Bungee');
    txt(g, 'no vale', x + 110, y + 62, 18, C.red, 800);
    para(g, 'Ni foto en\nel móvil.', x + 300, y + h / 2, 180, 19, C.ink, 800, 'Baloo', 1.16);
  } else if (modo === 'midni') {
    card(g, x + 30, y + 46, 150, 150, 8, C.ink, 4);
    const r = seeded(5);
    for (let i = 0; i < 49; i++) {
      const cx = x + 38 + (i % 7) * 20, cy = y + 54 + Math.floor(i / 7) * 20;
      if (r() > .45) card(g, cx, cy, 16, 16, 2, C.ink, 0);
    }
    card(g, x + 30, y + 46, 44, 44, 4, C.white, 3);
    txt(g, 'MiDNI', x + 240, y + 46, 22, C.ink, 400, 'Bungee');
    txt(g, 'QR en el móvil', x + 240, y + 78, 18, C.green2, 800);
    para(g, 'Se abre delante\nde la mesa.', x + 240, y + 150, 190, 19, C.ink, 800, 'Baloo', 1.16);
  } else {
    icon.ballot(g, x + 110, y + h / 2 - 14, 150, C.orange);
    capsule(g, x + 74, y + h / 2 - 20, x + 96, y + h / 2 + 2, 9, C.ink);
    capsule(g, x + 96, y + h / 2 - 20, x + 74, y + h / 2 + 2, 9, C.ink);
    txt(g, 'UNA SOLA EQUIS', x + 110, y + 34, 17, C.ink, 400, 'Bungee');
    para(g, 'Si solo hay una\nelección.', x + 300, y + h / 2, 180, 19, C.ink, 800, 'Baloo', 1.16);
  }
}

export function votacion(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 720, '#E9DCC4');
  // mesa
  card(g, 90, 640, 520, 32, 8, '#C89B63', 6);
  capsule(g, 130, 672, 130, 790, 10, C.ink2); capsule(g, 570, 672, 570, 790, 10, C.ink2);
  icon.urn(g, 400, 560, 210, C.white, 0);
  precinto(g, 400, 504, 164);
  // papeletas apiladas junto a la urna
  for (let i = 0; i < 6; i++) icon.ballot(g, 560 + i * 8, 620 - i * 10, 96, i % 2 ? C.orange2 : C.orange);
  presidente(g, { x: 200, y: 800, s: 300, t, arms: [.6, .5], mouth: 'flat', look: 1, armL: [.9, .5] });
  chipc(g, '«EMPEZADA LA VOTACIÓN» · 09:00', 800, 96, 26, C.ink, C.yellow, inv(t, K.cabinaIn, K.cabinaIn + .4));
  chipc(g, 'MÍNIMO 2 PERSONAS EN LA MESA', 800, 156, 20, C.white, C.ink, inv(t, K.cabinaIn + .8, K.cabinaIn + 1.2));
  // votante y sobre
  const sk = ease(back(inv(t, K.sobreIn, K.sobreIn + .5)));
  if (sk > 0) {
    g.save(); g.globalAlpha = clamp(sk);
    const p = inv(t, K.sobreIn, K.sobreIn + 2.2);
    const ex = lerp(620, 400, p), ey = lerp(560, 430, p);
    g.translate(ex, ey); g.rotate(-.1 * (1 - p));
    card(g, -60, -40, 120, 80, 4, C.cream, 4);
    txt(g, 'SALF', 0, 0, 18, C.orange, 400, 'Bungee');
    g.restore();
  }
  apoderado(g, { x: 700, y: 860, s: 300, t, armL: [.3, .2], armR: [1.3, .5], mouth: 'smile', look: -1 });
  // tarjetas
  const TK = [
    [K.tarjetas0, 720, 100, 'dni'], [K.tarjetas0 + K.tarjetaStep, 1170, 100, 'foto'],
    [K.tarjetas0 + 2 * K.tarjetaStep, 720, 400, 'midni'], [K.tarjetas0 + 3 * K.tarjetaStep, 1170, 400, 'x'],
  ];
  for (const [t0, x, y, modo] of TK) {
    const k = ease(back(inv(t, t0, t0 + .45)));
    if (k <= 0) continue;
    g.save(); g.globalAlpha = clamp(k);
    g.translate(x + 215, y + 160); g.scale(k, k); g.translate(-(x + 215), -(y + 160));
    tarjetaVoto(g, x, y, 430, 320, modo, t);
    g.restore();
  }
}

// ———————————————————— 4 · COORDINACIÓN ————————————————————
function movilMarco(g, x, y, w, h) {
  card(g, x - 12, y - 12, w + 24, h + 24, 34, C.ink, 5);
  card(g, x, y, w, h, 24, '#F2F4F7', 0);
}

export function coordina(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  // izquierda: WhatsApp
  const wk = ease(back(inv(t, K.waIn, K.waIn + .5)));
  if (wk > 0) {
    g.save(); g.globalAlpha = clamp(wk);
    chipc(g, 'WHATSAPP · PRINCIPAL', 330, 74, 24, C.green, C.white);
    movilMarco(g, 90, 110, 480, 720);
    card(g, 90, 110, 480, 92, 24, C.green, 0);
    txt(g, 'CASU02 + CASU03', 330, 146, 24, C.white, 400, 'Bungee');
    txt(g, 'Brian · Eugenio · apoderados', 330, 178, 18, 'rgba(255,255,255,.85)', 800);
    const MSG = [
      ['08:30', 'CASU02 CERVANTES — constituida, sin incidencias'],
      ['14:00', 'Avance: 7/12 cubiertos, 2 leves'],
      ['18:00', 'Avance: 9/12 cubiertos'],
      ['20:45', 'Acta enviada por Scrutinia ✓'],
      ['21:00', 'Fin de jornada. Gracias, equipo.'],
    ];
    MSG.forEach(([hh, s], i) => {
      const k = ease(back(inv(t, K.waMsg0 + i * K.waMsgStep, K.waMsg0 + i * K.waMsgStep + .4)));
      if (k <= 0) return;
      const y = 236 + i * 112;
      g.save(); g.globalAlpha = clamp(k);
      g.translate(330, y + 46); g.scale(k, k); g.translate(-330, -(y + 46));
      card(g, 118, y, 424, 92, 16, C.white, 3);
      txt(g, hh, 138, y + 26, 18, C.green, 400, 'Bungee', 'left');
      para(g, s, 330, y + 60, 372, 18, C.ink, 700, 'Baloo', 1.05);
      g.restore();
    });
    g.restore();
  }
  // derecha: app opcional
  const ak = ease(back(inv(t, K.appIn, K.appIn + .5)));
  if (ak > 0) {
    g.save(); g.globalAlpha = clamp(ak);
    chipc(g, 'APP SALF RUTAS · OPCIONAL', 1270, 74, 24, C.purple, C.white);
    movilMarco(g, 1030, 110, 480, 720);
    card(g, 1030, 110, 480, 92, 24, C.ink, 0);
    txt(g, 'SALF Rutas v4', 1270, 146, 24, C.white, 400, 'Bungee');
    txt(g, 'si la tienes instalada', 1270, 178, 18, 'rgba(255,255,255,.8)', 800);
    const PAS = ['Activa el GPS', 'Toca tu colegio', 'Marca cubierto / libre', 'Nota + foto', 'Imprimir log y compartir'];
    PAS.forEach((s, i) => {
      const k = ease(back(inv(t, K.appSteps0 + i * K.appStep, K.appSteps0 + i * K.appStep + .4)));
      if (k <= 0) return;
      const y = 236 + i * 108;
      g.save(); g.globalAlpha = clamp(k);
      g.translate(1270, y + 44); g.scale(k, k); g.translate(-1270, -(y + 44));
      card(g, 1066, y, 408, 88, 16, C.white, 3);
      numDisc(g, i + 1, 1112, y + 44, 27, C.orange);
      para(g, s, 1214, y + 44, 330, 19, C.ink, 800, 'Baloo', 1.05);
      g.restore();
    });
    chipc(g, 'SIN APP TAMBIÉN VALE', 1270, 802, 20, C.yellow, C.ink);
    g.restore();
  }
}

// ———————————————————— 5 · CASO 1 ————————————————————
export function caso1(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 700, '#E9DCC4');
  // puerta del colegio
  card(g, 520, 180, 300, 520, 10, '#E7D9BE', 6);
  card(g, 570, 240, 200, 460, 8, '#8B5A2B', 6);
  card(g, 620, 90, 300, 70, 10, C.white, 5);
  txt(g, 'MESA · AULA 3', 770, 126, 22, C.ink, 400, 'Bungee');
  // presidente bloqueando
  presidente(g, { x: 880, y: 800, s: 320, t, arms: [1.35, 1.9], mouth: 'flat', look: -1, browTilt: 1 });
  // apoderado
  apoderado(g, { x: 250, y: 860, s: 320, t, armL: [.3, .2], armR: [.9, .5], mouth: 'flat', look: 1 });
  // bocadillo del presidente
  const bk = ease(back(inv(t, K.bloqueo, K.bloqueo + .5)));
  if (bk > 0) {
    g.save(); g.globalAlpha = clamp(bk);
    bubble(g, 'NO PUEDE PASAR', 840, 250, 420, 30, C.white, C.ink, 60, 80, 'PRESIDENTE', C.red);
    g.restore();
  }
  // frase legal
  const fk = ease(back(inv(t, K.frase, K.frase + .5)));
  if (fk > 0) {
    g.save(); g.globalAlpha = clamp(fk);
    g.translate(250, 300); g.scale(fk, fk); g.translate(-250, -300);
    bubble(g, '«Soy apoderada SALF, artículo 79 LOREG, tengo derecho a estar sin interferir»', 40, 96, 470, 22, C.cream, C.ink, 210, 40, 'TÚ', C.orange);
    g.restore();
  }
  // pasos 1-4
  const PASOS = [['1', 'Respira y sonríe', 'nada de gritos'], ['2', 'Credencial + DNI', 'los dos, siempre'],
                 ['3', 'Di la frase', 'art. 79 LOREG'], ['4', 'Si insiste: no discutas', 'foto + incidencia + WhatsApp']];
  PASOS.forEach(([n, a, b], i) => {
    const k = ease(back(inv(t, K.pasos0 + i * K.pasoStep, K.pasos0 + i * K.pasoStep + .45)));
    if (k <= 0) return;
    const y = 84 + i * 116;
    g.save(); g.globalAlpha = clamp(k);
    g.translate(1400, y + 50); g.scale(k, k); g.translate(-1400, -(y + 50));
    card(g, 1060, y, 500, 100, 18, C.white, 5);
    numDisc(g, n, 1108, y + 50, 30, i === 3 ? C.purple : C.orange);
    txt(g, a, 1150, y + 36, 23, C.ink, 800, 'Baloo', 'left');
    txt(g, b, 1150, y + 66, 19, 'rgba(11,44,74,.65)', 700, 'Baloo', 'left');
    g.restore();
  });
  // escalado
  const ek = inv(t, K.escala, K.escala + .3);
  if (ek > 0) {
    g.save(); g.globalAlpha = ek;
    const ys = 800;
    card(g, 60, ys - 56, 980, 112, 22, 'rgba(251,244,230,.97)', 5);
    const pas = [['BRIAN', C.orange, 190], ['EUGENIO', C.ink2, 470], ['JURÍDICA', C.green, 790]];
    pas.forEach(([s, col, x]) => { card(g, x - 110, ys - 30, 220, 60, 30, col, 0); txt(g, s, x, ys, 22, C.white, 400, 'Bungee'); });
    const ar = (x0, x1, kk) => {
      if (kk <= 0) return;
      capsule(g, x0, ys, lerp(x0, x1, kk), ys, 5, C.ink);
      const xe = lerp(x0, x1, kk);
      poly(g, [[xe, ys], [xe - 14, ys - 11], [xe - 14, ys + 11]]); fill(g, C.ink);
    };
    ar(310, 350, ease(inv(t, K.escala + .2, K.escala + .5)));
    ar(590, 670, ease(inv(t, K.escala + .5, K.escala + .8)));
    g.restore();
  }
  // pin sí / uniforme no
  const pk = inv(t, K.pin, K.pin + .3);
  if (pk > 0) {
    g.save(); g.globalAlpha = pk;
    card(g, 1080, 620, 300, 120, 18, C.white, 5);
    circle(g, 1120, 660, 26); fill(g, C.ink); txt(g, 'S', 1120, 662, 20, C.yellow, 400, 'Bungee');
    txt(g, 'PIN DISCRETO', 1130, 664, 20, C.green, 800, 'Baloo', 'left');
    txt(g, 'SÍ, emblema pequeño', 1130, 696, 18, C.ink, 700, 'Baloo', 'left');
    card(g, 1080, 756, 300, 120, 18, C.white, 5);
    icon.cross(g, 1120, 796, 44);
    txt(g, 'UNIFORME', 1130, 800, 20, C.red, 800, 'Baloo', 'left');
    txt(g, 'NO, nunca colectivo', 1130, 832, 18, C.ink, 700, 'Baloo', 'left');
    g.restore();
  }
}

// ———————————————————— 6 · PAPELETAS ————————————————————
export function papeletas(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 720, '#E9DCC4');
  // urna vacía
  const uk = ease(back(inv(t, K.urnaIn, K.urnaIn + .5)));
  if (uk > 0) {
    g.save(); g.globalAlpha = clamp(uk);
    card(g, 60, 520, 520, 40, 8, '#C89B63', 6);
    icon.urn(g, 320, 412, 280, C.white, inv(t, K.hueco, K.hueco + .5));
    const hk = inv(t, K.hueco, K.hueco + .5);
    if (hk > 0) {
      g.save(); g.globalAlpha = hk;
      txt(g, 'SIN PAPELETAS SALF', 320, 606, 22, C.red, 400, 'Bungee');
      g.restore();
    }
    g.restore();
  }
  // tarjetas
  const CARD6 = [
    [K.urnaIn, 640, 60, 'FALTAN PAPELETAS', 'Pide que las repongan.\nAmable y por delante.', C.orange],
    [K.reloj10, 1120, 60, 'MÁXIMO 1 HORA', 'Interrupción de la votación.\nSi no hay mesa a las 10:00,\nrepite en dos días.', C.yellow],
    [K.propa, 640, 400, 'PROPAGANDA < 10 m', 'Mide con pasos,\nfoto e incidencia.', C.red],
    [K.propa + 3, 1120, 400, 'ACTA Y PAPELETAS', 'No firmes nada\nsin haberlo leído.', C.green],
  ];
  for (const [t0, x, y, ti, body, col] of CARD6) {
    const k = ease(back(inv(t, t0, t0 + .45)));
    if (k <= 0) continue;
    g.save(); g.globalAlpha = clamp(k);
    g.translate(x + 210, y + 150); g.scale(k, k); g.translate(-(x + 210), -(y + 150));
    card(g, x, y, 420, 300, 20, C.white, 5);
    card(g, x, y, 420, 16, 8, col, 0);
    txt(g, ti, x + 210, y + 62, 22, col === C.yellow ? C.ink : col, 400, 'Bungee');
    para(g, body, x + 210, y + 160, 350, 20, C.ink, 800, 'Baloo', 1.15);
    g.restore();
  }
  // apoderado señalando
  apoderado(g, { x: 130, y: 900, s: 280, t, armL: [.3, .2], armR: [1.6, .4], mouth: 'flat', look: 1 });
}

// ———————————————————— 7 · ACCESIBILIDAD ————————————————————
function sillita(g, x, y, s) {
  circle(g, x, y - s * .22, s * .22); g.lineWidth = s * .05; g.strokeStyle = C.ink; g.stroke();
  capsule(g, x, y - s * .22, x + s * .04, y - s * .5, s * .05, C.ink);
  card(g, x - s * .12, y - s * .62, s * .3, s * .05, 3, C.ink2, 0);
  circle(g, x - s * .02, y - s * .78, s * .1); fill(g, C.skin2); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
  capsule(g, x - s * .02, y - s * .7, x + s * .1, y - s * .5, s * .09, C.orange2);
}

function perroGuia(g, x, y, s) {
  card(g, x - s * .1, y - s * .42, s * .34, s * .16, s * .07, C.ink2, 4);
  circle(g, x + s * .26, y - s * .5, s * .12); fill(g, C.ink2); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
  poly(g, [[x + s * .18, y - s * .58], [x + s * .22, y - s * .72], [x + s * .3, y - s * .58]]); fill(g, C.ink2);
  for (let i = 0; i < 4; i++) capsule(g, x - s * .06 + i * s * .1, y - s * .28, x - s * .06 + i * s * .1, y, s * .035, C.ink2);
  capsule(g, x - s * .1, y - s * .44, x - s * .2, y - s * .56, s * .03, C.ink2);
}

function brailleCard(g, x, y, s) {
  card(g, x - s * .5, y - s * .34, s, s * .68, 8, C.white, 5);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    circle(g, x - s * .36 + i * s * .09, y - s * .16 + j * s * .2, s * .035); fill(g, C.ink);
  }
  for (let i = 0; i < 3; i++) card(g, x - s * .1, y - s * .2 + i * s * .13, s * .5, s * .04, 2, 'rgba(11,44,74,.18)', 0);
}

export function accesibilidad(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 700, '#E9DCC4');
  const CARDS = [
    [K.acc0, 60, 90, 'SILLA DE RUEDAS', 'No la toques\nsin permiso.'],
    [K.acc0 + 2.2, 440, 90, 'PERRO GUÍA', 'Entra contigo.\nNo lo distraigas.'],
    [K.acc0 + 2.2, 820, 90, 'BRAILLE', 'Papeletas en braille\nsi están listadas.'],
    [K.acc0 + 3.3, 1200, 90, 'LENGUA DE SIGNOS', 'Habla de frente,\ndespacio.'],
  ];
  for (const [t0, x, y, ti, body] of CARDS) {
    const k = ease(back(inv(t, t0, t0 + .45)));
    if (k <= 0) continue;
    g.save(); g.globalAlpha = clamp(k);
    g.translate(x + 165, y + 170); g.scale(k, k); g.translate(-(x + 165), -(y + 170));
    card(g, x, y, 340, 330, 22, C.white, 5);
    txt(g, ti, x + 170, y + 42, 19, C.ink, 400, 'Bungee');
    if (ti === 'SILLA DE RUEDAS') sillita(g, x + 170, y + 190, 190);
    if (ti === 'PERRO GUÍA') perroGuia(g, x + 120, y + 250, 230);
    if (ti === 'BRAILLE') brailleCard(g, x + 170, y + 180, 190);
    if (ti === 'LENGUA DE SIGNOS') {
      apoderada(g, { x: x + 170, y: y + 268, s: 190, t, armL: [1.9, .4], armR: [1.2, .4], mouth: 'smile', look: 0 });
    }
    para(g, body, x + 170, y + 292, 300, 18, C.ink, 800, 'Baloo', 1.05);
    g.restore();
  }
  chipc(g, 'PREGUNTA ANTES DE AYUDAR', 800, 500, 26, C.ink, C.yellow, inv(t, K.acc0 + .5, K.acc0 + .9));
  chipc(g, 'NINGUNA DISCAPACIDAD IMPIDE VOTAR', 800, 566, 22, C.green, C.white, inv(t, K.acc0 + 1.2, K.acc0 + 1.6));
}

// ———————————————————— 8 · ESCRUTINIO ————————————————————
export function escrutinio(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 720, '#E9DCC4');
  card(g, 80, 560, 1440, 34, 8, '#C89B63', 6);
  capsule(g, 130, 594, 130, 720, 10, C.ink2); capsule(g, 1470, 594, 1470, 720, 10, C.ink2);
  // urnas y papeletas contadas
  icon.urn(g, 200, 500, 170, C.white, 0);
  for (let i = 0; i < 8; i++) icon.ballot(g, 400 + (i % 4) * 54, 540 - Math.floor(i / 4) * 26, 84, i % 3 === 0 ? C.orange : i % 3 === 1 ? C.orange2 : C.yellow);
  // acta central con los seis datos
  const ak = ease(back(inv(t, K.actaIn2 - 1.0, K.actaIn2 - .4)));
  if (ak > 0) {
    g.save(); g.globalAlpha = clamp(ak);
    g.translate(790, 300); g.rotate(-.02); g.translate(-790, -300);
    card(g, 560, 84, 460, 470, 8, C.white, 5);
    txt(g, 'ACTA DE ESCRUTINIO', 790, 122, 22, C.ink, 400, 'Bungee');
    capsule(g, 596, 148, 984, 148, 3, 'rgba(11,44,74,.25)');
    const DATOS = ['censo', 'certificaciones', 'votantes', 'nulos', 'blancos', 'votos por candidatura'];
    DATOS.forEach((s, i) => {
      const k = inv(t, 243.0 + i * .9, 243.0 + i * .9 + .4);
      if (k <= 0) return;
      g.save(); g.globalAlpha = k;
      const y = 190 + i * 56;
      icon.check(g, 606, y, 34);
      txt(g, s, 636, y, 20, C.ink, 800, 'Baloo', 'left');
      card(g, 922, y - 8, 50, 16, 4, 'rgba(11,44,74,.15)', 0);
      g.restore();
    });
    txt(g, '6 DATOS EN LA PUERTA', 790, 522, 18, C.orange, 400, 'Bungee');
    g.restore();
  }
  // foto del acta
  const fk = ease(back(inv(t, K.fotoActa, K.fotoActa + .5)));
  if (fk > 0) {
    g.save(); g.globalAlpha = clamp(fk);
    g.translate(1180, 320); g.scale(fk, fk); g.translate(-1180, -320);
    card(g, 1090, 60, 340, 240, 18, '#0F2033', 5);
    card(g, 1110, 86, 300, 190, 10, C.white, 0);
    txt(g, 'ACTA', 1260, 126, 24, C.ink, 400, 'Bungee');
    for (let i = 0; i < 4; i++) card(g, 1130, 156 + i * 26, 260, 12, 4, 'rgba(11,44,74,.18)', 0);
    txt(g, 'nítida · antes de doblar', 1260, 254, 16, C.yellow, 800);
    g.restore();
  }
  // copia y scrutinio
  chipc(g, 'COPIA · 1 POR CANDIDATURA', 1260, 350, 20, C.green, C.white, inv(t, K.copias, K.copias + .4));
  chipc(g, 'SCRUTINIA · ANTES DE LAS 21:00', 790, 606, 26, C.ink, C.yellow, inv(t, K.copias + 1.6, K.copias + 2.0));
  // presidente contando y apoderada mirando
  presidente(g, { x: 1360, y: 880, s: 300, t, arms: [.7, .5], mouth: 'flat', look: -1, browTilt: 1 });
  apoderado(g, { x: 300, y: 880, s: 280, t, armL: [.3, .2], armR: [.7, .3], mouth: 'flat', look: 1 });
}

// ———————————————————— 9 · SOBRES Y MOCHILA ————————————————————
export function sobres(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  // tres sobres con solapa cruzada
  const SOB = [[K.sobres0, 120, '1', 'CONSTITUCIÓN + SESIÓN'], [K.sobres0 + K.sobresStep, 420, '2', 'COPIA AL TRIBUNAL'], [K.sobres0 + 2 * K.sobresStep, 720, '3', 'COPIA A CORREOS']];
  for (const [t0, x, n, label] of SOB) {
    const k = ease(back(inv(t, t0, t0 + .45)));
    if (k <= 0) continue;
    g.save(); g.globalAlpha = clamp(k);
    g.translate(x + 120, 300); g.scale(k, k); g.translate(-(x + 120), -300);
    card(g, x, 180, 240, 170, 8, C.cream, 5);
    poly(g, [[x, 180], [x + 240, 180], [x + 120, 280]]); fill(g, '#F2E4C8'); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke();
    capsule(g, x + 104, 176, x + 136, 300, 9, C.red);
    capsule(g, x + 136, 176, x + 104, 300, 9, C.red);
    numDisc(g, n, x + 200, 200, 22, C.ink, C.yellow);
    txt(g, label, x + 120, 386, 18, C.ink, 800);
    g.restore();
  }
  // destinos
  const dk = inv(t, K.sobres0 + 5.4, K.sobres0 + 5.8);
  if (dk > 0) {
    g.save(); g.globalAlpha = dk;
    card(g, 120, 450, 640, 150, 18, C.ink, 5);
    txt(g, '1 + 2 → TRIBUNAL', 440, 498, 26, C.yellow, 400, 'Bungee');
    txt(g, 'con la policía y recibo firmado', 440, 540, 20, 'rgba(255,255,255,.85)', 800);
    card(g, 800, 450, 480, 150, 18, C.orange, 5);
    txt(g, '3 → CORREOS', 1040, 498, 26, C.white, 400, 'Bungee');
    txt(g, 'guarda el recibo', 1040, 540, 20, 'rgba(255,255,255,.9)', 800);
    g.restore();
  }
  // gráfico de los 24 y mochila
  const gk = inv(t, K.grafico, K.grafico + .4);
  if (gk > 0) {
    g.save(); g.globalAlpha = gk;
    const gx = 120, gy = 640, cw = 34, gap = 6, fijos = [0, 5, 9, 12, 15, 18, 22];
    for (let i = 0; i < 24; i++) {
      const x = gx + (i % 12) * (cw + gap), y = gy + Math.floor(i / 12) * (cw + gap);
      card(g, x, y, cw, cw, 7, fijos.includes(i) ? C.green2 : 'rgba(220,38,38,.85)', 3, 'rgba(11,44,74,.25)');
    }
    txt(g, '7/24 CUBIERTOS · FALTAN 22', 120, 812, 26, C.ink, 400, 'Bungee', 'left');
    g.restore();
  }
  const mk = ease(back(inv(t, K.mochila2, K.mochila2 + .5)));
  if (mk > 0) {
    g.save(); g.globalAlpha = clamp(mk);
    g.translate(1140, 700); g.scale(mk, mk); g.translate(-1140, -700);
    icon.backpack(g, 1210, 640, 220);
    icon.idcard(g, 940, 800, 88); icon.dni(g, 1040, 800, 88);
    icon.pen(g, 1130, 800, 88); icon.phone(g, 1220, 800, 88); icon.bottle(g, 1310, 800, 88);
    g.restore();
  }
}

// ———————————————————— 10 · CIERRE ————————————————————
const PASOS10 = ['Verifica', 'Acredítate', 'Pide acta', 'Reporta', 'Patrulla',
                 'Documenta', 'Avisa avances', 'Foto del acta', 'Pide copia', 'Fin'];

export function cierre(g, t) {
  g.fillStyle = C.ink; g.fillRect(0, 0, SW, SH);
  const r = seeded(11);
  g.fillStyle = 'rgba(255,255,255,.05)';
  for (let i = 0; i < 16; i++) { circle(g, r() * SW, r() * SH, 40 + r() * 130); g.fill(); }
  // los diez pasos
  PASOS10.forEach((s, i) => {
    const k = ease(back(inv(t, K.pasos0 + i * K.pasoStep, K.pasos0 + i * K.pasoStep + .35)));
    if (k <= 0) return;
    const col = i % 5, row = Math.floor(i / 5);
    const x = 80 + col * 300, y = 90 + row * 96;
    g.save(); g.globalAlpha = clamp(k);
    g.translate(x + 130, y + 34); g.scale(k, k); g.translate(-(x + 130), -(y + 34));
    card(g, x, y, 272, 70, 35, 'rgba(255,255,255,.10)', 3, 'rgba(255,255,255,.22)');
    numDisc(g, i + 1, x + 36, y + 35, 22, C.orange, C.white);
    txt(g, s, x + 156, y + 36, 19, C.white, 800);
    g.restore();
  });
  // rejilla 24 y faltan 22
  const gk = inv(t, K.pasos0 + 3.2, K.pasos0 + 3.6);
  if (gk > 0) {
    g.save(); g.globalAlpha = gk;
    const gx = 120, gy = 330, cw = 56, gap = 12, fijos = [0, 5, 9, 12, 15, 18, 22];
    for (let i = 0; i < 24; i++) {
      const x = gx + (i % 8) * (cw + gap), y = gy + Math.floor(i / 8) * (cw + gap);
      card(g, x, y, cw, cw, 10, fijos.includes(i) ? C.green2 : 'rgba(220,38,38,.85)', 4, 'rgba(255,255,255,.25)');
    }
    txt(g, '9 APODERADOS · 7 COLEGIOS CUBIERTOS', 120, 590, 24, C.white, 400, 'Bungee', 'left');
    txt(g, '24 COLEGIOS · 112 MESAS · 31 PLAZAS', 120, 626, 20, 'rgba(255,255,255,.7)', 800, 'Baloo', 'left');
    g.restore();
  }
  const fk = ease(back(inv(t, K.final - 3.0, K.final - 2.4)));
  if (fk > 0) {
    g.save(); g.globalAlpha = clamp(fk);
    g.translate(1200, 430); g.scale(fk, fk); g.translate(-1200, -430);
    g.rotate(-.03);
    card(g, 940, 330, 520, 130, 18, C.red, 6);
    txt(g, 'FALTAN 22', 1200, 376, 52, C.white, 400, 'Bungee');
    txt(g, 'plazas por cubrir', 1200, 428, 24, '#FFE4E4', 800);
    g.restore();
  }
  // Brian y Eugenio
  const bk = inv(t, K.final - 2.4, K.final - 1.8);
  if (bk > 0) {
    g.save(); g.globalAlpha = bk;
    brian(g, { x: 1060, y: 820, s: 220, t, armL: [.2, .1], armR: [1.5 - .12 * Math.sin(t * 6), .05], mouth: 'smile', look: 1 });
    eugenio(g, { x: 1330, y: 820, s: 220, t, armL: [1.5 + .12 * Math.sin(t * 6), .05], armR: [.2, .1], mouth: 'smile', look: -1, folder: 0 });
    if (bk > .6) { chipc(g, '¡JUNTOS!', 1195, 700, 28, C.yellow, C.ink); }
    g.restore();
  }
  // cartel final
  const tk = ease(back(inv(t, K.final, K.final + .5)));
  if (tk > 0) {
    g.save(); g.globalAlpha = clamp(tk);
    card(g, 60, 760, 1480, 110, 22, C.yellow, 6);
    txt(g, '¡EL 29N LO DEFENDEMOS JUNTOS!', 440, 816, 40, C.ink, 400, 'Bungee');
    txt(g, 'SALF · CASTELLÓN', 1290, 816, 30, C.orange, 400, 'Bungee');
    g.restore();
  }
}

export const DRAW = { intro, constitucion, votacion, coordina, caso1, papeletas, accesibilidad, escrutinio, sobres, cierre };
