-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create routines table
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT 'target',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  parent_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  is_expanded BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create habit_cells table for daily tracking
CREATE TABLE public.habit_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(habit_id, date)
);

-- Create reflections table
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  went_well TEXT,
  improve TEXT,
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  active_routine_id UUID,
  show_weekends BOOLEAN DEFAULT true,
  canvas_zoom NUMERIC DEFAULT 1,
  canvas_offset_x NUMERIC DEFAULT 0,
  canvas_offset_y NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create time_capsules table
CREATE TABLE public.time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  unlock_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Routines policies
CREATE POLICY "Users can view own routines" ON public.routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON public.routines FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit cells policies
CREATE POLICY "Users can view own cells" ON public.habit_cells FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cells" ON public.habit_cells FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cells" ON public.habit_cells FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cells" ON public.habit_cells FOR DELETE USING (auth.uid() = user_id);

-- Reflections policies
CREATE POLICY "Users can view own reflections" ON public.reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON public.reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections" ON public.reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reflections" ON public.reflections FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Time capsules policies
CREATE POLICY "Users can view own capsules" ON public.time_capsules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own capsules" ON public.time_capsules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own capsules" ON public.time_capsules FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON public.routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_habit_cells_updated_at BEFORE UPDATE ON public.habit_cells FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON public.reflections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_routines_user_id ON public.routines(user_id);
CREATE INDEX idx_habits_routine_id ON public.habits(routine_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_cells_habit_id ON public.habit_cells(habit_id);
CREATE INDEX idx_habit_cells_date ON public.habit_cells(date);
CREATE INDEX idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX idx_time_capsules_user_id ON public.time_capsules(user_id);