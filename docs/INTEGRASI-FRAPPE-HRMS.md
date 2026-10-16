# Integrasi Frappe HRMS ke NUSA DESIGN

Tanggal tinjauan: 16 Oktober 2026

## 1. Ringkasan

Referensi: https://github.com/frappe/hrms

Frappe HRMS adalah sistem open-source untuk HR dan payroll. README proyek menjelaskan modul siklus hidup karyawan, cuti dan absensi, klaim biaya, manajemen kinerja, payroll/perpajakan, serta aplikasi mobile. Ruang lingkup repositori juga mencakup rekrutmen, shift, pelatihan, kompensasi, dan analitik.

Stack referensi:
- Backend: Frappe Framework, Python, database melalui framework.
- UI: Frappe UI berbasis Vue; frontend dan roster memiliki build terpisah.
- Integrasi: REST API disediakan melalui Frappe Framework.
- Lisensi repository: GNU GPL-3.0 (periksa kembali lisensi serta versi yang benar-benar dipakai saat implementasi).

NUSA DESIGN saat ini memakai React + TypeScript + Vite dan Neon PostgreSQL. Oleh karena itu, menyalin source HRMS ke frontend tidak tepat dan tidak dilakukan.

## 2. Yang sudah ditambahkan ke NUSA DESIGN

- Halaman **SDM & Payroll** native melalui menu yang sudah ada.
- Ringkasan KPI, contoh daftar personel, antrean tugas HR, dan katalog kemampuan SDM.
- Peringatan eksplisit bahwa data merupakan ilustrasi dan belum tersimpan/terhubung.
- Dokumentasi arsitektur dan batasan lisensi ini.

Komponen yang ditambahkan: `src/HRManagement.tsx`; gaya di `src/style.css`; route/menu di `src/App.tsx`.

## 3. Pemetaan kapabilitas untuk perusahaan arsitektur dan konstruksi

| Kapabilitas | Kebutuhan NUSA DESIGN | Integrasi yang direncanakan |
|---|---|---|
| Employee lifecycle | Profil, kontrak, jabatan, penempatan proyek, onboarding/offboarding | HRMS sebagai sistem pencatatan HR; referensi ID karyawan di NUSA |
| Attendance & shift | Absensi kantor/lapangan, shift, lembur, lokasi kerja bila diizinkan | Sinkronisasi terkontrol dan rekonsiliasi data |
| Leave | Cuti/izin dan ketersediaan personel untuk jadwal proyek | Approval di HRMS, ringkasan read-only di NUSA |
| Recruitment | Kandidat dan kebutuhan tenaga proyek | Tautan ke lowongan dan status rekrutmen |
| Performance & training | Sasaran, penilaian, kompetensi, sertifikasi keselamatan/teknis | Profil kompetensi untuk perencanaan tim proyek |
| Payroll & compensation | Komponen gaji, tunjangan, potongan, slip, approval | Payroll diproses hanya di sistem resmi yang dikonfigurasi; NUSA menerima status/total terbatas sesuai hak |
| Tax & statutory | PPh 21, BPJS, THR, lembur, pelaporan | Validasi ahli pajak/HR Indonesia dan uji kasus sebelum produksi |
| Analytics & audit | Headcount, absensi, biaya tenaga kerja per proyek | Dashboard agregat dengan audit akses |

## 4. Arsitektur target

Direkomendasikan sebagai layanan terpisah terlebih dahulu:

1. **NUSA DESIGN UI**: navigasi, ringkasan, konteks proyek, dan laporan agregat.
2. **NUSA backend/API**: autentikasi dan otorisasi, pemetaan user ke organisasi, audit log, validasi input, serta adapter integrasi.
3. **Frappe HRMS instance**: sistem HR sumber data, dijalankan terpisah dengan versi yang dipin dan proses backup/upgrade.
4. **Integration adapter**: server-to-server melalui API Frappe, allowlist endpoint, timeout/retry, idempotensi, pencatatan sinkronisasi, dan pemetaan ID.
5. **Neon PostgreSQL**: hanya menyimpan data NUSA yang memang dibutuhkan; jangan menggandakan data payroll sensitif tanpa dasar, kebijakan retensi, dan izin akses yang jelas.

