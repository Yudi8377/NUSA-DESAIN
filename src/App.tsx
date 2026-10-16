import { useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Box, BriefcaseBusiness, Building2,
  CalendarDays, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, FileText,
  HardHat, Layers3, LayoutDashboard, Menu, MoreHorizontal, Plus, Search, Settings2,
  Users, WalletCards,
} from 'lucide-react'
import BuildingViewer from './BuildingViewer'

const menu = [
  { label: 'Ringkasan', icon: LayoutDashboard, active: true },
  { label: 'CRM & Penjualan', icon: Users },
  { label: 'Proyek Konstruksi', icon: Building2 },
  { label: 'RAB & Anggaran', icon: WalletCards },
  { label: 'Dokumen Desain', icon: FileText },
  { label: 'Tugas Tim', icon: ClipboardList },
]
const lowerMenu = [
  { label: 'Pengadaan', icon: BriefcaseBusiness },
  { label: 'Keuangan', icon: WalletCards },
  { label: 'SDM & Payroll', icon: Users },
  { label: 'Laporan & Audit', icon: Activity },
]

export default function App() {
  const [active, setActive] = useState('Ringkasan')
  const [floors, setFloors] = useState(5)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [search, setSearch] = useState('')
  const currentMenu = [...menu, ...lowerMenu].find((item) => item.label === active)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Layers3 size={22} strokeWidth={2.3} /></div>
          <div><strong>NUSA<span>DESIGN</span></strong><small>PROJECT INTELLIGENCE</small></div>
        </div>
        <div className="workspace"><div className="workspace-icon">ND</div><div><b>Nusa Design Studio</b><small>Workspace perusahaan</small></div><ChevronDown size={15} /></div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {menu.map((item) => <button key={item.label} className={`nav-item ${active === item.label ? 'selected' : ''}`} onClick={() => { setActive(item.label); setMobileMenu(false) }}><item.icon size={18} /><span>{item.label}</span>{item.label === 'Tugas Tim' && <i className="nav-count">4</i>}</button>)}
        </nav>
        <div className="nav-label nav-label-spaced">MANAJEMEN</div>
        <nav>
          {lowerMenu.map((item) => <button key={item.label} className={`nav-item ${active === item.label ? 'selected' : ''}`} onClick={() => { setActive(item.label); setMobileMenu(false) }}><item.icon size={18} /><span>{item.label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card"><div className="support-icon"><CircleHelp size={17}/></div><b>Butuh bantuan?</b><p>Pusat bantuan untuk tim proyek Anda.</p><button onClick={() => window.alert('Pusat bantuan akan tersedia pada tahap berikutnya.')}>Buka pusat bantuan <span>↗</span></button></div>
          <button className="nav-item" onClick={() => setActive('Pengaturan')}><Settings2 size={18}/><span>Pengaturan</span></button>
          <div className="user-profile"><div className="avatar">DW</div><div><b>Admin Workspace</b><small>Administrator</small></div><MoreHorizontal size={18}/></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-toggle icon-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Buka navigasi"><Menu size={20}/></button>
          <div className="breadcrumb">Nusa Design <span>/</span> <b>{active}</b></div>
          <div className="top-actions">
            <label className="search-box"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari proyek, dokumen..." /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification" aria-label="Notifikasi"><Bell size={18}/><i /></button>
            <div className="top-avatar">DW</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-line"/> SENIN, 16 OKTOBER 2026</div><h1>{active === 'Ringkasan' ? 'Selamat datang kembali.' : active}</h1><p className="subtitle">{active === 'Ringkasan' ? 'Pantau progres proyek dan jaga seluruh pekerjaan tetap selaras.' : `Ringkasan area ${active.toLowerCase()} dalam workspace Anda.`}</p></div>
            <button className="primary-button" onClick={() => window.alert('Formulir proyek baru akan diaktifkan setelah modul data dan autentikasi tersedia.')}><Plus size={17}/> Proyek baru</button>
          </section>

          <section className="metric-grid">
            <Metric title="Proyek aktif" value="12" change="+2 bulan ini" positive icon={<Building2 size={18}/>} />
            <Metric title="Nilai portofolio" value="Rp 8,4 M" change="+12,8% dari kuartal lalu" positive icon={<WalletCards size={18}/>} />
            <Metric title="Tugas berjalan" value="28" change="6 perlu perhatian" icon={<ClipboardList size={18}/>} />
            <Metric title="Ketepatan jadwal" value="92,6%" change="+4,2% bulan ini" positive icon={<CalendarDays size={18}/>} />
          </section>

          <section className="section-heading"><div><h2>Ruang kerja proyek</h2><p>Gambaran proyek dan model desain dalam satu tempat.</p></div><button className="text-button" onClick={() => setActive('Proyek Konstruksi')}>Semua proyek <span>→</span></button></section>
          <section className="project-grid">
            <article className="project-card">
              <div className="project-top"><div className="project-tag"><span className="tag-dot"/> DALAM PENGERJAAN</div><button className="icon-button subtle" aria-label="Menu proyek"><MoreHorizontal size={19}/></button></div>
              <div className="project-title-row"><div className="project-icon"><HardHat size={21}/></div><div><h3>Gedung Perkantoran Nusantara</h3><p>Jakarta Selatan · Komersial</p></div></div>
              <div className="progress-label"><span>Progres keseluruhan</span><b>68%</b></div><div className="progress-track"><div style={{width:'68%'}}/></div>
              <div className="project-meta"><span><CalendarDays size={14}/> Target 18 Des 2026</span><span><Users size={14}/> 8 anggota</span></div>
              <div className="project-footer"><div className="avatar-stack"><span>AR</span><span>DN</span><span>+6</span></div><button className="outline-button" onClick={() => setActive('Model 3D')}>Buka proyek <span>→</span></button></div>
            </article>
            <article className="model-card">
              <div className="model-card-head"><div><div className="model-kicker"><Box size={15}/> DESIGN INTELLIGENCE</div><h3>Visualisasi model gedung</h3><p>Eksplorasi bentuk bangunan secara interaktif.</p></div><button className="icon-button subtle" aria-label="Pilihan model"><MoreHorizontal size={19}/></button></div>
              <BuildingViewer floors={floors}/>
              <div className="model-controls"><div><small>Jumlah lantai model demo</small><b>{floors} lantai</b></div><input type="range" min="2" max="12" value={floors} onChange={(e) => setFloors(Number(e.target.value))} aria-label="Jumlah lantai model demo"/></div>
              <div className="model-footnote">Model ilustrasi generik · bukan gambar kerja atau model BIM terverifikasi.</div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel"><div className="panel-heading"><div><h3>Aktivitas terbaru</h3><p>Pembaruan terakhir pada workspace</p></div><button className="icon-button subtle" aria-label="Opsi aktivitas"><MoreHorizontal size={18}/></button></div>
              <ActivityRow icon={<FileText size={17}/>} title="Revisi denah lantai 3" detail="Gedung Perkantoran Nusantara" time="12 menit lalu" tone="blue"/>
              <ActivityRow icon={<CheckCircle2 size={17}/>} title="Persetujuan material struktur" detail="Proyek Residensial Kemang" time="1 jam lalu" tone="green"/>
              <ActivityRow icon={<ClipboardList size={17}/>} title="Tugas inspeksi lapangan dibuat" detail="Proyek Gudang Logistik" time="3 jam lalu" tone="orange"/>
            </article>
            <article className="panel schedule-panel"><div className="panel-heading"><div><h3>Prioritas minggu ini</h3><p>Hal yang perlu ditindaklanjuti</p></div><span className="priority-count">3</span></div>
              <Priority title="Review RAB struktur" project="Gedung Perkantoran Nusantara" due="Hari ini" level="urgent"/>
              <Priority title="Persetujuan gambar kerja" project="Residensial Kemang" due="Besok" level="normal"/>
              <Priority title="Evaluasi vendor material" project="Gudang Logistik" due="Jumat, 19 Okt" level="normal"/>
            </article>
          </section>
          <footer className="page-footer"><span>© 2026 NUSA DESIGN</span><span><span className="footer-dot"/> Workspace demo · Data ilustrasi</span><span>Versi fondasi 0.1.0</span></footer>
        </div>
      </main>
    </div>
  )
}

function Metric({ title, value, change, positive, icon }: { title: string; value: string; change: string; positive?: boolean; icon: React.ReactNode }) {
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><div className="metric-icon">{icon}</div></div><div className="metric-value">{value}</div><div className={`metric-change ${positive ? 'positive' : ''}`}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {change}</div></article>
}
function ActivityRow({ icon, title, detail, time, tone }: { icon: React.ReactNode; title: string; detail: string; time: string; tone: string }) {
  return <div className="activity-row"><div className={`activity-icon ${tone}`}>{icon}</div><div className="activity-copy"><b>{title}</b><span>{detail}</span></div><time>{time}</time></div>
}
function Priority({ title, project, due, level }: { title: string; project: string; due: string; level: string }) {
  return <div className="priority-row"><span className={`priority-mark ${level}`}/><div className="priority-copy"><b>{title}</b><span>{project}</span></div><time className={level === 'urgent' ? 'urgent-time' : ''}>{due}</time></div>
}
