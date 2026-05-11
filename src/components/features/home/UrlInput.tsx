'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, ArrowUp, Loader2 } from 'lucide-react'
import { ApiError, hasAuthToken } from '@/lib/api'
import { createLesson } from '@/lib/lessonsApi'

/** YouTube URL 입력 + 학습자료 생성 요청 컴포넌트 */
export default function UrlInput() {
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    const youtubeUrl = url.trim()
    if (!youtubeUrl || isSubmitting) return
    if (!hasAuthToken()) {
      setError('API token is missing. Add NEXT_PUBLIC_DEV_AUTH_TOKEN or save linko_access_token in localStorage.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const lesson = await createLesson(youtubeUrl)
      router.push(`/lessons/${lesson.lessonId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the lesson.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-xs focus-within:border-primary transition-all">
        <Link2 className="w-5 h-5 text-neutral-400 shrink-0" strokeWidth={1.5} />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https:// ~~"
          className="flex-1 text-sm text-neutral-950 placeholder:text-neutral-400 bg-transparent outline-none"
          disabled={isSubmitting}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !url.trim()}
          className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-700 transition-colors shrink-0 disabled:cursor-not-allowed disabled:bg-neutral-300"
          aria-label="학습자료 생성"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}
