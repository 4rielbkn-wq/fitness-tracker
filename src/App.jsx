import { useState } from 'react';
import DailyEntry from './components/DailyEntry';
import Dashboard  from './components/Dashboard';
import History    from './components/History';
import Settings   from './components/Settings';
import { getEntries, getSettings, saveSettings } from './utils/storage';
import './App.css';

const TABS = [
  { id: 'dashboard', label: '📊', name: 'Dashboard' },
  { id: 'log',       label: '📝', name: 'Log' },
  { id: 'history',   label: '📅', name: 'History' },
  { id: 'settings',  label: '⚙️', name: 'Settings' },
];

export default function App() {
  const [tab,      setTab]      = useState('dashboard');
  const [entries,  setEntries]  = useState(() => getEntries());
  const [settings, setSettings] = useState(() => getSettings());

  function refresh() {
    setEntries(getEntries());
  }

  function handleSaveSettings(s) {
    saveSettings(s);
    setSettings(s);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>FitLog</h1>
        <span className="header-goal">{settings.goal}</span>
      </header>

      <main className="app-main">
        {tab === 'dashboard' && <Dashboard entries={entries} settings={settings} />}
        {tab === 'log'       && <DailyEntry entries={entries} settings={settings} onSave={refresh} />}
        {tab === 'history'   && <History entries={entries} settings={settings} />}
        {tab === 'settings'  && <Settings entries={entries} settings={settings} onSave={handleSaveSettings} />}
      </main>

      <nav className="app-nav">
        {TABS.map(t => (
          <button key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}>
            <span className="nav-icon">{t.label}</span>
            <span className="nav-label">{t.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
