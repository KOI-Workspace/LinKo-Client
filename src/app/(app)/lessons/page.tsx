'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, CreditCard, Captions, Loader2, ChevronDown, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import UrlInput from '@/components/features/home/UrlInput'
import { deriveDisplayStatus } from '@/components/features/home/VideoCard'
import type { LessonData } from '@/components/features/home/MyLessonsSection'

// ─── 타입 ────────────────────────────────────────────────────────────────────

/**
 * 학습자 행동 기반 상태 필터
 * - all: 전체
 * - not_started: 아직 시작 안 함 → "뭘 해야 하지?"
 * - in_progress: 진행 중 → "이어서 하자"
 * - completed: 완료 → "복습하자"
 * - generating: 생성 중 → "기다리는 중"
 */
type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'completed' | 'generating'

/** 시간순 정렬 — 최신순 / 오래된순 토글 */
type SortOrder = 'newest' | 'oldest'

// ─── Mock 데이터 (12개 — 페이지네이션 테스트용) ──────────────────────────────

const MOCK_LESSONS: LessonData[] = [
  {
    id: '1',
    title: 'BTS - Butter MV Reaction',
    channelName: 'HYBE Labels',
    duration: '3:52',
    date: '2026.05.05',
    generationStatus: 'generating',
    minutesLeft: 3,
  },
  {
    id: '2',
    title: 'How to Order at a Korean Cafe',
    channelName: 'Korean Daily',
    duration: '8:40',
    date: '2026.05.05',
    generationStatus: 'generating',
    minutesLeft: 7,
  },
  {
    id: '3',
    title: 'Korean Street Food Tour Seoul',
    channelName: 'Seoul Eats',
    duration: '14:22',
    date: '2026.05.04',
    generationStatus: 'ready',
    flashcardDone: false,
    subtitleDone: false,
  },
  {
    id: '4',
    title: 'K-drama Vocabulary Basics',
    channelName: 'KBS Drama',
    duration: '12:30',
    date: '2026.05.03',
    generationStatus: 'ready',
    flashcardDone: true,
    subtitleDone: false,
  },
  {
    id: '5',
    title: 'Learn Korean with BLACKPINK',
    channelName: 'BLACKPINK',
    duration: '5:21',
    date: '2026.05.02',
    generationStatus: 'ready',
    flashcardDone: true,
    subtitleDone: true,
  },
  {
    id: '6',
    title: 'Korean Pronunciation Guide for Beginners',
    channelName: 'Korean Class 101',
    duration: '8:15',
    date: '2026.05.01',
    generationStatus: 'ready',
    flashcardDone: false,
    subtitleDone: false,
  },
  {
    id: '7',
    title: '10 Must-Know Korean Slang Words',
    channelName: 'Talk To Me In Korean',
    duration: '6:42',
    date: '2026.04.30',
    generationStatus: 'ready',
    flashcardDone: true,
    subtitleDone: true,
  },
  {
    id: '8',
    title: 'Korean Food Vocabulary with Chef',
    channelName: 'Maangchi',
    duration: '15:20',
    date: '2026.04.29',
    generationStatus: 'ready',
    flashcardDone: false,
    subtitleDone: true,
  },
  {
    id: '9',
    title: 'K-pop Lyrics Korean Lesson',
    channelName: 'SMTOWN',
    duration: '4:58',
    date: '2026.04.28',
    generationStatus: 'ready',
    flashcardDone: false,
    subtitleDone: false,
  },
  {
    id: '10',
    title: 'Essential Korean Phrases for Travel',
    channelName: 'Korean With Joo',
    duration: '11:05',
    date: '2026.04.27',
    generationStatus: 'ready',
    flashcardDone: true,
    subtitleDone: false,
  },
  {
    id: '11',
    title: 'TWICE Dance Practice — Korean Lyrics',
    channelName: 'JYP Entertainment',
    duration: '3:34',
    date: '2026.04.26',
    generationStatus: 'generating',
    minutesLeft: 2,
  },
  {
    id: '12',
    title: 'Korean Numbers Made Easy',
    channelName: 'Korean Class 101',
    duration: '9:48',
    date: '2026.04.25',
    generationStatus: 'ready',
    flashcardDone: true,
    subtitleDone: true,
  },
]

