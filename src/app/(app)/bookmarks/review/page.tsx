'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useMemo, Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'
import FlashcardTab from '@/components/features/flashcard/FlashcardTab'
import { MOCK_FLASHCARDS } from '@/components/features/flashcard/mockFlashcards'
import { MOCK_SUBTITLES } from '@/components/features/watch/WatchTab'
import { MOCK_DEMO_BOOKMARKS } from '../page'
import type { AnyFlashCard } from '@/components/features/flashcard/flashcard.types'

function ReviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { bookmarks } = useBookmarks()
  
  const tab = (searchParams.get('tab') || 'expression') as 'expression' | 'sentence'
  const initialCardId = searchParams.get('cardId')

  // 데모 데이터 호환
  const allBookmarks = useMemo(() => {
    if (bookmarks.length === 0) return MOCK_DEMO_BOOKMARKS
    return bookmarks
  }, [bookmarks])

  const reviewCards = useMemo(() => {
    const filtered = allBookmarks.filter(b => {
      const type = b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')
      return type === tab
    })

    return filtered.map(bm => {
      // 1. Flashcard 데이터에서 찾기 (가장 정확한 소스)
      const lesson = MOCK_FLASHCARDS[bm.lessonId]
      const sourceCard = lesson?.cards.find(c => c.id === bm.cardId)
      if (sourceCard) return sourceCard

      // 2. 데모 데이터 처리 (ID 매칭을 통해 원본 목데이터 복원)
      if (bm.cardId.startsWith('demo-')) {
        let realSourceId = ''
        let demoLessonId = '3'
        
        if (bm.cardId === 'demo-1') realSourceId = 'fc-3-e1'
        if (bm.cardId === 'demo-2') realSourceId = 'fc-3-e2'
        if (bm.cardId === 'demo-3') { realSourceId = 'fc-4-e1'; demoLessonId = '4' }
        if (bm.cardId === 'demo-4') realSourceId = 'fc-3-1'
        
        if (realSourceId) {
          const realSource = MOCK_FLASHCARDS[demoLessonId]?.cards.find(c => c.id === realSourceId)
          if (realSource) return { ...realSource, id: bm.cardId }
        }

        // 문장 데모 (demo-5)
        if (bm.cardId === 'demo-5') {
          return {
            id: bm.cardId,
            expression: bm.expression,
            meaning: bm.meaning,
            exampleSentence: '',
            exampleTranslation: '',
            video: { youtubeId: 'dQw4w9WgXcQ', startSec: 0, endSec: 5 },
            relatedVideos: []
          } as AnyFlashCard
        }
      }

      // 3. 문장 북마크일 경우 자막 데이터에서 재구성
      const isSentence = bm.type === 'sentence' || bm.cardId.startsWith('sentence-')
      if (isSentence) {
        const lineId = bm.cardId.split('-').pop()
        const line = MOCK_SUBTITLES.find(l => l.id === lineId) || MOCK_SUBTITLES[0]
        return {
          id: bm.cardId,
          expression: bm.expression,
          meaning: bm.meaning,
          exampleSentence: '',
          exampleTranslation: '',
          video: { 
            youtubeId: 'dQw4w9WgXcQ', 
            startSec: line.startSec, 
            endSec: line.endSec 
          },
          relatedVideos: []
        } as AnyFlashCard
      }

      // 4. 찾을 수 없는 경우 최소 데이터
      return {
        id: bm.cardId,
        expression: bm.expression,
        meaning: bm.meaning,
        exampleSentence: bm.exampleSentence,
        exampleTranslation: bm.exampleTranslation,
        video: { youtubeId: 'dQw4w9WgXcQ', startSec: 0, endSec: 10 },
        relatedVideos: []
      } as AnyFlashCard
    })
  }, [allBookmarks, tab])

  const handleClose = () => {
    router.push('/bookmarks')
  }

  return (
    <>
      {/* 표준 헤더 위계 적용 */}
      <div className="shrink-0 border-b border-neutral-100 bg-white">
        <div className="px-8 pt-5 pb-4">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Bookmarks
          </button>
          
          <h1 className="text-lg font-bold text-neutral-950 leading-snug">
            Bookmark Review
          </h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-semibold">
            {tab === 'expression' ? 'Expressions' : 'Sentences'}
          </p>
        </div>
      </div>

      <FlashcardTab 
        overrideCards={reviewCards}
        initialCardId={initialCardId || undefined}
        mode="review"
        onClose={handleClose}
      />
    </>
  )
}

export default function BookmarkReviewPage() {
  return (
    <div className="h-full flex flex-col bg-white">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-sm text-neutral-400 font-medium">Loading review...</div>
        </div>
      }>
        <ReviewContent />
      </Suspense>
    </div>
  )
}
