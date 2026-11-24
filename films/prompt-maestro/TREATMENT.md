# PROMPT MAESTRO — tratamiento (lo que se rodó)

Estilo: **Rubber Hose** (`styles/rubber-hose/STYLE.md`) — 1933, blanco y negro, tinta sobre papel.
Tema: el pelotazo de la IA contado por dos que no tienen nada. Idioma: español (subtítulos quemados y
`.srt`), 68 s, 1920×1080 a 24 fps. Sin voz.

> Nota de proceso: el primer montaje duraba 68 s con el mismo esqueleto pero sin los remates visuales
> (el gráfico de la charla se dibujaba fuera de su hoja, el sello caía sobre la cara de Zacarías, el
> telón subía en vez de abrirse). Se conserva la nota porque el trabajo fue, sobre todo, **mirar
> fotogramas y corregir**: cada plano se revisó en hojas de contacto antes de dar el render por bueno.

## Referencias (gramática, no copia)

- **Se aprende:** del dibujo de los años treinta que se pasaba por un proyector —cuerpos de goma,
  guantes, ojos de tarta de manzana, línea que vibra—, del gag físico que dura un plano entero, del
  cartelón que subraya lo que la escena ya dice (y por eso hace gracia), y del **esperpento**: tipos
  chabacanos, cutres y autoimportantes, retratados sin piedad y sin discurso.
- **No se toma:** ningún personaje, diálogo, gag ni fotograma de *Torrente* ni de ninguna otra película.
  Iván y Zacarías son invención propia; el tono es la lección, no el material.

## Tres estructuras candidatas

1. **Un pitch real, con sus diapositivas.** Claro, pero se convierte en una charla: alguien explica, y
   el film pierde el gag.
2. **Un día en la oficina.** Dos oficinistas, un café, la nada. Da atmósfera y ningún golpe.
3. **La subvención como viaje iniciático (elegida).** El film es literalmente el recorrido de la
   solicitud: portal → pasillo de puertas → sala de juntas → cielo → escenario del bonus. Cada decorado es
   una estación del trámite, y la escalada es siempre la misma broma contada con más cara.

## Los ocho planos

| # | Plano | t (s) | Qué pasa | Clave |
|---|---|---|---|---|
| A | Cartela de título | 0,00–4,60 | «PROMPT MAESTRO» cae letra a letra dentro de un cartón de cine; al final se levanta y **deja ver el portal** | `rollIn` `hop0` `rollOut` |
| B | Portal del cielo | 4,60–14,20 | Tres cartelas caen del techo: *Acceso al cielo*, *Facturación de milagros*, *Premios* — todas «NO DISPONIBLE». Iván predica, Zacarías pasa la gorra con la lámina del gráfico. Suena el teléfono del cielo. **Sello: NO SUBVENCIÓN** | `drop1` `slideOut` `stamp` |
| C | Pasillo | 14,20–23,40 | La fuga: Zacarías arrastra a Iván con correa; pasan seis placas (*PREMIO*, *GRACIAS*, *ADELANTO*), el maletín revienta en monedas, Iván trompa y derrapa | `run0` `doorsPass` `brief1` `leash` `tangle` `skid` |
| D | Sala de juntas | 23,40–36,20 | Iván presenta su lámina —cuatro barras que suben, una línea que se cae— sobre una pantalla de proyector; la hoja se **chamusca** por el borde inferior y echa humo; Zacarías cobra la ronda con el maletín | `chartIn` `char0` `moneyIn` `proof` `burn` |
| E | El cielo | 36,20–47,60 | Una isla de papel flota; **la nube** —ocho bolas con ojos entornados y boca— les contesta: los prompts caen dentro y salen cifras, **20 M · 80 M · 900 M**, una por burbuja. Cuerda de terciopelo: el cielo tiene *entrada* | `rise` `chair` `promptDrop` `numbers` `moneyIn` |
| F | Escenario del bonus | 47,60–58,00 | El telón se abre en dos hojas; un sobre gigante con lacre **BONUS**. Tres noticias: *¡+900 M!*, *¡SIN RIESGO!*, *¡OTRA RONDA!*. Los dos posan; flash; confeti | `curtain` `env` `news` `confetti` |
| G | Cartela F I N | 58,00–63,00 | «FIN — o el principio de la siguiente ronda» | `card2In` |
| H | Iris | 63,00–68,00 | Iris tirado por una mano enguantada; la imagen se rompe en bloques y se apaga; cartela final impresa | `iris0` `pixelize` `iris1` |

## El reloj

`BPM 132`, negra a `60/132 ≈ 0,4545 s`, compás de 4/4 = `1,818 s`; `bar(n)` da el tiempo del compás *n*.
La partitura (`score.py`) usa el mismo reloj: 37 compases, así que cada corte cae a compás.

## Lo que se descartó

- **Voz.** No hay TTS en este entorno. Se escribió el film para leerse: 14 cartelas con el narrador
  contando lo que la escena no dice, y un diseño sonoro que hace de intérprete (el timbre del teléfono,
  el *boing* de la correa, el soplete de la hoja, el *cha-ching* del bonus).
- **El número final.** Se tanteó cerrar con una cifra inventada y verificable; se descartó: un
  esperpento no se sostiene sobre un dato falso y un dato cierto mata el chiste. Los 900 M son mentira
  **dentro** del film, y se dice.
- **Un tercer personaje.** El subvencionador, con sombrero de copa y puro. Sobraba: el dinero ya habla
  en tres cartelas y en la nube.
