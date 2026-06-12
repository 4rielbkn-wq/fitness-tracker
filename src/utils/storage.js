const KEY = 'fitlog_entries';

export function getEntries() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
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
  localStorage.setItem(KEY, JSON.stringify(entries));
  return [...entries];
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getProteinTarget() {
  return parseInt(localStorage.getItem('fitlog_protein_target') || '150', 10);
}

export function setProteinTarget(val) {
  localStorage.setItem('fitlog_protein_target', String(val));
}
