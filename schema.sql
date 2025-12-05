-- Create the projects table
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text,
  category text,
  link text,
  deadline date,
  prize text,
  metadata jsonb default '{}'::jsonb,
  status text default 'Watchlisted',
  archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table projects enable row level security;

-- Create policies
create policy "Users can view their own projects"
  on projects for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own projects"
  on projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own projects"
  on projects for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own projects"
  on projects for delete
  using ( auth.uid() = user_id );

-- Create a function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger for updated_at
create trigger projects_updated_at
  before update on projects
  for each row
  execute procedure handle_updated_at();
