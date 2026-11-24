// scenesB.js — caso 1 (denegación de acceso) y caso 2 (papeletas, propaganda, luz/urna/compañero).
import { C, clamp, inv, lerp, ease, easeOut, back, circle, ell, card, rr, poly, fill, capsule, txt, para,
         measure, chip, pill, numDisc, bubble, icon, paperBg, ground, seeded, setFont } from './engine.js';
import { K } from './story.js';
import { brian, eugenio, apoderado, apoderada, presidente } from './cast.js';

const SW = 1600, SH = 900;

function school(g, x, y, w, h, t) {
  // fachada plana: pared, ventanas, puerta, cartel electoral
  card(g, x, y, w, h, 14, '#F2E3C6', 7);
  card(g, x, y, w, 54, 14, C.ink, 7);
  txt(g, 'CEIP · MESA ELECTORAL', x + w / 2, y + 28, 26, C.yellow, 800);
  for (let i = 0; i < 5; i++) {
    const wx = x + 40 + i * (w - 90) / 4.6;
    card(g, wx, y + 96, 96, 110, 8, '#BFD9EA', 5);
    capsule(g, wx + 48, y + 96, wx + 48, y + 206, 4, C.ink);
    capsule(g, wx, y + 151, wx + 96, y + 151, 4, C.ink);
  }
  // puerta
  card(g, x + w * .42, y + h - 300, w * .17, 300, 10, '#8B5A2B', 7);
  card(g, x + w * .425, y + h - 292, w * .075, 284, 6, '#A9713A', 3);
  circle(g, x + w * .47, y + h - 150, 8); fill(g, C.yellow);
  // cartel electoral
  card(g, x + w * .62, y + h - 290, 260, 150, 10, C.white, 5);
  txt(g, 'ELECCIONES', x + w * .62 + 130, y + h - 250, 22, C.ink2, 400, 'Bungee');
  txt(g, '29 · NOVIEMBRE', x + w * .62 + 130, y + h - 215, 20, C.ink, 800);
  card(g, x + w * .62 + 24, y + h - 190, 212, 30, 6, C.orange, 0);
  txt(g, 'MESA ABIERTA 9:00', x + w * .62 + 130, y + h - 174, 15, C.white, 800);
  // acera
  ground(g, y + h, '#E6DCC8');
  for (let i = 0; i < 14; i++) capsule(g, x - 40 + i * 130, y + h, x - 10 + i * 130, y + h, 4, 'rgba(11,44,74,.12)');
}

export function introCaso(g, t) {
  const k = ease(inv(t, K.c1In, K.c1In + .6));
  g.save(); g.globalAlpha = k;
  // número gigante y título
  txt(g, 'CASO 1', 800, 250, 30, C.yellow, 400, 'Bungee');
  txt(g, 'NO ME DEJAN ENTRAR', 800, 380, 92, C.white, 400, 'Bungee');
  card(g, 470, 470, 660, 8, 4, C.orange, 0);
  // los cuatro pasos entran uno a uno
  const pasos = [['1', 'RESPIRA'], ['2', 'ACREDITACIÓN + DNI'], ['3', 'LA FRASE DEL ART. 79'], ['4', 'NO DISCUTAS · DOCUMENTA']];
  pasos.forEach(([n, s], i) => {
    const kk = back(inv(t, K.c1In + .35 + i * .38, K.c1In + .7 + i * .38));
    if (kk <= 0) return;
    const x = 190 + i * 400, y = 640;
    g.save(); g.globalAlpha = clamp(kk); g.translate(x + 170, y + 70); g.scale(kk, kk); g.translate(-(x + 170), -(y + 70));
    card(g, x, y, 340, 150, 20, C.white, 6);
    numDisc(g, n, x + 46, y + 42, 30, C.orange, C.white);
    txt(g, s, x + 170, y + 96, 23, C.ink, 800);
    g.restore();
  });
  g.restore();
}

