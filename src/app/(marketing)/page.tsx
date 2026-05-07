import { Search, Play, Star, ChevronRight, Youtube, ChevronDown } from 'lucide-react'

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

export default function LandingPage() {
  return (
    <>
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-950 tracking-tight">LinKo</span>
          <nav className="hidden md:flex items-center gap-6">
            {['Features', 'How it works', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <button className="rounded-pill bg-neutral-950 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800 transition-colors">
            Start for Free
          </button>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative bg-gradient-to-b from-primary-50 to-white pt-24 pb-20 overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

          <div className="relative max-w-3xl mx-auto px-6 text-center">
            {/* 배지 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white border border-primary-200 text-primary-700 text-xs font-medium mb-8 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              Loved by 10,000+ Korean learners worldwide
            </div>

            <h1 className="text-5xl font-bold text-neutral-950 leading-tight tracking-tight mb-5">
              Master Korean with your
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                favorite YouTube videos
              </span>
            </h1>

            <p className="text-lg text-neutral-500 mb-10 max-w-lg mx-auto leading-relaxed">
              Paste any YouTube link and get a personalized Korean lesson — vocabulary, grammar, and subtitles in seconds.
            </p>

            {/* URL 입력 */}
            <div className="max-w-xl mx-auto flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-md">
              <Youtube className="w-5 h-5 text-red-500 shrink-0" />
              <input
                type="text"
                placeholder="Paste any YouTube URL to start learning..."
                className="flex-1 text-sm text-neutral-950 placeholder:text-neutral-400 bg-transparent outline-none"
                readOnly
              />
              <button className="rounded-pill bg-primary text-white text-sm font-medium px-4 py-2 hover:bg-primary-700 transition-colors shrink-0">
                Convert →
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-3">Free to try · No credit card required</p>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-y border-neutral-100 bg-neutral-50">
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
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mb-10">
              <span className="text-xs font-medium text-primary uppercase tracking-widest">Explore</span>
              <h2 className="text-3xl font-bold text-neutral-950 mt-2 mb-3">
                Any video. Any topic. Your lesson.
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
