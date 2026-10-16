# Analisis dan Integrasi Frappe Books — NUSA DESIGN ERP

Tanggal: 16 Oktober 2026

## Keputusan

Gunakan Frappe Books sebagai **referensi fungsional dan opsi integrasi terpisah**, bukan menyalin kode ke aplikasi React NUSA DESIGN. Repository yang diminta, `frappe/books`, memakai lisensi AGPL-3.0; distribusi atau modifikasi yang termasuk karya turunan dapat menimbulkan kewajiban lisensi dan penyediaan kode sumber. Tinjau lisensi aktual dan seluruh dependency sebelum memilih integrasi. Sumber: https://github.com/frappe/books/blob/master/LICENSE

Repositori Frappe Books untuk Frappe Framework menjelaskan fitur double-entry, bagan akun, jurnal, buku besar, laporan laba-rugi/neraca/neraca saldo, invoice, tagihan pembelian, pembayaran, retur, inventory, serta UI web dan API melalui Frappe Framework. Sumber: https://github.com/frappe/frappe-books

## Yang diadopsi sebagai kebutuhan NUSA DESIGN

1. **Double-entry accounting**: setiap jurnal seimbang debit dan kredit; transaksi tidak langsung mengubah saldo tanpa jurnal.
2. **Bagan akun (Chart of Accounts)**: akun aset, liabilitas, ekuitas, pendapatan, dan beban dengan kode yang dapat dikonfigurasi.
3. **Piutang**: invoice klien, termin, jatuh tempo, pembayaran, dan umur piutang.
4. **Utang**: tagihan vendor, purchase order/receipt reference, persetujuan, jatuh tempo, dan pembayaran.
5. **Buku besar dan laporan**: general ledger, trial balance, laba-rugi, neraca, arus kas, dan audit trail.
6. **Akuntansi per proyek**: project_id wajib pada biaya/pendapatan proyek yang relevan; bandingkan RAB, komitmen pengadaan, biaya aktual, termin, dan margin.
7. **Dokumen dan kontrol**: nomor dokumen, lampiran bukti, approval, status draft/posted/void, periode terkunci, dan pemisahan tugas.
8. **Ekspor**: CSV untuk rekonsiliasi dan pemeriksaan; ekspor laporan harus mengikuti hak akses.

## Yang tidak diadopsi langsung

- Tidak menyalin source code atau UI Frappe Books.
- Tidak mengasumsikan laporan GST India sesuai dengan PPN/PPh Indonesia.
- Tidak menjadikan UI lokal atau contoh data sebagai akuntansi produksi.
- Tidak mengaktifkan inventory FIFO sebelum kebijakan material, satuan, gudang, dan costing perusahaan disepakati.
- Tidak menyimpan kunci API atau kredensial akuntansi di frontend.

## Arsitektur yang direkomendasikan

- Frontend: modul akuntansi internal NUSA DESIGN (React/TypeScript).
- Backend: API server-side dengan autentikasi dan role permission; setiap mutasi mencatat actor dan organisasi dari sesi tepercaya.
- Database: tabel transaksi, journal_entries, journal_lines, accounts, parties, invoices, bills, payments, project_cost_allocations, fiscal_periods, approvals, dan audit_events.
- Invariant: setiap jurnal posted seimbang; transaksi posted tidak diedit langsung; koreksi melalui reversal; nomor dokumen unik per organisasi; seluruh query terisolasi tenant.
- Integrasi opsional: deploy Frappe Books/Frappe sebagai layanan terpisah dan integrasikan melalui API resmi setelah validasi lisensi, model data, pemetaan akun, autentikasi, dan kebutuhan operasi. Jangan menggabungkan kode AGPL ke app tanpa review lisensi.
- Hosting: GitHub Pages hanya untuk frontend statis; backend/database dibutuhkan untuk data transaksi nyata. Jangan menaruh rahasia di GitHub Pages.

## Kebutuhan spesifik konstruksi

- Anggaran baseline (RAB) dan revisi yang disetujui.
- Komitmen biaya dari PO/kontrak vendor.
- Biaya aktual dari tagihan dan pembayaran.
- Alokasi biaya ke proyek, paket pekerjaan, cost code, dan periode.
- Retensi, uang muka, termin, perubahan pekerjaan/variation order, serta progress billing bila relevan.
- Rekonsiliasi invoice, bukti penerimaan barang/jasa, approval, dan pembayaran.
- Dashboard margin proyek hanya dari transaksi yang telah divalidasi, dengan penanda data belum lengkap.

## Status implementasi

UI `src/Accounting.tsx` adalah prototipe lokal dengan data contoh, filter transaksi, tampilan bagan akun, alur akuntansi, dan ekspor CSV demo. Belum menyimpan ke database, belum menghasilkan jurnal debit/kredit, belum menghitung laporan resmi, dan tidak boleh dipakai sebagai catatan keuangan produksi.

## Tahapan sebelum produksi

1. Review bagan akun dan kebijakan akuntansi oleh akuntan perusahaan.
2. Implementasikan skema database dan migration dengan tenant isolation.
3. Implementasikan API transaksi dan journal posting dengan validasi double-entry di server.
4. Implementasikan persetujuan dan audit trail.
5. Uji balance, reversal, closing period, duplikasi pembayaran, concurrent writes, dan akses lintas organisasi.
6. Rekonsiliasi saldo awal dan bank; validasi pajak Indonesia oleh konsultan pajak/akuntan.
7. Uji backup/restore dan persetujuan penerimaan pengguna sebelum go-live.
