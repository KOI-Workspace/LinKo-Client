'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Volume2, ChevronLeft, ChevronRight, Play, Pause,
  ExternalLink, Bookmark, BookmarkCheck,
  Repeat, Gauge, MessageCircle, ChevronDown, ChevronUp, X, EyeOff, Eye,
} from 'lucide-react'
import { MOCK_FLASHCARDS } from './mockFlashcards'
import { useBookmarks } from '@/hooks/useBookmarks'
import { getLessonFlashcards, getPublicLessonFlashcards } from '@/lib/lessonsApi'
import type {
  AnyFlashCard,
  RelatedVideo, ConversationTurn, ConjugationBadge,
  EndingCard, EndingCategory, BadgePartDetail, LessonFlashcards,
} from './flashcard.types'

// ─── 어미 카테고리 스타일 ──────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<EndingCategory, {
  label: string
  tagBg: string; tagText: string
  panelBg: string; panelBorder: string
  chipBg: string; chipText: string
}> = {
  '선어말어미': {
    label: 'Pre-final',
    tagBg: 'bg-blue-100', tagText: 'text-blue-700',
    panelBg: 'bg-blue-50', panelBorder: 'border-blue-200',
    chipBg: 'bg-blue-100', chipText: 'text-blue-600',
  },
  '어말-종결': {
    label: 'Final · Closing',
    tagBg: 'bg-violet-100', tagText: 'text-violet-700',
    panelBg: 'bg-violet-50', panelBorder: 'border-violet-200',
    chipBg: 'bg-violet-100', chipText: 'text-violet-600',
  },
  '어말-연결': {
    label: 'Final · Connective',
    tagBg: 'bg-amber-100', tagText: 'text-amber-700',
    panelBg: 'bg-amber-50', panelBorder: 'border-amber-200',
    chipBg: 'bg-amber-100', chipText: 'text-amber-600',
  },
  '어말-전성': {
    label: 'Final · Transformative',
    tagBg: 'bg-teal-100', tagText: 'text-teal-700',
    panelBg: 'bg-teal-50', panelBorder: 'border-teal-200',
    chipBg: 'bg-teal-100', chipText: 'text-teal-600',
  },
  '어말-보조적': {
    label: 'Final · Auxiliary',
    tagBg: 'bg-emerald-100', tagText: 'text-emerald-700',
    panelBg: 'bg-emerald-50', panelBorder: 'border-emerald-200',
    chipBg: 'bg-emerald-100', chipText: 'text-emerald-600',
  },
  '어간변화': {
    label: 'Stem Change',
    tagBg: 'bg-neutral-100', tagText: 'text-neutral-600',
    panelBg: 'bg-neutral-50', panelBorder: 'border-neutral-200',
    chipBg: 'bg-neutral-200', chipText: 'text-neutral-500',
  },
}

// ─── 유틸 ────────────────────────────────────────────────────────────────────

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

