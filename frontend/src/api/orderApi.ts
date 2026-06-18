import { http } from './http'

export interface OrderAdjustment {
  readonly id: number
  readonly order_id: number
  readonly type: 'fee' | 'discount'
  readonly amount: number
  readonly reason: string | null
  readonly created_at: string | null
}

export interface OrderDetail {
  readonly id: number
  readonly customer_id: number
  readonly customer_name: string | null
  readonly customer_email: string | null
  readonly ref: string | null
  readonly ref1: string | null
  readonly date_added: string | null
  readonly date_shipped: string | null
  readonly date_paid: string | null
  readonly date_purchased: string | null
  readonly total: number
  readonly total_vat: number
  readonly total_excluding_vat: number
  readonly total_with_coupon: number
  readonly coupon: string | null
  readonly payment_method: string | null
  readonly status: 'pending' | 'processed' | 'paid' | 'shipped'
  readonly is_processed: boolean
  readonly is_shipped: boolean
  readonly is_paid: boolean
  readonly prod_id: number | null
  readonly subscription_id: number | null
  readonly invoice_no: string | null
  readonly shipment_center: string | null
  readonly region_code: string | null
  readonly parcel_tracking_id: string | null
  readonly is_pre_financed: boolean
  readonly company_name: string | null
  readonly origin: string | null
  readonly batch: string | null
  readonly cart: unknown
  readonly adjustments: OrderAdjustment[]
}

export interface CancelOrderRequest {
  cancel_reason: string
  cancel_category?: string
  cancel_reception?: string
}

export interface AdjustOrderRequest {
  type: 'fee' | 'discount'
  amount: number
  reason?: string
}

export function getOrder(orderId: number): Promise<{ data: OrderDetail }> {
  return http.get<{ data: OrderDetail }>(`/orders/${orderId}`)
}

export function cancelOrder(
  orderId: number,
  payload: CancelOrderRequest,
): Promise<{ message: string }> {
  return http.post<{ message: string }>(`/orders/${orderId}/cancel`, payload)
}

export function adjustOrder(
  orderId: number,
  payload: AdjustOrderRequest,
): Promise<{ message: string; adjustment: OrderAdjustment }> {
  return http.post<{ message: string; adjustment: OrderAdjustment }>(
    `/orders/${orderId}/adjust`,
    payload,
  )
}
