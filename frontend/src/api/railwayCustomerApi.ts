import { railwayHttp } from './railwayHttp'
import { CustomerDetail, UpdateCustomerPayload } from './customerApi'

export function getRailwayCustomer(id: number): Promise<{ data: CustomerDetail }> {
  return railwayHttp.get<{ data: CustomerDetail }>(`/customers/${id}`)
}

export function updateRailwayCustomer(
  id: number,
  payload: UpdateCustomerPayload,
): Promise<{ data: CustomerDetail }> {
  return railwayHttp.put<{ data: CustomerDetail }>(`/customers/${id}`, payload)
}
