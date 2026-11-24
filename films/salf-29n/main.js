// main.js — contrato de página: window.READY, window.render(t), window.DUR, window.TEXTS(t)
import { DUR } from './story.js';
import { drawScene, textsAt, SW, SH } from './scenes.js';
import { setSize } from './engine.js';

const cv = document.getElementById('c'), g = cv.getContext('2d');
cv.width = window.innerWidth; cv.height = window.innerHeight;

const faces = [
  '400 40px Baloo', '600 40px Baloo', '700 40px Baloo', '800 40px Baloo',
  '400 40px Bungee', '700 40px Nunito', '900 40px Nunito',
];
await Promise.all(faces.map(f => document.fonts.load(f).catch(() => {})));
await document.fonts.ready;

const W = cv.width, H = cv.height;
setSize(W, H);
window.DUR = DUR;
window.TEXTS = textsAt;

window.render = t => {
  t = Math.min(Math.max(0, t), DUR - 1e-4);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  drawScene(g, t);
};

window.render(12.0);
window.READY = true;
