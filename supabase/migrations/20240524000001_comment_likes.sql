-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can like comments" 
ON public.comment_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" 
ON public.comment_likes FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comment likes" 
ON public.comment_likes FOR SELECT 
USING (true);

-- Functions and Triggers for like_count
CREATE OR REPLACE FUNCTION public.handle_new_comment_like()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.comments
    SET like_count = like_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_remove_comment_like()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.comments
    SET like_count = like_count - 1
    WHERE id = OLD.comment_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_like_added
AFTER INSERT ON public.comment_likes
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_comment_like();

CREATE TRIGGER on_comment_like_removed
AFTER DELETE ON public.comment_likes
FOR EACH ROW EXECUTE PROCEDURE public.handle_remove_comment_like();

-- Helper to check if user liked comments
CREATE OR REPLACE FUNCTION get_user_liked_comments(p_post_id UUID)
RETURNS TABLE (comment_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT cl.comment_id
    FROM comment_likes cl
    JOIN comments c ON c.id = cl.comment_id
    WHERE cl.user_id = auth.uid()
    AND c.post_id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
