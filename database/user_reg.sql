create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'avatar_url' is null or new.raw_user_meta_data->>'avatar_url' = '' then
    new.raw_user_meta_data = jsonb_set(new.raw_user_meta_data, '{avatar_url}', '"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"', true);
  end if;

  insert into public.users (id, email, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'avatar_url');

  return new;
end;
$$ language plpgsql security definer;