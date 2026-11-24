// story.js — el reloj y el guion de SALF 29N. Un solo número manda: DUR = 120 s.
// Cada plano empieza donde acaba su voz, así que la imagen nunca va por delante del TTS.
//
//   BLOQUE              PLANOS                                   VOZ
//   0 · intro            0.10 » 10.9      mapa, pines, Brian         n1  10.43 s
//   1 · misión 4 h      11.2 » 26.5      cuatro relojes             n2  14.62 s
//   2 · la app          27.0 » 44.0      móvil gigante              n3  16.35 s
//   3 · caso 1          44.6 » 69.0      puerta del colegio         n4 4.77 + ap1 5.06 + pr1 2.90 + n5 8.97
//   4 · caso 2          69.6 » 86.6      papeletas, propaganda, luz n6 10.24
//   5 · caso 3          87.0 » 103.6     escrutinio y acta          n7 15.72
//   6 · cierre         104.0 » 120.0     mochila y «faltan 22»      n8 14.98

export const DUR = 120.0;
export const FPS = 24;

// ——— voces: fichero, dónde empieza en la película, aceleración (pitch/rate se aplican en score.py) ———
export const VOICES = [
  { id: 'n1',  at: 0.18,   file: 'n1',  who: 'narrador' },
  { id: 'n2',  at: 11.22,  file: 'n2',  who: 'narrador' },
  { id: 'n3',  at: 27.00,  file: 'n3',  who: 'narrador' },
  { id: 'n4',  at: 44.55,  file: 'n4',  who: 'narrador' },
  { id: 'ap1', at: 49.75,  file: 'ap1', who: 'apoderado' },
  { id: 'pr1', at: 55.20,  file: 'pr1', who: 'presidente' },
  { id: 'n5',  at: 58.45,  file: 'n5',  who: 'narrador' },
  // el caso 2 ocupa tres viñetas: el propio TTS se parte por sus pausas y cada frase cae en su viñeta
  { id: 'n6a', at: 69.55, file: 'n6', src0: 0.00, src1: 3.40, who: 'narrador' },
  { id: 'n6b', at: 73.95, file: 'n6', src0: 3.60, src1: 5.85, who: 'narrador' },
  // la frase de la luz: entra en 80.10 (viñeta 'corte de luz') y dura lo que dura el recorte
  { id: 'n6c', at: 80.10, file: 'n6', src0: 6.00, src1: 8.80, who: 'narrador' },
  { id: 'n7',  at: 85.30,  file: 'n7',  who: 'narrador' },
  { id: 'n8',  at: 104.15, file: 'n8',  who: 'narrador' },
];

// ——— planos: [entrada, salida, función de dibujo, rótulo interno] ———
export const SHOTS = [
  [0.00, 11.10, 'mapa', 'CASU02 + CASU03: 24 pines caen'],
  [11.10, 26.80, 'relojes', 'Las cuatro obligaciones del día'],
  [26.80, 44.30, 'app', 'SALF Rutas: del GPS al log en WhatsApp'],
  [44.30, 48.00, 'introCaso', 'CASO 1 · no me dejan entrar'],
  [48.00, 54.90, 'puerta', 'Acreditación y DNI, la frase del art. 79'],
  [54.90, 58.60, 'presi', 'El presidente dice que no'],
  [58.60, 68.90, 'escalado', 'Foto, incidencia, WhatsApp a Brian'],
  [68.90, 73.30, 'caso2a', 'Faltan papeletas'],
  [73.30, 77.40, 'caso2b', 'Propaganda a menos de 10 m'],
  [77.40, 84.60, 'caso2c', 'Luz, urna rota y compañero ausente'],
  [84.60, 103.80, 'acta', 'El acta no cuadra: no firmes conforme'],
  [103.80, 111.00, 'mochila', 'Qué llevar en la mochila'],
  [111.00, 120.00, 'cierre', 'Faltan 22 · ¡el 29N lo defendemos juntos!'],
];

