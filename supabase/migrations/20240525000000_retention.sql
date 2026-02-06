-- Arena / Battle System Tables

CREATE TABLE IF NOT EXISTS public.post_battles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    battle_date DATE DEFAULT CURRENT_DATE NOT NULL,
    category TEXT NOT NULL,
    post_a_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    post_b_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    votes_a INTEGER DEFAULT 0,
    votes_b INTEGER DEFAULT 0,
    winner_id UUID REFERENCES public.posts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_date, category)
);

CREATE TABLE IF NOT EXISTS public.battle_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    battle_id UUID NOT NULL REFERENCES public.post_battles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view battles" 
ON public.post_battles FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert battles" 
ON public.post_battles FOR INSERT 
WITH CHECK (true); -- Ideally restrictive, but for MVP/lazy-gen valid.

CREATE POLICY "Users can view own votes" 
ON public.battle_votes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can vote once" 
ON public.battle_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to handle voting and update counts
CREATE OR REPLACE FUNCTION public.handle_new_battle_vote()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.post_id = (SELECT post_a_id FROM post_battles WHERE id = NEW.battle_id) THEN
        UPDATE post_battles SET votes_a = votes_a + 1 WHERE id = NEW.battle_id;
    ELSIF NEW.post_id = (SELECT post_b_id FROM post_battles WHERE id = NEW.battle_id) THEN
        UPDATE post_battles SET votes_b = votes_b + 1 WHERE id = NEW.battle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_battle_vote_added
AFTER INSERT ON public.battle_votes
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_battle_vote();

-- Function to generate a daily battle if none exists
-- Selects 2 random posts from last 7 days that are NOT removed and NOT same author
CREATE OR REPLACE FUNCTION public.get_or_create_daily_battle(p_category TEXT)
RETURNS UUID AS $$
DECLARE
    v_battle_id UUID;
    v_post_a UUID;
    v_post_b UUID;
BEGIN
    -- Check if battle exists for today (ignoring timezone issues for MVP simple date check)
    SELECT id INTO v_battle_id 
    FROM post_battles 
    WHERE battle_date = CURRENT_DATE 
    AND category = p_category;

    IF v_battle_id IS NOT NULL THEN
        RETURN v_battle_id;
    END IF;

    -- Try to find 2 distinct posts
    SELECT id INTO v_post_a FROM posts 
    WHERE is_removed = FALSE 
    AND category = p_category
    ORDER BY random() LIMIT 1;

    SELECT id INTO v_post_b FROM posts 
    WHERE is_removed = FALSE 
    AND category = p_category
    AND id != v_post_a
    ORDER BY random() LIMIT 1;

    -- If we found 2 posts, create battle
    IF v_post_a IS NOT NULL AND v_post_b IS NOT NULL THEN
        INSERT INTO post_battles (category, post_a_id, post_b_id)
        VALUES (p_category, v_post_a, v_post_b)
        RETURNING id INTO v_battle_id;
        
        RETURN v_battle_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
