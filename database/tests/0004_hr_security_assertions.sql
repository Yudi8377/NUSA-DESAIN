-- Read-only regression assertions for the native HR migration.
-- Run against a disposable/development database after applying migration 0004.
-- This script does not insert, update, or delete business data.
DO $$
DECLARE
  target_table text;
  missing_tables text[] := ARRAY[]::text[];
  missing_rls text[] := ARRAY[]::text[];
  missing_policies text[] := ARRAY[]::text[];
  required_tables text[] := ARRAY[
    'hr_employees',
    'hr_attendance_records',
    'hr_leave_requests',
    'hr_employee_competencies'
  ];
  required_policies text[] := ARRAY[
    'hr_employees_select',
    'hr_employees_manage',
    'hr_attendance_select',
    'hr_attendance_manage',
    'hr_leave_select',
    'hr_leave_insert_self',
    'hr_leave_manage',
    'hr_competencies_select',
    'hr_competencies_manage'
  ];
  policy_name text;
BEGIN
  FOREACH target_table IN ARRAY required_tables LOOP
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      missing_tables := array_append(missing_tables, target_table);
    ELSIF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = target_table
        AND c.relrowsecurity
    ) THEN
      missing_rls := array_append(missing_rls, target_table);
    END IF;
  END LOOP;

  FOREACH policy_name IN ARRAY required_policies LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies p
      WHERE p.schemaname = 'public'
        AND p.policyname = policy_name
    ) THEN
      missing_policies := array_append(missing_policies, policy_name);
    END IF;
  END LOOP;

  IF cardinality(missing_tables) > 0 THEN
    RAISE EXCEPTION 'HR migration assertion failed; missing tables: %', array_to_string(missing_tables, ', ');
  END IF;
  IF cardinality(missing_rls) > 0 THEN
    RAISE EXCEPTION 'HR migration assertion failed; RLS disabled on: %', array_to_string(missing_rls, ', ');
  END IF;
  IF cardinality(missing_policies) > 0 THEN
    RAISE EXCEPTION 'HR migration assertion failed; missing policies: %', array_to_string(missing_policies, ', ');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'nusa_has_org_role'
      AND p.prosecdef
      AND p.proconfig @> ARRAY['search_path=pg_catalog, public']
  ) THEN
    RAISE EXCEPTION 'HR migration assertion failed; role helper must be SECURITY DEFINER with pinned search_path';
  END IF;

  RAISE NOTICE 'HR migration assertions passed: 4 tables, RLS enabled, 9 policies, and hardened role helper present.';
END $$;
