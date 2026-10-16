import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BookOpen, Download, FileText, Plus, Search, ShieldCheck, Wallet, Building2 } from 'lucide-react'
import './Accounting.css'

type Entry = { id: string; date: string; type: 'Invoice' | 'Bill' | 'Payment' | 'Journal'; party: string; project: string; account: string; amount: number; status: 'Draft' | 'Menunggu' | 'Lunas' | 'Tercatat' }
const demoEntries: Entry[] = [
  { id: 'INV-2026-014', date: '2026-10-14', type: 'Invoice', party: 'PT Nusantara Properti', project: 'Gedung Perkantoran Nusantara', account: 'Pendapatan Jasa Desain', amount: 185000000, status: 'Menunggu' },
  { id: 'BILL-2026-032', date: '2026-10-13', type: 'Bill', party: 'PT Beton Utama', project: 'Gedung Perkantoran Nusantara', account: 'Material Struktur', amount: 72500000, status: 'Menunggu' },
  { id: 'PAY-2026-021', date: '2026-10-12', type: 'Payment', party: 'CV Arsitektur Digital', project: 'Residensial Kemang', account: 'Jasa Konsultan', amount: 24500000, status: 'Lunas' },
  { id: 'JRN-2026-009', date: '2026-10-10', type: 'Journal', party: 'Penyesuaian periode', project: 'Umum', account: 'Beban Operasional', amount: 12800000, status: 'Tercatat' },
  { id: 'INV-2026-013', date: '2026-10-08', type: 'Invoice', party: 'PT Karya Logistik', project: 'Gudang Logistik', account: 'Pendapatan Perencanaan', amount: 96000000, status: 'Lunas' },
]
const idr = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const tabs = ['Ikhtisar', 'Transaksi', 'Bagan Akun', 'Buku Besar', 'Laporan']

