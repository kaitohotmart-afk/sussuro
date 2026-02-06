-- Add title column to posts table
ALTER TABLE public.posts 
ADD COLUMN title TEXT;

-- Update RLS (if needed, though standard INSERT/SELECT policies usually cover new columns if using 'true' or row-based checks)
-- But we might want to ensure older posts have a default or just handle nulls in code.
-- No complex RLS change needed for adding a column typically unless specific column-security is used.
