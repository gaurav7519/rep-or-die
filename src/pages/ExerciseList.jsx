import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { ArrowLeft, ChevronRight, Plus, X } from 'lucide-react';

export default function ExerciseList() {
  const { bodyPart } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedExercises, setSavedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [allExercises, setAllExercises] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchSavedExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_saved_exercises')
      .select('*, exercises(*)')
      .eq('user_id', user.id)
      .eq('body_part', bodyPart);
    
    if (!error && data) {
      setSavedExercises(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSavedExercises();
    }
  }, [bodyPart, user]);

  const openAddModal = async () => {
    setShowModal(true);
    setModalLoading(true);
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('default_body_part', bodyPart)
      .order('name');
    
    if (!error && data) {
      setAllExercises(data);
    }
    setModalLoading(false);
  };

  const handleSelectExercise = async (exercise) => {
    const { error } = await supabase
      .from('user_saved_exercises')
      .insert({
        user_id: user.id,
        exercise_id: exercise.id,
        body_part: bodyPart
      });
    
    if (!error || error.code === '23505') { // Ignore unique constraint errors
      setShowModal(false);
      fetchSavedExercises();
    } else {
      alert("Error adding exercise: " + error.message);
    }
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <div className="header">
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className="text-gradient" style={{ marginBottom: 0 }}>{bodyPart}</h2>
        <button onClick={openAddModal} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
          <Plus size={28} />
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading your exercises...</div>
      ) : savedExercises.length === 0 ? (
        <div className="text-center" style={{ marginTop: '40px' }}>
          <p className="mb-4">You haven't added any exercises to this section yet.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={20} /> Add Exercise
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {savedExercises.map((saved) => (
            <div
              key={saved.id}
              className="glass-panel flex-between"
              style={{ cursor: 'pointer', padding: '16px 20px', transition: 'background 0.2s' }}
              onClick={() => navigate(`/track/${saved.exercises.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(31, 40, 51, 0.6)'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '17px', marginBottom: '6px' }}>{saved.exercises.name}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {saved.exercises.muscle_focus && (
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(69,162,158,0.15)', color: 'var(--primary-color)', fontWeight: 600 }}>
                      {saved.exercises.muscle_focus}
                    </span>
                  )}
                  {saved.exercises.exercise_category && (
                    <span style={{
                      fontSize: '12px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
                      background: saved.exercises.exercise_category === 'Compound' ? 'rgba(102,252,241,0.12)' : 'rgba(168,85,247,0.12)',
                      color: saved.exercises.exercise_category === 'Compound' ? 'var(--secondary-color)' : '#c084fc',
                    }}>
                      {saved.exercises.exercise_category}
                    </span>
                  )}
                  {saved.exercises.type && (
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {saved.exercises.type}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight color="var(--primary-color)" />
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'var(--bg-color)', zIndex: 1000, overflowY: 'auto', padding: '20px'
        }}>
          <div className="container">
            <div className="header">
              <h2 className="text-gradient" style={{ marginBottom: 0 }}>All {bodyPart} Exercises</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={28} />
              </button>
            </div>
            
            {modalLoading ? (
              <div className="text-center">Loading all exercises...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="glass-panel flex-between"
                    style={{ padding: '12px 16px', cursor: 'pointer', marginBottom: '8px' }}
                    onClick={() => handleSelectExercise(ex)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '5px' }}>{ex.name}</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {ex.muscle_focus && (
                          <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '20px', background: 'rgba(69,162,158,0.15)', color: 'var(--primary-color)', fontWeight: 600 }}>
                            {ex.muscle_focus}
                          </span>
                        )}
                        {ex.exercise_category && (
                          <span style={{
                            fontSize: '11px', padding: '2px 7px', borderRadius: '20px', fontWeight: 600,
                            background: ex.exercise_category === 'Compound' ? 'rgba(102,252,241,0.12)' : 'rgba(168,85,247,0.12)',
                            color: ex.exercise_category === 'Compound' ? 'var(--secondary-color)' : '#c084fc',
                          }}>
                            {ex.exercise_category}
                          </span>
                        )}
                        {ex.type && (
                          <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {ex.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <Plus color="var(--primary-color)" size={20} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
