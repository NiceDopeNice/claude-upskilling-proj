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

export function getCustomerOrders(
  id: number,
  page = 1,
  perPage = 20,
): Promise<PaginatedResponse<CustomerOrder>> {
  return http.get<PaginatedResponse<CustomerOrder>>(
    `/customers/${id}/orders?page=${page}&per_page=${perPage}`,
  )
}
