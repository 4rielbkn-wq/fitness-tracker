const ENTRIES_KEY = 'fitlog_entries';
const SETTINGS_KEY = 'fitlog_settings';

export const DEFAULT_SETTINGS = {
  goal: 'maintaining',   // 'cutting' | 'maintaining' | 'bulking'
  weightUnit: 'lbs',     // 'lbs' | 'kg'
  proteinMode: 'manual', // 'auto' | 'manual'
  proteinTarget: 150,
  calorieMode: 'manual', // 'auto' | 'manual'
  calorieTarget: 2000,
  stepsGoal: 10000,
};

export function getEntries() {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  const entries = getEntries();
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return [...entries];
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