const PAGE_SIZE = 10

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

/** 학습 활동 pill (행 내부용) */
function ActivityPill({ done, label, icon: Icon }: { done: boolean; label: string; icon: React.ElementType }) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border ${
        done
          ? 'bg-primary-50 text-primary border-primary-200'
          : 'bg-neutral-50 text-neutral-400 border-neutral-200'
      }`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </div>
  )
}

/** 스택 UI 한 행 */
function LessonRow({ lesson }: { lesson: LessonData }) {
  const isGenerating = lesson.generationStatus === 'generating'
  const displayStatus = isGenerating
    ? null
    : deriveDisplayStatus(lesson.generationStatus, lesson.flashcardDone, lesson.subtitleDone)

  const statusLabel =
    displayStatus === 'not_started'
      ? 'Not Started'
      : displayStatus === 'in_progress'
      ? 'In Progress'
      : displayStatus === 'completed'
      ? 'Completed'
      : null

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-150 cursor-pointer group">
      {/* 썸네일 */}
      <div className="relative w-32 aspect-video rounded-lg bg-neutral-100 shrink-0 overflow-hidden">
        {lesson.thumbnailUrl ? (
          <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isGenerating ? (
              <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" strokeWidth={1.5} />
            ) : (
              <div className="w-full h-full bg-neutral-200" />
            )}
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

          {/* 우측: 학습 상태 */}
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
                  <ActivityPill done={lesson.flashcardDone ?? false} label="Flashcard" icon={CreditCard} />
                  <ActivityPill done={lesson.subtitleDone ?? false} label="Watch" icon={Captions} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 페이지네이션 */
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
            p === page
              ? 'bg-neutral-950 text-white'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function LessonsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = MOCK_LESSONS

    // 검색 (제목 + 채널명)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.channelName?.toLowerCase().includes(q) ?? false)
      )
    }

    // 학습 상태 필터
    if (statusFilter !== 'all') {
      result = result.filter((l) => {
        if (statusFilter === 'generating') return l.generationStatus === 'generating'
        return (
          l.generationStatus === 'ready' &&
          deriveDisplayStatus(l.generationStatus, l.flashcardDone, l.subtitleDone) === statusFilter
        )
      })
    }

    // 시간순 정렬 (mock 데이터 기준 id로 추가 순서 구분)
    result = [...result].sort((a, b) =>
      sortOrder === 'newest'
        ? parseInt(b.id) - parseInt(a.id)
        : parseInt(a.id) - parseInt(b.id)
    )

    return result
  }, [search, statusFilter, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleStatus = (v: StatusFilter) => { setStatusFilter(v); setPage(1) }
  const toggleSort = () => { setSortOrder((prev) => prev === 'newest' ? 'oldest' : 'newest'); setPage(1) }

  return (
    <div className="min-h-full">
      {/* 히어로 — 홈과 동일 */}
      <div className="bg-gradient-to-b from-primary-50 to-white px-10 pt-10 pb-10 border-b border-neutral-100">
        <p className="text-xs font-medium text-primary-600 uppercase tracking-widest mb-3">
          Start Learning
        </p>
        <h1 className="text-3xl font-bold text-neutral-950 leading-tight mb-2">
          Which video will you learn
          <br />
          Korean today?
        </h1>
        <p className="text-sm text-neutral-500 mb-7">
          Paste a YouTube link and we&apos;ll build a personalized lesson for you.
        </p>
        <div className="max-w-xl">
          <UrlInput />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="px-10 py-8">
        {/* 브레드크럼 + 총 개수 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Link
              href="/home"
              className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline transition-colors"
            >
              Home
            </Link>
            <span className="text-neutral-300 text-sm">/</span>
            <span className="text-sm font-semibold text-neutral-950">My Lessons</span>
          </div>
          <span className="text-sm text-neutral-400">{filtered.length} lessons</span>
        </div>

        {/* 컨트롤 바 */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
            />
          </div>

          {/* 상태 필터 — 학습자 행동 기반 */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleStatus(e.target.value as StatusFilter)}
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

          {/* 시간순 정렬 토글 */}
          <button
            onClick={toggleSort}
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
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-neutral-950 mb-1">No lessons found</p>
            <p className="text-xs text-neutral-400">Try adjusting the search or filters.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
