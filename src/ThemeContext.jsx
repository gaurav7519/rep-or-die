import { createContext, useContext, useEffect, useState } from 'react';

const THEMES = [
  { primary: '#45a29e', secondary: '#66fcf1', bg: '#0b0c10', blob1: 'rgba(69,162,158,0.07)', blob2: 'rgba(102,252,241,0.06)', particle: '69,162,158' },
  { primary: '#a855f7', secondary: '#c084fc', bg: '#0d0814', blob1: 'rgba(168,85,247,0.08)', blob2: 'rgba(192,132,252,0.06)', particle: '168,85,247' },
  { primary: '#f97316', secondary: '#fb923c', bg: '#0f0a05', blob1: 'rgba(249,115,22,0.09)', blob2: 'rgba(251,146,60,0.06)', particle: '249,115,22' },
  { primary: '#eab308', secondary: '#facc15', bg: '#0e0d02', blob1: 'rgba(234,179,8,0.08)', blob2: 'rgba(250,204,21,0.06)', particle: '234,179,8' },
  { primary: '#ef4444', secondary: '#f87171', bg: '#0f0404', blob1: 'rgba(239,68,68,0.09)', blob2: 'rgba(248,113,113,0.06)', particle: '239,68,68' },
];

function getThemeIndex(sets) {
  if (sets >= 15) return 4;
  if (sets >= 10) return 3;
  if (sets >= 5) return 2;
  if (sets >= 1) return 1;
  return 0;
}

function getTodayIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
  return ist.toISOString().split('T')[0];
}

const ThemeContext = createContext({ setsCount: 0, setSetsCount: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [setsCount, setSetsCountRaw] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('theme_sets') || 'null');
      if (saved && saved.date === getTodayIST()) return saved.count;
    } catch {
      // Ignore malformed localStorage payloads.
    }
    return 0;
  });

  const setSetsCount = (count) => {
    const today = getTodayIST();
    localStorage.setItem('theme_sets', JSON.stringify({ date: today, count }));
    setSetsCountRaw(count);
  };

  useEffect(() => {
    const t = THEMES[getThemeIndex(setsCount)];
    const root = document.documentElement;
    root.style.setProperty('--primary-color', t.primary);
    root.style.setProperty('--secondary-color', t.secondary);
    root.style.setProperty('--bg-color', t.bg);
    root.style.setProperty('--theme-blob1', t.blob1);
    root.style.setProperty('--theme-blob2', t.blob2);
    root.style.setProperty('--theme-particle', t.particle);
    document.body.style.backgroundColor = t.bg;
  }, [setsCount]);

  useEffect(() => {
    function msUntilMidnightIST() {
      const now = new Date();
      const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
      const nextMidnight = new Date(ist);
      nextMidnight.setUTCHours(18, 30, 0, 0);
      if (nextMidnight <= ist) nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
      return nextMidnight - ist;
    }

    const timeout = setTimeout(() => {
      setSetsCount(0);
    }, msUntilMidnightIST());

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ThemeContext.Provider value={{ setsCount, setSetsCount }}>
      {children}
    </ThemeContext.Provider>
  );
}
