// render.mjs — renderizador propio para este corto.
// Uso: node render.mjs <filmDir> --size 1920x1080 --fps 24 --out file.mp4 [--q 20] [--from a --to b]
// Abre la página en un navegador headless (servida desde el clon de lemo), la recorre fotograma a fotograma
// y la manda a ffmpeg por tubería. Pensado para ser rápido en 2 núcleos: x264 veryfast.
import fs from 'fs'; import path from 'path'; import { spawn, execFileSync } from 'child_process';
import { openDemo, closeServer } from '/tmp/lemo/core/render/page.mjs';

const args = process.argv.slice(2);
const dir = args[0];
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [w, h] = (opt('--size', '1920x1080')).split('x').map(Number);
const FPS = +opt('--fps', 24);
const out = path.resolve(opt('--out', path.join(dir, 'out', 'video.mp4')));
const crf = opt('--q', '20');
fs.mkdirSync(path.dirname(out), { recursive: true });

const t0 = Date.now();
const { browser, page } = await openDemo(dir, { w, h });
const DUR = await page.evaluate(() => window.DUR);
const from = +opt('--from', 0), to = +opt('--to', DUR);
const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS);

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-g', '48', '-movflags', '+faststart', out],
  { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise(r => ff.on('close', r));
ff.stdin.on('error', () => {});
for (let f = f0; f < f1; f++) {
  await page.evaluate(t => window.render(t), f / FPS);
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if ((f - f0) % 120 === 0) console.log(`${f - f0}/${f1 - f0}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
const code = await done;
await browser.close(); closeServer();
console.log(code === 0 ? `ok ${out}  ${((Date.now() - t0) / 1000).toFixed(0)}s` : `ffmpeg code ${code}`);
process.exit(code === 0 ? 0 : 1);
