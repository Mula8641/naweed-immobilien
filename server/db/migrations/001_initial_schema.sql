CREATE TABLE IF NOT EXISTS buildings (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  id           SERIAL PRIMARY KEY,
  building_id  INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number  TEXT NOT NULL,
  floor        INTEGER,
  rent_amount  NUMERIC(10,2) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('admin','tenant')),
  unit_id       INTEGER REFERENCES units(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id           SERIAL PRIMARY KEY,
  tenant_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month        INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year         INTEGER NOT NULL,
  rent_amount  NUMERIC(10,2) NOT NULL,
  extras       JSONB DEFAULT '[]',
  total        NUMERIC(10,2) NOT NULL,
  status       TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid','unpaid')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contracts (
  id          SERIAL PRIMARY KEY,
  tenant_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  question_en TEXT NOT NULL,
  answer_en   TEXT NOT NULL,
  question_de TEXT NOT NULL,
  answer_de   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
