'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowUpDown, ChevronDown, Play, Plus } from 'lucide-react'
import UrlInput from '@/components/features/home/UrlInput'

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface RecommendationVideo {
  id: string
  title: string
  channelName: string
  channelId: string
  duration: string
  viewCount: string
  date: string
  thumbnailColor: string  // 썸네일 플레이스홀더 배경색
}

type SortOrder = 'newest' | 'oldest'

// ─── Mock 데이터 ──────────────────────────────────────────────────────────────

const MOCK_CHANNELS = ['All Channels', 'BANGTANTV', 'Learn Korean', 'KBS Drama', 'BLACKPINK', 'Maangchi', 'SMTOWN']

const PALETTE = [
  'bg-purple-200', 'bg-blue-200', 'bg-pink-200', 'bg-orange-200',
  'bg-green-200', 'bg-yellow-200', 'bg-red-200', 'bg-indigo-200',
  'bg-teal-200', 'bg-rose-200', 'bg-violet-200', 'bg-amber-200',
]

const MOCK_RECOMMENDATIONS: RecommendationVideo[] = [
  {
    id: 'r1', title: "BTS 'Spring Day' Live Stage @ Music Bank 2026",
    channelName: 'BANGTANTV', channelId: '1',
    duration: '5:42', viewCount: '1.2M views', date: '2026.05.07',
    thumbnailColor: PALETTE[0],
  },
  {
    id: 'r2', title: '눈물의 여왕 EP.16 마지막 회 — 해변장면',
    channelName: 'KBS Drama', channelId: '3',
    duration: '9:47', viewCount: '3.4M views', date: '2026.05.06',
    thumbnailColor: PALETTE[1],
  },
  {
    id: 'r3', title: '오늘 뭐 먹을 거야? 2026년 5월 음식 브이로그',
    channelName: 'Maangchi', channelId: '5',
    duration: '12:03', viewCount: '820K views', date: '2026.05.06',
    thumbnailColor: PALETTE[2],
  },
  {
    id: 'r4', title: 'NewJeans How Sweet — 세번째 EP A — 새로운 풀링',
    channelName: 'SMTOWN', channelId: '7',
    duration: '22:33', viewCount: '5.6M views', date: '2026.05.05',
    thumbnailColor: PALETTE[3],
  },
  {
    id: 'r5', title: 'IVE 아이브 "해야 (HEYA)" Dance Practice',
    channelName: 'BLACKPINK', channelId: '4',
    duration: '4:22', viewCount: '2.1M views', date: '2026.05.05',
    thumbnailColor: PALETTE[4],
  },
  {
    id: 'r6', title: 'Korean Pronunciation: ㄱㄴㄷ 완전 정복',
    channelName: 'Learn Korean', channelId: '2',
    duration: '11:18', viewCount: '340K views', date: '2026.05.04',
    thumbnailColor: PALETTE[5],
  },
  {
    id: 'r7', title: 'BLACKPINK — Shut Down MV Reaction & Lyrics',
    channelName: 'BLACKPINK', channelId: '4',
    duration: '7:55', viewCount: '9.8M views', date: '2026.05.03',
    thumbnailColor: PALETTE[6],
  },
  {
    id: 'r8', title: '서울 골목 먹방 투어 — 광장시장 편',
    channelName: 'Maangchi', channelId: '5',
    duration: '18:41', viewCount: '1.4M views', date: '2026.05.02',
    thumbnailColor: PALETTE[7],
  },
  {
    id: 'r9', title: '고급 한국어 패턴 10선 — 드라마에서 자주 나오는',
    channelName: 'Learn Korean', channelId: '2',
    duration: '14:30', viewCount: '210K views', date: '2026.05.01',
    thumbnailColor: PALETTE[8],
  },
  {
    id: 'r10', title: 'SEVENTEEN 세븐틴 - Super MV (Full Version)',
    channelName: 'SMTOWN', channelId: '7',
    duration: '3:58', viewCount: '7.7M views', date: '2026.04.30',
    thumbnailColor: PALETTE[9],
  },
  {
    id: 'r11', title: '연세대 한국어 수업 — 중급 문법 시간',
    channelName: 'KBS Drama', channelId: '3',
    duration: '52:10', viewCount: '88K views', date: '2026.04.29',
    thumbnailColor: PALETTE[10],
  },
  {
    id: 'r12', title: 'BTS RM Solo — 한국어 인터뷰 Full',
    channelName: 'BANGTANTV', channelId: '1',
    duration: '24:05', viewCount: '4.3M views', date: '2026.04.28',
    thumbnailColor: PALETTE[11],
  },
]

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

/** 추천 영상 카드 */
function RecommendationCard({ video }: { video: RecommendationVideo }) {
  return (
    <div className="flex flex-col rounded-xl bg-white border border-neutral-200 overflow-hidden cursor-pointer group hover:shadow-md hover:border-neutral-300 transition-all duration-200">
      {/* 썸네일 */}
      <div className={`relative w-full aspect-video ${video.thumbnailColor} flex items-center justify-center`}>
        {/* hover 시 재생 버튼 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <div className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center">
            <Play className="w-4 h-4 text-neutral-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* 재생 시간 */}
        <span className="absolute bottom-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded bg-black/70 text-white">
          {video.duration}
        </span>
        {/* Study 버튼 */}
        <button
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 text-[10px] font-semibold text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="w-2.5 h-2.5" />
          Study
        </button>
      </div>

      {/* 정보 */}
      <div className="px-3 py-3">
        {/* 채널 */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
            {video.channelName[0]}
          </div>
          <p className="text-[10px] text-neutral-400 truncate">{video.channelName}</p>
        </div>
        {/* 제목 */}
        <p className="text-xs font-semibold text-neutral-950 line-clamp-2 group-hover:text-primary transition-colors leading-relaxed mb-1.5">
          {video.title}
        </p>
        {/* 날짜 + 조회수 */}
        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
          <span>{video.date}</span>
          <span>·</span>
          <span>{video.viewCount}</span>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function RecommendationsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('All Channels')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const filtered = useMemo(() => {
    let result = MOCK_RECOMMENDATIONS

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channelName.toLowerCase().includes(q)
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/home')}
              className="text-sm text-neutral-400 hover:text-neutral-600 hover:underline transition-colors"
            >
              Home
            </button>
            <span className="text-neutral-300 text-sm">/</span>
            <span className="text-sm font-semibold text-primary">Recommendations</span>
          </div>
          <span className="text-sm text-neutral-400">{filtered.length} videos</span>
        </div>

        {/* 컨트롤 바 */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
            />
          </div>

          {/* 채널 필터 */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
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
            onClick={() => setSortOrder((prev) => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        {/* 영상 그리드 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((video) => (
              <RecommendationCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-neutral-950 mb-1">No videos found</p>
            <p className="text-xs text-neutral-400">Try adjusting the search or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
