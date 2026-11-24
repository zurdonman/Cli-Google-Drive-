// story.js — SALF 29N V5 FINAL · 5:30 (330 s) · 10 bloques, ninguno mudo
// Una sola fuente de verdad: duración, bloques, textos de voz y golpes de sonido.
export const DUR = 330;

// ——— bloques (plano en pantalla) ———
export const SHOTS = [
  [0.0, 20.0, 'intro', '24 colegios · 112 mesas'],
  [20.0, 55.0, 'constitucion', 'Constitución 08:00'],
  [55.0, 95.0, 'votacion', 'Votación 09:00–20:00'],
  [95.0, 125.0, 'coordina', 'WhatsApp principal · app opcional'],
  [125.0, 175.0, 'caso1', 'Caso 1 · no me dejan entrar'],
  [175.0, 205.0, 'papeletas', 'Faltan papeletas · mesa no constituida'],
  [205.0, 235.0, 'accesibilidad', 'Accesibilidad'],
  [235.0, 288.0, 'escrutinio', 'Escrutinio 20:00'],
  [288.0, 310.0, 'sobres', 'Tres sobres · mochila'],
  [310.0, 330.0, 'cierre', 'Los diez pasos'],
];

// ——— textos de la voz (se sintetizan tal cual; los subtítulos salen de aquí) ———
export const TEXT = {
  n8b: 'Pide tu copia del acta, una por candidatura, y no te vayas hasta que cuelguen el cartel con los seis datos en la puerta. Y si algo no cuadra, escribe tu protesta al pie antes de firmar.',
  n1: 'El veintinueve de noviembre eres los ojos de SALF en Castellón. Veinticuatro colegios, ciento doce mesas. Con Brian y Eugenio no estás solo.',
  n1b: 'Hoy no improvisas: tienes un plan de diez pasos, de las ocho de la mañana a las nueve de la noche.',
  n2: 'A las ocho de la mañana, constitución. Comprueba dos urnas precintadas, blanca del Congreso y sepia del Senado. Papeletas de todas las candidaturas, cabina, censo y acta. Si ves la letra C, ese votante no vota aquí: votó por correo. Pide tu copia del acta de constitución.',
  n2b: 'En el acta de constitución constan los titulares y los suplentes que no entran, con su justificante. Y comprueba que hay tres sobres con recibos para el Tribunal.',
  n3: 'A las nueve empieza la votación. El voto es personal: el presidente introduce el sobre sin tocarlo. Vale el DNI caducado, pero solo el original, nunca una fotocopia. También el QR de MiDNI. Si solo hay una elección, una sola equis.',
  n3b: 'Si alguien llega y no está en el censo, solo vale certificado de alta o sentencia. Y quien ha votado por correo no vota aquí: márcalo y avisa.',
  n4: 'La coordinación es por WhatsApp con Brian y Eugenio: foto del acta a las ocho y media, avances a las dos y a las seis, incidencia al momento. Si tienes la app SALF Rutas, úsala como ayuda extra para marcar cubierto y guardar el registro. Es opcional: sin app lo haces igual de bien por WhatsApp.',
  n4b: 'Manda foto y texto corto: colegio, hora y qué pasa. Brian y Eugenio responden en minutos.',
  pr1: 'No puede usted pasar. La mesa está constituida y aquí la autoridad soy yo.',
  ap1: 'Soy apoderada de SALF, artículo setenta y nueve de la LOREG, tengo derecho a estar sin interferir.',
  n5: 'Si te niegan la entrada, no discutas. Enseña credencial y DNI, y di la frase: artículo setenta y nueve. Lleva el pin discreto, pero nunca uniforme. Si insiste, foto de la puerta, incidencia morada y WhatsApp a Brian. Nosotros escalamos a Eugenio y a Jurídica, y tú te quedas en el pasillo vigilando.',
  n5b: 'Recuerda que el artículo setenta y nueve te da acceso a cualquier colegio y a cualquier mesa, no solo a la tuya.',
  n6: 'Si faltan papeletas, pide que las repongan. Se puede interrumpir la votación una hora; si no hay mesa a las diez, se repite en dos días. Propaganda a menos de diez metros: foto e incidencia.',
  n6b: 'Y si ves una urna rota o sin precinto, no la toques: foto, avisa a la mesa y escríbelo en la incidencia.',
  n7: 'En accesibilidad, pregunta antes de ayudar. Respeta el acompañante elegido, el perro guía y el braille. No toques la silla sin permiso y habla claro a quien lee los labios. Ninguna discapacidad impide votar.',
  n7b: 'Pregunta siempre lo mismo: ¿quiere que le ayude? Y si te dice que no, acompaña sin tocar y sin decidir por nadie.',
  n8: 'A las ocho, cierre y escrutinio sin pausa: primero Congreso y después Senado. Se abre cada sobre y se lee la papeleta en voz alta, enseñándola. Los blancos y los nulos se cuentan aparte; la cruz discreta es válida y el tachón no. Nadie puede salir durante el escrutinio y no se puede suspender. Si el acta no cuadra, no firmes conforme: escribe tu protesta al pie y pide que conste. El original queda colgado en la puerta con los seis datos. Haz foto nítida antes de doblarla, pide tu copia y mándala por Scrutinia antes de las nueve.',
  n9a: 'Tres sobres firmados con solapa cruzada: uno y dos al Tribunal, con la policía y con recibo; y tres a Correos, también con recibo. En la mochila: acreditación, DNI, boli negro, móvil con batería y powerbank, agua y esta guía impresa. Nada más.',
  n9b: 'Los diez pasos: verifica, acredítate, pide acta, reporta, patrulla, documenta, avisa avances, foto del acta, pide copia y cierra el día. Somos pocos, pero organizados. ¡El veintinueve lo defendemos juntos! SALF.',
};

