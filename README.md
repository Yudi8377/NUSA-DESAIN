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

## Integrasi Frappe HRMS

Menu **SDM & Payroll** kini memiliki halaman kerja awal NUSA DESIGN dengan ringkasan karyawan, status kehadiran, permintaan cuti, tugas HR, dan katalog modul HR. Data pada halaman ini adalah **data ilustratif**, bukan data karyawan tersimpan atau perhitungan payroll aktif.

Referensi yang dianalisis: [Frappe HRMS](https://github.com/frappe/hrms), sistem HR/payroll open-source dengan modul employee lifecycle, cuti/absensi, shift, klaim biaya, rekrutmen, kinerja, pelatihan, payroll, perpajakan, kompensasi, dan analitik. Frappe HRMS menggunakan Frappe Framework (Python) dan frontend Frappe UI/Vue; karena stack ini berbeda dari NUSA DESIGN (React/TypeScript), implementasi saat ini berupa antarmuka native dan rancangan integrasi, bukan penyalinan atau pemasangan kode Frappe ke frontend.

**Lisensi dan pilihan arsitektur:** Frappe HRMS memakai GNU GPL-3.0. Jika nantinya dijalankan sebagai aplikasi terpisah dan dihubungkan melalui API, pertahankan pemisahan layanan, atribusi, serta tinjau kewajiban lisensi dan distribusi sebelum menyatukan atau mendistribusikan kode. Opsi yang disarankan untuk tahap awal adalah adapter API server-to-server dengan kredensial di backend; jangan menyimpan API key di browser. Belum ada instance Frappe HRMS, kredensial API, sinkronisasi karyawan, absensi, atau payroll produksi yang dikonfigurasi.

Baca [dokumen integrasi Frappe HRMS](docs/INTEGRASI-FRAPPE-HRMS.md) untuk pemetaan modul, arsitektur target, keamanan, dan rencana penerapan.

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

Migrasi `0003` telah diterapkan pada branch development Neon `nusa-design-dev-ready` dan diverifikasi: kedua tabel tersedia serta Row-Level Security aktif. Belum diterapkan ke branch production. Kebijakan ini belum membuktikan keamanan produksi sampai API tepercaya memvalidasi sesi, menetapkan konteks tenant per transaksi, dan melewati pengujian lintas organisasi.

## Status

Fondasi UI, viewer 3D, dan metadata AI Studio merupakan tahap awal, bukan klaim bahwa seluruh modul ERP telah selesai. Sebelum go-live, konfigurasikan autentikasi, API backend, kebijakan akses berbasis peran, secret deployment, penyimpanan aset privat, backup, monitoring, dan uji penerimaan.


## K3 & Keselamatan (OpenStatus-inspired)

Modul K3 menyediakan ikhtisar temuan, register insiden dan status tindak lanjut, jadwal inspeksi, hazard register, serta tab konsep pemantauan layanan digital. UI dibuat khusus untuk NUSA DESIGN; tidak menyalin source OpenStatus. Data saat ini demonstrasi lokal, belum tersimpan ke backend dan belum terhubung ke OpenStatus atau health-check nyata. Lihat [dokumen integrasi dan batasan](docs/INTEGRASI-OPENSTATUS-K3.md). Referensi: https://github.com/openstatusHQ/openstatus (AGPL-3.0).


## Katalog API Publik

Menu **Katalog API** menyediakan direktori statis terkurasi untuk kandidat layanan eksternal yang relevan dengan ERP arsitektur/konstruksi, termasuk pencarian dan filter. Daftar ini terinspirasi oleh [marcelscruz/public-apis](https://github.com/marcelscruz/public-apis), bukan salinan sinkronisasi langsung. Seluruh kandidat ditandai **Belum terhubung**; belum ada permintaan API eksternal atau kredensial yang dikonfigurasi. Tinjau [dokumen integrasi Public APIs](docs/INTEGRASI-PUBLIC-APIS.md) sebelum mengaktifkan provider.
