import { http } from './http'

export interface SinfridAccount {
  id: number
  uuid: string | null
  customer_id: number
  type: 'SINGLE' | 'FAMILY' | 'BUSINESS' | 'DUO'
  plan_id: number | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  street: string | null
  zipcode: string | null
  lang_code: string | null
  country_code: string
  activation_date: string | null
  email_confirmed: boolean
  phone_confirmed: boolean
  status: boolean
  last_login_at: string | null
  deactivated_at: string | null
  created_at: string | null
}

export interface SinfridMember {
  id: number
  uuid: string | null
  account_id: number
  ssn: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  street: string | null
  zipcode: string | null
  lang_code: string | null
  country_code: string | null
  email_confirmed: boolean
  phone_confirmed: boolean
  status: boolean
  deactivated_at: string | null
  created_at: string | null
}

export interface SinfridAlarm {
  id: number
  account_id: number
  text: string | null
  severity: string | null
  status: string | null
  category: string | null
  source: string | null
  coachme_available: boolean
  coachme_description: string | null
  date: string | null
  created_at: string | null
}

export type InsuranceProduct = 'id-protect' | 'id-protect-single' | 'id-protect-duo' | 'id-protect-family'
export type InsuranceRelationship = 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'grandparent' | 'grandchild' | 'friend' | 'other'

export interface SinfridPolicy {
  id: string
  uuid: string | null
  customer_id: number
  product: InsuranceProduct
  start_date: string
  end_date: string | null
  partner_reference: string
  relationship: InsuranceRelationship | null
  status: string
  source: string
  created_at: string | null
}

export interface SinfridPolicyPayload {
  product: InsuranceProduct
  start_date: string
  end_date?: string
  relationship?: InsuranceRelationship
}

export interface SinfridAccountPayload {
  first_name?: string
  last_name?: string
  email?: string
  email_confirmed?: boolean
  phone?: string
  phone_confirmed?: boolean
  street?: string
  zipcode?: string
  city?: string
  country_code?: string
  lang_code?: string
  type?: 'SINGLE' | 'FAMILY' | 'BUSINESS' | 'DUO'
  plan_id?: number | null
  status?: boolean
}

export interface SinfridMemberPayload {
  ssn?: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  city?: string
  street?: string
  zipcode?: string
  lang_code?: string
  country_code?: string
}

export function getSinfridAccount(customerId: number): Promise<{ data: SinfridAccount | null }> {
  return http.get<{ data: SinfridAccount | null }>(`/customers/${customerId}/sinfrid`)
}

export function getSinfridMembers(customerId: number): Promise<{ data: SinfridMember[] }> {
  return http.get<{ data: SinfridMember[] }>(`/customers/${customerId}/sinfrid/members`)
}

export function addSinfridMember(customerId: number, payload: SinfridMemberPayload): Promise<{ data: SinfridMember }> {
  return http.post<{ data: SinfridMember }>(`/customers/${customerId}/sinfrid/members`, payload)
}

export function updateSinfridMember(customerId: number, memberId: number, payload: SinfridMemberPayload): Promise<{ data: SinfridMember }> {
  return http.put<{ data: SinfridMember }>(`/customers/${customerId}/sinfrid/members/${memberId}`, payload)
}

export function removeSinfridMember(customerId: number, memberId: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/customers/${customerId}/sinfrid/members/${memberId}`)
}

export function getSinfridAlarms(customerId: number): Promise<{ data: SinfridAlarm[] }> {
  return http.get<{ data: SinfridAlarm[] }>(`/customers/${customerId}/sinfrid/alarms`)
}

export function updateSinfridAccount(customerId: number, payload: SinfridAccountPayload): Promise<{ data: SinfridAccount }> {
  return http.put<{ data: SinfridAccount }>(`/customers/${customerId}/sinfrid`, payload)
}

export function deactivateSinfridAccount(customerId: number): Promise<{ data: SinfridAccount }> {
  return http.post<{ data: SinfridAccount }>(`/customers/${customerId}/sinfrid/deactivate`, {})
}

export function reactivateSinfridAccount(customerId: number): Promise<{ data: SinfridAccount }> {
  return http.post<{ data: SinfridAccount }>(`/customers/${customerId}/sinfrid/reactivate`, {})
}

export function deleteSinfridAccount(customerId: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/customers/${customerId}/sinfrid`)
}

export function getSinfridPolicies(customerId: number): Promise<{ data: SinfridPolicy[] }> {
  return http.get<{ data: SinfridPolicy[] }>(`/customers/${customerId}/sinfrid/policies`)
}

export function createSinfridPolicy(customerId: number, payload: SinfridPolicyPayload): Promise<{ data: SinfridPolicy }> {
  return http.post<{ data: SinfridPolicy }>(`/customers/${customerId}/sinfrid/policies`, payload)
}

export function cancelSinfridPolicy(customerId: number, policyId: string): Promise<{ message: string; data: SinfridPolicy }> {
  return http.post<{ message: string; data: SinfridPolicy }>(`/customers/${customerId}/sinfrid/policies/${policyId}/cancel`, {})
}
