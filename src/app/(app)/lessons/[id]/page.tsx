'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Captions, PartyPopper, BookOpen } from 'lucide-react'
import { MOCK_LESSONS } from '@/data/mockLessons'
import FlashcardTab from '@/components/features/flashcard/FlashcardTab'
import WatchTab from '@/components/features/watch/WatchTab'
import { MOCK_FLASHCARDS } from '@/components/features/flashcard/mockFlashcards'

type Tab = 'flashcard' | 'watch'

// ─── 완료 모달 ────────────────────────────────────────────────────────────────

function CompletionModal({
  flashcardDone,
  watchDone,
  cardCount,
  onGoFlashcard,
  onGoWatch,
  onDone,
}: {
  flashcardDone: boolean
  watchDone: boolean
  cardCount: number
  onGoFlashcard: () => void
  onGoWatch: () => void
  onDone: () => void
}) {
  const bothDone = flashcardDone && watchDone

  if (bothDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary-50 to-violet-50 px-6 pt-8 pb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-neutral-950 mb-1">Lesson complete!</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              You&apos;ve finished both flashcards and the full video.<br />
              Amazing work — keep the streak going!
            </p>
          </div>
          <div className="px-5 py-5">
            <button
              onClick={onDone}
              className="w-full py-3.5 rounded-xl bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  const justFinishedFlashcard = flashcardDone && !watchDone

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary-50 to-violet-50 px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4">
            {justFinishedFlashcard
              ? <CreditCard className="w-8 h-8 text-primary" strokeWidth={1.5} />
              : <Captions className="w-8 h-8 text-primary" strokeWidth={1.5} />
            }
          </div>
          <h2 className="text-xl font-bold text-neutral-950 mb-1">
            {justFinishedFlashcard ? 'Flashcards done!' : 'Video complete!'}
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            {justFinishedFlashcard
              ? `You reviewed all ${cardCount} cards. Now try watching with subtitles.`
              : 'Great watch! Now study the key expressions with flashcards.'}
          </p>
        </div>
        <div className="px-5 py-5 flex flex-col gap-3">
          <button
            onClick={justFinishedFlashcard ? onGoWatch : onGoFlashcard}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all"
          >
            {justFinishedFlashcard
              ? <><Captions className="w-4 h-4" strokeWidth={1.5} />Watch with Subtitles</>
              : <><CreditCard className="w-4 h-4" strokeWidth={1.5} />Study Flashcards</>
            }
          </button>
          <button
            onClick={onDone}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-all"
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            Back to Lessons
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('flashcard')
  const [flashcardCompleted, setFlashcardCompleted] = useState(false)
  const [watchCompleted, setWatchCompleted] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // URL searchParam으로 초기 탭 결정
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'watch' || tab === 'flashcard') setActiveTab(tab)
  }, [])

  const lesson = MOCK_LESSONS.find((l) => l.id === id)

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
        <p className="text-sm">Lesson not found.</p>
        <button onClick={() => router.push('/lessons')} className="text-sm text-primary hover:underline">
          Back to Lessons
        </button>
      </div>
    )
  }

  const isGenerating = lesson.generationStatus === 'generating'
  const flashcardCardCount = MOCK_FLASHCARDS[id]?.cards.length ?? 0

  const handleFlashcardComplete = () => {
    setFlashcardCompleted(true)
    setShowCompletionModal(true)
  }

  const handleWatchComplete = () => {
    setWatchCompleted(true)
    setShowCompletionModal(true)
  }

  return (
    <>
    {showCompletionModal && (
      <CompletionModal
        flashcardDone={flashcardCompleted}
        watchDone={watchCompleted}
        cardCount={flashcardCardCount}
        onGoFlashcard={() => { setShowCompletionModal(false); setActiveTab('flashcard') }}
        onGoWatch={() => { setShowCompletionModal(false); setActiveTab('watch') }}
        onDone={() => router.push('/lessons')}
      />
    )}
    <div className="flex flex-col h-full min-h-0">

      {/* ── 상단 레슨 정보 + 탭 ── */}
      <div className="shrink-0 border-b border-neutral-100 bg-white">
        {/* 브레드크럼 */}
        <div className="px-8 pt-5 pb-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/lessons')}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My Lessons
          </button>
        </div>

        {/* 레슨 메타 정보 */}
        <div className="px-8 pb-4">
          <h1 className="text-lg font-bold text-neutral-950 leading-snug truncate">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {lesson.channelName && (
              <span className="text-xs text-neutral-400">{lesson.channelName}</span>
            )}
            {lesson.channelName && lesson.date && (
              <span className="text-neutral-200 text-xs">·</span>
            )}
            <span className="text-xs text-neutral-400">{lesson.date}</span>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="px-8 flex items-center gap-1 border-t border-neutral-100">
          {([
            { key: 'flashcard', label: 'Flashcard', icon: CreditCard },
            { key: 'watch',     label: 'Watch',     icon: Captions },
          ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      {isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <p className="text-sm font-medium">Still generating this lesson...</p>
          <p className="text-xs">
            {lesson.minutesLeft != null ? `~${lesson.minutesLeft} min left` : 'Processing...'}
          </p>
        </div>
      ) : activeTab === 'flashcard' ? (
        <FlashcardTab lessonId={id} onComplete={handleFlashcardComplete} />
      ) : (
        <WatchTab lessonId={id} onComplete={handleWatchComplete} />
      )}
    </div>
    </>
  )
}
