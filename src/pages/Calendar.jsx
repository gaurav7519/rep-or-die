import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { ArrowLeft, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export default function Calendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!user) return;
      
      // Fetch all logs for the user, joined with exercise name
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            name,
            default_body_part
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    }
    
    fetchLogs();
  }, [user]);

  // Calendar logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date) => isSameDay(date, new Date());

  // Group logs by date string (YYYY-MM-DD)
  const logsByDate = useMemo(() => {
    const grouped = {};
    logs.forEach(log => {
      if (!grouped[log.date]) {
        grouped[log.date] = [];
      }
      grouped[log.date].push(log);
    });
    return grouped;
  }, [logs]);

  // Format YYYY-MM-DD local time
  const formatDateString = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const dateString = formatDateString(date);
      const hasLogs = !!logsByDate[dateString];
      const active = isSameDay(date, selectedDate);
      const today = isToday(date);

      days.push(
        <div 
          key={i} 
          className={`calendar-cell ${active ? 'active' : ''} ${today ? 'today' : ''} ${hasLogs ? 'has-logs' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          {i}
          {hasLogs && <div className="activity-dot"></div>}
        </div>
      );
    }

    return days;
  };

  const selectedDateString = formatDateString(selectedDate);
  const selectedDateLogs = logsByDate[selectedDateString] || [];

  if (loading) return <div className="container text-center">Loading...</div>;

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 className="text-gradient" style={{ marginBottom: 0, fontSize: '24px' }}>History</h2>
        <div style={{ width: 68 }}></div> {/* Spacer for centering */}
      </div>

      <div className="calendar-container mb-4">
        <div className="calendar-header">
          <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <ChevronLeft size={24} />
          </button>
          <h3 style={{ marginBottom: 0, fontSize: '18px' }}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="glass-panel" style={{ minHeight: '300px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--text-secondary)' }}>
          {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>

        {selectedDateLogs.length === 0 ? (
          <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
            <Activity size={48} opacity={0.2} className="mb-4" style={{ margin: '0 auto' }} />
            <p>No workouts recorded on this day.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Group selected date logs by body part then exercise */}
            {Object.entries(
              selectedDateLogs.reduce((acc, log) => {
                const bodyPart = log.exercises?.default_body_part || 'Other';
                const exName = log.exercises?.name || 'Unknown Exercise';
                
                if (!acc[bodyPart]) acc[bodyPart] = {};
                if (!acc[bodyPart][exName]) acc[bodyPart][exName] = [];
                
                acc[bodyPart][exName].push(log);
                return acc;
              }, {})
            ).map(([bodyPart, exercises]) => (
              <div key={bodyPart} style={{ marginBottom: '8px' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                  {bodyPart}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.entries(exercises).map(([exerciseName, logs]) => (
                    <div key={exerciseName}>
                      <h5 style={{ color: 'var(--primary-color)', marginBottom: '8px', fontSize: '15px' }}>{exerciseName}</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {logs.map((log, index) => (
                          <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ background: 'rgba(69, 162, 158, 0.2)', color: 'var(--primary-color)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                              {logs.length - index}
                            </div>
                            <div style={{ fontSize: '16px' }}>
                              {log.weight ? `${log.weight} × ` : ''}{log.reps} {log.reps === 1 ? 'rep' : 'reps'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
