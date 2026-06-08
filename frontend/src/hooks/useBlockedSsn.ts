import { useCallback, useEffect, useState } from 'react'
import { BlockedSsn, getBlockedSsn, deleteBlockedSsn } from '@/api/blockedSsnApi'
import { PaginatedResponse } from '@/api/customerApi'

export function useBlockedSsn(perPage: number) {
  const [data, setData]               = useState<PaginatedResponse<BlockedSsn> | null>(null)
  const [loading, setLoading]         = useState(true)
  const [deleting, setDeleting]       = useState(false)
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')

  // reset to first page when perPage changes so we don't land on a non-existent page
  useEffect(() => { setPage(1) }, [perPage])

  const load = useCallback(() => {
    setLoading(true)
    getBlockedSsn({ search, page, per_page: perPage })
      .then(setData)
      .finally(() => setLoading(false))
  }, [search, page, perPage])

  useEffect(() => { load() }, [load])

  // debounce raw input before committing to the search param
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  async function deleteRecord(id: number): Promise<void> {
    setDeleting(true)
    try {
      await deleteBlockedSsn(id)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return {
    data, loading, deleting,
    searchInput, setSearchInput,
    page, setPage,
    refresh: load,
    deleteRecord,
  }
}