Rahasia API tidak boleh berada di browser, file `.env` yang dikomit, atau bundle frontend. Gunakan secret manager/environment server-side. Batasi akun integrasi pada permission minimum; jangan gunakan akun Administrator untuk sinkronisasi harian.

## 5. Pilihan implementasi

**Pilihan A — layanan terpisah (direkomendasikan):** jalankan Frappe HRMS secara terpisah dan integrasikan melalui API. Ini menjaga perbedaan stack dan batas lisensi lebih jelas. Tetap lakukan tinjauan hukum lisensi, keamanan, dan data sebelum distribusi.

**Pilihan B — membangun modul HR native:** buat skema dan backend HR sendiri di NUSA DESIGN dengan desain data dan perilaku yang dikembangkan mandiri, menggunakan kebutuhan bisnis sebagai acuan umum. Tidak menyalin kode Frappe HRMS. Ini membutuhkan pekerjaan lebih besar dan pengujian payroll yang ketat.

**Pilihan C — menggabungkan atau memodifikasi source HRMS ke produk yang didistribusikan:** jangan dilakukan tanpa tinjauan lisensi yang kompeten. GPL-3.0 dapat membawa kewajiban sumber terbuka dan pemberitahuan lisensi ketika versi turunan didistribusikan. Konsekuensi spesifik bergantung pada cara integrasi, pengemasan, dan distribusi; dokumen ini bukan nasihat hukum.

## 6. Keamanan dan kepatuhan sebelum produksi

- SSO atau mekanisme autentikasi yang disepakati; pemetaan identitas dan organisasi tidak boleh didasarkan pada nilai dari browser saja.
- RBAC minimal: HR admin, HR officer, payroll officer, approver, project manager (akses terbatas), employee/self-service, auditor read-only.
- Payroll, data bank, NPWP/NIK, data kesehatan, dan dokumen karyawan merupakan data sensitif/berisiko tinggi; minimalkan, enkripsi, batasi akses, dan audit akses.
- Tenant boundary dan otorisasi harus diverifikasi pada backend dan pengujian API; jangan mengandalkan penyembunyian menu.
- Atur retensi, backup terenkripsi, restore drill, logging tanpa data pribadi berlebih, incident response, dan prosedur koreksi data.
- Validasi aturan Indonesia (antara lain PPh 21, BPJS, THR, lembur, kontrak, dan kebijakan ketenagakerjaan) dengan ahli yang kompeten dan sumber resmi terbaru.
- Lakukan uji rekonsiliasi payroll dan persetujuan berlapis; jangan menganggap contoh KPI di UI sebagai data real.

## 7. Tahapan berikutnya

1. Pilih apakah Frappe HRMS akan menjadi layanan terpisah atau HR native NUSA.
2. Sediakan environment server/hosting untuk Frappe, domain internal, TLS, backup, dan akun integrasi terbatas.
3. Tentukan mapping organisasi, employee ID, proyek, cost center, role, serta sumber kebenaran setiap field.
4. Implementasikan adapter API server-side dengan sinkronisasi read-only terlebih dahulu.
5. Uji akses lintas role/organisasi, pagination, error, retry, duplikasi, dan audit log.
6. Uji payroll pada dataset fiktif dengan kasus tepi dan verifikasi profesional sebelum mengaktifkan proses nyata.
7. Baru setelah pengujian, aktifkan write-back yang diperlukan dengan approval dan idempotency.

## Status implementasi saat ini

Halaman SDM & Payroll NUSA DESIGN telah dibuat sebagai **UI awal demonstrasi**. Belum ada instance Frappe HRMS yang dipasang, koneksi API, autentikasi HR, sinkronisasi data, atau perhitungan payroll yang aktif. Tidak ada klaim bahwa payroll atau kepatuhan hukum sudah siap produksi.
