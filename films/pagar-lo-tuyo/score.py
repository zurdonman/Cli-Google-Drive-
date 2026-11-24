"""LAS CUENTAS CLARAS — banda sonora (síntesis propia, sin muestras).
Combo de cool-jazz de 1958: vibráfono, flauta, trompeta con sordina, contrabajo pizzicato,
escobillas, celesta, bongós y un tren de cercanías. 128 BPM, 4/4, 41 compases y medio = 78.0 s.
Fa mayor; la tensión se va a Re menor y la playa vuelve a Fa con la sexta.
Lee events.json (los golpes que escribe la página) y escribe out/mix.wav.
"""
import json, os, re
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
DUR = 78.0
N = int(round(DUR * SR))
rng = np.random.default_rng(58)

BPM = 128
BEAT = 60 / BPM
BAR = 4 * BEAT
SW = 0.60          # corcheas con swing: la parte débil cae al 60 %

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

# ——— notas ———
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def hz(p): return 440.0 * 2 ** ((p - 69) / 12)
def pn(name):
    m = re.match(r'^([A-G][#b]?)(-?\d+)$', name)
    if not m: raise ValueError(f'nota mal escrita: {name!r}')
    pc, octv = m.group(1), int(m.group(2))
    return 12 * (octv + 1) + NOTE[pc[0]] + (1 if pc[1:] == '#' else -1 if pc[1:] == 'b' else 0)

def T(bar, beat=0.0, swing=SW):
    """compás desde 0, pulso desde 0; los x.5 se enderezan al swing"""
    whole = np.floor(beat + 1e-9); frac = beat - whole
    if abs(frac - .5) < 1e-6: frac = swing
    return bar * BAR + (whole + frac) * BEAT

# ——— instrumentos ———
def vib(freq, dur, vel=.6, hard=False, trem=.25):
    t = t_(dur)
    x = np.zeros_like(t)
    for h, a, dk in [(1, 1, .55), (4.0, .22, .22), (9.9, .07, .10)]:
        x += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-t / (dur * dk))
    if hard: x[:int(.006 * SR)] += hp(noise(.006), 2500) * .12
    x *= (1 - trem * (.5 + .5 * np.sin(2 * np.pi * 5.1 * t)))
    return x * np.minimum(1, t / .004) * vel

def flute(freq, dur, vel=.5):
    t = t_(dur)
    vibf = freq * (1 + .0045 * np.sin(2 * np.pi * 5.4 * t) * np.minimum(1, t * 3))
    f = np.cumsum(vibf) / SR
    x = np.sin(2 * np.pi * f) + .30 * np.sin(4 * np.pi * f) + .07 * np.sin(6 * np.pi * f)
    breath = lp(noise(dur), 4200) * .05
    x = x + breath[:len(x)]
    e = np.minimum(1, t / .045) * np.minimum(1, (dur - t) / .05) * np.exp(-np.maximum(0, t - dur * .7) / (dur * .5))
    return x * e * vel

def trumpet(freq, dur, vel=.6, mute=True):
    t = t_(dur)
    f = np.cumsum(freq * (1 + .005 * np.sin(2 * np.pi * 5.0 * t) * np.minimum(1, t * 4))) / SR
    x = 0.0
    for k in range(1, 12):
        x = x + (1.0 / k) * np.sin(2 * np.pi * k * f)
    x = np.tanh(1.4 * x)
    if mute: x = bp(x, 320, 1900) * 1.6
    e = np.minimum(1, t / .03) * np.exp(-np.maximum(0, t - dur * .8) / (dur * .35))
    return x * e * vel

def pizz(freq, dur, vel=.7):
    """contrabajo pizzicato: pulso con cuerpo y un chasquido de dedo"""
    t = t_(dur)
    f = freq * (1 + .06 * np.exp(-t / .012))
    ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) + .45 * np.sin(4 * np.pi * ph) + .18 * np.sin(6 * np.pi * ph)
    x = np.tanh(1.2 * x)
    x[:int(.008 * SR)] += lp(noise(.008), 1800) * .25
    return x * np.exp(-t / (dur * .38)) * np.minimum(1, t / .004) * vel

