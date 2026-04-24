-- Drop existing tables to apply the new schema cleanly
DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS user_saved_exercises CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;

-- Create the master exercises table
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  default_body_part TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the user_saved_exercises table (exercises users added to their sections)
CREATE TABLE user_saved_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  body_part TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, exercise_id, body_part)
);

-- Create the workout_logs table
CREATE TABLE workout_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Exercises viewable by everyone" ON exercises FOR SELECT USING (true);

CREATE POLICY "Users can manage saved exercises" ON user_saved_exercises FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);

-- Insert Seed Data
INSERT INTO exercises (name, default_body_part, type) VALUES
-- Chest (Machines)
('Chest Press Machine', 'Chest', 'Machine'),
('Incline Chest Press Machine', 'Chest', 'Machine'),
('Pec Deck / Butterfly Machine', 'Chest', 'Machine'),
('Cable Crossover Machine', 'Chest', 'Machine'),
('Smith Machine Bench Press', 'Chest', 'Machine'),
-- Chest (Free Weights)
('Barbell Bench Press', 'Chest', 'Free Weight'),
('Dumbbell Bench Press', 'Chest', 'Free Weight'),
('Incline Barbell Bench Press', 'Chest', 'Free Weight'),
('Incline Dumbbell Bench Press', 'Chest', 'Free Weight'),
('Decline Bench Press', 'Chest', 'Free Weight'),
('Dumbbell Fly', 'Chest', 'Free Weight'),
('Incline Dumbbell Fly', 'Chest', 'Free Weight'),
('Push-Ups', 'Chest', 'Free Weight'),
('Wide Push-Ups', 'Chest', 'Free Weight'),
('Decline Push-Ups', 'Chest', 'Free Weight'),
('Dips', 'Chest', 'Free Weight'),
('Cable Fly', 'Chest', 'Free Weight'),
('Low-to-High Cable Fly', 'Chest', 'Free Weight'),
('High-to-Low Cable Fly', 'Chest', 'Free Weight'),

-- Triceps (Machines)
('Triceps Pushdown Machine', 'Triceps', 'Machine'),
('Assisted Dip Machine', 'Triceps', 'Machine'),
('Cable Rope Pushdown', 'Triceps', 'Machine'),
('Single Arm Cable Pushdown', 'Triceps', 'Machine'),
('Triceps Extension Machine', 'Triceps', 'Machine'),
-- Triceps (Free Weights)
('Close Grip Bench Press', 'Triceps', 'Free Weight'),
('Bench Dips', 'Triceps', 'Free Weight'),
('Parallel Bar Dips', 'Triceps', 'Free Weight'),
('Dumbbell Overhead Triceps Extension', 'Triceps', 'Free Weight'),
('One Arm Dumbbell Triceps Extension', 'Triceps', 'Free Weight'),
('Skull Crushers', 'Triceps', 'Free Weight'),
('Barbell Skull Crushers', 'Triceps', 'Free Weight'),
('Dumbbell Kickbacks', 'Triceps', 'Free Weight'),
('Rope Pushdowns', 'Triceps', 'Free Weight'),
('Overhead Cable Extension', 'Triceps', 'Free Weight'),
('Diamond Push-Ups', 'Triceps', 'Free Weight'),
('EZ Bar Triceps Extension', 'Triceps', 'Free Weight'),

-- Back (Machines)
('Lat Pulldown Machine', 'Back', 'Machine'),
('Seated Cable Row Machine', 'Back', 'Machine'),
('High Row Machine', 'Back', 'Machine'),
('Low Row Machine', 'Back', 'Machine'),
('Assisted Pull-Up Machine', 'Back', 'Machine'),
('Back Extension Machine', 'Back', 'Machine'),
('T-Bar Row Machine', 'Back', 'Machine'),
('Hammer Strength Row Machine', 'Back', 'Machine'),
-- Back (Free Weights)
('Pull-Ups', 'Back', 'Free Weight'),
('Chin-Ups', 'Back', 'Free Weight'),
('Barbell Bent Over Row', 'Back', 'Free Weight'),
('Dumbbell Row', 'Back', 'Free Weight'),
('One Arm Dumbbell Row', 'Back', 'Free Weight'),
('T-Bar Row', 'Back', 'Free Weight'),
('Deadlift', 'Back', 'Free Weight'),
('Romanian Deadlift', 'Back', 'Free Weight'),
('Rack Pull', 'Back', 'Free Weight'),
('Inverted Row', 'Back', 'Free Weight'),
('Renegade Row', 'Back', 'Free Weight'),
('Straight Arm Pulldown', 'Back', 'Free Weight'),
('Face Pull', 'Back', 'Free Weight'),
('Superman Hold', 'Back', 'Free Weight'),
('Good Mornings', 'Back', 'Free Weight'),

