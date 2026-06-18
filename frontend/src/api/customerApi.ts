import { http } from './http'

export interface Customer {
  readonly id: number
  readonly customer_no: number
  readonly first_name: string
  readonly last_name: string
  readonly email: string
  readonly tel: string
  readonly pers_nr: string
  readonly adress: string
  readonly ort: string
  readonly last_order_date: string | null
  readonly sinfrid_id: string | null
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
  sex: 'male' | 'female' | 'unknown'
  birthdate: string | null
  careof: string | null
  sync: boolean
  credit_check: number | null
  payment_preference: string | null
  delivery_method: string | null
  date_added: string | null
  ltv: number
  order_count: number
  last_order_date: string | null
  do_not_call: boolean
  difficult_customer: boolean
  blocked_fees: string[]
  block_email: boolean
  block_gdpr: boolean
  block_dm: boolean
  reminders: boolean
  household_adults: number | null
  household_children: number | null
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
  readonly data: T[]
  readonly meta: {
    readonly current_page: number
    readonly per_page: number
    readonly total: number
    readonly last_page: number
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
  sex?: 'male' | 'female' | 'unknown'
  birthdate?: string
  careof?: string
  sync?: boolean
  credit_check?: number | null
  payment_preference?: string | null
  delivery_method?: string | null
  do_not_call?: boolean
  difficult_customer?: boolean
  reminders?: boolean
  block_email?: boolean
  block_gdpr?: boolean
  block_dm?: boolean
  blocked_fees?: string[]
  household_adults?: number | null
  household_children?: number | null
}

export function updateCustomer(id: number, payload: UpdateCustomerPayload): Promise<{ message: string; data: CustomerDetail }> {
  return http.put<{ message: string; data: CustomerDetail }>(`/customers/${id}`, payload)
}

export interface BlockedSsnRecord {
  readonly id: number
  readonly ssn: string
  readonly reason: string | null
}

export function blockSsn(ssn: string, reason?: string): Promise<{ message: string; data: BlockedSsnRecord }> {
  return http.post<{ message: string; data: BlockedSsnRecord }>('/customers/blocked-ssn', { ssn, reason: reason || null })
}

export function unblockSsn(id: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/customers/blocked-ssn/${id}`)
}

export function checkBlockedSsn(ssn: string): Promise<BlockedSsnRecord | null> {
  return http.get<PaginatedResponse<BlockedSsnRecord>>(`/customers/blocked-ssn?search=${encodeURIComponent(ssn)}`)
    .then(res => res.data.find(r => r.ssn === ssn) ?? null)
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

export function createComment(customerId: number, payload: CommentPayload): Promise<{ message: string; data: CustomerComment }> {
  return http.post<{ message: string; data: CustomerComment }>(`/customers/${customerId}/comments`, payload)
}

export function updateComment(customerId: number, commentId: number, payload: CommentPayload): Promise<{ message: string; data: CustomerComment }> {
  return http.put<{ message: string; data: CustomerComment }>(`/customers/${customerId}/comments/${commentId}`, payload)
}

export function deleteComment(customerId: number, commentId: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/customers/${customerId}/comments/${commentId}`)
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

export function activateReminder(customerId: number, payload: ActivateReminderPayload): Promise<{ message: string; data: CustomerReminder }> {
  return http.post<{ message: string; data: CustomerReminder }>(`/customers/${customerId}/reminders`, payload)
}

export function deactivateReminder(customerId: number, reminderId: number, reason: DeactivationReason): Promise<{ message: string; data: CustomerReminder }> {
  return http.post<{ message: string; data: CustomerReminder }>(`/customers/${customerId}/reminders/${reminderId}/deactivate`, { reason })
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

export function upsertOrganization(customerId: number, payload: OrganizationPayload): Promise<{ message: string; data: CustomerOrganization }> {
  return http.put<{ message: string; data: CustomerOrganization }>(`/customers/${customerId}/organization`, payload, true)
}

// ── Orders ──────────────────────────────────────────────────────────────────

export interface CustomerOrdersParams {
  page?: number
  per_page?: number
  date_from?: string
  date_to?: string
}

export function getCustomerOrders(
  id: number,
  params: CustomerOrdersParams = {},
): Promise<PaginatedResponse<CustomerOrder>> {
  const { page = 1, per_page = 20, date_from, date_to } = params
  const qs = new URLSearchParams({ page: String(page), per_page: String(per_page) })
  if (date_from) qs.set('date_from', date_from)
  if (date_to) qs.set('date_to', date_to)
  return http.get<PaginatedResponse<CustomerOrder>>(`/customers/${id}/orders?${qs.toString()}`)
}

// ── Orders by state ──────────────────────────────────────────────────────────

export type OrderState = 'approved' | 'rejected' | 'deleted'

export interface CustomerOrderApproved {
  id: number
  date_added: string | null
  date_shipped: string | null
  date_paid: string | null
  total: number
  payment_method: string | null
  ref: string | null
  ref1: string | null
  prod_id: number | null
  subscription_id: number | null
  origin: string | null
  return_type: string | null
  is_processed: boolean
  is_shipped: boolean
  is_paid: boolean
  state: 'approved'
}

export interface CustomerOrderDeleted {
  id: number
  date_added: string | null
  date_shipped: string | null
  date_deleted: string | null
  date_paid: string | null
  total: number
  payment_method: string | null
  ref: string | null
  ref1: string | null
  prod_id: number | null
  subscription_id: number | null
  origin: string | null
  return_type: string | null
  cancel_reason: string | null
  cancel_category: string | null
  cancel_reception: string | null
  state: 'deleted'
}

export type CustomerOrderByState = CustomerOrderApproved | CustomerOrderDeleted

export function getCustomerOrdersByState(
  id: number,
  state: OrderState,
  page = 1,
  perPage = 20,
  dateFrom?: string,
  dateTo?: string,
): Promise<PaginatedResponse<CustomerOrderByState>> {
  const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (dateFrom) qs.set('date_from', dateFrom)
  if (dateTo) qs.set('date_to', dateTo)
  return http.get<PaginatedResponse<CustomerOrderByState>>(
    `/customers/${id}/orders/${state}?${qs.toString()}`,
  )
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export type SubscriptionState = 'approved' | 'deleted'

export interface CustomerSubscription {
  id: number
  active: boolean
  cancel_method: string | null
  cancel_category: string | null
  cancel_reason: string | null
  payment_type: string | null
  remote_id: string | null
  subscription_id: number | null
  next_shipment: string | null
  date_started: string | null
  date_cancelled: string | null
  ref: string | null
  ref1: string | null
}

export function getCustomerSubscriptions(
  id: number,
  state: SubscriptionState,
  page = 1,
  perPage = 20,
): Promise<PaginatedResponse<CustomerSubscription>> {
  return http.get<PaginatedResponse<CustomerSubscription>>(
    `/customers/${id}/subscriptions/${state}?page=${page}&per_page=${perPage}`,
  )
}

/* ── Customer Changes ── */

export interface CustomerChangeField {
  field:     string
  old_value: string | null
  new_value: string | null
}

export interface CustomerChangeBatch {
  batch_id:   number
  action:     string | null
  initiator:  string | null
  changed_at: string | null
  fields:     CustomerChangeField[]
}

export function getCustomerChanges(customerId: number): Promise<{ data: CustomerChangeBatch[] }> {
  return http.get<{ data: CustomerChangeBatch[] }>(`/customers/${customerId}/changes`)
}
