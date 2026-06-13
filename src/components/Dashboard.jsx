import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import ProgressRing from './ProgressRing';
import WeeklySummary from './WeeklySummary';
import {
  calcTargets, getStreak, getWeightTrend,
  getTrendDisplay, getProteinInsight, getCalorieInsight,
} from '../utils/recommendations';
import { getTodayStr } from '../utils/storage';

function rollingAvg(entries, days = 7) {
  return entries.map((e, i) => {
    const win = entries.slice(Math.max(0, i - days + 1), i + 1).filter(x => x.weight != null);
    const avg = win.length ? win.reduce((s, x) => s + x.weight, 0) / win.length : null;
    return { ...e, rollingWeight: avg != null ? +avg.toFixed(1) : null };
  });
}

function fmt(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

const ttStyle = {
  contentStyle: { background: '#1E1E1E', border: '1px solid #2C2C2C', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#888' },
  cursor: { stroke: '#2C2C2C' },
};

export default function Dashboard({ entries, settings }) {
  const targets = useMemo(() => calcTargets(entries, settings), [entries, settings]);
  const streak  = useMemo(() => getStreak(entries), [entries]);

  const today = useMemo(() => entries.find(e => e.date === getTodayStr()) || {}, [entries]);

  const last30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 29);
    cutoff.setHours(0, 0, 0, 0);
    return entries.filter(e => new Date(e.date + 'T12:00:00') >= cutoff);
  }, [entries]);

  const chartData = useMemo(() =>
    rollingAvg(last30).map(e => ({
      date:     fmt(e.date),
      weight:   e.rollingWeight,
      protein:  e.protein,
      calories: e.calories,
      steps:    e.steps,
      energy:   e.feelings?.energy   ?? null,
      soreness: e.feelings?.soreness ?? null,
      sleep:    e.feelings?.sleep    ?? null,
    })),
  [last30]);

  const weekStats = useMemo(() => {
    const ws = getWeekStart();
    const week = entries.filter(e => new Date(e.date + 'T12:00:00') >= ws);
    const trainDays  = week.filter(e => e.trained).length;
    const proteinHit = week.filter(e => e.protein != null && e.protein >= targets.protein).length;
    const calHit     = week.filter(e => e.calories != null && e.calories <= targets.calories * 1.05).length;
    const proteinLogs = week.filter(e => e.protein != null);
    const avgProtein = proteinLogs.length
      ? Math.round(proteinLogs.reduce((s, e) => s + e.protein, 0) / proteinLogs.length)
      : null;
    return { trainDays, proteinHit, calHit, avgProtein };
  }, [entries, targets]);

  const trend        = useMemo(() => getWeightTrend(entries), [entries]);
  const trendDisplay = useMemo(() => getTrendDisplay(trend, settings.goal), [trend, settings.goal]);
  const proteinHint  = useMemo(() => getProteinInsight(entries, targets.protein), [entries, targets]);
  const calorieHint  = useMemo(() => getCalorieInsight(entries, settings, targets.calories), [entries, settings, targets]);

  if (!entries.length) {
    return (
      <div className="dashboard-empty">
        <div className="empty-icon">📊</div>
        <p>No data yet.<br />Start logging to see your dashboard!</p>
      </div>
    );
  }

  const goalLabel = settings.goal.charAt(0).toUpperCase() + settings.goal.slice(1);

  return (
    <div className="dashboard">
      {/* ── Hero ── */}
      <div className="dash-hero">
        <div className="hero-left">
          <div className="hero-goal-badge">{goalLabel}</div>
          <div className="hero-trend" style={{ color: trendDisplay.color }}>
            <span className="trend-arrow">{trendDisplay.arrow}</span>
            <span className="trend-label">{trendDisplay.label}</span>
          </div>
        </div>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-flame">🔥</span>
            <span className="streak-num">{streak}</span>
            <span className="streak-label">day streak</span>
          </div>
        )}
      </div>

      {/* ── Today's Rings ── */}
      <div className="chart-card">
        <div className="chart-title">Today's Progress</div>
        <div className="rings-row">
          <div className="ring-item">
            <ProgressRing
              value={today.protein || 0}
              max={targets.protein}
              color="var(--primary)"
              label={today.protein != null ? `${today.protein}g` : '—'}
              sublabel={`/ ${targets.protein}g`}
            />
            <span className="ring-name">🍗 Protein</span>
          </div>
          <div className="ring-item">
            <ProgressRing
              value={today.calories || 0}
              max={targets.calories}
              color="var(--warning)"
              label={today.calories != null ? today.calories : '—'}
              sublabel={`/ ${targets.calories}`}
            />
            <span className="ring-name">🔥 Calories</span>
          </div>
          <div className="ring-item">
            <ProgressRing
              value={today.steps || 0}
              max={settings.stepsGoal}
              color="#3b82f6"
              label={today.steps != null ? (today.steps >= 1000 ? `${(today.steps / 1000).toFixed(1)}k` : today.steps) : '—'}
              sublabel={`/ ${(settings.stepsGoal / 1000).toFixed(0)}k`}
            />
            <span className="ring-name">👣 Steps</span>
          </div>
        </div>
      </div>

      {/* ── Weekly Summary ── */}
      <div className="summary-card">
        <div className="section-title">This Week</div>
        <div className="summary-grid">
          <div className="summary-stat">
            <span className="stat-val" style={{ color: trendDisplay.color }}>{trendDisplay.arrow} {trendDisplay.label}</span>
            <span className="stat-label">Weight trend</span>
          </div>
          <div className="summary-stat">
            <span className="stat-val">{weekStats.trainDays}</span>
            <span className="stat-label">Training days</span>
          </div>
          <div className="summary-stat">
            <span className="stat-val" style={{ color: weekStats.proteinHit >= 5 ? 'var(--success)' : 'var(--text)' }}>
              {weekStats.proteinHit}/7
            </span>
            <span className="stat-label">Protein target hit</span>
          </div>
          <div className="summary-stat">
            <span className="stat-val">{weekStats.avgProtein != null ? `${weekStats.avgProtein}g` : '—'}</span>
            <span className="stat-label">Avg protein</span>
          </div>
        </div>
      </div>

      {/* ── Insight Cards ── */}
      {(proteinHint || calorieHint) && (
        <div className="insights-section">
          {[proteinHint, calorieHint].filter(Boolean).map((hint, i) => (
            <div key={i} className={`insight-card insight-${hint.type}`}>
              <div className="insight-title">
                {hint.type === 'warning' ? '⚠️' : 'ℹ️'} {hint.title}
              </div>
              <div className="insight-msg">{hint.msg}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Weight Trend ── */}
      <div className="chart-card">
        <div className="chart-title">7-Day Rolling Weight ({settings.weightUnit})</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555' }} />
            <YAxis tick={{ fontSize: 10, fill: '#555' }} domain={['auto', 'auto']} width={38} />
            <Tooltip {...ttStyle} />
            <Line type="monotone" dataKey="weight" name={`Weight (${settings.weightUnit})`}
              stroke="var(--primary)" strokeWidth={2.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Calorie Chart ── */}
      <div className="chart-card">
        <div className="chart-title">Daily Calories vs Target</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555' }} />
            <YAxis tick={{ fontSize: 10, fill: '#555' }} width={38} />
            <Tooltip {...ttStyle} />
            <ReferenceLine y={targets.calories} stroke="var(--warning)" strokeDasharray="4 2"
              label={{ value: 'Target', fill: 'var(--warning)', fontSize: 10, position: 'insideTopRight' }} />
            <Bar dataKey="calories" name="Calories" fill="var(--warning)" radius={[3, 3, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Protein Chart ── */}
      <div className="chart-card">
        <div className="chart-title">Daily Protein (g)</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555' }} />
            <YAxis tick={{ fontSize: 10, fill: '#555' }} width={38} />
            <Tooltip {...ttStyle} />
            <ReferenceLine y={targets.protein} stroke="var(--primary)" strokeDasharray="4 2"
              label={{ value: 'Target', fill: 'var(--primary)', fontSize: 10, position: 'insideTopRight' }} />
            <Bar dataKey="protein" name="Protein (g)" fill="var(--primary)" radius={[3, 3, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Steps Chart ── */}
      <div className="chart-card">
        <div className="chart-title">Daily Steps</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555' }} />
            <YAxis tick={{ fontSize: 10, fill: '#555' }} width={38} />
            <Tooltip {...ttStyle} />
            <ReferenceLine y={settings.stepsGoal} stroke="#3b82f6" strokeDasharray="4 2" />
            <Bar dataKey="steps" name="Steps" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Weekly Summary + Points ── */}
      <WeeklySummary entries={entries} settings={settings} />

      {/* ── Feelings Chart ── */}
      <div className="chart-card">
        <div className="chart-title">Feelings Over Time (1–5)</div>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555' }} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#555' }} width={24} />
            <Tooltip {...ttStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#666' }} />
            <Line type="monotone" dataKey="energy"   name="Energy"   stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="soreness" name="Soreness" stroke="var(--primary)" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="sleep"    name="Sleep"    stroke="#8b5cf6" strokeWidth={1.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
