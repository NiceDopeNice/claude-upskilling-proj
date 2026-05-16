type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const BASE_URL = '/api'

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

  const res = await fetch(`${BASE_URL}${path}`, options)

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error((error as { message?: string }).message ?? 'Request failed')
  }

  // 204 No Content — no body to parse
  if (res.status === 204) return null as T

  return res.json() as Promise<T>
}

export const http = {
  get:    <T = unknown>(path: string) =>                    request<T>('GET', path),
  post:   <T = unknown>(path: string, body: unknown) =>     request<T>('POST', path, body),
  put:    <T = unknown>(path: string, body: unknown) =>     request<T>('PUT', path, body),
  patch:  <T = unknown>(path: string, body: unknown) =>     request<T>('PATCH', path, body),
  delete: <T = unknown>(path: string) =>                    request<T>('DELETE', path),
}
