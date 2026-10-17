# NUSA DESIGN

ERP internal untuk perusahaan arsitektur dan konstruksi, dibangun sebagai produk mandiri.

## Prinsip

- Tidak mengubah atau menyalin kode dari repository referensi Inodesign.
- Modul 3D gedung menjadi bagian dari aplikasi ERP; implementasi web memakai Three.js/WebGL agar dapat dijalankan di browser.
- Bahasa antarmuka utama: Bahasa Indonesia.
- Frontend: React, TypeScript, Vite.
- Database: PostgreSQL pada Neon.
- Tidak menyimpan connection string, password, token, atau secret di repository.

## Integrasi referensi visualisasi 3D

Repository `Najwahkr/opengl-gedung-3d-feb-unesa` telah ditinjau pada tingkat struktur dan contoh sumber. Kode sumbernya adalah aplikasi desktop C++ berbasis FreeGLUT/OpenGL dan Visual Studio, bukan modul JavaScript yang dapat dipasang langsung ke React. Repository tersebut tidak mencantumkan lisensi pada metadata GitHub yang diperiksa. Karena itu, NUSA DESIGN menggunakan viewer web Three.js yang dibangun mandiri dengan pola interaksi serupa; kode C++ asli tidak disalin. Integrasi model/aset atau porting detail fasad lebih lanjut menunggu kepastian lisensi/izin dan pemetaan geometri.

## Modul roadmap

1. Dashboard dan organisasi
2. CRM dan penjualan
3. Proyek arsitektur dan konstruksi
4. RAB, volume, harga satuan, revisi, dan realisasi
5. Dokumen, gambar kerja, revisi, dan persetujuan
6. Tugas dan kolaborasi
7. Keuangan dan akuntansi
8. SDM dan penggajian
9. Pengadaan dan inventaris
10. Viewer 3D gedung dan metadata model
11. Studio AI Desain untuk menyusun brief konsep, render, video, dan materi presentasi
12. Anatomi Bangunan untuk eksplorasi isometrik sistem struktur, selubung, MEP, interior, dan alur proyek
13. Audit dan pelaporan

## Studio AI Desain

Modul awal tersedia melalui menu **Studio AI Desain**. Saat ini modul menyusun dan menyalin brief generatif secara lokal; generasi gambar/video nyata belum terhubung. Baca [dokumen integrasi Open Generative AI](docs/INTEGRASI-OPEN-GENERATIVE-AI.md) untuk cakupan, atribusi, arsitektur backend, dan batasan keamanan.

Kontrak backend dan rancangan job ada di [AI Studio Backend Contract](docs/AI-STUDIO-BACKEND-CONTRACT.md). Migrasi metadata job/aset: `database/migrations/0003_ai_studio_jobs_assets.sql`.

## Anatomi Bangunan

