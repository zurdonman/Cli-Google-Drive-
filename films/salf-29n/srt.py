#!/usr/bin/env python3
"""srt.py — escribe el .srt desde los subtítulos de story.js (una sola fuente de verdad)."""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load_subs():
    # los subtítulos viven en story.js: se extraen ejecutándolo con node y volcando JSON
    js = ("import { SUBS } from './story.js';"
          "console.log(JSON.stringify(SUBS));")
    out = subprocess.run(['node', '--input-type=module', '-e', js], cwd=HERE,
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def ts(x):
    ms = int(round(x * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def main():
    subs = load_subs()
    name = sys.argv[1] if len(sys.argv) > 1 else 'salf-29n.es.srt'
    lines = []
    for i, (a, b, text, who) in enumerate(subs, 1):
        lines.append(f'{i}\n{ts(a)} --> {ts(b)}\n{text}\n')
    with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'{len(subs)} subtítulos → {name}')


if __name__ == '__main__':
    main()
