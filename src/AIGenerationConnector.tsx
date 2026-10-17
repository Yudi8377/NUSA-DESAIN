import { useEffect, useState } from 'react'
import { CircleAlert, Download, Image, Film, RefreshCw, Sparkles } from 'lucide-react'

const API_BASE = (((import.meta as unknown as { env?: { VITE_AI_API_URL?: string } }).env?.VITE_AI_API_URL) ?? '').replace(/\/$/, '')
type Props = { mode: string; prompt: string; projectName: string }
type Health = { imageConfigured?: boolean; videoConfigured?: boolean; accessConfigured?: boolean }
type Generation = { error?: string; imageData?: string; imageUrl?: string; requestId?: string; status?: string; videoUrl?: string; revisedPrompt?: string }

export default function AIGenerationConnector({ mode, prompt, projectName }: Props) {
  const [accessCode, setAccessCode] = useState('')
  const [status, setStatus] = useState<'checking'|'ready'|'missing'|'error'>('checking')
  const [statusText, setStatusText] = useState('Memeriksa konektor...')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [image, setImage] = useState('')
  const [video, setVideo] = useState('')
  const [note, setNote] = useState('')

  async function checkConnector() {
    if (!API_BASE) { setStatus('missing'); setStatusText('URL backend belum diatur pada build GitHub Pages.'); return }
    try {
      const response = await fetch(API_BASE + '/api/health')
      if (!response.ok) throw new Error('Health check gagal')
      const health = await response.json() as Health
      const configured = Boolean(health.accessConfigured && (health.imageConfigured || health.videoConfigured))
      setStatus(configured ? 'ready' : 'missing')
      setStatusText(health.imageConfigured || health.videoConfigured
        ? 'Backend aktif · Gambar ' + (health.imageConfigured ? 'siap' : 'belum diatur') + ' · Video ' + (health.videoConfigured ? 'siap' : 'belum diatur')
        : 'Backend aktif, tetapi secret penyedia AI belum dikonfigurasi.')
    } catch {
      setStatus('error'); setStatusText('Backend AI tidak dapat dijangkau. Periksa URL Worker dan deployment.')
    }
  }
  useEffect(() => { void checkConnector() }, [])

  async function generate() {
    setError(''); setImage(''); setVideo(''); setNote('')
    if (!API_BASE) { setError('Backend generasi belum dipasang. Administrator perlu mengatur VITE_AI_API_URL dan men-deploy AI Worker.'); return }
    if (!accessCode.trim()) { setError('Masukkan kode akses Studio AI dari administrator.'); return }
    setBusy(true)
    try {
      const response = await fetch(API_BASE + '/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-ai-studio-code': accessCode },
        body: JSON.stringify({ mode, prompt })
      })
      const result = await response.json() as Generation
      if (!response.ok) throw new Error(result.error || 'Generasi gagal.')
      if (mode !== 'video') {
        const imageResult = result.imageData || result.imageUrl
        if (!imageResult) throw new Error('Provider tidak mengembalikan file gambar.')
        setImage(imageResult)
        setNote(result.revisedPrompt ? 'Prompt revisi provider: ' + result.revisedPrompt : 'Gambar dibuat oleh model AI. Tinjau hasil sebelum digunakan.')
      } else {
        if (!result.requestId) throw new Error('Provider tidak mengembalikan ID pekerjaan video.')
        setNote('Video sedang diproses. Pemeriksaan status berjalan otomatis.')
        let completed = false
        for (let attempt = 0; attempt < 36; attempt++) {
          await new Promise(resolve => window.setTimeout(resolve, 5000))
          const statusResponse = await fetch(API_BASE + '/api/generate/status?id=' + encodeURIComponent(result.requestId as string), { headers: { 'x-ai-studio-code': accessCode } })
          const statusResult = await statusResponse.json() as Generation
          if (!statusResponse.ok) throw new Error(statusResult.error || 'Status video tidak dapat diperiksa.')
          if (statusResult.status === 'COMPLETED' && statusResult.videoUrl) {
            setVideo(statusResult.videoUrl); setNote('Video selesai dibuat. Tinjau sebelum digunakan atau dibagikan.'); completed = true; break
          }
          if (statusResult.status === 'FAILED') throw new Error('Provider gagal membuat video. Coba brief lain.')
        }
        if (!completed) throw new Error('Video masih diproses setelah 3 menit. Periksa kembali nanti.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Generasi gagal. Coba kembali.')
    } finally { setBusy(false) }
  }

  return <section className="ai-generation-panel">
    <div className="ai-generation-status">
      <CircleAlert size={16}/>
      <div><b>{status === 'ready' ? 'Konektor AI terdeteksi' : status === 'checking' ? 'Memeriksa konektor AI' : 'Konektor AI perlu konfigurasi'}</b><p>{statusText}</p></div>
      <button className="ai-copy-button" onClick={() => void checkConnector()} title="Periksa konektor"><RefreshCw size={13}/> Periksa</button>
    </div>
    <label className="ai-field ai-access-field">Kode akses Studio AI
      <input type="password" value={accessCode} onChange={event => setAccessCode(event.target.value)} autoComplete="off" placeholder="Kode akses internal"/>
      <small>Kode tidak disimpan di repository atau browser storage.</small>
    </label>
    <div className="ai-generation-actions">
      <div><b>{mode === 'video' ? 'Video walkthrough AI' : 'Generasi gambar AI'}</b><p>{mode === 'video' ? 'Kirim brief ke provider video yang dikonfigurasi.' : 'Hasilkan gambar konseptual baru dari brief proyek.'}</p></div>
      <button className="ai-primary-button" onClick={() => void generate()} disabled={busy}><Sparkles size={15}/>{busy ? 'Sedang memproses…' : mode === 'video' ? 'Buat video' : 'Hasilkan gambar'}</button>
    </div>
    {error && <div className="ai-generation-error" role="alert">{error}</div>}
    {note && <p className="ai-generation-note">{note}</p>}
    {image && <div className="ai-generated-result"><h3><Image size={15}/> Hasil gambar · {projectName || 'Proyek'}</h3><img src={image} alt={'Hasil generasi AI untuk ' + projectName}/><a href={image} download={'nusa-design-' + mode + '.png'} target="_blank" rel="noreferrer"><Download size={14}/> Buka / simpan gambar</a></div>}
    {video && <div className="ai-generated-result"><h3><Film size={15}/> Hasil video walkthrough</h3><video src={video} controls playsInline/><a href={video} target="_blank" rel="noreferrer"><Download size={14}/> Buka video di tab baru</a></div>}
  </section>
}
