// scenesC.js — caso 3 (el acta), la mochila y el cierre.
import { C, clamp, inv, lerp, ease, easeOut, back, circle, ell, card, rr, poly, fill, capsule, txt, para,
         measure, chip, pill, numDisc, bubble, icon, ground, seeded, setFont, isPortrait } from './engine.js';
import { K } from './story.js';
import { brian, eugenio, apoderado, apoderada, presidente, companero } from './cast.js';

const SW = 1600, SH = 900;

export function acta(g, t) {
  g.fillStyle = '#F6EEDC'; g.fillRect(0, 0, SW, SH);
  // mesa de escrutinio
  ground(g, 700, '#E9DCC4');
  card(g, 90, 440, 1180, 34, 8, '#C89B63', 6);
  capsule(g, 140, 474, 140, 700, 10, C.ink2); capsule(g, 1220, 474, 1220, 700, 10, C.ink2);
  // urnas y papeletas contadas
  icon.urn(g, 260, 390, 170, C.white, 0);
  for (let i = 0; i < 7; i++) {
    const a = ease(clamp(inv(t, K.recuento + i * .12, K.recuento + .5 + i * .12)));
    icon.ballot(g, 470 + (i % 4) * 60, 440 - Math.floor(i / 4) * 26 - a * 10, 90, i % 3 === 0 ? C.orange : i % 3 === 1 ? C.orange2 : C.yellow);
  }
  // el acta grande en el centro
  const ak = ease(back(inv(t, K.c3 + .4, K.c3 + 1.0)));
  if (ak > 0) {
    g.save(); g.globalAlpha = clamp(ak);
    const x = 700, y = 380;
    g.translate(x, y); g.scale(ak, ak); g.translate(-x, -y);
    g.save(); g.translate(x, y); g.rotate(-.03); g.translate(-x, -y);
    card(g, x - 220, y - 210, 440, 420, 6, C.white, 5);
    txt(g, 'ACTA DE ESCRUTINIO', x, y - 178, 22, C.ink, 400, 'Bungee');
    capsule(g, x - 190, y - 150, x + 190, y - 150, 3, 'rgba(11,44,74,.25)');
    // filas de votos
    const rows = [['SALF', 412], ['PARTIDO A', 268], ['PARTIDO B', 154], ['EN BLANCO', 74], ['NULOS', 12]];
    rows.forEach(([nm, v], i) => {
      const yy = y - 110 + i * 52;
      txt(g, nm, x - 196, yy, 22, C.ink, 800, 'Baloo', 'left');
      // número que se tacha en la fila 2
      const bad = i === 1 || i === 3;
      const show = inv(t, K.recuento + .3 + i * .2, K.recuento + .5 + i * .2);
      if (show > 0) {
        g.save(); g.globalAlpha = show;
        txt(g, String(v), x + 196, yy, 30, bad && t > K.actaMal ? C.red : C.ink, 400, 'Bungee', 'right');
        if (bad && t > K.actaMal) {
          capsule(g, x + 130, yy + 2, x + 200, yy - 6, 6, C.red);
          capsule(g, x + 130, yy - 6, x + 200, yy + 2, 6, C.red);
        }
        g.restore();
      }
    });
    // suma que no cuadra
    const sk = inv(t, K.actaMal, K.actaMal + .35);
    if (sk > 0) {
      g.save(); g.globalAlpha = sk;
      card(g, x - 200, y + 152, 400, 56, 8, '#FDECEC', 3, C.red);
      txt(g, 'NO SUMA · 908 / 912', x, y + 181, 26, C.red, 400, 'Bungee');
      g.restore();
    }
    // sello NO CONFORMES
    const nk = ease(back(inv(t, K.protesta, K.protesta + .4)));
    if (nk > 0) {
      g.save(); g.globalAlpha = clamp(nk); g.translate(x + 60, y + 60); g.rotate(-.22); g.scale(1.2 * nk, 1.2 * nk);
      card(g, -170, -44, 340, 88, 10, C.red, 6);
      txt(g, 'NO CONFORMES', 0, 2, 34, C.white, 400, 'Bungee');
      g.restore();
    }
    g.restore();
    g.restore();
  }
  // apoderado que levanta la mano
  apoderado(g, { x: 240, y: 790, s: 300, t, armL: [.2, .1], armR: [2.5 - .1 * Math.sin(t * 3), .2], mouth: 'flat', look: 1 });
  // presidente contando
  presidente(g, { x: 1380, y: 790, s: 300, t, arms: [.5, .4], mouth: 'flat', look: -1, browTilt: 1 });
  // la foto del acta con el móvil
  const fk = inv(t, K.actaFoto, K.actaFoto + .4);
  if (fk > 0) {
    g.save(); g.globalAlpha = fk;
    card(g, 1120, 120, 340, 240, 18, '#0F2033', 5);
    card(g, 1140, 146, 300, 190, 10, C.white, 0);
    txt(g, 'ACTA', 1290, 190, 26, C.ink, 400, 'Bungee');
    for (let i = 0; i < 4; i++) card(g, 1160, 220 + i * 26, 260, 12, 4, 'rgba(11,44,74,.18)', 0);
    txt(g, 'nítida · sin doblar', 1290, 316, 16, C.yellow, 800);
    g.restore();
  }
  // Scrutinia
  const sk2 = inv(t, K.scrutin, K.scrutin + .4);
  if (sk2 > 0) {
    g.save(); g.globalAlpha = sk2;
    card(g, 520, 700, 560, 96, 48, C.ink, 5);
    txt(g, 'SCRUTINIA · antes de las 21:00', 800, 749, 26, C.yellow, 400, 'Bungee');
    g.restore();
  }
  if (!isPortrait()) chip(g, '1 · MIRA EL RECUENTO   2 · FOTO DEL ACTA   3 · NO FIRMES CONFORME', 800, 96, 22, C.ink, C.yellow);
}

