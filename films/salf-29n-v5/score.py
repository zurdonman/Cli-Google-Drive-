#!/usr/bin/env python3
"""score.py — banda sonora, efectos y mezcla del corto SALF 29N.

Lee out/wav/<voz>.wav (TTS ya normalizado), out/events.json (golpes de imagen) y escribe:
  out/narracion.wav  la voz sola, a nivel de entrega
  out/mix.wav        voz al 100 %, música al 20 % por debajo (con ducking) y efectos

Música sintetizada aquí mismo: nada de samples, todo senos, sierras y ruido filtrado.
"""
import json, os, re
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
DUR = 330.0
N = int(round(DUR * SR))
rng = np.random.default_rng(29)

# ——— utilidades ———
def t_(d): return np.arange(int(round(d * SR))) / SR
def env_exp(d, tau): return np.exp(-t_(d) / tau)
def noise(d): return rng.standard_normal(int(round(d * SR)))
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def db(x): return 20 * np.log10(max(1e-9, abs(x)))

def add(buf, x, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= len(buf): return
    j = min(len(buf), i + len(x))
    if j <= i: return
    seg = x[:j - i] * gain
    gl = np.sqrt(0.5 * (1 - pan)); gr = np.sqrt(0.5 * (1 + pan))
    buf[i:j, 0] += seg * gl
    buf[i:j, 1] += seg * gr

NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def hz(p): return 440.0 * 2 ** ((p - 69) / 12)
def pn(name):
    m = re.match(r'^([A-G][#b]?)(-?\d+)$', name)
    if not m: raise ValueError(name)
    return 12 * (int(m.group(2)) + 1) + NOTE[m.group(1)[0]] + (1 if m.group(1)[1:] == '#' else 0)

# ——— instrumentos ———
def pluck(freq, dur, vel=.6, bright=.5):
    t = t_(dur)
    x = np.zeros_like(t)
    for k in range(1, 9):
        a = (1 / k) * np.exp(-k * (1.05 - bright * .6))
        x += a * np.sin(2 * np.pi * freq * k * t * (1 + .0007 * k * k))
    x = lp(x, 900 + 5200 * bright)
    e = np.minimum(1, t / .004) * np.exp(-t / (dur * .42))
    return x * e * vel

def bass(freq, dur, vel=.7):
    t = t_(dur)
    f = freq * (1 + .05 * np.exp(-t / .02))
    ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) + .32 * np.sin(4 * np.pi * ph) + .1 * np.sin(6 * np.pi * ph)
    x = np.tanh(1.3 * x)
    e = np.minimum(1, t / .008) * np.exp(-np.maximum(0, t - dur * .55) / (dur * .42))
    return x * e * vel

def glock(freq, dur=.9, vel=.4):
    t = t_(dur)
    x = (np.sin(2 * np.pi * freq * t) + .42 * np.sin(2 * np.pi * freq * 2.0 * t)
         + .18 * np.sin(2 * np.pi * freq * 3.02 * t) + .07 * np.sin(2 * np.pi * freq * 4.5 * t))
    return x * np.exp(-t / (dur * .3)) * np.minimum(1, t / .002) * vel

def pad(freq, dur, vel=.3):
    t = t_(dur)
    x = np.zeros_like(t)
    for det in (-.0035, 0, .0035):
        for k, a in ((1, 1), (2, .28), (3, .12)):
            x += a * np.sin(2 * np.pi * freq * k * (1 + det) * t)
    e = np.minimum(1, t / .18) * np.minimum(1, np.maximum(0, dur - t) / .22)
    return lp(x, 2600) * e * vel / 3

def kick(vel=.8):
    t = t_(.20); f = 96 * np.exp(-t / .04) + 44
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .09) * vel

def clap(vel=.5):
    d = .22
    x = bp(noise(d), 1100, 5200)
    e = np.exp(-t_(d) / .035) + .6 * np.exp(-np.maximum(0, t_(d) - .012) / .03)
    return x * e * vel * .7

def shaker(vel=.3):
    d = .11
    x = hp(noise(d), 5200)
    return x * env_exp(d, .028) * vel

