-- SQL Schema for "Programmers Point" Supabase Database
-- Paste this script directly into your Supabase SQL Editor.

-- Enable Row Level Security (RLS)
-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Active submissions by developers
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  problem_id TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'wrong', 'error', 'timeout')),
  points_earned INTEGER DEFAULT 0 NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User aggregated points tracker
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_points INTEGER DEFAULT 0 NOT NULL,
  problems_solved INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_solved_date DATE
);

-- Platform awards (Badges)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_emoji TEXT NOT NULL,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('total_points', 'problems_solved', 'streak')),
  criteria_value INTEGER NOT NULL
);

-- Earned accolades
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, badge_id)
);

-- Leaderboards and monthly divisions
CREATE TABLE IF NOT EXISTS public.monthly_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  total_points INTEGER DEFAULT 0 NOT NULL,
  UNIQUE (user_id, month, year)
);

-- Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_rankings ENABLE ROW LEVEL SECURITY;

-- Select policies (Read access for all authenticated users)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Submissions are viewable by everyone" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "User points are viewable by everyone" ON public.user_points FOR SELECT USING (true);
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Monthly rankings are viewable by everyone" ON public.monthly_rankings FOR SELECT USING (true);

-- Personal edit policies
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON public.user_points FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- System tables insertion default values (e.g., initial badge criteria)
INSERT INTO public.badges (slug, name, description, icon_emoji, criteria_type, criteria_value) VALUES
  ('first-solve', 'First Blood', 'Solved your first coding problem successfully!', '🔥', 'problems_solved', 1),
  ('five-solved', 'Code Ninja', 'Solved 5 high-quality coding challenges!', '🥷', 'problems_solved', 5),
  ('points-century', 'Points Master', 'Earned 100 total points on the platform!', '🏆', 'total_points', 100),
  ('streak-soldier', 'Streak Warrior', 'Maintained a 3-day active solving streak!', '⚡', 'streak', 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_emoji = EXCLUDED.icon_emoji,
  criteria_type = EXCLUDED.criteria_type,
  criteria_value = EXCLUDED.criteria_value;

-- Automatic User Profile & User Points setup on Auth user signup
-- Create a trigger that auto-populates profiles and user_points when an auth user registers.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', concat('user_', substring(new.id::text, 1, 8))),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );

  INSERT INTO public.user_points (user_id, total_points, problems_solved, current_streak, longest_streak)
  VALUES (new.id, 0, 0, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
