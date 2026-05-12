'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Play, ArrowUp, ChevronDown, Plus, AlertCircle, Loader2, CreditCard, Captions } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FlashcardTab from '@/components/features/flashcard/FlashcardTab'
import WatchTab from '@/components/features/watch/WatchTab'
import ChannelAvatar from '@/components/features/home/ChannelAvatar'
import DotField from '@/components/ui/DotField'
import { saveAuthToken, hasAuthToken } from '@/lib/api'
import { getPublicPreviewLessons, getLesson, checkVideoValidity, type LessonSummary } from '@/lib/lessonsApi'
import { ArrowLeft } from 'lucide-react'
import { loginWithGoogleIdToken } from '@/lib/authApi'
import { createWaitlistEntry } from '@/lib/waitlistApi'

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              type?: 'standard' | 'icon'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              width?: number
            },
          ) => void
        }
      }
    }
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services'

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Google sign-in.'))
    document.head.appendChild(script)
  })
}

// ─── 데이터 ────────────────────────────────────────────────────────────────

const FEATURE_LIST = [
  {
    chip: 'Dual Subtitles',
    title: 'Understand and learn naturally',
    description: 'Follow Korean and your language side by side with real content.',
    visualType: 'dualSubtitles' as const,
  },
  {
    chip: 'Cultural Notes',
    title: 'Discover hidden cultural context',
    description: 'Learn slang and reactions you won\'t find in textbooks.',
    visualType: 'culturalNotes' as const,
  },
  {
    chip: 'Flashcards',
    title: 'Learn real Korean expressions through flashcards',
    description: 'Review useful expressions, vocabulary, and grammar breakdowns through flashcards while exploring how similar expressions are used in other videos.',
    visualType: 'flashcards' as const,
  },
] as const

const REVIEWS = [
  {
    name: 'Olivia M.',
    country: '🇺🇸 USA',
    roleLabel: 'ARMY',
    text: 'This is the first tool that made BTS fandom expressions make sense to me. I finally understand the little phrases fans use with each other, the little jokes in comments, and why certain words keep showing up in fan content.',
  },
  {
    name: 'Haruka S.',
    country: '🇯🇵 Japan',
    roleLabel: 'Working Holiday Applicant',
    text: 'I am preparing for a working holiday, so I needed Korean I could actually use. Learning from real videos feels much more practical than memorizing isolated lists.',
  },
  {
    name: 'Tessa R.',
    country: '🇺🇸 USA',
    roleLabel: 'Casual Language Learner',
    text: 'Seeing proverbs inside real YouTube scenes made the meaning click naturally.',
  },
  {
    name: 'Minji K.',
    country: '🇰🇷 Korea',
    roleLabel: 'MONBEBE',
    text: 'The cultural notes are surprisingly useful. They explain reactions, slang, and hidden meanings that would normally go right past me.',
  },
  {
    name: 'Lucia P.',
    country: '🇪🇸 Spain',
    roleLabel: 'MY',
    text: 'My bookmarks keep growing over time. It feels like building a Korean vocabulary collection from the videos I actually enjoy.',
  },
  {
    name: 'Noah T.',
    country: '🇨🇦 Canada',
    roleLabel: 'CARAT',
    text: 'The bookmark feature is what keeps me coming back. I save expressions from emotional scenes and revisit them later when I want a quick review.',
  },
  {
    name: 'Aiko K.',
    country: '🇯🇵 Japan',
    roleLabel: 'Korean Language Education Major',
    text: 'Grammar endings and honorifics were always confusing for me. The breakdowns here are detailed enough that I can finally see why a speaker chose one form over another, and that has made a real difference when I rewatch clips.',
  },
  {
    name: 'Ewan F.',
    country: '🇦🇺 Australia',
    roleLabel: 'STAY',
    text: 'The flashcards feel connected to the actual scenes I watched, so review makes sense.',
  },
  {
    name: 'Zoe L.',
    country: '🇺🇸 USA',
    roleLabel: 'ENGENE',
    text: 'The dual subtitles are cleaner than other subtitle tools I tried. I can stay with the video instead of constantly checking whether I am in the right place.',
  },
  {
    name: 'Nina V.',
    country: '🇩🇪 Germany',
    roleLabel: 'NCTzen',
    text: 'I remember vocabulary better when it comes from an intense scene or a funny reaction. It feels more alive than drilling random word lists.',
  },
]

type FaqLevel = {
  title: string
  description: string
}

type FaqEntry = {
  question: string
  answer: string
  levels?: FaqLevel[]
}

type SubmittedVideoPreview = {
  title: string
  channelName: string
  thumbnailUrl: string
  note: string
}

type ModalFrameProps = {
  children: ReactNode
  ariaLabel: string
  onClose?: () => void
  panelClassName?: string
}

const UNSUPPORTED_CASES = [
  '360° videos',
  'YouTube Shorts',
  'Non-Korean videos',
  'Videos longer than 2 hours',
  'Videos that block external playback',
]

function extractYouTubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.hostname.includes('youtu.be')) {
      const id = parsedUrl.pathname.replace('/', '').trim()
      return id || null
    }

    const videoId = parsedUrl.searchParams.get('v')
    if (videoId) {
      return videoId
    }

    const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/]+)/)
    if (embedMatch?.[1]) {
      return embedMatch[1]
    }

    const shortsMatch = parsedUrl.pathname.match(/\/shorts\/([^/]+)/)
    if (shortsMatch?.[1]) {
      return shortsMatch[1]
    }

    return null
  } catch {
    return null
  }
}

