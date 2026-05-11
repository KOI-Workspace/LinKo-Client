import { apiFetch } from './api'
import type { LessonFlashcards } from '@/components/features/flashcard/flashcard.types'

export interface LessonSummary {
  id: string
  title: string
  channelName?: string
  thumbnailUrl?: string | null
  duration?: string | null
  date?: string | null
  generationStatus: 'generating' | 'ready' | 'failed'
  flashcardDone?: boolean
  subtitleDone?: boolean
  errorCode?: string | null
  errorMessage?: string | null
  transcriptStatus?: string
  transcriptSource?: string | null
}

export interface LessonCreateResponse {
  lessonId: string
  generationStatus: 'generating'
}

export interface SubtitleLine {
  id: string
  startSec: number
  endSec: number
  korean: string
  english: string
}

export interface WatchVocabEntry {
  meaning: string
  cardId?: string
  lessonId?: string
  expression: string
  exampleSentence: string
  exampleTranslation: string
}

export interface CulturalNote {
  id: string
  subtitleId: string
  title: string
  keyword: string
  explanation: string
}

export interface LessonSubtitlesResponse {
  youtubeId: string
  durationSec: number
  lines: SubtitleLine[]
  vocabMap: Record<string, WatchVocabEntry>
  culturalNotes: CulturalNote[]
}

export interface LessonListResponse {
  lessons: LessonSummary[]
}

export function createLesson(youtubeUrl: string) {
  return apiFetch<LessonCreateResponse>('/lessons', {
    method: 'POST',
    body: JSON.stringify({ youtubeUrl }),
  })
}

export function listLessons() {
  return apiFetch<LessonListResponse>('/lessons')
}

export function getLesson(lessonId: string) {
  return apiFetch<LessonSummary>(`/lessons/${lessonId}`)
}

export function getLessonFlashcards(lessonId: string) {
  return apiFetch<LessonFlashcards>(`/lessons/${lessonId}/flashcards`)
}

export function getLessonSubtitles(lessonId: string) {
  return apiFetch<LessonSubtitlesResponse>(`/lessons/${lessonId}/subtitles`)
}

export function getPublicPreviewLessons() {
  return apiFetch<LessonSummary[]>('/public/preview-lessons')
}

export function getPublicLessonFlashcards(lessonId: string) {
  return apiFetch<LessonFlashcards>(`/public/lessons/${lessonId}/flashcards`)
}

export function getPublicLessonSubtitles(lessonId: string) {
  return apiFetch<LessonSubtitlesResponse>(`/public/lessons/${lessonId}/subtitles`)
}

