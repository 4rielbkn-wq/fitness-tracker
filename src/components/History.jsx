function fmt(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

const TRAINING_COLORS = {
  strength: 'var(--primary)',
  cardio:   'var(--warning)',
  rest:     'var(--muted)',
};

export default function History({ entries, settings }) {
  const sorted = [...entries].reverse();

  if (!sorted.length) {
    return (
      <div className="dashboard-empty">
        <div className="empty-icon">📅</div>
        <p>No history yet.<br />Start logging to build your record.</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {sorted.map(e => (
        <div className="history-card" key={e.date}>
          <div className="history-top">
            <span className="history-date">{fmt(e.date)}</span>
            {e.trained && (
              <span className="history-badge" style={{ color: TRAINING_COLORS[e.trainingType] || 'var(--primary)' }}>
                🏋️ {e.trainingType || 'Trained'}
              </span>
            )}
          </div>
          <div className="history-stats">
            {e.weight   != null && <span>⚖️ {e.weight}{settings.weightUnit}</span>}
            {e.protein  != null && <span>🍗 {e.protein}g protein</span>}
            {e.calories != null && <span>🔥 {e.calories} kcal</span>}
            {e.steps    != null && <span>👣 {e.steps.toLocaleString()} steps</span>}
          </div>
          {e.note && <div className="history-note">"{e.note}"</div>}
          <div className="history-feelings">
            {e.feelings && Object.entries({
              '⚡': e.feelings.energy,
              '💪': e.feelings.soreness,
              '😴': e.feelings.sleep,
            }).map(([icon, val]) => val != null && (
              <span key={icon} className="feeling-pip">
                {icon} <span className="pip-dots">{Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`pip ${i < val ? 'on' : ''}`} />
                ))}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
