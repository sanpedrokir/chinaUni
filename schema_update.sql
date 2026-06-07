-- ==========================================================
-- ChinaUni AI — Schema Update: Auth + Enquiries
-- Paste into: Neon Console → SQL Editor → Run
-- ==========================================================

-- ── Admin users (staff login) ───────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(100) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed: initial staff accounts ────────────────────────────
-- Passwords are bcrypt-hashed (cost 12).
--   jasontyw  →  jason0606@
--   andy      →  andy1234@
INSERT INTO admin_users (username, email, password_hash) VALUES
  (
    'jasontyw',
    'jasontyw@hotmail.com',
    '$2b$12$DoyR8U8xgKH2n3Muwj.Sh.PsjnmnFJG8zhYkJ23bUwWSPX.0bZXca'
  ),
  (
    'andy',
    'sanpedrobeach9@gmail.com',
    '$2b$12$Vkj4GEXTTslSSQzLrD1OZ.1Ow.9/wRVoxF3l5XhdXJQCwgTaRbwLC'
  )
ON CONFLICT (username) DO NOTHING;

-- ── Student enquiries ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  contact_number VARCHAR(50),
  country        VARCHAR(100) NOT NULL,
  message        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at
  ON enquiries(created_at DESC);