function createPlaceholderThumbnail(label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#edf1ff" />
          <stop offset="100%" stop-color="#dfe6ff" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#7c8cff" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#7c8cff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="960" height="540" rx="42" fill="url(#bg)" />
      <rect width="960" height="540" rx="42" fill="url(#glow)" />
      <circle cx="480" cy="270" r="68" fill="white" opacity="0.92" />
      <path d="M465 233L531 270L465 307Z" fill="#1f2937" />
      <text x="480" y="402" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#4f46e5">${label}</text>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function buildFallbackSubmittedVideoPreview(url: string): SubmittedVideoPreview {
  const videoId = extractYouTubeVideoId(url)
  const thumbnailUrl = videoId && videoId.length >= 6
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : createPlaceholderThumbnail('Saved for early access')

  return {
    title: 'Submitted YouTube video',
    channelName: 'YouTube',
    thumbnailUrl,
    note: 'Queued for future lesson generation.',
  }
}

const FAQ_ITEMS: FaqEntry[] = [
  {
    question: 'Is Linko for beginners or advanced learners?',
    answer: 'Both. Linko offers beginner, intermediate, and advanced learning modes so you can learn Korean at the level that feels right for you.',
    levels: [
      {
        title: 'Beginner',
        description: 'You’re just starting to learn Korean and still rely heavily on subtitles.',
      },
      {
        title: 'Intermediate',
        description: 'You can understand some K-drama lines or K-pop lyrics, but fast conversations are still difficult.',
      },
      {
        title: 'Advanced',
        description: 'You can follow most Korean content and want to learn more natural expressions and nuance.',
      },
    ],
  },
  {
    question: 'How are the learning materials created?',
    answer: 'Linko’s lessons are designed and reviewed by team members with Korean linguistics major, combining AI generated learning materials with real Korean expressions, grammar explanations, and cultural context.',
  },
  {
    question: 'What languages does Linko support?',
    answer: 'Currently, Linko supports English. More languages will be added very soon.',
  },
  {
    question: 'Is Linko free to use?',
    answer: 'Yes. Linko offers a free plan. Free users can create up to 5 learning materials per week, while Pro users get unlimited access and exclusive study materials.',
  },
] as const

// ─── 서브 컴포넌트 ──────────────────────────────────────────────────────────

/** 기능 시각 요소 */
function FeatureVisual({ visualType }: { visualType: typeof FEATURE_LIST[number]['visualType'] }) {
  if (visualType === 'dualSubtitles') {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-7 sm:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="rounded-[24px] border border-neutral-200 bg-white overflow-hidden min-h-[440px]">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[440px]">
            <div className="border-b md:border-b-0 md:border-r border-neutral-100 bg-neutral-950 px-6 py-8 text-left text-white flex flex-col justify-between min-h-[220px] md:min-h-full">
              <div className="text-xs uppercase tracking-[0.24em] text-white/45">Korean</div>
              <div className="space-y-3">
                <p className="text-xl sm:text-2xl font-semibold leading-relaxed">오늘은 영상으로 공부해볼까요?</p>
                <p className="text-base text-white/70 leading-relaxed">자막과 함께 자연스럽게 의미를 따라가 보세요.</p>
              </div>
            </div>
            <div className="bg-white px-6 py-8 text-left text-neutral-950 flex flex-col justify-between min-h-[220px] md:min-h-full">
              <div className="text-xs uppercase tracking-[0.24em] text-primary-500">Native language</div>
              <div className="space-y-3">
                <p className="text-xl sm:text-2xl font-semibold leading-relaxed">Learn from real content, side by side.</p>
                <p className="text-base text-neutral-500 leading-relaxed">두 언어를 함께 보면 이해가 더 빠릅니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (visualType === 'culturalNotes') {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-7 sm:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] min-h-[440px]">
          <div className="rounded-[22px] bg-neutral-950 p-7 text-left text-white min-h-[440px] flex flex-col justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45 mb-6">Cultural Notes</p>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/8 border border-white/10 px-5 py-5">
                <p className="text-base font-semibold">“대박”</p>
                <p className="mt-1 text-base text-white/70">Used to express surprise, excitement, or admiration.</p>
              </div>
              <div className="rounded-2xl bg-white/8 border border-white/10 px-5 py-5">
                <p className="text-base font-semibold">Reaction culture</p>
                <p className="mt-1 text-base text-white/70">Why people say things a certain way in everyday Korean videos.</p>
              </div>
            </div>
          </div>
          <div className="rounded-[22px] border border-neutral-200 bg-white p-7 min-h-[440px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-4 w-24 rounded-full bg-primary-200" />
              <div className="h-4 w-4/5 rounded-full bg-neutral-200" />
              <div className="h-4 w-2/3 rounded-full bg-neutral-100" />
            </div>
            <div className="mt-6 rounded-2xl bg-neutral-50 border border-neutral-200 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-400 mb-2">Reference</p>
              <p className="text-base text-neutral-600 leading-relaxed">
                Slang, tone, and context explained in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-7 sm:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr] min-h-[440px]">
        <div className="rounded-[22px] border border-neutral-200 bg-white p-6 sm:p-7 min-h-[440px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Flashcards</span>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary">B1</span>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary-100 bg-primary-50 px-5 py-5">
              <p className="text-base font-semibold text-neutral-950">먹어보다</p>
              <p className="mt-1 text-sm text-neutral-500">to try eating / to give it a try</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-5">
              <p className="text-base font-semibold text-neutral-950">-아/어요</p>
              <p className="mt-1 text-sm text-neutral-500">polite present tense ending</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-5">
              <p className="text-base font-semibold text-neutral-950">진짜</p>
              <p className="mt-1 text-sm text-neutral-500">really / seriously</p>
            </div>
          </div>
        </div>
        <div className="rounded-[22px] bg-neutral-950 p-7 sm:p-9 text-white flex items-end justify-between min-h-[440px]">
          <div className="max-w-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45 mb-4">Review in context</p>
            <p className="text-2xl sm:text-3xl font-semibold leading-tight">
              Learn the expression, then see how it shows up again.
            </p>
          </div>
          <div className="hidden sm:block rounded-full border border-white/15 px-4 py-2 text-xs text-white/70">
            Similar usage across videos
          </div>
        </div>
      </div>
    </div>
  )
}

