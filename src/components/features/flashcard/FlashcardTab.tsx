'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Volume2, ChevronLeft, ChevronRight, Play,
  ExternalLink, Bookmark, BookmarkCheck,
  Repeat, Gauge, MessageCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import { MOCK_FLASHCARDS } from './mockFlashcards'
import { useBookmarks } from '@/hooks/useBookmarks'
import type {
  RelatedVideo, ConversationTurn, ConjugationBadge,
  EndingCard, EndingCategory, BadgePartDetail,
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

function speak(text: string, slow: boolean) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = slow ? 0.5 : 0.9
  window.speechSynthesis.speak(utterance)
}

function isEndingCard(card: { type?: string }): card is EndingCard {
  return card.type === 'ending'
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function VideoSegmentPlayer({ youtubeId, startSec, endSec, loop }: {
  youtubeId: string; startSec: number; endSec: number; loop: boolean
}) {
  const params = new URLSearchParams({
    start: String(startSec), end: String(endSec),
    autoplay: '1', rel: '0', modestbranding: '1',
    ...(loop ? { loop: '1', playlist: youtubeId } : {}),
  })
  const src = `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 shadow-lg">
      <iframe key={src} src={src} className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media" allowFullScreen title="Video segment" />
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
        <Play className="w-3 h-3" fill="currentColor" />
        {formatTime(startSec)} – {formatTime(endSec)}
      </div>
    </div>
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

function ConversationBubble({ turn, onSpeak }: { turn: ConversationTurn; onSpeak: (text: string) => void }) {
  return (
    <div className={`flex ${turn.isQuestion ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative group ${
        turn.isQuestion
          ? 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
          : 'bg-primary-50 text-primary-900 rounded-tr-sm border border-primary-100'
      }`}>
        <p>{turn.text}</p>
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
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-800 text-sm font-bold tracking-wide">
      {badge.removed && (
        <span className="text-orange-400">-{badge.removed}</span>
      )}
      <span className="text-teal-300">+{badge.added}</span>
    </span>
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
  lessonId: string
  onComplete: () => void
}

export default function FlashcardTab({ lessonId, onComplete }: FlashcardTabProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [slowMode, setSlowMode] = useState(false)
  const [loop, setLoop] = useState(true)
  const [expandedBadge, setExpandedBadge] = useState(false)

  const data = MOCK_FLASHCARDS[lessonId]

  const goNext = useCallback(() => {
    if (!data) return
    if (currentIndex < data.cards.length - 1) setCurrentIndex((i) => i + 1)
  }, [currentIndex, data])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }, [currentIndex])

  // 카드 이동 시 배지 상세 패널 닫기
  useEffect(() => {
    setExpandedBadge(false)
  }, [currentIndex])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 text-neutral-400 py-20">
        <p className="text-sm font-medium">No flashcards available for this lesson yet.</p>
      </div>
    )
  }

  const card = data.cards[currentIndex]
  const total = data.cards.length
  const progress = ((currentIndex + 1) / total) * 100
  const bookmarked = isBookmarked(card.id)
  const isLast = currentIndex === total - 1
  const cardIsEnding = isEndingCard(card)

  // 발음 재생 대상 텍스트 (단어 카드: 표현, 어미 카드: 활용형)
  const speakText = cardIsEnding ? card.conjugatedForm : card.expression

  const handleSpeak = () => {
    setIsSpeaking(true)
    speak(speakText, false)
    setTimeout(() => setIsSpeaking(false), 1500)
  }

  const handleBookmarkAndNext = () => {
    if (!bookmarked) {
      if (cardIsEnding) {
        addBookmark({
          cardId: card.id,
          lessonId: data.lessonId,
          lessonTitle: data.lessonTitle,
          expression: `${card.baseWord} → ${card.conjugatedForm}`,
          meaning: `(${card.ending}) ${card.endingMeaning}`,
          exampleSentence: card.scriptSentence,
          exampleTranslation: card.scriptTranslation,
          type: 'expression',
          subType: 'ending',
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
    if (isLast) onComplete()
    else goNext()
  }

  const handleSkip = () => {
    if (isLast) onComplete()
    else goNext()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* 진행 바 + 카드 번호 + 타입 뱃지 */}
      <div className="shrink-0 px-8 py-3 bg-white border-b border-neutral-100 flex items-center gap-3">
        {cardIsEnding && (
          <span className="shrink-0 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
            어미
          </span>
        )}
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

      {/* 콘텐츠 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">

          {/* 좌: 영상 (공통) */}
          <div className="p-8 lg:border-r border-neutral-100 flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                Video Segment
              </p>
              <VideoSegmentPlayer
                youtubeId={card.video.youtubeId}
                startSec={card.video.startSec}
                endSec={card.video.endSec}
                loop={loop}
              />
              <div className="flex gap-2 mt-3 justify-center">
                <button
                  onClick={() => setLoop((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    loop ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-800'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />Loop
                </button>
                <button
                  onClick={() => {
                    setIsSpeaking(true); setSlowMode(true)
                    speak(speakText, true)
                    setTimeout(() => { setIsSpeaking(false); setSlowMode(false) }, 2000)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    isSpeaking && slowMode ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-800'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />Slow
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                This expression in other videos
              </p>
              {card.relatedVideos.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {card.relatedVideos.map((rv) => <RelatedVideoItem key={rv.id} video={rv} />)}
                </div>
              ) : (
                <div className="py-5 text-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50">
                  <p className="text-xs text-neutral-400">No other videos with this expression.</p>
                </div>
              )}
            </div>
          </div>

          {/* 우: 카드 타입별 콘텐츠 */}
          <div className="p-8 flex flex-col gap-6">

            {/* ── 어미 변형 카드 ── */}
            {cardIsEnding ? (
              <div>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-5">
                  Ending &amp; Usage
                </p>

                {/* 활용형 (영상에 나온 그대로) — 큰 글씨 */}
                <div className="flex items-start gap-3 mb-1">
                  <h2 className="text-4xl font-bold text-neutral-950 leading-tight break-words">
                    {card.conjugatedForm}
                  </h2>
                  <button onClick={handleSpeak}
                    className={`mt-1.5 w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all duration-150 shrink-0 ${
                      isSpeaking && !slowMode
                        ? 'bg-primary text-white border-primary shadow-lg scale-95'
                        : 'bg-white text-neutral-400 border-neutral-200 hover:border-primary hover:text-primary hover:shadow-sm'
                    }`} title="활용형 발음 듣기">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 원래 단어의 뜻 */}
                {card.baseWordMeaning && (
                  <p className="text-base text-neutral-400 mb-4">{card.baseWordMeaning}</p>
                )}

                {/* 활용형 시각화: 사전형 + 배지 + 상세 토글 */}
                {(() => {
                  const hasDetail = card.conjugationBadges.some(b => b.removedDetail || b.addedDetail)
                  return (
                    <>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
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

                {/* 어미 이름 + 영어 의미 */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-sm font-bold border border-neutral-200">
                    -{card.ending}
                  </span>
                </div>
                <p className="text-xl font-semibold text-primary mb-3">{card.endingMeaning}</p>

                {/* 한국어 설명 */}
                <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                  {card.endingExplanation}
                </p>

                <div className="h-px bg-neutral-100 mb-6" />

                {/* 스크립트 원문 */}
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                    Found in Script
                  </p>
                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-neutral-800 leading-relaxed mb-2">
                      <HighlightedSentence
                        sentence={card.scriptSentence}
                        highlight={card.conjugatedForm}
                      />
                    </p>
                    <p className="text-sm text-neutral-400 leading-relaxed">{card.scriptTranslation}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── 단어 카드 (기존) ── */
              <div>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-5">
                  Word &amp; Meaning
                </p>
                <div className="flex items-start gap-3 mb-2">
                  <h2 className="text-4xl font-bold text-neutral-950 leading-tight break-words">
                    {card.expression}
                  </h2>
                  <button onClick={handleSpeak}
                    className={`mt-1.5 w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all duration-150 shrink-0 ${
                      isSpeaking && !slowMode
                        ? 'bg-primary text-white border-primary shadow-lg scale-95'
                        : 'bg-white text-neutral-400 border-neutral-200 hover:border-primary hover:text-primary hover:shadow-sm'
                    }`} title="Play pronunciation">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xl font-semibold text-primary mb-6">{card.meaning}</p>
                <div className="h-px bg-neutral-100 mb-6" />

                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Example</p>
                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-neutral-800 leading-relaxed mb-2">{card.exampleSentence}</p>
                    <p className="text-sm text-neutral-400 leading-relaxed">{card.exampleTranslation}</p>
                  </div>
                </div>

                {card.dailyConversation && card.dailyConversation.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-4">
                      <MessageCircle className="w-3.5 h-3.5 text-neutral-400" />
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                        How It&apos;s Used in Real Life
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {card.dailyConversation.map((turn, i) => (
                        <ConversationBubble key={i} turn={turn} onSpeak={(text) => speak(text, slowMode)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
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

      {/* Prev / Next */}
      <div className="shrink-0 px-8 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
        <button onClick={goPrev} disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium border border-neutral-200 text-neutral-500 bg-white hover:border-neutral-400 hover:text-neutral-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-4 h-4" />Prev
        </button>
        <div />
        <button onClick={goNext} disabled={isLast}
          className="flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium border border-neutral-200 text-neutral-500 bg-white hover:border-neutral-400 hover:text-neutral-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Next<ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