export function puerta(g, t) {
  school(g, 120, 90, 1360, 520, t);
  // suelo
  const bob = Math.sin(t * 3) * 3;
  // el apoderado llega caminando
  const k = ease(inv(t, K.puerta, K.puerta + 1.6));
  const ax = lerp(180, 700, k);
  apoderado(g, { x: ax, y: 700 + bob, s: 300, t, armL: [.2, .1], armR: [.2, .1], mouth: 'smile', walk: k < 1 ? 1 : 0, legPhase: t * 8, longSleeve: false });
  // acreditación y DNI que se muestran (zoom)
  const ak = ease(back(inv(t, K.acred, K.acred + .6)));
  if (ak > 0) {
    g.save(); g.globalAlpha = clamp(ak);
    g.translate(1180, 560 + 40 * (1 - ak)); g.rotate(-.05);
    card(g, -146, -124, 292, 244, 22, C.white, 6);
    txt(g, 'ACREDITACIÓN', 0, -104, 20, C.orange, 400, 'Bungee');
    icon.idcard(g, 0, -4, 176);
    txt(g, 'Junta Electoral', 0, 68, 21, C.ink, 800);
    txt(g, 'SALF · CASTELLÓN', 0, 96, 17, 'rgba(11,44,74,.6)', 700);
    g.restore();
  }
  const dk = ease(back(inv(t, K.dni, K.dni + .6)));
  if (dk > 0) {
    g.save(); g.globalAlpha = clamp(dk);
    g.translate(1450, 590 + 40 * (1 - dk)); g.rotate(.06);
    card(g, -130, -104, 260, 208, 22, C.white, 6);
    txt(g, 'DNI', 0, -82, 20, C.ink2, 400, 'Bungee');
    icon.dni(g, 0, 4, 190);
    g.restore();
  }
  // cartel flotante: «no grites, respira»
  chip(g, 'RESPIRA · SONRÍE', 470, 176, 24, C.ink, C.yellow);
}

export function presi(g, t) {
  // interior del colegio
  card(g, 0, 0, SW, SH, 0, '#F6EEDC', 0);
  // pared, ventana, mesa
  card(g, 90, 60, 1420, 470, 12, '#EFE2C8', 6);
  card(g, 1180, 100, 260, 200, 8, '#BFD9EA', 6);
  capsule(g, 1310, 100, 1310, 300, 4, C.ink); capsule(g, 1180, 200, 1440, 200, 4, C.ink);
  card(g, 150, 330, 200, 140, 8, C.white, 5);
  txt(g, 'PROCLAMA', 250, 380, 20, C.ink2, 400, 'Bungee');
  for (let i = 0; i < 3; i++) card(g, 172, 405 + i * 20, 156, 6, 3, 'rgba(11,44,74,.2)', 0);
  ground(g, 620, '#E9DCC4');
  // urna sobre la mesa
  card(g, 980, 470, 330, 30, 8, '#C89B63', 5);
  icon.urn(g, 1130, 400, 180, C.white, 0);
  capsule(g, 980, 500, 1310, 500, 6, C.ink);
  capsule(g, 1000, 560, 1000, 620, 8, C.ink2); capsule(g, 1290, 560, 1290, 620, 8, C.ink2);
  // presidente (a la derecha, brazos cruzados)
  presidente(g, { x: 1180, y: 790, s: 330, t, armL: [.9, 1.5], armR: [.9, 1.5], mouth: 'flat', look: -1, browTilt: 1.2 });
  // apoderado (a la izquierda, acreditación en mano)
  apoderado(g, { x: 430, y: 790, s: 300, t, armL: [.3, .2], armR: [1.15, .35], mouth: 'open', look: 1 });
  // bocadillo del presidente
  const bk = ease(back(inv(t, K.presi, K.presi + .5)));
  if (bk > 0) {
    g.save(); g.globalAlpha = clamp(bk);
    bubble(g, 'No puede pasar. La mesa no está constituida.', 700, 200, 620, 34, C.white, C.ink, 430, 1);
    g.restore();
  }
  // etiqueta «falta la urna / 9:00» como pista del caso obligatorio
  const ck = inv(t, K.presi + 1.2, K.presi + 1.6);
  if (ck > 0) {
    g.save(); g.globalAlpha = ck;
    card(g, 110, 150, 440, 112, 16, C.red, 5);
    txt(g, 'MESA SIN CONSTITUIR', 330, 182, 24, C.white, 400, 'Bungee');
    txt(g, 'a las 9:00 · urna rota', 330, 216, 21, '#FFE4E4', 700);
    txt(g, 'avisa a Brian', 330, 244, 19, '#FFE4E4', 700);
    g.restore();
  }
}

