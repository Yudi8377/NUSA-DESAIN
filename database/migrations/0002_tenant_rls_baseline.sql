-- NUSA DESIGN baseline tenant isolation.
-- Apply only after the trusted server API sets app.user_id and app.organization_id
-- from a validated authenticated session for each transaction. Never expose a
-- direct database connection to browsers or untrusted clients.
BEGIN;

CREATE OR REPLACE FUNCTION public.nusa_current_user_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$ SELECT NULLIF(current_setting('app.user_id', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION public.nusa_current_organization_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$ SELECT NULLIF(current_setting('app.organization_id', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION public.nusa_is_org_member(target_org uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = target_org
      AND m.user_id = public.nusa_current_user_id()
  )
$$;

REVOKE ALL ON FUNCTION public.nusa_current_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.nusa_current_organization_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.nusa_is_org_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nusa_current_user_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.nusa_current_organization_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.nusa_is_org_member(uuid) TO PUBLIC;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_select_member ON public.organizations
  FOR SELECT USING (public.nusa_is_org_member(id));

CREATE POLICY profile_select_self ON public.user_profiles
  FOR SELECT USING (id = public.nusa_current_user_id());

CREATE POLICY member_select_same_org ON public.organization_members
  FOR SELECT USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  );

CREATE POLICY projects_org_access ON public.projects
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  );

CREATE POLICY models_org_access ON public.project_models
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  );

CREATE POLICY tasks_org_access ON public.project_tasks
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  );

CREATE POLICY audit_select_org ON public.audit_events
  FOR SELECT USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
  );

CREATE POLICY audit_insert_org ON public.audit_events
  FOR INSERT WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
    AND actor_user_id = public.nusa_current_user_id()
  );

COMMIT;
