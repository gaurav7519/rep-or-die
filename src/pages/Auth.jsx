import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import dontStopImg from '../assets/dont_stop.png';
import { Copy, Check } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [copied, setCopied] = useState(false);
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
    setMessage(null);

    try {
      if (isLogin) {
        // Simple custom login
        const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();
          
        if (error || !data) {
          throw new Error('Invalid email or password');
        }
        login(data);
      } else {
        // Simple custom signup
        // First check if email exists
        const { data: existingUser } = await supabase
          .from('custom_users')
          .select('id')
          .eq('email', email)
          .single();
          
        if (existingUser) {
          throw new Error('Email already registered');
        }

        const { data, error } = await supabase
          .from('custom_users')
          .insert([{ email, password }])
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

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel text-center">
        <img src={dontStopImg} alt="Logo" style={{ height: '64px', marginBottom: '16px' }} />
        <h1 className="text-gradient">rep count</h1>
        <p className="mb-4">{isLogin ? 'Welcome back! Log in to continue.' : 'Create an account to start tracking.'}</p>
        
        {error && <div className="text-error">{error}</div>}
        {message && <div style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>{message}</div>}

        <form onSubmit={handleAuth}>
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
          <p style={{ cursor: 'pointer', color: 'var(--secondary-color)', margin: 0 }} onClick={() => setIsLogin(!isLogin)}>
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
