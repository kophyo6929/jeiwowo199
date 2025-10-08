-- Add media_type column to advertisements table
ALTER TABLE public.advertisements 
ADD COLUMN media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Add comment for clarity
COMMENT ON COLUMN public.advertisements.media_type IS 'Type of media: image or video';