export default function Accounting() {
  const [tab, setTab] = useState('Ikhtisar')
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('Semua')
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState('')
  const entries = useMemo(() => demoEntries.filter((entry) => (kind === 'Semua' || entry.type === kind) && [entry.id, entry.party, entry.project, entry.account].some((value) => value.toLowerCase().includes(query.toLowerCase()))), [query, kind])
  const exportCsv = () => {
    const rows = [['Nomor', 'Tanggal', 'Jenis', 'Pihak', 'Proyek', 'Akun', 'Jumlah IDR', 'Status'], ...entries.map((e) => [e.id, e.date, e.type, e.party, e.project, e.account, String(e.amount), e.status])]
    const csv = rows.map((row) => row.map((cell) => '"' + cell.replaceAll('"', '""') + '"').join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'nusa-design-transaksi-demo.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return <div className="accounting-page">
    <div className="accounting-heading"><div><div className="accounting-eyebrow"><Wallet size={15}/> FINANCE & PROJECT CONTROL</div><h1>Keuangan & Akuntansi</h1><p>Kontrol transaksi, buku besar, dan kinerja keuangan proyek dalam satu ruang kerja.</p></div><button className="accounting-primary" onClick={() => { setShowForm(!showForm); setNotice('') }}><Plus size={17}/> Transaksi baru</button></div>
    <div className="accounting-demo-banner"><ShieldCheck size={18}/><span><b>Mode demonstrasi.</b> Data berikut adalah ilustrasi, belum disimpan ke database dan bukan laporan keuangan resmi.</span></div>
    {showForm && <div className="accounting-form"><b>Catat transaksi</b><p>Formulir transaksi produksi akan diaktifkan setelah backend, otorisasi, dan jurnal double-entry tersedia.</p><button onClick={() => { setShowForm(false); setNotice('Form transaksi belum menyimpan data. Backend akuntansi perlu diaktifkan terlebih dahulu.') }}>Mengerti</button></div>}
    {notice && <div className="accounting-notice">{notice}</div>}
    <div className="accounting-metrics">
      <Metric icon={<ArrowDownLeft size={17}/>} label="Piutang ilustratif" value={idr(185000000)} sub="1 invoice menunggu" />
      <Metric icon={<ArrowUpRight size={17}/>} label="Utang ilustratif" value={idr(72500000)} sub="1 tagihan menunggu" />
      <Metric icon={<Building2 size={17}/>} label="Biaya proyek" value={idr(110900000)} sub="Alokasi demo" />
      <Metric icon={<BookOpen size={17}/>} label="Status pembukuan" value="Belum aktif" sub="Belum ada jurnal produksi" />
    </div>
    <div className="accounting-tabs">{tabs.map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Ikhtisar' && <div className="accounting-overview-grid"><section className="accounting-panel"><div className="accounting-panel-head"><div><h2>Aktivitas keuangan</h2><p>Transaksi terbaru dalam data contoh</p></div><button className="accounting-quiet" onClick={() => setTab('Transaksi')}>Lihat semua →</button></div>{demoEntries.slice(0, 4).map((entry) => <div className="accounting-activity" key={entry.id}><span className={'accounting-activity-icon ' + (entry.type === 'Invoice' || entry.type === 'Payment' ? 'income' : 'expense')}>{entry.type === 'Invoice' || entry.type === 'Payment' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}</span><div className="accounting-activity-main"><b>{entry.party}</b><span>{entry.id} · {entry.project}</span></div><div className="accounting-activity-value"><b>{idr(entry.amount)}</b><span>{entry.status}</span></div></div>)}</section><section className="accounting-panel"><div className="accounting-panel-head"><div><h2>Alur akuntansi</h2><p>Urutan kontrol yang akan dibangun</p></div></div>{[['01','Dokumen sumber','Invoice, tagihan vendor, bukti pembayaran'],['02','Persetujuan','Pemeriksaan anggaran dan otorisasi'],['03','Jurnal double-entry','Posting debit/kredit dengan periode terkunci'],['04','Rekonsiliasi','Cocokkan bank, buku besar, dan subledger'],['05','Laporan','Laba-rugi, neraca, arus kas, biaya proyek']].map((x) => <div className="accounting-flow" key={x[0]}><span>{x[0]}</span><div><b>{x[1]}</b><small>{x[2]}</small></div></div>)}</section></div>}
    {tab === 'Transaksi' && <section className="accounting-panel"><div className="accounting-panel-head"><div><h2>Daftar transaksi</h2><p>Gunakan pencarian untuk menyaring data contoh.</p></div><button className="accounting-quiet" onClick={exportCsv}><Download size={15}/> Ekspor CSV</button></div><div className="accounting-filters"><label><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nomor, pihak, proyek, akun..." /></label><select value={kind} onChange={(e) => setKind(e.target.value)}><option>Semua</option><option>Invoice</option><option>Bill</option><option>Payment</option><option>Journal</option></select></div><div className="accounting-table-wrap"><table className="accounting-table"><thead><tr><th>Dokumen</th><th>Pihak / Proyek</th><th>Akun</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>{entries.map((e) => <tr key={e.id}><td><b>{e.id}</b><small>{e.date} · {e.type}</small></td><td>{e.party}<small>{e.project}</small></td><td>{e.account}</td><td className="money">{idr(e.amount)}</td><td><span className={'accounting-status ' + e.status.toLowerCase()}>{e.status}</span></td></tr>)}</tbody></table>{entries.length === 0 && <p className="accounting-empty">Tidak ada transaksi yang cocok.</p>}</div></section>}
    {tab === 'Bagan Akun' && <section className="accounting-panel"><div className="accounting-panel-head"><div><h2>Bagan akun yang direncanakan</h2><p>Struktur awal; kode dan saldo perlu disetujui akuntan perusahaan.</p></div></div><div className="accounting-table-wrap"><table className="accounting-table"><thead><tr><th>Kode</th><th>Nama akun</th><th>Kelompok</th><th>Catatan</th></tr></thead><tbody>{[['1000','Kas dan Bank','Aset','Rekening kas/bank'],['1100','Piutang Usaha','Aset','Per invoice dan klien'],['1200','Persediaan Material','Aset','Jika persediaan digunakan'],['2000','Utang Usaha','Liabilitas','Per vendor/tagihan'],['3000','Modal','Ekuitas','Saldo awal dan perubahan modal'],['4000','Pendapatan Jasa Desain','Pendapatan','Pendapatan berdasarkan kontrak'],['4100','Pendapatan Pengawasan','Pendapatan','Pisahkan jenis jasa'],['5000','Biaya Langsung Proyek','Beban','Wajib punya project_id'],['6000','Beban Operasional','Beban','Biaya kantor dan umum']].map((r) => <tr key={r[0]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table></div></section>}
    {tab === 'Buku Besar' && <section className="accounting-panel"><div className="accounting-panel-head"><div><h2>Buku besar</h2><p>Belum tersedia sebagai buku besar resmi.</p></div></div><div className="accounting-empty-state"><BookOpen size={28}/><b>Posting jurnal belum diaktifkan</b><span>Produksi memerlukan jurnal debit/kredit seimbang, nomor dokumen unik, periode akuntansi, audit trail, dan proteksi dari perubahan setelah posting.</span></div></section>}
    {tab === 'Laporan' && <section className="accounting-panel"><div className="accounting-panel-head"><div><h2>Laporan keuangan</h2><p>Jenis laporan yang harus tersedia setelah engine akuntansi lolos pengujian.</p></div></div><div className="accounting-report-grid">{[['Laba Rugi','Pendapatan, beban, laba per periode dan proyek'],['Neraca','Aset = liabilitas + ekuitas'],['Arus Kas','Arus operasi, investasi, dan pendanaan'],['Neraca Saldo','Saldo debit/kredit seluruh akun'],['Biaya Proyek','RAB vs komitmen vs biaya aktual'],['Piutang & Utang','Umur piutang, jatuh tempo, dan vendor']].map((r) => <article key={r[0]}><FileText size={19}/><b>{r[0]}</b><span>{r[1]}</span><small>Rencana · belum terhubung</small></article>)}</div></section>}
    <div className="accounting-footer">NUSA DESIGN · Modul akuntansi internal · Seluruh nilai pada layar ini merupakan data ilustrasi.</div>
  </div>
}
function Metric({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
 return <article className="accounting-metric"><span className="accounting-metric-icon">{icon}</span><span className="accounting-metric-label">{label}</span><strong>{value}</strong><small>{sub}</small></article>
}
