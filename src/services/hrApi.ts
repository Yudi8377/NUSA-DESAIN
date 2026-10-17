/**
 * HR API client boundary.
 *
 * The browser never connects to Neon directly. Configure VITE_HR_API_BASE_URL
 * only when a trusted server API with session validation and tenant scoping is deployed.
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

type ApiEnvelope<T> = {
  data: T
  meta?: { requestId?: string }
}

const configuredBase = import.meta.env.VITE_HR_API_BASE_URL?.trim().replace(/\/$/, '')
export const isHrApiConfigured = Boolean(configuredBase)

export class HrApiError extends Error {
  constructor(message: string, public readonly status?: number, public readonly requestId?: string) {
    super(message)
    this.name = 'HrApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!configuredBase) throw new HrApiError('API SDM belum dikonfigurasi.')
  const response = await fetch(`${configuredBase}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  const body = await response.json().catch(() => null) as ApiEnvelope<T> & {
    error?: { message?: string; requestId?: string }
  } | null
  if (!response.ok) {
    throw new HrApiError(
      body?.error?.message || 'Permintaan SDM gagal diproses.',
      response.status,
      body?.error?.requestId,
    )
  }
  if (!body || !('data' in body)) throw new HrApiError('Respons API SDM tidak sesuai kontrak.', response.status)
  return body.data
}

export const hrApi = {
  listEmployees: () => request<HrEmployeeRecord[]>('/api/hr/employees?limit=100'),
  createEmployee: (input: Pick<HrEmployeeRecord, 'employee_number' | 'full_name' | 'department' | 'job_title' | 'employment_type'>) =>
    request<HrEmployeeRecord>('/api/hr/employees', { method: 'POST', body: JSON.stringify(input) }),
}
