import { getWeightTrend } from './recommendations';

function getWeekKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function calcWeekPoints(weekEntries, targets, settings) {
  const breakdown = {
    weightTrend:  0,
    proteinAvg:   0,
    trainingDays: 0,
    consistency:  0,
    calorieAvg:   0,
    honestyBonus: 0,
  };

  if (!weekEntries.length) return { breakdown, total: 0 };

  breakdown.consistency = weekEntries.length >= 7 ? 10 : weekEntries.length >= 5 ? 5 : 0;

  const trend = getWeightTrend(weekEntries);
  const trendGood =
    (settings.goal === 'cutting'     && trend === 'down') ||
    (settings.goal === 'bulking'     && trend === 'up')   ||
    (settings.goal === 'maintaining' && trend === 'flat');
  breakdown.weightTrend = trendGood ? 20 : 0;

  const proteinLogs = weekEntries.filter(e => e.protein != null);
  if (proteinLogs.length >= 3) {
    const avg = proteinLogs.reduce((s, e) => s + e.protein, 0) / proteinLogs.length;
    breakdown.proteinAvg = avg >= targets.protein * 0.95 ? 15 : avg >= targets.protein * 0.8 ? 7 : 0;
  }

  const trainDays = weekEntries.filter(e => e.trained).length;
  breakdown.trainingDays = trainDays >= 4 ? 15 : trainDays >= 3 ? 8 : 0;

  const calLogs = weekEntries.filter(e => e.calories != null);
  if (calLogs.length >= 3) {
    const avg = calLogs.reduce((s, e) => s + e.calories, 0) / calLogs.length;
    breakdown.calorieAvg =
      avg >= targets.calories * 0.9 && avg <= targets.calories * 1.1 ? 10 : 0;
  }

  const toughDayLogged = weekEntries.some(
    e => (e.feelings?.energy != null && e.feelings.energy <= 2) ||
         (e.feelings?.soreness != null && e.feelings.soreness >= 4)
  );
  breakdown.honestyBonus = toughDayLogged ? 10 : 0;

  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return { breakdown, total };
}

export function calcTotalPoints(allEntries, targets, settings) {
  const weeks = {};
  allEntries.forEach(e => {
    const key = getWeekKey(e.date);
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(e);
  });
  return Object.values(weeks)
    .reduce((sum, we) => sum + calcWeekPoints(we, targets, settings).total, 0);
}

export const LEVELS = [
  { level: 1, name: 'Getting Started',       pts: 0,    nextPts: 150,  badge: '🌱', color: '#4CAF50' },
  { level: 2, name: 'Building Momentum',     pts: 151,  nextPts: 400,  badge: '⚡', color: '#FF9800' },
  { level: 3, name: 'Consistency Champion',  pts: 401,  nextPts: 800,  badge: '🏆', color: '#D32F2F' },
  { level: 4, name: 'Disciplined Athlete',   pts: 801,  nextPts: 1500, badge: '💪', color: '#9c27b0' },
  { level: 5, name: 'Transformation Master', pts: 1501, nextPts: null, badge: '⭐', color: '#FFD700' },
];

export function getLevelInfo(totalPoints) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (totalPoints >= l.pts) current = l;
  }
  const nextLevel = current.level < 5 ? LEVELS[current.level] : null;
  const progress = nextLevel
    ? Math.min((totalPoints - current.pts) / (nextLevel.pts - current.pts), 1)
    : 1;
  return { ...current, totalPoints, nextLevel, progress };
}

export const BREAKDOWN_META = {
  weightTrend:  { label: 'Weight trend',    max: 20 },
  proteinAvg:   { label: 'Protein target',  max: 15 },
  trainingDays: { label: 'Training days',   max: 15 },
  consistency:  { label: 'Consistency',     max: 10 },
  calorieAvg:   { label: 'Calorie target',  max: 10 },
  honestyBonus: { label: 'Honesty bonus',   max: 10 },
};