function isEndingCard(card: { type?: string }): card is EndingCard {
  return card.type === 'ending'
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function VideoSegmentPlayer({ youtubeId, startSec, endSec }: {
  youtubeId: string; startSec: number; endSec: number
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const playbackBaseSec = useRef(startSec)
  const playbackStartedAt = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [isSlow, setIsSlow] = useState(false)
  const [currentVideoSec, setCurrentVideoSec] = useState(startSec)
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const params = new URLSearchParams({
    start: String(startSec), end: String(endSec),
    autoplay: '0', rel: '0', modestbranding: '1',
    controls: '0', disablekb: '1', playsinline: '1', enablejsapi: '1',
    ...(origin ? { origin } : {}),
  })
  const src = `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`
  const playbackRate = isSlow ? 0.5 : 1

  const sendCommand = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*',
    )
  }, [])

  useEffect(() => {
    sendCommand('setPlaybackRate', [playbackRate])
  }, [playbackRate, sendCommand])

  useEffect(() => {
    playbackBaseSec.current = startSec
    playbackStartedAt.current = null
    setCurrentVideoSec(startSec)
    setIsPlaying(false)
    sendCommand('pauseVideo')
    sendCommand('seekTo', [startSec, true])
  }, [endSec, sendCommand, startSec, youtubeId])

  useEffect(() => {
    if (!isPlaying) return

    const interval = window.setInterval(() => {
      if (playbackStartedAt.current === null) return

      const elapsedSec = ((Date.now() - playbackStartedAt.current) / 1000) * playbackRate
      const nextSec = playbackBaseSec.current + elapsedSec

      if (nextSec >= endSec) {
        if (loop) {
          playbackBaseSec.current = startSec
          playbackStartedAt.current = Date.now()
          setCurrentVideoSec(startSec)
          sendCommand('seekTo', [startSec, true])
          sendCommand('playVideo')
        } else {
          playbackBaseSec.current = endSec
          playbackStartedAt.current = null
          setCurrentVideoSec(endSec)
          setIsPlaying(false)
          sendCommand('pauseVideo')
        }
        return
      }

      setCurrentVideoSec(nextSec)
    }, 250)

    return () => window.clearInterval(interval)
  }, [endSec, isPlaying, loop, playbackRate, sendCommand, startSec])

  const togglePlay = () => {
    setIsPlaying((playing) => {
      if (playing) {
        const startedAt = playbackStartedAt.current
        if (startedAt !== null) {
          const elapsedSec = ((Date.now() - startedAt) / 1000) * playbackRate
          const pausedAt = Math.min(endSec, playbackBaseSec.current + elapsedSec)
          playbackBaseSec.current = pausedAt
          setCurrentVideoSec(pausedAt)
        }
        playbackStartedAt.current = null
        sendCommand('pauseVideo')
      } else {
        const resumeAt = currentVideoSec >= endSec ? startSec : currentVideoSec
        playbackBaseSec.current = resumeAt
        playbackStartedAt.current = Date.now()
        setCurrentVideoSec(resumeAt)
        sendCommand('seekTo', [resumeAt, true])
        sendCommand('playVideo')
      }
      return !playing
    })
  }

  return (
    <>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 shadow-lg">
        <iframe ref={iframeRef} key={src} src={src} className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media" allowFullScreen title="Video segment" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
          <Play className="w-3 h-3" fill="currentColor" />
          {formatTime(startSec)} – {formatTime(endSec)}
        </div>
      </div>
      <div className="flex gap-2 mt-3 justify-center">
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-800 transition-all"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" fill="currentColor" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => setLoop((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            loop ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-800'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />Loop
        </button>
        <button
          onClick={() => setIsSlow((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            isSlow ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-800'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />Slow
        </button>
      </div>
    </>
  )
}

function RelatedVideoItem({ video }: { video: RelatedVideo }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-200 hover:shadow-sm cursor-pointer transition-all group">
      <div className="relative w-20 aspect-video rounded-lg bg-neutral-200 shrink-0 overflow-hidden">
        {video.thumbnailUrl
          ? <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Play className="w-3 h-3 text-neutral-400" fill="currentColor" /></div>
        }
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-medium px-1 rounded">
          {formatTime(video.startSec)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-800 truncate group-hover:text-primary transition-colors">{video.title}</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">{video.channelName}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-neutral-300 group-hover:text-primary shrink-0 transition-colors" />
    </div>
  )
}

function ConversationBubble({ turn, onSpeak, blindWord = '', isBlind = false }: {
  turn: ConversationTurn
  onSpeak: (text: string) => void
  blindWord?: string
  isBlind?: boolean
}) {
  return (
    <div className={`flex ${turn.isQuestion ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative group ${
        turn.isQuestion
          ? 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
          : 'bg-primary-50 text-primary-900 rounded-tr-sm border border-primary-100'
      }`}>
        <p>
          <BlindHighlightWord
            text={turn.text}
            word={blindWord}
            isBlind={isBlind}
            isPurple={!turn.isQuestion}
          />
        </p>
        <button onClick={() => onSpeak(turn.text)}
          className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-400 hover:text-primary transition-all">
          <Volume2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

/** 어미 변형 배지 — 제거된 부분(주황)과 추가된 부분(초록)을 한 뱃지에 표시 */
function ConjugationBadgeTag({ badge }: { badge: ConjugationBadge }) {
  const removedTextColor = badge.removedDetail
    ? CATEGORY_STYLE[badge.removedDetail.category].chipText
    : 'text-orange-400'
  const addedTextColor = badge.addedDetail
    ? CATEGORY_STYLE[badge.addedDetail.category].chipText
    : 'text-teal-300'

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-800 text-sm font-bold tracking-wide">
      {badge.removed && (
        <span className={removedTextColor}>-{badge.removed}</span>
      )}
      <span className={addedTextColor}>+{badge.added}</span>
    </span>
  )
}

/** 한국어 음절(가-힣) 여부 */
function isKoreanSyllable(char: string | undefined): boolean {
  if (!char) return false
  const code = char.charCodeAt(0)
  return code >= 0xAC00 && code <= 0xD7A3
}

/** ㅎ로 시작하는 한글 음절 (하/한/할/함/해/했 등 — 하다 활용형 첫 글자) */
function startsWithHieut(char: string | undefined): boolean {
  if (!char) return false
  const code = char.charCodeAt(0)
  // ㅎ 초성 음절 범위: 하(0xD558) ~ 힣(0xD7A3)
  return code >= 0xD558 && code <= 0xD7A3
}

/** 본문에서 단어(또는 활용형)의 위치를 찾는다.
 *  1) 정확 일치
 *  2) `~하다` 동사 특수 처리 (하 + 어미가 축약되는 케이스: 한/해/할/함/했…)
 *  3) 일반 어간 매칭 (`다`만 제거하고 뒤 활용 어미 확장) */
function findBlindRange(text: string, word: string): { start: number; end: number } | null {
  if (!word) return null

  // 1. 정확 일치
  const exactIdx = text.indexOf(word)
  if (exactIdx !== -1) {
    return { start: exactIdx, end: exactIdx + word.length }
  }

  if (!word.endsWith('다')) return null

  const MAX_EXTENSION = 4

  // 2. `~하다` 동사 특수 처리
  //    예: 릴렉스하다 → 릴렉스한, 릴렉스해요, 릴렉스할게요
  if (word.endsWith('하다') && word.length > 2) {
    const prefix = word.slice(0, -2) // '하다' 제거
    let searchStart = 0
    while (searchStart < text.length) {
      const prefixIdx = text.indexOf(prefix, searchStart)
      if (prefixIdx === -1) break

      const prevChar = prefixIdx > 0 ? text[prefixIdx - 1] : undefined
      if (!isKoreanSyllable(prevChar)) {
        const afterPrefix = prefixIdx + prefix.length
        // prefix 바로 뒤가 ㅎ-시작 음절이면 하다 활용형으로 간주
        if (afterPrefix < text.length && startsWithHieut(text[afterPrefix])) {
          let endIdx = afterPrefix + 1
          let extension = 1 // 첫 ㅎ-음절 이미 포함
          while (
            endIdx < text.length &&
            isKoreanSyllable(text[endIdx]) &&
            extension < MAX_EXTENSION
          ) {
            endIdx++
            extension++
          }
          return { start: prefixIdx, end: endIdx }
        }
      }
      searchStart = prefixIdx + 1
    }
  }

  // 3. 일반 어간 매칭
  const stem = word.slice(0, -1)
  if (!stem) return null

  let searchStart = 0
  while (searchStart < text.length) {
    const stemIdx = text.indexOf(stem, searchStart)
    if (stemIdx === -1) break

    const prevChar = stemIdx > 0 ? text[stemIdx - 1] : undefined
    if (!isKoreanSyllable(prevChar)) {
      let endIdx = stemIdx + stem.length
      let extension = 0
      while (
        endIdx < text.length &&
        isKoreanSyllable(text[endIdx]) &&
        extension < MAX_EXTENSION
      ) {
        endIdx++
        extension++
      }
      return { start: stemIdx, end: endIdx }
    }

    searchStart = stemIdx + 1
  }

  return null
}

/** 문장에서 특정 단어를 Watch 스타일 블라인드로 처리.
 *  레이아웃 유지를 위해 blind on/off 모두 동일한 padding 적용, 배경색만 전환.
 *  사전형(`다` 끝) 단어는 활용형까지 함께 매칭 (예: `있다` → `있어요`). */
function BlindHighlightWord({ text, word, isBlind, isPurple = false }: {
  text: string; word: string; isBlind: boolean; isPurple?: boolean
}) {
  const range = findBlindRange(text, word)
  if (!range) return <>{text}</>

  const wordClass = isBlind
    ? isPurple
      ? 'rounded-[0.28em] px-[0.22em] py-[0.05em] bg-primary/40 text-transparent select-none'
      : 'rounded-[0.28em] px-[0.22em] py-[0.05em] bg-neutral-400/60 text-transparent select-none'
    : 'rounded-[0.28em] px-[0.22em] py-[0.05em]'

  return (
    <>
      {text.slice(0, range.start)}
      <span className={wordClass}>{text.slice(range.start, range.end)}</span>
      {text.slice(range.end)}
    </>
  )
}

/** 스크립트 문장에서 활용형을 하이라이트 */
function HighlightedSentence({ sentence, highlight }: { sentence: string; highlight: string }) {
  const idx = sentence.indexOf(highlight)
  if (idx === -1) return <>{sentence}</>
  return (
    <>
      {sentence.slice(0, idx)}
      <mark className="bg-primary-100 text-primary-900 rounded px-0.5 not-italic font-semibold">
        {highlight}
      </mark>
      {sentence.slice(idx + highlight.length)}
    </>
  )
}

/** 어미 분석 상세 패널 — 배지 토글 시 펼쳐짐 */
function BadgeDetailPanel({ badges }: { badges: ConjugationBadge[] }) {
  type Part = { text: string; isRemoved: boolean; detail: BadgePartDetail }
  const parts: Part[] = []

  for (const badge of badges) {
    if (badge.removed && badge.removedDetail) {
      parts.push({ text: badge.removed, isRemoved: true, detail: badge.removedDetail })
    }
    if (badge.addedDetail) {
      parts.push({ text: badge.added, isRemoved: false, detail: badge.addedDetail })
    }
  }

  if (parts.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-5">
      {parts.map((part, i) => {
        const s = CATEGORY_STYLE[part.detail.category]
        return (
          <div key={i} className={`rounded-xl border ${s.panelBorder} ${s.panelBg} p-4`}>
            {/* 파트 텍스트 먼저, 카테고리 태그 다음 */}
            <div className="flex items-center gap-2 flex-wrap mb-2.5">
              <span className={`text-sm font-bold font-mono ${part.isRemoved ? 'text-orange-500' : 'text-teal-600'}`}>
                {part.isRemoved ? `-${part.text}` : `+${part.text}`}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${s.tagBg} ${s.tagText}`}>
                {s.label}
              </span>
              {part.detail.subCategories.map((sc, j) => (
                <span key={j} className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${s.chipBg} ${s.chipText}`}>
                  {sc}
                </span>
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">{part.detail.explanation}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── 메인 탭 컴포넌트 ─────────────────────────────────────────────────────────

interface FlashcardTabProps {
  lessonId?: string
  isPublic?: boolean
  overrideCards?: AnyFlashCard[]
  mode?: 'study' | 'review'
  initialCardId?: string
  onComplete?: () => void
  onClose?: () => void
  hideActions?: boolean
  hideRelatedVideos?: boolean
}

export default function FlashcardTab({
  lessonId,
  isPublic = false,
  overrideCards,
  mode = 'study',
  initialCardId,
  onComplete,
  onClose,
  hideActions = false,
  hideRelatedVideos = false,
}: FlashcardTabProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expandedBadge, setExpandedBadge] = useState(false)
  const [isBlind, setIsBlind] = useState(true)
  const [apiData, setApiData] = useState<LessonFlashcards | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isReviewMode = mode === 'review'

  const fallbackData = useMemo(() => {
    if (!lessonId) return null
    return MOCK_FLASHCARDS[lessonId] ?? null
  }, [lessonId])
  const data = apiData ?? fallbackData
  const cards = useMemo(
    () => overrideCards || data?.cards || [],
    [overrideCards, data]
  )

  // 초기 카드 설정 (initialCardId가 있을 경우)
  useEffect(() => {
    if (initialCardId && cards.length > 0) {
      const idx = cards.findIndex(c => c.id === initialCardId)
      if (idx !== -1) setCurrentIndex(idx)
    }
  }, [initialCardId, cards])

  useEffect(() => {
    let cancelled = false
    if (!lessonId || overrideCards) {
      setIsLoading(false)
      setError(null)
      return () => {
        cancelled = true
      }
    }

    setIsLoading(true)
    setError(null)

    const fetchFn = isPublic ? getPublicLessonFlashcards : getLessonFlashcards
    fetchFn(lessonId)
      .then((flashcards) => {
        if (!cancelled) setApiData(flashcards)
      })
      .catch((err) => {
        if (!cancelled) {
          setApiData(null)
          setError(fallbackData ? null : err instanceof Error ? err.message : 'Could not load flashcards.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lessonId, overrideCards, fallbackData])

  const goNext = useCallback(() => {
    if (currentIndex < cards.length - 1) setCurrentIndex((i) => i + 1)
  }, [currentIndex, cards.length])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }, [currentIndex])

  // 카드 이동 시 배지 패널 닫기 + 블라인드 모드 초기화
  useEffect(() => {
    setExpandedBadge(false)
    setIsBlind(true)
  }, [currentIndex])

  // 레슨(영상) 변경 시 카드 인덱스 + 블라인드 초기화
  // currentIndex가 이미 0이면 위 effect가 발동하지 않으므로 별도 처리
  useEffect(() => {
    setCurrentIndex(0)
    setExpandedBadge(false)
    setIsBlind(true)
  }, [lessonId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, onClose])

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 text-neutral-400 py-20">
        <p className="text-sm font-medium">Loading flashcards...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 text-neutral-400 py-20">
        <p className="text-sm font-medium">{error ?? 'No flashcards available for this lesson yet.'}</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 text-neutral-400 py-20">
        <p className="text-sm font-medium">No cards available.</p>
        {onClose && (
          <button onClick={onClose} className="mt-4 text-xs underline">Go back</button>
        )}
      </div>
    )
  }

  const card = cards[currentIndex]
  const total = cards.length
  const progress = ((currentIndex + 1) / total) * 100
  const bookmarked = isBookmarked(card.id)
  const isLast = currentIndex === total - 1
  const cardIsEnding = isEndingCard(card)

  const handleBookmarkAndNext = () => {
    if (!bookmarked && data) {
      if (cardIsEnding) {
        addBookmark({
          cardId: card.id,
          lessonId: data.lessonId,
          lessonTitle: data.lessonTitle,
          expression: card.conjugatedForm,
          meaning: card.baseWordMeaning || card.endingMeaning,
          exampleSentence: card.scriptSentence,
          exampleTranslation: card.scriptTranslation,
          type: 'expression',
          subType: 'ending',
          conjugationBadges: card.conjugationBadges,
          baseWord: card.baseWord,
        })
      } else {
        addBookmark({
          cardId: card.id,
          lessonId: data.lessonId,
          lessonTitle: data.lessonTitle,
          expression: card.expression,
          meaning: card.meaning,
          exampleSentence: card.exampleSentence,
          exampleTranslation: card.exampleTranslation,
          type: 'expression',
          subType: 'word',
        })
      }
    }
    if (isLast && onComplete) onComplete()
    else goNext()
  }

  const handleSkip = () => {
    if (isLast && onComplete) onComplete()
    else goNext()
  }

  const relatedVideosSection = hideRelatedVideos ? null : (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
        This expression in other videos
      </p>
      {card.relatedVideos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {card.relatedVideos.map((rv) => <RelatedVideoItem key={rv.id} video={rv} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-5 text-center">
          <p className="text-xs text-neutral-400">No other videos with this expression.</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white relative">
      
      {/* 헤더: 학습 모드일 때만 프로그레스 바 표시 (리뷰 모드 헤더는 부모에서 관리) */}
      {!isReviewMode && (
        <div className="shrink-0 px-8 py-3 bg-white border-b border-neutral-100 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-neutral-400 shrink-0">
            <span className="font-bold text-neutral-700">{currentIndex + 1}</span>
            <span className="mx-1 text-neutral-300">/</span>
            {total}
          </span>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">

          {/* 좌: 영상 (공통) */}
          <div className="order-1 flex flex-col gap-6 border-neutral-100 p-8 lg:order-1 lg:border-r">
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                Video Segment
              </p>
              <VideoSegmentPlayer
                youtubeId={card.video.youtubeId}
                startSec={card.video.startSec}
                endSec={card.video.endSec}
              />
            </div>

            <div className="hidden lg:block">
              {relatedVideosSection}
            </div>
          </div>

            {/* 우: 카드 타입별 콘텐츠 */}
          <div className="order-2 flex flex-col gap-4 px-8 pb-4 pt-2 lg:order-2 lg:gap-6 lg:p-8">

            {/* ── 어미 변형 카드 ── */}
            {cardIsEnding ? (
              <div>
                {/* 활용형 (영상에 나온 그대로) — 큰 글씨 */}
                <div className="mb-1 flex items-start justify-between gap-4">
                  <h2 className="text-4xl font-bold text-neutral-950 leading-tight break-words">
                    <span className={isBlind
                      ? 'rounded-[0.18em] px-[0.08em] bg-neutral-300/80 text-transparent select-none'
                      : 'rounded-[0.18em] px-[0.08em]'
                    }>
                      {card.conjugatedForm}
                    </span>
                  </h2>
                  <button
                    onClick={() => setIsBlind(v => !v)}
                    className={`shrink-0 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isBlind
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-800'
                    }`}
                  >
                    {isBlind ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    Blind
                  </button>
                </div>

                {/* 원래 단어의 뜻 */}
                {card.baseWordMeaning && (
                  <p className="text-xl font-semibold text-primary mb-4">{card.baseWordMeaning}</p>
                )}

                {/* 활용형 시각화: 사전형 + 배지 + 상세 토글 */}
                {(() => {
                  const hasDetail = card.conjugationBadges.some(b => b.removedDetail || b.addedDetail)
                  return (
                    <>
                      <div className="flex items-center gap-2 flex-wrap mb-6">
                        <span className="text-sm font-medium text-neutral-500">{card.baseWord}</span>
                        {card.conjugationBadges.map((badge, i) => (
                          <ConjugationBadgeTag key={i} badge={badge} />
                        ))}
                        {hasDetail && (
                          <button
                            onClick={() => setExpandedBadge(v => !v)}
                            className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-700 transition-colors ml-1"
                          >
                            {expandedBadge
                              ? <><ChevronUp className="w-3.5 h-3.5" /><span>Collapse</span></>
                              : <><ChevronDown className="w-3.5 h-3.5" /><span>Details</span></>
                            }
                          </button>
                        )}
                      </div>
                      {expandedBadge && <BadgeDetailPanel badges={card.conjugationBadges} />}
                    </>
                  )
                })()}

                <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 mb-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
                        Ending Pattern
                      </p>
                      <h3 className="text-base font-bold text-neutral-950">{card.ending}</h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary border border-primary-100">
                      {card.endingMeaning}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-700">{card.endingExplanation}</p>
                </div>

                <div className="h-px bg-neutral-100 mb-6" />

                {/* 스크립트 원문 */}
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                    Found in Script
                  </p>
                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-neutral-800 leading-relaxed mb-2">
                      {isBlind
                        ? <BlindHighlightWord text={card.scriptSentence} word={card.conjugatedForm} isBlind={isBlind} />
                        : <HighlightedSentence sentence={card.scriptSentence} highlight={card.conjugatedForm} />
                      }
                    </p>
                    <p className="text-sm text-neutral-400 leading-relaxed">{card.scriptTranslation}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── 단어 카드 (기존) ── */
              <div>
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h2 className="text-4xl font-bold text-neutral-950 leading-tight break-words">
                    <span className={isBlind
                      ? 'rounded-[0.18em] px-[0.08em] bg-neutral-300/80 text-transparent select-none'
                      : 'rounded-[0.18em] px-[0.08em]'
                    }>
                      {card.expression}
                    </span>
                  </h2>
                  <button
                    onClick={() => setIsBlind(v => !v)}
                    className={`shrink-0 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isBlind
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-800'
                    }`}
                  >
                    {isBlind ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    Blind
                  </button>
                </div>

                <p className="mb-4 text-xl font-semibold text-primary">{card.meaning}</p>
                <div className="mb-4 h-px bg-neutral-100 lg:mb-6" />

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 lg:mb-3">Example</p>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 lg:p-4">
                    <p className="text-sm font-medium text-neutral-800 leading-relaxed mb-2">
                      <BlindHighlightWord text={card.exampleSentence} word={card.expression} isBlind={isBlind} />
                    </p>
                    <p className="text-sm text-neutral-400 leading-relaxed">{card.exampleTranslation}</p>
                  </div>
                </div>

                {card.dailyConversation && card.dailyConversation.length > 0 && (
                  <div className="mt-5 border-t border-neutral-100 pt-4 lg:mt-8 lg:pt-6">
                    <div className="mb-3 flex items-center gap-1.5 lg:mb-4">
                      <MessageCircle className="w-3.5 h-3.5 text-neutral-400" />
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                        How It&apos;s Used in Real Life
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {card.dailyConversation.map((turn, i) => (
                        <ConversationBubble key={i} turn={turn} onSpeak={speak} blindWord={card.expression} isBlind={isBlind} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pb-6 lg:hidden">
          {relatedVideosSection}
        </div>
      </div>

      {/* 액션 버튼: 학습 모드일 때만 표시, hideActions가 아닐 때만 표시 */}
      {!isReviewMode && !hideActions && (
        <div className="shrink-0 px-8 py-5 border-t border-neutral-100 bg-white">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button onClick={handleSkip}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold border-2 border-neutral-200 text-neutral-600 bg-white hover:border-neutral-400 hover:text-neutral-950 hover:bg-neutral-50 active:scale-[0.98] transition-all">
              {isLast ? 'Done' : 'Already Know'}
            </button>
            <button onClick={handleBookmarkAndNext}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold active:scale-[0.98] transition-all ${
                bookmarked
                  ? 'bg-primary-100 text-primary border-2 border-primary-200 hover:bg-primary-200'
                  : 'bg-neutral-950 text-white hover:bg-neutral-800 border-2 border-neutral-950'
              }`}>
              {bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              {isLast
                ? bookmarked ? 'Saved · Done' : 'Save & Done'
                : bookmarked ? 'Saved · Next' : 'Save to Bookmarks'}
            </button>
          </div>
        </div>
      )}

      {/* Prev / Next: 리뷰 모드에서는 항상 노출 (이동용) */}
      <div className="shrink-0 px-8 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
        <button onClick={goPrev} disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium border border-neutral-200 text-neutral-500 bg-white hover:border-neutral-400 hover:text-neutral-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-4 h-4" />Prev
        </button>
        <div />
        <button
          onClick={isLast && hideActions ? onComplete : goNext}
          disabled={isLast && !hideActions}
          className="flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium border border-neutral-200 text-neutral-500 bg-white hover:border-neutral-400 hover:text-neutral-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {isLast && hideActions ? 'Start Watching' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
