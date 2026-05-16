import { useCallback, useEffect, useRef, useState } from 'react'
import { Customer, ListCustomerParams, PaginatedResponse, getCustomers } from '@/api/customerApi'

const STORAGE_KEY_MODE = 'customerSearchMode'
const STORAGE_KEY_FILTERS = 'customerFilterSearch'
const STORAGE_KEY_LAST_VIEWED = 'customerLastViewed'
const STORAGE_KEY_VERSION = 'customerChipsVersion'
const CHIPS_VERSION = '2'
const MAX_LAST_VIEWED = 50

type SearchMode = 'simple' | 'multi'

interface SimpleSearch {
  fields: string[]
  term: string
}

interface ChipFilter {
  key: string
  label: string
  value: string
}

const ALL_CHIP_DEFS: Omit<ChipFilter, 'value'>[] = [
  { key: 'customer_no',       label: 'Customer No.'      },
  { key: 'order_no',          label: 'Order No.'         },
  { key: 'name',              label: 'Name'              },
  { key: 'tel',               label: 'Telephone'         },
  { key: 'email',             label: 'Email'             },
  { key: 'pers_nr',           label: 'SSN'               },
  { key: 'adress',            label: 'Address'           },
  { key: 'sinfrid_id',        label: 'Sinfrid ID'        },
  { key: 'alternative_email', label: 'Alternative Email' },
]

const DEFAULT_CHIPS: ChipFilter[] = ALL_CHIP_DEFS.map(c => ({ ...c, value: '' }))

function loadMode(): SearchMode {
  return (localStorage.getItem(STORAGE_KEY_MODE) as SearchMode) || 'simple'
}

function loadChips(): ChipFilter[] {
  try {
    if (localStorage.getItem(STORAGE_KEY_VERSION) !== CHIPS_VERSION) {
      localStorage.setItem(STORAGE_KEY_VERSION, CHIPS_VERSION)
      localStorage.removeItem(STORAGE_KEY_FILTERS)
      return DEFAULT_CHIPS
    }
    const raw = localStorage.getItem(STORAGE_KEY_FILTERS)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_CHIPS
}

function loadLastViewedIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_VIEWED)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function useCustomers() {
  const [mode, setMode] = useState<SearchMode>(loadMode)
  const [simple, setSimple] = useState<SimpleSearch>({ fields: ['name', 'customer_no', 'order_no', 'tel'], term: '' })
  const [chips, setChips] = useState<ChipFilter[]>(loadChips)
  const [lastViewedIds] = useState<number[]>(loadLastViewedIds)
  const lastViewedIdsRef = useRef(lastViewedIds)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)

  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const switchMode = useCallback((next: SearchMode) => {
    setMode(next)
    localStorage.setItem(STORAGE_KEY_MODE, next)
    setPage(1)
  }, [])

  const updateSimple = useCallback((patch: Partial<SimpleSearch>) => {
    setSimple(prev => ({ ...prev, ...patch }))
    setPage(1)
  }, [])

  const clearSimple = useCallback(() => {
    setSimple({ fields: ['name', 'customer_no', 'order_no', 'tel'], term: '' })
    setPage(1)
  }, [])

  const updateChip = useCallback((key: string, value: string) => {
    setChips(prev => {
      const next = prev.map(c => (c.key === key ? { ...c, value } : c))
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(next))
      return next
    })
    setPage(1)
  }, [])

  const removeChip = useCallback((key: string) => {
    setChips(prev => {
      const next = prev.filter(c => c.key !== key)
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(next))
      return next
    })
  }, [])

  const addChip = useCallback((chip: Omit<ChipFilter, 'value'>) => {
    setChips(prev => {
      if (prev.some(c => c.key === chip.key)) return prev
      const next = [...prev, { ...chip, value: '' }]
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(next))
      return next
    })
  }, [])

  const reorderChips = useCallback((newOrder: ChipFilter[]) => {
    setChips(newOrder)
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(newOrder))
  }, [])

  const availableToAdd = ALL_CHIP_DEFS.filter(e => !chips.some(c => c.key === e.key))

  const trackView = useCallback((id: number) => {
    const next = [id, ...lastViewedIdsRef.current.filter(i => i !== id)].slice(0, MAX_LAST_VIEWED)
    lastViewedIdsRef.current = next
    localStorage.setItem(STORAGE_KEY_LAST_VIEWED, JSON.stringify(next))
  }, [])

  const hasSearch = mode === 'simple'
    ? simple.term.trim().length > 0 && simple.fields.length > 0
    : chips.some(c => c.value.trim().length > 0)

  // Show recently viewed when idle and the user has history; otherwise show the default full list
  const isLastViewed = !hasSearch && lastViewedIds.length > 0

  const activeFilters: Record<string, string> = {}
  if (mode === 'multi') {
    chips.forEach(c => { if (c.value.trim()) activeFilters[c.key] = c.value.trim() })
  }

  // Fetch with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const delay = hasSearch ? 300 : 0

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      const params: ListCustomerParams = { page, per_page: perPage }

      if (isLastViewed) {
        params.ids = lastViewedIds
      } else if (hasSearch) {
        if (mode === 'simple') {
          params.search = simple.term
          params.fields = simple.fields
        } else {
          if (Object.keys(activeFilters).length > 0) params.filters = activeFilters
        }
      }
      // else: no search, no history → fetch all (default list)

      try {
        const [result] = await Promise.all([
          getCustomers(params),
          new Promise<void>(resolve => setTimeout(resolve, 500)),
        ])
        setData(result)
      } catch {
        setError('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }, delay)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [mode, simple, chips, page, perPage, hasSearch, isLastViewed])

  return {
    mode, switchMode,
    simple, updateSimple, clearSimple,
    chips, updateChip, removeChip, addChip, reorderChips,
    availableToAdd,
    trackView,
    hasSearch,
    isLastViewed,
    activeFilters,
    page, setPage,
    perPage, setPerPage,
    data, loading, error,
  }
}
