// events.mjs — vuelca los golpes de imagen de story.js a out/events.json y las voces a out/voices.json
import fs from 'fs'; import path from 'path';
import { EVENTS, VOICES, DUR } from './story.js';
const out = path.join(path.dirname(new URL(import.meta.url).pathname), 'out');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'events.json'), JSON.stringify(EVENTS.sort((a, b) => a.t - b.t), null, 1));
fs.writeFileSync(path.join(out, 'voices.json'), JSON.stringify(VOICES, null, 1));
console.log(`${EVENTS.length} golpes · ${VOICES.length} voces · ${DUR} s`);