def celesta(freq, dur, vel=.5):
    t = t_(dur)
    x = (np.sin(2 * np.pi * freq * t) + .5 * np.sin(2 * np.pi * freq * 2.0 * t)
         + .22 * np.sin(2 * np.pi * freq * 3.01 * t) + .1 * np.sin(2 * np.pi * freq * 4.2 * t))
    return x * np.exp(-t / (dur * .35)) * np.minimum(1, t / .003) * vel

def brush(vel=.5, d=.22):
    x = bp(noise(d), 1600, 9000)
    e = np.minimum(1, t_(d) / .012) * np.exp(-np.maximum(0, t_(d) - .02) / .06)
    return x * e * vel

def ride(vel=.35, d=.9):
    x = bp(noise(d), 5200, 13000) * env_exp(d, .22)
    ping = np.sin(2 * np.pi * 3120 * t_(d)) * np.exp(-t_(d) / .10)
    return (x * .9 + ping * .25) * vel

def kick(vel=.8):
    t = t_(.18); f = 92 * np.exp(-t / .045) + 46
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .075) * vel

def bongo(freq=300, vel=.6, d=.24):
    t = t_(d); f = freq * (1 + .35 * np.exp(-t / .02))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .055)
    x[:int(.004 * SR)] += hp(noise(.004), 1500) * .2
    return x * vel

def woodblock(freq=980, vel=.5):
    t = t_(.09)
    return (np.sin(2 * np.pi * freq * t) * .6 + np.sin(2 * np.pi * freq * 2.7 * t) * .3) * np.exp(-t / .02) * vel

def clink(vel=.4):
    d = .5
    x = celesta(2100, d, vel) * .8
    c = celesta(2840, d, vel * .6); x[:len(c)] += c
    return x

def bell(freq=1200, dur=.9, vel=.4):
    t = t_(dur)
    return (np.sin(2 * np.pi * freq * t) + .5 * np.sin(2 * np.pi * freq * 2.76 * t) + .25 * np.sin(2 * np.pi * freq * 5.4 * t)) * np.exp(-t / .3) * vel

def boing(vel=.4, d=.5):
    t = t_(d); f = 220 * (1 + .5 * np.exp(-t / .06)) * (1 + .08 * np.sin(2 * np.pi * 14 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .18) * vel

def paper(vel=.4):
    d = .18
    return bp(noise(d), 1800, 7000) * env_exp(d, .035) * vel

def whoosh(d=.5, vel=.4):
    eg = np.minimum(1, t_(d) / (d * .4)) * np.exp(-np.maximum(0, t_(d) - d * .5) / (d * .25))
    return bp(noise(d), 500, 4000) * eg * vel

def splat(vel=.5):
    d = .3
    return lp(noise(d), 700) * env_exp(d, .07) * vel

def thud(vel=.6):
    d = .35
    x = lp(noise(d), 300) * env_exp(d, .08) * .7
    k = kick(vel); x[:len(k)] += k * .8
    return x

def crack(vel=.5):
    d = .25
    return (hp(noise(d), 1800) * env_exp(d, .03) * .8 + bp(noise(d), 400, 1400) * env_exp(d, .06) * .5) * vel

def chug(vel=.5, d=.30):
    """el traqueteo del tren: soplo filtrado y un golpe de hierro"""
    t = t_(d)
    x = bp(noise(d), 220, 1600) * np.exp(-t / .05)
    x += np.sin(2 * np.pi * 78 * t) * np.exp(-t / .09) * .5
    return x * vel

def whistle(vel=.4, d=.7):
    t = t_(d)
    f1, f2 = 620, 780
    x = np.sin(2 * np.pi * f1 * t) * .6 + np.sin(2 * np.pi * f2 * t) * .4
    x = np.tanh(2 * x) * np.minimum(1, t / .06) * np.minimum(1, (d - t) / .15)
    return lp(x, 2600) * vel

def waveshit(vel=.35, d=1.6):
    t = t_(d)
    eg = np.minimum(1, t / (d * .45)) * np.exp(-np.maximum(0, t - d * .45) / (d * .35))
    return bp(noise(d), 180, 1500) * eg * vel

def cricket(vel=.3, d=.5):
    t = t_(d)
    chirp = np.sin(2 * np.pi * 4200 * t) * (np.sin(2 * np.pi * 22 * t) > .4)
    return lp(chirp, 6000) * env_exp(d, .3) * vel

def slide_whistle(f0, f1, dur, vel=.35):
    t = t_(dur); f = f0 * (f1 / f0) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .02) * np.minimum(1, (dur - t) / .04) * vel

