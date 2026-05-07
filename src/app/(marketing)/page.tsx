import { Search, Play, Star, ChevronRight, Youtube } from 'lucide-react'

// ─── 데이터 ────────────────────────────────────────────────────────────────

const VIDEO_CATEGORIES = [
  'BTS', 'Stray Kids', 'BlackPink', 'IVE', 'LE SSERAFIM',
  'JungKook', 'Lisa', 'ROSE', 'LeeMinho', 'ParkBogum',
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
  { name: 'Sarah K.', rating: 5, text: 'Text ~' },
  { name: 'James L.', rating: 5, text: 'Text ~' },
  { name: 'Mia T.',   rating: 5, text: 'Text ~' },
]

const FAQ_ITEMS = [
  { q: '1. What ~?' },
  { q: '2. What ~?' },
  { q: '3. What ~?' },
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
        <>
          {textBlock}
          {imageBlock}
        </>
      ) : (
        <>
          {imageBlock}
          {textBlock}
        </>
      )}
    </div>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-950 tracking-tight">LinKo</span>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-primary-50 to-white pt-20 pb-24">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-950 leading-tight tracking-tight mb-4">
                Master Korean with your
                <br />
                <span className="text-primary-600">favorite YouTube videos</span>
              </h1>
              <p className="text-base text-neutral-500 mb-8">
                One click to create YouTube content learning material
              </p>
              <div className="flex items-center justify-center gap-3 mb-10">
                <button className="rounded-pill bg-neutral-950 text-white text-sm font-medium px-5 py-2.5 hover:bg-neutral-800 transition-colors">
                  Explore Videos
                </button>
                <button className="rounded-pill bg-white text-neutral-950 text-sm font-medium px-5 py-2.5 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                  Start Studying
                </button>
              </div>

              {/* URL 입력창 */}
              <div className="max-w-lg mx-auto flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2.5 shadow-sm">
                <Youtube className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 text-sm text-neutral-950 placeholder:text-neutral-400 bg-transparent outline-none"
                  readOnly
                />
                <button className="rounded-md bg-primary-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-primary-700 transition-colors shrink-0">
                  Convert
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Video Explorer ── */}
        <section className="py-16 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-neutral-950 mb-2">Explore YouTube videos to Convert</h2>
            <p className="text-sm text-neutral-500 mb-6">Search for dramas or pick through the most liked contents</p>

            {/* 검색창 */}
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2.5 mb-5 max-w-md shadow-xs">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search for genre or title of the video"
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
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 비디오 카드 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* 첫 번째 카드 */}
              <div className="rounded-xl bg-neutral-100 border border-neutral-200 aspect-video flex items-center justify-center group cursor-pointer hover:border-primary-300 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-neutral-700" fill="currentColor" />
                </div>
              </div>
              {/* 나머지 카드 플레이스홀더 */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-neutral-100 border border-neutral-200 aspect-video flex items-center justify-center group cursor-pointer hover:border-primary-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Play className="w-3.5 h-3.5 text-neutral-600" fill="currentColor" />
                  </div>
                </div>
              ))}
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
        <section className="py-16 bg-neutral-50 border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-neutral-950 text-center mb-1">Reviews from Real Customers</h2>
            <p className="text-xs text-neutral-400 text-center mb-10">Based on NN Reviews so far</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {REVIEWS.map((review) => (
                <div
                  key={review.name}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-950">{review.name}</span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-8 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-400">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-16 bg-white border-t border-neutral-100">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-neutral-950 text-center mb-8">FAQ</h2>

            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl overflow-hidden">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.q}
                  className="flex items-center justify-between px-5 py-4 bg-white hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <span className="text-sm font-semibold text-neutral-950">{item.q}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-base font-bold text-neutral-950">LinKo</span>
          <p className="text-xs text-neutral-400">© 2026 LinKo. All rights reserved.</p>
          <div className="flex gap-5">
            <span className="text-xs text-neutral-500">Privacy</span>
            <span className="text-xs text-neutral-500">Terms</span>
            <span className="text-xs text-neutral-500">Contact</span>
          </div>
        </div>
      </footer>
    </>
  )
}
