-- ====================================================================
-- PROJECT QUATRO — RLS SECURITY HARDENING & PERFORMANCE OPTIMIZATION
-- Per PRD-03 and Supabase Security / Postgres Best Practices
-- ====================================================================

-- 1. Profiles (Optimized with subquery & authenticated role)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- 2. Player Progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.player_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.player_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.player_progress;

CREATE POLICY "Users can view their own progress"
  ON public.player_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.player_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.player_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 3. Player Vehicles
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.player_vehicles;
DROP POLICY IF EXISTS "Users can manage their own vehicles" ON public.player_vehicles;

CREATE POLICY "Users can manage their own vehicles"
  ON public.player_vehicles FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 4. Puzzle Progress
DROP POLICY IF EXISTS "Users can view their own puzzles" ON public.puzzle_progress;
DROP POLICY IF EXISTS "Users can update their own puzzles" ON public.puzzle_progress;

CREATE POLICY "Users can manage their own puzzles"
  ON public.puzzle_progress FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 5. Story Progress (Fix missing policy!)
DROP POLICY IF EXISTS "Users can manage their own story progress" ON public.story_progress;

CREATE POLICY "Users can manage their own story progress"
  ON public.story_progress FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 6. Checkpoints
DROP POLICY IF EXISTS "Users can view their own checkpoints" ON public.checkpoints;
DROP POLICY IF EXISTS "Users can insert their own checkpoints" ON public.checkpoints;

CREATE POLICY "Users can manage their own checkpoints"
  ON public.checkpoints FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 7. Vehicles Catalog: Public read-only
DROP POLICY IF EXISTS "Vehicles catalog is viewable by all" ON public.vehicles;

CREATE POLICY "Vehicles catalog is viewable by all"
  ON public.vehicles FOR SELECT
  TO anon, authenticated
  USING (true);

-- 8. Add Foreign Key / RLS Performance Indexes
CREATE INDEX IF NOT EXISTS idx_player_progress_user_id ON public.player_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_player_vehicles_user_id ON public.player_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_progress_user_id ON public.puzzle_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_user_id ON public.story_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_user_id ON public.checkpoints(user_id);
