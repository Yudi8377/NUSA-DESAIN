# Integrasi Open Generative AI ke NUSA DESIGN

Tanggal pemeriksaan: 16 Oktober 2026.

## Referensi yang ditinjau

- Sumber: https://github.com/Anil-matcha/Open-Generative-AI
- Metadata repository menyatakan lisensi MIT; file LICENSE menyebut copyright Open Generative AI Contributors (2026).
- Teknologi aplikasi sumber meliputi Next.js/React, API route server, workspace npm, serta komponen untuk image/video studio, workflow, agents, dan design agent.
- Repository mengandalkan layanan/model/API tertentu dan memiliki sejumlah submodule/workspace. Lisensi root tidak otomatis membuktikan semua submodule, model, atau penyedia API memiliki syarat yang sama.

## Yang sudah diintegrasikan ke NUSA DESIGN

- Navigasi baru **Studio AI Desain** pada sidebar.
- Komponen React/TypeScript mandiri: `src/AIStudio.tsx`.
- Pemilih alur: konsep arsitektur, render eksterior, render interior, video walkthrough, dan materi presentasi.
- Form brief dengan nama proyek, tipologi bangunan, gaya desain, lokasi, dan catatan tambahan.
- Pembentukan prompt terstruktur secara lokal serta tombol salin.
- Peringatan untuk tidak mengarang ukuran teknis, spesifikasi struktur, biaya, atau klaim kepatuhan regulasi.
- Tampilan responsif yang mengikuti sistem visual NUSA DESIGN.

Implementasi ini dibuat khusus untuk NUSA DESIGN. Tidak ada kode sumber Open Generative AI yang disalin langsung ke aplikasi ini.

## Batasan status saat ini

Studio AI adalah **pembuat brief/prompt**, belum menjalankan inferensi model dan belum menghasilkan file gambar/video. Tombol susun brief memproses input di browser saja. Konektor generasi, galeri hasil, penyimpanan aset, billing/credit, antrean job, dan integrasi dengan project/model database belum diaktifkan.

## Arsitektur integrasi yang disarankan

1. Frontend mengirim brief dan identitas konteks proyek ke endpoint API NUSA DESIGN.
2. Server memvalidasi sesi, keanggotaan organisasi, izin proyek, ukuran file, dan batas pemakaian.
3. Server memilih adapter penyedia/model berdasarkan capability (text-to-image, image-to-image, text-to-video, image-to-video); API key hanya disimpan di secret environment server.
4. Job generasi dicatat di database dengan organisasi, proyek, pemohon, status, model, estimasi biaya bila tersedia, dan audit event.
5. Hasil disimpan di object storage privat; database menyimpan metadata dan izin akses. Gunakan URL sementara bertanda tangan untuk download.
6. UI menampilkan antrean, status, preview, versi prompt, kegagalan, dan tombol mengaitkan hasil ke proyek atau dokumen desain.
7. Terapkan kuota, persetujuan sebelum biaya berbayar, kebijakan retensi, moderasi yang sesuai, dan mekanisme penghapusan aset.

## Modul sumber yang layak dijadikan referensi

- **Image Studio / Video Studio**: pola pilihan model, parameter prompt, dan preview hasil.
- **Workflow Builder**: kelak untuk alur konsep → variasi → review → persetujuan.
- **AI Agents / Design Agent**: referensi orkestrasi tugas dan bantuan penyusunan brief; semua aksi tetap harus tunduk pada izin pengguna.
- **Upload/asset flow**: referensi alur upload dan pengelolaan hasil, setelah disesuaikan ke object storage NUSA DESIGN.

Tidak disarankan mengimpor seluruh aplikasi sumber sebagai satu paket ke dashboard sekarang: source menggunakan Next.js/Electron dan workspace/submodule sendiri, sementara NUSA DESIGN adalah Vite SPA. Bila perlu menjalankan engine sumber lengkap, jalankan sebagai layanan terpisah di belakang API gateway, bukan di browser atau pada static GitHub Pages.

## Lisensi dan atribusi

Repository utama menyatakan MIT. Bila kelak kode dari repository atau submodule-nya disalin/diadaptasi, simpan teks lisensi dan copyright yang relevan, inventarisasi lisensi dependency/submodule, dan tinjau syarat API/model/provider secara terpisah. Lisensi software tidak otomatis memberikan hak komersial tak terbatas atas setiap model, hasil, atau layanan eksternal.
