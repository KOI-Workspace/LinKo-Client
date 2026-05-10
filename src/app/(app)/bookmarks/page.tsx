'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Trash2, ChevronRight, BookOpen, Search, ArrowUpDown, X, AlertTriangle } from 'lucide-react'
import { useBookmarks, BookmarkedCard } from '@/hooks/useBookmarks'

type Tab = 'expression' | 'sentence'
type SortOrder = 'newest' | 'oldest'

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function DeleteConfirmModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[320px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-neutral-950 mb-2">Delete Bookmark?</h3>
          <p className="text-sm text-neutral-500 leading-relaxed mb-6">
            This action cannot be undone. Are you sure you want to remove this item?
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mock 데이터 (데모용) ───────────────────────────────────────────────────

const MOCK_DEMO_BOOKMARKS: BookmarkedCard[] = [
  {
    cardId: 'demo-1',
    lessonId: '3',
    lessonTitle: 'Korean Street Food Tour Seoul',
    expression: '가득해요',
    baseWord: '가득하다',
    meaning: 'To be full of / packed with',
    exampleSentence: '이 시장은 맛있는 음식 가게로 가득해요.',
    exampleTranslation: '',
    savedAt: new Date().toISOString(),
    type: 'expression',
    subType: 'ending',
    conjugationBadges: [
      {
        removed: '하',
        added: '해요',
      }
    ]
  },
  {
    cardId: 'demo-2',
    lessonId: '3',
    lessonTitle: 'Korean Street Food Tour Seoul',
    expression: '다양하고',
    baseWord: '다양하다',
    meaning: 'To be diverse / varied',
    exampleSentence: '서울의 길거리 음식은 정말 다양하고 맛있어요.',
    exampleTranslation: '',
    savedAt: new Date(Date.now() - 3600000).toISOString(),
    type: 'expression',
    subType: 'ending',
    conjugationBadges: [
      {
        added: '고',
      }
    ]
  },
  {
    cardId: 'demo-3',
    lessonId: '4',
    lessonTitle: 'K-drama Vocabulary Basics',
    expression: '충격받았어요',
    baseWord: '충격받다',
    meaning: 'To be shocked / taken aback',
    exampleSentence: '마지막 반전에서 완전히 충격받았어요.',
    exampleTranslation: '',
    savedAt: new Date(Date.now() - 7200000).toISOString(),
    type: 'expression',
    subType: 'ending',
    conjugationBadges: [
      { added: '았' },
      { added: '어요' }
    ]
  },
  {
    cardId: 'demo-4',
    lessonId: '3',
    lessonTitle: 'Korean Street Food Tour Seoul',
    expression: '길거리 음식',
    meaning: 'Street food',
    exampleSentence: '',
    exampleTranslation: '',
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'expression',
    subType: 'word'
  }
]

export default function BookmarksPage() {
  const router = useRouter()
  const { bookmarks, removeBookmark } = useBookmarks()
  const [activeTab, setActiveTab] = useState<Tab>('expression')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const allBookmarks = useMemo(() => {
    // 실제 북마크가 없으면 데모용 데이터를 보여줌
    if (bookmarks.length === 0) return MOCK_DEMO_BOOKMARKS
    return bookmarks
  }, [bookmarks])

  const filteredAndSortedBookmarks = useMemo(() => {
    let result = allBookmarks.filter((b) => {
      const type = b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')
      if (activeTab === 'sentence') return type === 'sentence'
      return type === 'expression'
    })

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (b) =>
          b.expression.toLowerCase().includes(q) ||
          b.meaning.toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      const timeA = new Date(a.savedAt).getTime()
      const timeB = new Date(b.savedAt).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })

    return result
  }, [allBookmarks, activeTab, searchQuery, sortOrder])

  const counts = useMemo(() => {
    const exprs = allBookmarks.filter(b => (b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')) === 'expression')
    const sents = allBookmarks.filter(b => (b.type || (b.cardId.startsWith('sentence-') ? 'sentence' : 'expression')) === 'sentence')
    return {
      expression: exprs.length,
      sentence: sents.length,
    }
  }, [allBookmarks])

  return (
    <div className="min-h-full bg-white">
      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <DeleteConfirmModal
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            removeBookmark(deleteConfirmId)
            setDeleteConfirmId(null)
          }}
        />
      )}

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
            onClick={() => setActiveTab('expression')}
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

      {/* 컨트롤 바 (검색 & 정렬) */}
      <div className="px-10 py-6 border-b border-neutral-50 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder={activeTab === 'expression' ? "Search expressions..." : "Search sentences..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
          />
        </div>
        <button
          onClick={() => setSortOrder((prev) => prev === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="px-10 py-8 pb-12">

        {/* 빈 상태 */}
        {filteredAndSortedBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-5">
              <Bookmark className="w-7 h-7 text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-neutral-950 mb-1.5">
              {searchQuery ? 'No results found' : `No ${activeTab === 'expression' ? 'expressions' : 'sentences'} found`}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-[220px]">
              {searchQuery 
                ? "Try a different search term or check your spelling."
                : (activeTab === 'expression'
                  ? "Start saving words and phrases from your lessons."
                  : "Bookmark entire sentences while watching videos to see them here.")}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/lessons')}
                className="mt-8 flex items-center gap-1.5 px-6 py-2.5 rounded-pill text-sm font-medium bg-neutral-950 text-white hover:bg-neutral-800 transition-all shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                Go to My Lessons
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedBookmarks.map((b) => (
              <BookmarkCard
                key={b.cardId}
                bookmark={b}
                onRemove={() => setDeleteConfirmId(b.cardId)}
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
  const badges = b.conjugationBadges

  return (
    <div className="group flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-primary-200 hover:shadow-sm transition-all">
      <div className="flex-1 p-6">
        <div className="flex items-start justify-end mb-1">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 메인 텍스트 */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className={`font-bold text-neutral-950 leading-tight truncate ${isSentence ? 'text-sm' : 'text-lg'}`}>
              {b.expression}
            </h3>
            {b.baseWord && (
              <span className="text-xs font-medium text-neutral-400 shrink-0">
                {b.baseWord}
              </span>
            )}
          </div>
          
          {/* 어미 변형 표시 (badges가 있을 때) */}
          {badges && badges.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              {badges.map((badge, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-800 text-[11px] font-bold tracking-tight">
                  {badge.removed && <span className="text-orange-400">-{badge.removed}</span>}
                  <span className="text-teal-300">+{badge.added}</span>
                </span>
              ))}
            </div>
          )}

          <p className={`font-medium text-neutral-500 truncate ${isSentence ? 'text-xs opacity-80' : 'text-sm'}`}>
            {b.meaning}
          </p>
        </div>
      </div>

      <div className="px-6 py-3.5 bg-white border-t border-neutral-100 flex items-center justify-end mt-auto">
        <button
          onClick={onReview}
          className="flex items-center gap-1 text-[11px] font-bold text-neutral-600 hover:text-primary transition-colors"
        >
          Review
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
