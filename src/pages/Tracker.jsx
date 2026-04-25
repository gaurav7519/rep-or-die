import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { ArrowLeft, Plus, History } from 'lucide-react';
import dontStopImg from '../assets/dont_stop.png';

export default function Tracker() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setsCount, setSetsCount } = useTheme();
  
  const [exercise, setExercise] = useState(null);
  const [previousLogs, setPreviousLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: exData } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();
      
      if (exData) setExercise(exData);

      if (user) {
        const { data: logData } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('exercise_id', exerciseId)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(30);

        if (logData) setPreviousLogs(logData);
      }
      setLoading(false);
    }
    fetchData();
  }, [exerciseId, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!reps) return;
    
    setSaving(true);
    const { data, error } = await supabase
      .from('workout_logs')
      .insert([
        {
          user_id: user.id,
          exercise_id: exerciseId,
          sets: 1,
          reps: parseInt(reps),
          weight: weight ? parseFloat(weight) : null,
          // date is omitted — DB default uses Asia/Kolkata CURRENT_DATE
        }
      ])
      .select();

    if (!error && data) {
      setPreviousLogs([data[0], ...previousLogs]);
      setReps('');
      setWeight('');
      setShowOptions(true);
      setSetsCount(setsCount + 1);
    }
    setSaving(false);
  };

  // Group logs by date
  const groupedLogs = previousLogs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

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
        {showOptions ? (
          <div className="text-center" style={{ padding: '20px 0' }}>
            <h3 className="mb-4" style={{ color: 'var(--primary-color)' }}>Set Saved!</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Stop
              </button>
              <button className="btn btn-primary" onClick={() => setShowOptions(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Don't Stop
                <img src={dontStopImg} alt="sticker" style={{ height: '24px' }} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '16px' }}>
              <Plus size={20} color="var(--primary-color)"/> Log a Set
            </h3>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Weight</label>
                <input type="number" step="0.5" inputMode="decimal" placeholder="e.g. 50" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Reps</label>
                <input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 10" required value={reps} onChange={e => setReps(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Set'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '16px' }}>
          <History size={20} color="var(--secondary-color)"/> Previous Logs
        </h3>
        {Object.keys(groupedLogs).length === 0 ? (
          <p className="text-center">No previous logs for this exercise.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.keys(groupedLogs).map(date => {
              const logsForDate = groupedLogs[date];
              return (
                <div key={date}>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '16px' }}>
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {logsForDate.map((log, index) => {
                      // Because they are sorted desc, the first one is the highest set number
                      const setNumber = logsForDate.length - index;
                      return (
                        <div key={log.id} className="glass-panel flex-between" style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(69, 162, 158, 0.2)', color: 'var(--primary-color)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                              {setNumber}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>
                              {log.weight ? `${log.weight} × ` : ''}{log.reps} {log.reps === 1 ? 'rep' : 'reps'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
