'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Play, ArrowUp, ChevronDown, Plus, X, AlertCircle } from 'lucide-react'
import ChannelAvatar from '@/components/features/home/ChannelAvatar'
import DotField from '@/components/ui/DotField'

// ─── 데이터 ────────────────────────────────────────────────────────────────

const FEATURE_LIST = [
  {
    chip: 'Dual Subtitles',
    title: 'Understand videos while learning naturally',
    description: 'Follow Korean and your native language side by side while watching real content, and learn more effectively through Blind.',
    visualType: 'dualSubtitles' as const,
  },
  {
    chip: 'Cultural Notes',
    title: 'Understand the culture behind the language',
    description: 'Learn Slang, reactions, and cultural references you won\'t find from other Korean learning apps.',
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
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-pill bg-neutral-800 text-white text-xs font-medium">
          {chip}
        </span>
        <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-neutral-950 leading-tight">
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
    <article className="w-[320px] shrink-0 rounded-[28px] border border-neutral-200 bg-white p-6 sm:w-[420px] sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex h-full flex-col justify-between gap-8">
        <p className="text-base leading-[1.8] text-neutral-700 sm:text-[17px]">
          &ldquo;{text}&rdquo;
        </p>
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-base font-semibold text-neutral-950">{roleLabel}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <p className="text-sm font-medium text-neutral-600">{name}</p>
            <span className="text-sm text-neutral-400">{country}</span>
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
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-8 pl-10 pr-12">
          <p className="max-w-3xl text-base leading-8 text-neutral-500">
            {item.answer}
          </p>

          {item.levels && (
            <div className="mt-8 grid gap-4">
              {item.levels.map((level: FaqLevel, levelIndex: number) => (
                <div
                  key={level.title}
                  className="rounded-[28px] border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-sm font-semibold text-primary">
                      {String(levelIndex + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                        {level.title}
                      </p>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-500">
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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/55 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`relative w-full max-w-[560px] overflow-hidden rounded-[36px] border border-white/70 bg-white px-7 pb-9 pt-7 shadow-[0_30px_100px_rgba(15,23,42,0.24)] sm:px-10 sm:pb-11 sm:pt-8 ${panelClassName}`}
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
      {badge ? <div className="mb-5">{badge}</div> : null}
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-neutral-950 sm:text-[32px]">
        {title}
      </h2>
      <p className="mt-3 max-w-[420px] text-[15px] leading-7 text-neutral-500 sm:text-base">
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
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#fff2f3] text-[#ff5f66] shadow-[0_16px_36px_rgba(255,95,102,0.12)]">
              <AlertCircle className="h-7 w-7" />
            </div>
          )}
          title="This link is not supported yet"
          description="Linko currently supports standard Korean YouTube videos. Some formats still cannot be converted into learning materials."
        />

        <div className="mt-9">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
            Unsupported cases
          </p>
          <div className="mt-4 grid gap-3">
            {UNSUPPORTED_CASES.map((item, index) => (
              <div
                key={item}
                className="rounded-[20px] border border-neutral-200 bg-neutral-50 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-neutral-950 shadow-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-neutral-700 sm:text-[15px]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
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

        <div className="mt-7 w-full overflow-hidden rounded-[24px] border border-neutral-200 bg-neutral-50 p-3 text-left shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
          <div className="relative overflow-hidden rounded-[20px] bg-white">
            <div className="relative aspect-[16/9] bg-neutral-100">
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

            <div className="space-y-3 px-4 py-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-6 text-neutral-950">
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

        <div className="mt-6 flex justify-center">
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
  onGoogleLogin,
}: {
  isOpen: boolean
  onClose: () => void
  onGoogleLogin: () => void
}) {
  if (!isOpen) {
    return null
  }

  return (
    <ModalFrame ariaLabel="로그인 모달" onClose={onClose}>
      <div className="relative mx-auto flex max-w-[420px] flex-col items-center text-center">
        <ModalHeader
          badge={(
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_30%_30%,#65d8ff_0%,#5a63ff_42%,#6c3cff_72%,#2b175e_100%)] shadow-[0_18px_44px_rgba(90,99,255,0.24)]">
              <div className="h-9 w-9 rounded-[16px] bg-white/18 backdrop-blur-[2px]" />
            </div>
          )}
          title="Start learning in seconds"
          description="Sign in with Google to turn your favorite YouTube videos into Korean lessons."
        />

        <button
          type="button"
          onClick={onGoogleLogin}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-[20px] border border-neutral-200 bg-neutral-50 px-6 py-5 text-[18px] font-semibold text-neutral-950 transition-all hover:border-primary-200 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:text-[19px]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.5 0-.72-.06-1.4-.18-2.06H12Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.96-.9 6.61-2.45l-3.3-2.56c-.91.62-2.08.99-3.31.99-2.54 0-4.7-1.72-5.47-4.03l-3.42 2.64C4.74 19.87 8.07 22 12 22Z"
              />
              <path
                fill="#4A90E2"
                d="M6.53 13.95A5.98 5.98 0 0 1 6.22 12c0-.68.12-1.33.31-1.95L3.11 7.41A10 10 0 0 0 2 12c0 1.61.38 3.13 1.11 4.59l3.42-2.64Z"
              />
              <path
                fill="#FBBC05"
                d="M12 5.98c1.47 0 2.79.5 3.83 1.48l2.87-2.87C16.95 2.98 14.69 2 12 2 8.07 2 4.74 4.13 3.11 7.41l3.42 2.64c.77-2.31 2.93-4.07 5.47-4.07Z"
              />
            </svg>
          </span>
          <span>Login with Google</span>
        </button>

        <p className="mt-8 max-w-[360px] text-[14px] leading-7 text-neutral-400 sm:text-[15px]">
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

export default function LandingPage() {
  const [userInputValue, setUserInputValue] = useState('')
  const [animatedValue, setAnimatedValue] = useState('')
  const [isTypingActive, setIsTypingActive] = useState(true)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [isUnsupportedModalOpen, setIsUnsupportedModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isEarlyAccessModalOpen, setIsEarlyAccessModalOpen] = useState(false)
  const [loginModalSource, setLoginModalSource] = useState<'hero' | 'video' | 'cta' | null>(null)
  const [submittedVideoUrl, setSubmittedVideoUrl] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)
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
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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

  const handleScrollCueClick = () => {
    document.getElementById('video-explorer-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleHeroSubmit = () => {
    const trimmedValue = userInputValue.trim()

    if (!trimmedValue) {
      return
    }

    if (!trimmedValue.startsWith('https://')) {
      setIsLoginModalOpen(false)
      setIsEarlyAccessModalOpen(false)
      setIsUnsupportedModalOpen(true)
      setSubmittedVideoUrl(null)
      return
    }

    setIsUnsupportedModalOpen(false)
    setIsEarlyAccessModalOpen(false)
    setSubmittedVideoUrl(trimmedValue)
    setLoginModalSource('hero')
    setIsLoginModalOpen(true)
  }

  const handleCloseUnsupportedModal = () => {
    setIsUnsupportedModalOpen(false)
  }

  const handleOpenLoginModal = (source: 'video' | 'cta' = 'video') => {
    setLoginModalSource(source)
    setIsLoginModalOpen(true)
  }

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false)
  }

  const handleGoogleLogin = () => {
    setIsLoginModalOpen(false)

    if (loginModalSource === 'hero') {
      setIsEarlyAccessModalOpen(true)
    }

    setLoginModalSource(null)
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
      <EarlyAccessModal
        isOpen={isEarlyAccessModalOpen}
        onClose={handleCloseEarlyAccessModal}
        onPickOtherVideos={handlePickOtherVideosFromEarlyAccess}
        submittedVideoUrl={submittedVideoUrl}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onGoogleLogin={handleGoogleLogin}
      />
      <UnsupportedCaseModal
        isOpen={isUnsupportedModalOpen}
        onClose={handleCloseUnsupportedModal}
        onPickOtherVideos={handlePickOtherVideos}
      />

      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-950 tracking-tight">LinKo</span>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-white">
          {/* 1. 최하단 기본 배경색 (순수 화이트) */}
          <div className="absolute inset-0 bg-white" />

          {/* 2. 도트 필드 */}
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
            gradientFrom="#B8B8B8" // 아주 미세하게 진해진 그레이
            gradientTo="#B8B8B8"   // 아주 미세하게 진해진 그레이
            glowColor="transparent" // 마우스 주변 보라색 블러 제거
            className="absolute inset-0 z-[1]"
          />

          {/* 3. 메인 콘텐츠 */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-20">
            <div className="max-w-5xl mx-auto w-full text-center">
              {/* Social Proof */}
              <div className="mb-7 flex items-center justify-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-400" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-300" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-200" />
                </div>
                <p className="text-base font-medium text-neutral-600">
                  Korean learners from 72+ countries are trying Linko.
                </p>
              </div>

              <div className="mx-auto max-w-4xl">
                <h1 className="text-[52px] font-bold leading-[1.1] tracking-[-0.04em] text-neutral-950 sm:text-[70px] lg:text-[82px]">
                  Learn Real Korean
                  <br />
                  with any
                  <br />
                  <span className="relative inline-block">
                    YouTube Video
                  </span>
                </h1>
              </div>

              <p className="text-lg text-neutral-600 mt-6 max-w-2xl mx-auto leading-relaxed sm:text-[21px]">
                Get vocab, grammar notes, and dual subtitles from any video.
              </p>

              {/* URL 입력 */}
              <div className="max-w-2xl mx-auto mt-14 flex min-h-[168px] items-end gap-4 rounded-[32px] border border-neutral-300 bg-white px-6 py-6 ring-[12px] ring-neutral-100/80 shadow-sm transition-all">
                <div className="relative flex-1 self-stretch">
                  <textarea
                    ref={inputRef}
                    value={isAnimating ? animatedValue : userInputValue}
                    placeholder={INPUT_PLACEHOLDER_TEXT}
                    rows={2}
                    className={`h-full w-full resize-none bg-transparent align-top outline-none text-[17px] leading-[1.6] ${
                      showOverlayText
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
                  disabled={!userInputValue.trim()}
                  onClick={handleHeroSubmit}
                  className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-neutral-950 text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-950 disabled:text-white disabled:opacity-35"
                  aria-label="링크 변환"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-8 sm:bottom-10">
            <button
              type="button"
              onClick={handleScrollCueClick}
              className="pointer-events-auto mx-auto flex flex-col items-center justify-center gap-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 transition-colors hover:text-neutral-700"
            >
              <span>Pick a video to start learning</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </section>

        {/* ── Video Explorer ── */}
        <section id="video-explorer-section" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mx-auto mb-10 text-center">
              <h2 className="text-3xl font-bold text-neutral-950 mt-2 mb-3">
                Start with these videos
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Start from videos people already love.
              </p>
            </div>

            {/* 비디오 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIDEO_EXAMPLES.map((video) => (
                <div
                  key={video.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenLoginModal('video')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleOpenLoginModal('video')
                    }
                  }}
                  className="rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden cursor-pointer group hover:shadow-md hover:border-neutral-300 transition-all"
                >
                  <div className="aspect-video flex items-center justify-center bg-neutral-100 group-hover:bg-neutral-200 transition-colors relative">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Play className="w-4 h-4 text-neutral-600 ml-0.5" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-3">
                    <div className="flex items-start gap-3">
                      <ChannelAvatar
                        name={video.channelName}
                        profileImageUrl={video.profileImageUrl}
                        size="sm"
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-950 truncate">
                          {video.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <p className="text-xs text-neutral-500 truncate">{video.channelName}</p>
                          <span className="text-xs text-neutral-300">·</span>
                          <p className="text-xs text-neutral-500 shrink-0">{video.date}</p>
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
            <h2 className="text-3xl font-bold text-neutral-950 text-center mb-2">
              Everything you need to learn Korean naturally
            </h2>
            <p className="text-sm text-neutral-500 text-center mb-0 max-w-2xl mx-auto">
              From Dual Subtitles to Personalized quizzed, Linko turns video into an interactive lessons.
            </p>

            <div className="divide-y divide-neutral-100">
              {FEATURE_LIST.map((feature) => (
                <FeatureBlock key={feature.chip} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-neutral-950 mt-2 mb-3">
                Real reviews from Global Users
              </h2>
              <p className="text-sm text-neutral-400">
                Beta users across 72+ countries say LinKo fits naturally into their study routine.
              </p>
            </div>

            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-white to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-white to-transparent" />
              <div className="flex w-max gap-5 animate-[testimonial-marquee_96s_linear_infinite] will-change-transform py-4">
                {[...REVIEWS, ...REVIEWS].map((review, index) => (
                  <ReviewCard key={`${review.name}-${index}`} {...review} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              So, ready to give it a try?
            </h2>
            <p className="text-primary-200 text-base mb-10 leading-relaxed">
              Start learning through your favorite videos.
            </p>
            <div className="flex items-center justify-center">
                <button
                type="button"
                onClick={() => handleOpenLoginModal('cta')}
                className="rounded-pill bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-colors hover:bg-primary-50"
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
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
            <div className="md:col-span-2">
              <span className="text-lg font-bold tracking-tight">LinKo</span>
              <p className="text-sm text-neutral-400 mt-3 leading-relaxed max-w-xs">
                Turn any YouTube video into a personalized Korean lesson. Learn the language you actually want to speak.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">Product</p>
              {['Features', 'How it works', 'Pricing', 'Changelog'].map((link) => (
                <p key={link} className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer mb-2">{link}</p>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">Company</p>
              {['About', 'Blog', 'Contact', 'Privacy'].map((link) => (
                <p key={link} className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer mb-2">{link}</p>
              ))}
            </div>
          </div>
          <div className="pt-6 flex items-center justify-between">
            <p className="text-xs text-neutral-600">© 2026 LinKo. All rights reserved.</p>
            <p className="text-xs text-neutral-600">Made for Korean learners everywhere</p>
          </div>
        </div>
      </footer>
    </>
  )
}