export function escalado(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 690, '#E9DCC4');
  // pasillo del colegio: puerta al fondo
  card(g, 620, 250, 360, 460, 10, '#E7D9BE', 6);
  card(g, 700, 330, 200, 380, 8, '#8B5A2B', 6);
  txt(g, 'NO ENTRAR', 1220, 330, 20, C.red, 400, 'Bungee');
  card(g, 1150, 300, 210, 70, 10, C.white, 5);
  txt(g, 'NO ENTRAR', 1255, 336, 22, C.red, 400, 'Bungee');
  // apoderado en el pasillo con el móvil
  apoderado(g, { x: 420, y: 760, s: 290, t, armL: [.3, .2], armR: [1.25, .9], mouth: 'flat', look: 1 });
  // móvil gigante a la derecha
  const mk = ease(back(inv(t, K.fotoPuerta, K.fotoPuerta + .6)));
  if (mk > 0) {
    g.save(); g.globalAlpha = clamp(mk);
    const x = 1120, y = 470, w = 380, h = 620;
    g.translate(x, y + 60 * (1 - mk)); g.translate(-x, -y);
    card(g, x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, 42, '#0F2033', 6);
    card(g, x - w / 2, y - h / 2, w, h, 32, '#FFFFFF', 0);
    card(g, x - w / 2, y - h / 2 + 26, w, 70, 0, C.ink, 0);
    txt(g, 'SALF Rutas', x, y - h / 2 + 60, 26, C.white, 400, 'Bungee');
    // incidencia
    const ik = inv(t, K.pinMorado - .3, K.pinMorado + .3);
    if (ik > 0) {
      g.save(); g.globalAlpha = ik;
      card(g, x - w / 2 + 20, y - h / 2 + 116, w - 40, 120, 14, '#F3E8FF', 4, C.purple);
      txt(g, 'INCIDENCIA', x, y - h / 2 + 148, 22, C.purple, 400, 'Bungee');
      txt(g, 'deniega acceso 08:10', x, y - h / 2 + 186, 22, C.ink, 800);
      txt(g, 'CERVELLÓ · puerta principal', x, y - h / 2 + 214, 16, 'rgba(11,44,74,.6)', 700);
      g.restore();
    }
    // foto de la puerta
    const fk = inv(t, K.fotoPuerta - .2, K.fotoPuerta + .4);
    if (fk > 0) {
      g.save(); g.globalAlpha = fk;
      card(g, x - w / 2 + 20, y - h / 2 + 252, w - 40, 200, 12, '#0F2033', 4);
      // foto: puerta cerrada con «no»
      card(g, x - w / 2 + 36, y - h / 2 + 268, w - 72, 168, 8, '#E7D9BE', 0);
      card(g, x - 44, y - h / 2 + 286, 88, 150, 6, '#8B5A2B', 4);
      circle(g, x + 26, y - h / 2 + 362, 6); fill(g, C.yellow);
      txt(g, '08:10', x + w / 2 - 62, y - h / 2 + 296, 18, C.white, 400, 'Bungee', 'right');
      g.restore();
    }
    // estado morado
    const pk = inv(t, K.pinMorado, K.pinMorado + .4);
    if (pk > 0) {
      g.save(); g.globalAlpha = pk;
      card(g, x - w / 2 + 20, y - h / 2 + 476, w - 40, 84, 14, C.purple, 4);
      circle(g, x - w / 2 + 62, y - h / 2 + 518, 16); fill(g, C.white);
      txt(g, 'Pin en incidencia', x + 16, y - h / 2 + 512, 22, C.white, 800);
      g.restore();
    }
    g.restore();
  }
  // WhatsApp a Brian
  const wk = ease(back(inv(t, K.waBrian, K.waBrian + .5)));
  if (wk > 0) {
    g.save(); g.globalAlpha = clamp(wk);
    const x = 1330, y = 300;
    g.translate(x, y + 40 * (1 - wk)); g.translate(-x, -y);
    card(g, x - 170, y - 90, 340, 230, 20, '#0F2033', 6);
    icon.wa(g, x - 130, y - 50, 46);
    txt(g, 'Brian · CASU02', x + 10, y - 58, 20, C.white, 800, 'Baloo', 'left');
    card(g, x - 148, y - 20, 296, 96, 12, '#1D3B57', 0);
    txt(g, 'Me deniegan acceso. Foto + incidencia.', x - 132, y + 6, 17, C.white, 700, 'Baloo', 'left');
    txt(g, '08:12 ✓✓', x + 128, y + 56, 15, 'rgba(255,255,255,.6)', 700, 'Baloo', 'right');
    g.restore();
  }
  // escalado Brian » Eugenio » Jurídica
  const sk = inv(t, K.escala, K.escala + .3);
  if (sk > 0) {
    g.save(); g.globalAlpha = sk;
    card(g, 120, 70, 1360, 130, 20, 'rgba(251,244,230,.97)', 5);
    const ys = 135;
    const pasos = [['BRIAN', C.orange, 240], ['EUGENIO', C.ink2, 640], ['JURÍDICA', C.green, 1040]];
    pasos.forEach(([s, col, x]) => { card(g, x - 120, ys - 34, 240, 68, 34, col, 0); txt(g, s, x, ys, 26, C.white, 400, 'Bungee'); });
    const arrow = (x0, x1, kk) => {
      if (kk <= 0) return;
      capsule(g, x0, ys, lerp(x0, x1, kk), ys, 6, C.ink);
      const xe = lerp(x0, x1, kk);
      poly(g, [[xe, ys], [xe - 16, ys - 12], [xe - 16, ys + 12]]); fill(g, C.ink);
    };
    arrow(370, 500, ease(inv(t, K.escala + .2, K.escala + .6)));
    arrow(770, 900, ease(inv(t, K.escala + .7, K.escala + 1.1)));
    g.restore();
  }
  // nota: nos quedamos en el pasillo
  chip(g, 'SE QUEDA EN EL PASILLO', 800, 840, 24, C.ink, C.yellow);
}

