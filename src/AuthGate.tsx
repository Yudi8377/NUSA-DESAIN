import { useCallback, useEffect, useState } from 'react'
import App from './App'
import { authClient, isAuthConfigured } from './auth-client'
import { configureHrApi } from './services/hrApi'
import './auth.css'

type Organization = { id: string; name: string; slug: string; role: string }
type Phase = 'loading' | 'demo' | 'signed-out' | 'workspace' | 'ready' | 'error'

const apiBase = import.meta.env.VITE_HR_API_BASE_URL?.trim().replace(/\/$/, '')

export default function AuthGate() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organizationId, setOrganizationId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const getToken = useCallback(async () => {
    if (!authClient) return ''
    const result = await authClient.token()
    if (result?.error) throw new Error(result.error.message || 'Tidak dapat mengambil token sesi.')
    const token = result?.data?.token
    if (typeof token !== 'string' || !token) throw new Error('Sesi tidak memiliki token akses yang valid.')
    return token
  }, [])

  const apiRequest = useCallback(async (path: string, token: string, init: RequestInit = {}) => {
    if (!apiBase) throw new Error('URL API belum dikonfigurasi pada deployment.')
    const response = await fetch(apiBase + path, {
      ...init,
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
      cache: 'no-store',
    })
    const body = await response.json().catch(() => null) as any
    if (!response.ok) throw new Error(body?.error?.message || `Permintaan gagal (${response.status}).`)
    if (!body || !('data' in body)) throw new Error('Respons API tidak sesuai kontrak.')
    return body.data
  }, [])

  const loadWorkspace = useCallback(async () => {
    if (!authClient) { setPhase('demo'); return }
    if (!apiBase) { setPhase('error'); setMessage('Autentikasi sudah disiapkan, tetapi API backend belum dikonfigurasi. Akses data dinonaktifkan sampai API aman tersedia.'); return }
    const token = await getToken()
    const rows = await apiRequest('/api/organizations', token) as Organization[]
    setOrganizations(rows)
    if (!rows.length) { setPhase('workspace'); return }
    setOrganizationId(rows[0].id)
    setPhase('ready')
  }, [apiRequest, getToken])

  useEffect(() => {
    let active = true
    const initialize = async () => {
      if (!isAuthConfigured || !authClient) { if (active) setPhase('demo'); return }
      try {
        const result = await authClient.getSession()
        if (result?.error) throw new Error(result.error.message || 'Gagal memeriksa sesi.')
        const session = result?.data?.session
        if (!session?.user) { if (active) setPhase('signed-out'); return }
        await loadWorkspace()
      } catch (error) {
        if (active) { setPhase('error'); setMessage(error instanceof Error ? error.message : 'Gagal memuat sesi.') }
      }
    }
    void initialize()
    return () => { active = false }
  }, [loadWorkspace])

  useEffect(() => {
    if (phase === 'ready' && organizationId) {
      configureHrApi(getToken, organizationId)
    } else {
      configureHrApi(null, null)
    }
  }, [phase, organizationId, getToken])

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true); setMessage('')
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email: email.trim(), password, name: fullName.trim() })
        : await authClient.signIn.email({ email: email.trim(), password })
      if (result?.error) throw new Error(result.error.message || 'Autentikasi gagal.')
      const sessionResult = await authClient.getSession()
      if (!sessionResult?.data?.session?.user) {
        setMessage(isSignUp ? 'Pendaftaran dikirim. Verifikasi email Anda, lalu masuk kembali.' : 'Sesi belum aktif. Periksa verifikasi email atau coba masuk kembali.')
        return
      }
      await loadWorkspace()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Autentikasi gagal diproses.')
    } finally { setBusy(false) }
  }

  const createWorkspace = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true); setMessage('')
    try {
      const token = await getToken()
      const created = await apiRequest('/api/organizations', token, { method: 'POST', body: JSON.stringify({ name: workspaceName.trim() }) }) as Organization
      setOrganizations([created]); setOrganizationId(created.id); setPhase('ready')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Workspace gagal dibuat.')
    } finally { setBusy(false) }
  }

  const signOut = async () => {
    setBusy(true)
    try { await authClient?.signOut() } finally {
      configureHrApi(null, null); setOrganizations([]); setOrganizationId(''); setMessage(''); setPhase('signed-out'); setBusy(false)
    }
  }

  if (phase === 'demo') return <><div className="demo-mode-banner"><b>MODE DEMO</b><span>Autentikasi dan API belum dikonfigurasi. Data pada dashboard masih ilustrasi, bukan data perusahaan.</span></div><App /></>
  if (phase === 'loading') return <main className="auth-screen"><div className="auth-card"><div className="auth-brand-mark">ND</div><h1>Menyiapkan ruang kerja</h1><p>Memeriksa sesi dan konfigurasi keamanan NUSA DESIGN…</p></div></main>
  if (phase === 'ready') return <><div className="workspace-session-bar"><span>Workspace aktif: <b>{organizations.find(x => x.id === organizationId)?.name || 'NUSA DESIGN'}</b></span><label>Ganti workspace <select value={organizationId} onChange={e => setOrganizationId(e.target.value)}>{organizations.map(org => <option key={org.id} value={org.id}>{org.name} · {org.role}</option>)}</select></label><button onClick={() => void signOut()} disabled={busy}>Keluar</button></div><App /></>
  if (phase === 'workspace') return <main className="auth-screen"><section className="auth-card"><div className="auth-brand-mark">ND</div><div className="auth-eyebrow">LANGKAH AWAL</div><h1>Buat workspace perusahaan</h1><p>Workspace memisahkan data proyek dan SDM berdasarkan organisasi. Anda akan menjadi pemilik workspace ini.</p><form onSubmit={createWorkspace}><label>Nama perusahaan atau studio<input required maxLength={120} value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="Contoh: Nusa Design Studio" /></label>{message && <div className="auth-message">{message}</div>}<button className="auth-primary" disabled={busy}>{busy ? 'Membuat workspace…' : 'Buat workspace'}</button></form><button className="auth-link" onClick={() => void signOut()}>Keluar dari akun</button></section></main>
  if (phase === 'error') return <main className="auth-screen"><section className="auth-card"><div className="auth-brand-mark">ND</div><div className="auth-eyebrow">KONFIGURASI DIPERLUKAN</div><h1>Workspace belum dapat dibuka</h1><p>{message || 'Layanan belum siap.'}</p><button className="auth-secondary" onClick={() => window.location.reload()}>Coba lagi</button></section></main>
  return <main className="auth-screen"><section className="auth-card"><div className="auth-brand-mark">ND</div><div className="auth-eyebrow">NUSA DESIGN · PROJECT INTELLIGENCE</div><h1>{isSignUp ? 'Buat akun Anda' : 'Selamat datang kembali'}</h1><p>Masuk ke ruang kerja arsitektur, konstruksi, anggaran, dokumen, dan tim proyek Anda.</p><form onSubmit={submitAuth}>{isSignUp && <label>Nama lengkap<input required autoComplete="name" maxLength={160} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama Anda" /></label>}<label>Email<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@perusahaan.com" /></label><label>Kata sandi<input required type="password" minLength={8} autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" /></label>{message && <div className="auth-message">{message}</div>}<button className="auth-primary" disabled={busy}>{busy ? 'Memproses…' : isSignUp ? 'Daftar akun' : 'Masuk ke workspace'}</button></form><div className="auth-switch">{isSignUp ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'} <button className="auth-link" onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}>{isSignUp ? 'Masuk' : 'Buat akun'}</button></div><small className="auth-privacy">Akses data memerlukan token sesi valid dan keanggotaan organisasi aktif.</small></section></main>
}
