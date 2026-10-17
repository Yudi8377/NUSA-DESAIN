import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, CircleAlert, ClipboardList, FolderKanban, MapPin, Plus, RefreshCw, X } from 'lucide-react'
import { isHrApiConfigured } from './services/hrApi'
import { projectApi, type ProjectRecord, type ProjectTaskRecord } from './services/projectApi'
import './projects.css'

const statusLabel: Record<ProjectRecord['status'], string> = { planning: 'Perencanaan', active: 'Aktif', on_hold: 'Ditunda', completed: 'Selesai', cancelled: 'Dibatalkan' }
const typeLabel: Record<string, string> = { architecture: 'Arsitektur', construction: 'Konstruksi', renovation: 'Renovasi', interior: 'Interior', infrastructure: 'Infrastruktur', other: 'Lainnya' }
const priorityLabel: Record<ProjectTaskRecord['priority'], string> = { low: 'Rendah', normal: 'Normal', high: 'Tinggi', urgent: 'Mendesak' }
const money = (value: string | number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0)
const dateLabel = (value?: string | null) => value ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)) : 'Belum ditentukan'

export default function ProjectsModule() {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [selected, setSelected] = useState<ProjectRecord | null>(null)
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showTask, setShowTask] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ code: '', name: '', project_type: 'construction', location: '', start_date: '', target_end_date: '', budget_amount: '0' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'normal', due_date: '' })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const rows = await projectApi.list()
      setProjects(rows)
      if (selected && !rows.some(project => project.id === selected.id)) { setSelected(null); setTasks([]) }
    } catch (err) { setError(err instanceof Error ? err.message : 'Data proyek gagal dimuat.') }
    finally { setLoading(false) }
  }, [selected?.id])

  useEffect(() => { void load() }, [])

  const openProject = async (project: ProjectRecord) => {
    setSelected(project); setShowTask(false); setError(''); setNotice('')
    try { setTasks(await projectApi.listTasks(project.id)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Tugas proyek gagal dimuat.') }
  }

  const createProject = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      const project = await projectApi.create({ ...form, location: form.location.trim() || undefined, start_date: form.start_date || undefined, target_end_date: form.target_end_date || undefined, budget_amount: Number(form.budget_amount) })
      setForm({ code: '', name: '', project_type: 'construction', location: '', start_date: '', target_end_date: '', budget_amount: '0' })
      setShowCreate(false); setNotice('Proyek tersimpan ke database workspace.'); await load(); setSelected(project); setTasks([])
    } catch (err) { setError(err instanceof Error ? err.message : 'Proyek gagal disimpan.') }
    finally { setBusy(false) }
  }

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selected) return
    setBusy(true); setError(''); setNotice('')
    try {
      await projectApi.createTask(selected.id, { ...taskForm, description: taskForm.description.trim() || undefined, due_date: taskForm.due_date || undefined })
      setTaskForm({ title: '', description: '', priority: 'normal', due_date: '' })
      setShowTask(false); setNotice('Tugas tersimpan dan tercatat pada audit log.'); setTasks(await projectApi.listTasks(selected.id))
    } catch (err) { setError(err instanceof Error ? err.message : 'Tugas gagal disimpan.') }
    finally { setBusy(false) }
  }

  if (!isHrApiConfigured) return <section className="projects-page"><header className="projects-hero"><div><span>PROJECT DELIVERY</span><h1>Proyek Konstruksi</h1><p>Daftar proyek akan terhubung setelah API aman dikonfigurasi.</p></div></header><div className="projects-warning"><CircleAlert size={18}/><p>Mode demo: data belum tersimpan. Jangan gunakan angka ilustrasi untuk keputusan proyek atau pelaporan resmi.</p></div></section>

  return <section className="projects-page">
    <header className="projects-hero"><div><span>PROJECT DELIVERY · DATA WORKSPACE</span><h1>Proyek Konstruksi</h1><p>Kelola proyek, anggaran awal, tenggat, dan tugas tim dalam workspace perusahaan.</p></div><div className="projects-hero-metric"><b>{projects.length}</b><small>proyek tercatat</small><span>Data dari database workspace</span></div></header>
    <div className="projects-toolbar"><div><h2>Daftar proyek</h2><p>Data terisolasi berdasarkan organisasi dan hak akses akun.</p></div><div className="projects-toolbar-actions"><button className="projects-button secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={15}/> Muat ulang</button><button className="projects-button primary" onClick={() => setShowCreate(!showCreate)}><Plus size={16}/> Proyek baru</button></div></div>
    {error && <div className="projects-error"><CircleAlert size={16}/>{error}<button onClick={() => setError('')} aria-label="Tutup pesan"><X size={14}/></button></div>}
    {notice && <div className="projects-notice"><CheckCircle2 size={16}/>{notice}<button onClick={() => setNotice('')} aria-label="Tutup pesan"><X size={14}/></button></div>}
    {showCreate && <form className="projects-form" onSubmit={createProject}><div className="projects-form-head"><div><b>Tambah proyek</b><span>Data akan disimpan di PostgreSQL workspace aktif.</span></div><button type="button" className="projects-icon-button" onClick={() => setShowCreate(false)} aria-label="Tutup"><X size={17}/></button></div><div className="projects-form-grid"><label>Kode proyek<input required maxLength={40} value={form.code} onChange={e => setForm({...form,code:e.target.value})} placeholder="ND-2026-001"/></label><label>Nama proyek<input required maxLength={180} value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Nama proyek arsitektur/konstruksi"/></label><label>Jenis proyek<select value={form.project_type} onChange={e => setForm({...form,project_type:e.target.value})}><option value="architecture">Arsitektur</option><option value="construction">Konstruksi</option><option value="renovation">Renovasi</option><option value="interior">Interior</option><option value="infrastructure">Infrastruktur</option><option value="other">Lainnya</option></select></label><label>Lokasi<input maxLength={180} value={form.location} onChange={e => setForm({...form,location:e.target.value})} placeholder="Kota / alamat proyek"/></label><label>Anggaran awal (Rp)<input required type="number" min="0" step="1000" value={form.budget_amount} onChange={e => setForm({...form,budget_amount:e.target.value})}/></label><label>Tanggal mulai<input type="date" value={form.start_date} onChange={e => setForm({...form,start_date:e.target.value})}/></label><label>Target selesai<input type="date" value={form.target_end_date} onChange={e => setForm({...form,target_end_date:e.target.value})}/></label></div><div className="projects-form-actions"><button className="projects-button primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan proyek'}</button></div></form>}
    <div className="projects-layout"><div className="projects-list">{loading ? <div className="projects-empty">Memuat data proyek…</div> : projects.length ? projects.map(project => <button key={project.id} className={`projects-card ${selected?.id === project.id ? 'selected' : ''}`} onClick={() => void openProject(project)}><div className="projects-card-icon"><FolderKanban size={19}/></div><div className="projects-card-body"><div className="projects-card-top"><span className={`projects-status ${project.status}`}>{statusLabel[project.status]}</span><small>{typeLabel[project.project_type] || project.project_type}</small></div><b>{project.name}</b><span className="projects-card-meta"><strong>{project.code}</strong>{project.location && <><i>·</i><span><MapPin size={12}/>{project.location}</span></>}</span><div className="projects-progress"><span><i style={{width: `${Math.min(100,Math.max(0,Number(project.progress_percent)||0))}%`}}/></span><b>{Number(project.progress_percent)||0}%</b></div><div className="projects-card-bottom"><span><CalendarDays size={13}/> {dateLabel(project.target_end_date)}</span><b>{money(project.budget_amount)}</b></div></div></button>) : <div className="projects-empty"><FolderKanban size={28}/><b>Belum ada proyek</b><p>Tambahkan proyek pertama untuk mulai membangun data workspace yang nyata.</p><button className="projects-button primary" onClick={() => setShowCreate(true)}><Plus size={15}/> Tambah proyek</button></div>}</div>
    <aside className="projects-detail">{selected ? <><div className="projects-detail-head"><div><span>RINCIAN PROYEK</span><h2>{selected.name}</h2><p>{selected.code} · {statusLabel[selected.status]}</p></div><button className="projects-icon-button" onClick={() => {setSelected(null);setTasks([])}} aria-label="Tutup rincian"><X size={17}/></button></div><div className="projects-detail-stats"><div><small>Anggaran awal</small><b>{money(selected.budget_amount)}</b></div><div><small>Progres tercatat</small><b>{Number(selected.progress_percent)||0}%</b></div></div><div className="projects-detail-meta"><span><MapPin size={14}/>{selected.location || 'Lokasi belum diisi'}</span><span><CalendarDays size={14}/>Target: {dateLabel(selected.target_end_date)}</span></div><div className="projects-task-head"><div><h3>Tugas proyek</h3><p>{tasks.length} tugas terdaftar</p></div><button className="projects-button secondary" onClick={() => setShowTask(!showTask)}><Plus size={14}/> Tugas baru</button></div>{showTask && <form className="projects-task-form" onSubmit={createTask}><label>Judul tugas<input required maxLength={180} value={taskForm.title} onChange={e => setTaskForm({...taskForm,title:e.target.value})} placeholder="Contoh: Review gambar kerja"/></label><label>Deskripsi<textarea maxLength={4000} value={taskForm.description} onChange={e => setTaskForm({...taskForm,description:e.target.value})} placeholder="Ruang lingkup dan hasil yang diharapkan"/></label><div className="projects-form-grid"><label>Prioritas<select value={taskForm.priority} onChange={e => setTaskForm({...taskForm,priority:e.target.value})}><option value="low">Rendah</option><option value="normal">Normal</option><option value="high">Tinggi</option><option value="urgent">Mendesak</option></select></label><label>Tenggat<input type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm,due_date:e.target.value})}/></label></div><button className="projects-button primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan tugas'}</button></form>}<div className="projects-task-list">{tasks.length ? tasks.map(task => <article key={task.id} className="projects-task"><div className={`projects-task-mark ${task.priority}`}/><div><b>{task.title}</b><p>{task.description || 'Belum ada deskripsi.'}</p><span>{priorityLabel[task.priority]} · {task.due_date ? dateLabel(task.due_date) : 'Tanpa tenggat'}</span></div><small>{task.status === 'done' ? 'Selesai' : task.status === 'in_progress' ? 'Berjalan' : task.status === 'blocked' ? 'Terhambat' : 'To-do'}</small></article>) : <div className="projects-empty compact"><ClipboardList size={22}/><p>Belum ada tugas pada proyek ini.</p></div>}</div></> : <div className="projects-detail-empty"><FolderKanban size={28}/><b>Pilih proyek</b><p>Pilih satu proyek untuk melihat rincian dan daftar tugas.</p></div>}</aside></div>
    <p className="projects-footnote">Catatan: modul ini menyimpan proyek dan tugas ke database. Perubahan status, pembagian personel, RAB terperinci, progres terverifikasi, serta integrasi BIM/akuntansi masih memerlukan modul lanjutan.</p>
  </section>
}
