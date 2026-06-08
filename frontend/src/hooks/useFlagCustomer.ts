import { useState } from 'react'
import { GdprExclusionType, flagCustomer } from '@/api/gdprApi'
import { Customer, getCustomers } from '@/api/customerApi'

export function useFlagCustomer(onSuccess: () => void) {
  const [search, setSearch]               = useState('')
  const [results, setResults]             = useState<Customer[]>([])
  const [searching, setSearching]         = useState(false)
  const [selected, setSelected]           = useState<Customer | null>(null)
  const [exclusionType, setExclusionType] = useState<GdprExclusionType | ''>('')
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  async function searchCustomers(): Promise<void> {
    if (!search.trim()) return
    setSearching(true)
    setResults([])
    setSelected(null)
    try {
      const res = await getCustomers({ search, fields: ['name', 'email', 'customer_no'], per_page: 10 })
      setResults(res.data)
    } finally {
      setSearching(false)
    }
  }

  async function submit(): Promise<void> {
    if (!selected || !exclusionType) return
    setSubmitting(true)
    setError(null)
    try {
      await flagCustomer(selected.id, exclusionType as GdprExclusionType)
      reset()
      onSuccess()
    } catch (err: unknown) {
      // surface the API error message; fall back to a generic string
      setError(err instanceof Error ? err.message : 'Failed to flag customer.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset(): void {
    setSearch('')
    setResults([])
    setSelected(null)
    setExclusionType('')
    setError(null)
  }

  return {
    search, setSearch,
    results,
    searching,
    selected, setSelected,
    exclusionType, setExclusionType,
    submitting,
    error,
    searchCustomers,
    submit,
    reset,
  }
}
