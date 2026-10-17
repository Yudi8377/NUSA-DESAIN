import { apiRequest } from './hrApi'

export type ProjectRecord = {
  id: string
  code: string
  name: string
  project_type: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  location?: string | null
  start_date?: string | null
  target_end_date?: string | null
  budget_amount: string | number
  progress_percent: string | number
  created_at: string
}
export type ProjectTaskRecord = {
  id: string
  project_id: string
  title: string
  description?: string | null
  status: 'todo' | 'in_progress' | 'blocked' | 'done'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  due_date?: string | null
}
export const projectApi = {
  list: () => apiRequest<ProjectRecord[]>('/api/projects?limit=100'),
  create: (input: { code: string; name: string; project_type: string; location?: string; start_date?: string; target_end_date?: string; budget_amount: number }) =>
    apiRequest<ProjectRecord>('/api/projects', { method: 'POST', body: JSON.stringify(input) }),
  listTasks: (projectId: string) => apiRequest<ProjectTaskRecord[]>(`/api/projects/${projectId}/tasks`),
  createTask: (projectId: string, input: { title: string; description?: string; priority: string; due_date?: string }) =>
    apiRequest<ProjectTaskRecord>(`/api/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(input) }),
}
