// cast.js — el reparto del corto, construido con primitivas (sin fotos ni parecidos reales).
// Cada personaje es una función que devuelve opciones para engine.char().
import { C, char, txt, circle, fill, card, rr } from './engine.js';

export const nadie = g => {};

// BRIAN · subinspector, chaleco azul SALF, móvil, gorra
export function brian(g, { x, y, s, t, armL, armR, mouth, look, walk, legPhase, phone = 0, lean, brows = true, browTilt = 0 }) {
  const o = {
    x, y, s, t, armL, armR, mouth, look, walk, legPhase, lean, brows, browTilt,
    skin: 1, hair: C.hair, hairStyle: 'short', shirt: C.ink, vest: C.ink2, trousers: '#0E2A44',
    shoes: C.orange, longSleeve: false, seed: 1.3, glasses: false, cap: null,
  };
  const r = char(g, o);
  if (phone) {
    const h = r.hands[1];
    g.save(); g.translate(h.x + s * .04, h.y - s * .02); g.rotate(-.25);
    card(g, -s * .055, -s * .1, s * .11, s * .2, s * .02, C.ink, 4);
    card(g, -s * .045, -s * .085, s * .09, s * .15, s * .012, C.green2, 0);
    g.restore();
  }
  return r;
}

// EUGENIO · inspector, carpeta, bigote cano, corbata
export function eugenio(g, { x, y, s, t, armL, armR, mouth, look, walk, legPhase, folder = 0, lean, brows = true, browTilt = 0 }) {
  const o = {
    x, y, s, t, armL, armR, mouth, look, walk, legPhase, lean, brows, browTilt,
    skin: 0, hair: C.hairGrey, hairStyle: 'grey', moustache: true, shirt: '#E7E2D6', vest: null,
    trousers: '#3A3F4A', shoes: C.ink, longSleeve: true, tie: C.red, seed: 2.7, glasses: true,
  };
  const r = char(g, o);
  if (folder) {
    g.save(); g.globalAlpha = folder;
    const hx = (r.hands[0].x + r.hands[1].x) / 2, hy = (r.hands[0].y + r.hands[1].y) / 2;
    g.translate(hx, hy); g.rotate(-.08);
    card(g, -s * .2, -s * .12, s * .4, s * .26, s * .02, C.yellow, 4);
    card(g, -s * .05, -s * .03, s * .16, s * .05, 2, C.white, 0);
    g.restore();
  }
  return r;
}

// APODERADO · joven, acreditación colgando, coleta
export function apoderado(g, { x, y, s, t, armL, armR, mouth, look, walk, legPhase, lean, brows = true, browTilt = 0, longSleeve = false }) {
  return char(g, {
    x, y, s, t, armL, armR, mouth, look, walk, legPhase, lean, brows, browTilt,
    skin: 0, hair: C.hair2, hairStyle: 'bun', shirt: C.orange2, trousers: C.ink, shoes: C.white,
    longSleeve, lanyard: true, seed: 4.1,
  });
}

// APODERADA · misma acreditación, melena
export function apoderada(g, { x, y, s, t, armL, armR, mouth, look, walk, legPhase, lean, brows = true, browTilt = 0 }) {
  return char(g, {
    x, y, s, t, armL, armR, mouth, look, walk, legPhase, lean, brows, browTilt,
    skin: 2, hair: '#2B2118', hairStyle: 'long', shirt: C.green2, trousers: '#1F2A44', shoes: C.ink,
    longSleeve: true, lanyard: true, seed: 5.6,
  });
}

// PRESIDENTE DE MESA · mayor, serio, gafas, corbata
export function presidente(g, { x, y, s, t, arms = [.15, .1], mouth = 'flat', look = 0, brows = true, browTilt = 1, lean = 0, armL, armR }) {
  return char(g, {
    x, y, s, t, armL: armL || arms, armR: armR || arms, mouth, look, lean, brows, browTilt,
    skin: 1, hair: C.hairGrey, hairStyle: 'bald', moustache: false,
    shirt: '#F1EAD9', trousers: '#4A4F5A', shoes: C.ink, tie: C.ink2, longSleeve: true, seed: 6.9,
  });
}

// COMPAÑERO · el que no aparece (solo silueta / hueco)
export function companero(g, { x, y, s, t, alpha = 1 }) {
  g.save(); g.globalAlpha = alpha;
  char(g, {
    x, y, s, t, armL: [.1, .1], armR: [.1, .1], mouth: 'smile', skin: 2,
    hair: C.hair, hairStyle: 'short', shirt: C.grey2, trousers: C.grey, shoes: C.ink, seed: 8.2,
  });
  g.restore();
}
