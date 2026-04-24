import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import dontStopImg from '../assets/dont_stop.png';
import { Copy, Check } from 'lucide-react';

const WELCOME_MALE = [
  "Damn bro, you actually showed up. Your muscles are shaking rn... from excitement ofc. 😏",
  "Oh look who's back. The gym missed you almost as much as we did. Almost. 🔥",
  "Bro said 'new year new me' and actually meant it? Respect. Now go lift something heavy. 💪",
  "You walked in and the weights got nervous. That's the vibe we're on. 😤",
  "King has entered the chat. The squat rack has been waiting for you specifically. 👑",
];

const WELCOME_FEMALE = [
  "She's back and the gym is NOT ready. Go make those weights cry, bestie. 💅",
  "Omg you actually came back?? The treadmill literally shed a tear. 😭🔥",
  "Main character energy detected. Time to make everyone else's workout look basic. ✨",
  "Girlie showed up AND logged in? That's already top 1% behavior. Now go slay. 💪",
  "The gym called. It said it's been thinking about you. A little obsessed honestly. 😏",
];

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [error, setError] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [copied, setCopied] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState(null);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const { login } = useAuth();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('gauravmali.ds@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (error || !data) throw new Error('Invalid email or password');

        const msgs = data.sex === 'female' ? WELCOME_FEMALE : WELCOME_MALE;
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        setWelcomeMsg(msg);
        setWelcomeUser(data);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        if (!sex) throw new Error('Please select your sex');

        const { data: existingUser } = await supabase
          .from('custom_users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) throw new Error('Email already registered');

        const { data, error } = await supabase
          .from('custom_users')
          .insert([{ email, password, name: name.trim(), sex }])
          .select()
          .single();

        if (error) throw error;
        login(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome screen shown after login before entering app
  if (welcomeMsg && welcomeUser) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="glass-panel text-center">
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>
            {welcomeUser.sex === 'female' ? '💅' : '💪'}
          </div>
          <h2 className="text-gradient" style={{ marginBottom: '8px' }}>
            Hey {welcomeUser.name}!
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--secondary-color)', fontWeight: '600', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '32px' }}>
            {welcomeMsg}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => login(welcomeUser)}
          >
            Let's get it 🔥
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel text-center">
        <img src={dontStopImg} alt="Logo" style={{ height: '64px', marginBottom: '16px' }} />
        <h1 className="text-gradient">Rep or Die</h1>
        <p className="mb-4">{isLogin ? 'Welcome back! Log in to continue.' : 'Create an account to start tracking.'}</p>

        {error && <div className="text-error">{error}</div>}

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: `2px solid ${sex === 'male' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}`,
                    background: sex === 'male' ? 'rgba(69,162,158,0.15)' : 'rgba(0,0,0,0.3)',
                    color: sex === 'male' ? 'var(--primary-color)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 600,
                    fontSize: '15px',
                    transition: 'all 0.2s',
                  }}
                >
                  💪 Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: `2px solid ${sex === 'female' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}`,
                    background: sex === 'female' ? 'rgba(69,162,158,0.15)' : 'rgba(0,0,0,0.3)',
                    color: sex === 'female' ? 'var(--primary-color)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 600,
                    fontSize: '15px',
                    transition: 'all 0.2s',
                  }}
                >
                  💅 Female
                </button>
              </div>
            </>
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ cursor: 'pointer', color: 'var(--secondary-color)', margin: 0 }} onClick={() => { setIsLogin(!isLogin); setError(null); }}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </p>

          {isLogin && (
            <p style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }} onClick={() => setShowForgot(!showForgot)}>
              Forgot Password?
            </p>
          )}

          {showForgot && isLogin && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', fontSize: '14px', textAlign: 'left', marginTop: '8px' }}>
              <p style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>To reset your password, please mail your request to:</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-mono)' }}>gauravmali.ds@gmail.com</span>
                <button type="button" onClick={handleCopyEmail} style={{ background: 'transparent', border: 'none', color: copied ? 'var(--primary-color)' : 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
