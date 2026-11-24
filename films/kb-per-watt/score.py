"""Música y sonido de DIEZ. Todo sintetizado con numpy (las librerías de muestras de Lemo están en GitHub
Releases, inalcanzables en este entorno): percusión afinada por aditiva, cuerdas pulsadas por Karplus-Strong,
graves por síntesis, y efectos creados a mano. 120 bpm, bar = 2 s, Re mayor con pedal modal en el tramo 3.

Escribe out/mix.wav (48 kHz, estéreo). Uso, desde la raíz de la librería:
  .venv/bin/python films/kb-per-watt/score.py
"""
import json, os, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

LIB = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, clack, whoosh, thump, pop, noise, env_exp

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, 'events.json')))
FULL = float(EV['dur']); EVENTS = EV['ev']; N = int(FULL * SR)
rng = np.random.default_rng(7)

def evs(kind): return [e for e in EVENTS if e['type'] == kind]
def t_(d): return np.arange(int(round(d * SR))) / SR
def norm(x, p=1.0):
    m = np.abs(x).max(); return x * (p / m) if m > 0 else x
def rms(x): return float(np.sqrt(np.mean(np.square(x)) + 1e-12))
def db(x): return 20 * np.log10(x + 1e-12)

# ---------- instrumentos sintetizados ----------
def struck(freq, dur, vel=0.8, partials=((1, 1.0, 1.0), (2.0, 0.28, 0.55), (3.01, 0.14, 0.38), (4.2, 0.07, 0.26)),
           attack=0.002, noise_amt=0.02):
    """marimba / vibráfono / glockenspiel: unos pocos parciales con decaimientos distintos"""
    t = t_(dur); x = np.zeros_like(t)
    for r, a, dk in partials:
        x += a * np.sin(2 * np.pi * freq * r * t + rng.random() * 6) * np.exp(-t / (dk * dur * 0.5))
    if noise_amt:
        n = int(attack * 6 * SR) + 1
        tr = hp(rng.standard_normal(n), 2500) * np.exp(-np.arange(n) / (attack * SR))
        x[:n] += tr * noise_amt
    return norm(x * np.minimum(1, np.arange(len(t)) / max(1, int(attack * SR))), 1.0) * vel

def plucked(freq, dur, vel=0.8, damp=0.996, bright=0.5):
    """Karplus–Strong: cuerda pulsada (arpa, kalimba grave, pizzicato sintético)"""
    n = max(2, int(SR / freq)); buf = rng.standard_normal(n)
    for _ in range(int(bright * 3)): buf = (buf + np.roll(buf, 1)) / 2
    T = int(dur * SR); out = np.zeros(T); idx = 0; prev = 0.0
    for i in range(T):
        cur = buf[idx]
        out[i] = cur
        buf[idx] = damp * (cur + prev) * 0.5
        prev = cur; idx = (idx + 1) % n
    return norm(out, 1.0) * vel

def bass(freq, dur, vel=0.8):
    """contrabajo sintético: seno + armónicos bajos, envolvente redonda"""
    t = t_(dur)
    env = np.minimum(1, t / 0.012) * np.exp(-t / (dur * 0.55))
    x = (np.sin(2 * np.pi * freq * t) + 0.34 * np.sin(4 * np.pi * freq * t) + 0.12 * np.sin(6 * np.pi * freq * t))
    return norm(x * env, 1.0) * vel

def glassy(freq, dur, vel=0.7):
    """acento brillante: parciales inarmónicos, como un glockenspiel alto"""
    return struck(freq, dur, vel, partials=((1, 1, 1.0), (2.76, 0.5, 0.6), (5.4, 0.25, 0.35), (8.9, 0.12, 0.2)), noise_amt=0.04)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def midi(name):
    import re
    m = re.fullmatch(r'([A-G]#?)(-?\d)', name); return 12 * (int(m.group(2)) + 1) + NOTE[m.group(1)]

# ---------- armonía: 120 bpm, un acorde por compás (2 s) ----------
CH = {  # bajo, voces
    'D':  (38, [62, 66, 69]), 'Bm': (35, [62, 66, 71]), 'G': (31, [62, 67, 71]),
    'A':  (33, [61, 64, 69]), 'Em': (40, [64, 67, 71]), 'F#m': (30, [61, 66, 69]),
}
BARS = ['D', 'D', 'Bm', 'G',      # S1  0–8     (lands, title)
        'A', 'D', 'Bm', 'A',      # S2  8–16    (crece)
        'G', 'Em', 'Bm', 'F#m',   # S3 16–24    (diez veces menos)
        'A', 'Em',                # S4 24–28    (la tarea contraria)
        'D', 'G', 'A', 'D', 'D']  # S5 28–38    (cierre)
LANDS = [e['t'] for e in evs('land')] + [e['t'] for e in evs('final')]

