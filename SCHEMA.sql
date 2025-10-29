-- Flatly App Database Schema
-- Production-ready schema with authentication, profiles, matches, messages, and activity logging

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES TABLE (extends auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  birthdate DATE NOT NULL,
  age INTEGER,
  university TEXT,
  city TEXT,
  country TEXT,
  geo JSONB, -- {lat: number, lng: number}
  has_room BOOLEAN DEFAULT false,
  short_bio TEXT,
  photos TEXT[], -- array of image URLs
  badges TEXT[], -- array of badge names
  paused BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'unverified', -- unverified, pending_review, verified, rejected
  auto_match_message TEXT,
  send_auto_match_message BOOLEAN DEFAULT true,
  recommendation_code TEXT,
  use_recommendation_code BOOLEAN DEFAULT false,
  ig_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- LIFESTYLE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.lifestyles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  hobbies TEXT[],
  sports_hobbies TEXT[],
  cleanliness TEXT, -- chill, avg, meticulous
  sleep TEXT, -- early, flex, night
  smoker BOOLEAN DEFAULT false,
  alcohol TEXT, -- never, sometimes, often
  pets_ok BOOLEAN DEFAULT false,
  guests TEXT, -- never, sometimes, often
  noise TEXT, -- low, med, high
  religion TEXT,
  show_religion BOOLEAN DEFAULT false,
  political_view TEXT,
  show_political_view BOOLEAN DEFAULT false,
  politics_percent INTEGER,
  religious_choice TEXT,
  money_style TEXT,
  food_preference TEXT,
  food_other TEXT,
  series_films TEXT,
  dietary TEXT[],
  nationalities TEXT[],
  languages TEXT[],
  study_program_year TEXT,
  job_or_internship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- HOUSING TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.housing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  has_room BOOLEAN DEFAULT false,
  
  -- For room owners
  neighborhood TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  rent INTEGER,
  bills_included BOOLEAN DEFAULT false,
  available_from DATE,
  available_to DATE,
  is_owner BOOLEAN DEFAULT false,
  
  -- For room seekers
  budget_min INTEGER,
  budget_max INTEGER,
  target_neighborhoods TEXT[],
  wanted_from DATE,
  wanted_to DATE,
  preferences_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- PREFERENCES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 99,
  max_distance_km INTEGER DEFAULT 50,
  looking_for TEXT, -- roommate, room, either
  dealbreakers TEXT[],
  must_haves TEXT[],
  city_only BOOLEAN DEFAULT false,
  university_filter BOOLEAN DEFAULT false,
  gender_preference TEXT, -- male, female, non-binary, no-preference
  looking_for_gender TEXT[], -- [male, female, non-binary]
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- MATCHES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  users UUID[] NOT NULL, -- array of user IDs (2 for 1-to-1, 2-5 for groups)
  group_name TEXT, -- only for group matches
  created_by UUID REFERENCES public.profiles(id), -- who created the group
  blocked BOOLEAN DEFAULT false,
  compatibility_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  read_at TIMESTAMPTZ
);

-- ==========================================
-- SWIPES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- like, pass, superlike
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(swiper_id, target_id)
);

-- ==========================================
-- VERIFICATION TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  verification_type TEXT NOT NULL, -- student_id, passport, drivers_license
  file_urls TEXT[], -- uploaded verification documents
  issuer_text TEXT, -- university name or other issuer
  status TEXT DEFAULT 'pending_review', -- pending_review, verified, rejected
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- ACTIVITY LOG TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event TEXT NOT NULL, -- sign_up, sign_in, onboarding_step_completed, profile_edit, like, pass, match_created, message_sent, message_received, group_created, group_joined, group_left, privacy_toggle, verification_submitted, verification_approved, verification_rejected
  metadata JSONB, -- additional event-specific data
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- BLOCKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);

-- ==========================================
-- REPORTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, actioned
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone (except blocked)"
  ON public.profiles FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1 FROM public.blocks
      WHERE blocker_id = auth.uid() AND blocked_id = profiles.id
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Lifestyles policies
CREATE POLICY "Lifestyles are viewable by everyone"
  ON public.lifestyles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own lifestyle"
  ON public.lifestyles FOR ALL
  USING (auth.uid() = user_id);

-- Housing policies
CREATE POLICY "Housing is viewable by everyone"
  ON public.housing FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own housing"
  ON public.housing FOR ALL
  USING (auth.uid() = user_id);

-- Preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON public.preferences FOR ALL
  USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = ANY(users));

CREATE POLICY "Users can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = ANY(users));

-- Messages policies
CREATE POLICY "Users can view messages in their matches"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = messages.match_id
      AND auth.uid() = ANY(matches.users)
    )
  );

CREATE POLICY "Users can insert messages in their matches"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = messages.match_id
      AND auth.uid() = ANY(matches.users)
    )
    AND sender_id = auth.uid()
  );

-- Swipes policies
CREATE POLICY "Users can view their own swipes"
  ON public.swipes FOR SELECT
  USING (auth.uid() = swiper_id);

CREATE POLICY "Users can create their own swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (auth.uid() = swiper_id);

-- Verifications policies
CREATE POLICY "Users can view their own verifications"
  ON public.verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own verifications"
  ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Blocks policies
CREATE POLICY "Users can view their own blocks"
  ON public.blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can manage their own blocks"
  ON public.blocks FOR ALL
  USING (auth.uid() = blocker_id);

-- Reports policies
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lifestyles_updated_at BEFORE UPDATE ON public.lifestyles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_housing_updated_at BEFORE UPDATE ON public.housing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log profile creation
CREATE OR REPLACE FUNCTION log_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, event, metadata)
  VALUES (NEW.id, 'sign_up', jsonb_build_object('email', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_new_profile AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_creation();

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_university ON public.profiles(university);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches USING GIN(users);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_id ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target_id ON public.swipes(target_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks(blocked_id);

-- ==========================================
-- REALTIME SETUP
-- ==========================================

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