# ——— armonía: 42 compases ———
CH = []
def bars(names, count):
    for k in range(count):
        CH.append(names[k % len(names)])
bars([('F6', ['F', 'A', 'C', 'D']), ('Bb6', ['Bb', 'D', 'F', 'G']), ('C7', ['C', 'E', 'G', 'Bb'])], 3)          # 0-2 cartela
bars([('F6', ['F', 'A', 'C', 'D']), ('Dm7', ['D', 'F', 'A', 'C']), ('Gm7', ['G', 'Bb', 'D', 'F']), ('C7', ['C', 'E', 'G', 'Bb'])], 4)  # 3-6 bar
bars([('Gm7', ['G', 'Bb', 'D', 'F']), ('C7', ['C', 'E', 'G', 'Bb']), ('Fmaj7', ['F', 'A', 'C', 'E']), ('D7', ['D', 'F#', 'A', 'C'])], 4)  # 7-10 hoja
bars([('Dm7', ['D', 'F', 'A', 'C']), ('Bb7', ['Bb', 'D', 'F', 'Ab']), ('Gm7', ['G', 'Bb', 'D', 'F']), ('A7', ['A', 'C#', 'E', 'G'])], 4)  # 11-14 deuda
bars([('Dm7', ['D', 'F', 'A', 'C']), ('Eb7', ['Eb', 'G', 'Bb', 'Db']), ('Dm7', ['D', 'F', 'A', 'C']), ('A7', ['A', 'C#', 'E', 'G'])], 4)  # 15-18 bronca
bars([('Bb6', ['Bb', 'D', 'F', 'G']), ('C7', ['C', 'E', 'G', 'Bb'])], 2)                                              # 19-20 regla
bars([('F6', ['F', 'A', 'C', 'D']), ('Bb6', ['Bb', 'D', 'F', 'G']), ('Gm7', ['G', 'Bb', 'D', 'F']), ('C7', ['C', 'E', 'G', 'Bb'])], 4)  # 21-24 tren
bars([('F6', ['F', 'A', 'C', 'D']), ('Dm7', ['D', 'F', 'A', 'C']), ('Bb6', ['Bb', 'D', 'F', 'G']), ('C7', ['C', 'E', 'G', 'Bb']), ('F6', ['F', 'A', 'C', 'D'])], 5)  # 25-29 playa
bars([('Am7', ['A', 'C', 'E', 'G']), ('Dm7', ['D', 'F', 'A', 'C']), ('Gm7', ['G', 'Bb', 'D', 'F']), ('C7', ['C', 'E', 'G', 'Bb'])], 4)  # 30-33 noche
bars([('Fmaj7', ['F', 'A', 'C', 'E']), ('Bb6', ['Bb', 'D', 'F', 'G']), ('Gm7', ['G', 'Bb', 'D', 'F']), ('C7', ['C', 'E', 'G', 'Bb']), ('F6', ['F', 'A', 'C', 'D'])], 5)  # 34-38 vuelta
bars([('Bb6', ['Bb', 'D', 'F', 'G']), ('C7', ['C', 'E', 'G', 'Bb']), ('F6', ['F', 'A', 'C', 'D']), ('F6', ['F', 'A', 'C', 'D'])], 4)  # 39-42 cartel

def chord(bar): return CH[min(bar, len(CH) - 1)]

music = np.zeros((N, 2))
SIL_A, SIL_B = 30.90, 34.40     # el silencio antes de la regla: la música se para en seco
START = 0.0                     # donde empieza la sección que se está escribiendo

def playing(t):
    return not (SIL_A - .01 <= t < SIL_B)

SECTION_GAIN = 1.0

def put(x, t, gain=1.0, pan=0.0):
    """t en tiempo local de la sección; se coloca en el tiempo de película"""
    tt = START + t
    if playing(tt): add(music, x, tt, gain * SECTION_GAIN, pan)

def at(local):
    """tiempo local de la sección → tiempo de película"""
    return START + local

