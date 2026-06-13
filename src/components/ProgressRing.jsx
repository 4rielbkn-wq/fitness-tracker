export default function ProgressRing({ value = 0, max = 1, size = 112, strokeWidth = 11, color, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);
  const ringColor = pct >= 1 ? 'var(--success)' : (color || 'var(--primary)');

  return (
    <div className="progress-ring">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <defs>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--ring-track)" strokeWidth={strokeWidth}
        />
        {/* Fill */}
        {pct > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter="url(#ring-glow)"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1), stroke 0.3s' }}
          />
        )}
      </svg>
      <div className="progress-ring-inner">
        <span className="ring-value">{label}</span>
        {sublabel && <span className="ring-sub">{sublabel}</span>}
      </div>
    </div>
  );
}
