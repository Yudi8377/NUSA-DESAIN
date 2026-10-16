import { useMemo, useState } from 'react'
import { ArrowUpRight, CheckCircle2, ExternalLink, KeyRound, Search, ShieldCheck, Sparkles, Wifi } from 'lucide-react'
import './APICatalog.css'

type APIEntry = {
  name: string
  category: string
  description: string
  auth: 'Tanpa kunci' | 'API key' | 'OAuth / akun' | 'Perlu verifikasi'
  cost: 'Gratis' | 'Freemium' | 'Perlu evaluasi'
  useCase: string
  docs: string
  suitability: 'Direkomendasikan untuk evaluasi' | 'Perlu pemeriksaan kebijakan' | 'Opsional'
}

const entries: APIEntry[] = [
  { name: 'Open-Meteo', category: 'Cuaca & Lapangan', description: 'Prakiraan cuaca dan data historis untuk koordinasi pekerjaan luar ruang.', auth: 'Tanpa kunci', cost: 'Gratis', useCase: 'Widget cuaca lokasi proyek dan perencanaan inspeksi.', docs: 'https://open-meteo.com/en/docs', suitability: 'Direkomendasikan untuk evaluasi' },
  { name: 'BMKG', category: 'Cuaca & Lapangan', description: 'Sumber informasi cuaca dan peringatan resmi Indonesia; integrasi harus mengikuti kanal dan ketentuan akses yang berlaku.', auth: 'Perlu verifikasi', cost: 'Perlu evaluasi', useCase: 'Peringatan cuaca ekstrem untuk tim proyek Indonesia.', docs: 'https://www.bmkg.go.id/', suitability: 'Perlu pemeriksaan kebijakan' },
  { name: 'OpenStreetMap', category: 'Peta & Lokasi', description: 'Data peta terbuka yang dapat menjadi dasar konteks lokasi proyek.', auth: 'Tanpa kunci', cost: 'Gratis', useCase: 'Peta konteks lokasi; pilih penyedia tile sesuai kebijakan penggunaan.', docs: 'https://www.openstreetmap.org/copyright', suitability: 'Perlu pemeriksaan kebijakan' },
  { name: 'Nominatim', category: 'Peta & Lokasi', description: 'Geocoding dan pencarian lokasi berbasis OpenStreetMap.', auth: 'Tanpa kunci', cost: 'Gratis', useCase: 'Konversi alamat lokasi proyek menjadi koordinat pada skala rendah.', docs: 'https://nominatim.org/release-docs/latest/api/Overview/', suitability: 'Perlu pemeriksaan kebijakan' },
  { name: 'OpenAQ', category: 'Lingkungan', description: 'Data kualitas udara dari jaringan pemantauan yang tersedia.', auth: 'API key', cost: 'Gratis', useCase: 'Konteks kualitas udara untuk lokasi proyek dan paparan debu.', docs: 'https://docs.openaq.org/', suitability: 'Direkomendasikan untuk evaluasi' },
  { name: 'Frankfurter', category: 'Keuangan', description: 'Referensi kurs valuta asing untuk kebutuhan informasi dan estimasi.', auth: 'Tanpa kunci', cost: 'Gratis', useCase: 'Konteks kurs; bukan sumber kurs akuntansi resmi atau transaksi bank.', docs: 'https://frankfurter.dev/', suitability: 'Opsional' },
  { name: 'ExchangeRate-API', category: 'Keuangan', description: 'Layanan nilai tukar dengan pilihan paket dan batas penggunaan.', auth: 'API key', cost: 'Freemium', useCase: 'Alternatif kurs jika kebutuhan, SLA, dan lisensi sesuai.', docs: 'https://www.exchangerate-api.com/docs/overview', suitability: 'Opsional' },
  { name: 'VATComply', category: 'Pajak & Validasi', description: 'API validasi VAT internasional; cakupannya bukan pengganti aturan PPN Indonesia.', auth: 'Tanpa kunci', cost: 'Perlu evaluasi', useCase: 'Kasus lintas negara tertentu saja; tidak untuk menghitung pajak Indonesia.', docs: 'https://www.vatcomply.com/documentation', suitability: 'Perlu pemeriksaan kebijakan' },
  { name: 'REST Countries', category: 'Referensi Umum', description: 'Informasi negara untuk formulir dan referensi internasional.', auth: 'Tanpa kunci', cost: 'Gratis', useCase: 'Data referensi negara untuk vendor atau dokumen lintas negara.', docs: 'https://restcountries.com/', suitability: 'Opsional' },
  { name: 'JSONPlaceholder', category: 'Pengembangan & QA', description: 'REST API tiruan untuk menguji alur antarmuka tanpa data bisnis nyata.', auth: 'Tanpa kunci', cost: 'Gratis', useCase: 'Mock pengembangan dan pengujian; jangan dipakai untuk transaksi produksi.', docs: 'https://jsonplaceholder.typicode.com/', suitability: 'Direkomendasikan untuk evaluasi' },
  { name: 'OpenAI API', category: 'AI & Otomasi', description: 'API model AI untuk ringkasan, ekstraksi, dan bantuan kerja berbasis kebijakan.', auth: 'API key', cost: 'Perlu evaluasi', useCase: 'Asisten dokumen atau ringkasan setelah kontrol privasi dan biaya tersedia.', docs: 'https://platform.openai.com/docs', suitability: 'Perlu pemeriksaan kebijakan' },
  { name: 'GitHub REST API', category: 'Pengembangan & QA', description: 'API untuk repositori, workflow, isu, dan otomasi siklus pengembangan.', auth: 'OAuth / akun', cost: 'Gratis', useCase: 'Pemantauan pipeline build dan dokumentasi engineering.', docs: 'https://docs.github.com/en/rest', suitability: 'Direkomendasikan untuk evaluasi' },
]