// ——— subtítulos quemados y .srt: [t0, t1, texto, quién] ———
export const SUBS = [
  // intro · n1
  [0.30, 3.00, 'El 29N eres los ojos de SALF en Castellón.', 'n'],
  [3.20, 5.60, '24 colegios. 112 mesas.', 'n'],
  [5.85, 10.40, 'Con Brian y Eugenio, no estás solo.', 'n'],
  // misión · n2
  [11.30, 13.30, 'Solo hay 4 cosas obligatorias.', 'n'],
  [13.50, 17.40, 'A las 8, foto de la constitución.', 'n'],
  [17.60, 20.30, 'A las 14 y a las 18, reportas por WhatsApp.', 'n'],
  [20.50, 25.60, 'A las 20, foto del acta antes de las 21. Todo por Scrutinia.', 'n'],
  // app · n3
  [27.10, 29.30, 'Abre SALF Rutas y activa el GPS.', 'n'],
  [29.50, 33.40, 'Toca tu colegio: verde cubierto, rojo libre, morado incidencia.', 'n'],
  [33.60, 35.90, 'Deja una nota y haz la foto.', 'n'],
  [36.10, 39.30, 'Arriba, imprime el log y compártelo.', 'n'],
  [39.50, 43.10, 'Así Brian ve tu estado en directo.', 'n'],
  // caso 1 · n4 + apoderado + presidente + n5
  [44.70, 49.10, 'No grites. Enseña acreditación y DNI.', 'n'],
  [49.90, 54.60, '«Soy apoderado SALF, artículo 79 LOREG, tengo derecho a estar sin interferir.»', 'a'],
  [55.30, 57.85, '«No puede pasar. La mesa no está constituida.»', 'p'],
  [58.60, 67.20, 'Si insiste, no te pelees: foto, incidencia y avisa a Brian. Nosotros escalamos.', 'n'],
  // caso 2 · n6 en tres viñetas
  [69.70, 72.70, 'Si faltan nuestras papeletas, pídelas con educación y documenta.', 'n'],
  [74.15, 76.00, 'Si hay propaganda a menos de diez metros, foto.', 'n'],
  [80.25, 82.75, 'Si se va la luz o la urna llega rota, quédate y avisa.', 'n'],
  [83.30, 85.10, 'Compañero ausente: cubre el hueco.', 'n'],


  // caso 3 · n7
  [85.40, 88.60, 'En el escrutinio, mira cada voto.', 'n'],
  [89.00, 92.20, 'Foto nítida del acta antes de que la doblen.', 'n'],
  [92.50, 96.60, 'Si no cuadra: no firmes conforme y escribe tu protesta.', 'n'],
  [96.90, 100.75, 'Mándala por Scrutinia antes de las 21:00.', 'n'],
  // cierre · n8
  [104.25, 105.80, 'Somos pocos, pero organizados.', 'n'],
  [106.05, 108.70, 'Cubre tu colegio y ayuda al de al lado.', 'n'],
  [108.95, 112.60, 'Acreditación, DNI, móvil cargado y boli.', 'n'],
  [112.85, 118.70, '¡El 29N lo defendemos juntos! SALF.', 'n'],
];

// ——— secciones para la música: [nombre, inicio, fin, carácter] ———
export const SECTIONS = [
  ['mapa', 0.00, 11.10, 'intro'],
  ['relojes', 11.10, 26.80, 'clock'],
  ['app', 26.80, 44.30, 'app'],
  ['caso1', 44.30, 58.60, 'tension'],
  ['escalado', 58.60, 68.90, 'action'],
  ['caso2', 68.90, 84.60, 'quick'],
  ['acta', 84.60, 103.80, 'serious'],
  ['mochila', 103.80, 111.00, 'light'],
  ['cierre', 111.00, 120.00, 'final'],
];

