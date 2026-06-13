import { useMemo } from 'react';
import { calcTargets, getWeightTrend } from '../utils/recommendations';
import { calcWeekPoints, calcTotalPoints, getLevelInfo, BREAKDOWN_META } from '../utils/points';

function getThisWeekEntries(entries) {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return entries.filter(e => new Date(e.date + 'T12:00:00') >= start);
}

function generateCoachNote(weekEntries, targets, settings) {
  if (weekEntries.length < 2) return null;
  const parts = [];

  const proteinLogs = weekEntries.filter(e => e.protein != null);
  if (proteinLogs.length) {
    const avg = Math.round(proteinLogs.reduce((s, e) => s + e.protein, 0) / proteinLogs.length);
    parts.push(avg >= targets.protein
      ? `hit your protein target (avg ${avg}g vs ${targets.protein}g goal)`
      : `averaged ${avg}g protein — ${targets.protein - avg}g below your ${targets.protein}g target`);
  }

  const trainDays = weekEntries.filter(e => e.trained).length;
  if (trainDays > 0) parts.push(`trained ${trainDays} day${trainDays !== 1 ? 's' : ''}`);

  const weightLogs = weekEntries.filter(e => e.weight != null).sort((a, b) => a.date.localeCompare(b.date));
  if (weightLogs.length >= 2) {
    const diff = +(weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight).toFixed(1);
    const dir = diff < 0 ? `down ${Math.abs(diff)}` : diff > 0 ? `up ${diff}` : 'holding steady';
    parts.push(`weight trended ${dir}${settings.weightUnit}`);
  }

  let note = parts.length ? `You ${parts.join(', ')}.` : '';

  const restDays = weekEntries.filter(e => !e.trained && e.feelings?.energy != null);
  const avgRestEnergy = restDays.length
    ? restDays.reduce((s, e) => s + e.feelings.energy, 0) / restDays.length : null;
  if (avgRestEnergy != null && avgRestEnergy < 3)
    note += ' Energy tends to dip on rest days — a short walk could help.';

  const trend = getWeightTrend(weekEntries);
  if (settings.goal === 'cutting' && trend === 'up')
    note += ' Weight trended up this week — check for hidden calorie sources.';
  if (settings.goal === 'cutting' && trend === 'flat' && weekEntries.length >= 5)
    note += ' Weight held steady — you may be approaching a plateau. Stay consistent.';
  if (settings.goal === 'bulking' && trend === 'flat' && weekEntries.length >= 5)
    note += ' Weight held steady in a bulk — consider adding a small calorie surplus.';

  return note || null;
}

export default function WeeklySummary({ entries, settings }) {
  const targets     = useMemo(() => calcTargets(entries, settings), [entries, settings]);
  const weekEntries = useMemo(() => getThisWeekEntries(entries), [entries]);

  const { breakdown, total: weekPts } = useMemo(
    () => calcWeekPoints(weekEntries, targets, settings),
    [weekEntries, targets, settings]
  );

  const totalPts = useMemo(() => calcTotalPoints(entries, targets, settings), [entries, targets, settings]);
  const levelInfo = useMemo(() => getLevelInfo(totalPts), [totalPts]);
  const coachNote = useMemo(() => generateCoachNote(weekEntries, targets, settings), [weekEntries, targets, settings]);

  const beforeAfter = useMemo(() => {
    const wl = weekEntries.filter(e => e.weight != null).sort((a, b) => a.date.localeCompare(b.date));
    if (wl.length < 2) return null;
    const start = wl[0].weight;
    const end   = wl[wl.length - 1].weight;
    const diff  = +(end - start).toFixed(1);
    const trendGood =
      (settings.goal === 'cutting'     && diff < 0)          ||
      (settings.goal === 'bulking'     && diff > 0)          ||
      (settings.goal === 'maintaining' && Math.abs(diff) < 0.5);
    return { start, end, diff, trendGood };
  }, [weekEntries, settings]);

  if (weekEntries.length < 2) return null;

  return (
    <>
      {/* ── Level & Points ── */}
      <div className="chart-card">
        <div className="chart-title">Your Progress</div>
        <div className="level-row">
          <span className="level-badge" style={{ color: levelInfo.color }}>{levelInfo.badge}</span>
          <div className="level-info">
            <div className="level-name" style={{ color: levelInfo.color }}>{levelInfo.name}</div>
            <div className="level-pts">{totalPts.toLocaleString()} pts · <span style={{ color: levelInfo.color }}>+{weekPts} this week</span></div>
          </div>
        </div>
        {levelInfo.nextLevel && (
          <div className="level-progress">
            <div className="level-bar">
              <div className="level-fill" style={{ width: `${levelInfo.progress * 100}%`, background: levelInfo.color }} />
            </div>
            <div className="level-next">
              {levelInfo.nextLevel.pts - totalPts} pts to {levelInfo.nextLevel.name} {levelInfo.nextLevel.badge}
            </div>
          </div>
        )}
        <div className="points-breakdown">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="points-row">
              <span className="points-label">{BREAKDOWN_META[key].label}</span>
              <div className="points-bar-bg">
                <div className="points-bar-fill"
                  style={{
                    width: `${(val / BREAKDOWN_META[key].max) * 100}%`,
                    background: val > 0 ? levelInfo.color : 'transparent',
                  }} />
              </div>
              <span className="points-val" style={{ color: val > 0 ? levelInfo.color : 'var(--muted)' }}>
                +{val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Before / After ── */}
      {beforeAfter && (
        <div className="chart-card">
          <div className="chart-title">This Week — Before / After</div>
          <div className="before-after">
            <div className="ba-block">
              <span className="ba-label">Start</span>
              <span className="ba-val">{beforeAfter.start}{settings.weightUnit}</span>
            </div>
            <div className="ba-arrow" style={{ color: beforeAfter.trendGood ? 'var(--success)' : 'var(--primary)' }}>
              <span className="ba-chevron">{beforeAfter.diff < 0 ? '↓' : beforeAfter.diff > 0 ? '↑' : '→'}</span>
              <span className="ba-diff">{Math.abs(beforeAfter.diff)}{settings.weightUnit}</span>
            </div>
            <div className="ba-block">
              <span className="ba-label">End</span>
              <span className="ba-val">{beforeAfter.end}{settings.weightUnit}</span>
            </div>
          </div>
          <div className="ba-verdict" style={{ color: beforeAfter.trendGood ? 'var(--success)' : 'var(--muted)' }}>
            {beforeAfter.trendGood
              ? `✓ On track for your ${settings.goal} goal`
              : `Not aligned with your ${settings.goal} goal — stay the course`}
          </div>
        </div>
      )}

      {/* ── Coach Note ── */}
      {coachNote && (
        <div className="chart-card coach-card">
          <div className="chart-title">📋 Weekly Coach Note</div>
          <p className="coach-note">{coachNote}</p>
        </div>
      )}
    </>
  );
}
