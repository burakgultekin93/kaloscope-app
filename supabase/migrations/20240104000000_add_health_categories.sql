-- Migration: Add dietary_preferences and health_focus to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS health_focus TEXT[] DEFAULT '{}';
