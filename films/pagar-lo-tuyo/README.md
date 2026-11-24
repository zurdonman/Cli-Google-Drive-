# LAS CUENTAS CLARAS — «pagar lo tuyo no te hace tacaño»

Un corto de 78 s, en castellano, hecho **enteramente con código** con el estilo
[**midcentury-toon**](../styles/midcentury-toon/STYLE.md) de
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar): dibujo animado de mediados de siglo, papel
cálido y tinta, cels de color desregistrados que tiemblan a dos fotogramas, y un cartón de subtítulo por
escena.

- **Película:** [`pagar-lo-tuyo.mp4`](pagar-lo-tuyo.mp4) — 1920×1080, 24 fps, 78,0 s, −14,6 LUFS, pico −1,5 dBFS
- **Subtítulos:** [`pagar-lo-tuyo.es.srt`](pagar-lo-tuyo.es.srt) (y quemados en el plano)
- **Reparto:** **Luis** (el que presta), **Nuria** (la que debe) y **Paco** (el chiringuito) · **Tratamiento:** [`TREATMENT.md`](TREATMENT.md)

## De qué va

Dos amigos, un bar y un montón de papeles. Uno pagó la cena, el taxi y el cumpleaños; el otro dijo «te lo
pago el martes» y el martes se perdió. Al principio eran veinte euros; luego fueron una hoja con un total
que no cuadra (**145,39 €**), luego un sello que dice **DEUDA** y una cadena que se rompe. La bronca llega
y, cuando ya no queda nada que decir, la música se para en seco.

La regla de oro: **lo que se comparte, se paga en el momento.** Y el único plan sensato cuando las cuentas
se enredan es irse a Valencia: tren vía 7, chiringuito de Paco, tres cervezas, tres recibos de 10 € y
cada uno paga lo suyo. En el tren de vuelta nadie debe nada a nadie, y el cartel lo dice sin rodeos:
**pagar lo tuyo no te hace tacaño, te hace buen amigo.**

## Cómo se hizo (y con qué)

Todo lo que se ve lo dibuja la página. No hay vídeo generado, ni metraje de archivo, ni imágenes de
terceros: 11 planos de un motor vectorial propio (`engine.js`), tres personajes construidos con
primitivas (`cast.js`), 17 cartelas de subtítulo (`story.js`) y el grano de la copia (`engine.js`,
`paperFinish`).

| Pieza | Sustituto usado |
|---|---|
| Navegador headless | `@sparticuz/chromium` vía `PLAYWRIGHT_CHROME`, con las libs de NSS del propio paquete |
| ffmpeg / ffprobe | binario de `imageio-ffmpeg` (PyPI) y `ffprobe-static` de npm |
| Voz (Kokoro / edge-tts) | **no hay voz**: 17 cartelas de subtítulo y diseño sonoro (el estilo no pide narrador) |
| Muestras de instrumentos | **música sintetizada** en [`score.py`](score.py): combo de cool-jazz de 1958 a 128 BPM — vibráfono, flauta, trompeta con sordina, contrabajo pizzicato, escobillas, celesta, bongós y un tren de cercanías — más 72 efectos sacados de `events.json` |

**El silencio se usa como herramienta:** entre 30,9 s y 34,4 s (la bronca congelada, antes de la regla de
oro) la música se corta en seco y sólo queda el aire de la sala.

## Estructura

