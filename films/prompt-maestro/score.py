"""PROMPT MAESTRO — banda sonora 1930s (síntesis propia, sin muestras).
Ragtime/stride de big band sintética en Re mayor, 132 BPM, 1 compás = 1.818 s, 37 compases = 67.3 s.
Lee events.json (efectos y golpes escritos por la página) y escribe out/mix.wav.
"""
import json, os, sys, re
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
N = int(68.0 * SR)
rng = np.random.default_rng(11)

def t_(d): return np.arange(int(round(d * SR))) / SR
def env_exp(d, tau): return np.exp(-t_(d) / tau)
def noise(d): return rng.standard_normal(int(round(d * SR)))
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def db(x): return 20 * np.log10(max(1e-9, abs(x)))

def add(buf, x, at, gain=1.0, pan=0.0):
    """add mono x into stereo buf at time at"""
    i = int(round(at * SR))
    if i >= len(buf): return
    j = min(len(buf), i + len(x))
    if j <= i: return
    seg = x[:j - i] * gain
    gl = np.sqrt(0.5 * (1 - pan)); gr = np.sqrt(0.5 * (1 + pan))
    buf[i:j, 0] += seg * gl
    buf[i:j, 1] += seg * gr

# ——— instruments ———
def band_hit(freq, dur, vel=.8, bright=1.0):
    t = t_(dur); x = np.zeros_like(t)
    for h, a in [(1, 1), (2, .5), (3, .32), (4, .2), (5, .12), (6, .08)]:
        x += a * np.sin(2 * np.pi * freq * h * t + rng.random() * 6) * np.exp(-t / (dur * (.10 + .06 * h / bright)))
    n = int(.012 * SR); x[:n] += hp(noise(.012), 3000) * .06
    return x * vel

def clarinet(freq, dur, vel=.7):
    t = t_(dur); x = np.sin(2 * np.pi * freq * t) + .25 * np.sin(4 * np.pi * freq * t) + .08 * np.sin(6 * np.pi * freq * t)
    vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t * 6)
    x = np.sin(2 * np.pi * np.cumsum(freq * vib) / SR) + .22 * np.sin(4 * np.pi * np.cumsum(freq * vib) / SR)
    e = np.minimum(1, t / .03) * np.exp(-np.maximum(0, t - dur * .55) / (dur * .22))
    return x * e * vel

def brass(freq, dur, vel=.8, mute=False):
    t = t_(dur)
    f = np.cumsum(freq * (1 + .004 * np.sin(2 * np.pi * 5.5 * t))) / SR
    x = np.sin(2 * np.pi * f) + .55 * np.sin(4 * np.pi * f) + .3 * np.sin(6 * np.pi * f) + .15 * np.sin(8 * np.pi * f)
    x = np.tanh(1.6 * x)
    if mute: x = bp(x, 300, 1400)
    e = np.minimum(1, t / .02) * np.exp(-np.maximum(0, t - dur * .5) / (dur * .2))
    return x * e * vel

def stride(freq, dur, vel=.85):
    """stride piano: low bass note + off-beat chord handled by the caller; this is one note"""
    t = t_(dur); x = np.zeros_like(t)
    for h, a, dk in [(1, 1, .5), (2, .45, .3), (3, .25, .2), (4, .12, .12), (5.05, .06, .08)]:
        x += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-t / (dur * dk))
    return x * vel

def tuba(freq, dur, vel=.9):
    t = t_(dur); x = np.sin(2 * np.pi * freq * t) + .35 * np.sin(4 * np.pi * freq * t) + .12 * np.sin(6 * np.pi * freq * t)
    x = np.tanh(1.3 * x); e = np.minimum(1, t / .02) * np.exp(-t / (dur * .55))
    return x * e * vel

def banjo(freq, dur, vel=.5):
    """Karplus-Strong pluck"""
    n = max(2, int(SR / freq)); buf = rng.standard_normal(n)
    out = np.zeros(int(dur * SR)); damp = .9965
    for i in range(len(out)):
        out[i] = buf[i % n]
        buf[i % n] = damp * .5 * (buf[i % n] + buf[(i + 1) % n])
    return out * vel

def snare(vel=.7, brush=True):
    d = .18 if brush else .1
    x = bp(noise(d), 1200, 6500) * env_exp(d, .05)
    x[:int(.004 * SR)] += noise(.004) * .4
    return x * vel

