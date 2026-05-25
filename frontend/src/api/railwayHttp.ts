type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// In dev use the Vite proxy (avoids CORS); in prod use the full Railway URL
const RAILWAY_BASE = import.meta.env.DEV
  ? '/railway-api'
  : `${import.meta.env.VITE_RAILWAY_API_URL}/api`

async function request<T = unknown>(
  method: HttpMethod,
  path: string,
  body: unknown = null,
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }

  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${RAILWAY_BASE}${path}`, options)

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error((error as { message?: string }).message ?? 'Request failed')
  }

  if (res.status === 204) return null as T

  return res.json() as Promise<T>
}

export const railwayHttp = {
  get:   <T = unknown>(path: string) =>                    request<T>('GET', path),
  put:   <T = unknown>(path: string, body: unknown) =>     request<T>('PUT', path, body),
  post:  <T = unknown>(path: string, body: unknown) =>     request<T>('POST', path, body),
  delete:<T = unknown>(path: string) =>                    request<T>('DELETE', path),
}