# ---------- efectos, dirigidos por los eventos de la imagen ----------
fx = np.zeros((N, 2))
for e in evs('grid'):                       # la plumilla recorre la retícula
    d = e['d']; n = int(d * SR); x = bp(rng.standard_normal(n), 2800, 7000, 2)
    env = np.sin(np.pi * np.arange(n) / n) ** 1.4 * (0.72 + 0.28 * np.sin(np.arange(n) / SR * 2 * np.pi * 9))
    add(fx, x * env * 0.028, e['t'], 1.0, e['pan'] * 0.8)
    add(fx, hp(click(pitch=1.4, v=1.0), 2500) * 0.03, e['t'], 1.0, e['pan'] * 0.8)
for e in evs('snap'):                       # el anillo se cierra
    add(fx, clack(pitch=0.5, v=1.0) * 0.22, e['t'], 1.0, e['pan']); add(fx, thump(v=1.0, f=90) * 0.34, e['t'], 1.0, e['pan'])
for e in evs('land'):                       # cada forma aterriza: madera + un golpe bajo
    add(fx, clack(pitch=0.62 if not e.get('small') else 0.9, v=1.0) * 0.20, e['t'], 1.0, e['pan'])
    add(fx, thump(v=1.0, f=120 if e.get('small') else 74) * (0.22 if e.get('small') else 0.4), e['t'], 1.0, e['pan'])
for i, e in enumerate(evs('ring')):          # la lente: cuatro marcas que suben
    add(fx, glassy(hz([74, 78, 81, 86][min(3, e['k'] - 1)]), 1.4, 0.30), e['t'], 1.0, e['pan'])
for e in evs('compass'):                    # el compás: un trazo de lápiz con aire
    d = e['d']; n = int(d * SR); x = bp(rng.standard_normal(n), 900, 4500, 2)
    env = np.minimum(1, np.arange(n) / (0.05 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.12 * SR))
    add(fx, x * env * 0.030, e['t'], 1.0, e['pan'])
    add(fx, click(pitch=2.0, v=1.0) * 0.05, e['t'] + d, 1.0, e['pan'])
for e in evs('lift'):                       # la pieza se levanta y viaja hasta la lente
    add(fx, lp(whoosh(0.55, 1.0), 2400) * 0.13, e['t'] + 0.05, 1.0, e['pan'])
for e in evs('block'):                      # la tipografía sube a su ranura
    add(fx, click(pitch=0.62, v=1.0) * 0.09, e['t'], 1.0, e['pan'])
for e in evs('slide'):
    add(fx, hp(whoosh(e['d'], 1.0), 800) * 0.045, e['t'], 1.0, e['pan'])
for e in evs('pop'):
    add(fx, pop(1.0) * 0.12, e['t'], 1.0, e['pan'])
for e in evs('tick'):
    add(fx, hp(clack(pitch=1.35, v=1.0), 1500) * 0.06, e['t'], 1.0, e['pan'])
for e in evs('accent'):
    add(fx, glassy(hz(86), 1.6, 0.22), e['t'], 1.0, e['pan'])
for e in evs('final'):
    add(fx, lp(thump(v=1.0, f=52), 900) * 0.55, e['t'], 1.0, 0.0)
    add(fx, glassy(hz(93), 2.4, 0.20), e['t'] + 0.05, 1.0, 0.2)

# ---------- partitura ----------
music_ev = []
def landing_near(t0, pad=0.35):
    return any(L - 0.1 <= t0 < L + 1.5 for L in LANDS)

for b, name in enumerate(BARS):
    t0 = b * 2.0
    if t0 >= FULL: break
    root, voices = CH[name]
    # bajo: negra con puntillo en cada compás, pulso suave
    music_ev.append((t0, 'bass', root, 0.9, 0.55, -0.05))
    if b % 2 == 1: music_ev.append((t0 + 1.0, 'bass', root + 7, 0.45, 0.32, -0.05))
    # arpegio de marimba en corcheas, con aire donde hay aterrizaje o lectura
    for i in range(8):
        t = t0 + i * 0.25
        if t >= FULL: continue
        if 16 <= t0 < 24 and i % 2: continue          # el tramo de la lente: más aire
        if landing_near(t) or (t0 < 6.0) or (b >= len(BARS) - 1): continue
        p = voices[[0, 2, 1, 2, 0, 2, 1, 2][i]] + (12 if i in (3, 7) else 0)
        music_ev.append((t, 'marimba', p, 0.34, 0.20 + 0.05 * (i % 2 == 0), 0.28))
    # vibráfono: notas largas al principio de cada compás impar
    if b % 2 == 0 and not landing_near(t0):
        music_ev.append((t0 + 0.02, 'vibes', voices[-1], 1.6, 0.24, -0.25))

# las cuatro marcas de la lente: una nota que baja de octava cada vez (la energía que cae)
for i, e in enumerate(sorted(evs('ring'), key=lambda z: z['t'])):
    if i < 4: music_ev.append((e['t'], 'glock', [81, 74, 69, 62][i], 1.2, 0.34, 0.35))