# ——— secciones ———
def sec_card(n):
    """fanfarria de tres metales, vibráfono en arpegios, todo sobre un pedal de Fa"""
    put(kick(.9), 0, .5)
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        for i, nm in enumerate(notes[:3]):
            put(trumpet(hz(pn(nm + '4')), .5, .5), t0 + i * BEAT * .5, .45, -.3 + i * .3)
        put(pizz(hz(pn(notes[0] + '2')), .8, .8), t0, .42)
        for s in range(8):
            nm = notes[s % len(notes)]
            put(vib(hz(pn(nm + '5')) if s < 4 else hz(pn(nm + '6')), .9, .34), t0 + T(0, s * .5) - t0, .2, -.4 + s * .07)
    put(ride(.45, 1.6), 0, .4)
    put(bell(hz(pn('F6')), 1.6, .3), .02, .3, .3)

def sec_bar(n):
    """el bar de Manolo: contrabajo caminante, escobillas, flauta cómica; los papeles caen en el papel"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        # walking bass: raíz, quinta, sexta, aproximación
        line = [notes[0], notes[2], notes[3], notes[1]]
        for beat, nm in enumerate(line):
            octv = '2' if beat % 2 == 0 else '3'
            put(pizz(hz(pn(nm + octv)), .42, .8), t0 + T(0, beat) - t0, .40, 0)
        for beat in (1, 3):
            put(brush(.5), t0 + T(0, beat) - t0, .32, .15)
        for s in range(4):
            put(ride(.2, .4), t0 + T(0, s + .5) - t0, .13, -.25)
        # la flauta: una frase corta que se repite con variantes
        if k % 2 == 0:
            mot = [notes[1] + '5', notes[2] + '5', notes[3] + '5', notes[2] + '5']
        else:
            mot = [notes[2] + '5', notes[1] + '5', notes[0] + '5', notes[1] + '5']
        put(flute(hz(pn(mot[0])), BEAT * .9, .5), t0 + T(0, 0) - t0, .22, .25)
        put(flute(hz(pn(mot[1])), BEAT * .45, .42), t0 + T(0, 1.5) - t0, .18, .25)
        put(flute(hz(pn(mot[2])), BEAT * .45, .42), t0 + T(0, 2) - t0, .18, .25)
        put(flute(hz(pn(mot[3])), BEAT * 1.4, .5), t0 + T(0, 3) - t0, .20, .25)

def sec_nota(n):
    """la hoja que suma: celesta que cuenta, pizzicato seco, un reloj de madera"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        put(pizz(hz(pn(notes[0] + '2')), .5, .75), t0, .36)
        put(pizz(hz(pn(notes[2] + '2')), .4, .6), t0 + T(0, 2) - t0, .26)
        for s in range(8):
            nm = notes[s % len(notes)]
            put(celesta(hz(pn(nm + '5')) if s % 3 else hz(pn(nm + '6')), .55, .34), t0 + T(0, s * .5) - t0, .15, -.3 + (s % 4) * .2)
        for beat in range(4):
            put(woodblock(1250, .22), t0 + T(0, beat) - t0, .12, -.4)
        if k % 2 == 1: put(brush(.3), t0 + T(0, 3) - t0, .16, .2)

def sec_cara(n):
    """la deuda: vibráfono en trémolo, contrabajo grave, sin batería; el sello corta el aire"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        for i, nm in enumerate(notes):
            put(vib(hz(pn(nm + '4')), BAR * .95, .30, trem=.45), t0, .16, -.3 + i * .2)
        put(pizz(hz(pn(notes[0] + '1')), 1.2, .8), t0, .30)
        put(pizz(hz(pn(notes[0] + '2')), .9, .5), t0 + T(0, 2) - t0, .18)
    # la cadena que se rompe
    put(crack(.6), 25.4, .7)
    put(thud(.6), 25.42, .6)

def sec_bronca(n):
    """la bronca: bongós, metales con sordina a contratiempo, y de pronto nada"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        if START + t0 >= SIL_A: break
        for beat in range(4):
            put(bongo(300 if beat % 2 == 0 else 420, .5), t0 + T(0, beat) - t0, .30, -.15)
            if beat in (1, 3): put(bongo(520, .38), t0 + T(0, beat + .5) - t0, .2, .2)
        for i, nm in enumerate(notes[:3]):
            tt = t0 + T(0, i * 1.0 + .5) - t0
            if START + tt < SIL_A: put(trumpet(hz(pn(nm + '4')), BEAT * .35, .55), tt, .26, -.3 + i * .25)
        put(pizz(hz(pn(notes[0] + '2')), .3, .85), t0, .34)
        put(pizz(hz(pn(notes[0] + '2')), .3, .7), t0 + T(0, 2) - t0, .28)
    # el grito: un metal que sube
    for g in (0.6, 1.3, 2.0, 2.7):
        put(slide_whistle(280, 520, .35, .3), g, .45, .1)

