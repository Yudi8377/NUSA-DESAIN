# Integrasi OpenStatus ke NUSA DESIGN — K3 & Pemantauan

## Ringkasan analisis
Repositori referensi: https://github.com/openstatusHQ/openstatus

OpenStatus adalah platform open-source untuk uptime monitoring, status pages, notifikasi, dan incident response. README repo menyebut Next.js untuk dashboard, Hono untuk API, Go checker, Turso/libSQL, Drizzle ORM, Tinybird analytics, serta Tailwind/shadcn untuk UI. Lisensi repositori utama adalah **AGPL-3.0**.

OpenStatus bukan aplikasi K3 konstruksi. Yang diadaptasi adalah pola kerja dan konsep UI: daftar insiden dengan tingkat keparahan/status, tindak lanjut dan penanggung jawab, status operasional/health checks, status page, notifikasi, audit, KPI cards, status pills, incident list, filters, tabs, tables, dan empty states. UI NUSA DESIGN dibuat ulang; tidak ada source OpenStatus yang disalin pada tahap ini.

## Implementasi saat ini
- Ikhtisar K3.
- Register insiden/temuan dan alur status Baru → Ditangani → Terkendali → Selesai.
- Formulir temuan demo dan filter status.
- Agenda inspeksi dan contoh hazard register.
- Tab Pemantauan untuk endpoint aplikasi, API/autentikasi, database, dan notifikasi.
- Pemberitahuan jelas bahwa data hanya contoh lokal.

## Batasan
- Formulir dan perubahan status adalah state lokal; tidak persist, tidak punya autentikasi/otorisasi, tidak mengirim notifikasi, dan bukan bukti audit.
- Status “Belum terhubung” bukan hasil ping/health check nyata.
- Register risiko adalah contoh awal yang wajib ditinjau Ahli K3/personel kompeten berdasarkan metode kerja, lokasi, alat, dan ketentuan yang berlaku.
- Modul bukan pengganti inspeksi fisik, prosedur tanggap darurat, izin kerja, toolbox meeting, atau kewajiban K3.
- Data aktual perlu kontrol akses, jejak audit, retensi, lampiran bukti, waktu kejadian, lokasi, pelapor, PIC, dan verifikasi penutupan.

## Arsitektur target
1. NUSA DESIGN React UI untuk input dan dashboard.
2. Backend/API terautentikasi untuk validasi peran, organisasi, proyek, dan otorisasi.
3. Database NUSA DESIGN untuk incidents, incident_updates, hazard_register, risk_controls, inspections, inspection_items, corrective_actions, attachments, notification_outbox, dan audit_events.
4. Worker/cron health checker untuk endpoint layanan digital, menyimpan status/latency dan menghasilkan alert. Pisahkan uptime dari temuan K3 lapangan.
5. Notifikasi melalui kanal yang dikonfigurasi (email/webhook/WhatsApp gateway resmi), dengan retry, deduplikasi, dan audit; tidak ada kredensial di browser.
6. Tampilan status publik/internal sesuai hak akses; laporan kecelakaan dan data pekerja tidak boleh terbuka ke publik.

## Model data awal yang disarankan
- k3_incidents: id, organization_id, project_id, incident_type, title, description, severity, status, location, occurred_at, reported_by, assigned_to, closed_at.
- k3_incident_updates: incident_id, status_from, status_to, note, actor_id, created_at.
- k3_hazards: project_id, hazard, activity, likelihood, consequence, risk_score, control_plan, residual_risk, owner_id, review_date.
- k3_inspections: project_id, inspection_type, scheduled_at, inspector_id, status.
- k3_inspection_items: inspection_id, item, result, evidence_url, corrective_action_id.
- k3_corrective_actions: source_type, source_id, action, owner_id, due_at, status, verified_by, verified_at.
- k3_monitor_checks: service_name, endpoint_ref, checked_at, status, latency_ms, region, error_code.
- k3_notifications dan audit_events untuk pengiriman, hasil, dan jejak perubahan.

Semua tabel transaksional harus memiliki tenant/project scope dan pemeriksaan akses server; RLS saja tidak menggantikan validasi identitas server.

## Lisensi dan penggunaan ulang
Repositori utama OpenStatus menggunakan AGPL-3.0. UI NUSA DESIGN dibuat mandiri berdasarkan pola fungsional umum, bukan menyalin komponen/source OpenStatus. Sebelum memasukkan kode, dependensi, atau menjalankan modifikasi OpenStatus sebagai layanan jaringan, lakukan peninjauan kewajiban AGPL oleh penasihat hukum. Catat lisensi dan atribusi setiap komponen pihak ketiga yang benar-benar digunakan.

## Tahap berikutnya
1. Pastikan CI TypeScript/build lulus.
2. Rancang migrasi database K3 dan kebijakan tenant/RBAC.
3. Implementasikan backend incident/inspection CRUD dan audit trail.
4. Tambahkan unggah foto bukti, checklist, PIC, due date, dan verifikasi tindakan.
5. Tambahkan worker health-check untuk layanan digital dengan alert dan histori.
6. Uji akses lintas proyek/organisasi, audit, retensi, backup, dan alur respons darurat.
