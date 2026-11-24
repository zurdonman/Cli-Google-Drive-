# SALF 29N CASTELLÓN — cartoon práctico de 120 s

Corto de **dos minutos exactos** para apoderados de SALF el 29N en Castellón: qué hacer, qué decir y qué
pulsar en el móvil. Dibujo plano 2D con la paleta SALF, voz en off española y diálogos con bocadillo.
Todo —imagen, voz, música y efectos— sale del código de esta carpeta.

- **Película 16:9:** [`salf-29n.mp4`](salf-29n.mp4) — 1920×1080, 24 fps, 120,0 s, AAC 48 kHz
- **Copia 9:16:** [`salf-29n-vertical.mp4`](salf-29n-vertical.mp4) — 1080×1920, composición propia (banda, escena, tarjetas y subtítulo), no un recorte
- **Subtítulos:** [`salf-29n.es.srt`](salf-29n.es.srt) y quemados en el plano
- **Audio:** [`out/narracion.wav`](out) (voz sola) y [`out/mix.wav`](out) (voz + música + efectos)
- **Encargo original:** [`PROMPT.md`](PROMPT.md)

## De qué va

0:00 **Intro.** 24 pines caen uno a uno sobre Castellón (CASU02 en azul, CASU03 en naranja) con un *pop*
cada uno; el mapa se acerca y aparecen **Brian** y **Eugenio**.

0:12 **La misión en cuatro horas.** Cuatro relojes que se encienden con su *ding*: 08:00 constitución y
foto, 14:00 avance 1, 18:00 avance 2, 20:00 escrutinio y acta **antes de las 21:00**; el sello
«TODO POR SCRUTINIA» cierra el bloque.

0:28 **La app en veinte segundos.** Móvil gigante con **SALF Rutas v4**: GPS con estela, pin de CERVANTES,
los cuatro estados (rojo libre, verde cubierto, amarillo patrullaje, morado incidencia), nota, foto de la
urna, «Imprimir log», la carpeta `salf-rutas/2026-11-29` y el envío a WhatsApp de Brian.

0:44 **Caso 1 · no me dejan entrar.** Los cuatro pasos numerados; acreditación y DNI en primer plano; la
frase exacta del **art. 79 LOREG** en bocadillo del apoderado; el «no puede pasar» del presidente; foto de
la puerta, **incidencia morada** y WhatsApp a Brian, que escala a Eugenio y a jurídica. Incluye la **mesa
sin constituir a las 9:00**.

1:09 **Caso 2 · papeletas, propaganda y luz.** Faltan papeletas de SALF (pídelas y documenta), propaganda a
menos de diez metros (medida con pasos), corte de luz, **urna rota** y **compañero ausente**: cubres el
hueco y avisas.

1:27 **Caso 3 · el acta no cuadra.** Recuento voto a voto, foto nítida del acta antes de doblarla, sello
**NO CONFORMES** y protesta al pie, envío por Scrutinia antes de las 21:00.

1:44 **Cierre.** La mochila (acreditación, DNI, boli, móvil con powerbank, agua, la guía impresa), los 24
colegios en rejilla con 7 en verde y **FALTAN 22** en rojo, el puño de Brian y Eugenio y el cartel
**«¡EL 29N LO DEFENDEMOS JUNTOS! SALF»**.

## Datos del encargo, tal cual

| Dato | Valor |
|---|---|
| Zona | CASU02 + CASU03 Castellón · subinspector **Brian**, inspector **Eugenio** |
| Colegios y mesas | **24 colegios = 12 CASU02 (50 mesas, 15 plazas) + 12 CASU03 (62 mesas, 16 plazas) = 112 mesas, 31 plazas** |
| Apoderados | 10 solicitudes → 9 aprobadas (rechazada Delia, EJÉRCITO) · **7 de 24 colegios cubiertos** · **faltan 22 plazas** |
| Mínimo de apoderados | 25 |
| Frase legal | «Soy apoderado SALF, artículo 79 LOREG, tengo derecho a estar sin interferir.» |
| App | SALF Rutas v4 · log en `salf-rutas/YYYY-MM-DD/log-HHMMSS.txt` (Documents + Download) |

No hay fotos reales, ni nombres de personas fuera del reparto del encargo, ni correos o teléfonos.

## Cómo se hizo

| Pieza | Cómo |
|---|---|
| Imagen | motor vectorial propio (`engine.js`, `cast.js`, `scenes*.js`): 1600×900 de escenario virtual, reencuadrado a 16:9 o a 9:16 con composición distinta |
| Voz | TTS es-ES por líneas (narrador, apoderado joven, presidente grave) → `voice/*.mp3` → `out/wav/` recortado y ecualizado; el presidente baja de tono con `rubberband` |
| Música | sintetizada en `score.py` a 120 BPM: bajo, pad, glockenspiel, plucks, percusión; **baja al 20 % mientras hay voz** (ducking) y vuelve sola |
| Efectos | 103 golpes de `story.js` → `out/events.json`: *pop* de pin, *click*, *ding* de WhatsApp, obturador, sello, rotura de urna |
| Render | `render.mjs` (navegador headless → ffmpeg, x264 veryfast) y `mux.sh` para pegar el audio |

## Rehacerlo

```sh
# desde /tmp/lemo (clon de lemo-opuscar) con ffmpeg y su .venv
cd films/salf-29n
node events.mjs                                  # golpes de imagen y voces → out/
.venv/bin/python score.py                        # música + efectos + mezcla → out/mix.wav
python3 srt.py                                   # subtítulos → salf-29n.es.srt
node render.mjs $PWD --size 1920x1080 --out /tmp/vt/h16.mp4      # máster horizontal
node render.mjs $PWD --size 1080x1920 --out /tmp/vt/v916.mp4     # copia vertical
sh /tmp/lemo/core/render/mux.sh /tmp/vt/h16.mp4 out/mix.wav salf-29n.mp4 24 0
```

## Fuentes (OFL)

No se versionan (`.gitignore`); en `fonts/` van las variantes latin de **Baloo 2** (texto y subtítulos),
**Bungee** (cifras y titulares) y **Nunito** (apoyo). Instaladas desde npm (`@fontsource/*`), que las sirve desde
[google/fonts](https://github.com/google/fonts); licencia OFL en `fonts/LICENSE`.
