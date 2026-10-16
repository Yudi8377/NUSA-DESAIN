# NUSA DESIGN

ERP internal untuk perusahaan arsitektur dan konstruksi, dibangun sebagai produk mandiri.

## Prinsip

- Tidak mengubah atau menyalin kode dari repository referensi Inodesign.
- Modul 3D gedung menjadi bagian dari aplikasi ERP; implementasi web memakai Three.js/WebGL agar dapat dijalankan di browser.
- Bahasa antarmuka utama: Bahasa Indonesia.
- Frontend: React, TypeScript, Vite.
- Database: PostgreSQL pada Neon.
- Tidak menyimpan connection string, password, token, atau secret di repository.

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
11. Audit dan pelaporan

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

SQL migration awal tersedia di `database/migrations/0001_nusa_design_foundation.sql`. Tinjau dan jalankan secara sadar pada branch development Neon terlebih dahulu; jangan mengeksekusi migrasi eksperimen langsung pada production.

## Status

Fondasi UI dan viewer 3D merupakan tahap awal, bukan klaim bahwa seluruh modul ERP telah selesai. Sebelum go-live, konfigurasikan autentikasi, kebijakan akses, secret deployment, backup, monitoring, dan uji penerimaan.
