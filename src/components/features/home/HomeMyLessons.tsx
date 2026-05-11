'use client'

import { useEffect, useMemo, useState } from 'react'
import MyLessonsSection, { type LessonData } from './MyLessonsSection'
import { listLessons, type LessonSummary } from '@/lib/lessonsApi'

interface HomeMyLessonsProps {
  fallbackLessons: LessonData[]
}

function normalizeLesson(lesson: LessonSummary): LessonData | null {
  if (lesson.generationStatus === 'failed') return null

  return {
    id: lesson.id,
    title: lesson.title,
    channelName: lesson.channelName ?? undefined,
    thumbnailUrl: lesson.thumbnailUrl ?? undefined,
    duration: lesson.duration ?? undefined,
    date: lesson.date ?? '',
    generationStatus: lesson.generationStatus,
    flashcardDone: lesson.flashcardDone,
    subtitleDone: lesson.subtitleDone,
  }
}

export default function HomeMyLessons({ fallbackLessons }: HomeMyLessonsProps) {
  const [apiLessons, setApiLessons] = useState<LessonSummary[]>([])
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    listLessons()
      .then((response) => {
        if (!cancelled) {
          setApiLessons(response.lessons)
          setHasError(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiLessons([])
          setHasError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const lessons = useMemo(
    () => apiLessons.map(normalizeLesson).filter((lesson): lesson is LessonData => lesson !== null),
    [apiLessons],
  )

  return <MyLessonsSection lessons={lessons.length > 0 || !hasError ? lessons : fallbackLessons} />
}