// quién dice cada texto
export const WHO = { n8b: 'n', n1: 'n', n1b: 'n', n2: 'n', n2b: 'n', n3: 'n', n3b: 'n', n4: 'n', n4b: 'n', n5: 'n', n5b: 'n', n6: 'n', n6b: 'n', n7: 'n', n7b: 'n', n8: 'n', n9a: 'n', n9b: 'n', ap1: 'a', pr1: 'p' };

// ——— voz: id, cuándo entra, qué voz de TTS usa y qué texto dice ———
export const VOICES = [
  { id: 'n1', at: 0.60, who: 'narrador', text: TEXT.n1 },
  { id: 'n1b', at: 10.90, who: 'narrador', text: TEXT.n1b },
  { id: 'n2', at: 20.60, who: 'narrador', text: TEXT.n2 },
  { id: 'n2b', at: 40.60, who: 'narrador', text: TEXT.n2b },
  { id: 'n3', at: 55.60, who: 'narrador', text: TEXT.n3 },
  { id: 'n3b', at: 74.20, who: 'narrador', text: TEXT.n3b },
  { id: 'n4', at: 95.60, who: 'narrador', text: TEXT.n4 },
  { id: 'n4b', at: 114.00, who: 'narrador', text: TEXT.n4b },
  { id: 'pr1', at: 125.80, who: 'presidente', text: TEXT.pr1 },
  { id: 'ap1', at: 132.80, who: 'apoderado', text: TEXT.ap1 },
  { id: 'n5', at: 140.60, who: 'narrador', text: TEXT.n5 },
  { id: 'n5b', at: 161.60, who: 'narrador', text: TEXT.n5b },
  { id: 'n6', at: 175.60, who: 'narrador', text: TEXT.n6 },
  { id: 'n6b', at: 189.60, who: 'narrador', text: TEXT.n6b },
  { id: 'n7', at: 205.60, who: 'narrador', text: TEXT.n7 },
  { id: 'n7b', at: 220.00, who: 'narrador', text: TEXT.n7b },
  { id: 'n8', at: 235.60, who: 'narrador', text: TEXT.n8 },
  { id: 'n8b', at: 258.60, who: 'narrador', text: TEXT.n8b },
  { id: 'n9a', at: 288.50, who: 'narrador', text: TEXT.n9a },
  { id: 'n9b', at: 310.40, who: 'narrador', text: TEXT.n9b },
];

// ——— golpes de imagen ———
const E = [];
const ev = (t, ty, extra = {}) => E.push({ t, ty, ...extra });

// intro: caída de los 24 pines
for (let i = 0; i < 24; i++) ev(1.0 + i * 0.30, 'pop', { pan: -0.5 + (i % 6) * 0.2, v: 0.8 });
ev(0.2, 'whoosh');
ev(17.4, 'chime');

// constitución
for (const t of [22.0, 25.4, 28.8, 32.2, 35.6, 39.0]) ev(t, 'tick');
ev(24.0, 'pop', { pan: -0.3 });
ev(26.0, 'pop', { pan: 0.3 });
ev(44.0, 'shutter', { pan: 0.2 });
ev(50.0, 'chime');

// votación
ev(57.0, 'ding');
ev(61.0, 'tick');
ev(66.0, 'thud', { pan: -0.2 });
ev(70.0, 'pop');
ev(76.0, 'tick');
ev(84.0, 'tick');

