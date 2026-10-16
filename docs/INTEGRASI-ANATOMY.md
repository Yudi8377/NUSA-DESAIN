# Integrasi Anatomy ke NUSA DESIGN ERP

## Ringkasan sumber

Repository https://github.com/wheresryan22/anatomy adalah agent skill untuk menghasilkan ilustrasi isometrik teknis interaktif menggunakan SVG, dengan opsi WebGL dan mode 3D beta. Repository menyatakan lisensi MIT; pertahankan atribusi dan salinan lisensi jika kode sumber atau bagian substansialnya didistribusikan. Lihat LICENSE pada repository sumber untuk teks lengkap dan pastikan lisensi aset/figure individual juga diperiksa bila mengambil aset dari galeri komunitas.

Anatomy pada dasarnya adalah skill untuk coding agent, bukan paket ERP siap pakai. Karena NUSA DESIGN berjalan sebagai React + TypeScript + Vite, integrasi dilakukan sebagai fitur visualisasi native yang ditulis khusus untuk NUSA DESIGN, mengambil inspirasi dari pendekatan isometrik dan interaksi berlapis. Tidak ada kit atau contoh sumber yang disalin ke dalam aplikasi pada perubahan ini.

## Fitur yang ditambahkan

- Menu **Anatomi Bangunan** di navigasi ERP.
- Diagram isometrik konseptual dengan lapisan struktur, selubung, MEP, dan interior.
- Kontrol untuk menampilkan/menyembunyikan setiap lapisan.
- Mode uraikan/rapatkan lapisan untuk menjelaskan hubungan antardisiplin.
- Inspektor lapisan dengan deskripsi singkat.
- Diagram alur proyek dari brief, desain, RAB, hingga pelaksanaan.
- Tampilan responsif untuk desktop dan layar kecil.
- Peringatan eksplisit bahwa diagram generik bukan gambar kerja atau bukti kepatuhan teknis.

## Batasan saat ini

Diagram adalah ilustrasi konseptual statis yang interaktif, bukan hasil BIM atau model teknik terukur. Data diagram belum diambil dari database proyek, model IFC/Revit, gambar kerja, kalkulasi struktur, atau model MEP. Tombol lapisan mengubah visibilitas ilustrasi saja; belum mengubah elemen BIM asli.

Jangan gunakan ilustrasi untuk menentukan dimensi, beban struktur, ukuran pondasi, detail sambungan, spesifikasi, jalur servis final, RAB, izin, atau kepatuhan kode bangunan.

## Langkah integrasi berikutnya

1. Tambahkan skema metadata elemen bangunan dan relasi antar-disiplin yang tenant-scoped.
2. Hubungkan viewer dengan proyek terpilih dan versi model yang tersimpan.
3. Implementasikan impor IFC/model 3D melalui pipeline validasi dan batas ukuran file.
4. Simpan revisi, status review, komentar, dan audit trail.
5. Tampilkan peringatan bila lapisan model tidak sinkron antar-disiplin.
6. Uji akses organisasi dan file privat sebelum membuka unggahan model.

## File aplikasi

- `src/AnatomyExplorer.tsx`: halaman diagram dan interaksi.
- `src/App.tsx`: menu dan routing halaman.
- `src/style.css`: gaya responsif.
