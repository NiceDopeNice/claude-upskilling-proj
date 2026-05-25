import { http } from './http'

export interface Customer {
  id: number
  customer_no: number
  first_name: string
  last_name: string
  email: string
  tel: string
  pers_nr: string
  adress: string
  ort: string
  last_order_date: string | null
  sinfrid_id: string | null
}

export interface CustomerDetail {
  id: number
  customer_no: number
  first_name: string
  last_name: string
  email: string
  alternative_email: string | null
  tel: string
  alternative_tel: string | null
  pers_nr: string
  adress: string
  post_nr: string | null
  ort: string
  region_code: string | null
  date_added: string | null
  ltv: number
  order_count: number
  last_order_date: string | null
  do_not_call: boolean
  difficult_customer: boolean
  blocked_fees: boolean
  block_email: boolean
  block_gdpr: boolean
  block_dm: boolean
}

export interface CustomerOrder {
  id: number
  date_added: string | null
  date_shipped: string | null
  date_paid: string | null
  total: number
  payment_method: string | null
  status: 'pending' | 'processed' | 'paid' | 'shipped'
  ref: string | null
  prod_id: number | null
  subscription_id: number | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ListCustomerParams {
  search?: string
  field?: string
  fields?: string[]
  filters?: Record<string, string>
  ids?: number[]
  per_page?: number
  page?: number
}

export function getCustomers(params: ListCustomerParams): Promise<PaginatedResponse<Customer>> {
  const query = new URLSearchParams()

  if (params.search) query.set('search', params.search)
  if (params.field) query.set('field', params.field)
  if (params.fields && params.fields.length > 0) {
    params.fields.forEach(f => query.append('fields[]', f))
  }
  if (params.ids && params.ids.length > 0) {
    params.ids.forEach(id => query.append('ids[]', String(id)))
  }
  if (params.per_page) query.set('per_page', String(params.per_page))
  if (params.page) query.set('page', String(params.page))

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, val]) => {
      if (val) query.set(`filters[${key}]`, val)
    })
  }

  return http.get<PaginatedResponse<Customer>>(`/customers?${query.toString()}`)
}

export function getCustomer(id: number): Promise<{ data: CustomerDetail }> {
  return http.get<{ data: CustomerDetail }>(`/customers/${id}`)
}

export interface UpdateCustomerPayload {
  first_name?: string
  last_name?: string
  email?: string
  alternative_email?: string
  tel?: string
  alternative_tel?: string
  pers_nr?: string
  adress?: string
  post_nr?: string
  ort?: string
  region_code?: string
  do_not_call?: boolean
  difficult_customer?: boolean
  block_email?: boolean
  block_gdpr?: boolean
  block_dm?: boolean
}

export function updateCustomer(id: number, payload: UpdateCustomerPayload): Promise<{ data: CustomerDetail }> {
  return http.put<{ data: CustomerDetail }>(`/customers/${id}`, payload)
}

export interface CustomerComment {
  id: number
  customer_id: number
  message: string
  brand: string | null
  initiator: string | null
  created_at: string
  updated_at: string
}

export interface CommentPayload {
  message: string
  brand?: string
  initiator?: string
}

export function getComments(customerId: number): Promise<{ data: CustomerComment[] }> {
  return http.get<{ data: CustomerComment[] }>(`/customers/${customerId}/comments`)
}

export function createComment(customerId: number, payload: CommentPayload): Promise<{ data: CustomerComment }> {
  return http.post<{ data: CustomerComment }>(`/customers/${customerId}/comments`, payload)
}

export function updateComment(customerId: number, commentId: number, payload: CommentPayload): Promise<{ data: CustomerComment }> {
  return http.put<{ data: CustomerComment }>(`/customers/${customerId}/comments/${commentId}`, payload)
}

export function deleteComment(customerId: number, commentId: number): Promise<null> {
  return http.delete<null>(`/customers/${customerId}/comments/${commentId}`)
}

// ── Reminders ──────────────────────────────────────────────────────────────

export interface CustomerReminderType {
  code: string
  label_en: string
  label_sv: string
  default_interval_months: number
  min_interval_months: number
  max_interval_months: number
  supported_brands: string[]
  status: boolean
}

export type DeactivationReason =
  | 'agent'
  | 'customer_sms_stop'
  | 'customer_email_unsubscribe'
  | 'subscription_churn'
  | 'gdpr_flag'
  | 'contact_unreachable'

export interface CustomerReminder {
  id: number
  customer_id: number
  type_code: string
  brand: string
  send_sms: boolean
  send_email: boolean
  interval_months: number
  start_date: string
  next_reminder_at: string | null
  is_active: boolean
  last_sent_at: string | null
  last_send_status: 'success' | 'partial' | 'failed' | null
  consecutive_failures: number
  deactivated_at: string | null
  deactivated_reason: DeactivationReason | null
  type: CustomerReminderType | null
  created_at: string
  updated_at: string
}

export interface ReminderSend {
  id: number
  reminder_id: number
  channel: 'sms' | 'email'
  sent_at: string
  status: 'success' | 'failed' | 'skipped'
  skip_reason: string | null
  provider_message_id: string | null
  error_message: string | null
  created_at: string
}

export interface ActivateReminderPayload {
  type_code: string
  brand: string
  send_sms: boolean
  send_email: boolean
  interval_months: number
  start_date: string
}

export function getReminderTypes(): Promise<{ data: CustomerReminderType[] }> {
  return http.get<{ data: CustomerReminderType[] }>('/customers/reminder-types')
}

export function getReminders(customerId: number): Promise<{ data: CustomerReminder[] }> {
  return http.get<{ data: CustomerReminder[] }>(`/customers/${customerId}/reminders`)
}

export function activateReminder(customerId: number, payload: ActivateReminderPayload): Promise<{ data: CustomerReminder }> {
  return http.post<{ data: CustomerReminder }>(`/customers/${customerId}/reminders`, payload)
}

export function deactivateReminder(customerId: number, reminderId: number, reason: DeactivationReason): Promise<{ data: CustomerReminder }> {
  return http.post<{ data: CustomerReminder }>(`/customers/${customerId}/reminders/${reminderId}/deactivate`, { reason })
}

export function getReminderSends(customerId: number, reminderId: number): Promise<{ data: ReminderSend[] }> {
  return http.get<{ data: ReminderSend[] }>(`/customers/${customerId}/reminders/${reminderId}/sends`)
}

// ── Organization ────────────────────────────────────────────────────────────

export interface CustomerOrganization {
  id: string
  name: string | null
  contact_email: string | null
  invoice_email: string | null
  created_at: string | null
  updated_at: string | null
}

export interface OrganizationPayload {
  id: string
  name?: string
  contact_email?: string
  invoice_email?: string
}

export function getOrganization(customerId: number): Promise<{ data: CustomerOrganization | null }> {
  return http.get<{ data: CustomerOrganization | null }>(`/customers/${customerId}/organization`)
}

export function upsertOrganization(customerId: number, payload: OrganizationPayload): Promise<{ data: CustomerOrganization }> {
  return http.put<{ data: CustomerOrganization }>(`/customers/${customerId}/organization`, payload)
}

// ── Orders ──────────────────────────────────────────────────────────────────

export function getCustomerOrders(
  id: number,
  page = 1,
  perPage = 20,
): Promise<PaginatedResponse<CustomerOrder>> {
  return http.get<PaginatedResponse<CustomerOrder>>(
    `/customers/${id}/orders?page=${page}&per_page=${perPage}`,
  )
}
