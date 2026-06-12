import { useState } from 'react';
import DailyEntry from './components/DailyEntry';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('log');

  return (
    <div className="app">
      <header className="app-header">
        <h1>FitLog</h1>
      </header>
      <main className="app-main">
        {tab === 'log' ? <DailyEntry /> : <Dashboard />}
      </main>
      <nav className="app-nav">
        <button className={tab === 'log' ? 'active' : ''} onClick={() => setTab('log')}>
          📝 Log
        </button>
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          📊 Dashboard
        </button>
      </nav>
    </div>
  );
}