def kick(vel=.9):
    t = t_(.16); f = 90 * np.exp(-t / .05) + 48
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .07) * vel

def woodblock(freq=900, vel=.6):
    t = t_(.09)
    return (np.sin(2 * np.pi * freq * t) * .6 + np.sin(2 * np.pi * freq * 2.7 * t) * .3) * np.exp(-t / .02) * vel

def cymbal(vel=.5, d=.6):
    x = bp(noise(d), 4000, 12000) * env_exp(d, .16)
    return x * vel

def slide_whistle(f0, f1, dur, vel=.35):
    t = t_(dur); f = f0 * (f1 / f0) ** (t / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .02) * np.minimum(1, (dur - t) / .04)
    return x * vel

def boing(vel=.4, dur=.5):
    t = t_(dur); f = 220 * (1 + .5 * np.exp(-t / .06)) * (1 + .08 * np.sin(2 * np.pi * 14 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .18) * vel

def bell(freq=1200, dur=.9, vel=.4):
    t = t_(dur)
    return (np.sin(2 * np.pi * freq * t) + .5 * np.sin(2 * np.pi * freq * 2.76 * t) + .25 * np.sin(2 * np.pi * freq * 5.4 * t)) * np.exp(-t / .3) * vel

def splat(vel=.5):
    d = .3
    return lp(noise(d), 700) * env_exp(d, .07) * vel

def paper(vel=.4):
    d = .18
    return bp(noise(d), 1800, 7000) * env_exp(d, .035) * vel

def sparkle(vel=.35, d=.6):
    return bp(noise(d), 6000, 14000) * env_exp(d, .08) * vel

def whoosh(d=.5, vel=.4):
    x = noise(d); eg = np.minimum(1, t_(d) / (d * .4)) * np.exp(-np.maximum(0, t_(d) - d * .5) / (d * .25))
    return bp(x, 500, 4000) * eg * vel

# ——— harmony ———
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def hz(p): return 440.0 * 2 ** ((p - 69) / 12)
def pn(name):  # "D4" / "F#5" / "Bb2" → midi
    m = re.match(r'^([A-G][#b]?)(-?\d+)$', name)
    if not m: raise ValueError(f'nota mal escrita: {name!r}')
    pc, octv = m.group(1), int(m.group(2))
    v = 12 * (octv + 1) + NOTE[pc[0]] + (1 if pc[1:] == '#' else -1 if pc[1:] == 'b' else 0)
    return v

BEAT = 60 / 132
BAR = 4 * BEAT

# 37 bars: the roadmap of the film
CHORDS = []
def bars(a, b, names):
    for k in range(a, b):
        CHORDS.append(names[(k - a) % len(names)])
bars(0, 3, [('D', ['D', 'F#', 'A']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C#', 'E'])])
bars(3, 7, [('D', ['D', 'F#', 'A']), ('Bm', ['B', 'D', 'F#']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C#', 'E'])])
bars(7, 9, [('D', ['D', 'F#', 'A']), ('A7', ['A', 'C#', 'E', 'G'])])
bars(9, 12, [('G', ['G', 'B', 'D']), ('G#dim', ['G#', 'B', 'D']), ('D', ['D', 'F#', 'A'])] if True else [])
bars(12, 16, [('D', ['D', 'F#', 'A']), ('Bm', ['B', 'D', 'F#']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C#', 'E'])])
bars(16, 18, [('D', ['D', 'F#', 'A']), ('D7', ['D', 'F#', 'A', 'C'])])
bars(18, 21, [('G', ['G', 'B', 'D']), ('Bb', ['Bb', 'D', 'F']), ('D', ['D', 'F#', 'A'])])
bars(21, 24, [('A', ['A', 'C#', 'E']), ('A', ['A', 'C#', 'E']), ('D', ['D', 'F#', 'A'])])
bars(24, 29, [('D', ['D', 'F#', 'A']), ('Bm', ['B', 'D', 'F#']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C#', 'E']), ('D', ['D', 'F#', 'A'])])
bars(29, 32, [('G', ['G', 'B', 'D']), ('Em', ['E', 'G', 'B']), ('A7', ['A', 'C#', 'E', 'G'])])
bars(32, 35, [('D', ['D', 'F#', 'A']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C#', 'E'])])
bars(35, 37, [('D', ['D', 'F#', 'A']), ('D', ['D', 'F#', 'A'])])

music = np.zeros((N, 2))

def chord_notes(name_notes, octv=4):
    return [pn(n + str(octv)) for n in name_notes]

# ——— arrangement: sections follow the film ———
def section(a, b):  # [a,b) bars
    return a * BAR, b * BAR

def play_title(t0, t1):        # 0–3: title card: fanfare + stride piano, no drums yet
    for k, (name, notes) in enumerate(CHORDS[:3]):
        t = t0 + k * BAR
        for i, p in enumerate([pn(n + '3') for n in notes]):
            add(music, brass(hz(p), .5, .5, mute=(i == 0)), t + i * BEAT / 2, .32, -.3 + i * .3)
        add(music, tuba(hz(pn(notes[0] + '2')), .7, .8), t, .35)
        for i in range(4):
            add(music, stride(hz(pn(notes[i % 3] + '4')), .5, .6), t + i * BEAT, .3, .2)
    add(music, cymbal(.5, 1.2), t0, .5)
    add(music, bell(pn('D6') and hz(pn('D6')), 1.2, .3), t0 + .02, .3, .3)

def play_hall(t0, t1):         # 3–7: light, comic, banjo oom-pah
    for k in range(3, 7):
        name, notes = CHORDS[k]; t = t0 + (k - 3) * BAR
        add(music, tuba(hz(pn(notes[0] + '2')), .35, .85), t, .34)
        add(music, tuba(hz(pn(notes[0] + '3')), .3, .7), t + 2 * BEAT, .26)
        for i in range(4):
            add(music, banjo(hz(pn(notes[(i + 1) % 3] + '4')), .28, .5), t + (i + .5) * BEAT, .22, .25)
        add(music, stride(hz(pn(notes[0] + '4')), .3, .5), t + 2 * BEAT, .2)
        add(music, snare(.42), t + 1 * BEAT, .3, .1); add(music, snare(.42), t + 3 * BEAT, .32, .1)
        add(music, kick(.7), t, .3); add(music, kick(.5), t + 2.5 * BEAT, .2)

def play_corr(t0, t1):         # 7–12: the run: fast rag, snare on 2 and 4, clarinet on top
    for k in range(7, 12):
        name, notes = CHORDS[k]; t = t0 + (k - 7) * BAR
        for b in range(4):
            add(music, tuba(hz(pn(notes[0] + '2')), .22, .9), t + b * BEAT, .3)
            add(music, kick(.8), t + b * BEAT, .22)
        for b in [1, 3]:
            add(music, snare(.55, brush=False), t + b * BEAT, .34, .05)
            add(music, cymbal(.22, .3), t + b * BEAT, .18, -.2)
        for s in range(8):
            p = pn(notes[s % len(notes)] + '5') + (12 if s in (3, 5) else 0)
            add(music, clarinet(hz(p), BEAT * .45, .5), t + s * BEAT / 2, .16, .15)
            add(music, banjo(hz(pn(notes[0] + '3')), .12, .4), t + s * BEAT / 2, .12, -.3)
        add(music, stride(hz(pn(notes[1] + '4')), .3, .5), t, .16, .2)

def play_board(t0, t1):        # 12–18: the pitch: stride piano under the chart, slide whistles on the money
    for k in range(12, 18):
        name, notes = CHORDS[k]; t = t0 + (k - 12) * BAR
        add(music, tuba(hz(pn(notes[0] + '2')), .6, .8), t, .3)
        for b in range(4):
            add(music, stride(hz(pn(notes[b % 3] + '4')), .28, .62), t + (b + .5) * BEAT, .2, .3)
            add(music, banjo(hz(pn(notes[0] + '3')), .12, .35), t + (b + .5) * BEAT, .12, -.35)
        add(music, snare(.4), t + BEAT, .26); add(music, snare(.45), t + 3 * BEAT, .3)
        add(music, brass(hz(pn(notes[0] + '3')), .25, .45, mute=True), t + 1.5 * BEAT, .22, -.1)

def play_sky(t0, t1):          # 18–24: weightless: vibes/bell arpeggios, tuba pedal, no snare
    for k in range(18, 24):
        name, notes = CHORDS[k]; t = t0 + (k - 18) * BAR
        add(music, tuba(hz(pn(notes[0] + '2')), BAR * .95, .55), t, .22)
        for s in range(8):
            p = pn(notes[s % len(notes)] + '5') + (12 if s > 4 else 0)
            add(music, bell(hz(p), .8, .28), t + s * BEAT / 2, .13, .35 - s * .06)
        for b in [0, 2]:
            add(music, stride(hz(pn(notes[b % len(notes)] + '4')), .6, .45), t + b * BEAT, .14, -.2)
        if k % 2 == 0:
            add(music, woodblock(950, .3), t + 2 * BEAT, .12, -.3)

def play_bonus(t0, t1):        # 24–32: full band out-chorus + stop before the photo
    for k in range(24, 32):
        name, notes = CHORDS[k]; t = t0 + (k - 24) * BAR
        for i, p in enumerate([pn(n + '3') for n in notes]):
            add(music, brass(hz(p), BEAT * .9, .5), t + i * BEAT / 4, .24, -.25 + i * .2)
        add(music, tuba(hz(pn(notes[0] + '2')), .3, .9), t, .34)
        add(music, kick(.9), t, .28); add(music, kick(.45), t + 2 * BEAT, .16)
        add(music, snare(.6, brush=False), t + BEAT, .34); add(music, snare(.62, brush=False), t + 3 * BEAT, .36)
        for s in range(4):
            add(music, banjo(hz(pn(notes[s % len(notes)] + '4')), .12, .4), t + (s + .5) * BEAT, .11, .3)
        if k % 2 == 0: add(music, cymbal(.3, .8), t, .2, .3)

def play_end(t0, t1):          # 32–37: cadence, drums out, last chord rings
    for k in range(32, 37):
        name, notes = CHORDS[k]; t = t0 + (k - 32) * BAR
        for i, p in enumerate([pn(n + '3') for n in notes]):
            add(music, brass(hz(p), .6, .42, mute=True), t + i * BEAT / 2, .2, -.2 + i * .2)
        add(music, tuba(hz(pn(notes[0] + '2')), .8, .7), t, .26)
    # final ring
    t = 37 * BAR
    for p in [pn('D2'), pn('D4'), pn('F#4'), pn('A4'), pn('D5'), pn('F#5'), pn('A5')]:
        add(music, brass(hz(p), 3.2, .4), t, .16, (rng.random() - .5) * .6)
    add(music, cymbal(.45, 3.0), t, .4)
    add(music, bell(hz(pn('D6')), 3.0, .3), t + .05, .25, .3)

SECT = [(0, 3, play_title), (3, 7, play_hall), (7, 12, play_corr), (12, 18, play_board), (18, 24, play_sky), (24, 32, play_bonus), (32, 37, play_end)]
for a, b, fn in SECT: fn(a * BAR, b * BAR)

# ——— room: three delays, then a soft low-pass ———
def tail(x, delays=((.083, .18), (.127, .13), (.211, .08))):
    y = x.copy()
    for d, g in delays:
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
music = tail(music)
music = np.stack([lp(music[:, c], 7200) for c in range(2)], 1)
fade = int(.4 * SR); music[:fade] *= np.linspace(0, 1, fade)[:, None]
endf = int(1.8 * SR); music[-endf:] *= np.linspace(1, 0, endf)[:, None] ** 1.3

# ——— effects from the page ———
ev = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8'))
EVENTS = ev.get('ev', ev)
fx = np.zeros((N, 2))
for e in EVENTS:
    t = e['t']; ty = e['type']; pan = e.get('pan', 0)
    if ty == 'hop': add(fx, woodblock(760 + e['i'] * 70, .35), t, .35, -.5 + (e['i'] % 6) * .2)
    elif ty == 'shade': add(fx, whoosh(e.get('d', .8), .5), t, .6, 0)
    elif ty == 'doorOpen': add(fx, paper(.5), t, .5, -.2)
    elif ty == 'doorShut': add(fx, woodblock(420, .7), t, .55, .3); add(fx, splat(.3), t + .01, .25)
    elif ty == 'plip': add(fx, bell(1400 + rng.random() * 400, .25, .2), t, .35, pan)
    elif ty in ('stepThrone', 'stepShoe'): add(fx, woodblock(ty == 'stepShoe' and 620 or 900, .4), t, .5, .1)
    elif ty == 'whip': add(fx, whoosh(.18, .6), t, .7, .2); add(fx, paper(.3), t + .05, .4)
    elif ty == 'stamp': add(fx, splat(.7), t, .8, 0); add(fx, woodblock(300, .8), t, .4)
    elif ty == 'stepRun': add(fx, woodblock(700 + rng.random() * 300, .22), t, .3, rng.random() - .5)
    elif ty == 'doorWhoosh': add(fx, whoosh(.4, .35), t, .45, .4)
    elif ty == 'briefOpen': add(fx, paper(.6), t, .6, -.2); add(fx, woodblock(880, .5), t + .02, .4)
    elif ty == 'coins': add(fx, bell(2200, .35, .22), t, .3, .2); add(fx, bell(2600, .3, .2), t + .07, .22, .35)
    elif ty == 'leash': add(fx, boing(.4), t, .5, 0)
    elif ty == 'tangle': add(fx, boing(.5, .7), t, .6); add(fx, splat(.3), t + .1, .3)
    elif ty == 'skid': add(fx, whoosh(.7, .5), t, .6); add(fx, splat(.4), t + .3, .4)
    elif ty == 'paper': add(fx, paper(.5), t, .5, .2)
    elif ty == 'fwoosh': add(fx, whoosh(.5, .5), t, .6, -.2); add(fx, bp(noise(.6), 200, 900) * env_exp(.6, .2), t, .25)
    elif ty == 'coinRain': add(fx, bell(2400, .4, .22), t, .3, -.3); add(fx, bell(2800, .4, .2), t + .3, .3, .3)
    elif ty == 'burn': add(fx, bp(noise(1.2), 300, 2200) * env_exp(1.2, .4), t, .35)
    elif ty == 'whoosh': add(fx, whoosh(e.get('d', .8), .55), t, .6, 0)
    elif ty == 'creak': add(fx, bp(noise(.5), 400, 1200) * env_exp(.5, .12), t, .3)
    elif ty == 'chime': add(fx, bell(1600, 1.0, .35), t, .4, 0); add(fx, bell(2100, .8, .2), t + .04, .3, .2)
    elif ty == 'curtain': add(fx, whoosh(1.0, .5), t, .5, 0); add(fx, bp(noise(1.0), 200, 800) * env_exp(1.0, .3), t, .3)
    elif ty == 'envelope': add(fx, paper(.7), t, .6, 0); add(fx, woodblock(400, .6), t + .05, .4)
    elif ty == 'fanfare': 
        for i, p in enumerate([pn('D5'), pn('F#5'), pn('A5'), pn('D6')]):
            add(fx, brass(hz(p), .5, .7), t + i * .09, .45, -.3 + i * .2)
        add(fx, cymbal(.5, 1.4), t, .45)
    elif ty == 'confetti': add(fx, sparkle(.4, 2.4), t, .35, 0)
    elif ty == 'stamp2': add(fx, splat(.6), t, .6); add(fx, bell(900, .8, .25), t, .3)
    elif ty == 'irisShut': add(fx, whoosh(.6, .6), t, .5); add(fx, woodblock(300, .7), t + .1, .4)
    elif ty == 'tick': add(fx, woodblock(1200, .18), t, .3, pan)
    elif ty == 'slideWhistle': add(fx, slide_whistle(300, 900, .6, .3), t, .5, pan)

# ——— mix ———
peak = np.abs(music).max()
music = music / max(1e-6, peak) * .55
mx = np.abs(fx).max()
fx = fx / max(1e-6, mx) * .5
mix = music + fx
# gentle compression + limiter, hp to keep the rumble out
def compress(x, thr=.22, ratio=2.8, att=.004, rel=.12):
    env = np.zeros_like(x); a = np.exp(-1 / (att * SR)); r = np.exp(-1 / (rel * SR))
    e = 0
    for i in range(len(x)):
        v = abs(x[i]); e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        env[i] = e
    g = np.where(env > thr, (thr + (env - thr) / ratio) / np.maximum(env, 1e-9), 1)
    return x * g
mix = np.stack([compress(mix[:, c]) for c in range(2)], 1)
mix = np.clip(mix, -0.95, 0.95)
mix = np.stack([hp(mix[:, c], 30) for c in range(2)], 1)
out = os.path.join(HERE, 'out'); os.makedirs(out, exist_ok=True)
import soundfile as sf
sf.write(os.path.join(out, 'mix.wav'), mix.astype(np.float32), SR)
print(f'música lista: 37 compases · efectos: {len(EVENTS)} · RMS {db(np.sqrt((mix**2).mean())):.1f} dBFS · pico {np.abs(mix).max():.3f}')
