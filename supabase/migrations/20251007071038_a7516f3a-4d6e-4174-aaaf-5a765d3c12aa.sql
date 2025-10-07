-- Add missing columns to videos table (cast is a reserved keyword so we use quotes)
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS telegram_link text,
ADD COLUMN IF NOT EXISTS "cast" text;