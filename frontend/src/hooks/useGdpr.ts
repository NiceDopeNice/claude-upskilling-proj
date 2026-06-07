import { useCallback, useEffect, useState } from 'react'
import {
  GdprCustomer, GdprExclusionTypeOption, GdprStatus, GdprExclusionType,
  ListGdprParams, getGdprCustomers, getExclusionTypes,
} from '@/api/gdprApi'
import { PaginatedResponse } from '@/api/customerApi'

export function useGdpr(perPage: number) {
  const [data, setData]       = useState<PaginatedResponse<GdprCustomer> | null>(null)
  const [loading, setLoading] = useState(false)
  const [exclusionTypes, setExclusionTypes] = useState<GdprExclusionTypeOption[]>([])

  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<GdprStatus | ''>('')
  const [typeFilter, setTypeFilter]       = useState<GdprExclusionType | ''>('')
  const [page, setPage]                   = useState(1)

  useEffect(() => { setPage(1) }, [perPage])

  const [selected, setSelected] = useState<Set<number>>(new Set())

  const fetch = useCallback(async () => {
    setLoading(true)
    const params: ListGdprParams = { per_page: perPage, page }
    if (search)       params.search = search
    if (statusFilter) params.status = statusFilter
    if (typeFilter)   params.exclusion_type = typeFilter
    try {
      const res = await getGdprCustomers(params)
      setData(res)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, typeFilter, page, perPage])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    getExclusionTypes().then(r => setExclusionTypes(r.data)).catch(() => {})
  }, [])

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (!data) return
    const allIds = data.data.map(r => r.customer_id)
    if (allIds.every(id => selected.has(id))) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  function clearSelected() {
    setSelected(new Set())
  }

  return {
    data, loading, exclusionTypes,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    page, setPage,
    selected, toggleSelect, toggleSelectAll, clearSelected,
    refresh: fetch,
  }
}
