# Adopsi Fitur SDM & Payroll NUSA DESIGN

Tanggal tinjauan: 17 Oktober 2026

## 1. Keputusan arsitektur

Frappe HRMS (https://github.com/frappe/hrms) digunakan **hanya sebagai referensi kebutuhan dan alur kerja**. NUSA DESIGN tidak memasang, menjalankan, menghubungkan, atau mengintegrasikan instance Frappe HRMS.

Fitur yang relevan akan dirancang dan diimplementasikan secara mandiri di NUSA DESIGN menggunakan stack yang sudah dipakai proyek: React, TypeScript, Vite, serta backend/database NUSA DESIGN yang diverifikasi tersedia. Tidak menyalin source code, komponen, aset, atau stylesheet Frappe HRMS.

Repositori referensi menggunakan lisensi GPL-3.0. Karena itu, implementasi NUSA DESIGN mengacu pada kebutuhan bisnis dan pola alur kerja secara umum, bukan mengambil kode dari repositori tersebut. Catatan ini bukan nasihat hukum.

## 2. Prinsip implementasi

- **Native-first:** semua UI dan logika bisnis dibuat untuk NUSA DESIGN; tidak ada server Frappe, Frappe API, kredensial Frappe, atau sinkronisasi eksternal.
- **Sesuai bidang usaha:** model SDM mendukung studio arsitektur, desain, engineering, quantity surveying, tenaga proyek, dan konstruksi.
- **Status jujur:** data contoh diberi label demonstrasi. UI demonstrasi bukan bukti data tersimpan, proses persetujuan nyata, atau payroll aktif.
- **Backend terverifikasi:** sebelum mengklaim persistensi, autentikasi, atau keamanan aktif, verifikasi skema database, API, role, dan pengujian.
- **Payroll aman:** perhitungan payroll produksi hanya setelah aturan, periode, data sumber, hak akses, dan hasil uji diverifikasi oleh pihak HR/pajak yang kompeten.
- **Privasi:** minimalkan akses terhadap NIK/NPWP, data rekening, penghasilan, kesehatan, kontrak, dan dokumen personal; lakukan audit akses serta kebijakan retensi.

## 3. Pemetaan fitur referensi ke NUSA DESIGN

| Fitur | Penerapan native yang dituju | Kaitan dengan NUSA DESIGN |
|---|---|---|
| Direktori karyawan | Profil, status kerja, jabatan, departemen, kontak kerja, kompetensi | Menentukan personel yang dapat dialokasikan ke proyek |
| Struktur organisasi | Tim, atasan, peran, dan unit kerja | Koordinasi studio, desain, estimasi, lapangan, dan administrasi |
| Kehadiran dan shift | Catatan hadir, jadwal, kerja lapangan, lembur dan koreksi | Mengukur ketersediaan tenaga proyek |
| Cuti dan izin | Pengajuan, alasan, rentang tanggal, saldo, approval dan riwayat | Memperhitungkan kapasitas tim pada jadwal proyek |
| Rekrutmen dan onboarding | Kandidat, kebutuhan posisi, tahapan seleksi, checklist masuk | Perencanaan kebutuhan tenaga kerja |
| Kompetensi dan pelatihan | Keahlian, sertifikat teknis/K3, masa berlaku dan pelatihan | Pencocokan tenaga ahli dengan pekerjaan proyek |
| Kinerja | Sasaran, evaluasi, catatan berkala dan rencana pengembangan | Pengembangan SDM berbasis peran/proyek |
| Payroll dan kompensasi | Struktur upah, tunjangan, potongan, lembur, slip dan persetujuan | Pengendalian biaya tenaga kerja; aktif setelah validasi |
| Pelaporan | Headcount, kehadiran, cuti, kompetensi dan agregat biaya | Dashboard operasional dan laporan manajemen |
| Audit | Riwayat perubahan, aktor, waktu, alasan dan persetujuan | Akuntabilitas perubahan data SDM |

## 4. Arsitektur native yang dituju

1. **UI React/TypeScript:** halaman SDM & Payroll di dalam navigasi NUSA DESIGN.
2. **Layanan aplikasi NUSA DESIGN:** validasi input, aturan bisnis, alur persetujuan, dan pembatasan akses.
3. **Database/backend NUSA DESIGN:** persistensi data HR dengan relasi dan migrasi yang terdokumentasi. Gunakan layanan yang benar-benar dikonfigurasi pada repo; jangan mengasumsikan koneksi hanya karena dokumentasi menyebutnya.
4. **Otorisasi:** peran minimal Administrator HR, Petugas HR, Payroll Officer, Approver/Manajer Proyek, Karyawan (self-service), dan Auditor read-only.
5. **Audit dan perlindungan:** pencatatan perubahan, pembatasan akses di server/database, validasi lintas pengguna, backup, retensi, dan pengujian pemulihan.

Alur target: pengguna berizin → UI NUSA DESIGN → validasi dan otorisasi backend → database NUSA DESIGN → audit log. Tidak ada koneksi ke Frappe HRMS dalam alur tersebut.

## 5. Tahapan pembangunan

### Tahap 1 — UI dan alur demonstrasi
- Direktori dengan pencarian dan filter.
- Formulir dasar serta validasi masukan.
- Antrean cuti/persetujuan dan status yang jelas.
- Label data demo pada seluruh data ilustratif.
- Tidak mengklaim data tersimpan di server.

### Tahap 2 — Data dan akses
- Fondasi skema native tersedia pada `database/migrations/0004_hr_management.sql` dan telah diterapkan serta diverifikasi pada branch development Neon `nusa-design-dev-ready`.
- Empat tabel HR memiliki Row-Level Security dan kebijakan peran/self-service dasar. Persistensi UI, API tepercaya, validasi lintas organisasi, serta pengujian negatif masih perlu dibangun sebelum data nyata digunakan.
- Autentikasi, role, izin minimum, audit trail dan pengujian akses.
- Uji backup/restore serta validasi lintas role.

### Tahap 3 — Operasi SDM
- Kalender kehadiran/cuti, shift, onboarding, rekrutmen, sertifikat, dan evaluasi.
- Hubungkan alokasi personel dengan proyek, tugas, jadwal, serta beban kerja.
- Laporan operasional dan ekspor terkontrol.

### Tahap 4 — Payroll terkendali
- Definisi komponen upah, tunjangan, potongan, lembur, dan periode.
- Verifikasi aturan PPh 21, BPJS, THR, ketenagakerjaan dan kebijakan perusahaan berdasarkan sumber resmi terbaru serta ahli yang kompeten.
- Uji kasus normal, koreksi, prorata, terminasi, pembulatan, dan rekonsiliasi pada data sintetis.
- Persetujuan berlapis dan jejak audit sebelum pemakaian data nyata.

## 6. Status implementasi

- Halaman native **SDM & Payroll** tersedia di `src/HRManagement.tsx`, dengan styling pada `src/style.css` dan navigasi di `src/App.tsx`. Direktori memiliki pencarian/filter dan formulir demo; antrean HR dapat disimulasikan secara lokal.
- Migrasi `0004` telah berhasil diterapkan pada branch development `nusa-design-dev-ready`. Verifikasi read-only memastikan empat tabel HR tersedia, RLS aktif, serta kebijakan dan constraint terbentuk.
- Perubahan skema belum diterapkan ke branch production. UI belum terhubung ke API dan data yang tampil/ditambahkan masih bukan catatan HR persisten.
- Dokumen ini tidak menyatakan bahwa autentikasi HR, persetujuan server-side, payroll, pajak, BPJS, atau kontrol produksi telah aktif.
- Setiap tahapan hanya boleh ditandai selesai setelah kode, konfigurasi, pengujian, dan perilaku aktual diverifikasi.

## 7. Batasan

Dokumen ini adalah rencana rekayasa perangkat lunak, bukan nasihat hukum, pajak, atau ketenagakerjaan. Implementasi harus mengikuti ketentuan Indonesia yang berlaku dan kebijakan perusahaan yang telah diverifikasi.
