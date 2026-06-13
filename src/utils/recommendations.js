import { getTodayStr } from './storage';

export function calcTargets(entries, settings) {
  const weightEntries = entries.filter(e => e.weight != null);
  const latestWeight = weightEntries.length
    ? weightEntries[weightEntries.length - 1].weight
    : null;

  const weightKg = latestWeight
    ? (settings.weightUnit === 'lbs' ? latestWeight / 2.2046 : latestWeight)
    : null;

  const protein = settings.proteinMode === 'auto' && weightKg
    ? Math.round(weightKg * 1.8)
    : settings.proteinTarget;

  const calsPerKg = { cutting: 26, maintaining: 33, bulking: 40 }[settings.goal] || 33;
  const calories = settings.calorieMode === 'auto' && weightKg
    ? Math.round(weightKg * calsPerKg)
    : settings.calorieTarget;

  return { protein, calories };
}

export function getStreak(entries) {
  if (!entries.length) return 0;
  const dateSet = new Set(entries.map(e => e.date));
  let streak = 0;
  const d = new Date(getTodayStr() + 'T12:00:00');
  while (dateSet.has(d.toISOString().split('T')[0])) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getWeightTrend(entries, days = 7) {
  const recent = entries.filter(e => e.weight != null).slice(-days);
  if (recent.length < 2) return null;
  const diff = recent[recent.length - 1].weight - recent[0].weight;
  if (diff < -0.3) return 'down';
  if (diff > 0.3) return 'up';
  return 'flat';
}

export function getTrendDisplay(trend, goal) {
  if (!trend) return { arrow: '—', color: 'var(--muted)', label: 'Not enough data' };

  const good =
    (goal === 'cutting'    && trend === 'down') ||
    (goal === 'bulking'    && trend === 'up')   ||
    (goal === 'maintaining' && trend === 'flat');

  const bad =
    (goal === 'cutting'  && trend === 'up') ||
    (goal === 'bulking'  && trend === 'down');

  const arrows = { down: '↓', up: '↑', flat: '→' };
  return {
    arrow: arrows[trend],
    color: good ? 'var(--success)' : bad ? 'var(--primary)' : 'var(--warning)',
    label: trend.charAt(0).toUpperCase() + trend.slice(1),
  };
}

export function getProteinInsight(entries, proteinTarget) {
  const last7 = entries.slice(-7).filter(e => e.protein != null);
  if (last7.length < 3) return null;
  const avg = last7.reduce((s, e) => s + e.protein, 0) / last7.length;
  const belowCount = last7.filter(e => e.protein < proteinTarget * 0.9).length;

  if (belowCount >= 3) {
    return {
      type: 'warning',
      title: 'Protein Below Target',
      msg: `7-day avg is ${Math.round(avg)}g — below target for ${belowCount} days. Consider adding a shake or extra serving of meat/eggs.`,
    };
  }
  return null;
}

export function getCalorieInsight(entries, settings, calorieTarget) {
  if (settings.goal !== 'cutting') return null;
  const last14 = entries.filter(e => e.weight != null).slice(-14);
  if (last14.length < 10) return null;

  const first = last14[0].weight;
  const last  = last14[last14.length - 1].weight;
  const diff  = last - first;
  const pctChange = Math.abs(diff) / first;
  const weeks = last14.length / 7;

  if (pctChange < 0.005 && diff > -0.3) {
    return {
      type: 'warning',
      title: 'Weight Plateau',
      msg: 'Weight has been flat for 2+ weeks — consider reducing your calorie target by ~100-150 kcal.',
    };
  }

  if (pctChange / weeks > 0.01 && diff < 0) {
    return {
      type: 'info',
      title: 'Dropping Fast',
      msg: 'Weight is dropping faster than 1%/week — consider adding ~100-150 kcal back to preserve muscle.',
    };
  }

  return null;
}
