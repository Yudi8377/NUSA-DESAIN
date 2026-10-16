# Integrasi model 3D — NUSA DESIGN

## Hasil pemeriksaan repository referensi

Sumber: https://github.com/Najwahkr/opengl-gedung-3d-feb-unesa

Struktur repository yang terlihat:
- `FEB_G1/FEB_G1.cpp`
- `FEB_TENGAH/FEB_TENGAH.cpp`
- `PROJEK_FEB_3D/PROJEK_FEB_3D.cpp`
- berkas solution/project Visual Studio.

Kode yang diperiksa memakai C++, FreeGLUT, OpenGL, dan GLU. Contohnya memiliki fungsi geometri balok, fasad, jendela, pintu, pencahayaan, material, serta kontrol kamera. Ini adalah aplikasi desktop native, bukan library web siap-pasang.

## Strategi integrasi aman

1. NUSA DESIGN memakai Three.js/WebGL untuk viewer di browser agar bisa masuk ke ERP web dan PWA.
2. Viewer saat ini menghasilkan model ilustrasi generik, bukan model FEB UNESA yang telah dipindahkan.
3. Porting geometri dilakukan sebagai implementasi ulang yang terdokumentasi, setelah lisensi atau izin penggunaan sumber jelas.
4. Jika pemilik menyediakan model CAD/BIM/mesh yang boleh digunakan, prioritaskan format pertukaran seperti glTF/GLB untuk web. IFC dapat ditambahkan lewat pipeline konversi terpisah.
5. Setiap aset model disimpan sebagai versi terpisah dengan metadata proyek, format, URL aset, waktu unggah, dan pengunggah. File model besar sebaiknya disimpan di object storage; Neon menyimpan metadata dan relasinya.
6. Jangan menampilkan model demo sebagai model konstruksi tervalidasi atau sumber kuantitas RAB.

## Status

- Viewer Three.js awal sudah ada di `src/BuildingViewer.tsx`.
- Metadata model 3D memiliki tabel awal `project_models` di Neon.
- Upload model, storage, parsing GLB/IFC, kontrol akses, dan sinkronisasi RAB belum diimplementasikan.
- Tidak ada kode C++ dari repository referensi yang disalin ke repository NUSA DESIGN.
