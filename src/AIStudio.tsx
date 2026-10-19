import { useMemo, useState } from 'react'
import AIOutputSheet from './AIOutputSheet'
import AIGenerationConnector from './AIGenerationConnector'
import { Copy, Image, Film, Box, FileText, Sparkles, WandSparkles, ShieldCheck, Check } from 'lucide-react'

const modes = [
  { id: 'concept', label: 'Konsep arsitektur', detail: 'Alternatif massa dan gaya bangunan', icon: Box },
  { id: 'exterior', label: 'Render eksterior', detail: 'Material, pencahayaan, suasana', icon: Image },
  { id: 'interior', label: 'Render interior', detail: 'Ruang, furnitur, palet material', icon: Sparkles },
  { id: 'video', label: 'Video walkthrough', detail: 'Arahan video presentasi ruang', icon: Film },
  { id: 'presentation', label: 'Materi presentasi', detail: 'Brief visual untuk klien', icon: FileText },
] as const

type ModeId = typeof modes[number]['id']

export default function AIStudio() {
  const [mode, setMode] = useState<ModeId>('concept')
  const [projectName, setProjectName] = useState('Proyek arsitektur baru')
  const [buildingType, setBuildingType] = useState('Gedung komersial')
  const [style, setStyle] = useState('Modern tropis')
  const [location, setLocation] = useState('Indonesia')
  const [notes, setNotes] = useState('')
  const [briefReady, setBriefReady] = useState(false)
  const [copied, setCopied] = useState(false)

  const prompt = useMemo(() => {
    const modeLabel = modes.find((item) => item.id === mode)?.label ?? 'Konsep arsitektur'
    const output = mode === 'video'
      ? 'Susun arahan video walkthrough sinematik dengan urutan ruang, pergerakan kamera yang halus, transisi wajar, dan durasi yang dapat disesuaikan.'
      : mode === 'presentation'
        ? 'Susun arahan visual presentasi klien yang profesional, konsisten, mudah dibaca, dan menampilkan keputusan desain utama.'
        : mode === 'interior'
          ? 'Buat arahan visual interior yang konsisten pada tata ruang, skala furnitur, material, pencahayaan alami, dan suasana.'
          : mode === 'exterior'
            ? 'Buat arahan visual eksterior dengan komposisi arsitektur yang jelas, material realistis, pencahayaan, lanskap, dan konteks lingkungan.'
            : 'Kembangkan beberapa arah konsep massa bangunan dengan proporsi masuk akal, sirkulasi yang terbaca, respons iklim, dan karakter fasad.'
    return [
      'NUSA DESIGN — BRIEF GENERATIF ARSITEKTUR',
      `Nama proyek: ${projectName || 'Belum ditentukan'}`,
      `Jenis bangunan: ${buildingType}`,
      `Gaya desain: ${style}`,
      `Konteks lokasi: ${location || 'Belum ditentukan'}`,
      `Jenis keluaran: ${modeLabel}`,
      '',
      output,
      'Prioritaskan keterbacaan desain, proporsi yang masuk akal, aksesibilitas, keselamatan, respons iklim tropis bila relevan, dan konsistensi antar-view.',
      'Jangan mengarang ukuran teknis, spesifikasi struktur, biaya, atau klaim kepatuhan regulasi. Tandai asumsi yang perlu diverifikasi arsitek/insinyur.',
      notes ? `Catatan tambahan: ${notes}` : '',
      '',
      'Catatan: hasil generatif adalah bahan eksplorasi, bukan gambar kerja, model BIM terverifikasi, atau dokumen konstruksi siap bangun.',
    ].filter(Boolean).join('\n')
  }, [mode, projectName, buildingType, style, location, notes])

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="ai-studio-page">
      <section className="ai-studio-hero">
        <div className="ai-hero-copy">
          <div className="ai-eyebrow"><Sparkles size={14} /> DESIGN INTELLIGENCE / AI STUDIO</div>
          <h1>Studio Generatif Arsitektur</h1>
          <p>Siapkan brief visual untuk eksplorasi konsep, render, dan video proyek dalam alur kerja NUSA DESIGN.</p>
          <div className="ai-hero-tags"><span><ShieldCheck size={13}/> API key tetap di server</span><span><Box size={13}/> Terhubung ke konteks proyek setelah integrasi backend</span></div>
        </div>
        <div className="ai-hero-art" aria-hidden="true">
          <div className="ai-orbit orbit-one"/><div className="ai-orbit orbit-two"/>
          <div className="ai-building-shape"><div/><div/><div/><div/></div>
          <div className="ai-art-label">CONCEPT LAB <span>01 / 05</span></div>
        </div>
      </section>

      <div className="ai-studio-grid">
        <section className="ai-panel ai-setup-panel">
          <div className="ai-panel-heading"><div><span className="ai-step">01</span><h2>Atur brief desain</h2></div><span className="ai-status"><i/> Penyusunan brief</span></div>
          <label className="ai-field">Nama proyek<input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Contoh: Rumah tinggal Cilandak"/></label>
          <div className="ai-field-grid">
            <label className="ai-field">Tipologi bangunan<select value={buildingType} onChange={(event) => setBuildingType(event.target.value)}><option>Gedung komersial</option><option>Rumah tinggal</option><option>Perumahan</option><option>Gedung perkantoran</option><option>Hotel dan hospitality</option><option>Fasilitas pendidikan</option><option>Fasilitas kesehatan</option><option>Gudang dan industri</option><option>Fasilitas publik</option></select></label>
            <label className="ai-field">Gaya desain<select value={style} onChange={(event) => setStyle(event.target.value)}><option>Modern tropis</option><option>Minimalis kontemporer</option><option>Modern klasik</option><option>Industrial</option><option>Biophilic</option><option>Vernakular Indonesia</option><option>Futuristik</option></select></label>
          </div>
          <label className="ai-field">Konteks lokasi<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Kota, iklim, atau kondisi tapak"/></label>
          <label className="ai-field">Catatan desain tambahan<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contoh: lahan memanjang, area hijau, kebutuhan parkir, karakter klien..." rows={4}/></label>
          <div className="ai-form-foot"><span>Brief akan menandai asumsi teknis yang perlu divalidasi.</span><button className="ai-primary-button" onClick={() => setBriefReady(true)}><WandSparkles size={16}/> Susun brief AI</button></div>
        </section>

        <section className="ai-panel ai-mode-panel">
          <div className="ai-panel-heading"><div><span className="ai-step">02</span><h2>Pilih keluaran</h2></div><span className="ai-muted">Pilih satu alur</span></div>
          <div className="ai-mode-list">
            {modes.map((item) => <button key={item.id} className={mode === item.id ? 'ai-mode-card selected' : 'ai-mode-card'} onClick={() => { setMode(item.id); setBriefReady(false) }}><span className="ai-mode-icon"><item.icon size={18}/></span><span className="ai-mode-copy"><b>{item.label}</b><small>{item.detail}</small></span><span className="ai-radio">{mode === item.id ? <Check size={12}/> : null}</span></button>)}
          </div>
          <AIGenerationConnector mode={mode} prompt={prompt} projectName={projectName} />
        </section>
      </div>

      <section className="ai-panel ai-output-panel">
        <div className="ai-panel-heading"><div><span className="ai-step">03</span><h2>{briefReady ? 'Brief siap digunakan' : 'Pratinjau brief'}</h2></div><button className="ai-copy-button" onClick={copyBrief}><Copy size={14}/>{copied ? 'Tersalin' : 'Salin brief'}</button></div>
        <pre className="ai-prompt-preview">{prompt}</pre>
        <div className="ai-output-foot"><span><ShieldCheck size={14}/> Jangan masukkan data rahasia klien ke penyedia AI eksternal tanpa persetujuan.</span><span>{briefReady ? 'Brief berhasil disusun secara lokal' : 'Ubah detail lalu susun brief'}</span></div>
      </section>
      {briefReady && <AIOutputSheet mode={mode} projectName={projectName} buildingType={buildingType} style={style} location={location} notes={notes} />}
    </div>
  )
}