def hat(vel=.25):
    d = .08
    return hp(noise(d), 8000) * env_exp(d, .018) * vel * .7

def tamb(vel=.35):
    d = .25
    x = bp(noise(d), 1800, 6500) * env_exp(d, .05)
    x += np.sin(2 * np.pi * 190 * t_(d)) * env_exp(d, .06) * .25
    return x * vel

def whoosh(d=.5, vel=.35):
    x = bp(noise(d), 400, 4500)
    e = np.minimum(1, t_(d) / (d * .45)) * np.exp(-np.maximum(0, t_(d) - d * .45) / (d * .3))
    return x * e * vel

def riser(d=1.2, vel=.3):
    t = t_(d)
    f = 300 * (6 ** (t / d))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + bp(noise(d), 800, 9000) * .5
    return x * (t / d) ** 2 * vel

def popSnd(vel=.55):
    d = .12
    t = t_(d)
    f = 720 * (1 + .9 * np.exp(-t / .012))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .035) * vel

def clickSnd(vel=.45):
    d = .06
    return bp(noise(d), 1500, 6000) * env_exp(d, .008) * vel

def dingSnd(freq=1180, vel=.4):
    a = glock(freq, 1.5, vel) * .8
    b = glock(freq * 2.02, 1.1, vel * .35)
    a[:len(b)] += b
    return a

def shutter(vel=.5):
    d = .18
    x = bp(noise(d), 2400, 9500) * env_exp(d, .012)
    y = np.zeros(int(.18 * SR))
    x2 = bp(noise(.09), 1800, 7000) * env_exp(.09, .01)
    y[:len(x)] += x; y[int(.055 * SR):int(.055 * SR) + len(x2)] += x2
    return y * vel

def stamp(vel=.7):
    d = .4
    x = lp(noise(d), 420) * env_exp(d, .05) * .8
    k = kick(vel * .9); x[:len(k)] += k * .7
    x[:int(.02 * SR)] += bp(noise(.02), 900, 3000) * .3
    return x * vel

def thudSnd(vel=.55):
    d = .32
    x = lp(noise(d), 260) * env_exp(d, .06) * .7
    k = kick(vel * .8); x[:len(k)] += k * .9
    return x

def crackSnd(vel=.5):
    d = .3
    return (hp(noise(d), 2200) * env_exp(d, .025) * .8 + bp(noise(d), 500, 1600) * env_exp(d, .05) * .5) * vel

def tickSnd(vel=.32):
    d = .07
    return (bp(noise(d), 2200, 7000) * env_exp(d, .008) + np.sin(2 * np.pi * 1800 * t_(d)) * env_exp(d, .01) * .4) * vel

def chime(vel=.4):
    d = 1.6
    a = glock(1568, d, vel * .8) * .6
    b = glock(2093, d * .8, vel * .4) * .5
    a[:len(b)] += b
    return a

def fanfare(vel=.5):
    d = 1.4
    t = t_(d)
    out = np.zeros_like(t)
    for i, nm in enumerate(['C5', 'E5', 'G5', 'C6']):
        st = int(i * .09 * SR)
        f = hz(pn(nm))
        seg = (np.sin(2 * np.pi * f * t[:len(t) - st]) + .35 * np.sin(4 * np.pi * f * t[:len(t) - st])) * np.exp(-t[:len(t) - st] / .5)
        out[st:] += seg[:len(out) - st]
    return out * vel * .5

# ——— armonía ———
beat = .5                      # 120 BPM
bar = beat * 4
PROG = {
    'C':  ['C4', 'E4', 'G4', 'B4'],   'G':  ['B3', 'D4', 'G4', 'B4'],
    'Am': ['A3', 'C4', 'E4', 'G4'],   'F':  ['A3', 'C4', 'F4', 'A4'],
    'Em': ['E3', 'G3', 'B3', 'D4'],   'Dm': ['D4', 'F4', 'A4', 'C5'],
}
ROOT = {'C': 'C2', 'G': 'G2', 'Am': 'A2', 'F': 'F2', 'Em': 'E2', 'Dm': 'D2'}
music = np.zeros((N, 2))

