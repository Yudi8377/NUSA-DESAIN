import { CalendarDays, CheckCircle2, Clock3, FileCheck2, GraduationCap, HeartPulse, ShieldAlert, Users, WalletCards, BriefcaseBusiness, ClipboardCheck, TrendingUp, ArrowRight, UserPlus, CalendarClock } from 'lucide-react'

const people = [
  { initials: 'AR', name: 'Alya Rahma', role: 'Arsitek Madya', team: 'Desain', status: 'Hadir', tone: 'present' },
  { initials: 'BP', name: 'Bima Pratama', role: 'Site Engineer', team: 'Konstruksi', status: 'Hadir', tone: 'present' },
  { initials: 'CN', name: 'Citra Nabila', role: 'Quantity Surveyor', team: 'Estimasi', status: 'Cuti', tone: 'leave' },
  { initials: 'DS', name: 'Dimas Saputra', role: 'Project Manager', team: 'Proyek', status: 'Perlu verifikasi', tone: 'pending' },
]
const modules = [
  { title: 'Data karyawan', desc: 'Profil, kontrak, jabatan, organisasi, dan siklus kerja.', icon: Users },
  { title: 'Absensi & shift', desc: 'Kehadiran, jadwal kerja, lembur, dan penugasan lapangan.', icon: Clock3 },
  { title: 'Cuti & izin', desc: 'Saldo cuti, pengajuan, persetujuan, dan kalender tim.', icon: CalendarDays },
  { title: 'Rekrutmen & onboarding', desc: 'Lowongan, kandidat, orientasi, dan dokumen masuk.', icon: UserPlus },
  { title: 'Payroll & kompensasi', desc: 'Komponen gaji, tunjangan, potongan, dan slip gaji.', icon: WalletCards },
  { title: 'Kinerja & pelatihan', desc: 'Sasaran, evaluasi, kompetensi, dan sertifikasi.', icon: GraduationCap },
]
export default function HRManagement() {
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  return <div className="hrms-page">
    <section className="hrms-hero">
      <div><div className="hrms-eyebrow">PEOPLE OPERATIONS · NUSA DESIGN</div><h1>SDM & Payroll</h1><p>Kelola tim desain, tenaga ahli, dan personel proyek dari satu ruang kerja. Modul ini disiapkan untuk alur HR perusahaan arsitektur dan konstruksi.</p></div>
      <div className="hrms-hero-aside"><strong>Tim yang tepat, proyek yang lebih terarah.</strong><span>Hubungkan ketersediaan personel dengan jadwal, kompetensi, dan kebutuhan proyek.</span></div>
    </section>
    <div className="hrms-demo-notice"><ShieldAlert size={16} /><span><b>Mode demonstrasi.</b> Angka, nama, kehadiran, dan pengajuan pada halaman ini adalah data contoh. Belum terhubung ke database, autentikasi HR, mesin payroll, atau instance Frappe HRMS.</span></div>
    <section className="hrms-metrics">
      <Metric icon={<Users size={17}/>} title="Total karyawan" value="48" note="Ilustrasi data tenaga kerja" />
      <Metric icon={<CheckCircle2 size={17}/>} title="Hadir hari ini" value="41" note="Perlu validasi dari absensi" />
      <Metric icon={<CalendarClock size={17}/>} title="Permintaan cuti" value="3" note="Contoh antrean persetujuan" />
      <Metric icon={<WalletCards size={17}/>} title="Payroll periode ini" value="Draft" note="Belum dihitung atau disahkan" />
    </section>
    <section className="hrms-content-grid">
      <article className="hrms-panel">
        <div className="hrms-panel-head"><div><h2>Ringkasan personel</h2><p>Contoh tim lintas fungsi desain dan konstruksi</p></div><span className="hrms-tag">Data contoh</span></div>
        <div className="hrms-table-wrap"><table className="hrms-table"><thead><tr><th>Karyawan</th><th>Tim</th><th>Status</th></tr></thead><tbody>
          {people.map(person => <tr key={person.initials}><td><div className="hrms-employee"><span className="hrms-employee-avatar">{person.initials}</span><span><b>{person.name}</b><small>{person.role}</small></span></div></td><td>{person.team}</td><td><span className={`hrms-status ${person.tone === 'leave' ? 'leave' : person.tone === 'pending' ? 'pending' : ''}`}>{person.status}</span></td></tr>)}
        </tbody></table></div>
        <div className="hrms-actions" style={{marginTop:14}}><button className="hrms-action" onClick={() => window.alert('Direktori karyawan akan diaktifkan setelah autentikasi dan API HR tersedia.')}>Buka direktori <ArrowRight size={13}/></button><button className="hrms-action primary" onClick={() => window.alert('Pembuatan karyawan memerlukan formulir tervalidasi dan backend HR.')}>Tambah karyawan <UserPlus size={13}/></button></div>
      </article>
      <article className="hrms-panel">
        <div className="hrms-panel-head"><div><h2>Perlu ditindaklanjuti</h2><p>Daftar kerja HR demonstrasi</p></div><span className="hrms-tag">3 item</span></div>
        <div className="hrms-task-list">
          <Task icon={<CalendarDays size={16}/>} title="Verifikasi pengajuan cuti" detail="Periksa ketersediaan personel proyek sebelum menyetujui." due="Hari ini" />
          <Task icon={<FileCheck2 size={16}/>} title="Validasi data payroll" detail="Periksa kehadiran, lembur, tunjangan, dan potongan sebelum proses." due="Periode berjalan" />
          <Task icon={<ClipboardCheck size={16}/>} title="Perbarui kompetensi tim" detail="Cocokkan sertifikasi dan kompetensi dengan kebutuhan proyek." due="Minggu ini" />
        </div>
      </article>
    </section>
    <section><div className="hrms-panel-head"><div><h2>Kapabilitas SDM</h2><p>Ruang lingkup yang direncanakan untuk integrasi HRMS</p></div></div><div className="hrms-module-grid">{modules.map(item => <article className="hrms-module-card" key={item.title}><div className="hrms-module-icon"><item.icon size={17}/></div><div><h3>{item.title}</h3><p>{item.desc}</p></div></article>)}</div></section>
    <div className="hrms-footer-note">Tanggal tampilan: {today}. Modul payroll Indonesia harus dikonfigurasi dan diuji secara terpisah untuk aturan PPh 21, BPJS, THR, lembur, serta kebijakan perusahaan. Tidak ada nilai gaji atau kewajiban pajak yang dihitung pada halaman ini.</div>
  </div>
}
function Metric({icon,title,value,note}:{icon:React.ReactNode;title:string;value:string;note:string}) {
  return <article className="hrms-metric"><div className="hrms-metric-top"><span>{title}</span><span className="hrms-metric-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>
}
function Task({icon,title,detail,due}:{icon:React.ReactNode;title:string;detail:string;due:string}) {
  return <div className="hrms-task"><div className="hrms-task-icon">{icon}</div><div className="hrms-task-copy"><b>{title}</b><span>{detail}</span></div><time>{due}</time></div>
}
