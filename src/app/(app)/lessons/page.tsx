'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, ChevronLeft, ChevronRight, CreditCard, Captions,
  Loader2, ChevronDown, ArrowUpDown, Play, X,
} from 'lucide-react'
import UrlInput from '@/components/features/home/UrlInput'
import { deriveDisplayStatus } from '@/components/features/home/VideoCard'
import type { LessonData } from '@/components/features/home/MyLessonsSection'
import { MOCK_LESSONS } from '@/data/mockLessons'

// ─── 타입 ────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'completed' | 'generating'
type SortOrder   = 'newest' | 'oldest'

const PAGE_SIZE = 10

// ─── 선택 모달 ────────────────────────────────────────────────────────────────

function LessonSelectModal({
  lesson,
  onClose,
}: {
  lesson: LessonData
  onClose: () => void
}) {
  const router = useRouter()

  const go = (tab: 'flashcard' | 'watch') => {
    router.push(`/lessons/${lesson.id}?tab=${tab}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs text-neutral-400 mb-0.5">Start learning</p>
            <p className="text-sm font-semibold text-neutral-950 truncate">{lesson.title}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 선택지 */}
        <div className="px-4 pb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => go('flashcard')}
            className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border-2 border-neutral-200 hover:border-primary hover:bg-primary-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
              <CreditCard className="w-5 h-5 text-neutral-500 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary transition-colors">Flashcard</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Study key expressions</p>
            </div>
          </button>

          <button
            onClick={() => go('watch')}
            className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border-2 border-neutral-200 hover:border-primary hover:bg-primary-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
              <Captions className="w-5 h-5 text-neutral-500 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary transition-colors">Watch</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Watch with subtitles</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function ActivityPill({
  done, label, icon: Icon, onClick,
}: {
  done: boolean; label: string; icon: React.ElementType; onClick?: (e: React.MouseEvent) => void
}) {
  const base = `flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
    done
      ? 'bg-primary-50 text-primary border-primary-200'
      : 'bg-neutral-50 text-neutral-400 border-neutral-200'
  }`
  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} hover:shadow-sm hover:border-primary hover:text-primary`}>
        <Icon className="w-3 h-3 shrink-0" />{label}
      </button>
    )
  }
  return (
    <div className={base}>
      <Icon className="w-3 h-3 shrink-0" />{label}
    </div>
  )
}

