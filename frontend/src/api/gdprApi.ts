import { http } from './http'
import { PaginatedResponse } from './customerApi'

export type GdprStatus = 'flagged' | 'pending_review' | 'anonymized' | 'restored' | 'rejected'
export type GdprExclusionType = '2y_after_starter' | 'subscription_end'
export type GdprBulkAction = 'unflag' | 'anonymize' | 'restore' | 'reject'

export interface GdprCustomer {
  readonly id: number
  readonly customer_id: number
  readonly customer_name: string
  readonly customer_email: string | null
  readonly status: GdprStatus
  readonly exclusion_type: GdprExclusionType
  readonly flagged_at: string | null
  readonly anonymized_at: string | null
  readonly restored_at: string | null
  readonly requested_by: number | null
  readonly source: 'manual' | 'system'
  readonly created_at: string
  readonly updated_at: string
}

export interface GdprExclusionTypeOption {
  readonly value: GdprExclusionType
  readonly label: string
}

export interface ListGdprParams {
  search?: string
  status?: GdprStatus | ''
  exclusion_type?: GdprExclusionType | ''
  per_page?: number
  page?: number
}

export interface BulkActionResult {
  readonly message: string
  readonly result: {
    readonly success: number
    readonly failed: number
    readonly errors: ReadonlyArray<{ readonly customer_id: number; readonly message: string }>
  }
}

export function getGdprCustomers(params: ListGdprParams): Promise<PaginatedResponse<GdprCustomer>> {
  const query = new URLSearchParams()
  if (params.search)         query.set('search', params.search)
  if (params.status)         query.set('status', params.status)
  if (params.exclusion_type) query.set('exclusion_type', params.exclusion_type)
  if (params.per_page)       query.set('per_page', String(params.per_page))
  if (params.page)           query.set('page', String(params.page))
  return http.get<PaginatedResponse<GdprCustomer>>(`/gdpr?${query.toString()}`)
}

export function getExclusionTypes(): Promise<{ data: GdprExclusionTypeOption[] }> {
  return http.get<{ data: GdprExclusionTypeOption[] }>('/gdpr/exclusion-types')
}

export function flagCustomer(customerId: number, exclusionType: GdprExclusionType): Promise<{ message: string; data: GdprCustomer }> {
  return http.post<{ message: string; data: GdprCustomer }>('/gdpr/flag', {
    customer_id: customerId,
    exclusion_type: exclusionType,
  })
}

export function unflagCustomer(customerId: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/gdpr/${customerId}`)
}

export function anonymizeCustomer(customerId: number): Promise<{ message: string; data: GdprCustomer }> {
  return http.post<{ message: string; data: GdprCustomer }>(`/gdpr/${customerId}/anonymize`, {})
}

export function restoreCustomer(customerId: number): Promise<{ message: string; data: GdprCustomer }> {
  return http.post<{ message: string; data: GdprCustomer }>(`/gdpr/${customerId}/restore`, {})
}

export function rejectCustomer(customerId: number): Promise<{ message: string; data: GdprCustomer }> {
  return http.post<{ message: string; data: GdprCustomer }>(`/gdpr/${customerId}/reject`, {})
}

export function bulkGdprAction(action: GdprBulkAction, customerIds: number[]): Promise<BulkActionResult> {
  return http.post<BulkActionResult>('/gdpr/bulk-action', { action, customer_ids: customerIds })
}
