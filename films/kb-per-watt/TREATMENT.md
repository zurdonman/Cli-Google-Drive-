# DIEZ — tratamiento (lo que se rodó)

Estilo: **Bauhaus Shapes** (`styles/bauhaus-shapes/STYLE.md`). Tema: la electricidad de los centros de
datos frente a la energía por tarea de IA. Idioma: español (subtítulos quemados y `.srt`), 42 s,
1920×1080 a 30 fps. Sin voz.

> Nota de proceso: la primera idea de este proyecto era otra —un punto que rueda 2015→2024 encogiéndose
> para dibujar la subida de «KB por vatio»— y se descartó al no encontrar fuente para ese 4,3×. Se
> conserva aquí porque el descarte es parte del trabajo: **ninguna cifra sin fuente** (ver `FACTS.md`).

## Referencias (gramática, no copia)

- **Se aprende:** de los pictogramas de Otl Aicher (Múnich 72), que una cantidad puede ser una forma a
  escala fija y que la retícula puede ser la misma toda la pieza; de *Powers of Ten* (Eames), que
  reencuadrar el mismo objeto es la forma más barata de contar una escala; de las portadas de la revista
  *Neue Grafik*, la idea de que el número *es* la composición y no va encima de ella.
- **No se toma:** los pictogramas reales de Aicher, la paleta de Múnich, la voz de los Eames, ningún
  cartel ni tipo de época. La paleta es la *Sorbet* del estilo (papel #F5E8E1, coral protagonista, azul
  campo, ámbar pivote, verde agua secundario, tinta #1F3340).

## Tres estructuras candidatas

1. **Un cuadrado que crece.** La eficiencia como un cuadrado de área = kWh por unidad de trabajo. Claro,
   pero plano: una idea y ningún giro.
2. **La misma barra, nueve veces.** Una barra por año, cada vez más corta. Es un gráfico de barras con
   otro traje; el estilo prohíbe ejes y marcas como decorado.
3. **Dos formas a la misma escala, y el número al final (elegida).** Un disco que crece (el consumo total)
   y un punto que se desploma (la energía por tarea), dibujados con **la misma escala de área** en tomas
   distintas, para que el choque se vea sin explicarlo; y un cierre que no es una frase sino una división
   hecha con las dos formas.

Elegida **3**: usa el movimiento nativo del estilo (punto → línea → plano), convierte las cifras en
geometría y tiene un giro real (de «cada vez menos» a «y aun así, el doble»).

## Logline y arco

*La IA es cada vez más eficiente por tarea, y aun así su factura eléctrica se dobla.*

- **Planteamiento (0–9,5 s):** una bola aterriza y dice 415. El mundo de 2024.
- **Desarrollo (9,5–30 s):** el anillo de 2025 y el contorno de 2030 hacen crecer la forma; luego un corte
  de compás abre la lente y el mismo año, cuatro veces, cada uno una décima parte del área del anterior.
- **Giro y cierre (30–42 s):** la tarea contraria (razonar, generar vídeo) es cien veces una consulta de
  texto; la última toma pone 415 y 945 juntos, a escala, y el resultado —×2,3— se lee en el propio dibujo.

## Escaleta

| s | golpe |
|---|---|
| 0,1 | la retícula se dibuja (2 líneas y 4 marcas de compás) |
| 1,2 | la bola cae y se aplasta una vez: **415 TWh** |
| 2,3 | el número sube a su ranura dentro de la forma; 2024 · 1,5 % del mundo |
| 4,4 | título **DIEZ** y línea de voz, sobre la retícula |
| 9,0 | se retira el texto de S1; el encuadre se sostiene |
| 10,6 | 2025: un anillo nuevo por fuera, **485 TWh** (+17 %) |
| 12,6 | 2030: **945 TWh** se dibuja como **contorno** (es una proyección, no un dato) |
| 19,0 | corte: la bola se queda como fantasma; compás y tangentes |
| 21,5 | la lente: 2024 → 2027, cada año ÷10 de área (radio ÷√10) |
| 22,2 | una columna de marcas: año y Wh, las cuatro, a la misma altura que sus discos |
| 29,0 | la tarea contraria: un punto y un disco de 100× el área |
| 34,0 | cierre: 415 y 945 a escala, el signo = armado con dos barras, **×2,3** |
| 37,4 | la ficha de datos (estilo y fuente) entra abajo a la izquierda; el dibujo se sostiene hasta el último fotograma |

## Cámara

Encuadre bloqueado en todos los tramos; el movimiento es de los objetos, no de la cámara. Hay una sola
deriva de cámara en toda la pieza (S1, unos píxeles, hacia el centro de la forma), y el cierre no se mueve:
la última imagen es un cartel y el film termina en el dibujo, no en un fundido. Regla que salió de los
errores: **el texto nunca viaja con la cámara**; si el encuadre se mueve, el texto ya se ha retirado
(`window.TEXTS` devuelve vacío en los tramos de transición).

## Cue map

120 bpm, compás = 2 s (bar = 2 s), Re mayor, pedal modal en el tramo de la lente. Instrumentos
sintetizados: marimba (corcheas), vibráfono (notas largas), glockenspiel (acentos), arpa (acordes en los
aterrizajes), bajo sintético (una nota por compás). Cada aterrizaje de forma = clac de madera + golpe
bajo; cada marca del compás = trazo de lápiz; cada anillo = nota de glock que baja una octava (la energía
que cae). Dos silencios: antes del corte de la lente y antes del cierre.

## Diseño de sonido

- **Cama:** ruido de sala muy bajo (paso bajo a 900 Hz, −48 dB) en todo el film salvo el primer segundo y
  medio, atenuado en el corte; los cortes no quedan secos.
- **Cola:** tres delays cortos (83/127/211 ms) haciendo de sala barata; nada de reverb de verdad.
- **Balance:** máster (mux.sh) a −14,0 LUFS integrados, −1,5 dBTP de pico real, LRA 3,4 LU. La mezcla
  antes de normalizar va a RMS −22,2 dBFS y pico 0,561 (sin recortes).

## Subtítulos y títulos

Español, 34 px, en el bloque de papel fijo de la esquina inferior derecha, con la barra coral en su borde
izquierdo (el diseño del estilo). Sin segunda línea: la pieza es en un solo idioma, así que la línea que
el demo pone en chino pasa a ser la línea española y la inglesa desaparece (`DIRECTOR.md` §1).

## Lo que no se pudo hacer aquí (y por qué)

- **Voz:** ni Kokoro (modelo de 350 MB en un GitHub Release) ni edge-tts (necesita red hacia Microsoft)
  funcionan en este entorno. El film está dirigido en silencio: cada golpe lo llevan la forma, el sonido
  y el subtítulo. Para ponerle voz, ejecutar el mismo proyecto donde `tts_zh.py` alcance la red, o grabar
  una y añadirla en `score.py`.
- **Muestras:** las librerías (VSCO 2 CE, VCSL, FreePats, ~1,1 GB) también están en Release assets
  bloqueados; la música es síntesis propia (`score.py`).
- **Tipografías:** se bajan de `github.com/google/fonts` a `films/kb-per-watt/fonts/` (Jost y Noto Sans
  SC, OFL); no se versionan.
