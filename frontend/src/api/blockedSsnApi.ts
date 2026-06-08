import { http } from './http'
import { PaginatedResponse } from './customerApi'

export interface BlockedSsn {
  readonly id: number
  readonly ssn: string
  readonly reason: string | null
  readonly initiator: string | null
  readonly added_by: number | null
  readonly date_added: string | null
}

export interface CreateBlockedSsnPayload {
  ssn: string
  reason?: string
  initiator?: string
  added_by?: number
}

export function getBlockedSsn(params: { search?: string; page?: number; per_page?: number } = {}): Promise<PaginatedResponse<BlockedSsn>> {
  const q = new URLSearchParams()
  if (params.search)   q.set('search', params.search)
  if (params.page)     q.set('page', String(params.page))
  if (params.per_page) q.set('per_page', String(params.per_page))
  return http.get<PaginatedResponse<BlockedSsn>>(`/customers/blocked-ssn?${q.toString()}`)
}

export function createBlockedSsn(payload: CreateBlockedSsnPayload): Promise<{ data: BlockedSsn }> {
  return http.post<{ data: BlockedSsn }>('/customers/blocked-ssn', payload)
}

export function deleteBlockedSsn(id: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/customers/blocked-ssn/${id}`)
}
