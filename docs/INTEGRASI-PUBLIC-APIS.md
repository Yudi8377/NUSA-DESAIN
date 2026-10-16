# Integrasi referensi Public APIs ke NUSA DESIGN

## Hasil analisis

Referensi: https://github.com/marcelscruz/public-apis — direktori kolaboratif API publik untuk developer. Metadata repositori yang diperiksa menyatakan lisensi MIT. Daftar mengelompokkan layanan menurut domain seperti AI, bisnis, keuangan, geocoding, pemerintah, lingkungan, transportasi, cuaca, dan pengembangan. Direktori ini adalah katalog penemuan, bukan jaminan bahwa semua layanan aktif, gratis, aman, cocok untuk Indonesia, atau boleh dipakai tanpa batas.

## Implementasi NUSA DESIGN

- Menambahkan menu **Katalog API** dengan direktori pilihan untuk kebutuhan arsitektur/konstruksi.
- Fitur pencarian teks, filter kategori, metode akses, dan label gratis.
- Setiap entri menyertakan deskripsi, potensi penggunaan, metode autentikasi, label biaya indikatif, dan tautan dokumentasi.
- Semua entri diberi status **Belum terhubung**. UI tidak mengirim permintaan ke API eksternal, tidak mengumpulkan API key, dan tidak menyatakan layanan telah diuji.
- Kandidat awal: Open-Meteo, BMKG (perlu verifikasi kanal akses), OpenStreetMap/Nominatim, OpenAQ, Frankfurter, ExchangeRate-API, VATComply (hanya konteks VAT lintas negara), REST Countries, JSONPlaceholder, OpenAI API, dan GitHub REST API.

## Prioritas untuk ERP konstruksi

1. **Cuaca proyek:** evaluasi Open-Meteo dan sumber BMKG yang resmi/diizinkan. Data cuaca hanya sebagai dukungan keputusan, bukan jaminan kondisi lapangan.
2. **Peta dan lokasi:** evaluasi kebijakan tile/geocoding dan batas laju; jangan melakukan geocoding massal tanpa izin.
3. **Lingkungan:** OpenAQ dapat menjadi sumber konteks, bukan pengganti alat ukur K3 atau hasil pengujian yang diwajibkan.
4. **Pengembangan:** GitHub API untuk CI dan issue setelah token backend, least privilege, serta audit diterapkan.
5. **AI:** integrasi hanya melalui backend tepercaya dengan pengungkapan biaya, minimisasi data, dan kebijakan privasi.
6. **Keuangan/pajak:** data kurs dan API VAT tidak boleh dianggap sebagai buku besar, kurs bank resmi, atau mesin perhitungan pajak Indonesia.

## Gerbang sebelum produksi

- Konfirmasi status layanan, SLA, lisensi data, kebijakan penggunaan, rate limits, CORS, dan biaya aktual.
- Simpan secret pada server/backend atau secret manager; jangan pernah memasukkan API key privat ke frontend, repository, atau log.
- Tambahkan adapter per penyedia dengan timeout, retry terbatas, rate limiting, validasi schema, cache, circuit breaker, dan observability.
- Catat tujuan pemrosesan, klasifikasi data, retensi, lokasi pemrosesan, dan dasar berbagi data sebelum mengirim data proyek/personal ke pihak ketiga.
- Pisahkan environment development dan production; tambahkan tes kontrak dan uji kegagalan penyedia.
- API berlabel gratis tetap dapat membatasi penggunaan, mengubah syarat, atau memerlukan atribusi.

## Batas cakupan saat ini

Ini adalah katalog referensi statis yang dikurasi, bukan sinkronisasi otomatis dengan repo sumber, API marketplace, atau integrasi runtime. Ketersediaan, harga, syarat, dan keamanan setiap provider belum diverifikasi satu per satu dan harus ditinjau kembali saat implementasi nyata.
