import { useCallback, useEffect, useState } from 'react'
import {
  GdprCustomer, GdprExclusionTypeOption, GdprStatus, GdprExclusionType,
  GdprBulkAction, ListGdprParams, getGdprCustomers, getExclusionTypes,
  anonymizeCustomer, rejectCustomer, restoreCustomer, unflagCustomer, bulkGdprAction,
} from '@/api/gdprApi'
import { PaginatedResponse } from '@/api/customerApi'

export type PendingAction =
  | { type: 'single'; action: 'anonymize' | 'restore' | 'reject' | 'unflag'; customerId: number; customerName: string }
  | { type: 'bulk'; action: GdprBulkAction; customerIds: number[] }

export function useGdpr(perPage: number) {
  const [data, setData]           = useState<PaginatedResponse<GdprCustomer> | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [exclusionTypes, setExclusionTypes] = useState<GdprExclusionTypeOption[]>([])

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<GdprStatus | ''>('')
  const [typeFilter, setTypeFilter]     = useState<GdprExclusionType | ''>('')
  const [page, setPage]                 = useState(1)

  const [selected, setSelected]           = useState<Set<number>>(new Set())
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // reset to first page when perPage changes
  useEffect(() => { setPage(1) }, [perPage])

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params: ListGdprParams = { per_page: perPage, page }
    if (search)       params.search = search
    if (statusFilter) params.status = statusFilter
    if (typeFilter)   params.exclusion_type = typeFilter
    try {
      const res = await getGdprCustomers(params)
      setData(res)
    } catch (err: unknown) {
      // surface fetch failures so the page can render an error state
      setError(err instanceof Error ? err.message : 'Failed to load GDPR records.')
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
    // deselect all if every visible row is already selected
    if (allIds.every(id => selected.has(id))) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(allIds))
  }

  function clearSelected() {
    setSelected(new Set())
  }

  function confirmSingle(
    action: 'anonymize' | 'restore' | 'reject' | 'unflag',
    customerId: number,
    customerName: string,
  ) {
    setPendingAction({ type: 'single', action, customerId, customerName })
  }

  function confirmBulk(action: GdprBulkAction) {
    setPendingAction({ type: 'bulk', action, customerIds: [...selected] })
  }

  function cancelAction() {
    setPendingAction(null)
  }

  async function executeAction(): Promise<void> {
    if (!pendingAction) return
    setActionLoading(true)
    try {
      if (pendingAction.type === 'single') {
        const { action, customerId } = pendingAction
        if (action === 'anonymize') await anonymizeCustomer(customerId)
        else if (action === 'restore') await restoreCustomer(customerId)
        else if (action === 'reject') await rejectCustomer(customerId)
        else if (action === 'unflag') await unflagCustomer(customerId)
      } else {
        await bulkGdprAction(pendingAction.action, pendingAction.customerIds)
        clearSelected()
      }
      fetch()
    } finally {
      setActionLoading(false)
      setPendingAction(null)
    }
  }

  return {
    data, loading, error, exclusionTypes,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    page, setPage,
    selected, toggleSelect, toggleSelectAll, clearSelected,
    pendingAction, actionLoading,
    confirmSingle, confirmBulk, cancelAction, executeAction,
    refresh: fetch,
  }
}
