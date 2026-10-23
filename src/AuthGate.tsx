import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(() => new URLSearchParams(window.location.search).has('token'))
  const [showPassword, setShowPassword] = useState(false)

  const getToken = useCallback(async () => {
    if (!authClient) throw new Error('Klien Neon Auth belum dikonfigurasi.')

    // Managed Neon Auth's default client exposes the short-lived application
    // JWT through token() -> { data: { token } }. getSession() returns the
    // Better Auth user/session shape and does not reliably include this JWT.
    const result = await authClient.token()
    if (result?.error) throw new Error(result.error.message || 'Gagal mengambil token Neon Auth.')

    const token = result?.data?.token
    if (typeof token === 'string' && token.split('.').length === 3) return token

    throw new Error('Login berhasil, tetapi Neon Auth tidak mengembalikan JWT aplikasi. Muat ulang halaman dan coba lagi.')
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
    configureHrApi(getToken, rows[0].id)
    setPhase('ready')
  }, [apiRequest, getToken])

  useEffect(() => {
    let active = true
    const initialize = async () => {
      if (!isAuthConfigured || !authClient) { if (active) setPhase('demo'); return }
      try {
        const result = await authClient.getSession()
        if (result?.error) throw new Error(result.error.message || 'Gagal memeriksa sesi.')
        const session = result?.data?.user || result?.data?.session?.user
        if (!session) { if (active) setPhase('signed-out'); return }
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
      if (!authClient) throw new Error('Layanan autentikasi belum dikonfigurasi.')
      if (isForgotPassword) {
        const redirectTo = new URL(window.location.pathname, window.location.origin)
        redirectTo.search = ''
        const result = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: redirectTo.toString() })
        if (result?.error) throw new Error(result.error.message || 'Permintaan reset kata sandi gagal.')
        setMessage('Jika email terdaftar, tautan reset kata sandi akan dikirim. Periksa kotak masuk dan folder spam.')
        return
      }
      if (isResetPassword) {
        const token = new URLSearchParams(window.location.search).get('token')
        if (!token) throw new Error('Token reset tidak ditemukan. Minta tautan reset baru.')
        const result = await authClient.resetPassword({ newPassword: password, token })
        if (result?.error) throw new Error(result.error.message || 'Reset kata sandi gagal.')
        window.history.replaceState({}, '', window.location.pathname)
        setIsResetPassword(false); setIsForgotPassword(false); setIsSignUp(false); setPassword('')
        setMessage('Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.')
        return
      }
      const result = isSignUp
        ? await authClient.signUp.email({ email: email.trim(), password, name: fullName.trim() })
        : await authClient.signIn.email({ email: email.trim(), password })
      if (result?.error) throw new Error(result.error.message || 'Autentikasi gagal.')
      const sessionResult = await authClient.getSession()
      if (!(sessionResult?.data?.user || sessionResult?.data?.session?.user)) {
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
      setOrganizations([created]); setOrganizationId(created.id); configureHrApi(getToken, created.id); setPhase('ready')
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

  if (phase === 'demo') return <><div className="demo-mode-banner"><b>MODE DEMO</b><span>Autentikasi dan API belum dikonfigurasi. Data pada dashboard masih ilustrasi, bukan data perusahaan.</span></div><App key={organizationId} /></>
  if (phase === 'loading') return <main className="auth-screen"><div className="auth-card"><div className="auth-brand-mark">ND</div><h1>Menyiapkan ruang kerja</h1><p>Memeriksa sesi dan konfigurasi keamanan NUSA DESIGN…</p></div></main>
  if (phase === 'ready') return <><div className="workspace-session-bar"><span>Workspace aktif: <b>{organizations.find(x => x.id === organizationId)?.name || 'NUSA DESIGN'}</b></span><label>Ganti workspace <select value={organizationId} onChange={e => { setOrganizationId(e.target.value); configureHrApi(getToken, e.target.value) }}>{organizations.map(org => <option key={org.id} value={org.id}>{org.name} · {org.role}</option>)}</select></label><button onClick={() => void signOut()} disabled={busy}>Keluar</button></div><App /></>
  if (phase === 'workspace') return <main className="auth-screen"><section className="auth-card"><div className="auth-brand-mark">ND</div><div className="auth-eyebrow">LANGKAH AWAL</div><h1>Buat workspace perusahaan</h1><p>Workspace memisahkan data proyek dan SDM berdasarkan organisasi. Anda akan menjadi pemilik workspace ini.</p><form onSubmit={createWorkspace}><label>Nama perusahaan atau studio<input required maxLength={120} value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="Contoh: Nusa Design Studio" /></label>{message && <div className="auth-message">{message}</div>}<button className="auth-primary" disabled={busy}>{busy ? 'Membuat workspace…' : 'Buat workspace'}</button></form><button className="auth-link" onClick={() => void signOut()}>Keluar dari akun</button></section></main>
  if (phase === 'error') return <main className="auth-screen"><section className="auth-card"><div className="auth-brand-mark">ND</div><div className="auth-eyebrow">SESI PERLU DIPERBARUI</div><h1>Workspace belum dapat dibuka</h1><p>{message || 'Layanan belum siap.'}</p><button className="auth-primary" onClick={() => void signOut()} disabled={busy}>{busy ? 'Memperbarui sesi…' : 'Keluar dan masuk kembali'}</button><button className="auth-secondary" onClick={() => window.location.reload()} disabled={busy}>Coba lagi</button></section></main>
  return <main className="auth-screen"><section className="auth-card"><div className="auth-brand-mark">ND</div><div className="auth-eyebrow">NUSA DESIGN · PROJECT INTELLIGENCE</div>
    <h1>{isResetPassword ? 'Buat kata sandi baru' : isForgotPassword ? 'Lupa kata sandi?' : isSignUp ? 'Buat akun Anda' : 'Selamat datang kembali'}</h1>
    <p>{isResetPassword ? 'Masukkan kata sandi baru untuk akun NUSA DESIGN Anda.' : isForgotPassword ? 'Masukkan email akun Anda untuk menerima tautan reset kata sandi.' : 'Masuk ke ruang kerja arsitektur, konstruksi, anggaran, dokumen, dan tim proyek Anda.'}</p>
    <form onSubmit={submitAuth}>
      {isSignUp && !isForgotPassword && !isResetPassword && <label>Nama lengkap<input required autoComplete="name" maxLength={160} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama Anda" /></label>}
      <label>Email<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@perusahaan.com" disabled={isResetPassword} /></label>
      {!isForgotPassword && <label>Kata sandi<div className="auth-password-wrap"><input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete={isSignUp || isResetPassword ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={isResetPassword || isSignUp ? 'Minimal 8 karakter' : 'Kata sandi Anda'} /><button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
      {message && <div className="auth-message" role="status">{message}</div>}
      <button className="auth-primary" disabled={busy}>{busy ? 'Memproses…' : isForgotPassword ? 'Kirim tautan reset' : isResetPassword ? 'Simpan kata sandi baru' : isSignUp ? 'Daftar akun' : 'Masuk ke workspace'}</button>
    </form>
    {!isForgotPassword && !isResetPassword && !isSignUp && <div className="auth-forgot"><button type="button" className="auth-link" onClick={() => { setIsForgotPassword(true); setMessage(''); setPassword('') }}>Lupa akun / kata sandi?</button></div>}
    <div className="auth-switch">{isForgotPassword || isResetPassword ? 'Ingat akun Anda?' : isSignUp ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'} <button type="button" className="auth-link" onClick={() => { if (isResetPassword) window.history.replaceState({}, '', window.location.pathname); setIsForgotPassword(false); setIsResetPassword(false); setIsSignUp(false); setMessage(''); setPassword('') }}>{isForgotPassword || isResetPassword ? 'Kembali ke masuk' : isSignUp ? 'Masuk' : 'Buat akun'}</button></div>
    <small className="auth-privacy">Akses data memerlukan token sesi valid dan keanggotaan organisasi aktif.</small></section></main>
}
