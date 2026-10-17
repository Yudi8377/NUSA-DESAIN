-- NUSA DESIGN native HR foundation (no Frappe runtime or API).
-- Apply to a development branch first. A trusted API must set app.user_id and
-- app.organization_id from a validated session for each transaction.
BEGIN;

CREATE OR REPLACE FUNCTION public.nusa_has_org_role(target_org uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.organization_id = target_org
      AND m.user_id = public.nusa_current_user_id()
      AND m.role = ANY(allowed_roles)
  )
$$;

REVOKE ALL ON FUNCTION public.nusa_has_org_role(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nusa_has_org_role(uuid, text[]) TO PUBLIC;

CREATE TABLE public.hr_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  employee_number text NOT NULL,
  full_name text NOT NULL,
  work_email text,
  phone_work text,
  department text NOT NULL,
  job_title text NOT NULL,
  employment_type text NOT NULL DEFAULT 'permanent'
    CHECK (employment_type IN ('permanent','contract','freelance','intern','daily')),
  employment_status text NOT NULL DEFAULT 'active'
    CHECK (employment_status IN ('active','on_leave','suspended','terminated')),
  manager_employee_id uuid,
  hire_date date,
  termination_date date,
  created_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, employee_number),
  UNIQUE (organization_id, user_id),
  CHECK (termination_date IS NULL OR hire_date IS NULL OR termination_date >= hire_date),
  CONSTRAINT hr_employee_manager_fk FOREIGN KEY (organization_id, manager_employee_id)
    REFERENCES public.hr_employees(organization_id, id) ON DELETE SET NULL (manager_employee_id)
);

CREATE INDEX idx_hr_employees_org_department
  ON public.hr_employees (organization_id, department, employment_status);
CREATE INDEX idx_hr_employees_org_name
  ON public.hr_employees (organization_id, full_name);

CREATE TABLE public.hr_attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  work_date date NOT NULL,
  check_in timestamptz,
  check_out timestamptz,
  attendance_status text NOT NULL DEFAULT 'present'
    CHECK (attendance_status IN ('present','absent','leave','sick','holiday','remote','field_work','needs_review')),
  source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','import','device','system')),
  notes text,
  reviewed_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hr_attendance_employee_fk FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.hr_employees(organization_id, id) ON DELETE CASCADE,
  UNIQUE (organization_id, employee_id, work_date),
  CHECK (check_out IS NULL OR check_in IS NULL OR check_out >= check_in)
);
CREATE INDEX idx_hr_attendance_org_date
  ON public.hr_attendance_records (organization_id, work_date DESC);
CREATE INDEX idx_hr_attendance_employee_date
  ON public.hr_attendance_records (organization_id, employee_id, work_date DESC);

CREATE TABLE public.hr_leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL
    CHECK (leave_type IN ('annual','sick','maternity','paternity','unpaid','special','other')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled')),
  requested_by uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
  decided_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hr_leave_employee_fk FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.hr_employees(organization_id, id) ON DELETE CASCADE,
  CHECK (end_date >= start_date),
  CHECK ((status = 'pending' AND decided_at IS NULL) OR status <> 'pending')
);
CREATE INDEX idx_hr_leave_org_status_dates
  ON public.hr_leave_requests (organization_id, status, start_date);
CREATE INDEX idx_hr_leave_employee_dates
  ON public.hr_leave_requests (organization_id, employee_id, start_date DESC);

CREATE TABLE public.hr_employee_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  competency_name text NOT NULL,
  proficiency text NOT NULL DEFAULT 'intermediate'
    CHECK (proficiency IN ('beginner','intermediate','advanced','expert')),
  certificate_name text,
  certificate_reference text,
  issued_on date,
  expires_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hr_competency_employee_fk FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.hr_employees(organization_id, id) ON DELETE CASCADE,
  CHECK (expires_on IS NULL OR issued_on IS NULL OR expires_on >= issued_on)
);
CREATE INDEX idx_hr_competencies_employee
  ON public.hr_employee_competencies (organization_id, employee_id, competency_name);

ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_competencies ENABLE ROW LEVEL SECURITY;

-- Employee directory: HR/admins manage records; employees can see their own row.
CREATE POLICY hr_employees_select ON public.hr_employees
  FOR SELECT USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
    AND (
      public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
      OR user_id = public.nusa_current_user_id()
      OR public.nusa_has_org_role(organization_id, ARRAY['project_manager'])
    )
  );
CREATE POLICY hr_employees_manage ON public.hr_employees
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  );

-- Attendance is visible to HR/admin, project managers and the employee concerned.
CREATE POLICY hr_attendance_select ON public.hr_attendance_records
  FOR SELECT USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
    AND (
      public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr','project_manager'])
      OR EXISTS (
        SELECT 1 FROM public.hr_employees e
        WHERE e.id = employee_id AND e.organization_id = hr_attendance_records.organization_id
          AND e.user_id = public.nusa_current_user_id()
      )
    )
  );
CREATE POLICY hr_attendance_manage ON public.hr_attendance_records
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  );

-- Employees may create their own leave requests; only HR/admin can decide or edit.
CREATE POLICY hr_leave_select ON public.hr_leave_requests
  FOR SELECT USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
    AND (
      public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr','project_manager'])
      OR requested_by = public.nusa_current_user_id()
    )
  );
CREATE POLICY hr_leave_insert_self ON public.hr_leave_requests
  FOR INSERT WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND requested_by = public.nusa_current_user_id()
    AND status = 'pending'
    AND decided_by IS NULL
    AND public.nusa_is_org_member(organization_id)
    AND EXISTS (
      SELECT 1 FROM public.hr_employees e
      WHERE e.id = employee_id AND e.organization_id = organization_id
        AND e.user_id = public.nusa_current_user_id()
    )
  );
CREATE POLICY hr_leave_manage ON public.hr_leave_requests
  FOR UPDATE USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  );

-- Competency records are limited to HR/admin, managers and the employee concerned.
CREATE POLICY hr_competencies_select ON public.hr_employee_competencies
  FOR SELECT USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_is_org_member(organization_id)
    AND (
      public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr','project_manager'])
      OR EXISTS (
        SELECT 1 FROM public.hr_employees e
        WHERE e.id = employee_id AND e.organization_id = organization_id
          AND e.user_id = public.nusa_current_user_id()
      )
    )
  );
CREATE POLICY hr_competencies_manage ON public.hr_employee_competencies
  FOR ALL USING (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  ) WITH CHECK (
    organization_id = public.nusa_current_organization_id()
    AND public.nusa_has_org_role(organization_id, ARRAY['owner','admin','hr'])
  );

COMMENT ON TABLE public.hr_employees IS
  'Native NUSA DESIGN employee directory; contains no Frappe HRMS dependency.';
COMMENT ON TABLE public.hr_attendance_records IS
  'Tenant-scoped attendance records. Ingestion and edits must be validated by a trusted API.';
COMMENT ON TABLE public.hr_leave_requests IS
  'Tenant-scoped leave requests and decisions; approvals must be audited by the application.';
COMMENT ON TABLE public.hr_employee_competencies IS
  'Tenant-scoped competencies and certificate metadata for staffing project teams.';

COMMIT;
