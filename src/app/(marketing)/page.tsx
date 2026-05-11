'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, ArrowUp, ChevronDown, Plus, X } from 'lucide-react'
import ChannelAvatar from '@/components/features/home/ChannelAvatar'

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
    name: 'Sarah K.',
    country: '🇺🇸 USA',
    role: 'Product Designer',
    text: 'LinKo made Korean study feel lighter. I learn from videos I already watch, so it actually sticks.',
  },
  {
    name: 'James L.',
    country: '🇦🇺 Australia',
    role: 'Startup Operator',
    text: 'Dual subtitles helped me follow fast speech without losing the flow. It feels much more natural than drilling.',
  },
  {
    name: 'Mia T.',
    country: '🇯🇵 Japan',
    role: 'K-Drama Fan',
    text: 'I paste one clip in the morning and get a useful lesson back in seconds. That routine has lasted.',
  },
  {
    name: 'Daniel R.',
    country: '🇨🇦 Canada',
    role: 'Research Lead',
    text: 'Cultural notes fill in the context other apps skip. I finally understand why certain phrases land the way they do.',
  },
  {
    name: 'Lucia P.',
    country: '🇪🇸 Spain',
    role: 'Language Learner',
    text: 'The flashcards are practical because they come from real scenes. Review feels connected, not random.',
  },
  {
    name: 'Amina H.',
    country: '🇦🇪 UAE',
    role: 'Student',
    text: 'I can study with K-pop, vlogs, and interviews in one place. That variety keeps me consistent.',
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
function ReviewCard({ name, country, role, text }: typeof REVIEWS[number]) {
  return (
    <article className="w-[320px] shrink-0 rounded-[28px] border border-neutral-200 bg-white p-6 sm:w-[420px] sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex h-full flex-col justify-between gap-8">
        <p className="text-base leading-[1.8] text-neutral-700 sm:text-[17px]">
          &ldquo;{text}&rdquo;
        </p>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary">
            {name[0]}
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-950">{name}</p>
            <p className="text-sm text-neutral-400">
              {role} · {country}
            </p>
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
        className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 py-7 text-left transition-colors hover:text-neutral-950"
      >
        <span className="pt-1 text-sm font-semibold tracking-[0.18em] text-neutral-300">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-xl sm:text-2xl font-medium text-neutral-950">
          {item.question}
        </span>
        <span className="shrink-0 text-neutral-950">
          {isOpen ? <X className="h-7 w-7 stroke-[1.5]" /> : <Plus className="h-7 w-7 stroke-[1.5]" />}
        </span>
      </button>

      {isOpen && (
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
      )}
    </div>
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

  return (
    <>
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#090b28]/85 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-white tracking-tight">LinKo</span>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-[#05071f]">
          {/* 배경 장식 */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(103,120,255,0.12),transparent_34%),radial-gradient(circle_at_18%_100%,rgba(88,54,255,0.18),transparent_28%),radial-gradient(circle_at_82%_86%,rgba(85,192,255,0.16),transparent_26%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090b28] via-[#060821] to-[#080a23]" />

          <div className="relative flex flex-1 items-center pb-24 pt-10">
            <div className="max-w-3xl mx-auto w-full px-6 text-center">
              <h1 className="text-5xl font-bold text-white leading-tight tracking-tight mb-5">
                Learn real Korean with any
                <br />
                <span className="bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                  YouTube video
                </span>
              </h1>

              <p className="text-lg text-primary-100/80 mb-10 max-w-lg mx-auto leading-relaxed">
                Just paste a link to get vocab, grammar notes, cultural insights, and dual subtitles.
              </p>

              {/* URL 입력 */}
              <div className="max-w-xl mx-auto flex min-h-[152px] items-end gap-4 rounded-[32px] border border-neutral-200 bg-white px-6 py-6 shadow-md">
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
                  className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-primary text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-200"
                  aria-label="링크 변환"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-xs text-primary-100/60">Free to try · No credit card required</p>
            </div>

          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-8 sm:bottom-10">
            <button
              type="button"
              onClick={handleScrollCueClick}
              className="pointer-events-auto mx-auto flex flex-col items-center justify-center gap-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white/90 transition-colors hover:text-white"
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
                Real results from Global Users
              </h2>
              <p className="text-sm text-neutral-400">
                Beta users across 26+ countries say LinKo fits naturally into their study routine.
              </p>
            </div>

            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-24" />
              <div className="flex w-max gap-5 animate-[testimonial-marquee_48s_linear_infinite] will-change-transform">
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
              <button className="rounded-pill bg-white text-primary-700 font-semibold text-sm px-6 py-3 hover:bg-primary-50 transition-colors shadow-lg">
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
