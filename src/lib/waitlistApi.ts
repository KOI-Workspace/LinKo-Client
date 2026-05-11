import { apiFetch } from './api'

export interface WaitlistEntry {
  id: number
  user_id: number
  email: string
  name: string
  picture?: string | null
  youtube_url: string
  source: string
  created_at: string
}

export function createWaitlistEntry(youtubeUrl: string) {
  return apiFetch<WaitlistEntry>('/waitlist', {
    method: 'POST',
    body: JSON.stringify({
      youtubeUrl,
      source: 'landing_early_access',
    }),
  })
}
