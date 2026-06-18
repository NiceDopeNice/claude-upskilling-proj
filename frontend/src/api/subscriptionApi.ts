import { http } from './http'

export interface SubscriptionDetail {
  readonly id: number
  readonly active: boolean
  readonly payment_type: string | null
  readonly remote_id: string | null
  readonly subscription_id: number | null
  readonly next_shipment: string | null
  readonly date_started: string | null
  readonly date_cancelled: string | null
  readonly cancel_method: string | null
  readonly cancel_category: string | null
  readonly cancel_reason: string | null
  readonly ref: string | null
  readonly ref1: string | null
  readonly pre_finance_count: number
}

export interface UpdateNextShipmentRequest {
  next_shipment: string
}

export interface DeactivateSubscriptionRequest {
  cancel_reason: string
  cancel_method?: string
  cancel_category?: string
}

export function getSubscription(subId: number): Promise<{ data: SubscriptionDetail }> {
  return http.get<{ data: SubscriptionDetail }>(`/subscriptions/${subId}`)
}

export function updateNextShipment(
  subId: number,
  payload: UpdateNextShipmentRequest,
): Promise<{ message: string }> {
  return http.put<{ message: string }>(`/subscriptions/${subId}/next-shipment`, payload)
}

export function deactivateSubscription(
  subId: number,
  payload: DeactivateSubscriptionRequest,
): Promise<{ message: string }> {
  return http.post<{ message: string }>(`/subscriptions/${subId}/deactivate`, payload)
}
