'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Clock, BookOpen, Check, Youtube, Sparkles } from 'lucide-react'
import VideoCard, { deriveDisplayStatus } from './VideoCard'
import type { VideoCardProps, LessonDisplayStatus, LessonFilterStatus } from './VideoCard'

export interface LessonData extends VideoCardProps {
  id: string
}

const FILTER_OPTIONS: {
  value: LessonFilterStatus
  label: string
  icon?: React.ElementType
}[] = [
  { value: 'all',         label: 'All' },
  { value: 'not_started', label: 'Not Started',  icon: Clock },
  { value: 'in_progress', label: 'In Progress',  icon: BookOpen },
  { value: 'completed',   label: 'Completed',    icon: Check },
  { value: 'generating',  label: 'Generating',  icon: Sparkles },
]

interface MyLessonsSectionProps {
  lessons: LessonData[]
}

/** 레슨이 하나도 없을 때 표시하는 빈 상태 */
function EmptyLessons() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-center">
      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
        <Youtube className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-semibold text-neutral-950 mb-1.5">No lessons yet</p>
      <p className="text-xs text-neutral-400 leading-relaxed max-w-[200px]">
        Paste a YouTube link above to create your first Korean lesson.
      </p>
    </div>
  )
}

export default function MyLessonsSection({ lessons }: MyLessonsSectionProps) {
  const [filter, setFilter] = useState<LessonFilterStatus>('all')
  const router = useRouter()

  /** 각 표시 상태별 카운트 */
  const counts = lessons.reduce(
    (acc, lesson) => {
      const status = deriveDisplayStatus(
        lesson.generationStatus,
        lesson.flashcardDone,
        lesson.subtitleDone
      )
      acc[status] = (acc[status] ?? 0) + 1
      return acc
    },
    {} as Partial<Record<LessonDisplayStatus, number>>
  )

  const filtered =
    filter === 'all'
      ? lessons
      : lessons.filter(
          (lesson) =>
            deriveDisplayStatus(
              lesson.generationStatus,
              lesson.flashcardDone,
              lesson.subtitleDone
            ) === filter
        )

  return (
    <section>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-neutral-950">My Lessons</h2>
        {lessons.length > 0 && (
          <Link
            href="/lessons"
            className="flex items-center gap-0.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* 레슨이 없으면 empty state 표시, 필터·목록 숨김 */}
      {lessons.length === 0 ? (
        <EmptyLessons />
      ) : (
        <>
          {/* 상태 필터 */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-0.5">
            {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => {
              const count =
                value === 'all'
                  ? lessons.length
                  : (counts[value as LessonDisplayStatus] ?? 0)
              const isActive = filter === value

              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-950'
                  }`}
                >
                  {Icon && (
                    <Icon className="w-3 h-3" strokeWidth={2.5} />
                  )}
                  {label}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 카드 목록 */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {filtered.length > 0 ? (
              filtered.map((lesson) => (
                <div
                  key={lesson.id}
                  role="button"
                  tabIndex={lesson.generationStatus === 'ready' ? 0 : -1}
                  aria-disabled={lesson.generationStatus !== 'ready'}
                  onClick={() => lesson.generationStatus === 'ready' && router.push(`/lessons/${lesson.id}?tab=flashcard`)}
                  onKeyDown={(e) => {
                    if (lesson.generationStatus !== 'ready') return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(`/lessons/${lesson.id}?tab=flashcard`)
                    }
                  }}
                  className={lesson.generationStatus === 'ready' ? 'cursor-pointer text-left' : 'text-left cursor-default'}
                >
                  <VideoCard {...lesson} />
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400 py-4">No lessons in this status.</p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