SECS = [
    # (inicio, fin, acordes por compás, estilo)
    (0.0, 20.0, ['C', 'C', 'F', 'C', 'G', 'C', 'F', 'G', 'C', 'C'], 'intro'),
    (20.0, 55.0, ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'G', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C'], 'clock'),
    (55.0, 95.0, ['F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'C', 'C'], 'app'),
    (95.0, 125.0, ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'G', 'Am', 'F', 'C', 'G', 'C'], 'app'),
    (125.0, 175.0, ['Am', 'F', 'Dm', 'Em', 'Am', 'F', 'Dm', 'Em', 'Am', 'F', 'Dm', 'Em', 'Am', 'F', 'Dm', 'Em', 'Am', 'F', 'Em', 'Em', 'Am', 'F', 'Dm', 'Em', 'Am'], 'tense'),
    (175.0, 205.0, ['Dm', 'Em', 'F', 'G', 'Dm', 'Em', 'F', 'G', 'Dm', 'Em', 'F', 'G', 'Dm', 'Em', 'F'], 'drive'),
    (205.0, 235.0, ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'G', 'Am', 'F', 'C', 'G', 'C'], 'quick'),
    (235.0, 288.0, ['Am', 'Am', 'F', 'F', 'Dm', 'Dm', 'Em', 'Em', 'Am', 'F', 'Dm', 'Em', 'Am', 'F', 'Em', 'Em', 'Am', 'F', 'Dm', 'Em', 'Am', 'Am', 'F', 'F', 'Dm', 'Em'], 'serious'),
    (288.0, 310.0, ['C', 'F', 'G', 'C', 'F', 'G', 'C', 'F', 'G', 'C', 'C'], 'light'),
    (310.0, 330.0, ['F', 'G', 'C', 'C', 'C', 'F', 'G', 'C', 'C', 'C'], 'final'),
]

def section_style(start, end, chords, style, gain=1.0):
    nbars = int(np.ceil((end - start) / bar))
    for b in range(nbars):
        t0 = start + b * bar
        if t0 >= end: break
        ch = chords[b % len(chords)]
        notes = PROG[ch]
        root = pn(ROOT[ch])
        loud = 1.0 if style != 'tense' else .82
        # bajo en 1 y 3
        if style in ('intro', 'clock', 'app', 'quick', 'light', 'final', 'drive'):
            for k in (0, 2):
                add(music, bass(hz(root + 12) if style == 'final' else hz(root), beat * 1.7, .55 * loud), t0 + k * beat, gain * .5, 0)
        else:
            add(music, bass(hz(root), bar * .9, .45), t0, gain * .45, 0)
        # pad suave en los bloques lentos
        if style in ('intro', 'serious', 'tense', 'final'):
            for nm in notes[:3]:
                add(music, pad(hz(pn(nm)) / 2, bar * .98, .22 * loud), t0, gain * .5, 0)
        # arpegio / melodía
        if style == 'intro':
            pat = [0, 1, 2, 3, 2, 1, 2, 3]
            for i, ix in enumerate(pat):
                add(music, glock(hz(pn(notes[ix % 4]) + 12), .9, .26), t0 + i * beat * .5, gain * .5, np.sin(i) * .25)
        elif style == 'clock':
            for i in range(8):
                nm = notes[i % 4]
                add(music, pluck(hz(pn(nm)) * 2, .28, .3, .55), t0 + i * beat * .5, gain * .42, -.25 + .5 * (i % 2))
            add(music, tickSnd(.28), t0, gain * .5, .3); add(music, tickSnd(.22), t0 + beat, gain * .5, -.3)
        elif style == 'app':
            pat = [0, 2, 1, 3, 2, 0, 3, 1]
            for i in range(8):
                add(music, pluck(hz(pn(notes[pat[i]]) + 12), .26, .3, .7), t0 + i * beat * .5, gain * .45, np.sin(i * 1.7) * .3)
            add(music, clap(.42), t0 + beat, gain * .5, .1); add(music, clap(.42), t0 + 3 * beat, gain * .5, -.1)
            for i in range(4): add(music, shaker(.22), t0 + i * beat + beat * .5, gain * .5, .3)
        elif style == 'tense':
            for i in (0, 2):
                add(music, thudSnd(.3), t0 + i * beat, gain * .55, 0)
            add(music, pluck(hz(pn(notes[0])) * 2, .5, .26, .2), t0 + beat * 2, gain * .4, -.2)
            add(music, pluck(hz(pn(notes[1])) * 2, .5, .22, .2), t0 + beat * 3, gain * .35, .2)
        elif style == 'drive':
            for i in range(8):
                add(music, pluck(hz(pn(notes[i % 4])), .2, .28, .6), t0 + i * beat * .5, gain * .4, (i % 2) * .3 - .15)
            add(music, kick(.6), t0, gain * .5, 0); add(music, kick(.5), t0 + 2 * beat, gain * .5, 0)
            add(music, tamb(.3), t0 + 3 * beat, gain * .5, 0)
        elif style == 'quick':
            for i in range(4):
                add(music, pluck(hz(pn(notes[i]) + 12), .18, .26, .75), t0 + i * beat, gain * .42, (i - 1.5) * .2)
            add(music, kick(.55), t0 + 2 * beat, gain * .5, 0)
        elif style == 'serious':
            for i in range(4):
                add(music, tickSnd(.18), t0 + i * beat, gain * .5, .2 * (1 if i % 2 else -1))
            add(music, pluck(hz(pn(notes[0])) / 2, .9, .2, .25), t0 + beat * 2, gain * .35, 0)
        elif style == 'light':
            for i in range(8):
                add(music, glock(hz(pn(notes[i % 4]) + 12), .7, .24), t0 + i * beat * .5, gain * .5, (i % 2) * .4 - .2)
            for i in range(4): add(music, shaker(.2), t0 + i * beat + beat * .25, gain * .5, .25)
        elif style == 'final':
            for i in range(8):
                add(music, pluck(hz(pn(notes[i % 4]) + 12), .4, .3, .6), t0 + i * beat * .5, gain * .45, -.2 + (i % 4) * .13)
            add(music, kick(.7), t0, gain * .55, 0); add(music, clap(.5), t0 + 2 * beat, gain * .5, 0)
            add(music, tamb(.32), t0 + 3 * beat, gain * .5, .2)

for (a, b, ch, st) in SECS:
    section_style(a, b, ch, st)

# golpes de sección: whoosh/riser en los cortes
for cut in [20.0, 55.0, 95.0, 125.0, 175.0, 205.0, 235.0, 288.0, 310.0]:
    add(music, whoosh(.6, .22), cut - .35, .8, 0)
    add(music, riser(1.0, .12), cut - 1.0, .6, 0)

# ——— voz ———
voices = json.load(open(os.path.join(HERE, 'out', 'voices.json')))
speech = np.zeros((N, 2))
print('voces a montar:', [v['id'] for v in voices])
for v in voices:
    path = os.path.join(HERE, 'out', 'wavp', v.get('file', v['id']) + '.wav')
    if not os.path.exists(path):
        print(f"  {v['id']:4s} SIN AUDIO todavía — se omite")
        continue
    x, sr = sf.read(path)
    if sr != SR:
        raise SystemExit(f'{path} no está a {SR} Hz')
    if x.ndim > 1: x = x.mean(1)
    x = x / max(1e-9, np.abs(x).max()) * .92
    if 'src0' in v:                      # segmento: se recorta del TTS original (con su propia pausa)
        x = x[int(v['src0'] * SR):int(v['src1'] * SR)]
        x = np.concatenate([np.zeros(int(.02 * SR)), x])
        x[:int(.06 * SR)] *= np.linspace(0, 1, int(.06 * SR))
        x[-int(.06 * SR):] *= np.linspace(1, 0, int(.06 * SR))
    add(speech, x, v['at'], v.get('gain', 1.0), v.get('pan', 0.0))
    i0, i1 = int(v['at'] * SR), int((v['at'] + len(x) / SR) * SR)
    print(f"  {v['id']:4s} {v['at']:6.2f}s  len {len(x)/SR:5.2f}s  rms {20*np.log10(np.sqrt((x**2).mean())+1e-12):.1f} dB  en mezcla {20*np.log10(np.sqrt((speech[i0:i1]**2).mean())+1e-12):.1f} dB")

peak_sp = np.abs(speech).max()
speech = speech / max(1e-9, peak_sp) * .89

# ——— efectos ———
events = json.load(open(os.path.join(HERE, 'out', 'events.json')))
fx = np.zeros((N, 2))
for e in events:
    t, ty, pan = e['t'], e['ty'], e.get('pan', 0.0)
    v = e.get('v', 1.0)
    if ty == 'pop': add(fx, popSnd(.5 * v), t, .55, pan)
    elif ty == 'click': add(fx, clickSnd(.55 * v), t, .5, pan)
    elif ty == 'ding': add(fx, dingSnd(1180, .42 * v), t, .55, pan)
    elif ty == 'shutter': add(fx, shutter(.55 * v), t, .6, pan)
    elif ty == 'whoosh': add(fx, whoosh(.55, .28 * v), t, .5, pan)
    elif ty == 'thud': add(fx, thudSnd(.45 * v), t, .5, pan)
    elif ty == 'stamp': add(fx, stamp(.5 * v), t, .55, pan)
    elif ty == 'chime': add(fx, chime(.35 * v), t, .45, pan)
    elif ty == 'tick': add(fx, tickSnd(.3 * v), t, .45, pan)
    elif ty == 'crack': add(fx, crackSnd(.45 * v), t, .5, pan)
    elif ty == 'fanfare': add(fx, fanfare(.5 * v), t, .6, pan)

# ——— ducking: la música baja al 20 % mientras hay voz ———
env = np.abs(speech).max(1)
k_att = np.exp(-1 / (.05 * SR)); k_rel = np.exp(-1 / (.35 * SR))
sm = np.zeros_like(env); e = 0.0
for i in range(0, len(env), 8):     # submuestreo x8: suficiente para una envolvente
    v = env[i:i + 8].max() if i + 8 < len(env) else env[i]
    e = k_att * e + (1 - k_att) * v if v > e else k_rel * e + (1 - k_rel) * v
    sm[i:i + 8] = e
sm = np.clip(sm / .05, 0, 1)
duck = 1.0 - .8 * sm                   # 1 → 0.2 con voz

music_pk = np.abs(music).max()
music = music / max(1e-9, music_pk) * .5
music *= duck[:, None]

fx_pk = np.abs(fx).max() or 1
fx = fx / fx_pk * .42

mix = speech * 1.0 + music * .34 + fx * .9

def compress(x, thr=.2, ratio=2.6, att=.005, rel=.13):
    env2 = np.zeros_like(x); a = np.exp(-1 / (att * SR)); r = np.exp(-1 / (rel * SR)); e2 = 0.0
    for i in range(0, len(x), 4):
        v = np.abs(x[i:i + 4]).max() if i + 4 < len(x) else abs(x[i])
        e2 = a * e2 + (1 - a) * v if v > e2 else r * e2 + (1 - r) * v
        env2[i:i + 4] = e2
    g = np.where(env2 > thr, (thr + (env2 - thr) / ratio) / np.maximum(env2, 1e-9), 1)
    return x * g

mix = np.stack([compress(mix[:, c]) for c in range(2)], 1)
mix = np.stack([hp(mix[:, c], 28) for c in range(2)], 1)
mix = mix / max(1e-9, np.abs(mix).max()) * .94
mix = np.clip(mix, -.98, .98)

out = os.path.join(HERE, 'out'); os.makedirs(out, exist_ok=True)
sf.write(os.path.join(out, 'mix.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(out, 'narracion.wav'), speech.astype(np.float32), SR)
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)
print(f'mix: {DUR:.0f} s · voz {rms(speech):.1f} dBFS · mezcla {rms(mix):.1f} dBFS · pico {np.abs(mix).max():.3f} · eventos {len(events)}')
