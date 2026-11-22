-- SafeZone AI - PostgreSQL schema. Applied automatically on startup (idempotent).

-- Public submissions. NEVER counted in official statistics.
CREATE TABLE IF NOT EXISTS community_reports (
  id              uuid PRIMARY KEY,
  city            text NOT NULL,
  area            text NOT NULL,
  category        text NOT NULL,
  description     text NOT NULL,
  incident_date   date NOT NULL,
  latitude        double precision,
  longitude       double precision,
  contact         text,                       -- optional, visible to admins only
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  duplicate_of    uuid,                       -- set when it looks like an earlier report
  moderation_note text,
  moderated_at    timestamptz,
  ip_hash         text,                       -- salted hash for abuse control, never the raw IP
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON community_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_city ON community_reports (city);

-- Published police / government statistics, always stored with their source.
CREATE TABLE IF NOT EXISTS official_stats (
  id           bigserial PRIMARY KEY,
  source_name  text NOT NULL,
  source_url   text NOT NULL,
  province     text NOT NULL,
  district     text NOT NULL,
  category     text NOT NULL,
  period       text NOT NULL,                 -- 'YYYY-MM' or 'YYYY'
  period_type  text NOT NULL CHECK (period_type IN ('monthly','yearly')),
  cases        integer NOT NULL CHECK (cases >= 0),
  is_sample    boolean NOT NULL DEFAULT false,
  imported_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_name, province, district, category, period)
);
CREATE INDEX IF NOT EXISTS idx_official_source_period ON official_stats (source_name, period);