function LessonRow({
  lesson,
  onPillClick,
  onRowClick,
}: {
  lesson: LessonData
  onPillClick: (id: string, tab: 'flashcard' | 'watch') => void
  onRowClick: (lesson: LessonData) => void
}) {
  const isGenerating = lesson.generationStatus === 'generating'
  const displayStatus = isGenerating
    ? null
    : deriveDisplayStatus(lesson.generationStatus, lesson.flashcardDone, lesson.subtitleDone)

  const statusLabel =
    displayStatus === 'not_started' ? 'Not Started'
    : displayStatus === 'in_progress' ? 'In Progress'
    : displayStatus === 'completed' ? 'Completed'
    : null

  return (
    <div
      onClick={() => !isGenerating && onRowClick(lesson)}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-150 group ${
        isGenerating ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      {/* 썸네일 */}
      <div className="relative w-32 aspect-video rounded-lg bg-neutral-100 shrink-0 overflow-hidden">
        {lesson.thumbnailUrl ? (
          <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isGenerating
              ? <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" strokeWidth={1.5} />
              : <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                  <Play className="w-5 h-5 text-neutral-300" strokeWidth={1.5} />
                </div>
            }
          </div>
        )}
        {lesson.duration && !isGenerating && (
          <span className="absolute bottom-1 right-1 text-[10px] font-medium px-1 py-0.5 rounded bg-black/70 text-white">
            {lesson.duration}
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {lesson.channelName && (
              <p className="text-xs text-neutral-400 mb-0.5 truncate">{lesson.channelName}</p>
            )}
            <p className="text-sm font-semibold text-neutral-950 truncate group-hover:text-primary transition-colors">
              {lesson.title}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">{lesson.date}</p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1.5">
            {isGenerating ? (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                {lesson.minutesLeft != null ? `~${lesson.minutesLeft} min left` : 'Processing...'}
              </span>
            ) : (
              <>
                {statusLabel && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    {statusLabel}
                  </span>
                )}
                <div className="flex gap-1.5">
                  <ActivityPill
                    done={lesson.flashcardDone ?? false}
                    label="Flashcard"
                    icon={CreditCard}
                    onClick={(e) => { e.stopPropagation(); onPillClick(lesson.id, 'flashcard') }}
                  />
                  <ActivityPill
                    done={lesson.subtitleDone ?? false}
                    label="Watch"
                    icon={Captions}
                    onClick={(e) => { e.stopPropagation(); onPillClick(lesson.id, 'watch') }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
            p === page ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
          }`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function LessonsPage() {
  const router = useRouter()
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder]     = useState<SortOrder>('newest')
  const [page, setPage]               = useState(1)
  const [selectModal, setSelectModal] = useState<LessonData | null>(null)

  const filtered = useMemo(() => {
    let result = MOCK_LESSONS
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) => l.title.toLowerCase().includes(q) || (l.channelName?.toLowerCase().includes(q) ?? false)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((l) => {
        if (statusFilter === 'generating') return l.generationStatus === 'generating'
        return (
          l.generationStatus === 'ready' &&
          deriveDisplayStatus(l.generationStatus, l.flashcardDone, l.subtitleDone) === statusFilter
        )
      })
    }
    result = [...result].sort((a, b) =>
      sortOrder === 'newest' ? parseInt(b.id) - parseInt(a.id) : parseInt(a.id) - parseInt(b.id)
    )
    return result
  }, [search, statusFilter, sortOrder])

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage  = Math.min(page, totalPages)
  const paginated    = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handlePillClick = (id: string, tab: 'flashcard' | 'watch') => {
    router.push(`/lessons/${id}?tab=${tab}`)
  }

  const handleRowClick = (lesson: LessonData) => {
    setSelectModal(lesson)
  }

  return (
    <>
      {selectModal && (
        <LessonSelectModal lesson={selectModal} onClose={() => setSelectModal(null)} />
      )}

      <div className="min-h-full">
        {/* 히어로 */}
        <div className="bg-gradient-to-b from-primary-50 to-white px-10 pt-10 pb-10 border-b border-neutral-100">
          <p className="text-xs font-medium text-primary-600 uppercase tracking-widest mb-3">Start Learning</p>
          <h1 className="text-3xl font-bold text-neutral-950 leading-tight mb-2">
            Which video will you learn<br />Korean today?
          </h1>
          <p className="text-sm text-neutral-500 mb-7">
            Paste a YouTube link and we&apos;ll build a personalized lesson for you.
          </p>
          <div className="max-w-xl"><UrlInput /></div>
        </div>

        {/* 콘텐츠 */}
        <div className="px-10 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/home')}
                className="text-sm text-neutral-400 hover:text-neutral-600 hover:underline transition-colors"
              >
                Home
              </button>
              <span className="text-neutral-300 text-sm">/</span>
              <span className="text-sm font-semibold text-primary">My Lessons</span>
            </div>
            <span className="text-sm text-neutral-400">{filtered.length} lessons</span>
          </div>

          {/* 컨트롤 바 */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text" placeholder="Search lessons..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1) }}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-neutral-700 cursor-pointer"
              >
                <option value="all">All Lessons</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
            <button
              onClick={() => { setSortOrder((prev) => prev === 'newest' ? 'oldest' : 'newest'); setPage(1) }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>

          {/* 목록 */}
          {paginated.length > 0 ? (
            <div className="flex flex-col gap-2">
              {paginated.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onPillClick={handlePillClick}
                  onRowClick={handleRowClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-semibold text-neutral-950 mb-1">No lessons found</p>
              <p className="text-xs text-neutral-400">Try adjusting the search or filters.</p>
            </div>
          )}

          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </>
  )
}
