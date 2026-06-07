import { useCallback, useEffect, useState } from 'react'

export function useRowsPerPage(rowHeight = 48, overhead = 480) {
  const calc = useCallback(
    () => Math.max(10, Math.floor((window.innerHeight - overhead) / rowHeight)),
    [rowHeight, overhead],
  )
  const [perPage, setPerPage] = useState(calc)
  useEffect(() => {
    const update = () => setPerPage(calc())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [calc])
  return perPage
}
