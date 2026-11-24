#!/usr/bin/env python3
"""subs.py — corta cada texto de voz en trozos de subtítulo, con tiempos reales del audio.

Lee out/<id>.wav (48 kHz mono) para saber cuánto dura cada frase y story.js para los textos.
Escribe out/subs.json  →  [[t0, t1, texto, quién], …]  que main.js inyecta en SUBS
Escribe salf-29n-v5.es.srt (mismo contenido).
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')


def story():
    js = ("import { VOICES, TEXT, WHO, DUR } from './story.js';"
          "console.log(JSON.stringify({v:VOICES,T:TEXT,W:WHO,D:DUR}));")
    r = subprocess.run(['node', '--input-type=module', '-e', js], cwd=HERE,
                       capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def dur_wav(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', path], capture_output=True, text=True)
    return float(r.stdout.strip())


def chunks(text, max_chars=84):
    """Corta por frases y, si una frase es larga, por comas; nunca parte una palabra."""
    phrases = re.split(r'(?<=[.!?])\s+', text.strip())
    out = []
    for p in phrases:
        if len(p) <= max_chars:
            out.append(p)
            continue
        parts, cur = [], ''
        for piece in re.split(r'(?<=[,;:])\s+', p):
            test = (cur + ' ' + piece).strip()
            if len(test) > max_chars and cur:
                parts.append(cur)
                cur = piece
            else:
                cur = test
        if cur:
            parts.append(cur)
        out.extend(parts)
    return out


def ts(x):
    ms = int(round(x * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def main():
    st = story()
    voices = st['v']
    subs = []
    missing = []
    for v in voices:
        p = os.path.join(OUT, v['id'] + '.wav')
        if not os.path.exists(p):
            missing.append(v['id'])
            continue
        d = dur_wav(p)
        text = st['T'][v['id']]
        parts = chunks(text)
        total = sum(len(c) for c in parts)
        t = v['at']
        for c in parts:
            share = len(c) / total
            d2 = d * share
            subs.append([round(t, 2), round(t + d2, 2), c, st['W'][v['id']]])
            t += d2
    subs.sort(key=lambda s: s[0])
    # sin solapes: si un subtítulo se pasa del siguiente, lo recortamos
    for i in range(len(subs) - 1):
        if subs[i][1] > subs[i + 1][0] - 0.02:
            subs[i][1] = max(subs[i][0] + 0.4, subs[i + 1][0] - 0.02)
    with open(os.path.join(OUT, 'subs.json'), 'w', encoding='utf-8') as f:
        json.dump([[a, b, t, w] for a, b, t, w in subs], f, ensure_ascii=False, indent=0)
    lines = []
    for i, (a, b, text, who) in enumerate(subs, 1):
        lines.append(f'{i}\n{ts(a)} --> {ts(b)}\n{text}\n')
    with open(os.path.join(HERE, 'salf-29n-v5.es.srt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'{len(subs)} subtítulos · faltan {len(missing)} voces' + (': ' + ', '.join(missing) if missing else ''))


if __name__ == '__main__':
    main()
