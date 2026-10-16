# NUSA DESIGN — Go-live gate

## Current verified state (2026-10-16)

- GitHub repository: `Yudi8377/NUSA-DESAIN`; the latest CI run for commit `238cb85946ccd1e1059ec5567b5ecb0922e5a062` passed.
- GitHub Pages build and artifact upload passed, but deployment failed with HTTP 404 from the Pages deployment API. The error explicitly says Pages must be enabled in repository settings.
- Neon development branch: `br-curly-flower-b4zhtzqp`; the seven foundational tables exist there.
- Current dashboard and 3D model are an illustrative UI. Metrics, projects, activities and priorities are not sourced from the database.
- There is no production authentication/API integration yet. Do not use for real company records.

## Required manual hosting step

Open https://github.com/Yudi8377/NUSA-DESAIN/settings/pages and set **Build and deployment → Source → GitHub Actions**. Then open https://github.com/Yudi8377/NUSA-DESAIN/actions and confirm the latest “Deploy NUSA DESIGN preview to GitHub Pages” run succeeds.

Expected preview URL after successful deployment: https://yudi8377.github.io/NUSA-DESAIN/ . This is a target URL, not a confirmed live deployment until the workflow succeeds.

## Security gates before real data

1. Implement server-side authentication and validate sessions on every API request.
2. Resolve the user's internal profile and organization membership server-side; never trust organization/user IDs sent by the browser.
3. Set `app.user_id` and `app.organization_id` only within a trusted database transaction after validating the session.
4. Review and test `0002_tenant_rls_baseline.sql` in the development branch before applying it. The custom PostgreSQL settings are safe only behind a trusted server API; never expose direct DB credentials to the browser.
5. Add role-based mutation rules (not only membership checks), invitation/organization bootstrap, audit-event emission, and tests proving cross-organization reads/writes are denied.
6. Configure secrets outside Git, backup/restore, monitoring, and acceptance tests before production.

## Remaining delivery sequence

1. Enable Pages and confirm preview deploy.
2. Build API/auth layer and connect projects/tasks to Neon.
3. Replace illustrative dashboard numbers with database queries and empty states.
4. Implement document/revision management, RAB/BOQ, procurement, finance, HR/payroll, reports, and 3D model asset storage.
5. Add PWA/offline strategy, automated tests, backups, and go-live review.