-- Biceps (Machines)
('Biceps Curl Machine', 'Biceps', 'Machine'),
('Preacher Curl Machine', 'Biceps', 'Machine'),
('Cable Curl Machine', 'Biceps', 'Machine'),
('Assisted Curl Machine', 'Biceps', 'Machine'),
('Scott Curl Machine', 'Biceps', 'Machine'),
-- Biceps (Free Weights)
('Barbell Curl', 'Biceps', 'Free Weight'),
('EZ Bar Curl', 'Biceps', 'Free Weight'),
('Dumbbell Curl', 'Biceps', 'Free Weight'),
('Alternating Dumbbell Curl', 'Biceps', 'Free Weight'),
('Hammer Curl', 'Biceps', 'Free Weight'),
('Concentration Curl', 'Biceps', 'Free Weight'),
('Preacher Curl', 'Biceps', 'Free Weight'),
('Incline Dumbbell Curl', 'Biceps', 'Free Weight'),
('Spider Curl', 'Biceps', 'Free Weight'),
('Reverse Curl', 'Biceps', 'Free Weight'),
('Cross Body Hammer Curl', 'Biceps', 'Free Weight'),
('Zottman Curl', 'Biceps', 'Free Weight'),
('Drag Curl', 'Biceps', 'Free Weight'),

-- Legs (Machines)
('Leg Press Machine', 'Legs', 'Machine'),
('Leg Extension Machine', 'Legs', 'Machine'),
('Leg Curl Machine', 'Legs', 'Machine'),
('Seated Leg Curl Machine', 'Legs', 'Machine'),
('Standing Calf Raise Machine', 'Legs', 'Machine'),
('Seated Calf Raise Machine', 'Legs', 'Machine'),
('Hack Squat Machine', 'Legs', 'Machine'),
('Smith Machine Squat', 'Legs', 'Machine'),
('Glute Kickback Machine', 'Legs', 'Machine'),
('Hip Abductor Machine', 'Legs', 'Machine'),
('Hip Adductor Machine', 'Legs', 'Machine'),
-- Legs (Free Weights)
('Squat', 'Legs', 'Free Weight'),
('Barbell Back Squat', 'Legs', 'Free Weight'),
('Front Squat', 'Legs', 'Free Weight'),
('Goblet Squat', 'Legs', 'Free Weight'),
('Bulgarian Split Squat', 'Legs', 'Free Weight'),
('Lunges', 'Legs', 'Free Weight'),
('Walking Lunges', 'Legs', 'Free Weight'),
('Reverse Lunges', 'Legs', 'Free Weight'),
('Step-Ups', 'Legs', 'Free Weight'),
('Stiff Leg Deadlift', 'Legs', 'Free Weight'),
('Sumo Deadlift', 'Legs', 'Free Weight'),
('Hip Thrust', 'Legs', 'Free Weight'),
('Glute Bridge', 'Legs', 'Free Weight'),
('Calf Raises', 'Legs', 'Free Weight'),
('Single Leg Calf Raises', 'Legs', 'Free Weight'),
('Jump Squats', 'Legs', 'Free Weight'),
('Box Jumps', 'Legs', 'Free Weight'),
('Wall Sit', 'Legs', 'Free Weight'),
('Pistol Squat', 'Legs', 'Free Weight'),

-- Shoulders (Machines)
('Shoulder Press Machine', 'Shoulders', 'Machine'),
('Lateral Raise Machine', 'Shoulders', 'Machine'),
('Rear Delt Fly Machine', 'Shoulders', 'Machine'),
('Cable Shoulder Press', 'Shoulders', 'Machine'),
('Smith Machine Shoulder Press', 'Shoulders', 'Machine'),
('Upright Row Machine', 'Shoulders', 'Machine'),
-- Shoulders (Free Weights)
('Barbell Overhead Press', 'Shoulders', 'Free Weight'),
('Dumbbell Shoulder Press', 'Shoulders', 'Free Weight'),
('Arnold Press', 'Shoulders', 'Free Weight'),
('Seated Dumbbell Press', 'Shoulders', 'Free Weight'),
('Lateral Raise', 'Shoulders', 'Free Weight'),
('Front Raise', 'Shoulders', 'Free Weight'),
('Rear Delt Fly', 'Shoulders', 'Free Weight'),
('Bent Over Lateral Raise', 'Shoulders', 'Free Weight'),
('Upright Row', 'Shoulders', 'Free Weight'),
('Push Press', 'Shoulders', 'Free Weight'),
('Handstand Push-Up', 'Shoulders', 'Free Weight'),
('Pike Push-Up', 'Shoulders', 'Free Weight'),
('Cuban Press', 'Shoulders', 'Free Weight');
