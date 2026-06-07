-- ==========================================================
-- ChinaUni AI — Neon (PostgreSQL) Schema
-- Paste this into: Neon Console → SQL Editor → Run
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE,
  name       VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Conversations ──────────────────────────────────────────
-- mode: 'chat' | 'agent'
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(500)  NOT NULL DEFAULT 'New Conversation',
  mode       VARCHAR(10)   NOT NULL DEFAULT 'chat'
               CHECK (mode IN ('chat', 'agent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id
  ON conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON conversations(updated_at DESC);

-- ── Messages ───────────────────────────────────────────────
-- role: 'user' | 'assistant' | 'tool' | 'system'
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role            VARCHAR(20)  NOT NULL
                    CHECK (role IN ('user', 'assistant', 'tool', 'system')),
  content         TEXT,
  -- populated when role = 'tool'
  tool_call_id    VARCHAR(255),
  tool_name       VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON messages(created_at);

-- ── Tool Calls ─────────────────────────────────────────────
-- Tracks every tool invocation made by the AI agent.
-- status: 'pending' | 'running' | 'completed' | 'failed'
CREATE TABLE IF NOT EXISTS tool_calls (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID REFERENCES messages(id) ON DELETE CASCADE,
  tool_name    VARCHAR(255)  NOT NULL,
  input        JSONB,
  output       JSONB,
  error        TEXT,
  status       VARCHAR(20)   NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_message_id
  ON tool_calls(message_id);

-- ── Auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
