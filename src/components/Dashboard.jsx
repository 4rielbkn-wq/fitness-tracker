import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getEntries, getProteinTarget } from '../utils/storage';

function rollingAvg(entries, days = 7) {
  return entries.map((e, i) => {
    const window = entries
      .slice(Math.max(0, i - days + 1), i + 1)
      .filter(x => x.weight != null);
    const avg = window.length
      ? window.reduce((s, x) => s + x.weight, 0) / window.length
      : null;
    return { ...e, rollingWeight: avg != null ? +avg.toFixed(1) : null };
  });
}

function getWeekEntries(entries) {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return entries.filter(e => new Date(e.date + 'T00:00:00') >= start);
}

function fmt(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const tooltipStyle = {
  contentStyle: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#888' },
};

export default function Dashboard() {
  const allEntries = getEntries();
  const proteinTarget = getProteinTarget();

  const last30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 29);
    cutoff.setHours(0, 0, 0, 0);
    return allEntries.filter(e => new Date(e.date + 'T00:00:00') >= cutoff);
  }, []);

  const chartData = useMemo(() =>
    rollingAvg(last30).map(e => ({
      date:    fmt(e.date),
      weight:  e.rollingWeight,
      protein: e.protein,
      steps:   e.steps,
      energy:  e.feelings?.energy   ?? null,
      soreness:e.feelings?.soreness ?? null,
      sleep:   e.feelings?.sleep    ?? null,
    })),
  [last30]);

  const thisWeek = useMemo(() => getWeekEntries(allEntries), []);

  const stats = useMemo(() => {
    const trainDays    = thisWeek.filter(e => e.trained).length;
    const proteinHit   = thisWeek.filter(e => e.protein != null && e.protein >= proteinTarget).length;
    const proteinLogs  = thisWeek.filter(e => e.protein != null);
    const avgProtein   = proteinLogs.length
      ? Math.round(proteinLogs.reduce((s, e) => s + e.protein, 0) / proteinLogs.length)
      : null;

    const weightLogs = thisWeek.filter(e => e.weight != null);
    let trend = '—';
    if (weightLogs.length >= 2) {
      const diff = weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight;
      trend = diff < -0.5 ? 'Down ↓' : diff > 0.5 ? 'Up ↑' : 'Flat →';
    }

    return { trainDays, proteinHit, avgProtein, trend };
  }, [thisWeek, proteinTarget]);

  if (!allEntries.length) {
    return (
      <div className="dashboard-empty">
        <div className="empty-icon">📊</div>
        <p>No data yet.<br />Start logging to see your dashboard!</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="summary-card">
        <div className="section-title">This Week</div>
        <div className="summary-grid">
          <div className="summary-stat">
            <span className="stat-val">{stats.trend}</span>
            <span className="stat-label">Weight trend</span>
          </div>
          <div className="summary-stat">
            <span className="stat-val">{stats.trainDays}</span>
            <span className="stat-label">Training days</span>
          </div>
          <div className="summary-stat">
            <span className="stat-val">{stats.proteinHit}/7</span>
            <span className="stat-label">Protein target hit</span>
          </div>
          <div className="summary-stat">
            <span className="stat-val">{stats.avgProtein != null ? `${stats.avgProtein}g` : '—'}</span>
            <span className="stat-label">Avg protein</span>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-title">7-Day Rolling Weight (lbs)</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} domain={['auto', 'auto']} width={40} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="weight" name="Avg Weight"
              stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">Daily Steps</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} width={40} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="steps" fill="#22c55e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">Daily Protein (g)</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} width={40} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine y={proteinTarget} stroke="#f97316" strokeDasharray="4 2" label={{ value: 'Target', fill: '#f97316', fontSize: 10 }} />
            <Bar dataKey="protein" fill="#f97316" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">Feelings Over Time (1–5)</div>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
            <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: '#666' }} width={24} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
            <Line type="monotone" dataKey="energy"   name="Energy"   stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="soreness" name="Soreness" stroke="#ef4444" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="sleep"    name="Sleep"    stroke="#8b5cf6" strokeWidth={1.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
