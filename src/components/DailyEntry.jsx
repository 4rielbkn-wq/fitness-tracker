import { useState, useEffect, useMemo } from 'react';
import { getEntries, saveEntry, getTodayStr } from '../utils/storage';
import { calcTargets } from '../utils/recommendations';
import FoodSearch from './FoodSearch';
import Slider from './Slider';

const TRAINING_TYPES = ['strength', 'cardio', 'rest'];

const FEELINGS = [
  { key: 'energy',   label: 'Energy',       emoji: '⚡' },
  { key: 'hunger',   label: 'Hunger',        emoji: '🍽️' },
  { key: 'soreness', label: 'Soreness',      emoji: '💪' },
  { key: 'sleep',    label: 'Sleep Quality', emoji: '😴' },
];

const WHY_TAGS = [
  '😫 Stress', '😴 Poor sleep', '✈️ Travel', '🍕 Social event',
  '🤒 Illness', '🍫 Cheat day', '😰 Long day', '❓ Other',
];

const blankEntry = () => ({
  date: getTodayStr(),
  weight: '', protein: '', calories: '', steps: '',
  trained: null, trainingType: '',
  feelings: { energy: 3, hunger: 3, soreness: 3, sleep: 3 },
  note: '', whyTags: [], noScaleDay: false, foods: [],
});

export default function DailyEntry({ entries, settings, onSave }) {
  const [form, setForm] = useState(blankEntry);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = entries.find(e => e.date === getTodayStr());
    if (existing) {
      setForm({
        ...blankEntry(),
        ...existing,
        weight:   existing.noScaleDay ? '' : (existing.weight   ?? ''),
        protein:  existing.protein  ?? '',
        calories: existing.calories ?? '',
        steps:    existing.steps    ?? '',
        whyTags:  existing.whyTags  || [],
        foods:    existing.foods    || [],
      });
    }
  }, [entries]);

  function set(field, val) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function setFeeling(key, val) {
    setForm(prev => ({ ...prev, feelings: { ...prev.feelings, [key]: parseInt(val, 10) } }));
  }

  function toggleWhyTag(tag) {
    setForm(prev => ({
      ...prev,
      whyTags: prev.whyTags.includes(tag)
        ? prev.whyTags.filter(t => t !== tag)
        : [...prev.whyTags, tag],
    }));
  }

  function handleFoodsChange(newFoods) {
    const totalKcal    = Math.round(newFoods.reduce((s, f) => s + f.kcal, 0));
    const totalProtein = Math.round(newFoods.reduce((s, f) => s + f.protein, 0) * 10) / 10;
    setForm(prev => ({
      ...prev,
      foods:    newFoods,
      calories: newFoods.length ? String(totalKcal)    : prev.calories,
      protein:  newFoods.length ? String(totalProtein) : prev.protein,
    }));
  }

  function handleSave() {
    saveEntry({
      ...form,
      weight:   form.noScaleDay || form.weight === ''   ? null : parseFloat(form.weight),
      protein:  form.protein  !== '' ? parseFloat(form.protein)  : null,
      calories: form.calories !== '' ? parseInt(form.calories, 10) : null,
      steps:    form.steps    !== '' ? parseInt(form.steps, 10)    : null,
    });
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 2000);
  }

  const targets = calcTargets(entries, settings);

  const prevWeight = useMemo(() => {
    const today = getTodayStr();
    const prev = entries.filter(e => e.date < today && e.weight != null);
    return prev.length ? prev[prev.length - 1].weight : null;
  }, [entries]);

  const weightFloat = form.weight !== '' ? parseFloat(form.weight) : null;
  const showWhyTags =
    form.feelings.energy <= 2 ||
    form.feelings.soreness >= 4 ||
    (weightFloat && prevWeight && Math.abs(weightFloat - prevWeight) >= 1.5);

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="entry-form">
      <div className="entry-date">{todayLabel}</div>

      {/* Weight */}
      <div className="form-field">
        <label>⚖️ Body Weight</label>
        {!form.noScaleDay ? (
          <div className="input-unit">
            <input type="number" step="0.1" placeholder="185.0"
              value={form.weight} onChange={e => set('weight', e.target.value)} />
            <span>{settings.weightUnit}</span>
          </div>
        ) : (
          <div className="no-scale-placeholder">No scale today — trend will interpolate</div>
        )}
        <label className="no-scale-toggle">
          <input type="checkbox" checked={form.noScaleDay}
            onChange={e => set('noScaleDay', e.target.checked)} />
          <span>No-scale day</span>
        </label>
      </div>

      {/* Food Search */}
      <FoodSearch foods={form.foods} onFoodsChange={handleFoodsChange} />

      {/* Protein + Calories + Steps */}
      <div className="form-grid">
        <div className="form-field">
          <label>🍗 Protein</label>
          <div className="input-unit">
            <input type="number" placeholder={targets.protein}
              value={form.protein} onChange={e => set('protein', e.target.value)} />
            <span>g</span>
          </div>
        </div>

        <div className="form-field">
          <label>🔥 Calories</label>
          <div className="input-unit">
            <input type="number" placeholder={targets.calories}
              value={form.calories} onChange={e => set('calories', e.target.value)} />
            <span>kcal</span>
          </div>
        </div>

        <div className="form-field" style={{ gridColumn: '1 / -1' }}>
          <label>👣 Steps</label>
          <div className="input-unit">
            <input type="number" placeholder={settings.stepsGoal}
              value={form.steps} onChange={e => set('steps', e.target.value)} />
            <span>steps</span>
          </div>
        </div>
      </div>

      {/* Training */}
      <div className="form-field">
        <label>🏋️ Did you train today?</label>
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

      {/* Feelings */}
      <div className="feelings-section">
        <div className="section-title">How do you feel?</div>
        {FEELINGS.map(({ key, label, emoji }) => (
          <div className="feeling-row" key={key}>
            <span className="feeling-label">{emoji} {label}</span>
            <div className="slider-row">
              <span className="slider-val">{form.feelings[key]}</span>
              <Slider
                value={form.feelings[key]}
                min={1} max={5}
                onChange={e => setFeeling(key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Why tags */}
      {showWhyTags && (
        <div className="why-section">
          <div className="section-title">⚡ What happened? (optional)</div>
          <div className="why-tags">
            {WHY_TAGS.map(tag => (
              <button key={tag}
                className={`why-tag ${form.whyTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleWhyTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="form-field">
        <label>📝 Note (optional)</label>
        <textarea placeholder="How did today go?" rows={2}
          value={form.note} onChange={e => set('note', e.target.value)} />
      </div>

      <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? '✓ Saved!' : "Save Today's Log"}
      </button>
    </div>
  );
}
