import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import dontStopImg from '../assets/dont_stop.png';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const { login } = useAuth();

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

        <p className="mt-4" style={{ cursor: 'pointer', color: 'var(--secondary-color)' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </p>
      </div>
    </div>
  );
}
