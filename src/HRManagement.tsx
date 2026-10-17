import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, FileCheck2, GraduationCap, ShieldAlert, Users, WalletCards, ClipboardCheck, ArrowRight, UserPlus, CalendarClock, Search, Check, X, UserRoundSearch } from 'lucide-react'

type Person = { initials: string; name: string; role: string; team: string; status: string; tone: 'present' | 'leave' | 'pending' }
const initialPeople: Person[] = [
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
type HrTask = { id: number; title: string; detail: string; due: string; status: 'Menunggu' | 'Disetujui' | 'Ditolak'; icon: typeof CalendarDays }
const initialTasks: HrTask[] = [
  { id: 1, title: 'Verifikasi pengajuan cuti', detail: 'Periksa ketersediaan personel proyek sebelum menyetujui.', due: 'Hari ini', status: 'Menunggu', icon: CalendarDays },
  { id: 2, title: 'Validasi data payroll', detail: 'Periksa kehadiran, lembur, tunjangan, dan potongan sebelum proses.', due: 'Periode berjalan', status: 'Menunggu', icon: FileCheck2 },
  { id: 3, title: 'Perbarui kompetensi tim', detail: 'Cocokkan sertifikasi dan kompetensi dengan kebutuhan proyek.', due: 'Minggu ini', status: 'Menunggu', icon: ClipboardCheck },
]
export default function HRManagement() {
  const [people, setPeople] = useState(initialPeople)
  const [tasks, setTasks] = useState(initialTasks)
  const [query, setQuery] = useState('')
  const [teamFilter, setTeamFilter] = useState('Semua tim')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newTeam, setNewTeam] = useState('Desain')
  const [notice, setNotice] = useState('')

  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const filteredPeople = useMemo(() => people.filter(person => {
    const matchesQuery = [person.name, person.role, person.team].some(value => value.toLocaleLowerCase('id-ID').includes(query.toLocaleLowerCase('id-ID')))
    return matchesQuery && (teamFilter === 'Semua tim' || person.team === teamFilter)
  }), [people, query, teamFilter])
  const pendingCount = tasks.filter(task => task.status === 'Menunggu').length

  function addPerson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()
    const role = newRole.trim()
    if (!name || !role) return
    const initials = name.split(/\\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')
    setPeople(current => [...current, { initials, name, role, team: newTeam, status: 'Perlu verifikasi', tone: 'pending' }])
    setNewName(''); setNewRole(''); setNewTeam('Desain'); setShowAddForm(false)
    setNotice('Karyawan contoh ditambahkan pada sesi browser ini saja; belum disimpan ke database.')
  }
  function updateTask(id: number, status: 'Disetujui' | 'Ditolak') {
    setTasks(current => current.map(task => task.id === id && task.status === 'Menunggu' ? { ...task, status } : task))
    setNotice('Status demonstrasi diperbarui di browser ini saja. Belum ada persetujuan server atau catatan audit.')
  }

  return <div className="hrms-page">
    <section className="hrms-hero">
      <div><div className="hrms-eyebrow">PEOPLE OPERATIONS · NUSA DESIGN</div><h1>SDM & Payroll</h1><p>Kelola tim desain, tenaga ahli, dan personel proyek dari satu ruang kerja. Modul native ini dirancang untuk alur HR perusahaan arsitektur dan konstruksi.</p></div>
      <div className="hrms-hero-aside"><strong>Tim yang tepat, proyek yang lebih terarah.</strong><span>Hubungkan ketersediaan personel dengan jadwal, kompetensi, dan kebutuhan proyek.</span></div>
    </section>
    <div className="hrms-demo-notice"><ShieldAlert size={16} /><span><b>Mode demonstrasi.</b> Nama, angka, status, dan tindakan di halaman ini adalah data contoh yang hanya berubah di sesi browser. Belum terhubung ke database HR, autentikasi, approval server-side, atau mesin payroll.</span></div>
    {notice && <div className="hrms-demo-notice" role="status"><CheckCircle2 size={16}/><span>{notice}</span><button className="hrms-action" onClick={() => setNotice('')}>Tutup</button></div>}
    <section className="hrms-metrics">
      <Metric icon={<Users size={17}/>} title="Total karyawan contoh" value={String(48 + Math.max(0, people.length - initialPeople.length))} note="Bukan headcount perusahaan terverifikasi" />
      <Metric icon={<CheckCircle2 size={17}/>} title="Hadir hari ini" value="41" note="Ilustrasi; perlu data absensi nyata" />
      <Metric icon={<CalendarClock size={17}/>} title="Tugas menunggu" value={String(pendingCount)} note="Status antrean hanya pada sesi ini" />
      <Metric icon={<WalletCards size={17}/>} title="Payroll periode ini" value="Draft" note="Belum dihitung atau disahkan" />
    </section>
    <section className="hrms-content-grid">
      <article className="hrms-panel">
        <div className="hrms-panel-head"><div><h2>Direktori personel contoh</h2><p>Cari dan filter data demonstrasi</p></div><span className="hrms-tag">{filteredPeople.length} terlihat</span></div>
        <div className="hrms-actions" style={{marginBottom:12}}>
          <label className="hrms-search"><Search size={15}/><input aria-label="Cari personel" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama, jabatan, tim..." /></label>
          <select className="hrms-filter" aria-label="Filter tim" value={teamFilter} onChange={event => setTeamFilter(event.target.value)}><option>Semua tim</option><option>Desain</option><option>Konstruksi</option><option>Estimasi</option><option>Proyek</option></select>
        </div>
        <div className="hrms-table-wrap"><table className="hrms-table"><thead><tr><th>Karyawan</th><th>Tim</th><th>Status</th></tr></thead><tbody>
          {filteredPeople.map((person, index) => <tr key={person.initials + person.name + index}><td><div className="hrms-employee"><span className="hrms-employee-avatar">{person.initials}</span><span><b>{person.name}</b><small>{person.role}</small></span></div></td><td>{person.team}</td><td><span className={`hrms-status ${person.tone === 'leave' ? 'leave' : person.tone === 'pending' ? 'pending' : ''}`}>{person.status}</span></td></tr>)}
          {filteredPeople.length === 0 && <tr><td colSpan={3}>Tidak ada personel yang cocok dengan pencarian.</td></tr>}
        </tbody></table></div>
        <div className="hrms-actions" style={{marginTop:14}}><button className="hrms-action" onClick={() => { setQuery(''); setTeamFilter('Semua tim') }}><UserRoundSearch size={13}/> Reset filter</button><button className="hrms-action primary" onClick={() => setShowAddForm(value => !value)}><UserPlus size={13}/> {showAddForm ? 'Tutup formulir' : 'Tambah contoh karyawan'}</button></div>
        {showAddForm && <form className="hrms-add-form" onSubmit={addPerson}>
          <label>Nama lengkap<input required value={newName} onChange={event => setNewName(event.target.value)} placeholder="Contoh: Nabila Putri"/></label>
          <label>Jabatan<input required value={newRole} onChange={event => setNewRole(event.target.value)} placeholder="Contoh: BIM Modeler"/></label>
          <label>Tim<select value={newTeam} onChange={event => setNewTeam(event.target.value)}><option>Desain</option><option>Konstruksi</option><option>Estimasi</option><option>Proyek</option></select></label>
          <button className="hrms-action primary" type="submit"><UserPlus size={13}/> Tambahkan ke demo</button>
        </form>}
      </article>
      <article className="hrms-panel">
        <div className="hrms-panel-head"><div><h2>Antrean kerja HR</h2><p>Tindakan lokal untuk menguji alur UI</p></div><span className="hrms-tag">{pendingCount} menunggu</span></div>
        <div className="hrms-task-list">
          {tasks.map(task => <div className="hrms-task" key={task.id}><div className="hrms-task-icon"><task.icon size={16}/></div><div className="hrms-task-copy"><b>{task.title}</b><span>{task.detail}</span><span className={`hrms-task-status ${task.status === 'Disetujui' ? 'approved' : task.status === 'Ditolak' ? 'rejected' : ''}`}>{task.status}</span>{task.status === 'Menunggu' && <div className="hrms-task-buttons"><button className="hrms-action" onClick={() => updateTask(task.id, 'Disetujui')}><Check size={12}/> Simulasikan setuju</button><button className="hrms-action danger" onClick={() => updateTask(task.id, 'Ditolak')}><X size={12}/> Simulasikan tolak</button></div>}</div><time>{task.due}</time></div>)}
        </div>
      </article>
    </section>
    <section><div className="hrms-panel-head"><div><h2>Kapabilitas SDM</h2><p>Fitur yang akan dibangun secara native untuk kebutuhan NUSA DESIGN</p></div></div><div className="hrms-module-grid">{modules.map(item => <article className="hrms-module-card" key={item.title}><div className="hrms-module-icon"><item.icon size={17}/></div><div><h3>{item.title}</h3><p>{item.desc}</p></div></article>)}</div></section>
    <div className="hrms-footer-note">Tanggal tampilan: {today}. Data yang ditambah atau status yang diubah tidak bertahan setelah sesi browser dimuat ulang. Payroll Indonesia harus melalui validasi aturan PPh 21, BPJS, THR, lembur, dan kebijakan perusahaan sebelum produksi.</div>
  </div>
}
function Metric({icon,title,value,note}:{icon:React.ReactNode;title:string;value:string;note:string}) {
  return <article className="hrms-metric"><div className="hrms-metric-top"><span>{title}</span><span className="hrms-metric-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>
}