export function mochila(g, t) {
  paperBg0(g);
  const mk = ease(back(inv(t, K.mochila, K.mochila + .7)));
  g.save(); g.translate(800, 640); g.scale(mk, mk); g.translate(-800, -640);
  ell(g, 800, 862, 250, 26); fill(g, 'rgba(11,44,74,.12)');
  icon.backpack(g, 800, 620, 440);
  card(g, 715, 650, 170, 92, 12, '#0F2033', 4);
  txt(g, 'SALF', 800, 700, 22, C.yellow, 400, 'Bungee');
  g.restore();
  // los objetos salen de la mochila y se colocan en arco
  const objs = [
    [K.objetos[0], 'ACREDITACIÓN', x => icon.idcard(g, x, 250, 150), -560, 250],
    [K.objetos[1], 'DNI', x => icon.dni(g, x, 250, 150), -300, 180],
    [K.objetos[2], 'BOLI', x => icon.pen(g, x, 250, 150), -80, 140],
    [K.objetos[3], 'MÓVIL + POWERBANK', x => { icon.phone(g, x - 22, 250, 140); icon.powerbank(g, x + 58, 272, 104); }, 190, 180],
    [K.objetos[4], 'AGUA', x => icon.bottle(g, x, 250, 150), 470, 250],
  ];
  objs.forEach(([t0, label, draw, x, r], i) => {
    const k = ease(back(inv(t, t0, t0 + .5)));
    if (k <= 0) return;
    const px = 800 + x, py = 760 + (r - 760) * k;
    g.save(); g.globalAlpha = clamp(k);
    circle(g, px, py, 86); fill(g, C.white); g.lineWidth = 6; g.strokeStyle = C.ink; g.stroke();
    draw(px);
    txt(g, label, px, py + 122, 20, C.ink, 400, 'Bungee');
    g.restore();
  });
  // la guía impresa, aparte
  const pk = ease(back(inv(t, K.objetos[4] + .4, K.objetos[4] + .9)));
  if (pk > 0) {
    g.save(); g.globalAlpha = clamp(pk);
    g.translate(800, 760); g.scale(pk, pk); g.translate(-800, -760);
    card(g, 640, 690, 320, 140, 14, C.white, 5);
    txt(g, 'ESTA GUÍA IMPRESA', 800, 736, 22, C.ink, 400, 'Bungee');
    txt(g, '4 hojas · en la mochila', 800, 774, 19, 'rgba(11,44,74,.6)', 700);
    g.restore();
  }
  if (!isPortrait()) chip(g, 'ACREDITACIÓN · DNI · BOLI · MÓVIL · AGUA · GUÍA', 800, 96, 20, C.ink, C.yellow);
}
function paperBg0(g) { g.fillStyle = C.paper; g.fillRect(0, 0, SW, SH); }

