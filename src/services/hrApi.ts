/**
 * HR API client boundary. Browser requests use short-lived Neon Auth bearer tokens;
 * organization IDs are selectors only and are re-authorized by the API on every request.
 */
export type HrEmployeeRecord = {
  id: string
  employee_number: string
  full_name: string
  department: string
  job_title: string
  employment_status: 'active' | 'on_leave' | 'suspended' | 'terminated'
  employment_type: 'permanent' | 'contract' | 'freelance' | 'intern' | 'daily'
  work_email?: string | null
}
type ApiEnvelope<T> = { data: T; meta?: { requestId?: string } }
const configuredBase = import.meta.env.VITE_HR_API_BASE_URL?.trim().replace(/\/$/, '')
let tokenProvider: (() => Promise<string>) | null = null
let activeOrganizationId: string | null = null
export const isHrApiConfigured = Boolean(configuredBase)
export function configureHrApi(provider: (() => Promise<string>) | null, organizationId: string | null) {
  tokenProvider = provider
  activeOrganizationId = organizationId
}
export class HrApiError extends Error {
  constructor(message: string, public readonly status?: number, public readonly requestId?: string) {
    super(message); this.name = 'HrApiError'
  }
}
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!configuredBase) throw new HrApiError('API SDM belum dikonfigurasi.')
  if (!tokenProvider) throw new HrApiError('Sesi login diperlukan.', 401)
  const token = await tokenProvider()
  if (!token) throw new HrApiError('Sesi login diperlukan.', 401)
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body) headers.set('Content-Type', 'application/json')
  if (activeOrganizationId) headers.set('X-Organization-Id', activeOrganizationId)
  const response = await fetch(`${configuredBase}${path}`, { ...init, headers, cache: 'no-store' })
  const body = await response.json().catch(() => null) as (ApiEnvelope<T> & { error?: { message?: string; requestId?: string } }) | null
  if (!response.ok) throw new HrApiError(body?.error?.message || 'Permintaan API SDM gagal diproses.', response.status, body?.error?.requestId)
  if (!body || !('data' in body)) throw new HrApiError('Respons API SDM tidak sesuai kontrak.', response.status)
  return body.data
}
export const hrApi = {
  listEmployees: () => apiRequest<HrEmployeeRecord[]>('/api/hr/employees?limit=100'),
  createEmployee: (input: Pick<HrEmployeeRecord, 'employee_number' | 'full_name' | 'department' | 'job_title' | 'employment_type'>) =>
    apiRequest<HrEmployeeRecord>('/api/hr/employees', { method: 'POST', body: JSON.stringify(input) }),
}
