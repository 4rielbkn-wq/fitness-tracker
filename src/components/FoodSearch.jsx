import { useState, useEffect, useRef } from 'react';
import { searchFoods, getMyFoods, saveToMyFoods, removeFromMyFoods } from '../utils/foodApi';

export default function FoodSearch({ foods, onFoodsChange }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);
  const [grams,    setGrams]    = useState('100');
  const [myFoods,  setMyFoods]  = useState(() => getMyFoods());
  const [open,     setOpen]     = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const res = await searchFoods(query);
      setResults(res);
      setLoading(false);
    }, 320);
    return () => clearTimeout(timer.current);
  }, [query]);

  function selectFood(food) {
    setSelected(food);
    setGrams('100');
    setResults([]);
    setQuery('');
  }

  function addFood() {
    if (!selected || !grams) return;
    const g = parseFloat(grams);
    if (!g || g <= 0) return;
    const kcal    = Math.round(selected.kcal100g    * g / 100);
    const protein = Math.round(selected.protein100g * g / 100 * 10) / 10;
    onFoodsChange([...foods, {
      id: crypto.randomUUID(),
      name: selected.name,
      emoji: selected.emoji,
      grams: g,
      kcal,
      protein,
    }]);
    setSelected(null);
    setGrams('100');
  }

  function removeFood(id) {
    onFoodsChange(foods.filter(f => f.id !== id));
  }

  function starFood(food, e) {
    e.stopPropagation();
    saveToMyFoods(food);
    setMyFoods(getMyFoods());
  }

  function unstarFood(id, e) {
    e.stopPropagation();
    removeFromMyFoods(id);
    setMyFoods(getMyFoods());
  }

  const previewKcal    = selected ? Math.round(selected.kcal100g    * parseFloat(grams || 0) / 100) : 0;
  const previewProtein = selected ? Math.round(selected.protein100g * parseFloat(grams || 0) / 100 * 10) / 10 : 0;

  const totalKcal    = foods.reduce((s, f) => s + f.kcal,    0);
  const totalProtein = foods.reduce((s, f) => s + f.protein, 0);

  return (
    <div className="food-section">
      <button className="food-toggle" onClick={() => setOpen(o => !o)}>
        🍽️ Food Log {foods.length > 0 && <span className="food-badge">{foods.length}</span>}
        <span className="food-toggle-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="food-body">
          {/* My Foods quick-add */}
          {!query && myFoods.length > 0 && !selected && (
            <div className="my-foods">
              <div className="food-sublabel">⭐ My Foods</div>
              <div className="my-foods-grid">
                {myFoods.map(f => (
                  <button key={f.id} className="my-food-chip" onClick={() => selectFood(f)}>
                    {f.emoji} {f.name.split(' ')[0]}
                    <span className="my-food-remove" onClick={e => unstarFood(f.id, e)}>×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search bar */}
          {!selected && (
            <div className="food-search-bar">
              <span className="food-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search food (e.g. banana, chicken...)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="food-search-input"
                autoComplete="off"
              />
              {loading && <span className="food-loading">⏳</span>}
            </div>
          )}

          {/* Search results */}
          {!selected && results.length > 0 && (
            <div className="food-results">
              {results.map((r, i) => (
                <button key={i} className="food-result-row" onClick={() => selectFood(r)}>
                  <span className="food-result-emoji">{r.emoji}</span>
                  <span className="food-result-name">{r.name}</span>
                  <span className="food-result-cal">{r.kcal100g} kcal/100g</span>
                  <span className="food-result-star" onClick={e => starFood(r, e)} title="Save to My Foods">⭐</span>
                </button>
              ))}
            </div>
          )}

          {/* Gram entry after food selected */}
          {selected && (
            <div className="food-add-form">
              <div className="food-selected-name">{selected.emoji} {selected.name}</div>
              <div className="food-gram-row">
                <div className="input-unit" style={{ flex: 1 }}>
                  <input
                    type="number"
                    value={grams}
                    onChange={e => setGrams(e.target.value)}
                    placeholder="100"
                    autoFocus
                  />
                  <span>g</span>
                </div>
                <div className="food-preview">
                  <span>{previewKcal} kcal</span>
                  <span>{previewProtein}g protein</span>
                </div>
              </div>
              <div className="food-add-btns">
                <button className="food-add-btn" onClick={addFood}>+ Add</button>
                <button className="food-cancel-btn" onClick={() => setSelected(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Today's foods */}
          {foods.length > 0 && (
            <div className="todays-foods">
              <div className="food-sublabel">Today's Foods</div>
              {foods.map(f => (
                <div key={f.id} className="food-item">
                  <span className="food-item-emoji">{f.emoji}</span>
                  <div className="food-item-info">
                    <span className="food-item-name">{f.name}</span>
                    <span className="food-item-meta">{f.grams}g · {f.kcal} kcal · {f.protein}g protein</span>
                  </div>
                  <button className="food-item-remove" onClick={() => removeFood(f.id)}>×</button>
                </div>
              ))}
              <div className="food-total-row">
                <span>Total</span>
                <span>{totalKcal} kcal · {Math.round(totalProtein * 10) / 10}g protein</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
