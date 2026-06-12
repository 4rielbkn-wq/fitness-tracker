import { useState, useEffect } from 'react';
import { getEntries, saveEntry, getTodayStr } from '../utils/storage';

const TRAINING_TYPES = ['strength', 'cardio', 'rest'];

const FEELINGS = [
  { key: 'energy',   label: 'Energy',        emoji: '⚡' },
  { key: 'hunger',   label: 'Hunger',         emoji: '🍽️' },
  { key: 'soreness', label: 'Soreness',       emoji: '💪' },
  { key: 'sleep',    label: 'Sleep Quality',  emoji: '😴' },
];

const blankEntry = () => ({
  date: getTodayStr(),
  weight: '',
  protein: '',
  trained: null,
  trainingType: '',
  steps: '',
  feelings: { energy: 3, hunger: 3, soreness: 3, sleep: 3 },
  note: '',
});

export default function DailyEntry() {
  const [form, setForm] = useState(blankEntry);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getEntries().find(e => e.date === getTodayStr());
    if (existing) {
      setForm({
        ...existing,
        weight: existing.weight ?? '',
        protein: existing.protein ?? '',
        steps: existing.steps ?? '',
      });
    }
  }, []);

  function set(field, val) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function setFeeling(key, val) {
    setForm(prev => ({ ...prev, feelings: { ...prev.feelings, [key]: parseInt(val, 10) } }));
  }

  function handleSave() {
    saveEntry({
      ...form,
      weight:  form.weight  !== '' ? parseFloat(form.weight)  : null,
      protein: form.protein !== '' ? parseInt(form.protein, 10) : null,
      steps:   form.steps   !== '' ? parseInt(form.steps, 10)   : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="entry-form">
      <div className="entry-date">{todayLabel}</div>

      <div className="form-grid">
        <div className="form-field">
          <label>Body Weight</label>
          <div className="input-unit">
            <input type="number" step="0.1" placeholder="185.0"
              value={form.weight} onChange={e => set('weight', e.target.value)} />
            <span>lbs</span>
          </div>
        </div>

        <div className="form-field">
          <label>Protein</label>
          <div className="input-unit">
            <input type="number" placeholder="150"
              value={form.protein} onChange={e => set('protein', e.target.value)} />
            <span>g</span>
          </div>
        </div>

        <div className="form-field full-width">
          <label>Steps</label>
          <input type="number" placeholder="8000"
            value={form.steps} onChange={e => set('steps', e.target.value)} />
        </div>
      </div>

      <div className="form-field">
        <label>Did you train today?</label>
        <div className="toggle-group">
          {[true, false].map(v => (
            <button key={String(v)}
              className={`toggle-btn ${form.trained === v ? 'active' : ''}`}
              onClick={() => set('trained', form.trained === v ? null : v)}>
              {v ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
        {form.trained && (
          <div className="type-group">
            {TRAINING_TYPES.map(t => (
              <button key={t}
                className={`type-btn ${form.trainingType === t ? 'active' : ''}`}
                onClick={() => set('trainingType', t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="feelings-section">
        <div className="section-title">How do you feel?</div>
        {FEELINGS.map(({ key, label, emoji }) => (
          <div className="feeling-row" key={key}>
            <span className="feeling-label">{emoji} {label}</span>
            <div className="slider-row">
              <span className="slider-val">{form.feelings[key]}</span>
              <input type="range" min="1" max="5"
                value={form.feelings[key]}
                onChange={e => setFeeling(key, e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="form-field">
        <label>Note (optional)</label>
        <textarea placeholder="How did today go?" rows={2}
          value={form.note} onChange={e => set('note', e.target.value)} />
      </div>

      <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? '✓ Saved!' : "Save Today's Log"}
      </button>
    </div>
  );
}
