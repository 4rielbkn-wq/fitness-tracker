import { useState } from 'react';

export default function Slider({ value, min = 1, max = 5, onChange }) {
  const [active, setActive] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-wrap" style={{ '--fill': `${pct}%` }}>
      {active && (
        <div
          className="slider-float"
          style={{ left: `clamp(8px, calc(${pct}% * 0.88 + 4px), calc(100% - 20px))` }}
        >
          {value}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        onPointerDown={() => setActive(true)}
        onPointerUp={() => setActive(false)}
        onPointerLeave={() => setActive(false)}
        className="custom-slider"
      />
    </div>
  );
}
