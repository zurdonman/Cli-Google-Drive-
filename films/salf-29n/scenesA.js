// scenesA.js — bloque 0 (mapa de los 24 pines), bloque 1 (los cuatro relojes) y bloque 2 (la app en 20 s).
import { C, clamp, inv, lerp, ease, easeOut, back, circle, ell, card, rr, poly, fill, capsule, txt, para,
         measure, chip, pill, numDisc, bubble, icon, paperBg, ground, seeded, setFont, isPortrait } from './engine.js';
import { K, MESAS } from './story.js';
import { brian, eugenio } from './cast.js';

const SW = 1600, SH = 900;
const easer = t => 1 - Math.pow(1 - clamp(t), 2);

// ——————————————————————————————— 0 · MAPA ———————————————————————————————
const URB = [
  [70, 120, 300, 90], [400, 90, 180, 160], [620, 130, 260, 80], [980, 100, 120, 240], [1140, 120, 250, 90],
  [120, 250, 120, 200], [280, 290, 220, 90], [540, 250, 160, 220], [740, 250, 140, 120], [920, 380, 240, 90],
  [1240, 250, 160, 200], [60, 490, 260, 100], [360, 530, 180, 160], [580, 510, 260, 90], [880, 510, 180, 180],
  [1100, 500, 120, 220], [1260, 490, 180, 140], [120, 640, 160, 160], [320, 730, 260, 90], [620, 660, 180, 150],
  [840, 720, 240, 80], [1120, 760, 300, 90], [1460, 260, 90, 380], [1460, 700, 90, 140],
];
const PARKS = [[300, 130, 90, 110], [790, 660, 60, 90], [1000, 610, 70, 80]];
const RIVER = [[0, 430], [200, 450], [420, 420], [640, 470], [860, 430], [1080, 470], [1300, 430], [1600, 470]];

// puntos del mapa (coordenadas del escenario 1600×900): 12 CASU02 (azul) + 12 CASU03 (naranja)
export const PINS = [
  ['CERVANTES', 250, 210, 0], ['HERRERO', 330, 300, 0], ['PASCUAL TIRADO', 420, 190, 0], ['RIBALTA', 300, 400, 0],
  ['BERNAT ARTOLA', 470, 350, 0], ['GAETA HUGUET', 180, 330, 0], ['SOS BAYNAT', 560, 300, 0], ['CEA', 380, 520, 0],
  ['CARMELITAS', 210, 560, 0], ['GERMÀ COLÓN', 520, 470, 0], ['PENYAGOLOSA', 430, 600, 0], ['SOLER I GODES', 300, 585, 0],
  ['VICENT MARÇÀ', 980, 210, 1], ['ANTONIO ARMELLES', 1080, 300, 1], ['GREGAL', 1180, 190, 1], ['EJÉRCITO', 1060, 420, 1],
  ['RIPOLLÉS', 1230, 350, 1], ['BLASCO IBÁÑEZ', 940, 330, 1], ['FADRELL', 1300, 430, 1], ['ISIDORO ANDRÉS', 1000, 560, 1],
  ['PINTOR CASTELL', 1150, 540, 1], ['ESTEPAR', 1300, 560, 1], ['IVAJ', 1050, 620, 1], ['CARLES SALVADOR', 1240, 560, 1],
];

