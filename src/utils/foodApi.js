const CACHE_KEY = 'fitlog_food_cache';
const MY_FOODS_KEY = 'fitlog_my_foods';
const CACHE_TTL = 3600000; // 1 hour

export const FALLBACK_FOODS = [
  { name: 'Chicken breast',       emoji: '🍗', kcal100g: 165, protein100g: 31   },
  { name: 'Turkey breast',        emoji: '🍗', kcal100g: 135, protein100g: 30   },
  { name: 'Egg',                  emoji: '🥚', kcal100g: 155, protein100g: 13   },
  { name: 'Salmon',               emoji: '🐟', kcal100g: 208, protein100g: 20   },
  { name: 'Tuna (canned)',        emoji: '🐟', kcal100g: 116, protein100g: 26   },
  { name: 'Beef (lean mince)',    emoji: '🥩', kcal100g: 215, protein100g: 26   },
  { name: 'Steak',                emoji: '🥩', kcal100g: 271, protein100g: 26   },
  { name: 'Greek yogurt',         emoji: '🥛', kcal100g:  97, protein100g: 10   },
  { name: 'Cottage cheese',       emoji: '🥛', kcal100g:  98, protein100g: 11   },
  { name: 'Cheese (cheddar)',     emoji: '🧀', kcal100g: 402, protein100g: 25   },
  { name: 'Milk (whole)',         emoji: '🥛', kcal100g:  61, protein100g:  3.2 },
  { name: 'Whey protein powder',  emoji: '💪', kcal100g: 380, protein100g: 80   },
  { name: 'White rice (cooked)',  emoji: '🍚', kcal100g: 130, protein100g:  2.7 },
  { name: 'Brown rice (cooked)',  emoji: '🍚', kcal100g: 123, protein100g:  2.7 },
  { name: 'Oats',                 emoji: '🌾', kcal100g: 389, protein100g: 17   },
  { name: 'Pasta (cooked)',       emoji: '🍝', kcal100g: 158, protein100g:  5.8 },
  { name: 'Bread (white)',        emoji: '🍞', kcal100g: 265, protein100g:  9   },
  { name: 'Bread (wholemeal)',    emoji: '🍞', kcal100g: 247, protein100g: 13   },
  { name: 'Potato',               emoji: '🥔', kcal100g:  77, protein100g:  2   },
  { name: 'Sweet potato',         emoji: '🍠', kcal100g:  86, protein100g:  1.6 },
  { name: 'Quinoa (cooked)',      emoji: '🌾', kcal100g: 120, protein100g:  4.4 },
  { name: 'Lentils (cooked)',     emoji: '🫘', kcal100g: 116, protein100g:  9   },
  { name: 'Banana',               emoji: '🍌', kcal100g:  89, protein100g:  1.1 },
  { name: 'Apple',                emoji: '🍎', kcal100g:  52, protein100g:  0.3 },
  { name: 'Orange',               emoji: '🍊', kcal100g:  47, protein100g:  0.9 },
  { name: 'Blueberries',          emoji: '🫐', kcal100g:  57, protein100g:  0.7 },
  { name: 'Avocado',              emoji: '🥑', kcal100g: 160, protein100g:  2   },
  { name: 'Broccoli',             emoji: '🥦', kcal100g:  34, protein100g:  2.8 },
  { name: 'Spinach',              emoji: '🥬', kcal100g:  23, protein100g:  2.9 },
  { name: 'Carrots',              emoji: '🥕', kcal100g:  41, protein100g:  0.9 },
  { name: 'Peanut butter',        emoji: '🥜', kcal100g: 588, protein100g: 25   },
  { name: 'Almonds',              emoji: '🌰', kcal100g: 579, protein100g: 21   },
  { name: 'Olive oil',            emoji: '🫙', kcal100g: 884, protein100g:  0   },
  { name: 'Pizza',                emoji: '🍕', kcal100g: 266, protein100g: 11   },
  { name: 'Chocolate (dark)',     emoji: '🍫', kcal100g: 546, protein100g:  5   },
];

