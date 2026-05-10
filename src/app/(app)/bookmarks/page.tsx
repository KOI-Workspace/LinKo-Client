'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Trash2, Volume2, ChevronRight, BookOpen, Quote, Sparkles, Languages } from 'lucide-react'
import { useBookmarks, BookmarkedCard } from '@/hooks/useBookmarks'

type Tab = 'expression' | 'sentence'
type SubTab = 'all' | 'word' | 'ending'

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
  const [activeTab, setActiveTab] = useState<Tab>('expression')
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('all')

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      // 구버전 북마크(type 없음) 호환성 처리
      const type = b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')
      const subType = b.subType || (b.cardId.includes('-e') ? 'ending' : 'word') 

      if (activeTab === 'sentence') {
        return type === 'sentence'
      }

      if (type !== 'expression') return false
      if (activeSubTab === 'all') return true
      return subType === activeSubTab
    })
  }, [bookmarks, activeTab, activeSubTab])

  const counts = useMemo(() => {
    const exprs = bookmarks.filter(b => (b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')) === 'expression')
    const sents = bookmarks.filter(b => (b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')) === 'sentence')
    return {
      expression: exprs.length,
      sentence: sents.length,
      word: exprs.filter(b => (b.subType || (b.cardId.includes('-e') ? 'ending' : 'word')) === 'word').length,
      ending: exprs.filter(b => (b.subType || (b.cardId.includes('-e') ? 'ending' : 'word')) === 'ending').length,
    }
  }, [bookmarks])

  return (
    <div className="min-h-full bg-white">

      {/* 히어로 */}
      <div className="bg-gradient-to-b from-primary-50 to-white px-10 pt-10 pb-2 border-b border-neutral-100">
        <p className="text-xs font-medium text-primary-600 uppercase tracking-widest mb-3">
          Saved Library
        </p>
        <h1 className="text-3xl font-bold text-neutral-950 leading-tight mb-6">
          Review your saved
          <br />
          Korean expressions
        </h1>

        {/* 메인 탭 */}
        <div className="flex gap-8 border-b border-neutral-100">
          <button
            onClick={() => { setActiveTab('expression'); setActiveSubTab('all') }}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'expression' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Expressions
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
              {counts.expression}
            </span>
            {activeTab === 'expression' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sentence')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'sentence' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Sentences
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
              {counts.sentence}
            </span>
            {activeTab === 'sentence' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 서브 필터 (표현 탭일 때만) */}
      {activeTab === 'expression' && (
        <div className="px-10 py-5 flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSubTab === 'all'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveSubTab('word')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubTab === 'word'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Vocabulary
          </button>
          <button
            onClick={() => setActiveSubTab('ending')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubTab === 'ending'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300'
            }`}
          >
            <Languages className="w-3 h-3" />
            Endings
          </button>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className={`px-10 ${activeTab === 'sentence' ? 'py-8' : 'pb-10'}`}>

        {/* 빈 상태 */}
        {filteredBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-5">
              <Bookmark className="w-7 h-7 text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-neutral-950 mb-1.5">
              No {activeTab === 'expression' ? 'expressions' : 'sentences'} found
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-[220px]">
              {activeTab === 'expression'
                ? "Start saving words and phrases from your lessons."
                : "Bookmark entire sentences while watching videos to see them here."}
            </p>
            <button
              onClick={() => router.push('/lessons')}
              className="mt-8 flex items-center gap-1.5 px-6 py-2.5 rounded-pill text-sm font-medium bg-neutral-950 text-white hover:bg-neutral-800 transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              Go to My Lessons
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBookmarks.map((b) => (
              <BookmarkCard
                key={b.cardId}
                bookmark={b}
                onRemove={() => removeBookmark(b.cardId)}
                onReview={() => router.push(`/lessons/${b.lessonId}?tab=${(b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')) === 'sentence' ? 'watch' : 'flashcard'}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookmarkCard({
  bookmark: b,
  onRemove,
  onReview
}: {
  bookmark: BookmarkedCard,
  onRemove: () => void,
  onReview: () => void
}) {
  const isSentence = (b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')) === 'sentence'
  const isEnding = (b.subType || (b.cardId.includes('-e') ? 'ending' : 'word')) === 'ending'

  return (
    <div className="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-primary-200 hover:shadow-sm transition-all">
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1.5">
             {/* 배지/카테고리 */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                isSentence ? 'bg-blue-50 text-blue-600' : isEnding ? 'bg-amber-50 text-amber-600' : 'bg-primary-50 text-primary-600'
              }`}>
                {isSentence ? 'Sentence' : isEnding ? 'Ending' : 'Vocabulary'}
              </span>
              <span className="text-[10px] text-neutral-300 font-medium">•</span>
              <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[150px]">
                {b.lessonTitle}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 메인 텍스트 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-neutral-950 leading-tight truncate ${isSentence ? 'text-sm' : 'text-lg'}`}>
              {b.expression}
            </h3>
            <p className="text-sm font-medium text-primary mt-1 truncate">
              {b.meaning}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); speakKorean(b.expression); }}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 hover:text-primary hover:bg-primary-50 transition-all"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* 예문 */}
        {!isSentence && (
          <div className="bg-neutral-50/50 rounded-lg px-3 py-2.5 border border-neutral-100">
            <p className="text-xs text-neutral-600 leading-relaxed italic line-clamp-2">
              {b.exampleSentence}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-white border-t border-neutral-100 flex items-center justify-between mt-auto">
        <span className="text-[10px] text-neutral-400 font-medium">
          Saved {formatDate(b.savedAt)}
        </span>
        <button
          onClick={onReview}
          className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-primary transition-colors"
        >
          Review
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