function mapBase(g) {
  card(g, 20, 20, 1560, 860, 26, '#EDF1E4', 7);
  // manzanas
  g.save(); rr(g, 20, 20, 1560, 860, 26); g.clip();
  for (const [x, y, w, h] of URB) { card(g, x, y, w, h, 10, '#E2E7D5', 3, 'rgba(11,44,74,.10)'); }
  for (const [x, y, w, h] of PARKS) { card(g, x, y, w, h, 10, '#CDE3B4', 3, 'rgba(10,122,62,.35)'); }
  // río
  g.save(); g.beginPath(); g.moveTo(RIVER[0][0], RIVER[0][1]);
  for (let i = 1; i < RIVER.length; i++) g.lineTo(RIVER[i][0], RIVER[i][1]);
  g.lineWidth = 46; g.strokeStyle = '#AFD3E8'; g.lineCap = 'round'; g.stroke();
  g.lineWidth = 3; g.strokeStyle = 'rgba(11,44,74,.18)'; g.stroke(); g.restore();
  // avenidas
  g.save(); g.lineWidth = 22; g.strokeStyle = '#FBF4E6'; g.lineCap = 'round';
  [[0, 470, 1600, 470], [820, 0, 860, 900], [0, 120, 1600, 120]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
  g.lineWidth = 3; g.strokeStyle = 'rgba(11,44,74,.12)';
  [[0, 470, 1600, 470], [820, 0, 860, 900], [0, 120, 1600, 120]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
  g.restore();
  g.restore();
  // leyenda
  const legend = 1;
  card(g, 60, 706, 470, 154, 18, 'rgba(255,255,255,.96)', 4);
  circle(g, 92, 744, 12); fill(g, C.ink); circle(g, 92, 786, 12); fill(g, C.orange);
  txt(g, 'CASU02 · 50 mesas · 15 plazas', 112, 745, 22, C.ink, 800, 'Baloo', 'left');
  txt(g, 'CASU03 · 62 mesas · 16 plazas', 112, 787, 22, C.ink, 800, 'Baloo', 'left');
  txt(g, '24 colegios · 112 mesas · 31 plazas', 92, 830, 20, 'rgba(11,44,74,.62)', 700, 'Baloo', 'left');
  // sello del mapa
  card(g, 1210, 706, 350, 154, 18, C.ink, 5);
  txt(g, 'CASTELLÓN', 1385, 748, 26, C.yellow, 800);
  txt(g, '29 · NOVIEMBRE', 1385, 790, 30, C.white, 400, 'Bungee');
  txt(g, 'CASU02 + CASU03', 1385, 830, 20, 'rgba(255,255,255,.7)', 800);
}

// pin de mapa con el número de mesas legible dentro (el agujero del pin es pequeño)
function pinConMesas(g, x, y, s, col, n) {
  const cy = y - s * .62, r = s * .46;
  g.beginPath();
  g.arc(x, cy, r, Math.PI * .82, Math.PI * 2.18);
  g.lineTo(x, y + s * .22);
  g.closePath();
  fill(g, col); g.lineWidth = Math.max(3, s * .08); g.strokeStyle = C.ink; g.stroke();
  circle(g, x, cy, r * .62); fill(g, C.white);
  txt(g, String(n), x, cy + 2, r * .95, col, 400, 'Bungee');
}

export function mapa(g, t) {
  g.save();
  const zk = ease(inv(t, K.mapaZoom, K.mapaZoom + 1.4));
  g.translate(800, 450); g.scale(1 + zk * .5, 1 + zk * .5); g.translate(-800, -450);
  mapBase(g);
  // los 24 pines caen con pop (sin transformaciones acumuladas: cada pin se calcula en absoluto)
  g.save();
  rr(g, 20, 20, 1560, 860, 26); g.clip();
  PINS.forEach(([name, x, y, casu], i) => {
    if (y > 760) return;
    const t0 = K.pins0 + i * K.pinStep;
    const k = inv(t, t0, t0 + .34);
    if (k <= 0) return;
    const sc = back(k), dy = -70 * (1 - sc);
    g.save();
    g.globalAlpha = clamp(k * 2);
    g.translate(x, y + dy);
    g.scale(sc, sc);
    ell(g, 0, 4, 18, 6); fill(g, 'rgba(11,44,74,.18)');
    pinConMesas(g, 0, 0, 84, casu ? C.orange : C.ink, MESAS[i]);
    g.restore();
  });
  g.restore();
  // rótulos de los colegios cuando el mapa ya está cerca
  if (zk > .55 && t < K.brianIn) {
    const a2 = (zk - .55) / .45;
    g.save(); g.globalAlpha = a2;
    PINS.forEach(([name, x, y]) => {
      if (y > 760) return;
      setFont(g, 15, 800);
      const w2 = Math.min(measure(g, name, 15, 800) + 16, 210);
      card(g, x - w2 / 2, y + 12, w2, 24, 8, 'rgba(255,255,255,.94)', 2);
      txt(g, name, x, y + 24, 15, C.ink, 800);
    });
    g.restore();
  }

  // rótulo del bloque: contador de pines
  const n = PINS.filter((_, i) => t >= K.pins0 + i * K.pinStep).length;
  const cnt = 1 - easer(inv(t, K.brianIn - .2, K.brianIn + .2));
  if (cnt > 0) {
    g.save(); g.globalAlpha = cnt;
    card(g, 60, 46, 300, 92, 16, 'rgba(251,244,230,.97)', 5);
    txt(g, String(n).padStart(2, '0') + ' / 24', 210, 78, 30, C.orange, 400, 'Bungee');
    txt(g, 'pines en el mapa', 210, 112, 20, C.ink, 700);
    g.restore();
  }

  // zoom a Brian y Eugenio
  const bk = ease(inv(t, K.brianIn, K.brianIn + .8));
  if (bk > 0) {
    // se tapa el mapa (leyenda y sello incluidos) para dejar sitio a los dos personajes
    card(g, 20, 20, 1560, 860, 26, `rgba(251,244,230,${bk})`, 0);
    const bx = 830, by = lerp(980, 690, bk);
    g.save(); g.globalAlpha = bk;
    card(g, bx - 400, by - 250, 800, 380, 30, 'rgba(251,244,230,.98)', 7);
    txt(g, 'BRIAN · subinspector', bx - 180, by - 206, 26, C.orange, 800);
    txt(g, 'EUGENIO · inspector', bx + 180, by - 206, 26, C.ink2, 800);
    capsule(g, bx, by - 170, bx, by + 60, 3, 'rgba(11,44,74,.16)');
    brian(g, { x: bx - 180, y: by + 84, s: 230, t, armL: [.5 - .35 * Math.sin(t * 3), .9], armR: [.2, .1], mouth: 'smile', phone: 1, seed: 1 });
    eugenio(g, { x: bx + 180, y: by + 84, s: 230, t, armL: [.2, .1], armR: [1.1 + .2 * Math.sin(t * 3), .5], mouth: 'smile', folder: 1 });
    g.restore();
  }
  g.restore();   // cierra el save() del zoom del mapa
}

// ——————————————————————————————— 1 · RELOJES ———————————————————————————————
const TAREAS = [
  { hh: 8, mm: 0, kick: '08:00', title: 'CONSTITUCIÓN', sub: 'foto de la mesa', col: C.yellow, fg: C.ink },
  { hh: 14, mm: 0, kick: '14:00', title: 'AVANCE 1', sub: 'reporta por WhatsApp', col: C.orange2, fg: C.ink },
  { hh: 18, mm: 0, kick: '18:00', title: 'AVANCE 2', sub: 'reporta por WhatsApp', col: C.orange, fg: C.white },
  { hh: 20, mm: 0, kick: '20:00', title: 'ESCRUTINIO', sub: 'foto del acta < 21:00', col: C.red, fg: C.white },
];

export function relojes(g, t) {
  // línea de tiempo
  capsule(g, 120, 470, 1480, 470, 12, 'rgba(11,44,74,.16)');
  capsule(g, 120, 470, 120 + 1360 * ease(inv(t, 11.3, 26.2)), 470, 12, C.orange);
  // título
  const kw = inv(t, 11.2, 11.7);
  if (!isPortrait()) {
    g.save(); g.globalAlpha = kw;
    txt(g, 'CUATRO COSAS, NADA MÁS', 800, 92 - 30 * (1 - easeOut(kw)), 46, C.ink, 400, 'Bungee');
    g.restore();
  }
  // Scrutinia: sello que une las cuatro
  const sk = ease(inv(t, 24.6, 25.2));
  if (sk > 0) {
    g.save(); g.globalAlpha = sk;
    card(g, 560, 214, 480, 92, 46, C.ink, 5);
    txt(g, 'TODO POR SCRUTINIA', 800, 262, 34, C.yellow, 400, 'Bungee');
    g.restore();
  }

  TAREAS.forEach((T, i) => {
    const cx = 230 + i * 380, cy = 470;
    const k = inv(t, 11.6 + i * .28, 12.4 + i * .28);
    if (k <= 0) return;
    const hot = t >= K.reloj[i];
    const kk = back(k);
    g.save(); g.globalAlpha = clamp(k * 1.6);
    // tarjeta
    const y = 560 - 140 * kk;
    card(g, cx - 168, y, 336, 300, 26, hot ? T.col : '#FFFFFF', 7);
    // reloj que avanza hasta su hora
    const spin = inv(t, 11.6 + i * .28, K.reloj[i]) ;
    const hh = 8 + (T.hh - 8) * (i === 0 ? 0 : ease(spin));
    icon.clockIcon(g, cx, y + 96, 66, T.hh, T.mm, hot ? (T.col === C.yellow ? C.ink : C.white) : C.white, hot ? (T.col === C.yellow ? '#FFF3C4' : T.col) : C.ink, hot);
    // hora y tarea
    txt(g, T.kick, cx, y + 196, 40, hot ? T.fg : C.ink, 400, 'Bungee');
    txt(g, T.title, cx, y + 238, 26, hot ? T.fg : C.ink, 800);
    txt(g, T.sub, cx, y + 270, 19, hot ? T.fg : 'rgba(11,44,74,.62)', 700);
    // nodo en la línea
    circle(g, cx, 470, 20); fill(g, hot ? T.col : C.white); g.lineWidth = 6; g.strokeStyle = C.ink; g.stroke();
    if (hot) { circle(g, cx, 470, 9); fill(g, C.white); }
    g.restore();
    // ding: onda
    if (hot) {
      const dt = t - K.reloj[i];
      if (dt < .5) {
        g.save(); g.globalAlpha = (1 - dt / .5) * .8;
        circle(g, cx, 470, 20 + dt * 180); g.lineWidth = 6; g.strokeStyle = T.col; g.stroke();
        g.restore();
      }
    }
    // el último: parpadeo rojo y el <21:00
    if (i === 3 && t > K.reloj[3]) {
      const p = (t * 2.4) % 1;
      g.save(); g.globalAlpha = .35 + .35 * Math.sin(t * 8);
      card(g, cx - 168, 560 - 140, 336, 300, 26, 'transparent', 8, C.red);
      g.restore();
      const s2 = ease(inv(t, 25.45, 25.7));
      if (s2 > 0) {
        g.save(); g.translate(lerp(cx, 1180, 0), 340); g.scale(1.35 * s2, 1.35 * s2); g.rotate(-.06);
        card(g, -150, -40, 300, 80, 14, C.red, 5);
        txt(g, 'ANTES DE LAS 21:00', 0, 2, 26, C.white, 400, 'Bungee');
        g.restore();
      }
    }
  });

  // reloj de pared grande que marca el paso del día
  const bigK = inv(t, 11.4, 12.0);
  if (bigK > 0) {
    g.save(); g.globalAlpha = bigK;
    const dayk = inv(t, 11.4, 26.2), hh = 7.5 + 13.5 * ease(dayk);
    icon.clockIcon(g, 1390, 150, 92, Math.floor(hh) % 24, (hh % 1) * 60, C.white, C.ink, false);
    g.restore();
  }
}

// ——————————————————————————————— 2 · LA APP ———————————————————————————————
function phoneFrame(g, x, y, w, h, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  card(g, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 52, '#0F2033', 7);
  card(g, -w / 2, -h / 2, w, h, 40, '#F6F7FB', 0);
  card(g, 0 - w * .18, -h / 2 + 12, w * .36, 26, 13, '#0F2033', 0);
  g.restore();
  return { x, y, w, h, rot };
}
function pinApp(g, x, y, r, col, label) {
  circle(g, x, y, r); fill(g, col); g.lineWidth = 4; g.strokeStyle = C.white; g.stroke();
  if (label) txt(g, label, x, y + 1, r * .95, C.white, 400, 'Bungee');
}

export function app(g, t) {
  const pIn = ease(back(inv(t, 27.1, 27.8)));
  const px = 620, py = 468, pw = 400, ph = 720;
  g.save(); g.globalAlpha = clamp(pIn * 2); g.translate(px, py + 300 * (1 - pIn)); g.translate(-px, -py);
  const P = phoneFrame(g, px, py, pw, ph, 0);
  const L = px - pw / 2 + 22, R = px + pw / 2 - 22, T = py - ph / 2 + 46, B = py + ph / 2 - 24;
  // cabecera app
  card(g, L, T, R - L, 92, 16, C.ink, 0);
  txt(g, 'SALF Rutas', L + 20, T + 34, 30, C.white, 400, 'Bungee', 'left');
  txt(g, 'v4 · CASU02+03', L + 20, T + 68, 18, C.yellow, 800, 'Baloo', 'left');
  // botón Imprimir log
  const logK = inv(t, K.log, K.log + .4);
  card(g, R - 168, T + 18, 150, 56, 12, logK > .5 ? C.orange2 : C.orange, 3, C.white);
  txt(g, 'Imprimir log', R - 93, T + 47, 19, C.white, 800);
  if (logK > 0 && logK < 1) { g.save(); g.globalAlpha = (1 - logK) * .8; circle(g, R - 93, T + 46, 20 + logK * 60); g.lineWidth = 5; g.strokeStyle = C.orange; g.stroke(); g.restore(); }

  // mapa de la app
  card(g, L, T + 104, R - L, 330, 14, '#E8EFE2', 3);
  g.save(); rr(g, L, T + 104, R - L, 330, 14); g.clip();
  for (const [x0, y0, w0, h0] of URB.slice(0, 14)) card(g, L + (x0 / 1600) * (R - L), T + 104 + (y0 / 900) * 330, w0 * .24, h0 * .24, 4, '#DCE7D2', 0);
  // estela del GPS
  const gpsK = inv(t, K.gps, K.gps + .4);
  if (gpsK > 0) {
    const tr = inv(t, K.gps + .4, K.gps + 2.6);
    g.save();
    g.lineCap = 'round'; g.lineWidth = 9; g.strokeStyle = 'rgba(37,99,235,.55)';
    g.beginPath();
    const n = 24 * clamp(tr);
    for (let i = 0; i <= n; i++) {
      const u = i / 24, x = L + 40 + u * (R - L - 90), y = T + 380 - Math.sin(u * 4.2) * 60 - u * 60;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke(); g.restore();
    if (tr > 0) {
      const u = clamp(tr), x = L + 40 + u * (R - L - 90), y = T + 380 - Math.sin(u * 4.2) * 60 - u * 60;
      icon.gps(g, x, y, 9, t);
    }
  }
  // los pines de la app
  const pins = [[.32, .34, C.red, '1'], [.62, .3, C.red, '2'], [.5, .58, C.red, '3'], [.78, .62, C.red, '4']];
  pins.forEach(([u, v, col, n], i) => {
    const x = L + u * (R - L), y = T + 104 + v * 330;
    let c = C.red;
    if (i === 0 && t >= K.pinVerde) c = C.green;
    if (i === 0 && t > K.pinMorado) c = C.purple;
    pinApp(g, x, y, 15, c, n);
    if (i === 0 && t >= K.pinTap && t < K.pinTap + 1.6) {
      g.save(); g.globalAlpha = 1 - (t - K.pinTap) / 1.6; circle(g, x, y, 15 + (t - K.pinTap) * 50); g.lineWidth = 4; g.strokeStyle = C.ink; g.stroke(); g.restore();
    }
  });
  g.restore();

  // hoja del pin: 4 estados
  const sheetK = inv(t, K.pinTap + .3, K.pinTap + .7);
  if (sheetK > 0) {
    g.save(); g.globalAlpha = sheetK;
    const sy = T + 446 + 40 * (1 - ease(sheetK));
    card(g, L, sy, R - L, 180, 16, C.white, 4);
    txt(g, 'CERVANTES · 5 mesas', L + 16, sy + 28, 19, C.ink, 800, 'Baloo', 'left');
    const btns = [['🔴', 'Libre', C.red], ['🟢', 'Cubierto', C.green], ['🟡', 'Patrullaje', C.yellow], ['🟣', 'Incidencia', C.purple]];
    btns.forEach(([e, s, col], i) => {
      const bx = L + 10 + (i % 2) * ((R - L - 20) / 2), by = sy + 46 + Math.floor(i / 2) * 56;
      const on = (i === 1 && t >= K.pinVerde);
      card(g, bx, by, (R - L - 26) / 2, 48, 10, on ? col : '#F1F3F7', 3, on ? C.ink : 'rgba(11,44,74,.2)');
      circle(g, bx + 22, by + 24, 10); fill(g, col);
      txt(g, s, bx + 40, by + 25, 17, on ? C.white : C.ink, 800, 'Baloo', 'left');
      if (on && t < K.pinVerde + .45) { g.save(); g.globalAlpha = 1 - (t - K.pinVerde) / .45; circle(g, bx + 22, by + 24, 10 + (t - K.pinVerde) * 90); g.lineWidth = 4; g.strokeStyle = C.green; g.stroke(); g.restore(); }
    });
    g.restore();
  }
  // nota + foto
  const noteK = inv(t, K.nota, K.nota + .5);
  if (noteK > 0) {
    g.save(); g.globalAlpha = noteK;
    const ny = B - 118;
    card(g, L, ny, R - L, 56, 10, '#FFFFFF', 3);
    const full = 'Sin incidencias';
    const typed = full.slice(0, Math.ceil(clamp(inv(t, K.nota + .2, K.nota + 1.6)) * full.length));
    txt(g, typed + (Math.floor(t * 2.5) % 2 && typed.length < full.length ? '|' : ''), L + 14, ny + 29, 21, C.ink, 700, 'Baloo', 'left');
    txt(g, 'NOTA', R - 16, ny - 12, 13, 'rgba(11,44,74,.5)', 800, 'Baloo', 'right');
    // botón cámara
    const camK = inv(t, K.foto - .3, K.foto + .1);
    card(g, L, ny + 66, 118, 46, 12, t >= K.foto ? C.green : C.ink2, 3);
    icon.camera(g, L + 34, ny + 90, 40);
    txt(g, 'Foto', L + 84, ny + 90, 18, C.white, 800);
    // miniatura de la urna
    if (t >= K.foto + .25) {
      const mk = ease(back(inv(t, K.foto + .25, K.foto + .6)));
      g.save(); g.translate(R - 96, ny + 90); g.scale(mk, mk);
      card(g, -48, -9 - 22, 96, 74, 8, '#0F2033', 3);
      icon.urn(g, 0, 8, 74, C.white, 0);
      g.restore();
    }
    g.restore();
  }
  g.restore();

  // panel derecho: el log y WhatsApp
  const logS = inv(t, K.log - .4, K.log + .3);
  if (logS > 0) {
    g.save(); g.globalAlpha = logS;
    const x0 = 1060, y0 = 150;
    g.translate(x0, y0 + 30 * (1 - ease(logS)));
    card(g, 0, 0, 380, 262, 20, '#FFFFFF', 5);
    icon.folder(g, 44, 54, 62);
    txt(g, 'salf-rutas/', 84, 44, 24, C.ink, 800, 'Baloo', 'left');
    txt(g, '2026-11-29', 84, 72, 20, C.orange, 400, 'Bungee', 'left');
    capsule(g, 20, 100, 360, 100, 2, 'rgba(11,44,74,.15)');
    txt(g, 'log-081532.txt', 30, 130, 22, C.ink, 700, 'Baloo', 'left');
    icon.check(g, 344, 130, 34);
    txt(g, 'Documents + Download', 30, 166, 16, 'rgba(11,44,74,.55)', 700, 'Baloo', 'left');
    // compartir
    card(g, 20, 190, 340, 52, 12, t >= K.logShare ? C.green : '#EFF2F6', 3);
    txt(g, 'Compartir a WhatsApp', 190, 217, 21, t >= K.logShare ? C.white : 'rgba(11,44,74,.55)', 800);
    g.restore();
  }
  // WhatsApp a Brian
  const waK = inv(t, K.logWa, K.logWa + .35);
  if (waK > 0) {
    g.save(); g.globalAlpha = waK;
    const x0 = 1060, y0 = 470;
    g.translate(x0, y0 + 40 * (1 - ease(waK)));
    card(g, 0, 0, 380, 250, 20, '#0F2033', 5);
    icon.wa(g, 42, 44, 52);
    txt(g, 'CASU02+03 · Brian', 74, 34, 21, C.white, 800, 'Baloo', 'left');
    txt(g, 'en línea', 74, 60, 15, C.green2, 700, 'Baloo', 'left');
    card(g, 18, 92, 300, 74, 12, '#1D3B57', 0);
    txt(g, 'CERVANTES cubierto. GPS y foto ok.', 34, 116, 17, C.white, 700, 'Baloo', 'left');
    txt(g, '08:16 ✓✓', 300, 152, 14, 'rgba(255,255,255,.55)', 700, 'Baloo', 'right');
    card(g, 18, 180, 344, 48, 12, C.green, 0);
    txt(g, 'Enviar', 190, 205, 19, C.white, 800);
    g.restore();
  }

  // etiquetas de los pasos
  const steps = [[28.0, '1 · ACTIVA EL GPS'], [31.4, '2 · TOCA TU COLEGIO'], [33.0, '3 · ESTADO Y NOTA'], [36.3, '4 · HAZ LA FOTO'], [38.3, '5 · LOG Y WHATSAPP']];
  steps.forEach(([t0, s], i) => {
    const k = inv(t, t0, t0 + .3), out = inv(t, t0 + 2.4, t0 + 2.7);
    const a = k * (1 - out);
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    const y = 812 - i % 2 * 0;
    card(g, 60, y - 34, 440, 66, 33, C.ink, 0);
    txt(g, s, 280 + 10 * (1 - ease(k)), y, 25, C.yellow, 800);
    g.restore();
  });
  // el pulgar que pulsa
  const tapT = K.pinTap + .1;
  if (t > 30.4 && t < 31.6) {
    const k = inv(t, 30.4, tapT);
    g.save(); g.globalAlpha = .9;
    const x = lerp(1480, px - 46, ease(k)), y = lerp(960, py + 36, ease(k));
    circle(g, x, y, 26); fill(g, '#F3C79B'); g.lineWidth = 5; g.strokeStyle = C.ink; g.stroke();
    if (Math.abs(t - tapT) < .18) { circle(g, x, y, 26 + (t - tapT) * 120); g.lineWidth = 4; g.strokeStyle = C.orange; g.stroke(); }
    g.restore();
  }
}
