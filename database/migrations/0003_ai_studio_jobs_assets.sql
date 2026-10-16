-- NUSA DESIGN AI Studio persistence foundation.
-- Scope: metadata only; generated binary files must live in private object storage.
-- Apply to development first. A trusted server API must set app.user_id and
-- app.organization_id from a validated session within each transaction.
BEGIN;

CREATE TABLE public.design_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  workflow_type text NOT NULL CHECK (workflow_type IN (
    'architecture_concept', 'exterior_render', 'interior_render',
    'walkthrough_video', 'presentation'
  )),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'queued', 'running', 'succeeded', 'failed', 'cancelled'
  )),
  title text NOT NULL,
  prompt text NOT NULL,
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_key text,
  provider_job_id text,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX idx_design_jobs_org_created
  ON public.design_generation_jobs (organization_id, created_at DESC);
CREATE INDEX idx_design_jobs_status_created
  ON public.design_generation_jobs (status, created_at)
  WHERE status IN ('queued', 'running');
CREATE INDEX idx_design_jobs_project
  ON public.design_generation_jobs (organization_id, project_id)
  WHERE project_id IS NOT NULL;

CREATE TABLE public.design_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  generation_job_id uuid REFERENCES public.design_generation_jobs(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  asset_type text NOT NULL CHECK (asset_type IN (
    'image', 'video', 'model_3d', 'document', 'thumbnail'
  )),
  display_name text NOT NULL,
  storage_key text NOT NULL,
  mime_type text,
  byte_size bigint CHECK (byte_size IS NULL OR byte_size >= 0),
  width_px integer CHECK (width_px IS NULL OR width_px > 0),
  height_px integer CHECK (height_px IS NULL OR height_px > 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, storage_key)
);

CREATE INDEX idx_design_assets_org_created
  ON public.design_assets (organization_id, created_at DESC);
CREATE INDEX idx_design_assets_job
  ON public.design_assets (organization_id, generation_job_id)
  WHERE generation_job_id IS NOT NULL;
CREATE INDEX idx_design_assets_project
  ON public.design_assets (organization_id, project_id)
  WHERE project_id IS NOT NULL;

ALTER TABLE public.design_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY design_jobs_org_access ON public.design_generation_jobs
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  );

CREATE POLICY design_assets_org_access ON public.design_assets
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  );

COMMENT ON TABLE public.design_generation_jobs IS
  'Tenant-scoped metadata for AI design jobs; provider calls must happen server-side.';
COMMENT ON TABLE public.design_assets IS
  'Tenant-scoped metadata for assets stored outside Postgres in private object storage.';
COMMENT ON COLUMN public.design_assets.storage_key IS
  'Opaque private object key only; never store public or signed download URLs here.';
COMMENT ON COLUMN public.design_generation_jobs.provider_key IS
  'Non-secret provider identifier; never store API keys or credentials in this column.';

COMMIT;