export function emojiForName(name) {
  const n = name.toLowerCase();
  if (n.includes('chicken') || n.includes('turkey'))              return '🍗';
  if (n.includes('beef') || n.includes('steak') || n.includes('mince')) return '🥩';
  if (n.includes('salmon') || n.includes('tuna') || n.includes('fish')) return '🐟';
  if (n.includes('egg'))                                           return '🥚';
  if (n.includes('cheese'))                                        return '🧀';
  if (n.includes('milk') || n.includes('yogurt') || n.includes('dairy')) return '🥛';
  if (n.includes('bread') || n.includes('toast'))                  return '🍞';
  if (n.includes('rice'))                                          return '🍚';
  if (n.includes('pasta') || n.includes('spaghetti'))              return '🍝';
  if (n.includes('potato') && n.includes('sweet'))                 return '🍠';
  if (n.includes('potato'))                                        return '🥔';
  if (n.includes('oat'))                                           return '🌾';
  if (n.includes('banana'))                                        return '🍌';
  if (n.includes('apple'))                                         return '🍎';
  if (n.includes('orange') || n.includes('citrus'))                return '🍊';
  if (n.includes('blueberr') || n.includes('strawberr'))           return '🫐';
  if (n.includes('avocado'))                                       return '🥑';
  if (n.includes('broccoli'))                                      return '🥦';
  if (n.includes('spinach') || n.includes('lettuce'))              return '🥬';
  if (n.includes('carrot'))                                        return '🥕';
  if (n.includes('peanut'))                                        return '🥜';
  if (n.includes('almond') || n.includes('nut'))                   return '🌰';
  if (n.includes('protein') || n.includes('whey'))                 return '💪';
  if (n.includes('pizza'))                                         return '🍕';
  if (n.includes('burger') || n.includes('sandwich'))              return '🍔';
  if (n.includes('chocolate'))                                     return '🍫';
  if (n.includes('oil'))                                           return '🫙';
  if (n.includes('bean') || n.includes('lentil'))                  return '🫘';
  if (n.includes('quinoa') || n.includes('grain'))                 return '🌾';
  return '🍽️';
}

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; }
  catch { return {}; }
}

function writeCache(key, data) {
  const cache = loadCache();
  cache[key] = { data, ts: Date.now() };
  const keys = Object.keys(cache);
  if (keys.length > 80) delete cache[keys[0]];
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

export async function searchFoods(rawQuery) {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return [];

  const cache = loadCache();
  if (cache[q] && Date.now() - cache[q].ts < CACHE_TTL) return cache[q].data;

  try {
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl?action=process&json=1` +
      `&search_terms=${encodeURIComponent(q)}&fields=product_name,nutriments` +
      `&page_size=10&search_simple=1&lc=en`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json = await res.json();
      const results = (json.products || [])
        .filter(p =>
          p.product_name &&
          p.nutriments?.['energy-kcal_100g'] > 0
        )
        .slice(0, 7)
        .map(p => ({
          name:        p.product_name.slice(0, 50),
          emoji:       emojiForName(p.product_name),
          kcal100g:    Math.round(p.nutriments['energy-kcal_100g']),
          protein100g: Math.round((p.nutriments['proteins_100g'] || 0) * 10) / 10,
        }));

      if (results.length) {
        writeCache(q, results);
        return results;
      }
    }
  } catch { /* fall through */ }

  const fallback = FALLBACK_FOODS.filter(f => f.name.toLowerCase().includes(q)).slice(0, 7);
  return fallback;
}

export function getMyFoods() {
  try { return JSON.parse(localStorage.getItem(MY_FOODS_KEY)) || []; }
  catch { return []; }
}

export function saveToMyFoods(food) {
  const list = getMyFoods();
  if (list.some(f => f.name === food.name)) return;
  list.unshift({ id: crypto.randomUUID(), ...food });
  localStorage.setItem(MY_FOODS_KEY, JSON.stringify(list.slice(0, 20)));
}

export function removeFromMyFoods(id) {
  const list = getMyFoods().filter(f => f.id !== id);
  localStorage.setItem(MY_FOODS_KEY, JSON.stringify(list));
}
