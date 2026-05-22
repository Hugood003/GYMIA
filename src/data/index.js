// GYMIA — Mock data (Spanish)

export const USER = {
  name: 'Mateo',
  age: 27,
  height: 178,
  weight: 76.4,
  goal: 'Hipertrofia',
  level: 'Intermedio',
  streak: 12,
  weekDone: 3,
  weekGoal: 4,
};

export const WEEK = [
  { d: 'Lun', date: 18, label: 'Empuje',   exercises: 6, minutes: 62, status: 'done' },
  { d: 'Mar', date: 19, label: 'Tirón',    exercises: 6, minutes: 58, status: 'done' },
  { d: 'Mié', date: 20, label: 'Descanso', exercises: 0, minutes: 0,  status: 'rest' },
  { d: 'Jue', date: 21, label: 'Pierna',   exercises: 7, minutes: 70, status: 'today' },
  { d: 'Vie', date: 22, label: 'Empuje',   exercises: 6, minutes: 60, status: 'next' },
  { d: 'Sáb', date: 23, label: 'Tirón',    exercises: 6, minutes: 55, status: 'next' },
  { d: 'Dom', date: 24, label: 'Descanso', exercises: 0, minutes: 0,  status: 'rest' },
];

export const TODAY = {
  label: 'Pierna · Cuádriceps dominante',
  exercises: [
    { id: 'sq',  name: 'Sentadilla con barra', muscle: 'Cuádriceps', sets: [
      { reps: 8, kg: 80, rpe: 7, done: true },
      { reps: 8, kg: 80, rpe: 8, done: true },
      { reps: 6, kg: 85, rpe: 8, done: false },
      { reps: 6, kg: 85, rpe: 9, done: false },
    ], rest: 150, note: 'Bajar a paralelo, codos arriba.' },
    { id: 'rdl', name: 'Peso muerto rumano', muscle: 'Femoral', sets: [
      { reps: 10, kg: 70, rpe: 7, done: false },
      { reps: 10, kg: 70, rpe: 7, done: false },
      { reps: 10, kg: 70, rpe: 8, done: false },
    ], rest: 120, note: '' },
    { id: 'lp',  name: 'Prensa 45°', muscle: 'Cuádriceps', sets: [
      { reps: 12, kg: 140, rpe: 7, done: false },
      { reps: 12, kg: 140, rpe: 8, done: false },
      { reps: 10, kg: 150, rpe: 8, done: false },
    ], rest: 90, note: '' },
    { id: 'lc',  name: 'Curl femoral tumbado', muscle: 'Femoral', sets: [
      { reps: 12, kg: 35, rpe: 7, done: false },
      { reps: 12, kg: 35, rpe: 8, done: false },
      { reps: 10, kg: 40, rpe: 8, done: false },
    ], rest: 75, note: '' },
    { id: 'ce',  name: 'Elevación de gemelo', muscle: 'Gemelos', sets: [
      { reps: 15, kg: 60, rpe: 7, done: false },
      { reps: 15, kg: 60, rpe: 8, done: false },
      { reps: 15, kg: 60, rpe: 9, done: false },
    ], rest: 60, note: '' },
  ],
};

export const PROGRESS = {
  bench:  [82, 84, 85, 85, 87, 88, 90, 92, 92, 95, 96, 98],
  squat:  [105,108,110,112,115,118,120,120,125,128,128,132],
  dead:   [130,135,135,140,142,145,148,150,150,155,158,160],
  weight: [78.1,77.9,77.6,77.4,77.0,77.2,76.9,76.6,76.7,76.5,76.3,76.4],
  volume: [11,13,12,15,14,16,18,17,19,21,20,22],
};

export const PRS = [
  { lift: 'Sentadilla', value: 132, unit: 'kg', delta: '+4', when: 'hace 3 días' },
  { lift: 'Banca',      value: 98,  unit: 'kg', delta: '+2', when: 'hace 1 sem' },
  { lift: 'Peso muerto',value: 160, unit: 'kg', delta: '+2', when: 'hace 2 sem' },
];

export const HISTORY = [
  { date: '20 may', label: 'Tirón',  minutes: 58, sets: 22, vol: '6.4 t', kpi: '+1 PR' },
  { date: '18 may', label: 'Empuje', minutes: 62, sets: 24, vol: '5.9 t', kpi: '+2 PR' },
  { date: '16 may', label: 'Pierna', minutes: 70, sets: 28, vol: '9.1 t', kpi: 'PR sentadilla' },
  { date: '15 may', label: 'Tirón',  minutes: 55, sets: 22, vol: '6.2 t', kpi: '—' },
  { date: '13 may', label: 'Empuje', minutes: 60, sets: 24, vol: '5.7 t', kpi: '+1 PR' },
  { date: '11 may', label: 'Pierna', minutes: 68, sets: 26, vol: '8.7 t', kpi: '—' },
];

export const AI_THREAD = [
  { role: 'ai',   text: 'Hola Mateo. ¿Qué quieres trabajar esta semana?' },
  { role: 'user', text: 'Quiero ganar masa muscular. Tengo 4 días libres y gimnasio completo.' },
  { role: 'ai',   text: 'Perfecto. ¿Algún punto débil al que dar prioridad? ¿Hombro, espalda alta, glúteo…?' },
  { role: 'user', text: 'Espalda y pierna. Hombro me molesta a veces.' },
  { role: 'ai',   text: 'Anotado. Voy a montar una rutina Empuje · Tirón · Pierna · Tirón con prioridad en dorsal y cuádriceps, y volumen moderado en hombro evitando press militar.' },
];
