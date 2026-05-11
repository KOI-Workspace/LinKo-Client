'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Play, Star, ArrowUp, ChevronRight, ChevronDown } from 'lucide-react'

// ─── 데이터 ────────────────────────────────────────────────────────────────

const VIDEO_CATEGORIES = [
  'All', 'BTS', 'Stray Kids', 'BLACKPINK', 'IVE', 'LE SSERAFIM',
  'JungKook', 'Lisa', 'K-Drama',
]

const STATS = [
  { value: '10,000+', label: 'Active Learners' },
  { value: '50,000+', label: 'Lessons Created' },
  { value: '4.9★',    label: 'Average Rating' },
]

const FEATURE_LIST = [
  {
    badge: 'Level Customization',
    title: 'Turn any link into level-based learning materials',
    description: 'Learning materials for Korean learners on every level',
    imageSide: 'right' as const,
    imageNote: '링크 삽입 → 레벨 선택 모달 (1 / 2 / 3 레벨)',
  },
  {
    badge: 'Real Expression Quiz',
    title: 'Learn real expressions through quizzes',
    description: 'Quiz to ~~~',
    imageSide: 'left' as const,
    imageNote: '퀴즈 한 장씩 넘어가는 UI',
  },
  {
    badge: 'Watch with dual subtitles',
    title: 'Study with dual subtitles while watching',
    description: 'Provides the best dual subtitle ~~',
    imageSide: 'right' as const,
    imageNote: '듀얼 서브타이틀 이미지',
  },
  {
    badge: 'Save expressions to review',
    title: 'Review saved expressions anytime',
    description: 'Review saved expressions anytime you want and study expressions',
    imageSide: 'left' as const,
    imageNote: '표현 저장 → 저장한 표현으로 복습',
  },
]

const REVIEWS = [
  {
    name: 'Sarah K.',
    country: '🇺🇸 USA',
    rating: 5,
    text: 'I\'ve tried every Korean app out there. LinKo is the first one that actually uses content I care about. My vocabulary doubled in two months.',
  },
  {
    name: 'James L.',
    country: '🇦🇺 Australia',
    rating: 5,
    text: 'Being able to learn from BTS content made everything click. The dual subtitles feature alone is worth it.',
  },
  {
    name: 'Mia T.',
    country: '🇯🇵 Japan',
    rating: 5,
    text: 'I paste a K-drama clip every morning and get a full lesson in seconds. It\'s become part of my daily routine.',
  },
]

const FAQ_ITEMS = [
  { q: 'What types of YouTube videos work best?', a: 'Any YouTube video with clear Korean speech works — K-pop, dramas, vlogs, cooking shows, and more.' },
  { q: 'Is LinKo free to use?',                  a: 'Yes, LinKo offers a free plan with limited conversions per month. Upgrade to Pro for unlimited lessons.' },
  { q: 'How long does it take to generate a lesson?', a: 'Most lessons are ready in under 60 seconds. Longer videos may take a few minutes.' },
]

// ─── 서브 컴포넌트 ──────────────────────────────────────────────────────────

/** 기능 섹션의 이미지 플레이스홀더 */
function FeatureImagePlaceholder({ note }: { note: string }) {
  return (
    <div className="w-full aspect-[4/3] rounded-xl bg-neutral-100 flex flex-col items-center justify-center gap-2 border border-neutral-200">
      <div className="w-10 h-10 rounded-lg bg-neutral-300 flex items-center justify-center">
        <Play className="w-5 h-5 text-neutral-500" fill="currentColor" />
      </div>
      <p className="text-xs text-neutral-400 text-center px-6">{note}</p>
    </div>
  )
}

/** 기능 소개 한 블록 */
function FeatureBlock({ badge, title, description, imageSide, imageNote }: typeof FEATURE_LIST[number]) {
  const textBlock = (
    <div className="flex flex-col justify-center gap-4">
      <span className="inline-flex self-start items-center px-3 py-1 rounded-pill bg-neutral-800 text-white text-xs font-medium">
        {badge}
      </span>
      <h3 className="text-2xl font-bold text-neutral-950 leading-snug">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  )

  const imageBlock = <FeatureImagePlaceholder note={imageNote} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16">
      {imageSide === 'right' ? (
        <>{textBlock}{imageBlock}</>
      ) : (
        <>{imageBlock}{textBlock}</>
      )}
    </div>
  )
}