const categories = ['Semua kategori', ...Array.from(new Set(entries.map((entry) => entry.category)))]

export default function APICatalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua kategori')
  const [auth, setAuth] = useState('Semua akses')
  const [showFree, setShowFree] = useState(false)
  const visible = useMemo(() => entries.filter((entry) => {
    const text = [entry.name, entry.description, entry.category, entry.useCase].join(' ').toLowerCase()
    return text.includes(query.toLowerCase())
      && (category === 'Semua kategori' || entry.category === category)
      && (auth === 'Semua akses' || entry.auth === auth)
      && (!showFree || entry.cost === 'Gratis')
  }), [query, category, auth, showFree])

  return <div className="api-catalog">
    <section className="api-hero">
      <div className="api-hero-copy">
        <div className="api-eyebrow"><span/> EKOSISTEM INTEGRASI</div>
        <h1>Katalog API</h1>
        <p>Temukan layanan eksternal yang berpotensi memperkuat alur kerja arsitektur dan konstruksi—dengan seleksi biaya, akses, privasi, dan kesiapan integrasi.</p>
        <div className="api-hero-note"><ShieldCheck size={17}/> Katalog referensi. Belum ada API yang dipanggil atau dikoneksikan otomatis.</div>
      </div>
      <div className="api-hero-mark"><Wifi size={36}/><span>{entries.length} layanan terkurasi</span><small>Untuk evaluasi awal</small></div>
    </section>

    <section className="api-stat-grid">
      <article><span>Referensi terdaftar</span><strong>{entries.length}</strong><small>Kurasi awal untuk NUSA DESIGN</small></article>
      <article><span>Tanpa kunci API</span><strong>{entries.filter(e => e.auth === 'Tanpa kunci').length}</strong><small>Tetap tunduk pada kebijakan pemakaian</small></article>
      <article><span>Potensi domain</span><strong>8</strong><small>Cuaca, peta, lingkungan, AI, dan lainnya</small></article>
    </section>

    <section className="api-controls">
      <label className="api-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari API, kategori, atau kebutuhan..." /></label>
      <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter kategori">{categories.map(c => <option key={c}>{c}</option>)}</select>
      <select value={auth} onChange={e => setAuth(e.target.value)} aria-label="Filter metode akses">{['Semua akses', 'Tanpa kunci', 'API key', 'OAuth / akun', 'Perlu verifikasi'].map(a => <option key={a}>{a}</option>)}</select>
      <label className="api-free-filter"><input type="checkbox" checked={showFree} onChange={e => setShowFree(e.target.checked)}/> Hanya berlabel gratis</label>
    </section>

    <div className="api-results-heading"><div><h2>Direktori layanan</h2><p>{visible.length} dari {entries.length} layanan cocok dengan filter.</p></div><span className="api-source">Inspirasi katalog: public-apis</span></div>
    <section className="api-card-grid">
      {visible.map(entry => <article className="api-card" key={entry.name}>
        <div className="api-card-top"><div className="api-logo">{entry.name.slice(0, 2).toUpperCase()}</div><span className={'api-cost ' + (entry.cost === 'Gratis' ? 'free' : '')}>{entry.cost}</span></div>
        <div className="api-category">{entry.category}</div><h3>{entry.name}</h3><p className="api-description">{entry.description}</p>
        <div className="api-usecase"><Sparkles size={15}/><span>{entry.useCase}</span></div>
        <div className="api-card-meta"><span><KeyRound size={14}/>{entry.auth}</span><span className="api-not-connected"><span/>Belum terhubung</span></div>
        <div className="api-card-bottom"><span className="api-suitability">{entry.suitability}</span><a href={entry.docs} target="_blank" rel="noreferrer">Dokumentasi <ExternalLink size={14}/></a></div>
      </article>)}
      {visible.length === 0 && <div className="api-empty"><Search size={24}/><b>Tidak ada layanan yang cocok</b><span>Coba ubah kata pencarian atau filter.</span></div>}
    </section>
    <section className="api-governance"><div><CheckCircle2 size={19}/><div><b>Gerbang sebelum integrasi produksi</b><p>Validasi lisensi, kebijakan penggunaan, batas kuota, SLA, keamanan data, lokasi pemrosesan, dan biaya. Simpan secret hanya di backend; jangan masukkan data proyek rahasia ke API publik tanpa persetujuan.</p></div></div><a href="https://github.com/marcelscruz/public-apis" target="_blank" rel="noreferrer">Buka repositori sumber <ArrowUpRight size={15}/></a></section>
  </div>
}
