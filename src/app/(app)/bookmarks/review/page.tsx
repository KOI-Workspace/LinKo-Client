'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useBookmarks } from '@/hooks/useBookmarks'
import FlashcardTab from '@/components/features/flashcard/FlashcardTab'
import { MOCK_FLASHCARDS } from '@/components/features/flashcard/mockFlashcards'
import { MOCK_SUBTITLES } from '@/components/features/watch/WatchTab'
import { MOCK_DEMO_BOOKMARKS } from '../page'
import type { AnyFlashCard } from '@/components/features/flashcard/flashcard.types'

export default function BookmarkReviewPage() {
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
      // 1. Flashcard 데이터에서 찾기
      const lesson = MOCK_FLASHCARDS[bm.lessonId]
      const sourceCard = lesson?.cards.find(c => c.id === bm.cardId)
      if (sourceCard) return sourceCard

      // 2. 문장 북마크일 경우 자막 데이터에서 재구성 (데모 포함)
      const isSentence = bm.type === 'sentence' || bm.cardId.startsWith('sentence-') || bm.cardId.startsWith('demo-5')
      if (isSentence) {
        const lineId = bm.cardId.split('-').pop()
        const line = MOCK_SUBTITLES.find(l => l.id === lineId) || MOCK_SUBTITLES[0] // 못찾으면 첫 자막
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

      // 3. 데모 데이터 중 어미 변형 등이 포함된 경우 (demo-1, 2, 3 등)
      if (bm.cardId.startsWith('demo-')) {
        return {
          id: bm.cardId,
          type: bm.subType === 'ending' ? 'ending' : 'word',
          expression: bm.expression,
          conjugatedForm: bm.expression,
          baseWord: bm.baseWord,
          meaning: bm.meaning,
          ending: '아/어요', // 데모용 임시
          endingMeaning: bm.meaning,
          endingExplanation: 'Demo explanation',
          scriptSentence: bm.exampleSentence,
          scriptTranslation: '',
          conjugationBadges: bm.conjugationBadges || [],
          video: { youtubeId: 'dQw4w9WgXcQ', startSec: 12, endSec: 28 },
          relatedVideos: []
        } as AnyFlashCard
      }

      // 4. 찾을 수 없는 경우 북마크 정보 기반 최소 데이터 생성
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
    <div className="h-full flex flex-col bg-white">
      <FlashcardTab 
        overrideCards={reviewCards}
        initialCardId={initialCardId || undefined}
        mode="review"
        onClose={handleClose}
      />
    </div>
  )
}
