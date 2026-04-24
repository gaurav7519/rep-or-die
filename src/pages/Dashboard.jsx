import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { LogOut, Activity, Menu, X, Calendar as CalendarIcon } from 'lucide-react';

const BODY_PARTS = [
  { name: 'Chest', icon: '🏃' },
  { name: 'Back', icon: '🦍' },
  { name: 'Legs', icon: '🦵' },
  { name: 'Shoulders', icon: '💪' },
  { name: 'Biceps', icon: '🦾' },
  { name: 'Triceps', icon: '🔩' },
  { name: 'Core', icon: '🧘' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container">
      {/* Side Menu Overlay */}
      <div 
        className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Side Menu */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <button onClick={() => setIsMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <X size={28} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="side-menu-item" onClick={() => navigate('/calendar')}>
            <CalendarIcon size={24} color="var(--primary-color)" />
            History Calendar
          </button>
          
          <button className="side-menu-item" onClick={handleLogout} style={{ color: 'var(--error-color)' }}>
            <LogOut size={24} color="var(--error-color)" />
            Logout
          </button>
        </div>
      </div>

      <div className="header">
        <h2 className="text-gradient" style={{ marginBottom: 0 }}>My Workouts</h2>
        <button onClick={() => setIsMenuOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <Menu size={28} />
        </button>
      </div>

      <div className="glass-panel mb-4 text-center">
        <Activity size={32} color="var(--primary-color)" className="mb-4" />
        <h3>What are we training today?</h3>
        <p>Select a body part to begin logging your sets.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {BODY_PARTS.map((part) => (
          <div 
            key={part.name}
            className="glass-panel" 
            style={{ textAlign: 'center', cursor: 'pointer', padding: '30px 10px', transition: 'transform 0.2s' }}
            onClick={() => navigate(`/exercises/${part.name}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{part.icon}</div>
            <div style={{ fontWeight: 600 }}>{part.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
