// story.js — the clock and the script. One number lives here: DUR. Everything else is derived from it,
// so the score (score.py) can read this file and land on the same bars.
//
// PARTE 1  · el problema          (0 → 33.0)
// PARTE 2  · la solución          (33.0 → 63.0)
// PARTE 3  · el cierre            (63.0 → 78.0)

export const BPM = 128;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;

const B = n => n * BAR;

export const SHOTS = [
  [0.00, 4.55, 'card', 'Cartela: LAS CUENTAS CLARAS'],
  [4.55, 12.20, 'tapas', 'Bar Manolo: el montón de papeles'],
  [12.20, 20.20, 'nota', 'La hoja cuadriculada'],
  [20.20, 27.60, 'cara', 'El que presta y el que debe'],
  [27.60, 34.40, 'bronca', 'La bronca'],
  [34.40, 39.40, 'cierre1', 'Cartela: una regla de oro'],
  [39.40, 47.20, 'tren', 'Vía 7: destino Valencia'],
  [47.20, 55.00, 'playa', 'Chiringuito Paco: cada uno paga lo suyo'],
  [55.00, 62.00, 'noche', 'La Ronda: la cuenta en la mesa'],
  [62.00, 70.00, 'vuelta', 'Tren de vuelta, los tres a la vez'],
  [70.00, 78.00, 'cierre2', 'Cartela: PAGAR LO TUYO'],
];

export const DUR = SHOTS[SHOTS.length - 1][1];

// The keys every scene animation lands on. Bar lines: 1.875 s each at 128 BPM.
export const K = {
  // — card
  cardIn: 0.20, cardTitle: 0.55, cardSub: 1.15, cardRule: 2.10, cardOut: 4.10,
  // — tapas (bar Manolo)
  tapasIn: 4.55,
  manoIn: 5.10,        // Manolo behind the bar
  monton0: 6.10,       // the pile of papers starts
  papel: [6.1, 6.55, 7.0, 7.45, 7.9, 8.35, 8.8, 9.25],   // each paper lands
  luisIn: 8.10, nuriaIn: 8.45,
  cuenta: 9.60,        // the tray with the bill lands
  senalan: 10.40,      // both point at the pile
  manoloSale: 11.60,
  // — nota (the notebook)
  notaIn: 12.20,
  hoja: 12.45,         // the sheet arrives, a little tilted
  linea: [13.4, 14.1, 14.8, 15.5, 16.2],   // five lines of numbers, one per beat
  total: 16.90,        // the total, circled twice
  pregunta: 17.90,     // "¿y lo mío?"
  tick: [18.9, 19.3],  // the two ticks
  // — cara (the two of them)
  caraIn: 20.20,
  split: 20.55,        // the frame splits in two colour blocks
  luisGlare: 21.30, nuriaGlare: 22.30,
  deudaSello: 23.30,   // DEUDA stamped across the split
  cuentaAtras: 24.30,  // a little countdown of broken things
  // — bronca
  broncaIn: 27.60,
  gritos: [28.2, 28.9, 29.6, 30.3],
  papeles: 29.8,       // the papers take off
  silencio: 30.90,     // everything freezes: the silence before the rule
  // — cierre1
  cierre1In: 34.40, regla: 35.10, reglaSub: 36.20, cierre1Out: 39.10,
  // — tren
  trenIn: 39.40, via: 39.9, trenLlega: 40.0, puerta: 42.0,
  suben: [42.4, 42.75, 43.1],   // Luis, Nuria, Paco
  trenSale: 45.30,
  // — playa
  playaIn: 47.20, mar: 47.4, sombrilla: 47.9, paco: 48.2,
  pago: [49.6, 50.3, 51.0],      // each pays his own: Luis, Nuria, Paco
  cuentas: 51.9,                 // the three receipts, in a row
  // — noche
  nocheIn: 55.00, luna: 55.2, mesa: 55.6, cuenta2: 56.6,
  cadaUno: [57.4, 57.9, 58.4],   // coins, one stack each
  brindis: 59.2,
  // — vuelta
  vueltaIn: 62.00, ventana: 62.4, tresReflejos: 63.2, dormidos: 66.0,
  // — cierre2
  cierre2In: 70.00, titulo: 70.6, sub: 71.9, pie: 73.0, fuera: 77.2,
};

// Subtitles: the narrator, one clause per card, on the bar grid.
export const SUBS = [
  [5.10, 8.30, 'Bar Manolo. Un café, dos amigos y un montón de papeles.'],
  [8.60, 12.10, 'Uno pagó la cena. Y el taxi. Y el cumpleaños.'],
  [12.50, 16.60, 'Al principio eran veinte euros. Luego, una hoja.'],
  [16.90, 20.10, 'Luego, una hoja con un total que no cuadra.'],
  [20.60, 24.10, 'Aquí empieza la deuda: la que nadie dice en voz alta.'],
  [24.40, 27.50, 'Y se acaba la amistad. Con dos cafés de por medio.'],
  [28.10, 31.20, 'Porque el dinero entre amigos no se presta: se recuerda.'],
  [31.60, 34.30, 'Y lo que se recuerda, al final se cobra.'],
  [35.10, 39.20, 'Una regla de oro: lo que se comparte, se paga en el momento.'],
  [40.00, 44.00, 'Así que hicieron lo único sensato: irse a Valencia.'],
  [47.60, 51.50, 'Chiringuito Paco. Tres cervezas y una cuenta muy larga.'],
  [51.90, 54.90, 'Y cada uno pagó lo suyo. Sin hojas. Sin totales.'],
  [55.60, 58.90, 'Por la noche, la ronda se apagó a la vez:'],
  [59.20, 61.90, 'la última ronda la paga el que se acuerda.'],
  [62.40, 66.20, 'Y en el tren de vuelta nadie debía nada a nadie.'],
  [70.60, 74.60, 'Pagar lo tuyo no te hace tacaño. Te hace buen amigo.'],
  [74.90, 77.60, 'Este verano: Valencia, y a lo tuyo.'],
];

// Section table for the score: [start, end, mood, chord roadmap hint]
export const SECTIONS = [
  ['card', 0.00, 4.55, 'title'],
  ['tapas', 4.55, 12.20, 'setup'],
  ['nota', 12.20, 20.20, 'counting'],
  ['cara', 20.20, 27.60, 'tension'],
  ['bronca', 27.60, 34.40, 'fight'],
  ['cierre1', 34.40, 39.40, 'rule'],
  ['tren', 39.40, 47.20, 'travel'],
  ['playa', 47.20, 55.00, 'payoff'],
  ['noche', 55.00, 62.00, 'night'],
  ['vuelta', 62.00, 70.00, 'sleep'],
  ['cierre2', 70.00, 78.00, 'poster'],
];
