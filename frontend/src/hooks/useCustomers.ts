import { useCallback, useEffect, useRef, useState } from 'react'
import { Customer, ListCustomerParams, PaginatedResponse, getCustomers } from '@/api/customerApi'

const STORAGE_KEY_MODE = 'customerSearchMode'
const STORAGE_KEY_FILTERS = 'customerFilterSearch'

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

const DEFAULT_CHIPS: ChipFilter[] = [
  { key: 'customer_no', label: 'Customer No.', value: '' },
  { key: 'pers_nr',     label: 'SSN',          value: '' },
  { key: 'name',        label: 'Name',          value: '' },
  { key: 'tel',         label: 'Phone',         value: '' },
  { key: 'email',       label: 'Email',         value: '' },
]

const EXTRA_CHIPS: ChipFilter[] = [
  { key: 'adress',            label: 'Address',           value: '' },
  { key: 'alternative_email', label: 'Alternative Email', value: '' },
]

function loadMode(): SearchMode {
  return (localStorage.getItem(STORAGE_KEY_MODE) as SearchMode) || 'simple'
}

function loadChips(): ChipFilter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILTERS)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_CHIPS
}

export function useCustomers() {
  const [mode, setMode] = useState<SearchMode>(loadMode)
  const [simple, setSimple] = useState<SimpleSearch>({ fields: ['name'], term: '' })
  const [chips, setChips] = useState<ChipFilter[]>(loadChips)

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
    setSimple({ fields: ['name'], term: '' })
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

  const availableToAdd = EXTRA_CHIPS.filter(e => !chips.some(c => c.key === e.key))

  // Fetch with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      const params: ListCustomerParams = { page, per_page: perPage }

      if (mode === 'simple') {
        if (simple.term && simple.fields.length > 0) {
          params.search = simple.term
          params.fields = simple.fields
        }
      } else {
        const filters: Record<string, string> = {}
        chips.forEach(c => {
          if (c.value.trim()) filters[c.key] = c.value.trim()
        })
        if (Object.keys(filters).length > 0) params.filters = filters
      }

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
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [mode, simple, chips, page, perPage])

  return {
    mode, switchMode,
    simple, updateSimple, clearSimple,
    chips, updateChip, removeChip, addChip, reorderChips,
    availableToAdd,
    page, setPage,
    perPage, setPerPage,
    data, loading, error,
  }
}
