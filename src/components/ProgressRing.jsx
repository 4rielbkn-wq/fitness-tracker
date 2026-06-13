export default function ProgressRing({ value = 0, max = 1, size = 96, strokeWidth = 9, color, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);
  const ringColor = pct >= 1 ? 'var(--success)' : (color || 'var(--primary)');

  return (
    <div className="progress-ring">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--surface2)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s' }} />
      </svg>
      <div className="progress-ring-inner">
        <span className="ring-value">{label}</span>
        {sublabel && <span className="ring-sub">{sublabel}</span>}
      </div>
    </div>
  );
}
