# SALF 29N · VÍDEO ÚNICO 7:32

Los dos vídeos del encargo, juntos en un solo archivo:

| tramo | contenido | duración |
|---|---|---|
| 00:00 – 02:00 | **Parte 1** · el corto práctico de 2:00 (2×2 colegios, la app, los tres casos, mochila y cierre) | 120,0 s |
| 02:00 – 02:02,5 | **Tarjeta «PARTE 2»** | 2,5 s |
| 02:02,5 – 07:32,5 | **Parte 2** · la guía completa V5 (constitución, votación, coordinación, caso 1, imprevistos, accesibilidad, escrutinio, sobres, 10 pasos) | 330,0 s |

## Archivos
- `salf-29n-completo.mp4` — 1920×1080, 452,5 s, H.264 + AAC 192 kbps
- `salf-29n-completo-vertical.mp4` — 1080×1920 (estados/reels), 452,5 s
- `salf-29n-completo.es.srt` — 102 subtítulos, ya desplazados 122,5 s los de la parte 2

## Cómo se montó
```
ffmpeg -f concat -safe 0 -i lista.txt -i mix_unida.wav -map 0:v -map 1:a \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart salf-29n-completo.mp4
```
Las dos mezclas (parte 1 y parte 2) se concatenan con 2,5 s de silencio en medio, así el audio
cuadra exactamente con los tres tramos de imagen.
