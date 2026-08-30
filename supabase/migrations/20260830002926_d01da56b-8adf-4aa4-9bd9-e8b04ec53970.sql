revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.recalc_progress() from public, anon, authenticated;
revoke all on function public.admin_stats() from anon;
revoke all on function public.issue_certificate(uuid) from anon;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.issue_certificate(uuid) to authenticated;