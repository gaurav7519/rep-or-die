-- Drop existing tables
DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS user_saved_exercises CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS custom_users CASCADE;

-- Create custom users table for testing
CREATE TABLE custom_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the master exercises table
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  default_body_part TEXT NOT NULL,
  type TEXT,
  muscle_focus TEXT,
  exercise_category TEXT CHECK (exercise_category IN ('Compound', 'Isolation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the user_saved_exercises table 
CREATE TABLE user_saved_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES custom_users(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  body_part TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, exercise_id, body_part)
);

-- Create the workout_logs table
CREATE TABLE workout_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES custom_users(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for testing since we are using a custom auth table
ALTER TABLE custom_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;

-- Insert Seed Data
-- Columns: name, default_body_part, type, muscle_focus, exercise_category
INSERT INTO exercises (name, default_body_part, type, muscle_focus, exercise_category) VALUES

-- ── CHEST ────────────────────────────────────────────────────────────────────
-- Machines
('Chest Press Machine',         'Chest', 'Machine',     'Mid Chest',           'Compound'),
('Incline Chest Press Machine', 'Chest', 'Machine',     'Upper Chest',         'Compound'),
('Pec Deck / Butterfly Machine','Chest', 'Machine',     'Mid Chest',           'Isolation'),
('Cable Crossover Machine',     'Chest', 'Machine',     'Inner Chest',         'Isolation'),
('Smith Machine Bench Press',   'Chest', 'Machine',     'Mid Chest',           'Compound'),
-- Free Weights
('Barbell Bench Press',         'Chest', 'Free Weight', 'Mid Chest',           'Compound'),
('Dumbbell Bench Press',        'Chest', 'Free Weight', 'Mid Chest',           'Compound'),
('Incline Barbell Bench Press', 'Chest', 'Free Weight', 'Upper Chest',         'Compound'),
('Incline Dumbbell Bench Press','Chest', 'Free Weight', 'Upper Chest',         'Compound'),
('Decline Bench Press',         'Chest', 'Free Weight', 'Lower Chest',         'Compound'),
('Dumbbell Fly',                'Chest', 'Free Weight', 'Mid Chest',           'Isolation'),
('Incline Dumbbell Fly',        'Chest', 'Free Weight', 'Upper Chest',         'Isolation'),
('Push-Ups',                    'Chest', 'Free Weight', 'Mid Chest',           'Compound'),
('Wide Push-Ups',               'Chest', 'Free Weight', 'Outer Chest',         'Compound'),
('Decline Push-Ups',            'Chest', 'Free Weight', 'Upper Chest',         'Compound'),
('Dips',                        'Chest', 'Free Weight', 'Lower Chest',         'Compound'),
('Cable Fly',                   'Chest', 'Free Weight', 'Mid Chest',           'Isolation'),
('Low-to-High Cable Fly',       'Chest', 'Free Weight', 'Lower Chest',         'Isolation'),
('High-to-Low Cable Fly',       'Chest', 'Free Weight', 'Upper Chest',         'Isolation'),

-- ── TRICEPS ──────────────────────────────────────────────────────────────────
-- Machines
('Triceps Pushdown Machine',            'Triceps', 'Machine',     'Lateral Head',  'Isolation'),
('Assisted Dip Machine',                'Triceps', 'Machine',     'All 3 Heads',   'Compound'),
('Cable Rope Pushdown',                 'Triceps', 'Machine',     'Lateral Head',  'Isolation'),
('Single Arm Cable Pushdown',           'Triceps', 'Machine',     'Lateral Head',  'Isolation'),
('Triceps Extension Machine',           'Triceps', 'Machine',     'Long Head',     'Isolation'),
-- Free Weights
('Close Grip Bench Press',              'Triceps', 'Free Weight', 'All 3 Heads',   'Compound'),
('Bench Dips',                          'Triceps', 'Free Weight', 'All 3 Heads',   'Compound'),
('Parallel Bar Dips',                   'Triceps', 'Free Weight', 'All 3 Heads',   'Compound'),
('Dumbbell Overhead Triceps Extension', 'Triceps', 'Free Weight', 'Long Head',     'Isolation'),
('One Arm Dumbbell Triceps Extension',  'Triceps', 'Free Weight', 'Long Head',     'Isolation'),
('Skull Crushers',                      'Triceps', 'Free Weight', 'Long Head',     'Isolation'),
('Barbell Skull Crushers',              'Triceps', 'Free Weight', 'Long Head',     'Isolation'),
('Dumbbell Kickbacks',                  'Triceps', 'Free Weight', 'Lateral Head',  'Isolation'),
('Rope Pushdowns',                      'Triceps', 'Free Weight', 'Lateral Head',  'Isolation'),
('Overhead Cable Extension',            'Triceps', 'Free Weight', 'Long Head',     'Isolation'),
('Diamond Push-Ups',                    'Triceps', 'Free Weight', 'All 3 Heads',   'Compound'),
('EZ Bar Triceps Extension',            'Triceps', 'Free Weight', 'Long Head',     'Isolation'),

-- ── BACK ─────────────────────────────────────────────────────────────────────
-- Machines
('Lat Pulldown Machine',        'Back', 'Machine',     'Latissimus Dorsi',    'Compound'),
('Seated Cable Row Machine',    'Back', 'Machine',     'Mid Back',            'Compound'),
('High Row Machine',            'Back', 'Machine',     'Upper Back',          'Compound'),
('Low Row Machine',             'Back', 'Machine',     'Mid Back',            'Compound'),
('Assisted Pull-Up Machine',    'Back', 'Machine',     'Latissimus Dorsi',    'Compound'),
('Back Extension Machine',      'Back', 'Machine',     'Lower Back',          'Isolation'),
('T-Bar Row Machine',           'Back', 'Machine',     'Mid Back',            'Compound'),
('Hammer Strength Row Machine', 'Back', 'Machine',     'Mid Back',            'Compound'),
-- Free Weights
('Pull-Ups',                    'Back', 'Free Weight', 'Latissimus Dorsi',    'Compound'),
('Chin-Ups',                    'Back', 'Free Weight', 'Latissimus Dorsi',    'Compound'),
('Barbell Bent Over Row',       'Back', 'Free Weight', 'Mid Back',            'Compound'),
('Dumbbell Row',                'Back', 'Free Weight', 'Mid Back',            'Compound'),
('One Arm Dumbbell Row',        'Back', 'Free Weight', 'Latissimus Dorsi',    'Compound'),
('T-Bar Row',                   'Back', 'Free Weight', 'Mid Back',            'Compound'),
('Deadlift',                    'Back', 'Free Weight', 'Full Back',           'Compound'),
('Romanian Deadlift',           'Back', 'Free Weight', 'Lower Back',          'Compound'),
('Rack Pull',                   'Back', 'Free Weight', 'Upper Back',          'Compound'),
('Inverted Row',                'Back', 'Free Weight', 'Mid Back',            'Compound'),
('Renegade Row',                'Back', 'Free Weight', 'Mid Back',            'Compound'),
('Straight Arm Pulldown',       'Back', 'Free Weight', 'Latissimus Dorsi',    'Isolation'),
('Face Pull',                   'Back', 'Free Weight', 'Rear Delt / Traps',   'Isolation'),
('Superman Hold',               'Back', 'Free Weight', 'Lower Back',          'Isolation'),
('Good Mornings',               'Back', 'Free Weight', 'Lower Back',          'Compound'),

-- ── BICEPS ───────────────────────────────────────────────────────────────────
-- Machines
('Biceps Curl Machine',     'Biceps', 'Machine',     'Short Head',          'Isolation'),
('Preacher Curl Machine',   'Biceps', 'Machine',     'Short Head',          'Isolation'),
('Cable Curl Machine',      'Biceps', 'Machine',     'Both Heads',          'Isolation'),
('Assisted Curl Machine',   'Biceps', 'Machine',     'Both Heads',          'Isolation'),
('Scott Curl Machine',      'Biceps', 'Machine',     'Short Head',          'Isolation'),
-- Free Weights
('Barbell Curl',            'Biceps', 'Free Weight', 'Both Heads',          'Isolation'),
('EZ Bar Curl',             'Biceps', 'Free Weight', 'Both Heads',          'Isolation'),
('Dumbbell Curl',           'Biceps', 'Free Weight', 'Both Heads',          'Isolation'),
('Alternating Dumbbell Curl','Biceps','Free Weight', 'Both Heads',          'Isolation'),
('Hammer Curl',             'Biceps', 'Free Weight', 'Brachialis',          'Isolation'),
('Concentration Curl',      'Biceps', 'Free Weight', 'Long Head',           'Isolation'),
('Preacher Curl',           'Biceps', 'Free Weight', 'Short Head',          'Isolation'),
('Incline Dumbbell Curl',   'Biceps', 'Free Weight', 'Long Head',           'Isolation'),
('Spider Curl',             'Biceps', 'Free Weight', 'Short Head',          'Isolation'),
('Reverse Curl',            'Biceps', 'Free Weight', 'Brachialis',          'Isolation'),
('Cross Body Hammer Curl',  'Biceps', 'Free Weight', 'Brachialis',          'Isolation'),
('Zottman Curl',            'Biceps', 'Free Weight', 'Both Heads',          'Isolation'),
('Drag Curl',               'Biceps', 'Free Weight', 'Long Head',           'Isolation'),

-- ── LEGS ─────────────────────────────────────────────────────────────────────
-- Machines
('Leg Press Machine',           'Legs', 'Machine',     'Quads / Glutes',      'Compound'),
('Leg Extension Machine',       'Legs', 'Machine',     'Quads',               'Isolation'),
('Leg Curl Machine',            'Legs', 'Machine',     'Hamstrings',          'Isolation'),
('Seated Leg Curl Machine',     'Legs', 'Machine',     'Hamstrings',          'Isolation'),
('Standing Calf Raise Machine', 'Legs', 'Machine',     'Gastrocnemius',       'Isolation'),
('Seated Calf Raise Machine',   'Legs', 'Machine',     'Soleus',              'Isolation'),
('Hack Squat Machine',          'Legs', 'Machine',     'Quads',               'Compound'),
('Smith Machine Squat',         'Legs', 'Machine',     'Quads / Glutes',      'Compound'),
('Glute Kickback Machine',      'Legs', 'Machine',     'Glutes',              'Isolation'),
('Hip Abductor Machine',        'Legs', 'Machine',     'Glute Medius',        'Isolation'),
('Hip Adductor Machine',        'Legs', 'Machine',     'Inner Thigh',         'Isolation'),
-- Free Weights
('Squat',                       'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Barbell Back Squat',          'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Front Squat',                 'Legs', 'Free Weight', 'Quads',               'Compound'),
('Goblet Squat',                'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Bulgarian Split Squat',       'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Lunges',                      'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Walking Lunges',              'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Reverse Lunges',              'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Step-Ups',                    'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Stiff Leg Deadlift',          'Legs', 'Free Weight', 'Hamstrings',          'Compound'),
('Sumo Deadlift',               'Legs', 'Free Weight', 'Inner Thigh / Glutes','Compound'),
('Hip Thrust',                  'Legs', 'Free Weight', 'Glutes',              'Isolation'),
('Glute Bridge',                'Legs', 'Free Weight', 'Glutes',              'Isolation'),
('Calf Raises',                 'Legs', 'Free Weight', 'Gastrocnemius',       'Isolation'),
('Single Leg Calf Raises',      'Legs', 'Free Weight', 'Gastrocnemius',       'Isolation'),
('Jump Squats',                 'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Box Jumps',                   'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),
('Wall Sit',                    'Legs', 'Free Weight', 'Quads',               'Isolation'),
('Pistol Squat',                'Legs', 'Free Weight', 'Quads / Glutes',      'Compound'),

-- ── SHOULDERS ────────────────────────────────────────────────────────────────
-- Machines
('Shoulder Press Machine',       'Shoulders', 'Machine',     'Anterior Delt',   'Compound'),
('Lateral Raise Machine',        'Shoulders', 'Machine',     'Lateral Delt',    'Isolation'),
('Rear Delt Fly Machine',        'Shoulders', 'Machine',     'Posterior Delt',  'Isolation'),
('Cable Shoulder Press',         'Shoulders', 'Machine',     'Anterior Delt',   'Compound'),
('Smith Machine Shoulder Press', 'Shoulders', 'Machine',     'Anterior Delt',   'Compound'),
('Upright Row Machine',          'Shoulders', 'Machine',     'Lateral Delt',    'Compound'),
-- Free Weights
('Barbell Overhead Press',       'Shoulders', 'Free Weight', 'Anterior Delt',   'Compound'),
('Dumbbell Shoulder Press',      'Shoulders', 'Free Weight', 'Anterior Delt',   'Compound'),
('Arnold Press',                 'Shoulders', 'Free Weight', 'All 3 Delts',     'Compound'),
('Seated Dumbbell Press',        'Shoulders', 'Free Weight', 'Anterior Delt',   'Compound'),
('Lateral Raise',                'Shoulders', 'Free Weight', 'Lateral Delt',    'Isolation'),
('Front Raise',                  'Shoulders', 'Free Weight', 'Anterior Delt',   'Isolation'),
('Rear Delt Fly',                'Shoulders', 'Free Weight', 'Posterior Delt',  'Isolation'),
('Bent Over Lateral Raise',      'Shoulders', 'Free Weight', 'Posterior Delt',  'Isolation'),
('Upright Row',                  'Shoulders', 'Free Weight', 'Lateral Delt',    'Compound'),
('Push Press',                   'Shoulders', 'Free Weight', 'Anterior Delt',   'Compound'),
('Handstand Push-Up',            'Shoulders', 'Free Weight', 'Anterior Delt',   'Compound'),
('Pike Push-Up',                 'Shoulders', 'Free Weight', 'Anterior Delt',   'Compound'),
('Cuban Press',                  'Shoulders', 'Free Weight', 'Posterior Delt',  'Isolation'),

-- ── CORE ─────────────────────────────────────────────────────────────────────
-- Machines
('Ab Crunch Machine',        'Core', 'Machine',     'Upper Abs',           'Isolation'),
('Cable Crunch',             'Core', 'Machine',     'Upper Abs',           'Isolation'),
('Rotary Torso Machine',     'Core', 'Machine',     'Obliques',            'Isolation'),
('Roman Chair Sit-Up',       'Core', 'Machine',     'Upper Abs',           'Isolation'),
('Hanging Leg Raise Machine','Core', 'Machine',     'Lower Abs',           'Isolation'),
-- Free Weights
('Plank',                    'Core', 'Free Weight', 'Full Core',           'Compound'),
('Side Plank',               'Core', 'Free Weight', 'Obliques',            'Isolation'),
('Crunch',                   'Core', 'Free Weight', 'Upper Abs',           'Isolation'),
('Bicycle Crunch',           'Core', 'Free Weight', 'Obliques / Upper Abs','Isolation'),
('Reverse Crunch',           'Core', 'Free Weight', 'Lower Abs',           'Isolation'),
('Leg Raise',                'Core', 'Free Weight', 'Lower Abs',           'Isolation'),
('Hanging Leg Raise',        'Core', 'Free Weight', 'Lower Abs',           'Isolation'),
('Hanging Knee Raise',       'Core', 'Free Weight', 'Lower Abs',           'Isolation'),
('V-Up',                     'Core', 'Free Weight', 'Full Abs',            'Isolation'),
('Sit-Up',                   'Core', 'Free Weight', 'Upper Abs',           'Isolation'),
('Ab Wheel Rollout',         'Core', 'Free Weight', 'Full Core',           'Compound'),
('Dragon Flag',              'Core', 'Free Weight', 'Full Abs',            'Isolation'),
('Russian Twist',            'Core', 'Free Weight', 'Obliques',            'Isolation'),
('Weighted Russian Twist',   'Core', 'Free Weight', 'Obliques',            'Isolation'),
('Dead Bug',                 'Core', 'Free Weight', 'Full Core',           'Compound'),
('Bird Dog',                 'Core', 'Free Weight', 'Full Core',           'Compound'),
('Mountain Climbers',        'Core', 'Free Weight', 'Full Core',           'Compound'),
('Hollow Body Hold',         'Core', 'Free Weight', 'Full Abs',            'Isolation'),
('L-Sit',                    'Core', 'Free Weight', 'Lower Abs / Hip Flexors','Isolation'),
('Toes to Bar',              'Core', 'Free Weight', 'Lower Abs',           'Isolation'),
('Flutter Kicks',            'Core', 'Free Weight', 'Lower Abs',           'Isolation'),
('Scissor Kicks',            'Core', 'Free Weight', 'Lower Abs',           'Isolation'),
('Windshield Wipers',        'Core', 'Free Weight', 'Obliques',            'Isolation'),
('Pallof Press',             'Core', 'Free Weight', 'Full Core',           'Compound'),
('Suitcase Carry',           'Core', 'Free Weight', 'Obliques',            'Compound'),
('Turkish Get-Up',           'Core', 'Free Weight', 'Full Core',           'Compound'),
('Landmine Twist',           'Core', 'Free Weight', 'Obliques',            'Isolation'),
('Woodchopper',              'Core', 'Free Weight', 'Obliques',            'Isolation');