| # | Plano | Entrada | Qué pasa |
|---|---|---|---|
| 1 | Cartela: **LAS CUENTAS CLARAS** | 0,00 s | el título entra por bloques de palabra, a pulso de compás |
| 2 | Bar Manolo | 4,55 s | un café, dos amigos y ocho papeles que caen uno por pulso |
| 3 | La hoja | 12,20 s | cena, taxi, cumple, bici y «??»: el total que no cuadra, rodeado dos veces |
| 4 | El que presta y el que debe | 20,20 s | plano partido, `ME DEBES 145,39 €` / `TE LO PAGO EL MARTES`, sello **DEUDA** y cadena rota |
| 5 | La bronca | 27,60 s | gritos a contratiempo, los papeles despegan y todo se congela |
| 6 | Cartela: **REGLA DE ORO** | 34,40 s | «lo que se comparte, se paga en el momento» |
| 7 | Vía 7 | 39,40 s | **VALENCIA**, el tren llega, se abre la puerta y suben los tres |
| 8 | Chiringuito Paco | 47,20 s | tres cervezas, tres recibos idénticos y **A ESCOTE** |
| 9 | La última ronda | 55,00 s | luna, guirnalda, una pila de monedas por cabeza y el brindis |
| 10 | Tren de vuelta | 62,00 s | tres tick verdes sobre las cabezas; luego se duermen en los asientos |
| 11 | Cartel: **PAGAR LO TUYO** | 70,00 s | «no te hace tacaño / TE HACE BUEN AMIGO», iris de cierre |

`story.js` guarda el reloj (128 BPM, 1 compás = 1,875 s), los 11 planos, la tabla de claves `K` de todas
las animaciones y los 17 subtítulos; de ahí leen lo mismo la imagen, la música y el `.srt`.

## Rehacerlo

```sh
# desde la raíz de una copia de lemo-opuscar, con node 20+, ffmpeg 7+ y su .venv (numpy, scipy, soundfile)
node core/render/events.mjs films/pagar-lo-tuyo                 # 1. golpes de imagen → events.json
.venv/bin/python films/pagar-lo-tuyo/score.py                   # 2. música + efectos → out/mix.wav
node core/render/readcheck.mjs films/pagar-lo-tuyo --step 0.1    # 3. legibilidad de los 21 bloques de texto
node core/render/video.mjs films/pagar-lo-tuyo --fps 24 --workers 3 --out /tmp/vt/video.mp4
sh core/render/mux.sh /tmp/vt/video.mp4 films/pagar-lo-tuyo/out/mix.wav films/pagar-lo-tuyo/pagar-lo-tuyo.mp4 24 0
```

El paso de grano (`mux.sh`, último argumento) va a **0**: este estilo es vector plano y el ruido del
estilo de 1930 no le pega. Los fotogramas sueltos salen con `node core/render/still.mjs films/pagar-lo-tuyo
<t>… --out <dir>` y la hoja de contactos con `core/render/sheet.py`.

## Fuentes (OFL)

No se versionan (ver `.gitignore`); se descargan de [google/fonts](https://github.com/google/fonts):

| Rol | Familia | Fichero |
|---|---|---|
| Titulares | **Alfa Slab One** | `ofl/alfaslabone/AlfaSlabOne-Regular.ttf` |
| Texto | **Jost** (variable) | `ofl/jost/Jost[wght].ttf` |
| Kicker manuscrito | **Oleo Script Bold** | `ofl/oleoscript/OleoScript-Bold.ttf` |
| Cartel | **Limelight** | `ofl/limelight/Limelight-Regular.ttf` |

Las cuatro son SIL Open Font License 1.1. Oleo Script no trae `…` (U+2026): en él nunca se escriben puntos
suspensivos, se usan tres puntos o se pasa a Jost.

## Notas de producción

- **Se miró fotograma a fotograma.** La primera versión tenía el título pegado («LASCUENTASCLARAS»), el
  tren cruzando por delante de la gente, los recibos escondidos detrás de la sombrilla y el globo «¿Y LO
  MÍO?» tapando el subtítulo; todo eso se corrigió con hojas de contactos, no a ciegas.
- **El truco del tren:** el coche se dibuja **después** de la gente, así que los tres quedan detrás de la
  ventanilla; luego se abre la puerta y suben por delante.
- **El truco de la mesa:** los tres se dibujan primero y el tablero después, así que quedan sentados
  detrás y no flotando.
