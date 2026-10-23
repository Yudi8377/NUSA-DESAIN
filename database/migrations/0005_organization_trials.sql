-- NUSA DESIGN: 14-day organization trial entitlements.
-- Existing workspaces retain a trial window anchored to their original creation date.
BEGIN;
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz;
UPDATE public.organizations
SET trial_started_at = COALESCE(trial_started_at, created_at),
    trial_expires_at = COALESCE(trial_expires_at, created_at + interval '14 days')
WHERE trial_started_at IS NULL OR trial_expires_at IS NULL;
ALTER TABLE public.organizations
  ALTER COLUMN trial_started_at SET DEFAULT now(),
  ALTER COLUMN trial_expires_at SET DEFAULT (now() + interval '14 days'),
  ALTER COLUMN trial_started_at SET NOT NULL,
  ALTER COLUMN trial_expires_at SET NOT NULL;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_trial_window_valid
  CHECK (trial_expires_at > trial_started_at);
CREATE INDEX IF NOT EXISTS idx_organizations_trial_expires_at
  ON public.organizations (trial_expires_at);
COMMENT ON COLUMN public.organizations.trial_started_at IS
  'Server-authoritative start of the organization trial window.';
COMMENT ON COLUMN public.organizations.trial_expires_at IS
  'Server-authoritative trial expiration; protected API access is denied at or after this time.';
COMMIT;
