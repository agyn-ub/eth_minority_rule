-- User Profiles Table
-- Blockchain tables (games, players, votes, etc.) are created by Ponder
-- This migration creates ONLY the user profile table

CREATE TABLE user_profiles (
  wallet_address TEXT PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for searching by display name
CREATE INDEX idx_user_profiles_display_name ON user_profiles(LOWER(display_name));

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can see profiles)
CREATE POLICY "Public read access for user profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- Service role can write
CREATE POLICY "Service role can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update profiles"
  ON user_profiles FOR UPDATE
  USING (true);