def sec_silencio(a, b):
    """nada. solo el aire de la sala, muy bajo, para que se oiga el silencio"""
    t = t_(b - a)
    room = lp(noise(b - a), 420) * .012
    room *= np.minimum(1, t / .6) * np.minimum(1, (b - a - t) / .6)
    add(music, room, a, 1.0, 0)

def sec_regla(n):
    """la regla de oro: cadencia clara, celesta y flauta, y el acorde se abre"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        for i, nm in enumerate(notes):
            put(trumpet(hz(pn(nm + '4')), BEAT * .8, .48), t0 + i * BEAT * .25, .24, -.3 + i * .2)
        put(pizz(hz(pn(notes[0] + '2')), .6, .8), t0, .34)
        for s in range(4):
            put(celesta(hz(pn(notes[s % len(notes)] + '5')), .7, .34), t0 + T(0, s * .5) - t0, .18, .35)
        put(brush(.4), t0 + T(0, 1) - t0, .26); put(brush(.45), t0 + T(0, 3) - t0, .28)
    put(bell(hz(pn('C7')), 1.8, .3), n * BAR - BEAT * 1.2, .3, .2)

def sec_tren(n):
    """vía 7: ritmo de tren, flauta alegre, el silbato al llegar"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        for beat in range(8):
            put(chug(.30 + .12 * (beat % 2)), t0 + beat * BEAT * .5, .30, -.1 + .2 * (beat % 2))
        put(pizz(hz(pn(notes[0] + '2')), .3, .85), t0, .36)
        put(pizz(hz(pn(notes[2] + '2')), .3, .7), t0 + T(0, 2) - t0, .28)
        for s in range(4):
            nm = notes[s % len(notes)]
            put(flute(hz(pn(nm + '5')), BEAT * .4, .45), t0 + T(0, s * .5) - t0, .17, .25)
        if k % 2 == 0: put(ride(.25, .5), t0 + T(0, .5) - t0, .16, -.3)
    put(whistle(.45, 1.1), .5, .5, .2)
    put(whistle(.4, .9), n * BAR - 1.9, .42, .1)

def sec_playa(n):
    """el chiringuito: soleado, con bongós, vibráfono y un bajo que salta; las olas debajo"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        for beat in range(4):
            put(pizz(hz(pn(notes[beat % len(notes)] + '2')), .28, .8), t0 + T(0, beat) - t0, .34)
        for beat in (0, 1.5, 2.5, 3.5):
            put(bongo(360, .45), t0 + T(0, beat) - t0, .22, .2)
        for beat in (1, 3):
            put(brush(.42), t0 + T(0, beat) - t0, .26, .1)
        mel = [notes[2] + '5', notes[3] + '5', notes[1] + '5', notes[2] + '5', notes[0] + '5']
        for s, nm in enumerate(mel):
            put(vib(hz(pn(nm)), BEAT * .55, .36), t0 + T(0, s * .75) - t0, .18, .3)
        put(bell(hz(pn(notes[0] + '6')), 1.4, .2), t0, .12, -.35)
        put(vib(hz(pn(notes[0] + '4')), BAR * .95, .30, trem=.2), t0, .13, -.15)

def sec_noche(n):
    """la última ronda: lento y oscuro, trompeta con sordina, grillos, y el brindis"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        put(pizz(hz(pn(notes[0] + '2')), BAR * .9, .6), t0, .30)
        put(pizz(hz(pn(notes[2] + '2')), .8, .45), t0 + T(0, 2) - t0, .20)
        for i, nm in enumerate(notes[:3]):
            put(vib(hz(pn(nm + '4')), BAR * .8, .26, trem=.5), t0 + i * .03, .13, -.3 + i * .25)
        put(trumpet(hz(pn(notes[2] + '4')), BEAT * 1.2, .40), t0 + T(0, 2.5) - t0, .17, .25)
        if k % 2 == 0:
            put(brush(.2, .35), t0 + T(0, 3.5) - t0, .12, -.2)
            put(cricket(.12, .6), t0 + T(0, 1) - t0, .5, .4)
    put(clink(.5), 4.20, .55, .1)
    put(clink(.35), 4.32, .4, -.2)
    put(bell(hz(pn('A6')), 1.6, .22), 4.25, .22, .3)

