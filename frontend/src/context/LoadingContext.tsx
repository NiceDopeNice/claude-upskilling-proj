import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { loadingStore } from '@/lib/loadingStore'

interface LoadingContextValue {
  show: (message?: string) => void
  hide: () => void
  wrap: <T>(promise: Promise<T>, message?: string) => Promise<T>
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  })

  // Track nested show/hide calls so overlapping async ops don't hide too early
  const depth = useRef(0)

  const show = useCallback((message = 'Loading…') => {
    depth.current++
    setState({ visible: true, message })
  }, [])

  const hide = useCallback(() => {
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setState(s => ({ ...s, visible: false }))
  }, [])

  useEffect(() => {
    loadingStore.register(show, hide)
  }, [show, hide])

  const wrap = useCallback(async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
    show(message)
    try {
      return await promise
    } finally {
      hide()
    }
  }, [show, hide])

  return (
    <LoadingContext.Provider value={{ show, hide, wrap }}>
      {children}
      {state.visible && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card border border-border shadow-xl px-8 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {state.message && (
              <p className="text-sm font-medium text-muted-foreground">{state.message}</p>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used inside <LoadingProvider>')
  return ctx
}
