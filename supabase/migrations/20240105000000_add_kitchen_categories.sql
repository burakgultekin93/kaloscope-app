-- Migration: Add kitchen_preferences and culinary_goals to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kitchen_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS culinary_goals TEXT[] DEFAULT '{}';