export function cierre(g, t) {
  // rejilla de los 24 colegios: 7 en verde (cubiertos), 17 en rojo
  const gx = 70, gy = 210, cw = 104, ch = 88, gap = 13;
  const fijos = [0, 5, 9, 12, 15, 18, 22];
  for (let i = 0; i < 24; i++) {
    const x = gx + (i % 6) * (cw + gap), y = gy + Math.floor(i / 6) * (ch + gap);
    const it = inv(t, K.diecisiete + (i % 6) * .1 + Math.floor(i / 6) * .12, K.diecisiete + .4 + (i % 6) * .1 + Math.floor(i / 6) * .12);
    const isFix = fijos.includes(i);
    const green = it >= 1 && isFix;
    const col = green ? C.green2 : (it > 0 ? 'rgba(220,38,38,.85)' : 'rgba(255,255,255,.10)');
    card(g, x, y, cw, ch, 12, col, 4, green ? C.green2 : 'rgba(255,255,255,.25)');
    poly(g, [[x + 12, y + 26], [x + cw / 2, y + 10], [x + cw - 12, y + 26]]); fill(g, green ? C.white : 'rgba(255,255,255,.35)');
    if (green) icon.check(g, x + cw / 2, y + ch / 2 + 16, 40);
  }
  txt(g, '9 APODERADOS · 7 COLEGIOS CUBIERTOS', gx + 330, 762, 24, C.white, 400, 'Bungee');
  txt(g, '24 COLEGIOS · 112 MESAS · 31 PLAZAS', gx + 330, 800, 22, 'rgba(255,255,255,.72)', 800);
  // el «FALTAN 22», a lo grande, arriba a la derecha
  const fk = isPortrait() ? 0 : ease(back(inv(t, K.faltan, K.faltan + .6)));
  if (fk > 0) {
    g.save(); g.globalAlpha = clamp(fk);
    g.translate(1180, 150); g.scale(fk, fk); g.rotate(-.04);
    card(g, -250, -72, 500, 144, 18, C.red, 6);
    txt(g, 'FALTAN 22', 0, -10, 60, C.white, 400, 'Bungee');
    txt(g, 'plazas por cubrir', 0, 44, 26, '#FFE4E4', 800);
    g.restore();
  }
  // cartel final
  const tk = ease(back(inv(t, K.titulazo, K.titulazo + .6)));
  if (tk > 0) {
    g.save(); g.globalAlpha = clamp(tk);
    g.translate(1180, 300); g.scale(tk, tk); g.translate(-1180, -300);
    txt(g, '¡EL 29N LO', 1180, 286, 46, C.white, 400, 'Bungee');
    txt(g, 'DEFENDEMOS JUNTOS!', 1180, 344, 46, C.yellow, 400, 'Bungee');
    card(g, 980, 386, 400, 8, 4, C.orange, 0);
    txt(g, 'SALF · CASTELLÓN', 1180, 430, 28, C.white, 800);
    g.restore();
  }
  // Brian y Eugenio: puño, de cuerpo entero
  const bk = ease(inv(t, K.fist, K.fist + .5));
  if (bk > 0) {
    g.save(); g.globalAlpha = bk;
    brian(g, { x: 830, y: 862, s: 210, t, armL: [.2, .1], armR: [1.5 - .12 * Math.sin(t * 6), .05], mouth: 'smile', look: 1 });
    eugenio(g, { x: 1130, y: 862, s: 210, t, armL: [1.5 + .12 * Math.sin(t * 6), .05], armR: [.2, .1], mouth: 'smile', look: -1, folder: 1 });
    const ex = 980, ey = 782;
    if (bk > .6) {
      g.save(); g.globalAlpha = bk;
      circle(g, ex, ey, 26); fill(g, C.yellow);
      g.globalAlpha = bk * .4; circle(g, ex, ey, 44); fill(g, C.orange);
      capsule(g, ex - 60, ey - 52, ex - 20, ey - 26, 8, C.yellow);
      capsule(g, ex + 60, ey - 52, ex + 20, ey - 26, 8, C.yellow);
      g.restore();
    }
    g.restore();
  }
  // pines volando: 24 colegios, la misión
  const ok = inv(t, K.fuera, K.fuera + .3);
  if (ok > 0) { g.save(); g.globalAlpha = ok * .92; g.fillStyle = 'rgba(11,20,32,.35)'; g.fillRect(0, 0, SW, SH); g.restore(); }
}
