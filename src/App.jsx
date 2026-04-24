import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ExerciseList from './pages/ExerciseList';
import Tracker from './pages/Tracker';
import Calendar from './pages/Calendar';

// ── Theme System ────────────────────────────────────────────────────────────
// Themes unlock as today's total sets increase.
// Resets daily at midnight IST (UTC+5:30).
const THEMES = [
  // 0 sets – cold steel (default dark)
  { primary: '#45a29e', secondary: '#66fcf1', bg: '#0b0c10', blob1: 'rgba(69,162,158,0.07)', blob2: 'rgba(102,252,241,0.06)', particle: '69,162,158' },
  // 1–4 sets – deep purple hustle
  { primary: '#a855f7', secondary: '#c084fc', bg: '#0d0814', blob1: 'rgba(168,85,247,0.08)', blob2: 'rgba(192,132,252,0.06)', particle: '168,85,247' },
  // 5–9 sets – fire orange
  { primary: '#f97316', secondary: '#fb923c', bg: '#0f0a05', blob1: 'rgba(249,115,22,0.09)', blob2: 'rgba(251,146,60,0.06)', particle: '249,115,22' },
  // 10–14 sets – electric gold
  { primary: '#eab308', secondary: '#facc15', bg: '#0e0d02', blob1: 'rgba(234,179,8,0.08)', blob2: 'rgba(250,204,21,0.06)', particle: '234,179,8' },
  // 15+ sets – beast mode crimson
  { primary: '#ef4444', secondary: '#f87171', bg: '#0f0404', blob1: 'rgba(239,68,68,0.09)', blob2: 'rgba(248,113,113,0.06)', particle: '239,68,68' },
];

function getThemeIndex(sets) {
  if (sets >= 15) return 4;
  if (sets >= 10) return 3;
  if (sets >= 5)  return 2;
  if (sets >= 1)  return 1;
  return 0;
}

// Returns today's date string in IST (YYYY-MM-DD)
function getTodayIST() {
  const now = new Date();
  // IST = UTC+5:30
  const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
  return ist.toISOString().split('T')[0];
}

export const ThemeContext = createContext({ setsCount: 0, setSetsCount: () => {} });
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [setsCount, setSetsCountRaw] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('theme_sets') || 'null');
      if (saved && saved.date === getTodayIST()) return saved.count;
    } catch {}
    return 0;
  });

  const setSetsCount = (count) => {
    const today = getTodayIST();
    localStorage.setItem('theme_sets', JSON.stringify({ date: today, count }));
    setSetsCountRaw(count);
  };

  // Apply CSS variables whenever setsCount changes
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

  // Reset at midnight IST
  useEffect(() => {
    function msUntilMidnightIST() {
      const now = new Date();
      const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
      const nextMidnight = new Date(ist);
      nextMidnight.setUTCHours(18, 30, 0, 0); // 18:30 UTC = midnight IST
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

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      const rgb = getComputedStyle(document.documentElement).getPropertyValue('--theme-particle').trim() || '69,162,158';
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x = (p.x + p.dx + W) % W;
        p.y = (p.y + p.dy + H) % H;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgb}, ${0.06*(1-dist/120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="container text-center" style={{marginTop: '50vh'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="container text-center" style={{marginTop: '50vh'}}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Auth />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/exercises/:bodyPart" element={<ProtectedRoute><ExerciseList /></ProtectedRoute>} />
      <Route path="/track/:exerciseId" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="grain" />
        <ParticleCanvas />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
