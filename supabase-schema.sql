create table if not exists public.career_sessions (
    session_code text primary key,
    state jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.career_sessions enable row level security;

create policy "career_sessions_select_all"
on public.career_sessions
for select
to anon
using (true);

create policy "career_sessions_insert_all"
on public.career_sessions
for insert
to anon
with check (true);

create policy "career_sessions_update_all"
on public.career_sessions
for update
to anon
using (true)
with check (true);
