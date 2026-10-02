-- ====================================================================
-- PROJECT QUATRO — SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Per PRD-03 (Web Architecture, Database & Security)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE vehicle_scale_mode AS ENUM ('BIG', 'POCKET');
CREATE TYPE puzzle_status AS ENUM ('locked', 'available', 'completed');

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Driver ;',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PLAYER PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.player_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_chapter INT NOT NULL DEFAULT 1 CHECK (current_chapter >= 1),
  current_day INT NOT NULL DEFAULT 1 CHECK (current_day BETWEEN 1 AND 3),
  current_location TEXT NOT NULL DEFAULT 'suburban_road',
  pocket_unlocked BOOLEAN NOT NULL DEFAULT false,
  guardian_spoken BOOLEAN NOT NULL DEFAULT false,
  castle_gate_open BOOLEAN NOT NULL DEFAULT false,
  puzzle_solved BOOLEAN NOT NULL DEFAULT false,
  progress_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_progress UNIQUE (user_id)
);

-- 5. VEHICLES CATALOG (Public reference table)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_stats JSONB NOT NULL DEFAULT '{"max_speed": 18.0, "acceleration": 10.0, "handling": 4.0}'::jsonb,
  unlock_requirement TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PLAYER VEHICLES (Owned vehicles per user)
CREATE TABLE IF NOT EXISTS public.player_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  condition NUMERIC NOT NULL DEFAULT 100.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_player_vehicle UNIQUE (user_id, vehicle_id)
);

-- 7. PUZZLE PROGRESS
CREATE TABLE IF NOT EXISTS public.puzzle_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  puzzle_key TEXT NOT NULL,
  status puzzle_status NOT NULL DEFAULT 'locked',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_puzzle UNIQUE (user_id, puzzle_key)
);

-- 8. STORY PROGRESS FLAGS
CREATE TABLE IF NOT EXISTS public.story_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL,
  flag_value BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_story_flag UNIQUE (user_id, flag_key)
);

-- 9. CHECKPOINTS
CREATE TABLE IF NOT EXISTS public.checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chapter INT NOT NULL,
  location TEXT NOT NULL,
  checkpoint_key TEXT NOT NULL,
  pos_x NUMERIC NOT NULL DEFAULT 0,
  pos_y NUMERIC NOT NULL DEFAULT 0.35,
  pos_z NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;

-- Vehicles Catalog: Public read-only
CREATE POLICY "Vehicles catalog is viewable by all"
  ON public.vehicles FOR SELECT
  USING (true);

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Player Progress Policies
CREATE POLICY "Users can view their own progress"
  ON public.player_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.player_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.player_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Player Vehicles Policies
CREATE POLICY "Users can view their own vehicles"
  ON public.player_vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own vehicles"
  ON public.player_vehicles FOR ALL
  USING (auth.uid() = user_id);

-- Puzzle Progress Policies
CREATE POLICY "Users can view their own puzzles"
  ON public.puzzle_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own puzzles"
  ON public.puzzle_progress FOR ALL
  USING (auth.uid() = user_id);

-- Checkpoints Policies
CREATE POLICY "Users can view their own checkpoints"
  ON public.checkpoints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkpoints"
  ON public.checkpoints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- REALTIME REPLICATION PUBLICATION
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_progress;

-- ====================================================================
-- SEED INITIAL VEHICLE CATALOG DATA
-- ====================================================================
INSERT INTO public.vehicles (id, name, description, base_stats, unlock_requirement)
VALUES (
  'quatro_rally_85',
  'Quatro Rally 1985',
  'A vintage terracotta rally hatchback with dual-scale transformation capability.',
  '{"max_speed": 18.0, "acceleration": 10.0, "handling": 4.0, "camber": -0.05}'::jsonb,
  'default'
)
ON CONFLICT (id) DO NOTHING;
