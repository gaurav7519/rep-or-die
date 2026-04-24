import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { LogOut, Activity } from 'lucide-react';

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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container">
      <div className="header">
        <h2 className="text-gradient" style={{ marginBottom: 0 }}>My Workouts</h2>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <LogOut size={24} />
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
