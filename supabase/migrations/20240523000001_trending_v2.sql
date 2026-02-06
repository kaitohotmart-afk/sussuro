-- Function to calculate trending score (V2)
CREATE OR REPLACE FUNCTION public.calculate_trending_score(
  p_like_count INTEGER,
  p_comment_count INTEGER,
  p_share_count INTEGER,
  p_created_at TIMESTAMP WITH TIME ZONE,
  p_report_count INTEGER,
  p_user_follower_count INTEGER,
  p_is_series BOOLEAN,
  p_category TEXT
) RETURNS NUMERIC AS $$
DECLARE
  hours_old NUMERIC;
  engagement_base NUMERIC;
  velocity_bonus NUMERIC;
  quality_penalty NUMERIC;
  creator_boost NUMERIC;
  series_boost NUMERIC;
  category_weight NUMERIC;
  final_score NUMERIC;
BEGIN
  -- 1. Calculate age in hours
  hours_old := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 3600;
  
  -- 2. Base engagement score
  -- Comments x3, Shares x5, Likes x1
  engagement_base := (p_like_count * 1.0) + (p_comment_count * 3.0) + (COALESCE(p_share_count, 0) * 5.0);
  
  -- 3. Velocity Bonus (fast growth)
  IF hours_old > 0 THEN
    velocity_bonus := engagement_base / hours_old;
    -- Cap bonus at 50% of base score to prevent explosions
    velocity_bonus := LEAST(velocity_bonus, engagement_base * 0.5);
  ELSE
    velocity_bonus := 0;
  END IF;
  
  -- 4. Quality Penalty (Reports)
  -- Each report reduces score by 5%, capped at 30% min score
  quality_penalty := 1.0 - (p_report_count * 0.05);
  quality_penalty := GREATEST(quality_penalty, 0.3);
  
  -- 5. Creator Boost (Established users)
  IF p_user_follower_count >= 1000 THEN
    creator_boost := 1.20; -- +20%
  ELSIF p_user_follower_count >= 500 THEN
    creator_boost := 1.10; -- +10%
  ELSIF p_user_follower_count >= 100 THEN
    creator_boost := 1.05; -- +5%
  ELSE
    creator_boost := 1.0;
  END IF;
  
  -- 6. Series Boost
  IF p_is_series IS TRUE THEN
    series_boost := 1.15;
  ELSE
    series_boost := 1.0;
  END IF;
  
  -- 7. Category Weights
  CASE p_category
    WHEN 'Confissão' THEN category_weight := 1.2;
    WHEN 'WTF' THEN category_weight := 1.15;
    WHEN 'Polêmico' THEN category_weight := 1.1;
    WHEN 'Chocante' THEN category_weight := 1.1;
    WHEN 'Relacionamentos' THEN category_weight := 1.05;
    ELSE category_weight := 1.0;
  END CASE;
  
  -- 8. Final Formula with Time Decay
  -- (Age + 2)^1.8 creates a strong decay curve
  final_score := (
    (engagement_base + velocity_bonus) * 
    quality_penalty * 
    creator_boost * 
    series_boost * 
    category_weight
  ) / POWER(hours_old + 2, 1.8);
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- RPC Function to fetch Explore Feed
-- This allows us to call the complex logic from the client/server simple call
CREATE OR REPLACE FUNCTION public.get_explore_feed(
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  category TEXT,
  post_type TEXT,
  is_sensitive BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  like_count INTEGER,
  comment_count INTEGER,
  report_count INTEGER,
  author_username TEXT,
  author_avatar_type TEXT,
  author_avatar_value TEXT,
  trending_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.category,
    p.post_type,
    p.is_sensitive,
    p.created_at,
    p.like_count,
    p.comment_count,
    p.report_count,
    u.username as author_username,
    u.avatar_type as author_avatar_type,
    u.avatar_value as author_avatar_value,
    public.calculate_trending_score(
      p.like_count,
      p.comment_count,
      0, -- share_count not in posts table yet, assuming 0 or need to add column
      p.created_at,
      p.report_count,
      u.follower_count,
      FALSE, -- is_series not in posts table yet
      p.category
    ) as trending_score
  FROM public.posts p
  JOIN public.users u ON p.user_id = u.id
  WHERE p.is_removed = FALSE
    AND p.created_at > NOW() - INTERVAL '7 days' -- Optimization: only recent posts
  ORDER BY trending_score DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
