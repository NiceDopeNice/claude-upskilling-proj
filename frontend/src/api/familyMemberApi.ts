import { http } from './http'

export interface FamilyMember {
  id: number
  customer_id: number
  ssn: string | null
  first_name: string
  last_name: string | null
  phone: string | null
  email: string | null
  street: string | null
  zip_code: string | null
  city: string | null
  created_at: string | null
}

export interface FamilyMemberPayload {
  ssn?: string
  first_name: string
  last_name?: string
  phone?: string
  email?: string
  street?: string
  zip_code?: string
  city?: string
}

export function getFamilyMembers(customerId: number): Promise<{ data: FamilyMember[] }> {
  return http.get<{ data: FamilyMember[] }>(`/customers/${customerId}/family-members`)
}

export function createFamilyMember(customerId: number, payload: FamilyMemberPayload): Promise<{ data: FamilyMember }> {
  return http.post<{ data: FamilyMember }>(`/customers/${customerId}/family-members`, payload)
}

export function updateFamilyMember(customerId: number, id: number, payload: FamilyMemberPayload): Promise<{ data: FamilyMember }> {
  return http.put<{ data: FamilyMember }>(`/customers/${customerId}/family-members/${id}`, payload)
}

export function deleteFamilyMember(customerId: number, id: number): Promise<{ message: string }> {
  return http.delete<{ message: string }>(`/customers/${customerId}/family-members/${id}`)
}