// whatsapp + app
ev(97.0, 'ding', { pan: -0.3 });
ev(104.0, 'ding', { pan: -0.3 });
ev(111.0, 'click', { pan: 0.3 });
ev(116.0, 'pop', { pan: 0.3 });

// caso 1
ev(125.2, 'thud');
ev(131.0, 'whoosh');
ev(136.0, 'chime');
ev(152.0, 'shutter');
ev(158.0, 'ding');
ev(166.0, 'whoosh');

// papeletas
ev(177.0, 'pop');
ev(181.0, 'thud');
ev(186.0, 'tick');
ev(192.0, 'crack', { pan: 0.2 });
ev(199.0, 'tick');

// accesibilidad
ev(207.0, 'chime');
ev(216.0, 'tick');
ev(226.0, 'chime');

// escrutinio
ev(237.0, 'ding');
ev(243.0, 'tick');
ev(250.0, 'tick');
ev(258.0, 'stamp');
ev(266.0, 'shutter');
ev(274.0, 'stamp');
ev(282.0, 'chime');

// sobres y mochila
ev(289.0, 'stamp', { pan: -0.2 });
ev(294.0, 'stamp', { pan: 0.2 });
ev(299.0, 'whoosh');
ev(304.0, 'pop');

// cierre
ev(311.0, 'whoosh');
ev(320.0, 'fanfare');
ev(327.0, 'chime');

export const EVENTS = E;

// ——— subtítulos: main.js los rellena desde out/subs.json con las duraciones reales ———
export const SUBS = [];

// ——— tiempos internos de cada plano ———
export const K = {
  pins0: 1.0, pinStep: 0.30, mapZoom: 15.0, personsIn: 17.0,
  mesaIn: 21.0, urnasIn: 24.0, check0: 24.4, checkStep: 3.2, actaIn: 44.0,
  cabinaIn: 57.0, sobreIn: 66.0, tarjetas0: 70.0, tarjetaStep: 4.2,
  waIn: 96.2, waMsg0: 97.2, waMsgStep: 2.4, appIn: 99.0, appSteps0: 100.4, appStep: 2.8, optIn: 108.0,
  puertaIn: 125.0, bloqueo: 126.0, frase: 132.5, pasos0: 141.0, pasoStep: 5.4, escala: 158.0, pin: 166.0,
  urnaIn: 176.0, hueco: 178.0, reloj10: 184.0, propa: 191.0,
  acc0: 206.4, accStep: 1.6,
  actaIn2: 237.0, votos0: 242.0, votosStep: 2.6, fotoActa: 262.0, datos6: 268.0, copias: 280.0,
  sobres0: 289.0, sobresStep: 2.6, grafico: 300.0, mochila2: 303.0,
  pasos0: 311.0, pasoStep: 0.55, final: 317.0,
};

// ——— tarjetas del 9:16 (resumen de cada bloque en la zona de papel) ———
export const VCARDS = {
  intro: [['24', 'colegios'], ['112', 'mesas'], ['31', 'plazas libres']],
  constitucion: [['08:00', 'urnas precintadas'], ['OK', 'papeletas de todas'], ['C', 'correo: no vota aquí'], ['OK', 'pide copia del acta']],
  votacion: [['09:00', 'empieza la votación'], ['OK', 'DNI original, caducado vale'], ['NO', 'fotocopia no vale'], ['1', 'elección = 1 equis']],
  coordina: [['WA', 'principal: Brian y Eugenio'], ['08:30', 'foto del acta'], ['14:00', 'avance 1'], ['18:00', 'avance 2'], ['APP', 'opcional: SALF Rutas']],
  caso1: [['1', 'respira'], ['2', 'credencial + DNI'], ['3', 'art. 79 LOREG'], ['4', 'foto + WhatsApp a Brian']],
  papeletas: [['!', 'faltan papeletas'], ['1 h', 'interrupción máxima'], ['10:00', 'sin mesa: repite'], ['9 m', 'propaganda: foto']],
  accesibilidad: [['?', 'pregunta antes'], ['OK', 'perro guía y braille'], ['OK', 'no toques la silla']],
  escrutinio: [['20:00', 'cierre y escrutinio'], ['OK', 'blancos y nulos aparte'], ['FOTO', 'acta antes de doblar'], ['21:00', 'enviada por Scrutinia']],
  sobres: [['1+2', 'al Tribunal con la policía'], ['3', 'a Correos con recibo'], ['OK', 'acreditación, DNI, boli']],
  cierre: [['10', 'pasos'], ['22', 'plazas por cubrir'], ['29N', 'lo defendemos juntos']],
};
