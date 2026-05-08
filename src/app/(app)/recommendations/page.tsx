'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import UrlInput from '@/components/features/home/UrlInput'
import VideoCard from '@/components/features/home/VideoCard'
import type { LessonData } from '@/components/features/home/MyLessonsSection'

// ─── 타입 ────────────────────────────────────────────────────────────────────

type SortOrder = 'newest' | 'oldest'

// ─── Mock 데이터 ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 9

const MOCK_CHANNELS = ['All Channels', 'BANGTANTV', 'Learn Korean', 'KBS Drama', 'BLACKPINK', 'Maangchi', 'SMTOWN']

const MOCK_RECOMMENDATIONS: LessonData[] = [
  {
    id: 'r1', title: "BTS 'Spring Day' Live Stage @ Music Bank 2026",
    channelName: 'BANGTANTV', duration: '5:42', date: '2026.05.07',
    generationStatus: 'ready',
  },
  {
    id: 'r2', title: '눈물의 여왕 EP.16 마지막 회 — 해변장면',
    channelName: 'KBS Drama', duration: '9:47', date: '2026.05.06',
    generationStatus: 'ready',
  },
  {
    id: 'r3', title: '오늘 뭐 먹을 거야? 2026년 5월 음식 브이로그',
    channelName: 'Maangchi', duration: '12:03', date: '2026.05.06',
    generationStatus: 'ready',
  },
  {
    id: 'r4', title: 'NewJeans How Sweet — 세번째 EP A — 새로운 풀링',
    channelName: 'SMTOWN', duration: '22:33', date: '2026.05.05',
    generationStatus: 'ready',
  },
  {
    id: 'r5', title: 'IVE 아이브 "해야 (HEYA)" Dance Practice',
    channelName: 'BLACKPINK', duration: '4:22', date: '2026.05.05',
    generationStatus: 'ready',
  },
  {
    id: 'r6', title: 'Korean Pronunciation: ㄱㄴㄷ 완전 정복',
    channelName: 'Learn Korean', duration: '11:18', date: '2026.05.04',
    generationStatus: 'ready',
  },
  {
    id: 'r7', title: 'BLACKPINK — Shut Down MV Reaction & Lyrics',
    channelName: 'BLACKPINK', duration: '7:55', date: '2026.05.03',
    generationStatus: 'ready',
  },
  {
    id: 'r8', title: '서울 골목 먹방 투어 — 광장시장 편',
    channelName: 'Maangchi', duration: '18:41', date: '2026.05.02',
    generationStatus: 'ready',
  },
  {
    id: 'r9', title: '고급 한국어 패턴 10선 — 드라마에서 자주 나오는',
    channelName: 'Learn Korean', duration: '14:30', date: '2026.05.01',
    generationStatus: 'ready',
  },
  {
    id: 'r10', title: 'SEVENTEEN 세븐틴 - Super MV (Full Version)',
    channelName: 'SMTOWN', duration: '3:58', date: '2026.04.30',
    generationStatus: 'ready',
  },
  {
    id: 'r11', title: '연세대 한국어 수업 — 중급 문법 시간',
    channelName: 'KBS Drama', duration: '52:10', date: '2026.04.29',
    generationStatus: 'ready',
  },
  {
    id: 'r12', title: 'BTS RM Solo — 한국어 인터뷰 Full',
    channelName: 'BANGTANTV', duration: '24:05', date: '2026.04.28',
    generationStatus: 'ready',
  },
]

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function RecommendationsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = MOCK_RECOMMENDATIONS

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.channelName?.toLowerCase().includes(q) ?? false)
      )
    }

    if (channelFilter !== 'All Channels') {
      result = result.filter((v) => v.channelName === channelFilter)
    }

    result = [...result].sort((a, b) =>
      sortOrder === 'newest'
        ? parseInt(b.id.replace('r', '')) - parseInt(a.id.replace('r', ''))
        : parseInt(a.id.replace('r', '')) - parseInt(b.id.replace('r', ''))
    )

    return result
  }, [search, channelFilter, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleChannel = (v: string) => { setChannelFilter(v); setPage(1) }
  const toggleSort = () => { setSortOrder((prev) => prev === 'newest' ? 'oldest' : 'newest'); setPage(1) }

  return (
    <div className="min-h-full">
      {/* 히어로 */}
      <div className="bg-gradient-to-b from-primary-50 to-white px-10 pt-10 pb-10 border-b border-neutral-100">
        <p className="text-xs font-medium text-primary-600 uppercase tracking-widest mb-3">
          Start Learning
        </p>
        <h1 className="text-3xl font-bold text-neutral-950 leading-tight mb-2">
          Which video will you learn
          <br />
          Korean today?
        </h1>
        <p className="text-sm text-neutral-500 mb-7">
          Paste a YouTube link and we&apos;ll build a personalized lesson for you.
        </p>
        <div className="max-w-xl">
          <UrlInput />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="px-10 py-8">
        {/* 브레드크럼 */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.push('/home')}
              className="text-sm text-neutral-400 hover:text-neutral-600 hover:underline transition-colors shrink-0"
            >
              Home
            </button>
            <span className="text-neutral-300 text-sm shrink-0">/</span>
            <span className="text-sm font-semibold text-primary truncate">Recommendations</span>
          </div>
          <span className="text-sm text-neutral-400 shrink-0">{filtered.length} videos</span>
        </div>

        {/* 컨트롤 바 */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* 검색 */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
            />
          </div>

          {/* 채널 필터 */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => handleChannel(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-neutral-700 cursor-pointer"
            >
              {MOCK_CHANNELS.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>

          {/* 정렬 토글 */}
          <button
            onClick={toggleSort}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        {/* 영상 목록 — 홈과 동일한 VideoCard */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((video) => (
              <VideoCard key={video.id} {...video} showLearning={false} fluid />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-neutral-950 mb-1">No videos found</p>
            <p className="text-xs text-neutral-400">Try adjusting the search or filters.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
