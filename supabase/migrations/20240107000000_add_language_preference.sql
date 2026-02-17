-- Migration: Add language preference to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'tr';
