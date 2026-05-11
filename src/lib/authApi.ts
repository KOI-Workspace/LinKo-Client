import { apiFetch } from './api'

export interface AuthUser {
  id: number
  email: string
  name: string
  picture?: string | null
}

export interface GoogleLoginResponse {
  access_token: string
  token_type: 'bearer'
  user: AuthUser
}

export function loginWithGoogleIdToken(idToken: string) {
  return apiFetch<GoogleLoginResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  })
}
