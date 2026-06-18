import { http } from './http'

export type InsurancePolicyStatus = 'ACTIVE' | 'PENDING' | 'CANCELED' | 'EXPIRED'

export type InsuranceProduct =
  | 'id-protect'
  | 'id-protect-single'
  | 'id-protect-duo'
  | 'id-protect-family'

export type InsuranceRelationship =
  | 'self' | 'spouse' | 'child' | 'parent'
  | 'sibling' | 'grandparent' | 'grandchild' | 'friend' | 'other'

export interface InsurancePolicyResource {
  readonly id: string
  readonly uuid: string | null
  readonly customer_id: number
  readonly product: InsuranceProduct | null
  readonly start_date: string | null
  readonly end_date: string | null
  readonly partner_reference: string | null
  readonly relationship: InsuranceRelationship | null
  readonly status: InsurancePolicyStatus
  readonly cancel_reason: string | null
  readonly cancelled_at: string | null
  readonly source: string | null
  readonly created_at: string | null
}

export interface CreateInsurancePolicyRequest {
  product: InsuranceProduct
  start_date: string
  end_date?: string
  relationship?: InsuranceRelationship
}

export interface CancelInsurancePolicyRequest {
  reason: string
}

export function getInsurancePolicies(
  customerId: number,
): Promise<{ data: InsurancePolicyResource[] }> {
  return http.get<{ data: InsurancePolicyResource[] }>(
    `/customers/${customerId}/insurance-policies`,
  )
}

export function createInsurancePolicy(
  customerId: number,
  payload: CreateInsurancePolicyRequest,
): Promise<{ message: string; data: InsurancePolicyResource }> {
  return http.post<{ message: string; data: InsurancePolicyResource }>(
    `/customers/${customerId}/insurance-policies`,
    payload,
  )
}

export function cancelInsurancePolicy(
  customerId: number,
  policyId: string,
  payload: CancelInsurancePolicyRequest,
): Promise<{ message: string; data: InsurancePolicyResource }> {
  return http.post<{ message: string; data: InsurancePolicyResource }>(
    `/customers/${customerId}/insurance-policies/${policyId}/cancel`,
    payload,
  )
}
