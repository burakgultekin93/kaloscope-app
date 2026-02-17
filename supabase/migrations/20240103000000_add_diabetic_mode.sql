-- Migration: Add is_diabetic column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_diabetic BOOLEAN DEFAULT false;
