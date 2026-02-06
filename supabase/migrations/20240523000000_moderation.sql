-- Function to handle new reports
create or replace function public.handle_new_report()
returns trigger as $$
begin
  -- Increment report_count for the post
  if new.post_id is not null then
    update public.posts
    set report_count = report_count + 1
    where id = new.post_id;
    
    -- Check if threshold reached
    update public.posts
    set is_removed = true,
        removed_reason = 'Automated moderation: report threshold exceeded',
        removed_at = now()
    where id = new.post_id and report_count >= 10;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_report_created on public.reports;
create trigger on_report_created
  after insert on public.reports
  for each row execute procedure public.handle_new_report();
