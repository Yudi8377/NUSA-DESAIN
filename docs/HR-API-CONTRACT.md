# Kontrak API SDM & Payroll NUSA DESIGN

Status: rancangan kontrak, belum merupakan API yang aktif.

## Tujuan

Menjadi batas yang jelas antara UI React/TypeScript dan database PostgreSQL di Neon. Browser tidak boleh menerima connection string atau akses database langsung. Semua endpoint harus memvalidasi sesi, keanggotaan organisasi, izin tindakan, input, dan konteks tenant sebelum menjalankan SQL.

## Persyaratan wajib untuk setiap request

1. Validasi token/sesi pada server; jangan mempercayai user_id, organization_id, role, atau created_by dari body request.
2. Resolve user dan organisasi dari sesi yang telah diverifikasi.
3. Jalankan query dalam transaksi dan set app.user_id serta app.organization_id secara transaction-local (misalnya set_config(..., true)) agar RLS bekerja dan konteks tidak bocor ke request lain.
4. Terapkan otorisasi di handler dan database. Jangan mengandalkan kontrol tombol pada frontend.
5. Validasi UUID, tanggal, enum, ukuran payload, batas halaman, dan semua nilai numerik. Gunakan parameterized SQL.
6. Catat perubahan sensitif pada audit log: aktor, organisasi, entitas, aksi, waktu, dan alasan. Jangan mencatat data pribadi penuh atau token.
7. Gunakan respons error yang tidak membocorkan SQL, rahasia, atau keberadaan data tenant lain.

## Endpoint target

| Method & path | Fungsi | Izin minimum |
|---|---|---|
| GET /api/hr/employees | Direktori dengan pencarian, filter tim/status, dan pagination | HR/admin; manager hanya data yang diizinkan |
| POST /api/hr/employees | Membuat profil karyawan | HR/admin |
| GET /api/hr/employees/:id | Detail profil sesuai cakupan | HR/admin/manager sesuai kebutuhan; karyawan untuk profil sendiri |
| PATCH /api/hr/employees/:id | Memperbarui profil | HR/admin |
| GET /api/hr/attendance | Rekap kehadiran berdasarkan rentang tanggal | HR/admin/manager sesuai cakupan; karyawan hanya data sendiri |
| POST /api/hr/attendance | Mencatat atau mengimpor kehadiran | HR/admin; impor wajib tervalidasi dan idempotent |
| GET /api/hr/leave-requests | Daftar pengajuan sesuai role | HR/admin/manager dan pemohon sendiri |
| POST /api/hr/leave-requests | Mengajukan cuti/izin | Karyawan aktif milik organisasi |
| POST /api/hr/leave-requests/:id/decision | Menyetujui/menolak dengan catatan | HR/admin atau approver yang ditetapkan |
| GET /api/hr/competencies | Kompetensi dan sertifikat sesuai cakupan | HR/admin/manager; karyawan untuk data sendiri |
| POST /api/hr/competencies | Menambah kompetensi/sertifikat | HR/admin |
| GET /api/hr/payroll/periods | Daftar periode payroll | HR/payroll officer/admin |
| POST /api/hr/payroll/preview | Simulasi perhitungan tanpa mengesahkan pembayaran | HR/payroll officer; hanya setelah mesin payroll tersedia |
| POST /api/hr/payroll/:period/approve | Mengesahkan periode payroll | Approver yang ditetapkan, dengan pemisahan tugas |

Endpoint payroll adalah rencana masa depan. Tidak boleh mengembalikan nilai gaji atau mengeksekusi penggajian sampai komponen, aturan, dan hasil uji disahkan.

## Bentuk respons

Sukses tunggal:

    {
      "data": { "id": "uuid", "status": "active" },
      "meta": { "requestId": "server-generated-id" }
    }

Daftar berpaginasi:

    {
      "data": [],
      "pagination": { "limit": 25, "nextCursor": null },
      "meta": { "requestId": "server-generated-id" }
    }

Error aman:

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Periksa kembali data yang dikirim.",
        "requestId": "server-generated-id"
      }
    }

Jangan mengembalikan stack trace, query SQL, connection string, credential, atau data organisasi lain.

## Aturan persetujuan cuti

- Pengajuan baru dibuat dalam status pending; pemohon tidak boleh mengirim nilai approved atau decided_by.
- Endpoint keputusan menerima hanya approved atau rejected, catatan opsional, dan memakai conditional update agar keputusan ganda tidak menimpa keputusan sebelumnya.
- Simpan identitas approver dan timestamp dari sesi/server.
- Perubahan status harus menghasilkan audit event.
- Ketersediaan personel proyek perlu diperiksa sebelum persetujuan bila jadwal proyek telah tersedia.

## Kriteria penerimaan keamanan

- Pengguna tanpa sesi tidak dapat membaca atau mengubah data HR.
- Pengguna organisasi A tidak dapat membaca, membuat referensi, mengubah, atau menebak data organisasi B.
- Karyawan tidak dapat membaca profil, absensi, atau pengajuan karyawan lain.
- Karyawan tidak dapat mengubah role, organisasi, status keputusan, atau identitas aktor melalui body request.
- Request lintas organisasi dan perubahan tanpa izin diuji otomatis.
- Konteks tenant disetel transaction-local dan tidak bertahan setelah transaksi selesai.
- Setiap perubahan sensitif dapat ditelusuri tanpa menyimpan rahasia atau data pribadi berlebihan.

## Status implementasi

- Database: migrasi 0004_hr_management.sql telah diterapkan pada branch development Neon nusa-design-dev-ready; RLS dan empat tabel HR diverifikasi.
- UI: saat ini masih demonstrasi lokal, belum memanggil endpoint di atas.
- API, autentikasi aplikasi, audit event otomatis, pengujian lintas tenant, dan payroll: belum diimplementasikan.


## Regression check database

Skrip `database/tests/0004_hr_security_assertions.sql` memeriksa keberadaan empat tabel HR, status RLS, sembilan policy yang diwajibkan, dan konfigurasi helper role. Skrip ini bersifat read-only dan tidak membuat atau mengubah data bisnis. Jalankan setelah migrasi pada branch development atau database uji, bukan sebagai pengganti uji otorisasi lintas-tenant menggunakan sesi nyata.
