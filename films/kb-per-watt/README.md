# DIEZ — «la eficiencia de la IA y su factura»

Un corto de 42 s hecho **enteramente con código** usando el estilo
[**Bauhaus Shapes**](../styles/bauhaus-shapes/STYLE.md) de
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar): círculos, anillos y reglas, sin degradados,
sin sombras, sin vídeo generado ni metraje de archivo. No se ha copiado el guion, los planos ni la
música del demo del estilo; solo sus invariantes y sus técnicas.

- **Película:** [`diez.mp4`](diez.mp4) — 1920×1080, 30 fps, 42 s, −14,0 LUFS, pico −1,5 dBTP
- **Subtítulos:** [`diez.es.srt`](diez.es.srt) (y quemados en el plano)
- **Ficha de datos:** [`FACTS.md`](FACTS.md) · **Tratamiento:** [`TREATMENT.md`](TREATMENT.md)

## De qué va

Los centros de datos gastaron **415 TWh** en 2024 y **485 TWh** en 2025 (+17 %); la AIE proyecta
**945 TWh** para 2030. Y, al mismo tiempo, **la energía por tarea de IA cae al menos un orden de
magnitud al año**. El film dibuja las dos cosas con la misma escala de **área = cantidad** y las deja
en la misma mesa: un círculo que crece hacia el doble y un punto que se desploma diez veces cada año,
hasta la tarea contraria (razonar, generar vídeo: cientos de veces una consulta de texto).

Cierre: `945 ÷ 415 ≈ 2,3`. Más eficientes, y aun así el doble de electricidad.

## Cómo se hizo (y con qué)

Aquí no había el entorno que pide Lemo al pie de la letra (sin Chromium, sin ffmpeg, sin acceso a los
GitHub Releases con el modelo de voz y las librerías de muestras). Todo lo que sigue se resolvió sin
tocar `core/` ni `styles/`:

| Pieza | Sustituto usado |
|---|---|
| Navegador headless | `@sparticuz/chromium` (headless shell) por `PLAYWRIGHT_CHROME`, con las libs de NSS del propio paquete |
| ffmpeg 9 | binario del wheel de PyPI `imageio-ffmpeg` (no se pudo bajar el estático de johnvansickle) |
| ffprobe (`mux.sh` lo exige aparte) | `ffprobe-static` de npm |
| Voz (Kokoro / edge-tts) | **no hay voz**: el film está dirigido en silencio, con subtítulos y diseño sonoro |
| Muestras de instrumentos (~1,1 GB) | **música sintetizada** en [`score.py`](score.py): percusión aditiva (marimba, vibráfono, glockenspiel), cuerdas pulsadas Karplus–Strong (arpa), bajo sintético y efectos |

### Rehacerlo

```sh
# desde la raíz de una copia de lemo-opuscar, con node 20+, ffmpeg 7+ y su .venv
cp -r films/kb-per-watt ./films/                                  # o donde esté esta carpeta
node core/render/events.mjs films/kb-per-watt                     # eventos de sonido + DUR
node core/render/video.mjs  films/kb-per-watt --fps 30 --workers 2 --out films/kb-per-watt/out/video.mp4
.venv/bin/python films/kb-per-watt/score.py                       # música + efectos → out/mix.wav
sh core/render/mux.sh films/kb-per-watt/out/video.mp4 films/kb-per-watt/out/mix.wav films/kb-per-watt/diez.mp4 30 1
node core/render/readcheck.mjs films/kb-per-watt                  # 0 si todo el texto se puede leer
```

Las fuentes (Jost y Noto Sans SC, OFL) no están en el repo: `index.html` las carga desde
`fonts/Jost-VF.ttf`. Se bajan de `github.com/google/fonts` (`ofl/jost`, `ofl/notosanssc`).

## Contrato de página

La página cumple el contrato de `core/README.md`: `window.DUR`, `window.render(t)` determinista,
`window.READY`, `window.EV` y `window.TEXTS(t)`. Añade `window.SUBS` y `window.SUBBOX(t)` para que el
bloque de subtítulos se pueda comprobar contra el resto del texto.

**Comprobado en este entorno:** `readcheck` con 33 textos en `OK` y 0 avisos en muestras de 0,08 s;
0 colisiones texto/texto y 0 textos fuera de cuadro en 210 muestras de 0,2 s; máster a −14,0 LUFS
integrados con pico real −1,5 dBTP y LRA 3,4 LU. El render completo (1260 fotogramas) tarda ~105 s con
dos workers, y el montaje, unos segundos.

## Créditos

- Formas, tipografía y movimiento: código propio, estilo **Bauhaus Shapes** de LemoLab (librería
  lemo-opuscar, no se redistribuye aquí).
- Datos: **AIE**, *Energy and AI* (abril 2025) y *Key Questions on Energy and AI* (abril 2026),
  licencia CC BY 4.0 — ver [`FACTS.md`](FACTS.md).
- Tipografías: **Jost** (The Jost Project Authors) y **Noto Sans SC** (Google/Adobe), SIL OFL 1.1.
- Música y efectos: sintetizados para este film (ninguna muestra de terceros).
