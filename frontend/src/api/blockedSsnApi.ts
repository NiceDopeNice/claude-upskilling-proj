import { http } from './http'

export interface BlockedSsn {
  id: number
  ssn: string
  reason: string | null
  initiator: string | null
  added_by: number | null
  date_added: string | null
}

export interface BlockedSsnMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface BlockedSsnListResponse {
  data: BlockedSsn[]
  meta: BlockedSsnMeta
}

export interface CreateBlockedSsnPayload {
  ssn: string
  reason?: string
  initiator?: string
  added_by?: number
}

export function getBlockedSsn(params: { search?: string; page?: number; per_page?: number } = {}): Promise<BlockedSsnListResponse> {
  const q = new URLSearchParams()
  if (params.search)   q.set('search', params.search)
  if (params.page)     q.set('page', String(params.page))
  if (params.per_page) q.set('per_page', String(params.per_page))
  return http.get<BlockedSsnListResponse>(`/customers/blocked-ssn?${q.toString()}`)
}

export function createBlockedSsn(payload: CreateBlockedSsnPayload): Promise<{ data: BlockedSsn }> {
  return http.post<{ data: BlockedSsn }>('/customers/blocked-ssn', payload)
}

export function deleteBlockedSsn(id: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/customers/blocked-ssn/${id}`)
}
