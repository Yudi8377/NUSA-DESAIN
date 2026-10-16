# Status Implementasi dan Gerbang Go-Live — NUSA DESIGN

Tanggal pemeriksaan: 16 Oktober 2026

## Status terverifikasi

- Repository aktif: `Yudi8377/NUSA-DESAIN`, branch `main`.
- Commit katalog API: `ce823c2b78fee14bef8da7b8580609873dd2e718`.
- CI pada commit tersebut berhasil: type-check dan production build lulus.
- Workflow GitHub Pages berhasil membangun dan mengunggah artifact, tetapi langkah deploy gagal.
- Pesan kegagalan deploy: `HttpError: Not Found` / `Failed to create deployment (status: 404)`; log menyarankan agar GitHub Pages diaktifkan di pengaturan repository.
- Karena deploy gagal, URL publik tidak boleh dianggap aktif/terverifikasi.
- Katalog API publik adalah katalog kandidat statis. Belum ada API eksternal yang dipanggil langsung dari UI katalog.

## Tindakan manual untuk membuka publikasi GitHub Pages

1. Buka https://github.com/Yudi8377/NUSA-DESAIN/settings/pages.
2. Pada **Build and deployment**, pilih **Source: GitHub Actions**.
3. Simpan pengaturan jika diminta.
4. Buka https://github.com/Yudi8377/NUSA-DESAIN/actions.
5. Jalankan ulang workflow **Deploy NUSA DESIGN preview to GitHub Pages** atau buat commit baru setelah Pages diaktifkan.
6. Pastikan job deploy berstatus **success** sebelum menyatakan situs live.
7. Setelah sukses, uji halaman utama dan navigasi aplikasi pada URL Pages yang ditampilkan GitHub.

Saya tidak dapat mengaktifkan pengaturan administratif Pages melalui koneksi GitHub yang tersedia di sesi ini. Jangan membuat token atau menaruh rahasia GitHub di source code untuk mengatasi hal ini.

## Batasan kesiapan produksi saat ini

- Dashboard, HRMS, K3, AI Studio, dan katalog API masih memiliki bagian demo/konseptual; jangan menganggap semua angka, operasi, dan koneksi sudah bersumber dari database.
- Belum ada autentikasi produksi yang tervalidasi end-to-end untuk seluruh modul.
- Tenant isolation dan RLS perlu diuji melalui sesi server tepercaya, termasuk uji lintas organisasi.
- Integrasi AI eksternal harus melalui backend/server-side adapter; API key tidak boleh ditanam di browser.
- Integrasi layanan publik harus divalidasi satu per satu atas ketersediaan, syarat penggunaan, rate limit, biaya, privasi, dan kecocokan Indonesia.
- Modul HR/payroll tidak boleh dipakai untuk penggajian nyata sebelum formula, komponen BPJS/PPh, periode, otorisasi, audit trail, dan rekonsiliasi diuji oleh pihak yang kompeten.
- Modul K3 bukan sistem pemantauan perangkat atau sensor yang sudah terhubung.

## Urutan kerja yang direkomendasikan

### Gerbang 1 — Publikasi dan smoke test
- Aktifkan Pages dari pengaturan repository.
- Verifikasi deploy sukses, asset path, refresh route, dan tampilan desktop/mobile.
- Catat URL dan commit yang benar-benar terpublikasi.

### Gerbang 2 — Fondasi backend yang aman
- Tetapkan mekanisme sesi server-side yang dipercaya.
- Turunkan `user_id` dan `organization_id` dari sesi terverifikasi, bukan dari input browser.
- Terapkan pemeriksaan peran dan izin untuk setiap mutasi.
- Tambahkan tes negatif untuk akses lintas tenant, eskalasi peran, dan akses tanpa sesi.
- Pisahkan rahasia provider ke environment server.

### Gerbang 3 — Data domain
- Tetapkan sumber data nyata untuk proyek, model, tugas, aset, insiden K3, dan data SDM.
- Tambahkan validasi, audit trail, pagination, penanganan error, dan backup/restore.
- Gunakan data demo yang diberi label dan tidak dicampur dengan data produksi.

### Gerbang 4 — Integrasi API bertahap
- Mulai dari provider dengan nilai tinggi dan risiko rendah, misalnya cuaca untuk konteks lokasi proyek.
- Buat adapter server-side per provider, timeout, cache, retry terbatas, rate limiting, dan pencatatan sumber/waktu pengambilan.
- Untuk peta/geocoding, patuhi kebijakan provider dan tampilkan atribusi yang diwajibkan.
- Jangan memakai katalog sebagai bukti bahwa provider sudah terhubung.

### Gerbang 5 — Uji penerimaan dan operasi
- Uji alur kerja dengan data contoh dan skenario gagal.
- Uji akses, backup/restore, observabilitas, dan pemulihan.
- Minta validasi profesional untuk proses keuangan, pajak, payroll, dan keselamatan sebelum penggunaan operasional.

## Definisi selesai

Fitur dinyatakan selesai hanya jika implementasi ada di repository, CI lulus, alur penting diuji, status koneksi dijelaskan secara akurat, dan—untuk fitur publik—deployment berhasil diverifikasi. UI demo atau dokumentasi rencana tidak sama dengan integrasi produksi.