Menu **Anatomi Bangunan** menyediakan diagram isometrik konseptual yang dapat dieksplorasi per lapisan dan diagram alur proyek. Fitur ini terinspirasi pendekatan visual repository [Anatomy](https://github.com/wheresryan22/anatomy) (MIT), tetapi UI dan diagram NUSA DESIGN ditulis khusus dan tidak menyalin kit/contoh sumber. Diagram belum terhubung ke model BIM atau data proyek. Baca [dokumen integrasi Anatomy](docs/INTEGRASI-ANATOMY.md).

## Adopsi Fitur SDM & Payroll

Menu **SDM & Payroll** dibangun sebagai modul native NUSA DESIGN. Frappe HRMS hanya menjadi referensi kebutuhan dan alur kerja; tidak ada instance, API, kredensial, atau sinkronisasi Frappe yang digunakan. UI demonstrasi menyediakan pencarian/filter direktori dan simulasi tindakan lokal, tetapi data belum tersimpan ke database dan payroll belum aktif.

Baca [dokumen Adopsi Fitur SDM & Payroll](docs/ADOPSI-FITUR-SDM-PAYROLL.md) untuk arsitektur native, pemetaan kebutuhan, kontrol akses, dan roadmap, serta [kontrak API SDM](docs/HR-API-CONTRACT.md) untuk rancangan endpoint aman. Fondasi skema HR tersedia pada migrasi `database/migrations/0004_hr_management.sql`. Migrasi fondasi, tenant RLS, AI Studio, dan HR (0001–0004) kini telah diterapkan pada branch Neon `production` dan `nusa-design-dev-ready`; tabel HR memiliki RLS aktif dan sembilan policy yang diverifikasi.

## Pengembangan lokal

```bash
npm install
npm run dev
```

## Pemeriksaan produksi

```bash
npm ci
npm run check
npm run build
npm run preview
```

## Database

Migrasi awal tersedia di `database/migrations/0001_nusa_design_foundation.sql`, baseline isolasi tenant di `database/migrations/0002_tenant_rls_baseline.sql`, dan metadata AI Studio di `database/migrations/0003_ai_studio_jobs_assets.sql`.

Migrasi `0003` AI Studio dan `0004` fondasi SDM telah diterapkan pada branch development Neon `nusa-design-dev-ready`. Migrasi `0004` diverifikasi: empat tabel HR tersedia, Row-Level Security aktif, serta kebijakan dan constraint terbentuk. Migrasi 0003 dan 0004 telah diterapkan juga pada branch production setelah memverifikasi bahwa schema aplikasi masih kosong. Kebijakan database belum membuktikan keamanan produksi sampai API tepercaya memvalidasi sesi, menetapkan konteks tenant per transaksi, dan melewati pengujian lintas organisasi.

## Status

Fondasi UI, viewer 3D, dan metadata AI Studio merupakan tahap awal, bukan klaim bahwa seluruh modul ERP telah selesai. Sebelum go-live, konfigurasikan autentikasi, API backend, kebijakan akses berbasis peran, secret deployment, penyimpanan aset privat, backup, monitoring, dan uji penerimaan.

UI login dan onboarding workspace native kini menggunakan Neon Auth SDK. Source API SDM tersedia di `api/hr/index.mjs` dengan verifikasi JWT, membership/role server-side, dan konteks tenant per transaksi. Namun deployment fungsi API, konfigurasi URL saat build GitHub Pages, uji end-to-end dua tenant, dan verifikasi CI/build masih harus lulus sebelum disebut live komersial. Neon Auth telah aktif pada branch development dan production; origin GitHub Pages telah masuk allowlist pada keduanya. Migrasi 0001–0004 telah diterapkan ke database production yang sebelumnya belum memiliki tabel aplikasi. API function belum terdaftar pada Neon saat verifikasi terakhir; workflow deployment memerlukan secret GitHub Actions `NEON_API_KEY` untuk menjalankan promosi dan konfigurasi URL aplikasi.


## K3 & Keselamatan (OpenStatus-inspired)

Modul K3 menyediakan ikhtisar temuan, register insiden dan status tindak lanjut, jadwal inspeksi, hazard register, serta tab konsep pemantauan layanan digital. UI dibuat khusus untuk NUSA DESIGN; tidak menyalin source OpenStatus. Data saat ini demonstrasi lokal, belum tersimpan ke backend dan belum terhubung ke OpenStatus atau health-check nyata. Lihat [dokumen integrasi dan batasan](docs/INTEGRASI-OPENSTATUS-K3.md). Referensi: https://github.com/openstatusHQ/openstatus (AGPL-3.0).


## Katalog API Publik

Menu **Katalog API** menyediakan direktori statis terkurasi untuk kandidat layanan eksternal yang relevan dengan ERP arsitektur/konstruksi, termasuk pencarian dan filter. Daftar ini terinspirasi oleh [marcelscruz/public-apis](https://github.com/marcelscruz/public-apis), bukan salinan sinkronisasi langsung. Seluruh kandidat ditandai **Belum terhubung**; belum ada permintaan API eksternal atau kredensial yang dikonfigurasi. Tinjau [dokumen integrasi Public APIs](docs/INTEGRASI-PUBLIC-APIS.md) sebelum mengaktifkan provider.

## Keuangan & Akuntansi

Menu **Keuangan** berisi prototipe modul akuntansi internal: ikhtisar piutang/utang, daftar transaksi demo dengan filter dan ekspor CSV, rancangan bagan akun, alur jurnal double-entry, dan katalog laporan keuangan. Data masih ilustratif dan belum tersimpan ke database. Jangan gunakan untuk pembukuan resmi sebelum backend, validasi debit/kredit, otorisasi, audit trail, rekonsiliasi, dan pengujian selesai.

Frappe Books ditinjau sebagai referensi fungsional. NUSA DESIGN tidak menyalin source code. Repository Frappe Books menggunakan AGPL-3.0; integrasi sebagai layanan terpisah melalui API dapat dipertimbangkan setelah tinjauan lisensi dan pemetaan data. Detail analisis: [Analisis Frappe Books](docs/ANALISIS-FRAPPE-BOOKS.md).

