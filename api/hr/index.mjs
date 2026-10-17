import pg from 'pg';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { randomUUID } from 'node:crypto';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
pool.on('error', (error) => console.error('postgres_pool_error', error?.message || 'unknown'));
const authBase = process.env.NEON_AUTH_BASE_URL;
const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
const jwks = jwksUrl ? createRemoteJWKSet(new URL(jwksUrl)) : null;
const issuer = authBase ? new URL(authBase).origin : null;
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || 'https://yudi8377.github.io,http://localhost:5173').split(',').map(x => x.trim()).filter(Boolean));

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
function cors(request) {
  const origin = request.headers.get('origin');
  const headers = { Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Organization-Id', 'Access-Control-Max-Age': '600' };
  if (origin && allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Expose-Headers'] = 'X-Request-Id';
  }
  return headers;
}
function fail(message, status, requestId, headers) {
  return json({ error: { message, requestId } }, status, { ...headers, 'X-Request-Id': requestId });
}
async function authenticate(request) {
  if (!jwks || !issuer) throw Object.assign(new Error('Authentication is not configured.'), { status: 503 });
  const header = request.headers.get('authorization') || '';
  if (!/^Bearer\s+\S+$/i.test(header)) throw Object.assign(new Error('Sesi login diperlukan.'), { status: 401 });
  try {
    const { payload } = await jwtVerify(header.replace(/^Bearer\s+/i, ''), jwks, { issuer });
    if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('Missing subject');
    return payload;
  } catch {
    throw Object.assign(new Error('Token login tidak valid atau sudah kedaluwarsa.'), { status: 401 });
  }
}
async function readJson(request) {
  const raw = await request.text();
  if (raw.length > 32768) throw Object.assign(new Error('Ukuran permintaan terlalu besar.'), { status: 413 });
  try { return raw ? JSON.parse(raw) : {}; } catch { throw Object.assign(new Error('Format JSON tidak valid.'), { status: 400 }); }
}
function safeText(value, max, label) {
  if (typeof value !== 'string') throw Object.assign(new Error(`${label} wajib diisi.`), { status: 400 });
  const result = value.trim();
  if (!result || result.length > max) throw Object.assign(new Error(`${label} wajib diisi dan maksimal ${max} karakter.`), { status: 400 });
  return result;
}
async function withIdentity(payload, orgId, work, roles = ['owner','admin','hr','project_manager']) {
  if (!orgId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orgId)) throw Object.assign(new Error('Pilih workspace perusahaan yang valid.'), { status: 400 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const profile = await client.query('SELECT id FROM public.user_profiles WHERE auth_subject = $1 LIMIT 1', [payload.sub]);
    if (!profile.rowCount) throw Object.assign(new Error('Profil belum terdaftar. Buat workspace terlebih dahulu.'), { status: 403 });
    const userId = profile.rows[0].id;
    const membership = await client.query('SELECT role FROM public.organization_members WHERE organization_id = $1 AND user_id = $2 LIMIT 1', [orgId, userId]);
    if (!membership.rowCount) throw Object.assign(new Error('Anda tidak memiliki akses ke workspace ini.'), { status: 403 });
    const role = membership.rows[0].role;
    if (roles.length && !roles.includes(role)) throw Object.assign(new Error('Peran akun tidak diizinkan untuk tindakan ini.'), { status: 403 });
    await client.query("SELECT set_config('app.user_id', $1, true), set_config('app.organization_id', $2, true)", [userId, orgId]);
    const result = await work(client, { userId, orgId, role });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

export default {
  async fetch(request) {
    const requestId = randomUUID();
    const headers = cors(request);
    const origin = request.headers.get('origin');
    if (origin && !allowedOrigins.has(origin)) return fail('Origin tidak diizinkan.', 403, requestId, headers);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ data: { status: 'ok', service: 'nusa-design-api', branch: process.env.NEON_BRANCH || 'unknown' }, meta: { requestId } }, 200, { ...headers, 'X-Request-Id': requestId });
    }
    try {
      if (request.method === 'POST' && url.pathname === '/api/organizations') {
        const identity = await authenticate(request);
        const body = await readJson(request);
        const orgName = safeText(body.name, 120, 'Nama workspace');
        const email = typeof identity.email === 'string' ? identity.email.trim().toLowerCase() : '';
        // The current Neon Auth branch explicitly has require_email_verification=false.
        // Require a signed email claim, but do not block onboarding on a verification
        // state that the configured identity provider does not enforce yet.
        if (!email) throw Object.assign(new Error('Akun login tidak memiliki alamat email.'), { status: 403 });
        const displayName = typeof identity.name === 'string' && identity.name.trim() ? identity.name.trim().slice(0, 160) : email.split('@')[0];
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const profile = await client.query(`INSERT INTO public.user_profiles (auth_subject, full_name, email) VALUES ($1,$2,$3)
            ON CONFLICT (auth_subject) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, updated_at = now()
            RETURNING id`, [identity.sub, displayName, email]);
          const userId = profile.rows[0].id;
          const slugBase = orgName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) || 'workspace';
          const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;
          const org = await client.query('INSERT INTO public.organizations (name, slug) VALUES ($1,$2) RETURNING id, name, slug', [orgName, slug]);
          await client.query("INSERT INTO public.organization_members (organization_id, user_id, role) VALUES ($1,$2,'owner')", [org.rows[0].id, userId]);
          await client.query('COMMIT');
          return json({ data: org.rows[0], meta: { requestId } }, 201, { ...headers, 'X-Request-Id': requestId });
        } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
        finally { client.release(); }
      }
      const identity = await authenticate(request);
      if (request.method === 'GET' && url.pathname === '/api/organizations') {
        const result = await pool.query(`SELECT o.id, o.name, o.slug, m.role FROM public.user_profiles p
          JOIN public.organization_members m ON m.user_id = p.id JOIN public.organizations o ON o.id = m.organization_id
          WHERE p.auth_subject = $1 ORDER BY o.created_at ASC`, [identity.sub]);
        return json({ data: result.rows, meta: { requestId } }, 200, { ...headers, 'X-Request-Id': requestId });
      }
      if (url.pathname === '/api/hr/employees' && request.method === 'GET') {
        const orgId = request.headers.get('x-organization-id');
        const rawLimit = Number(url.searchParams.get('limit') || 100);
        const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, Math.floor(rawLimit))) : 100;
        const rows = await withIdentity(identity, orgId, async (client) => {
          const result = await client.query(`SELECT id, employee_number, full_name, department, job_title, employment_status, employment_type, work_email
            FROM public.hr_employees WHERE organization_id = $1 ORDER BY full_name ASC LIMIT $2`, [orgId, limit]);
          return result.rows;
        });
        return json({ data: rows, meta: { requestId } }, 200, { ...headers, 'X-Request-Id': requestId });
      }
      if (url.pathname === '/api/hr/employees' && request.method === 'POST') {
        const orgId = request.headers.get('x-organization-id');
        const body = await readJson(request);
        const employeeNumber = safeText(body.employee_number, 50, 'Nomor pegawai');
        const fullName = safeText(body.full_name, 160, 'Nama lengkap');
        const department = safeText(body.department, 120, 'Departemen');
        const jobTitle = safeText(body.job_title, 120, 'Jabatan');
        const employmentType = body.employment_type || 'permanent';
        if (!['permanent','contract','freelance','intern','daily'].includes(employmentType)) throw Object.assign(new Error('Jenis hubungan kerja tidak valid.'), { status: 400 });
        const email = body.work_email == null || body.work_email === '' ? null : safeText(body.work_email, 254, 'Email kerja');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Format email kerja tidak valid.'), { status: 400 });
        const row = await withIdentity(identity, orgId, async (client, actor) => {
          const result = await client.query(`INSERT INTO public.hr_employees (organization_id, employee_number, full_name, department, job_title, employment_type, work_email, created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id, employee_number, full_name, department, job_title, employment_status, employment_type, work_email`,
            [actor.orgId, employeeNumber, fullName, department, jobTitle, employmentType, email, actor.userId]);
          return result.rows[0];
        }, ['owner','admin','hr']);
        return json({ data: row, meta: { requestId } }, 201, { ...headers, 'X-Request-Id': requestId });
      }
      return fail('Endpoint tidak ditemukan.', 404, requestId, headers);
    } catch (error) {
      const status = Number.isInteger(error?.status) ? error.status : (error?.code === '23505' ? 409 : 500);
      const message = status === 500 ? 'Terjadi kesalahan internal. Gunakan ID permintaan saat menghubungi dukungan.' : status === 409 ? 'Nomor pegawai atau data unik sudah digunakan di workspace ini.' : (error?.message || 'Permintaan gagal.');
      if (status === 500) console.error('api_error', requestId, error?.message || 'unknown');
      return fail(message, status, requestId, headers);
    }
  }
};
