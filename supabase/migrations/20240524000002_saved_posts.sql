-- Create saved_posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can save posts" 
ON public.saved_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
ON public.saved_posts FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their saved posts" 
ON public.saved_posts FOR SELECT 
USING (auth.uid() = user_id);

-- Helper to check if user saved posts
CREATE OR REPLACE FUNCTION get_user_saved_posts(p_post_ids UUID[])
RETURNS TABLE (post_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT sp.post_id
    FROM saved_posts sp
    WHERE sp.user_id = auth.uid()
    AND sp.post_id = ANY(p_post_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
