# Kontrak API SDM NUSA DESIGN

Status: **kode endpoint tersedia di repository; deployment API dan uji end-to-end belum terkonfirmasi.**

## Runtime

- Entry point: `api/hr/index.mjs`
- Runtime target: Node.js 24
- Database: Neon PostgreSQL; memakai `DATABASE_URL` yang diinjeksi runtime.
- Autentikasi: JWT Neon Auth Managed Better Auth; verifikasi tanda tangan melalui `NEON_AUTH_JWKS_URL` dan issuer dari `NEON_AUTH_BASE_URL`.
- Dependency: `pg` dan `jose`, dibundel saat build fungsi.
- Origin browser yang diizinkan harus dibatasi lewat `ALLOWED_ORIGINS`; jangan menggunakan wildcard untuk API berautentikasi.

## Endpoint

| Method | Path | Tujuan | Otorisasi |
|---|---|---|---|
| GET | `/health` | Liveness proses | Publik; tidak membocorkan detail database |
| GET | `/ready` | Readiness koneksi database dan konfigurasi auth | Publik; mengembalikan 503 jika dependency belum siap tanpa detail sensitif |
| GET | `/api/organizations` | Workspace milik pengguna yang login | JWT valid; daftar diturunkan dari keanggotaan server |
| POST | `/api/organizations` | Membuat workspace dan menjadikan pembuat sebagai owner | JWT valid dan email terverifikasi |
| GET | `/api/hr/employees?limit=100` | Direktori pegawai | JWT + header `X-Organization-Id` + keanggotaan; role owner/admin/hr/project_manager |
| GET | `/api/projects?limit=100` | Daftar proyek | JWT + workspace aktif + keanggotaan organisasi |
| POST | `/api/projects` | Membuat proyek | JWT + workspace aktif + role owner/admin/project_manager/architect |
| GET | `/api/projects/:projectId/tasks` | Daftar tugas proyek | JWT + workspace aktif + keanggotaan organisasi |
| POST | `/api/projects/:projectId/tasks` | Membuat tugas proyek | JWT + workspace aktif + role owner/admin/project_manager/architect/engineer |
| POST | `/api/hr/employees` | Membuat pegawai | JWT + workspace aktif + role owner/admin/hr |

### Header

- `Authorization: Bearer <token>` — token pendek dari `authClient.token()`.
- `X-Organization-Id: <uuid>` — hanya selector workspace; server memeriksa membership dan role, tidak mempercayai ID yang dikirim klien.
- `Content-Type: application/json` untuk permintaan JSON.

Semua respons sukses menggunakan `{ "data": ..., "meta": { "requestId": "..." } }`. Error memakai `{ "error": { "message": "...", "requestId": "..." } }`. Respons API menggunakan `Cache-Control: no-store`.

## Keamanan yang diterapkan di source

1. JWT diverifikasi dengan JWKS, issuer, dan klaim subject; token yang tidak valid ditolak sebelum query aplikasi.
2. Semua input SQL memakai parameter; panjang input, tipe hubungan kerja, dan format email divalidasi.
3. Setiap permintaan HR memeriksa profil, membership, dan role pada server.
4. Konteks `app.user_id` dan `app.organization_id` ditetapkan dengan `set_config(..., true)` dalam transaksi yang sama, sesuai helper RLS migrasi 0004.
5. Header organisasi tidak menjadi bukti otorisasi; membership harus ada untuk subject JWT tersebut.
6. CORS menggunakan allowlist origin; token Bearer dipakai, bukan cookie lintas situs.
7. Error internal tidak mengirim stack trace atau detail database kepada browser.

## Deploy dan verifikasi

Workflow `.github/workflows/deploy-hr-api.yml` membangun bundle, menjalankan smoke tests, lalu—jika secret repository `NEON_API_KEY` tersedia—mendeploy ke branch development terlebih dahulu. Setelah health check dan penolakan request tanpa token lulus, workflow mempromosikan bundle yang sama ke branch production, menguji endpoint produksi, memperbarui repository variables publik `VITE_HR_API_BASE_URL` dan `VITE_NEON_AUTH_URL`, lalu memicu deploy GitHub Pages. Project: `gentle-tooth-09855567`; development: `br-curly-flower-b4zhtzqp`; production: `br-wispy-feather-b4t2xxmn`.

Setelah deployment:
1. `GET <function-url>/health` dan `GET <function-url>/ready` harus mengembalikan HTTP 200.
2. Tanpa Bearer token, `GET /api/organizations` harus HTTP 401.
3. Token invalid harus HTTP 401.
4. ID workspace bukan anggota harus HTTP 403.
5. Pengguna non-HR harus ditolak saat `POST /api/hr/employees`.
6. Buat dan baca pegawai hanya di workspace milik pengguna yang sedang login.
7. Ulangi pengujian menggunakan dua akun dan dua workspace terpisah.

Jangan isi `VITE_HR_API_BASE_URL` sebelum URL fungsi, health check, autentikasi, dan uji tenant isolation berhasil diverifikasi. Migrasi 0001–0004 telah diterapkan pada branch production yang sebelumnya tidak memiliki tabel aplikasi. Assertion HR memverifikasi empat tabel HR, RLS, sembilan policy, dan helper role yang di-hardening. Sebelum menerima pelanggan berbayar, lakukan uji penerimaan fitur, backup/restore, prosedur rollback, privasi, dan tinjauan operasional.
