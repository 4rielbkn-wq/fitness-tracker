import { useState } from 'react';
import { DEFAULT_SETTINGS } from '../utils/storage';
import { calcTargets } from '../utils/recommendations';

const GOALS = [
  { value: 'cutting',    label: 'Cutting',    desc: 'Lose fat' },
  { value: 'maintaining', label: 'Maintaining', desc: 'Stay lean' },
  { value: 'bulking',   label: 'Bulking',    desc: 'Build muscle' },
];

export default function Settings({ settings, onSave, entries }) {
  const [form, setForm] = useState({ ...settings });

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    onSave(form);
  }

  const preview = calcTargets(entries, form);

  return (
    <div className="settings-page">
      <div className="settings-section">
        <div className="settings-label">Goal</div>
        <div className="goal-group">
          {GOALS.map(g => (
            <button key={g.value}
              className={`goal-btn ${form.goal === g.value ? 'active' : ''}`}
              onClick={() => set('goal', g.value)}>
              <span className="goal-name">{g.label}</span>
              <span className="goal-desc">{g.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-label">Weight Unit</div>
        <div className="toggle-group">
          {['lbs', 'kg'].map(u => (
            <button key={u}
              className={`toggle-btn ${form.weightUnit === u ? 'active' : ''}`}
              onClick={() => set('weightUnit', u)}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-label">Protein Target</div>
        <div className="mode-row">
          {['manual', 'auto'].map(m => (
            <button key={m}
              className={`toggle-btn ${form.proteinMode === m ? 'active' : ''}`}
              onClick={() => set('proteinMode', m)}>
              {m === 'auto' ? 'Auto (1.8g/kg)' : 'Manual'}
            </button>
          ))}
        </div>
        {form.proteinMode === 'manual' ? (
          <div className="input-unit" style={{ marginTop: 10 }}>
            <input type="number" value={form.proteinTarget}
              onChange={e => set('proteinTarget', parseInt(e.target.value, 10) || 0)} />
            <span>g/day</span>
          </div>
        ) : (
          <div className="auto-preview">Auto target: <strong>{preview.protein}g</strong></div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-label">Calorie Target</div>
        <div className="mode-row">
          {['manual', 'auto'].map(m => (
            <button key={m}
              className={`toggle-btn ${form.calorieMode === m ? 'active' : ''}`}
              onClick={() => set('calorieMode', m)}>
              {m === 'auto' ? 'Auto (from weight)' : 'Manual'}
            </button>
          ))}
        </div>
        {form.calorieMode === 'manual' ? (
          <div className="input-unit" style={{ marginTop: 10 }}>
            <input type="number" value={form.calorieTarget}
              onChange={e => set('calorieTarget', parseInt(e.target.value, 10) || 0)} />
            <span>kcal/day</span>
          </div>
        ) : (
          <div className="auto-preview">Auto target: <strong>{preview.calories} kcal</strong> ({form.goal})</div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-label">Daily Steps Goal</div>
        <div className="input-unit">
          <input type="number" value={form.stepsGoal}
            onChange={e => set('stepsGoal', parseInt(e.target.value, 10) || 0)} />
          <span>steps</span>
        </div>
      </div>

      <button className="save-btn" onClick={handleSave}>Save Settings</button>
    </div>
  );
}
