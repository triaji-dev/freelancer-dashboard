-- Migration to add preferences column to profiles table
-- Run this in Supabase SQL Editor to update your existing table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences jsonb default '{}'::jsonb;
