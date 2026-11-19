-- Ask MAPLE agent schema. Safe to re-run. Bills and testimony come from MAPLE's MCP server;
-- this database holds only chats. user_id/owner is the Firebase uid the site verified.
create extension if not exists vector;

-- owner/title for the conversation list, and the running-run claim that refuses a second run on a
-- busy thread across Cloud Run instances.
create table if not exists chat_threads (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  running_run_id text,
  run_started_at timestamptz,
  cancel_requested boolean not null default false
);

create table if not exists chat_memories (
  id bigint generated always as identity primary key,
  user_id text not null,
  thread_id text not null,
  run_id text not null,
  content text not null,
  created_at timestamptz not null default now(),
  embedding vector(768) not null,
  unique (thread_id, run_id)
);

create table if not exists usage (
  user_id text not null,
  month date not null,
  tokens bigint not null default 0,
  primary key (user_id, month)
);

-- Which embedding config filled each table (startup check)
create table if not exists embedding_meta (
  table_name text primary key,
  model text not null,
  dims int not null
);

create index if not exists chat_threads_owner_updated_idx on chat_threads (owner, updated_at desc);
create index if not exists chat_memories_embedding_idx on chat_memories using hnsw (embedding vector_cosine_ops);
create index if not exists chat_memories_user_created_idx on chat_memories (user_id, created_at);
