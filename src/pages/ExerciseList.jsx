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
              <div>
                <div style={{ fontWeight: 600, fontSize: '18px' }}>{saved.exercises.name}</div>
                {saved.exercises.type && (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{saved.exercises.type}</div>
                )}
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
                    <div>
                      <div style={{ fontWeight: 600 }}>{ex.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ex.type}</div>
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
