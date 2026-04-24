import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dumbbell } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Registration successful! Check your email for the confirmation link.');
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
        <Dumbbell size={48} color="var(--primary-color)" className="mb-4" />
        <h1 className="text-gradient">Rep & Set Tracker</h1>
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