# acordes en los aterrizajes
KEYS = {'D': ('D', [50, 57, 62, 66, 69, 74]), 'Bm': ('Bm', [47, 54, 59, 62, 66, 71]),
        'G': ('G', [43, 50, 55, 59, 62, 67]), 'A': ('A', [45, 52, 57, 61, 64, 69]),
        'Em': ('Em', [40, 47, 52, 55, 59, 64]), 'F#m': ('F#m', [42, 49, 54, 57, 61, 66])}
for e in evs('land'):
    k = KEYS[e.get('key', 'D')][1]
    for i, p in enumerate(k[-3:]):
        music_ev.append((e['t'] + i * 0.02, 'harp', p, 1.9, 0.30 if e.get('small') else 0.40, -0.2 + i * 0.2))
    music_ev.append((e['t'], 'glock', k[-1] + 12, 1.3, 0.24, 0.3))
    music_ev.append((e['t'], 'bass', k[0] - 12, 1.1, 0.40, 0.0))
for e in evs('accent'):
    k = KEYS[e.get('key', 'D')][1]
    music_ev.append((e['t'], 'vibes', k[-2], 1.5, 0.26, -0.1)); music_ev.append((e['t'] + 0.02, 'glock', k[-1] + 12, 1.2, 0.22, 0.2))
for e in evs('final'):
    for i, p in enumerate([38, 50, 57, 62, 66, 69, 74]):
        music_ev.append((e['t'] + i * 0.03, 'harp', p, 2.4, 0.42, -0.3 + i * 0.1))
    for i, p in enumerate([86, 90, 93]):
        music_ev.append((e['t'] + 0.22 + 0.16 * i, 'glock', p, 1.5, 0.22, 0.3))

# ---------- render de la partitura ----------
music = np.zeros((N, 2))
INST = {
    'marimba': lambda f, d, v: struck(f, d, v, partials=((1, 1, 1.0), (4.0, 0.22, 0.32), (9.9, 0.05, 0.16)), noise_amt=0.02),
    'vibes':   lambda f, d, v: struck(f, d, v, partials=((1, 1, 1.0), (4.0, 0.10, 0.7), (2.0, 0.05, 0.8)), attack=0.004, noise_amt=0.0),
    'glock':   lambda f, d, v: glassy(f, d, v),
    'harp':    lambda f, d, v: plucked(f, min(d, 2.2), v, damp=0.9975, bright=0.65),
    'bass':    lambda f, d, v: bass(f, d, v),
}
for (t0, inst, p, d, v, pan) in sorted(music_ev, key=lambda z: z[0]):
    if t0 >= FULL + 1.0: continue
    x = INST[inst](hz(p), d, v)
    add(music, x, t0, 1.0, pan)
music = music[:N]
# cola de sala: reverberación barata (dos delays con caída) para que no suene a MIDI seco
def tail(x, delays=((0.083, 0.20), (0.127, 0.15), (0.211, 0.09))):
    y = x.copy()
    for d, g in delays:
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
music = tail(music)
# fundido de entrada y de salida, y un pedal de ruido de sala muy bajo en los tramos sin música
music[:int(0.35 * SR)] *= np.linspace(0, 1, int(0.35 * SR))[:, None]
endf = int(1.6 * SR); music[-endf:] *= np.linspace(1, 0, endf)[:, None] ** 1.4
room = lp(rng.standard_normal((N, 2)), 900) * 0.004
gate = np.ones(N); gate[:int(2 * SR)] = 0; gate[int(8.6 * SR):int(10.2 * SR)] = 0.35
music = music + room * gate[:, None]

# ---------- mezcla ----------
# el efecto va por delante; la música se aparta donde hay lectura o silencio
sfx_env = np.zeros(N)
for e in EVENTS:
    i = int(e['t'] * SR); j = min(N, i + int(0.4 * SR)); sfx_env[i:j] += 1
mix = music + fx
peak = np.abs(mix).max()
mix = mix * (0.72 / peak) if peak > 0 else mix
mix = np.stack([compress(mix[:, c], thr=0.20, ratio=2.6, att=0.004, rel=0.12) for c in range(2)], 1)
mix = np.stack([limit(mix[:, c], ceil=0.80) for c in range(2)], 1)
mix = np.stack([hp(mix[:, c], 32) for c in range(2)], 1)          # nada de retumbe por debajo de 32 Hz
out = os.path.join(HERE, 'out'); os.makedirs(out, exist_ok=True)
dst = os.path.join(out, 'mix.wav')
sf.write(dst, mix.astype(np.float32), SR)
print(f'música: {len(music_ev)} eventos · efectos: {len(EVENTS)} eventos · '
      f'RMS {db(rms(mix)):.1f} dBFS · pico {np.abs(mix).max():.3f} → {dst}')
