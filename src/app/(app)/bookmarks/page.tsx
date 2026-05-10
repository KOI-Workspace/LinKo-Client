'use client'

import { useRouter } from 'next/navigation'
import { Bookmark, Trash2, Volume2, ChevronRight, BookOpen } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'

function speakKorean(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BookmarksPage() {
  const router = useRouter()
  const { bookmarks, removeBookmark } = useBookmarks()

  return (
    <div className="min-h-full">

      {/* 히어로 */}
      <div className="bg-gradient-to-b from-primary-50 to-white px-10 pt-10 pb-10 border-b border-neutral-100">
        <p className="text-xs font-medium text-primary-600 uppercase tracking-widest mb-3">
          Saved
        </p>
        <h1 className="text-3xl font-bold text-neutral-950 leading-tight mb-2">
          Your Bookmarks
        </h1>
        <p className="text-sm text-neutral-500">
          Expressions you saved while studying. Review them anytime.
        </p>
      </div>

      {/* 콘텐츠 */}
      <div className="px-10 py-8">

        {/* 상단 카운트 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" fill="currentColor" />
            <span className="text-sm font-semibold text-neutral-950">
              {bookmarks.length} expression{bookmarks.length !== 1 ? 's' : ''} saved
            </span>
          </div>
        </div>

        {/* 빈 상태 */}
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
              <Bookmark className="w-7 h-7 text-primary-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-neutral-950 mb-1.5">No bookmarks yet</p>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-[200px]">
              Tap &quot;Bookmark&quot; while studying flashcards to save expressions here.
            </p>
            <button
              onClick={() => router.push('/lessons')}
              className="mt-6 flex items-center gap-1.5 px-5 py-2.5 rounded-pill text-sm font-medium bg-neutral-950 text-white hover:bg-neutral-800 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Go to My Lessons
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookmarks.map((b) => (
              <div
                key={b.cardId}
                className="flex items-start gap-5 px-5 py-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                {/* 북마크 아이콘 */}
                <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-primary" fill="currentColor" />
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  {/* 레슨 출처 */}
                  <p className="text-[11px] text-neutral-400 mb-1.5 truncate">{b.lessonTitle}</p>

                  {/* 표현 + 발음 */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-neutral-950">{b.expression}</span>
                    <button
                      onClick={() => speakKorean(b.expression)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-300 hover:text-primary hover:bg-primary-50 transition-colors"
                      title="Play pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 의미 */}
                  <p className="text-sm font-semibold text-primary mb-2">{b.meaning}</p>

                  {/* 예문 */}
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-1">
                    {b.exampleSentence}
                  </p>

                  {/* 저장 날짜 */}
                  <p className="text-[10px] text-neutral-300 mt-2">Saved {formatDate(b.savedAt)}</p>
                </div>

                {/* 우측 액션 */}
                <div className="shrink-0 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => router.push(`/lessons/${b.lessonId}?tab=flashcard`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-50 border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary transition-all"
                  >
                    Review
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeBookmark(b.cardId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
