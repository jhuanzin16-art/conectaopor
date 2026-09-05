create policy "Staff le midia" on storage.objects
  for select to authenticated using (bucket_id = 'midia' and public.is_staff(auth.uid()));
create policy "Staff envia midia" on storage.objects
  for insert to authenticated with check (bucket_id = 'midia' and public.is_staff(auth.uid()));
create policy "Staff atualiza midia" on storage.objects
  for update to authenticated using (bucket_id = 'midia' and public.is_staff(auth.uid())) with check (bucket_id = 'midia' and public.is_staff(auth.uid()));
create policy "Staff apaga midia" on storage.objects
  for delete to authenticated using (bucket_id = 'midia' and public.is_staff(auth.uid()));