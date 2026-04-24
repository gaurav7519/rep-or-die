import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { ArrowLeft, Plus, History } from 'lucide-react';

export default function Tracker() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exercise, setExercise] = useState(null);
  const [previousLogs, setPreviousLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Fetch exercise details
      const { data: exData } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();
      
      if (exData) setExercise(exData);

      // Fetch previous logs
      if (user) {
        const { data: logData } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('exercise_id', exerciseId)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5);

        if (logData) setPreviousLogs(logData);
      }
      setLoading(false);
    }
    fetchData();
  }, [exerciseId, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!sets || !reps) return;
    
    setSaving(true);
    const { data, error } = await supabase
      .from('workout_logs')
      .insert([
        {
          user_id: user.id,
          exercise_id: exerciseId,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: weight ? parseFloat(weight) : null,
          date: new Date().toISOString().split('T')[0]
        }
      ])
      .select();

    if (!error && data) {
      setPreviousLogs([data[0], ...previousLogs]);
      setSets('');
      setReps('');
      setWeight('');
    }
    setSaving(false);
  };

  if (loading) return <div className="container text-center">Loading...</div>;
  if (!exercise) return <div className="container text-center">Exercise not found</div>;

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={20} /> Back
        </button>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-gradient" style={{ fontSize: '32px' }}>{exercise.name}</h2>
        {exercise.regional_name && <p>({exercise.regional_name})</p>}
      </div>

      <div className="glass-panel mb-4">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
          <Plus size={20} color="var(--primary-color)"/> Log Today's Set
        </h3>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Weight (kg/lbs)</label>
            <input type="number" step="0.5" placeholder="e.g. 50" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Sets</label>
            <input type="number" placeholder="e.g. 3" required value={sets} onChange={e => setSets(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Reps</label>
            <input type="number" placeholder="e.g. 10" required value={reps} onChange={e => setReps(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '16px' }}>
          <History size={20} color="var(--secondary-color)"/> Previous Logs
        </h3>
        {previousLogs.length === 0 ? (
          <p className="text-center">No previous logs for this exercise.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {previousLogs.map((log) => (
              <div key={log.id} className="glass-panel flex-between" style={{ padding: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '18px' }}>
                    {log.sets} sets × {log.reps} reps
                  </div>
                  {log.weight && <div style={{ color: 'var(--primary-color)', fontSize: '14px' }}>Weight: {log.weight}</div>}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
