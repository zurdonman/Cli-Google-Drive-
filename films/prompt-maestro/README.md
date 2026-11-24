# PROMPT MAESTRO — «una superproducción de la nada»

Un corto de 68 s, en blanco y negro, hecho **enteramente con código** con el estilo
[**Rubber Hose**](../styles/rubber-hose/STYLE.md) de
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar): dibujo animado de los años treinta, tinta
sobre papel, ojos de tarta de manzana, guantes de cuatro dedos, línea que hierve y un proyector que
araña la copia.

- **Película:** [`prompt-maestro.mp4`](prompt-maestro.mp4) — 1920×1080, 24 fps, 68,0 s, −14,3 LUFS, pico −1,3 dBFS
- **Subtítulos:** [`prompt-maestro.es.srt`](prompt-maestro.es.srt) (y quemados en el plano)
- **Reparto:** **Iván** (el del mito) y **Zacarías** (el del maletín) · **Tratamiento:** [`TREATMENT.md`](TREATMENT.md)

## De qué va

Dos visionarios esperan en la puerta del cielo con un maletín y una estratagema: pedir **la subvención**
del pelotazo que todavía no existe. La subvención no llega; llega un teléfono que dice «no disponible».
Se abren ochenta y ocho puertas sin dinero, se sube a la nube (nadie sabe dónde está), y la nube contesta
en cifras —20 M, 80 M, 900 M— que sólo son un reflejo. El cierre no es el dinero: es la promesa.

Es un **esperpento**, no una parodia de nadie en concreto: los personajes, el guion y los chistes son
originales. El tono (chabacano, cutre, protagonista que se cree genio, gag físico, mucha verborrea y poca
vergüenza) se aprende de la comedia española de barrio; no se cita ni se copia ninguna obra.

## Cómo se hizo (y con qué)

Todo lo que se ve lo dibuja la página. No hay vídeo generado, ni metraje de archivo, ni imágenes de
terceros: 8 planos, un motor vectorial propio (`toon.js`), dos personajes construidos con primitivas
(`cast.js`), cinco decorados pintados proceduralmente (`stage.js`) y el grano de la copia (`reel.js`).

| Pieza | Sustituto usado |
|---|---|
| Navegador headless | `@sparticuz/chromium` por `PLAYWRIGHT_CHROME`, con las libs de NSS del propio paquete |
| ffmpeg / ffprobe | binario de `imageio-ffmpeg` (PyPI) y `ffprobe-static` de npm |
| Voz (Kokoro / edge-tts) | **no hay voz**: 14 cartelas de subtítulo y diseño sonoro |
| Muestras de instrumentos | **música sintetizada** en [`score.py`](score.py): ragtime de 1932 a 132 BPM (37 compases) con clarinete, metal con sordina, piano *stride*, tuba, banjo Karplus–Strong, escobillas y caja; más 95 efectos sacados de `events.json` |

### Rehacerlo

```sh
# desde la raíz de una copia de lemo-opuscar, con node 20+, ffmpeg y su .venv (numpy, scipy, soundfile)
cp -r films/prompt-maestro ./films/
node core/render/events.mjs films/prompt-maestro                    # eventos de sonido + DUR
node core/render/video.mjs  films/prompt-maestro --fps 24 --workers 3 --out films/prompt-maestro/out/video.mp4
.venv/bin/python films/prompt-maestro/score.py                      # música + efectos → out/mix.wav
sh core/render/mux.sh films/prompt-maestro/out/video.mp4 films/prompt-maestro/out/mix.wav \
   films/prompt-maestro/prompt-maestro.mp4 24 3
node core/render/readcheck.mjs films/prompt-maestro --step 0.08    # 0 si todo el texto se lee
```

Las fuentes no están en el repo (`.gitignore` excluye `films/*/fonts/`). Son seis OFL de Google Fonts,
bajadas de `github.com/google/fonts` con `gh api`:

| Archivo | Familia | Uso |
|---|---|---|
| `Anton-Regular.ttf` | Anton | titulares, cartelas de decorado, precintos |
| `EagleLake-Regular.ttf` | Eagle Lake | subtítulos y textos de época |
| `Limelight-Regular.ttf` | Limelight | datos de reparto y cierre |
| `Shrikhand-Regular.ttf` | Shrikhand | rótulos de mano |
| `ArchivoBlack-Regular.ttf` | Archivo Black | texto de los paneles |
| `IMFeENsc28P.ttf` | IM Fell English SC | copia impresa de la cartela final |

`index.html` las carga desde `fonts/`; sin ellas el film sigue dibujándose, con la fuente de respaldo.

## Contrato de página

Cumple el contrato de `core/README.md`: `window.DUR`, `window.render(t)` determinista, `window.READY`,
`window.EV` y `window.TEXTS(t)`; añade `window.SUBS` y `window.SUBBOX(t)`.

`render(t)` es puro: mismo `t`, mismos píxeles salvo el *boil* de línea (12 fps, a propósito) y el grano.

**Comprobado en este entorno:** `readcheck --step 0.1` con 10 textos en `OK` y 0 avisos; los 14
subtítulos caben en su ventana (≥ 1,5 s de coleta sobre 15 cps); el máster da −14,3 LUFS integrados, pico
−1,3 dBFS y LRA 4,7 LU; el render completo (1632 fotogramas) tarda ~285 s con tres workers.

## Estructura del código

| Archivo | Qué hace |
|---|---|
| `toon.js` | motor: pila afín, tinta de grosor constante en pantalla, *boil* a 12 fps, relleno plano con sombra dura recortada |
| `cast.js` | Iván y Zacarías (cuerpo, mitra, guantes, puro, maletín) y los atrezzos: maletín de dinero, ojo de tarta, lámina de la charla |
| `stage.js` | cinco decorados pintados una vez: portal, pasillo de oficinas, sala de juntas, cielo de papel, escenario del sobre |
| `reel.js` | la copia de 1933: ventana 4:3, bamboleo, parpadeo, rayas, polvo, viñeta |
| `graphics.js` | rótulos: cartela de título, cartelas de subtítulo, precintos, orlas |
| `story.js` | reloj del film: `DUR`, `SHOTS`, `K` (las claves del montaje), `SUBS` |
| `scenes.js` | los ocho planos y `EV` (eventos de sonido) |
| `main.js` | lienzo, bucle, `render(t)`, `TEXTS(t)`, `SUBBOX(t)` |
| `score.py` | partitura ragtime y efectos; escribe `out/mix.wav` |

## Créditos

- Dibujos, motor y movimiento: código original, estilo **Rubber Hose** de LemoLab (la librería
  lemo-opuscar no se redistribuye aquí).
- Tipografías: Anton, Eagle Lake, Limelight, Shrikhand, Archivo Black, IM Fell English SC — SIL OFL 1.1.
- Música y efectos: sintetizados para este film (ninguna muestra de terceros).
- Ninguna cifra, marca ni persona real aparece en el film: 20 M, 80 M y 900 M son el chiste.
