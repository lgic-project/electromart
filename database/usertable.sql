create table users(
  id uuid primary key references auth.users (id) not null,
  email text unique not null,
  type text default 'USER' check (
    type in ('USER', 'ADMIN')
  ),
  avatar_url text not null,
  created_at timestamp default current_timestamp
);
