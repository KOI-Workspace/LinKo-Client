const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api'
const TOKEN_STORAGE_KEY = 'linko_access_token'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function getAuthToken() {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_DEV_AUTH_TOKEN
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || process.env.NEXT_PUBLIC_DEV_AUTH_TOKEN
}

export function hasAuthToken() {
  return Boolean(getAuthToken())
}

export function saveAuthToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = body?.detail
    const message = detail?.message ?? response.statusText
    throw new ApiError(message, response.status, detail?.code)
  }

  return response.json() as Promise<T>
}