def sec_vuelta(n):
    """el tren de vuelta: ritmo de tren más suave, flauta adormilada"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        for beat in range(8):
            put(chug(.16 + .08 * (beat % 2), .35), t0 + beat * BEAT * .5, .20, .1 - .2 * (beat % 2))
        put(pizz(hz(pn(notes[0] + '2')), .5, .6), t0, .26)
        if k % 2 == 0:
            put(flute(hz(pn(notes[2] + '5')), BEAT * 1.6, .34), t0 + T(0, .5) - t0, .15, .25)
            put(flute(hz(pn(notes[1] + '5')), BEAT * 1.2, .3), t0 + T(0, 2.5) - t0, .13, .25)
        put(vib(hz(pn(notes[3] + '4')), BAR * .7, .2, trem=.4), t0, .10, -.3)
    put(slide_whistle(700, 380, .7, .18), 4.20, .5, .2)

def sec_final(n):
    """el cartel: toda la banda, y el acorde final que se queda sonando"""
    for k in range(n):
        name, notes = chord(k); t0 = k * BAR
        if START + t0 > DUR - .4: break
        for i, nm in enumerate(notes[:3]):
            put(trumpet(hz(pn(nm + '4')), BEAT * .7, .5), t0 + i * BEAT * .25, .26, -.3 + i * .25)
        put(pizz(hz(pn(notes[0] + '2')), .3, .9), t0, .36)
        put(kick(.8), t0, .3)
        put(brush(.5), t0 + T(0, 1) - t0, .3)
        put(brush(.52), t0 + T(0, 3) - t0, .32)
        for s in range(4):
            put(vib(hz(pn(notes[s % len(notes)] + '5')), .8, .3), t0 + T(0, s * .5) - t0, .16, .3)
    t = min(4.2 * BAR, DUR - START - 3.0)
    for nm in ['F2', 'F3', 'A3', 'C4', 'D4', 'F4', 'A4', 'C5']:
        put(trumpet(hz(pn(nm)), 2.8, .34, mute=(nm[0] == 'F' and nm[-1] == '2')), t, .14, (rng.random() - .5) * .7)
    put(ride(.5, 2.6), t, .4, .2)
    put(bell(hz(pn('F6')), 2.6, .3), t + .04, .26, .3)
    put(pizz(hz(pn('F1')), 2.6, .7), t, .3)

# (inicio en la película, compases, ganancia de sección, función)
SECTS = [
    (0.00, 2.60, .92, sec_card),    # cartela
    (4.30, 4.10, 1.30, sec_bar),      # bar Manolo
    (12.20, 4.20, 1.55, sec_nota),   # la hoja
    (20.20, 4.00, 1.55, sec_cara),   # la deuda
    (27.60, 1.80, 1.15, sec_bronca), # la bronca (se corta en 30.9)
    (34.40, 2.70, 1.02, sec_regla),  # la regla
    (39.40, 4.15, 1.08, sec_tren),   # vía 7
    (47.20, 4.60, 1.30, sec_playa),  # chiringuito
    (55.00, 4.00, 1.10, sec_noche),  # última ronda
    (62.00, 4.00, 2.10, sec_vuelta), # tren de vuelta
    (70.00, 4.30, 1.25, sec_final),  # cartel
]
for start, nbars, gain, fn in SECTS:
    START = start
    SECTION_GAIN = gain
    fn(int(np.ceil(nbars)))
# fuera de las secciones, el buffer se reescala a la ganancia de la sección:
# (las secciones ya escriben directo en `music`, así que aquí solo se suaviza el silencio)
music *= 1.0
sec_silencio(SIL_A, SIL_B)

# ——— sala ———
def tail(x, delays=((.083, .18), (.127, .13), (.211, .08))):
    y = x.copy()
    for d, g in delays:
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
music = tail(music)
music = np.stack([lp(music[:, c], 7600) for c in range(2)], 1)
fade = int(.35 * SR); music[:fade] *= np.linspace(0, 1, fade)[:, None]
endf = int(2.0 * SR); music[-endf:] *= np.linspace(1, 0, endf)[:, None] ** 1.3

# ——— efectos que escribe la página ———
fx = np.zeros((N, 2))
try:
    ev = json.load(open(os.path.join(HERE, 'events.json'), encoding='utf-8'))
    EVENTS = ev.get('ev', ev)
except FileNotFoundError:
    EVENTS = []
    print('aviso: sin events.json; solo música')
for e in EVENTS:
    t = e['t']; ty = e['k']; pan = e.get('x', 0) * .6
    if ty == 'whoosh': add(fx, whoosh(.55, .5), t, .6, pan)
    elif ty == 'stab': add(fx, splat(.5), t, .55, pan); add(fx, bell(760, .5, .2), t, .3, pan)
    elif ty == 'bell': add(fx, bell(1500, 1.0, .3), t, .4, pan); add(fx, bell(2100, .8, .18), t + .04, .3, pan)
    elif ty == 'paper': add(fx, paper(.5), t, .5, pan)
    elif ty == 'step': add(fx, woodblock(380, .5), t, .45, pan); add(fx, splat(.2), t + .02, .2, pan)
    elif ty == 'tray': add(fx, clink(.35), t, .5, pan); add(fx, woodblock(520, .3), t, .3, pan)
    elif ty == 'boing': add(fx, boing(.45), t, .5, pan)
    elif ty == 'door': add(fx, bp(noise(.5), 400, 1600) * env_exp(.5, .12), t, .35, pan)
    elif ty == 'tick': add(fx, woodblock(1350, .3), t, .3, pan)
    elif ty == 'stamp': add(fx, splat(.6), t, .6, pan); add(fx, woodblock(300, .6), t, .35, pan)
    elif ty == 'thud': add(fx, thud(.5), t, .55, pan)
    elif ty == 'crack': add(fx, crack(.6), t, .6, pan)
    elif ty == 'shout':
        add(fx, trumpet(hz(pn('D4')), .22, .5), t, .35, pan)
        add(fx, trumpet(hz(pn('A3')), .2, .45), t + .01, .3, pan)
    elif ty == 'flutter': add(fx, paper(.7), t, .55, pan); add(fx, paper(.5), t + .1, .35, pan)
    elif ty == 'silence': add(fx, thud(.35), t, .4, 0)
    elif ty == 'whistle': add(fx, whistle(.4, 1.0), t, .5, pan)
    elif ty == 'train':
        for i in range(6): add(fx, chug(.35, .3), t + i * .16, .4, pan)
    elif ty == 'waves': add(fx, waveshit(.4, 2.2), t, .55, pan)
    elif ty == 'coin': add(fx, bell(2400, .4, .22), t, .3, pan); add(fx, bell(2900, .35, .18), t + .06, .25, pan)
    elif ty == 'chime': add(fx, bell(1600, 1.0, .3), t, .4, pan); add(fx, bell(2100, .8, .2), t + .04, .3, pan)
    elif ty == 'night': add(fx, cricket(.2, 1.2), t, .4, .4); add(fx, boing(.18, .8), t + .3, .4, -.3)
    elif ty == 'clink': add(fx, clink(.45), t, .55, pan); add(fx, clink(.3), t + .1, .4, -pan)
    elif ty == 'snooze': add(fx, slide_whistle(420, 260, .6, .2), t, .5, pan)

# ——— mezcla ———
peak = np.abs(music).max(); music = music / max(1e-6, peak) * .55
mx = np.abs(fx).max(); fx = fx / max(1e-6, mx) * .5
mix = music + fx

def compress(x, thr=.22, ratio=2.8, att=.004, rel=.12):
    env = np.zeros_like(x); a = np.exp(-1 / (att * SR)); r = np.exp(-1 / (rel * SR))
    e = 0.0
    for i in range(len(x)):
        v = abs(x[i])
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        env[i] = e
    g = np.where(env > thr, (thr + (env - thr) / ratio) / np.maximum(env, 1e-9), 1)
    return x * g

mix = np.stack([compress(mix[:, c]) for c in range(2)], 1)
mix = np.clip(mix, -0.95, 0.95)
mix = np.stack([hp(mix[:, c], 30) for c in range(2)], 1)
out = os.path.join(HERE, 'out'); os.makedirs(out, exist_ok=True)
import soundfile as sf
sf.write(os.path.join(out, 'mix.wav'), mix.astype(np.float32), SR)
print(f'banda sonora lista: 43 compases · efectos: {len(EVENTS)} · RMS {db(np.sqrt((mix**2).mean())):.1f} dBFS · pico {np.abs(mix).max():.3f}')
