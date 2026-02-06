-- Add role to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'mod'));

-- Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'reply', 'mention', 'system', 'report_update')),
    entity_id UUID, -- post_id, comment_id, etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notification RLS Policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = recipient_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true); -- Ideally restricted to server-side only in real prod, but open for triggers

CREATE POLICY "Users can update their own notifications (read status)" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = recipient_id);

-- Admin Dashboard Stats RPC
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    total_users INT;
    new_users_7d INT;
    total_posts INT;
    posts_24h INT;
    total_reports INT;
    pending_reports INT;
    total_comments INT;
BEGIN
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO new_users_7d FROM users WHERE created_at > NOW() - INTERVAL '7 days';
    
    SELECT COUNT(*) INTO total_posts FROM posts WHERE is_removed = FALSE;
    SELECT COUNT(*) INTO posts_24h FROM posts WHERE created_at > NOW() - INTERVAL '24 hours' AND is_removed = FALSE;
    
    SELECT COUNT(*) INTO total_reports FROM reports;
    SELECT COUNT(*) INTO pending_reports FROM reports WHERE status = 'pending';
    
    SELECT COUNT(*) INTO total_comments FROM comments WHERE is_removed = FALSE;
    
    RETURN jsonb_build_object(
        'total_users', total_users,
        'new_users_7d', new_users_7d,
        'total_posts', total_posts,
        'posts_24h', posts_24h,
        'total_comments', total_comments,
        'total_reports', total_reports,
        'pending_reports', pending_reports
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily Activity Stats (for Graphs)
CREATE OR REPLACE FUNCTION public.get_daily_activity_stats(days INT DEFAULT 30)
RETURNS TABLE (
    date DATE,
    posts_count BIGINT,
    users_count BIGINT,
    comments_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.date::DATE,
        COUNT(DISTINCT p.id) FILTER (WHERE p.id IS NOT NULL) as posts_count,
        COUNT(DISTINCT u.id) FILTER (WHERE u.id IS NOT NULL) as users_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) as comments_count
    FROM generate_series(
        CURRENT_DATE - (days || ' days')::INTERVAL,
        CURRENT_DATE,
        '1 day'::INTERVAL
    ) d(date)
    LEFT JOIN posts p ON DATE(p.created_at) = d.date
    LEFT JOIN users u ON DATE(u.created_at) = d.date
    LEFT JOIN comments c ON DATE(c.created_at) = d.date
    GROUP BY d.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification on Like
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id != (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, entity_id, metadata)
        VALUES (
            (SELECT user_id FROM posts WHERE id = NEW.post_id),
            NEW.user_id,
            'like',
            NEW.post_id,
            jsonb_build_object('reaction_type', NEW.reaction_type)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_created ON public.likes;
CREATE TRIGGER on_like_created
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_like();

-- Trigger to create notification on Comment
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id != (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, entity_id, metadata)
        VALUES (
            (SELECT user_id FROM posts WHERE id = NEW.post_id),
            NEW.user_id,
            'comment',
            NEW.post_id,
            jsonb_build_object('content_preview', substring(NEW.content from 1 for 50))
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_comment();

-- Update user role policy (Simple admin check for now)
-- Note: You normally check JWT claims, but for this MVP we query the users table or assume claims are synced
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'mod')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