/** 리뷰 카드 */
function ReviewCard({ name, country, rating, text }: typeof REVIEWS[number]) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4">
      <div className="text-5xl text-primary-200 font-serif leading-none select-none">&ldquo;</div>
      <p className="text-sm text-neutral-600 leading-relaxed flex-1">{text}</p>
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary">
            {name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-950">{name}</p>
            <p className="text-xs text-neutral-400">{country}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
          ))}
        </div>
      </div>
    </div>
  )
}

/** FAQ 항목 */
function FaqItem({ q, a }: typeof FAQ_ITEMS[number]) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-white cursor-pointer group hover:bg-neutral-50 transition-colors">
        <span className="text-sm font-semibold text-neutral-950">{q}</span>
        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-600 transition-colors" />
      </div>
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
        <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
      </div>
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

export default function LandingPage() {
  const [userInputValue, setUserInputValue] = useState('')
  const [animatedValue, setAnimatedValue] = useState('')
  const [isTypingActive, setIsTypingActive] = useState(true)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
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

        {/* ── Stats ── */}
        <section className="border-y border-neutral-100 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="grid grid-cols-3 gap-6 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-neutral-950 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Video Explorer ── */}
        <section id="video-explorer-section" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mb-10">
              <span className="text-xs font-medium text-primary uppercase tracking-widest">Explore</span>
              <h2 className="text-3xl font-bold text-neutral-950 mt-2 mb-3">
                Start with these videos
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                From K-pop to dramas to street food vlogs — if it&apos;s on YouTube, LinKo can turn it into a lesson.
              </p>
            </div>

            {/* 검색창 */}
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2.5 mb-5 max-w-sm shadow-xs">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by genre or title..."
                className="flex-1 text-sm placeholder:text-neutral-400 bg-transparent outline-none"
                readOnly
              />
            </div>

            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2 mb-8">
              {VIDEO_CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  className={`rounded-pill px-4 py-1.5 text-xs font-medium border transition-colors ${
                    i === 0
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 비디오 카드 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden cursor-pointer group hover:shadow-md hover:border-neutral-300 transition-all"
                >
                  <div className="aspect-video flex items-center justify-center bg-neutral-100 group-hover:bg-neutral-200 transition-colors relative">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Play className="w-4 h-4 text-neutral-600 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="h-2.5 bg-neutral-200 rounded-full w-3/4 mb-1.5" />
                    <div className="h-2 bg-neutral-200 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Browse all videos <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-16 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-neutral-950 text-center mb-2">Introducing the features</h2>
            <p className="text-sm text-neutral-400 text-center mb-0">(TBD)</p>

            <div className="divide-y divide-neutral-100">
              {FEATURE_LIST.map((feature) => (
                <FeatureBlock key={feature.badge} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-medium text-primary uppercase tracking-widest">Testimonials</span>
              <h2 className="text-3xl font-bold text-neutral-950 mt-2 mb-3">
                Real results from real learners
              </h2>
              <p className="text-sm text-neutral-400">Based on {REVIEWS.length * 1000}+ reviews</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {REVIEWS.map((review) => (
                <ReviewCard key={review.name} {...review} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Start learning Korean today
            </h2>
            <p className="text-primary-200 text-base mb-10 leading-relaxed">
              Join thousands of learners turning their YouTube habits into Korean fluency.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button className="rounded-pill bg-white text-primary-700 font-semibold text-sm px-6 py-3 hover:bg-primary-50 transition-colors shadow-lg">
                Get Started for Free →
              </button>
              <button className="rounded-pill bg-transparent text-white font-medium text-sm px-6 py-3 border border-primary-400 hover:border-white transition-colors">
                See how it works
              </button>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-medium text-primary uppercase tracking-widest">FAQ</span>
              <h2 className="text-3xl font-bold text-neutral-950 mt-2">Frequently asked questions</h2>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} {...item} />
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
