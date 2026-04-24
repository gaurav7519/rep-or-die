import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { useTheme } from '../App';
import { LogOut, Activity, Menu, X, Calendar as CalendarIcon, HelpCircle, Copy, Check } from 'lucide-react';

const BODY_PARTS = [
  { name: 'Chest', icon: '🍊' },
  { name: 'Back', icon: '🦍' },
  { name: 'Legs', icon: '🍑' },
  { name: 'Shoulders', icon: '💪' },
  { name: 'Biceps', icon: '🫦' },
  { name: 'Triceps', icon: '🔩' },
  { name: 'Core', icon: '🧘' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setSetsCount } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    async function fetchTodayLogs() {
      if (!user) return;

      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const todayStr = d.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', todayStr);

      if (!error && data) {
        setTodayLogs(data);
        setSetsCount(data.length);
      }
      setLoadingLogs(false);
    }
    fetchTodayLogs();
  }, [user]);

  const getStatusMessage = () => {
    const count = todayLogs.length;
    if (count === 0) {
      const jokes = [
        "Bro really opened the app just to stare at it. 💀",
        "Your muscles are currently ghosting you. 👻 Go lift.",
        "Aura minus 1000 for zero sets logged today. 📉",
        "It's giving 'couch potato' energy. 🛋️",
        "Skipping the gym today? Touch grass instead. 🌱"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    } else if (count < 3) {
      return `Ayo, only ${count} sets? Those are rookie numbers. Don't stop now. 😤`;
    } else if (count < 6) {
      return `Solid work. ${count} sets in the bag! Keep the pump going! 🔥`;
    } else if (count < 10) {
      return "dont stop Daddy 💦";
    } else if (count < 15) {
      return "Almost...almost there....😍";
    } else {
      return "keep pumping...i need more😳";
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('gauravmali.ds@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          
          <button className="side-menu-item" onClick={() => setShowSupport(!showSupport)}>
            <HelpCircle size={24} color="var(--secondary-color)" />
            Support & Suggestion
          </button>

          {showSupport && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginTop: '-8px' }}>
              <p style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>For support or suggestions, mail us:</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-mono)' }}>gauravmali.ds@gmail.com</span>
                <button onClick={handleCopyEmail} style={{ background: 'transparent', border: 'none', color: copied ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
          
          <button className="side-menu-item" onClick={handleLogout} style={{ color: 'var(--error-color)', marginTop: 'auto' }}>
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

      <div className="ios-glass mb-4 text-center" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <Activity size={28} color="var(--primary-color)" />
          <h3 style={{ margin: 0, fontSize: '20px' }}>Today's Status</h3>
        </div>
        {loadingLogs ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading your gains...</p>
        ) : (
          <div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1 }}>
              {todayLogs.length} <span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>sets logged</span>
            </div>
            <p style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: '600', margin: 0, fontStyle: 'italic' }}>
              {getStatusMessage()}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {BODY_PARTS.map((part) => (
          <div 
            key={part.name}
            className="ios-glass" 
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
