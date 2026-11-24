# SALF 29N · V5 FINAL · 5:30

Segundo vídeo del encargo: la versión larga de 5 minutos y medio (330 s), 10 bloques,
para el apoderado que se lo ve una vez por WhatsApp y sale sabiendo qué hacer de 08:00 a 21:00.

## Qué hay
- `story.js` — duración, bloques, textos de voz, golpes de sonido y tiempos internos.
- `scenesV5.js` — los diez planos (intro, constitución, votación, coordinación, caso 1, papeletas, accesibilidad, escrutinio, sobres, cierre).
- `scenes.js` — marco 16:9 / 9:16, rótulos, subtítulos quemados y tarjetas del vertical.
- `score.py` — música sintetizada (330 s), efectos y mezcla con ducking.
- `subs.py` — corta cada texto de voz en subtítulos con las duraciones reales y escribe `out/subs.json` + `.srt`.
- `render.mjs` — renderiza fotograma a fotograma a MP4 con ffmpeg.

## Rehacer
```
node events.mjs
/tmp/lemo/.venv/bin/python subs.py
/tmp/lemo/.venv/bin/python score.py
node render.mjs . --size 1920x1080 --fps 24 --q 20 --out /tmp/vt/v5-16.mp4
node render.mjs . --size 1080x1920 --fps 24 --q 21 --out /tmp/vt/v5-9.mp4
ffmpeg -y -i /tmp/vt/v5-16.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v libx264 -preset veryfast \
  -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart salf-29n-v5.mp4
```

## Datos que no se inventan
24 colegios = 12 CASU02 (50 mesas, 15 plazas) + 12 CASU03 (62 mesas, 16 plazas) = 112 mesas,
31 plazas libres, mínimo 25 apoderados. 9 solicitudes aprobadas cubren 7 de 24 (CERVANTES, SOLER I GODES ×2,
ANTONIO ARMELLES, EJÉRCITO, ESTEPAR, IVAJ, CARLES SALVADOR ×2) → faltan 22.
App SALF Rutas **opcional**; la coordinación es WhatsApp con Brian y Eugenio.
Base legal: Manual JEC 2026 (37 p.) e instrucciones de la Junta Electoral.
