// main.js — page contract: window.READY, window.render(t), window.DUR, window.EV, window.TEXTS(t)
import { textures } from './engine.js';
import { DUR, SUBS } from './story.js';
import { drawScene, textsAt, buildEvents, W, H } from './scenes.js';

const cv = document.getElementById('c'), g = cv.getContext('2d');

await Promise.all([
  '700 50px Oleo', '400 50px Oleo', '104px Slab', '600 40px Jost', '500 40px Jost', '400 30px Jost',
].map(f => document.fonts.load(f).catch(() => {})));
await document.fonts.ready;
textures();

window.DUR = DUR;
window.SUBS = SUBS;
window.EV = buildEvents();
window.TEXTS = textsAt;

window.render = t => {
  t = Math.min(Math.max(0, t), DUR - 1e-4);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  drawScene(g, t);
};

window.render(6.2);
window.READY = true;