// ——— CASO 2 ———
export function caso2a(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  ground(g, 700, '#E9DCC4');
  // mesa con urna y papeletas
  card(g, 260, 470, 760, 32, 8, '#C89B63', 6);
  capsule(g, 300, 502, 300, 690, 10, C.ink2); capsule(g, 980, 502, 980, 690, 10, C.ink2);
  icon.urn(g, 620, 400, 220, C.white, inv(t, K.papeletas, K.papeletas + .6));
  // la urna tiene hueco (se ve el fondo)
  const hk = inv(t, K.papeletas, K.papeletas + .5);
  if (hk > 0) {
    g.save(); g.globalAlpha = hk;
    card(g, 560, 318, 120, 46, 8, '#1b1b1b', 4);
    txt(g, 'sin papeletas SALF', 620, 390, 15, C.red, 800);
    g.restore();
  }
  // pila de papeletas a un lado
  for (let i = 0; i < 6; i++) icon.ballot(g, 940 + i * 6, 470 - i * 8, 120, i % 2 ? C.orange2 : C.orange);
  // presidente y apoderado
  presidente(g, { x: 1260, y: 790, s: 300, t, arms: [.4, .5], mouth: 'flat', look: -1, browTilt: 1 });
  apoderado(g, { x: 420, y: 800, s: 290, t, armL: [.3, .2], armR: [1.25 + .06 * Math.sin(t * 4), .5], mouth: 'open', look: 1 });
  // bocadillo amable
  const bk = ease(back(inv(t, K.papeletas + .5, K.papeletas + 1)));
  if (bk > 0) {
    g.save(); g.globalAlpha = clamp(bk);
    bubble(g, '¿Me repone las papeletas de SALF?', 300, 150, 520, 30, C.white, C.ink, 120, 1);
    g.restore();
  }
  // sello de la norma
  const ck = inv(t, K.faltan + 4.2, K.faltan + 4.5);
  chip(g, 'FALTAN PAPELETAS · PIDE Y DOCUMENTA', 800, 828, 24, C.red, C.white);
}

export function caso2b(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  // calle: colegio a la izquierda, farola, cartel partido a 5 m
  card(g, 60, 210, 520, 420, 12, '#F2E3C6', 6);
  card(g, 60, 210, 520, 40, 12, C.ink, 6);
  txt(g, 'COLEGIO', 320, 232, 22, C.yellow, 800);
  card(g, 220, 420, 180, 210, 8, '#8B5A2B', 6);
  ground(g, 630, '#E6DCC8');
  // línea de los 10 m
  const lk = ease(inv(t, K.c2b, K.c2b + .6));
  if (lk > 0) {
    g.save(); g.globalAlpha = lk;
    capsule(g, 620, 742, 1180, 742, 8, C.red);
    capsule(g, 620, 712, 620, 772, 8, C.red); capsule(g, 1180, 712, 1180, 772, 8, C.red);
    card(g, 770, 780, 300, 46, 23, C.red, 0);
    txt(g, '10 METROS', 920, 803, 22, C.white, 400, 'Bungee');
    // cinta de obra + cartel pegado al suelo
    for (let i = 0; i < 8; i++) { card(g, 1240 + i * 40, 540 + (i % 2) * 10, 40, 26, 4, i % 2 ? C.yellow : C.ink, 2); }
    g.restore();
  }
  // apoderado midiendo con pasos
  const steps = inv(t, K.pasos, K.pasos + 1.4);
  apoderado(g, { x: 760 + steps * 200, y: 650, s: 290, t, armL: [.2, .1], armR: [.4, .1], mouth: 'flat', look: -1, walk: steps < 1 ? 1 : 0, legPhase: t * 9 });
  // cartel partido con propaganda
  const ck = ease(back(inv(t, K.c2b + .2, K.c2b + .7)));
  if (ck > 0) {
    g.save(); g.globalAlpha = clamp(ck);
    g.translate(1340, 470 + 30 * (1 - ck));
    g.rotate(.1);
    card(g, -110, -150, 220, 210, 8, C.white, 6);
    card(g, -92, -132, 184, 80, 4, C.orange, 0);
    txt(g, 'VOTA', 0, -100, 30, C.white, 400, 'Bungee');
    txt(g, 'LISTA', 0, -74, 22, C.white, 800);
    for (let i = 0; i < 3; i++) card(g, -92, -40 + i * 26, 184, 10, 4, 'rgba(11,44,74,.25)', 0);
    // grieta
    poly(g, [[-20, -150], [10, -60], [-14, 0], [18, 60]]); g.lineWidth = 7; g.strokeStyle = C.ink; g.stroke();
    g.restore();
  }
  
}

