// story.js — THE TIMELINE: every number in the film lives here, so the page, the score and the .srt
// all read the same clock.
export const DUR = 68;
export const BPM = 132, BEAT = 60 / BPM;          // 0.4545 s · 1 bar (4/4) = 1.818 s
export const bar = n => n * 4 * BEAT;               // bar 0 at t = 0

export const SHOTS = [
  // [t_in, t_out, name]
  [0.00, 4.60, 'card'],       // the title card, rolled away by the projectionist
  [4.60, 14.20, 'hall'],       // the closed doors, the cards, the drop
  [14.20, 23.40, 'corridor'],  // the run, the doors, the briefcase
  [23.40, 36.20, 'boardroom'], // the deck, the flames, "prueba de concepto"
  [36.20, 47.60, 'sky'],       // the cloud, the chair, the numbers
  [47.60, 58.00, 'bonus'],     // the curtain, the envelope, the news
  [58.00, 63.00, 'card2'],     // THE END card (a title card again)
  [63.00, 68.00, 'pixels'],    // a character pulls the iris shut
];

export const K = {
  // —— A · title card ——
  rollIn: 0.35, rollOut: 4.05,
  hop0: 0.38, hopGap: BEAT / 3,           // letters hop in one per beat
  // —— B · hall ——
  hallIn: 4.60,
  doors: [[5.9, 'Acceso al cielo'], [7.3, 'Facturación de milagros'], [8.7, 'Premios']],
  drop1: 9.9,
  ivanIn: 10.6,
  zacIn: 11.3,
  slideOut: 12.4,                     // zacarías whips out the plate
  crowdIn: 12.2,
  stamp: 13.4,                        // the red seal: NO SUBVENCIÓN
  // —— C · corridor ——
  corrIn: 14.2,
  run0: 14.9,
  doorsPass: [15.6, 16.4, 17.2, 18.0, 18.8, 19.6],
  brief1: 20.2,                       // the briefcase springs open
  leash: 20.9,                        // iván on the leash
  tangle: 22.0,
  skid: 23.0,
  // —— D · boardroom ——
  boardIn: 23.4,
  chartIn: 24.2,
  flames: [28.2, 29.1],  char0: 27.9,
  moneyIn: 30.6,
  proof: 31.9,                        // "PRUEBA DE CONCEPTO"
  burn: 33.9,
  // —— E · sky ——
  skyIn: 36.2,
  rise: 37.0,
  chair: 39.6,
  promptDrop: 41.4, promptGap: 0.62, promptN: 6,
  numbers: [44.4, 45.4, 46.4],
  // —— F · bonus ——
  bonusIn: 47.6,
  curtain: 48.2,
  env: 49.4,
  news: 51.4,
  confetti: 52.0,
  // —— G · end card ——
  card2In: 58.0,
  // —— H · pixels ——
  iris0: 63.0, iris1: 66.3,
  pixelize: 64.9,
};

// subtitle cues: what the announcer says (the same words the score ducks under)
export const SUBS = [
  [5.2, 9.1, 'Dos visionarios esperan el pelotazo.'],
  [9.3, 12.0, 'Iván predica. Zacarías gorrea.'],
  [12.2, 15.8, 'La subvención no llega.'],
  [16.0, 19.4, 'Veinte minutos de cuello.'],
  [19.7, 22.9, 'La cartera se abre.'],
  [23.1, 26.5, 'El dinero se transforma en símil.'],
  [26.8, 31.4, 'El gráfico arde. La ronda, también.'],
  [32.0, 36.0, 'Prueba de concepto: cero clientes.'],
  [36.5, 40.2, 'La nube: nadie sabe dónde está.'],
  [40.4, 43.8, 'Un prompt por cabeza.'],
  [44.0, 47.6, 'Veinte, ochenta, novecientos.'],
  [48.0, 51.2, 'El cielo les vende el bonus.'],
  [51.5, 54.9, 'El bonus no es dinero: es promesa.'],
  [55.2, 57.9, 'La foto. El colchón.'],
];

// the announcer's voice lines are unrecorded in this environment: the score mickey-mouses them instead
export const VO = [];