/** 기능 소개 한 블록 */
function FeatureBlock({ chip, title, description, visualType }: typeof FEATURE_LIST[number]) {
  return (
    <div className="py-14 sm:py-18">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-flex items-center justify-center rounded-pill bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 sm:px-5 sm:py-2.5 sm:text-[15px]">
          {chip}
        </span>
        <h3 className="mt-5 text-[38px] font-bold leading-[1.12] tracking-tight text-neutral-950 sm:text-[46px]">
          {title}
        </h3>
        <p className="mt-4 text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="mt-10 max-w-5xl mx-auto">
        <FeatureVisual visualType={visualType} />
      </div>
    </div>
  )
}

/** 리뷰 카드 */
function ReviewCard({ name, country, roleLabel, text }: typeof REVIEWS[number]) {
  return (
    <article className="w-[280px] shrink-0 rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:w-[420px] sm:rounded-[28px] sm:p-8">
      <div className="flex h-full flex-col justify-between gap-6 sm:gap-8">
        <p className="text-sm leading-[1.7] text-neutral-700 sm:text-[17px] sm:leading-[1.8]">
          &ldquo;{text}&rdquo;
        </p>
        <div className="border-t border-neutral-100 pt-4 sm:pt-5">
          <p className="text-sm font-semibold text-neutral-950 sm:text-base">{roleLabel}</p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0 sm:mt-2">
            <p className="text-xs font-medium text-neutral-600 sm:text-sm">{name}</p>
            <span className="text-xs text-neutral-400 sm:text-sm">{country}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

/** FAQ 항목 */
function FaqItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqEntry
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-t border-neutral-200">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 py-7 text-left transition-colors hover:text-neutral-950 group"
      >
        <span className="pt-1 text-sm font-semibold tracking-[0.18em] text-neutral-300 transition-colors group-hover:text-neutral-400">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-xl sm:text-2xl font-medium text-neutral-950">
          {item.question}
        </span>
        <div className="relative h-7 w-7 shrink-0 transition-transform duration-300 ease-in-out" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          <Plus className="absolute inset-0 h-7 w-7 stroke-[1.5] text-neutral-950" />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="pb-8 pl-9 pr-4 sm:pl-10 sm:pr-12">
          <p className="max-w-3xl text-[15px] leading-7 text-neutral-500 sm:text-base sm:leading-8">
            {item.answer}
          </p>

          {item.levels && (
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:gap-4">
              {item.levels.map((level: FaqLevel, levelIndex: number) => (
                <div
                  key={level.title}
                  className="rounded-[22px] border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.03)] sm:rounded-[28px] sm:p-6 sm:shadow-[0_14px_40px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-semibold text-primary sm:h-12 sm:w-12 sm:rounded-2xl sm:text-sm">
                      {String(levelIndex + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                        {level.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-6 text-neutral-500 sm:mt-3 sm:text-sm sm:leading-7">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ModalFrame({
  children,
  ariaLabel,
  onClose,
  panelClassName = '',
}: ModalFrameProps) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/55 px-4 py-8 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`relative w-full max-w-[560px] overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/70 bg-white px-5 pb-6 pt-5 shadow-[0_30px_100px_rgba(15,23,42,0.24)] sm:px-10 sm:pb-11 sm:pt-8 ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(124,140,255,0.14),transparent_68%)]" />
        {children}
      </div>
    </div>
  )
}

function ModalHeader({
  badge,
  eyebrow = 'LinKo',
  title,
  description,
}: {
  badge?: ReactNode
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {badge ? <div className="mb-3 sm:mb-5">{badge}</div> : null}
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400 sm:text-[11px]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-neutral-950 sm:mt-4 sm:text-[30px]">
        {title}
      </h2>
      <p className="mt-1.5 max-w-[420px] text-xs leading-6 text-neutral-500 sm:mt-3 sm:text-[15px] sm:leading-7">
        {description}
      </p>
    </div>
  )
}

/** 미허용 케이스 안내 모달 */
function UnsupportedCaseModal({
  isOpen,
  onClose,
  onPickOtherVideos,
}: {
  isOpen: boolean
  onClose: () => void
  onPickOtherVideos: () => void
}) {
  if (!isOpen) {
    return null
  }

  return (
    <ModalFrame ariaLabel="지원되지 않는 링크 안내 모달" onClose={onClose}>
      <div className="relative mx-auto max-w-[420px]">
        <ModalHeader
          badge={(
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#fff2f3] text-[#ff5f66] shadow-[0_16px_36px_rgba(255,95,102,0.12)] sm:h-16 sm:w-16 sm:rounded-[24px]">
              <AlertCircle className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          )}
          title="This link is not supported yet"
          description="Linko currently supports standard Korean YouTube videos. Some formats still cannot be converted into learning materials."
        />

        <div className="mt-4 sm:mt-9">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400 sm:text-[11px]">
            Unsupported cases
          </p>
          <div className="mt-2 sm:mt-4 grid gap-1.5 sm:gap-3">
            {UNSUPPORTED_CASES.map((item, index) => (
              <div
                key={item}
                className="rounded-[14px] sm:rounded-[20px] border border-neutral-200 bg-neutral-50 px-3 py-2 sm:px-4 sm:py-4"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-neutral-950 shadow-sm sm:h-9 sm:w-9 sm:text-sm">
                    {index + 1}
                  </div>
                  <p className="text-xs leading-5 text-neutral-700 sm:text-[15px] sm:leading-6">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 sm:mt-8 flex justify-center">
          <button
            type="button"
            onClick={onPickOtherVideos}
            className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Pick Other Videos
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}

/** 얼리 액세스 안내 모달 */
function EarlyAccessModal({
  isOpen,
  onClose,
  onPickOtherVideos,
  submittedVideoUrl,
}: {
  isOpen: boolean
  onClose: () => void
  onPickOtherVideos: () => void
  submittedVideoUrl: string | null
}) {
  const [videoPreview, setVideoPreview] = useState<SubmittedVideoPreview>(() =>
    buildFallbackSubmittedVideoPreview(submittedVideoUrl ?? 'https://youtube.com')
  )
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !submittedVideoUrl) {
      return
    }

    let isCancelled = false
    const fallbackPreview = buildFallbackSubmittedVideoPreview(submittedVideoUrl)

    setVideoPreview(fallbackPreview)
    setIsPreviewLoading(true)

    const loadPreview = async () => {
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(submittedVideoUrl)}&format=json`
        )

        if (!response.ok) {
          throw new Error('oEmbed request failed')
        }

        const data = await response.json() as {
          title?: string
          author_name?: string
          thumbnail_url?: string
        }

        if (isCancelled) {
          return
        }

        setVideoPreview({
          title: data.title?.trim() || fallbackPreview.title,
          channelName: data.author_name?.trim() || fallbackPreview.channelName,
          thumbnailUrl: data.thumbnail_url?.trim() || fallbackPreview.thumbnailUrl,
          note: 'Queued for future lesson generation.',
        })
      } catch {
        if (!isCancelled) {
          setVideoPreview(fallbackPreview)
        }
      } finally {
        if (!isCancelled) {
          setIsPreviewLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      isCancelled = true
    }
  }, [isOpen, submittedVideoUrl])

  if (!isOpen) {
    return null
  }

  return (
    <ModalFrame ariaLabel="얼리 액세스 안내 모달" onClose={onClose}>
      <div className="relative mx-auto flex max-w-[420px] flex-col items-center text-center">
        <ModalHeader
          title="You&rsquo;re officially on the early access list."
          description="When Linko officially launches, we&rsquo;ll email you an exclusive launch code."
        />

        <div className="mt-4 sm:mt-7 w-full overflow-hidden rounded-[20px] sm:rounded-[24px] border border-neutral-200 bg-neutral-50 p-2 sm:p-3 text-left shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
          <div className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] bg-white">
            <div className="relative aspect-[16/7] bg-neutral-100 sm:aspect-[16/9]">
              {isPreviewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
                </div>
              )}
              <img
                src={videoPreview.thumbnailUrl}
                alt={videoPreview.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            <div className="space-y-2 px-3 py-3 sm:space-y-3 sm:px-4 sm:py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-6 text-neutral-950 sm:text-[15px]">
                  {videoPreview.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[12px] text-neutral-500">
                  <span className="truncate">{videoPreview.channelName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[13px] leading-6 text-neutral-500">
          {videoPreview.note}
        </p>

        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            type="button"
            onClick={onPickOtherVideos}
            className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Pick Other Videos
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}

/** 로그인 안내 모달 */
function LoginModal({
  isOpen,
  onClose,
  onGoogleCredential,
  googleLoginError,
  isGoogleLoginLoading,
}: {
  isOpen: boolean
  onClose: () => void
  onGoogleCredential: (credential: string) => void
  googleLoginError?: string | null
  isGoogleLoginLoading?: boolean
}) {
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [googleButtonError, setGoogleButtonError] = useState<string | null>(null)
  const [isGoogleButtonReady, setIsGoogleButtonReady] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    setGoogleButtonError(null)
    setIsGoogleButtonReady(false)

    if (!clientId) {
      setGoogleButtonError('Google client id is missing. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID.')
      return
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) {
              setGoogleButtonError('Google did not return a credential.')
              return
            }
            onGoogleCredential(response.credential)
          },
        })

        googleButtonRef.current.replaceChildren()
        const buttonWidth = Math.min(320, (googleButtonRef.current.parentElement?.offsetWidth ?? 360) - 32)
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'continue_with',
          width: buttonWidth,
        })
        setIsGoogleButtonReady(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setGoogleButtonError(err instanceof Error ? err.message : 'Could not load Google sign-in.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, onGoogleCredential])

  if (!isOpen) {
    return null
  }

  return (
    <ModalFrame ariaLabel="로그인 모달" onClose={onClose}>
      <div className="relative mx-auto flex max-w-[420px] flex-col items-center py-4 text-center sm:py-6">
        <ModalHeader
          title="Start learning in seconds"
          description="Sign in with Google to turn your favorite YouTube videos into Korean lessons."
        />

        <div className="mt-8 flex min-h-[44px] w-full items-center justify-center sm:mt-10">
          {!isGoogleButtonReady && !googleButtonError && (
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          )}
          <div className={isGoogleLoginLoading ? 'pointer-events-none opacity-50' : ''} ref={googleButtonRef} />
        </div>

        {isGoogleLoginLoading && (
          <p className="mt-4 text-sm font-medium text-neutral-400">Connecting...</p>
        )}

        {(googleLoginError || googleButtonError) && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-500">
            {googleLoginError ?? googleButtonError}
          </p>
        )}

        <p className="mt-6 max-w-[360px] text-xs leading-6 text-neutral-400 sm:mt-8 sm:text-[13px] sm:leading-7">
          By continuing, you agree to our{' '}
          <button
            type="button"
            className="font-semibold text-neutral-500 underline underline-offset-4"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            className="font-semibold text-neutral-500 underline underline-offset-4"
          >
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </ModalFrame>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

const PLACEHOLDER_TEXTS = [
  'https://youtube.com/btscomebacklive',
  'https://youtube.com/blackpinkvid',
  'https://youtube.com/learnkoreanwithme',
  'https://youtube.com/koreanvlogdaily',
  'https://youtube.com/dramasceneclip',
]

const INPUT_PLACEHOLDER_TEXT = 'Paste a YouTube link to get started'

function createAvatarDataUrl(label: string, color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.12" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#g)" />
      <text
        x="48"
        y="56"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="34"
        font-weight="700"
        fill="#ffffff"
      >${label}</text>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const VIDEO_EXAMPLES = [
  {
    title: 'Korean Pronunciation Guide...',
    channelName: 'Korean Class 101',
    duration: '8:15',
    date: '2026.05.07',
    profileImageUrl: createAvatarDataUrl('K', '#7c8cff'),
  },
  {
    title: '10 Must-Know Korean Slang Words',
    channelName: 'Talk To Me In Korean',
    duration: '6:42',
    date: '2026.05.06',
    profileImageUrl: createAvatarDataUrl('T', '#9b7cff'),
  },
  {
    title: 'Korean Food Vocabulary with Chef',
    channelName: 'Maangchi',
    duration: '15:20',
    date: '2026.05.06',
    profileImageUrl: createAvatarDataUrl('M', '#4db7ff'),
  },
  {
    title: 'K-pop Lyrics Korean Lesson',
    channelName: 'SMTOWN',
    duration: '4:58',
    date: '2026.05.05',
    profileImageUrl: createAvatarDataUrl('S', '#6ee7b7'),
  },
  {
    title: 'BTS Spring Day — 가사로 배우는 한국어',
    channelName: 'BANGTANTV',
    duration: '5:42',
    date: '2026.05.05',
    profileImageUrl: createAvatarDataUrl('B', '#ff8a6d'),
  },
  {
    title: '눈물의 여왕 EP.14 — 명장면 대사 분석',
    channelName: 'KBS Drama',
    duration: '9:47',
    date: '2026.05.04',
    profileImageUrl: createAvatarDataUrl('D', '#f59e0b'),
  },
]

function LessonPreviewModal({
  isOpen,
  onClose,
  lessonId,
}: {
  isOpen: boolean
  onClose: () => void
  lessonId: string
}) {
  const [activeTab, setActiveTab] = useState<'flashcard' | 'watch'>('flashcard')
  const [lesson, setLesson] = useState<LessonSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  // 레슨 정보 가져오기
  useEffect(() => {
    if (isOpen && lessonId) {
      setIsLoading(true)
      getLesson(lessonId)
        .then(data => setLesson(data))
        .catch(err => console.error('Failed to fetch lesson:', err))
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, lessonId])

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setActiveTab('flashcard')
    }
  }, [isOpen])

  // 바디 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')

    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches)
    }

    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)

    return () => {
      mediaQuery.removeEventListener('change', updateViewport)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-white overflow-hidden">
      {/* ── 상단 레슨 정보 + 탭 (home UI와 동일하게) ── */}
      <div className="shrink-0 border-b border-neutral-100 bg-white">
        {/* 브레드크럼 / 닫기 */}
        <div className="px-8 pt-5 pb-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explorer
          </button>
        </div>

        {/* 레슨 메타 정보 */}
        <div className="px-8 pb-4">
          <h1 className="text-lg font-bold text-neutral-950 leading-snug truncate">
            {lesson?.title || (isLoading ? 'Loading...' : 'Lesson')}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {lesson?.channelName && (
              <span className="text-xs text-neutral-400">{lesson.channelName}</span>
            )}
            {lesson?.channelName && lesson?.date && (
              <span className="text-neutral-200 text-xs">·</span>
            )}
            {lesson?.date && (
              <span className="text-xs text-neutral-400">{lesson.date}</span>
            )}
          </div>
        </div>

        {/* 탭 바 */}
        <div className="px-8 flex items-center gap-1 border-t border-neutral-100">
          {([
            { key: 'flashcard', label: 'Flashcard', icon: CreditCard },
            { key: 'watch', label: 'Watch', icon: Captions },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
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

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : activeTab === 'flashcard' ? (
          <FlashcardTab
            lessonId={lessonId}
            isPublic={false}
            hideActions={true}
            hideRelatedVideos={true}
            onComplete={() => setActiveTab('watch')}
          />
        ) : (
          <WatchTab
            lessonId={lessonId}
            isPublic={false}
            onComplete={onClose}
            mobileStacked={isMobileViewport}
          />
        )}
      </div>
    </div>
  )
}

export default function LandingPageClient() {
  const router = useRouter()
  const [userInputValue, setUserInputValue] = useState('')
  const [animatedValue, setAnimatedValue] = useState('')
  const [isTypingActive, setIsTypingActive] = useState(true)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [isUnsupportedModalOpen, setIsUnsupportedModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isEarlyAccessModalOpen, setIsEarlyAccessModalOpen] = useState(false)
  const [loginModalSource, setLoginModalSource] = useState<'hero' | 'video' | 'cta' | null>(null)
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false)
  const [googleLoginError, setGoogleLoginError] = useState<string | null>(null)
  const [submittedVideoUrl, setSubmittedVideoUrl] = useState<string | null>(null)
  const [previewLessons, setPreviewLessons] = useState<any[]>([])
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null)
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null)
  const [isLoadingVideoCheck, setIsLoadingVideoCheck] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const isAnimating = isTypingActive && !isFocused && !userInputValue
  const showPlaceholderPreview = isFocused && !userInputValue
  const displayText = showPlaceholderPreview
    ? INPUT_PLACEHOLDER_TEXT
    : userInputValue || animatedValue
  const displayTextColor = showPlaceholderPreview || isAnimating
    ? 'text-neutral-400'
    : 'text-neutral-950'
  const showOverlayText = isAnimating || showPlaceholderPreview

  useEffect(() => {
    getPublicPreviewLessons()
      .then(lessons => {
        if (lessons && lessons.length > 0) {
          setPreviewLessons(lessons)
        }
      })
      .catch(err => console.error('Failed to fetch preview lessons:', err))
  }, [])

  useEffect(() => {
    if (isFocused || userInputValue) {
      return
    }

    const activeText = PLACEHOLDER_TEXTS[placeholderIndex]
    let currentIndex = 0
    let isDeleting = false
    let startTimeoutId: number | undefined
    let typeIntervalId: number | undefined
    let holdTimeoutId: number | undefined
    let deleteIntervalId: number | undefined
    let restartTimeoutId: number | undefined

    const syncCursorToEnd = () => {
      window.requestAnimationFrame(() => {
        const length = inputRef.current?.value.length ?? 0
        inputRef.current?.setSelectionRange(length, length)
      })
    }

    startTimeoutId = window.setTimeout(() => {
      typeIntervalId = window.setInterval(() => {
        if (!isDeleting) {
          currentIndex += 1
          setAnimatedValue(activeText.slice(0, currentIndex))
          syncCursorToEnd()

          if (currentIndex >= activeText.length) {
            isDeleting = true
            window.clearInterval(typeIntervalId)
            holdTimeoutId = window.setTimeout(() => {
              deleteIntervalId = window.setInterval(() => {
                currentIndex -= 1
                setAnimatedValue(activeText.slice(0, currentIndex))
                syncCursorToEnd()

                if (currentIndex <= 0) {
                  window.clearInterval(deleteIntervalId)
                  setAnimatedValue('')
                  restartTimeoutId = window.setTimeout(() => {
                    setPlaceholderIndex((current) => (current + 1) % PLACEHOLDER_TEXTS.length)
                  }, 1000)
                }
              }, 55)
            }, 2000)
          }
        }
      }, 55)
    }, 1000)

    return () => {
      if (startTimeoutId) {
        window.clearTimeout(startTimeoutId)
      }
      if (typeIntervalId) {
        window.clearInterval(typeIntervalId)
      }
      if (deleteIntervalId) {
        window.clearInterval(deleteIntervalId)
      }
      if (holdTimeoutId) {
        window.clearTimeout(holdTimeoutId)
      }
      if (restartTimeoutId) {
        window.clearTimeout(restartTimeoutId)
      }
    }
  }, [isFocused, placeholderIndex, userInputValue])

  const handleFocus = () => {
    setIsFocused(true)
    setIsTypingActive(false)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!userInputValue) {
      setAnimatedValue('')
      setIsTypingActive(true)
    }
  }

  const handleScrollCueClick = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('video-explorer-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleHeroSubmit = async () => {
    const trimmedValue = userInputValue.trim()

    if (!trimmedValue) {
      return
    }

    const isYoutube = trimmedValue.includes('youtube.com/') || trimmedValue.includes('youtu.be/')
    const isShorts = trimmedValue.includes('/shorts/')

    // 1. 기본적인 패턴 체크 (프론트)
    if (!trimmedValue.startsWith('https://') || !isYoutube || isShorts) {
      setIsLoginModalOpen(false)
      setIsEarlyAccessModalOpen(false)
      setIsUnsupportedModalOpen(true)
      setSubmittedVideoUrl(null)
      return
    }

    // 2. 백엔드 상세 검증 호출
    try {
      setIsLoadingVideoCheck(true)
      await checkVideoValidity(trimmedValue)

      // 검증 통과 시 로그인 진행
      setIsUnsupportedModalOpen(false)
      setIsEarlyAccessModalOpen(false)
      setSubmittedVideoUrl(trimmedValue)
      setLoginModalSource('hero')
      setIsLoginModalOpen(true)
    } catch (err) {
      // 360도 영상, 2시간 초과, 외부재생 불가 등 백엔드에서 던진 상세 에러 처리
      setIsLoginModalOpen(false)
      setIsEarlyAccessModalOpen(false)
      setIsUnsupportedModalOpen(true)
      setSubmittedVideoUrl(null)
    } finally {
      setIsLoadingVideoCheck(false)
    }
  }

  const handleCloseUnsupportedModal = () => {
    setIsUnsupportedModalOpen(false)
  }

  const handleOpenLoginModal = (source: 'video' | 'cta' = 'video') => {
    setGoogleLoginError(null)
    setLoginModalSource(source)
    setIsLoginModalOpen(true)
  }

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false)
    setGoogleLoginError(null)
  }

  const handleGoogleCredential = (credential: string) => {
    setIsGoogleLoginLoading(true)
    setGoogleLoginError(null)

    loginWithGoogleIdToken(credential)
      .then(async (login) => {
        saveAuthToken(login.access_token)
        setIsLoginModalOpen(false)
        setGoogleLoginError(null)

        if (loginModalSource === 'hero') {
          if (submittedVideoUrl) {
            await createWaitlistEntry(submittedVideoUrl)
          }
          setIsEarlyAccessModalOpen(true)
        } else if (pendingLessonId) {
          setPreviewLessonId(pendingLessonId)
          setPendingLessonId(null)
          handleCloseLoginModal()
        } else {
          router.push('/home')
        }

        setLoginModalSource(null)
      })
      .catch((err) => {
        setGoogleLoginError(err instanceof Error ? err.message : 'Google login failed.')
      })
      .finally(() => {
        setIsGoogleLoginLoading(false)
      })
  }

  const handleCloseEarlyAccessModal = () => {
    setIsEarlyAccessModalOpen(false)
  }

  const handlePickOtherVideos = () => {
    handleCloseUnsupportedModal()
    document.getElementById('video-explorer-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handlePickOtherVideosFromEarlyAccess = () => {
    handleCloseEarlyAccessModal()
    document.getElementById('video-explorer-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      <LessonPreviewModal
        isOpen={!!previewLessonId}
        onClose={() => setPreviewLessonId(null)}
        lessonId={previewLessonId || '15'}
      />
      <EarlyAccessModal
        isOpen={isEarlyAccessModalOpen}
        onClose={handleCloseEarlyAccessModal}
        onPickOtherVideos={handlePickOtherVideosFromEarlyAccess}
        submittedVideoUrl={submittedVideoUrl}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onGoogleCredential={handleGoogleCredential}
        googleLoginError={googleLoginError}
        isGoogleLoginLoading={isGoogleLoginLoading}
      />
      <UnsupportedCaseModal
        isOpen={isUnsupportedModalOpen}
        onClose={handleCloseUnsupportedModal}
        onPickOtherVideos={handlePickOtherVideos}
      />

      <header className="sticky top-0 z-50 -mb-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-start">
          <span className="text-xl font-bold text-neutral-950 tracking-tight">LinKo</span>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative flex min-h-screen flex-col bg-white">
          {/* 1. 최하단 기본 배경색 (순수 화이트) */}
          <div className="absolute inset-0 bg-white" />

          {/* 2. 도트 필드 (히어로 아래까지 확장 및 자연스러운 페이드) */}
          <DotField
            dotRadius={2.5}
            dotSpacing={38}
            bulgeStrength={30}
            glowRadius={220}
            sparkle={false}
            waveAmplitude={0}
            cursorRadius={300}
            cursorForce={1}
            bulgeOnly
            gradientFrom="#B8B8B8"
            gradientTo="transparent" // 아래로 갈수록 투명하게
            glowColor="transparent"
            className="absolute inset-x-0 top-0 z-[1] h-full marketing-hero-dot-field"
          />

          {/* 3. 메인 콘텐츠 */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
            <div className="max-w-5xl mx-auto w-full text-center">
              {/* Social Proof */}
              <div className="mb-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                <div className="flex -space-x-2">
                  <img src="/images/social/user-1.png" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  <img src="/images/social/user-2.png" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  <img src="/images/social/user-3.png" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                </div>
                <p className="max-w-[18rem] text-center text-sm font-medium text-neutral-500 sm:max-w-none sm:text-base">
                  Korean learners from <span className="font-bold text-neutral-950">72+ countries</span> are trying Linko.
                </p>
              </div>

              <div className="mx-auto max-w-4xl">
                <h1 className="text-[clamp(2.5rem,11vw,5.125rem)] font-bold leading-[1.08] tracking-[-0.04em] text-neutral-950 sm:text-[clamp(3.25rem,7vw,5.125rem)]">
                  Learn Real Korean
                  <br />
                  with any
                  <br />
                  <span className="bg-gradient-to-r from-primary-800 via-primary-500 via-primary-400 via-primary-500 to-primary-800 bg-clip-text text-transparent animate-text-shimmer">
                    YouTube Video
                  </span>
                </h1>
              </div>

              <p className="mt-4 mx-auto max-w-2xl text-sm leading-relaxed text-neutral-600 sm:mt-6 sm:text-[clamp(1.125rem,2vw,1.3125rem)]">
                Get <span className="font-bold text-neutral-950">vocab</span>, <span className="font-bold text-neutral-950">grammar notes</span>, and <span className="font-bold text-neutral-950">dual subtitles</span> from any video.
              </p>

              {/* URL 입력 */}
              <div className="mx-auto mt-6 flex min-h-[140px] max-w-2xl items-end gap-3 rounded-[28px] border border-neutral-300 bg-white px-4 py-4 ring-[10px] ring-neutral-100/80 shadow-sm transition-all sm:mt-14 sm:min-h-[168px] sm:gap-4 sm:rounded-[32px] sm:px-6 sm:py-6 sm:ring-[12px]">
                <div className="relative flex-1 self-stretch">
                  <textarea
                    ref={inputRef}
                    value={isAnimating ? animatedValue : userInputValue}
                    placeholder={INPUT_PLACEHOLDER_TEXT}
                    rows={2}
                    className={`h-full w-full resize-none bg-transparent align-top outline-none text-[16px] leading-[1.55] sm:text-[17px] sm:leading-[1.6] ${showOverlayText
                      ? 'text-transparent caret-transparent placeholder:text-transparent'
                      : 'text-neutral-950 caret-neutral-500 placeholder:text-neutral-400'
                      }`}
                    onChange={(event) => setUserInputValue(event.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                  {showOverlayText && (
                    <div className={`pointer-events-none absolute left-0 top-0 inline-flex items-center text-[17px] font-normal leading-[1.6] ${displayTextColor}`}>
                      {showPlaceholderPreview ? (
                        <>
                          <span className="relative top-px h-[1.15em] w-px shrink-0 bg-neutral-500 animate-[blink_1s_step-end_infinite]" />
                          <span className="ml-0.5 whitespace-pre">{displayText}</span>
                        </>
                      ) : (
                        <>
                          <span className="whitespace-pre">{displayText}</span>
                          <span className="relative top-px ml-0.5 h-[1.15em] w-px shrink-0 bg-neutral-500 animate-[blink_1s_step-end_infinite]" />
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!userInputValue.trim() || isLoadingVideoCheck}
                  onClick={handleHeroSubmit}
                  className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-full bg-neutral-950 text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-950 disabled:text-white disabled:opacity-35 sm:h-12 sm:w-12"
                  aria-label="링크 변환"
                >
                  {isLoadingVideoCheck ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin sm:h-5 sm:w-5" />
                  ) : (
                    <ArrowUp className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>

            </div>

          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 sm:bottom-10">
            <a
              href="#video-explorer-section"
              onClick={handleScrollCueClick}
              className="pointer-events-auto mx-auto flex w-fit flex-col items-center justify-center gap-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 transition-colors hover:text-neutral-700"
            >
              <span>Pick a video to start learning</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </a>
          </div>
        </section>

        {/* ── Video Explorer ── */}
        <section id="video-explorer-section" className="py-16 bg-white sm:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
              <h2 className="text-[40px] font-bold leading-[1.08] tracking-tight text-neutral-950 sm:text-[52px]">
                Start with these videos
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
                Start from videos people already love.
              </p>
            </div>

            {/* 모바일에서는 가로 스크롤로 전환해서 세로 길이를 줄입니다. */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:mx-0 lg:grid-cols-3">
              {(previewLessons.length > 0 ? previewLessons : VIDEO_EXAMPLES).map((video: any) => (
                <div
                  key={video.id || video.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const lessonId = video.id || '3'
                    if (hasAuthToken()) {
                      setPreviewLessonId(lessonId)
                    } else {
                      setPendingLessonId(lessonId)
                      handleOpenLoginModal('video')
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      const lessonId = video.id || '3'
                      if (hasAuthToken()) {
                        setPreviewLessonId(lessonId)
                      } else {
                        setPendingLessonId(lessonId)
                        handleOpenLoginModal('video')
                      }
                    }
                  }}
                  className="w-[82vw] max-w-[320px] shrink-0 rounded-xl border border-neutral-200 bg-neutral-100 overflow-hidden cursor-pointer group transition-all hover:border-neutral-300 hover:shadow-md sm:w-auto sm:max-w-none sm:shrink"
                >
                  <div className="aspect-video relative overflow-hidden bg-neutral-200">
                    <img
                      src={video.thumbnailUrl || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg` : `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                        <Play className="w-5 h-5 text-neutral-900 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                        {video.duration || '0:00'}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ChannelAvatar
                        name={video.channelName}
                        profileImageUrl={video.profileImageUrl}
                        size="sm"
                        className="mt-0.5 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-neutral-950 leading-tight truncate">
                          {video.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <p className="text-[13px] font-medium text-neutral-500 truncate">{video.channelName}</p>
                          <span className="text-[13px] text-neutral-300">·</span>
                          <p className="text-[13px] font-medium text-neutral-500 shrink-0">{video.date || 'Today'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-16 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="divide-y divide-neutral-100">
              {FEATURE_LIST.map((feature) => (
                <FeatureBlock key={feature.chip} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="border-t border-neutral-100 bg-white py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
              <h2 className="text-[30px] font-bold leading-[1.1] tracking-tight text-neutral-950 sm:text-[52px]">
                Real reviews from Global Users
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:mt-5 sm:text-lg sm:leading-8">
                Beta users across 72+ countries say LinKo fits naturally into their study routine.
              </p>
            </div>

            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-white to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-white to-transparent" />
              <div className="flex w-max gap-4 py-4 will-change-transform animate-[testimonial-marquee_96s_linear_infinite] sm:gap-5">
                {[...REVIEWS, ...REVIEWS].map((review, index) => (
                  <ReviewCard key={`${review.name}-${index}`} {...review} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 bg-primary-50">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-[40px] font-bold leading-[1.08] tracking-tight text-neutral-950 sm:text-[52px]">
              So, ready to give it a try?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              Start learning through your favorite videos.
            </p>
            <div className="mt-10 flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleOpenLoginModal('cta')}
                className="rounded-pill bg-neutral-950 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started for Free
              </button>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="border-t border-neutral-100 bg-white py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.45fr] lg:gap-20">
            <div>
              <h2 className="text-4xl font-bold leading-tight text-neutral-950 sm:text-5xl">
                Frequently
                <br />
                Asked Questions
              </h2>
            </div>
            <div className="border-b border-neutral-200">
              {FAQ_ITEMS.map((item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  index={index}
                  isOpen={openFaqIndex === index}
                  onToggle={() => setOpenFaqIndex((current) => (current === index ? null : index))}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <div className="grid grid-cols-1 gap-10 border-b border-neutral-800 pb-10 text-center md:grid-cols-[1.2fr_0.8fr] md:gap-8 md:text-left">
            <div className="md:pr-8">
              <span className="text-lg font-bold tracking-tight">LinKo</span>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-neutral-400 md:mx-0">
                Turn any YouTube video into a personalized Korean lesson. Learn the language you actually want to speak.
              </p>
            </div>
            <div className="grid gap-8 text-left sm:grid-cols-2 sm:gap-8">
              <div className="text-left">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Product</p>
                <div className="space-y-2">
                  <a href="#features" className="block text-sm text-neutral-400 transition-colors hover:text-white">
                    Features
                  </a>
                  <a href="#video-explorer-section" className="block text-sm text-neutral-400 transition-colors hover:text-white">
                    Start with these videos
                  </a>
                </div>
              </div>
              <div className="text-left sm:pt-[31px]">
                <p className="text-sm text-neutral-400">Contact</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-xs text-neutral-600">© 2026 LinKo. All rights reserved.</p>
            <p className="text-xs text-neutral-600">Made for Korean learners everywhere</p>
          </div>
        </div>
      </footer>
    </>
  )
}
