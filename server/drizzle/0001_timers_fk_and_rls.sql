alter table "timers"
  add constraint "timers_user_id_auth_users_fk"
  foreign key ("user_id") references auth.users(id) on delete cascade;

alter table "timers" enable row level security;

create policy "Users can view their own timer"
  on "timers" for select
  using (auth.uid() = user_id);

create policy "Users can insert their own timer"
  on "timers" for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own timer"
  on "timers" for update
  using (auth.uid() = user_id);

create policy "Users can delete their own timer"
  on "timers" for delete
  using (auth.uid() = user_id);