// ——— golpes de imagen » events.json (efectos de score.py) ———
// tipo: pop, click, ding, whoosh, thud, stamp, chime, tick
export const EVENTS = [
  // mapa: 24 pines cayendo uno a uno
  ...Array.from({ length: 24 }, (_, i) => ({ t: 1.10 + i * 0.185, ty: 'pop', pan: ((i % 4) - 1.5) * 0.28 })),
  { t: 6.90, ty: 'whoosh' },                         // el zoom a Brian y Eugenio
  { t: 7.30, ty: 'chime' },                          // aparecen los dos
  // relojes: un ding por hora y el aviso rojo
  { t: 14.90, ty: 'ding', pan: -0.3 },
  { t: 18.60, ty: 'ding', pan: 0.3 },
  { t: 21.80, ty: 'ding', pan: -0.3 },
  { t: 25.10, ty: 'ding', pan: 0.3 },
  { t: 25.45, ty: 'stamp' },                          // <21:00 en rojo
  // app
  { t: 27.40, ty: 'click' },                          // activar GPS
  { t: 31.20, ty: 'click' },                          // toca CERVANTES
  { t: 32.30, ty: 'pop', pan: 0.2 },                  // pin a verde
  { t: 35.00, ty: 'click' },                          // nota
  { t: 36.40, ty: 'click' },                          // cámara
  { t: 36.55, ty: 'shutter' },
  { t: 38.30, ty: 'click' },                          // imprimir log
  { t: 39.40, ty: 'whoosh', pan: 0.2 },
  { t: 40.10, ty: 'ding', pan: 0.25 },                // WhatsApp
  // caso 1
  { t: 44.80, ty: 'whoosh' },
  { t: 50.30, ty: 'click' },                          // acreditación
  { t: 51.60, ty: 'click' },                          // DNI
  { t: 55.30, ty: 'thud' },                           // el «no» del presidente
  { t: 59.00, ty: 'shutter' },                        // foto de la puerta
  { t: 60.40, ty: 'pop', pan: -0.2 },                 // pin morado
  { t: 62.60, ty: 'ding', pan: 0.2 },                 // WhatsApp a Brian
  { t: 65.80, ty: 'whoosh' },                         // escala a Eugenio
  // caso 2
  { t: 69.20, ty: 'whoosh' },
  { t: 70.40, ty: 'thud' },                           // urna con hueco
  { t: 71.60, ty: 'shutter' },
  { t: 73.40, ty: 'whoosh' },
  { t: 74.40, ty: 'tick' }, { t: 74.85, ty: 'tick' }, { t: 75.30, ty: 'tick' },   // los pasos: 9 m
  { t: 75.90, ty: 'shutter' },
  { t: 77.50, ty: 'thud' },                           // se va la luz
  { t: 78.70, ty: 'click' },                          // linterna
  { t: 80.10, ty: 'crack' },                          // urna rota
  { t: 81.30, ty: 'ding', pan: 0.3 },                 // aviso: compañero ausente
  { t: 82.10, ty: 'stamp' },                          // «cubres el hueco»
  // caso 3
  { t: 84.70, ty: 'whoosh' },
  { t: 85.20, ty: 'stamp' },
  { t: 88.20, ty: 'tick' }, { t: 88.70, ty: 'tick' }, { t: 89.20, ty: 'tick' },
  { t: 92.00, ty: 'shutter' },                        // foto del acta
  { t: 95.60, ty: 'stamp' },                          // «no conformes»
  { t: 99.20, ty: 'ding', pan: 0.2 },                 // Scrutinia
  // mochila
  { t: 104.10, ty: 'whoosh' },
  { t: 104.60, ty: 'pop' }, { t: 105.40, ty: 'pop', pan: -0.3 }, { t: 106.20, ty: 'pop', pan: 0.3 },
  { t: 107.00, ty: 'pop', pan: -0.2 }, { t: 107.80, ty: 'pop', pan: 0.2 },
  // cierre
  { t: 111.10, ty: 'whoosh' },
  ...Array.from({ length: 7 }, (_, i) => ({ t: 112.10 + i * 0.20, ty: 'chime', pan: -0.5 + i * 0.16 })),
  ...Array.from({ length: 17 }, (_, i) => ({ t: 114.00 + i * 0.10, ty: 'tick', pan: 0.1 })),
  { t: 115.90, ty: 'stamp' },
  { t: 117.30, ty: 'chime' },
  { t: 118.60, ty: 'fanfare', v: .8 },
];

// mesas por colegio, en el mismo orden que PINS (CASU02 y luego CASU03)
export const MESAS = [5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 6, 7, 6, 6, 5, 5, 4, 4, 4, 4, 4, 4, 9];

export const K = {
  // mapa
  pins0: 1.10, pinStep: 0.185, mapaZoom: 6.90, brianIn: 7.30, mapaOut: 10.95,
  // relojes
  relojesIn: 11.20, reloj: [14.90, 18.60, 21.80, 25.10], relojSale: 26.60,
  // app
  appIn: 27.10, gps: 27.40, pinTap: 31.20, pinVerde: 32.30, nota: 34.90,
  foto: 36.40, log: 38.30, logShare: 39.40, logWa: 40.10, appOut: 44.10,
  // caso 1
  c1In: 44.60, puerta: 48.00, acred: 50.20, dni: 51.50, presi: 55.20, fotoPuerta: 59.00,
  pinMorado: 60.40, waBrian: 62.60, escala: 65.60, c1Out: 68.80,
  // caso 2
  c2a: 68.90, papeletas: 70.30, c2b: 73.30, pasos: 74.30, c2c: 77.40, luz: 77.50, linterna: 78.70, urnaRota: 80.10, hueco: 81.20,
  // caso 3
  c3: 84.70, recuento: 88.10, actaFoto: 91.90, actaMal: 94.90, protesta: 95.60, scrutin: 98.90,
  // cierre
  mochila: 103.90, objetos: [104.00, 104.60, 105.20, 105.80, 106.40], diecisiete: 113.90,
  faltan: 115.80, titulazo: 116.90, fist: 117.60, fuera: 119.60,
};
