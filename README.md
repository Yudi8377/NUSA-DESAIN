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
12. Audit dan pelaporan

## Studio AI Desain

Modul awal tersedia melalui menu **Studio AI Desain**. Saat ini modul menyusun dan menyalin brief generatif secara lokal; generasi gambar/video nyata belum terhubung. Baca [dokumen integrasi Open Generative AI](docs/INTEGRASI-OPEN-GENERATIVE-AI.md) untuk cakupan, atribusi, arsitektur backend, dan batasan keamanan.

Kontrak backend dan rancangan job ada di [AI Studio Backend Contract](docs/AI-STUDIO-BACKEND-CONTRACT.md). Migrasi metadata job/aset: `database/migrations/0003_ai_studio_jobs_assets.sql`.

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