export function caso2c(g, t) {
  g.save();
  // tres viñetas: luz, urna rota, compañero ausente
  const dark = inv(t, K.luz, K.luz + .25);
  if (dark > 0) { g.fillStyle = `rgba(11,20,32,${.82 * dark})`; g.fillRect(0, 0, 1600, 900); }
  const panels = [[40, 70], [540, 70], [1040, 70]];
  panels.forEach(([x, y], i) => {
    const k = ease(inv(t, K.c2c + i * .25, K.c2c + .5 + i * .25));
    g.save(); g.globalAlpha = clamp(k);
    card(g, x, y, 480, 700, 18, i === 0 && dark > 0 ? '#182A3B' : '#FFFDF7', 6);
    g.restore();
  });
  // a) corte de luz: bombilla apagada y móvil linterna
  const lk = inv(t, K.linterna, K.linterna + .5);
  icon.bulbOff(g, 280, 300, 132);
  if (lk > 0) {
    g.save(); g.globalAlpha = .9;
    g.beginPath(); g.moveTo(420, 430); g.lineTo(310, 700); g.lineTo(480, 700); g.closePath();
    g.fillStyle = 'rgba(234,179,8,.35)'; g.fill();
    g.restore();
    card(g, 360, 470, 120, 200, 16, C.ink, 5);
    txt(g, 'LINTERNA', 420, 520, 15, C.white, 400, 'Bungee');
  }
  txt(g, 'CORTE DE LUZ', 280, 178, 22, dark > .3 ? C.yellow : C.ink, 400, 'Bungee');
  txt(g, 'quédate y avisa', 280, 690, 26, dark > .3 ? C.white : C.ink, 800);
  // b) urna rota
  icon.urn(g, 780, 330, 210, C.white, 0);
  if (t > K.urnaRota) {
    const b = inv(t, K.urnaRota, K.urnaRota + .3);
    g.save(); g.globalAlpha = b;
    poly(g, [[720, 250], [770, 360], [730, 440], [780, 520]]); g.lineWidth = 8; g.strokeStyle = C.red; g.stroke();
    card(g, 670, 545, 220, 56, 12, C.red, 0); txt(g, 'URNA ROTA', 780, 574, 22, C.white, 400, 'Bungee');
    g.restore();
  }
  txt(g, 'URNA ROTA', 780, 178, 22, C.ink, 400, 'Bungee');
  txt(g, 'documenta y avisa', 780, 660, 26, C.ink, 800);
  // c) compañero ausente » cubres el hueco
  const ck = inv(t, K.hueco, K.hueco + .8);
  if (ck < 1) {
    // la silla vacía del compañero
    g.save(); g.globalAlpha = 1 - ck;
    card(g, 1180, 250, 200, 300, 12, '#EBEEF3', 4, 'rgba(11,44,74,.3)');
    txt(g, 'HUECO', 1280, 400, 22, 'rgba(11,44,74,.35)', 400, 'Bungee');
    g.restore();
  }
  txt(g, 'COMPAÑERO AUSENTE', 1280, 178, 22, C.ink, 400, 'Bungee');
  if (ck > 0) {
    g.save(); g.globalAlpha = ck;
    apoderado(g, { x: 1280, y: 600, s: 230, t, armL: [.2, .1], armR: [.9, .2], mouth: 'smile', look: 0 });
    card(g, 1150, 660, 260, 48, 12, C.green, 0); txt(g, 'CUBRES EL HUECO', 1280, 684, 19, C.white, 400, 'Bungee');
    g.restore();
  }
  chip(g, 'SI NO LLEGA, CUBRES Y AVISAS', 760, 836, 24, C.ink, C.yellow);
  g.restore();
}
