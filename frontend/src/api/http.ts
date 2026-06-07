import { loadingStore } from '@/lib/loadingStore'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const BASE_URL = import.meta.env.DEV
  ? '/api'
  : `${import.meta.env.VITE_RAILWAY_API_URL}/api`

const MIN_LOADING_MS = 500
const MUTABLE: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE']

async function request<T = unknown>(
  method: HttpMethod,
  path: string,
  body: unknown = null,
  silent = false,
): Promise<T> {
  const fetchOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }

  if (body) fetchOptions.body = JSON.stringify(body)

  const withOverlay = !silent && MUTABLE.includes(method)
  const start = Date.now()

  if (withOverlay) loadingStore.show('Please wait…')

  try {
    const res = await fetch(`${BASE_URL}${path}`, fetchOptions)

    if (withOverlay) {
      const elapsed = Date.now() - start
      if (elapsed < MIN_LOADING_MS) {
        await new Promise(r => setTimeout(r, MIN_LOADING_MS - elapsed))
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error((error as { message?: string }).message ?? 'Request failed')
    }

    if (res.status === 204) return null as T

    return res.json() as Promise<T>
  } finally {
    if (withOverlay) loadingStore.hide()
  }
}

export const http = {
  get:    <T = unknown>(path: string) =>                              request<T>('GET',    path),
  post:   <T = unknown>(path: string, body: unknown, silent = false) => request<T>('POST',   path, body, silent),
  put:    <T = unknown>(path: string, body: unknown, silent = false) => request<T>('PUT',    path, body, silent),
  patch:  <T = unknown>(path: string, body: unknown, silent = false) => request<T>('PATCH',  path, body, silent),
  delete: <T = unknown>(path: string, silent = false) =>               request<T>('DELETE', path, null, silent),
}
