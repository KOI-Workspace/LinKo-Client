'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowUpDown, Youtube, X, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import UrlInput from '@/components/features/home/UrlInput'
import VideoCard from '@/components/features/home/VideoCard'
import type { LessonData } from '@/components/features/home/MyLessonsSection'

// ─── 타입 ────────────────────────────────────────────────────────────────────

/** LessonData 확장 — isLesson이 false면 아직 학습 자료로 만들지 않은 채널 영상 */
interface ChannelVideo extends LessonData {
  isLesson?: boolean
}

interface ChannelData {
  id: string
  name: string
  handle: string
  subscriberCount: string
  lessonCount: number
  youtubeUrl: string
  /** 채널 추가 순서 (낮을수록 최근) */
  addedOrder: number
  videos: ChannelVideo[]
}

type SortOrder = 'newest' | 'oldest'

// ─── Mock 데이터 ──────────────────────────────────────────────────────────────

const MOCK_CHANNELS: ChannelData[] = [
  {
    id: '1',
    name: 'BANGTANTV',
    handle: '@BANGTANTV',
    subscriberCount: '7.4M',
    lessonCount: 5,
    youtubeUrl: 'https://youtube.com/@BANGTANTV',
    addedOrder: 1,
    videos: [
      { id: 'v1',  title: "BTS 'Spring Day' Live Stage @ Music Bank 2026", channelName: 'BANGTANTV', duration: '5:42',  date: '2026.05.07', generationStatus: 'generating', minutesLeft: 3, isLesson: true },
      { id: 'v2',  title: 'BTS Behind the Scenes — World Tour Practice Room Talk', channelName: 'BANGTANTV', duration: '8:11',  date: '2026.05.05', generationStatus: 'ready', flashcardDone: true,  subtitleDone: false, isLesson: true },
      { id: 'v3',  title: 'BTS - Butter MV Reaction', channelName: 'BANGTANTV', duration: '3:52',  date: '2026.05.04', generationStatus: 'ready', flashcardDone: true,  subtitleDone: true,  isLesson: true },
      { id: 'v3b', title: 'BTS RM Solo — 한국어 인터뷰 Full', channelName: 'BANGTANTV', duration: '24:05', date: '2026.05.02', generationStatus: 'ready', isLesson: false },
      { id: 'v3c', title: "BTS 'Dynamite' Official MV", channelName: 'BANGTANTV', duration: '3:43',  date: '2026.04.30', generationStatus: 'ready', flashcardDone: true,  subtitleDone: true,  isLesson: true },
      { id: 'v3d', title: 'BTS SUGA Agust D Tour — After Movie', channelName: 'BANGTANTV', duration: '18:27', date: '2026.04.27', generationStatus: 'ready', isLesson: false },
      { id: 'v3e', title: 'BTS V — 한국어 일상 브이로그 ep.7', channelName: 'BANGTANTV', duration: '11:52', date: '2026.04.24', generationStatus: 'ready', flashcardDone: true,  subtitleDone: false, isLesson: true },
      { id: 'v3f', title: "BTS 'Yet To Come' Concert Highlight Reel", channelName: 'BANGTANTV', duration: '7:09',  date: '2026.04.20', generationStatus: 'ready', isLesson: false },
    ],
  },
  {
    id: '2',
    name: 'Learn Korean',
    handle: '@TalkToMeInKorean',
    subscriberCount: '1.2M',
    lessonCount: 4,
    youtubeUrl: 'https://youtube.com/@TalkToMeInKorean',
    addedOrder: 2,
    videos: [
      { id: 'v4',  title: '10 Must-Know Korean Slang Words', channelName: 'Learn Korean', duration: '6:42',  date: '2026.05.06', generationStatus: 'ready', flashcardDone: true,  subtitleDone: true,  isLesson: true },
      { id: 'v5',  title: 'Korean Pronunciation Guide for Beginners', channelName: 'Learn Korean', duration: '8:15',  date: '2026.05.04', generationStatus: 'ready', flashcardDone: false, subtitleDone: false, isLesson: true },
      { id: 'v5b', title: '고급 한국어 패턴 10선 — 드라마에서 자주 나오는', channelName: 'Learn Korean', duration: '14:30', date: '2026.05.01', generationStatus: 'ready', flashcardDone: true,  subtitleDone: false, isLesson: true },
      { id: 'v5c', title: 'Korean ㄱㄴㄷ 완전 정복 — 받침 발음 규칙', channelName: 'Learn Korean', duration: '11:18', date: '2026.04.28', generationStatus: 'ready', isLesson: false },
      { id: 'v5d', title: 'How to Use -아/어요 vs -습니다', channelName: 'Learn Korean', duration: '9:05',  date: '2026.04.25', generationStatus: 'generating', minutesLeft: 5, isLesson: true },
      { id: 'v5e', title: '한국어 숫자 완전 정복 — 고유어 vs 한자어', channelName: 'Learn Korean', duration: '7:33',  date: '2026.04.22', generationStatus: 'ready', isLesson: false },
      { id: 'v5f', title: 'Top 20 Korean Particles You Must Know', channelName: 'Learn Korean', duration: '16:44', date: '2026.04.18', generationStatus: 'ready', isLesson: false },
    ],
  },
  {
    id: '3',
    name: 'KBS Drama',
    handle: '@KBSDrama',
    subscriberCount: '4.8M',
    lessonCount: 3,
    youtubeUrl: 'https://youtube.com/@KBSDrama',
    addedOrder: 3,
    videos: [
      { id: 'v6',  title: '눈물의 여왕 EP.16 마지막 회 — 해변 장면', channelName: 'KBS Drama', duration: '9:47',  date: '2026.05.06', generationStatus: 'ready', flashcardDone: true,  subtitleDone: true,  isLesson: true },
      { id: 'v7',  title: 'K-drama Vocabulary Basics', channelName: 'KBS Drama', duration: '12:30', date: '2026.05.03', generationStatus: 'ready', flashcardDone: true,  subtitleDone: false, isLesson: true },
      { id: 'v7b', title: 'Intermediate Korean Conversation Scene', channelName: 'KBS Drama', duration: '9:20',  date: '2026.04.30', generationStatus: 'ready', isLesson: false },
      { id: 'v7c', title: '연세대 한국어 수업 — 중급 문법 시간', channelName: 'KBS Drama', duration: '52:10', date: '2026.04.27', generationStatus: 'generating', minutesLeft: 8, isLesson: true },
      { id: 'v7d', title: '사랑의 불시착 명장면 모음 — 대사 학습', channelName: 'KBS Drama', duration: '14:55', date: '2026.04.24', generationStatus: 'ready', isLesson: false },
      { id: 'v7e', title: '이태원 클라쓰 — 박새로이 명대사 Top 10', channelName: 'KBS Drama', duration: '8:44',  date: '2026.04.20', generationStatus: 'ready', isLesson: false },
    ],
  },
  {
    id: '4',
    name: 'BLACKPINK',
    handle: '@BLACKPINK',
    subscriberCount: '89.3M',
    lessonCount: 3,
    youtubeUrl: 'https://youtube.com/@BLACKPINK',
    addedOrder: 4,
    videos: [
      { id: 'v8',  title: 'BLACKPINK — Shut Down MV Reaction & Lyrics', channelName: 'BLACKPINK', duration: '7:55',  date: '2026.05.03', generationStatus: 'ready', flashcardDone: true,  subtitleDone: false, isLesson: true },
      { id: 'v8b', title: 'IVE 아이브 "해야 (HEYA)" Dance Practice', channelName: 'BLACKPINK', duration: '4:22',  date: '2026.05.01', generationStatus: 'ready', flashcardDone: true,  subtitleDone: true,  isLesson: true },
      { id: 'v8c', title: 'Learn Korean with BLACKPINK', channelName: 'BLACKPINK', duration: '5:21',  date: '2026.04.28', generationStatus: 'ready', isLesson: false },
      { id: 'v8d', title: "BLACKPINK 'Pink Venom' MV — 가사 분석", channelName: 'BLACKPINK', duration: '6:13',  date: '2026.04.24', generationStatus: 'generating', minutesLeft: 4, isLesson: true },
      { id: 'v8e', title: "BLACKPINK 'How You Like That' Lyrics Breakdown", channelName: 'BLACKPINK', duration: '5:58',  date: '2026.04.20', generationStatus: 'ready', isLesson: false },
      { id: 'v8f', title: 'BLACKPINK LISA Solo — 한국어 인터뷰', channelName: 'BLACKPINK', duration: '12:40', date: '2026.04.17', generationStatus: 'ready', isLesson: false },
    ],
  },
  {
    id: '5',
    name: 'Maangchi',
    handle: '@Maangchi',
    subscriberCount: '6.1M',
    lessonCount: 2,
    youtubeUrl: 'https://youtube.com/@Maangchi',
    addedOrder: 5,
    videos: [
      { id: 'v9',  title: '오늘 뭐 먹을 거야? 2026년 5월 음식 브이로그', channelName: 'Maangchi', duration: '12:03', date: '2026.05.06', generationStatus: 'ready', isLesson: false },
      { id: 'v9b', title: 'Korean Food Vocabulary with Chef', channelName: 'Maangchi', duration: '15:20', date: '2026.05.03', generationStatus: 'ready', flashcardDone: true,  subtitleDone: true,  isLesson: true },
      { id: 'v9c', title: '서울 골목 먹방 투어 — 광장시장 편', channelName: 'Maangchi', duration: '18:41', date: '2026.04.29', generationStatus: 'ready', isLesson: false },
      { id: 'v9d', title: '김치찌개 레시피 — 요리 한국어 총정리', channelName: 'Maangchi', duration: '22:10', date: '2026.04.25', generationStatus: 'generating', minutesLeft: 6, isLesson: true },
      { id: 'v9e', title: '떡볶이 만들기 — 한국어로 요리 배우기', channelName: 'Maangchi', duration: '9:47',  date: '2026.04.21', generationStatus: 'ready', isLesson: false },
      { id: 'v9f', title: '순두부찌개 vs 된장찌개 — 비교 요리 수업', channelName: 'Maangchi', duration: '17:33', date: '2026.04.18', generationStatus: 'ready', isLesson: false },
    ],
  },
  {
    id: '6',
    name: 'JYP Entertainment',
    handle: '@JYPEntertainment',
    subscriberCount: '12.3M',
    lessonCount: 2,
    youtubeUrl: 'https://youtube.com/@JYPE',
    addedOrder: 6,
    videos: [
      { id: 'v10',  title: 'TWICE Dance Practice — Korean Lyrics', channelName: 'JYP Entertainment', duration: '3:34',  date: '2026.05.05', generationStatus: 'generating', minutesLeft: 2, isLesson: true },
      { id: 'v10b', title: 'NewJeans How Sweet — 세번째 EP A', channelName: 'JYP Entertainment', duration: '22:33', date: '2026.05.02', generationStatus: 'ready', flashcardDone: true,  subtitleDone: false, isLesson: true },
      { id: 'v10c', title: 'STRAY KIDS — 한국어 팬미팅 하이라이트', channelName: 'JYP Entertainment', duration: '31:15', date: '2026.04.28', generationStatus: 'ready', isLesson: false },
      { id: 'v10d', title: 'DAY6 Every Day6 — 가사 해설', channelName: 'JYP Entertainment', duration: '8:22',  date: '2026.04.24', generationStatus: 'ready', isLesson: false },
      { id: 'v10e', title: 'ITZY "LOCO" MV — 한국어 가사 분석', channelName: 'JYP Entertainment', duration: '6:50',  date: '2026.04.20', generationStatus: 'ready', isLesson: false },
      { id: 'v10f', title: 'GOT7 Korean Interview — 자연스러운 한국어 표현', channelName: 'JYP Entertainment', duration: '14:08', date: '2026.04.16', generationStatus: 'ready', flashcardDone: true,  subtitleDone: false, isLesson: true },
    ],
  },
]

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

/** 채널 이니셜 아바타 */
function ChannelAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-16 h-16 text-base' }[size]
  return (
    <div className={`${sizeClass} rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary shrink-0`}>
      {name[0].toUpperCase()}
    </div>
  )
}

const CHANNEL_PAGE_SIZE = 12

/** 선택된 채널 상세 패널 */
function ChannelDetail({ channel }: { channel: ChannelData }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(channel.videos.length / CHANNEL_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = channel.videos.slice((currentPage - 1) * CHANNEL_PAGE_SIZE, currentPage * CHANNEL_PAGE_SIZE)

  return (
    <div className="mt-5 rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* 채널 헤더 */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-neutral-100">
        <ChannelAvatar name={channel.name} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-neutral-950">{channel.name}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{channel.handle}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {channel.subscriberCount} subscribers · You&apos;ve made {channel.lessonCount} {channel.lessonCount === 1 ? 'lesson' : 'lessons'} from this channel
          </p>
        </div>
      </div>

      {/* 최신 영상 카드 그리드 */}
      <div className="px-6 py-5">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          Latest Videos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((video) => (
            <VideoCard key={video.id} {...video} showLearning={video.isLesson === true} fluid />
          ))}
        </div>

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

// ─── 채널 추가 모달 검색용 Mock 결과 ─────────────────────────────────────────

interface SearchResult {
  id: string
  name: string
  handle: string
  subscriberCount: string
}

const SEARCHABLE_CHANNELS: SearchResult[] = [
  { id: 's1', name: 'SMTOWN', handle: '@SMTOWN', subscriberCount: '33.8M' },
  { id: 's2', name: 'HYBE LABELS', handle: '@HYBELABELS', subscriberCount: '24.5M' },
  { id: 's3', name: 'KBS World TV', handle: '@KBSWorldTV', subscriberCount: '8.1M' },
  { id: 's4', name: 'tvN Drama', handle: '@tvNDrama', subscriberCount: '5.6M' },
  { id: 's5', name: 'Korean Unnie', handle: '@KoreanUnnie', subscriberCount: '2.3M' },
  { id: 's6', name: 'Seoul Eats', handle: '@SeoulEats', subscriberCount: '980K' },
  { id: 's7', name: 'GO! Billy Korean', handle: '@GoBillyKorean', subscriberCount: '1.1M' },
  { id: 's8', name: 'Arirang TV', handle: '@ArirangTV', subscriberCount: '3.7M' },
]

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function ChannelsPage() {
  const router = useRouter()
  const [channels, setChannels] = useState<ChannelData[]>(MOCK_CHANNELS)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [popoverId, setPopoverId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)

  // 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverId(null)
      }
    }
    if (popoverId) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popoverId])

  const filtered = useMemo(() => {
    let result = channels
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q))
    }
    return [...result].sort((a, b) =>
      sortOrder === 'newest' ? a.addedOrder - b.addedOrder : b.addedOrder - a.addedOrder
    )
  }, [channels, search, sortOrder])

  const selectedChannel = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null

  const addedIds = new Set(channels.map((c) => c.id))

  const addSearchResults = useMemo(() => {
    if (!addSearch.trim()) return SEARCHABLE_CHANNELS
    const q = addSearch.toLowerCase()
    return SEARCHABLE_CHANNELS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
    )
  }, [addSearch])

  const handleBubbleClick = (id: string) => {
    setSelectedId(id)
    setPopoverId((prev) => (prev === id ? null : id))
  }

  const handleUnsubscribe = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id))
    setPopoverId(null)
    if (selectedId === id) setSelectedId(null)
  }

  const handleAddChannel = (result: SearchResult) => {
    if (addedIds.has(result.id)) return
    const newChannel: ChannelData = {
      id: result.id,
      name: result.name,
      handle: result.handle,
      subscriberCount: result.subscriberCount,
      lessonCount: 0,
      youtubeUrl: `https://youtube.com/${result.handle}`,
      addedOrder: channels.length + 1,
      videos: [],
    }
    setChannels((prev) => [...prev, newChannel])
  }

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
            <span className="text-sm font-semibold text-primary truncate">My Channels</span>
          </div>
          <span className="text-sm text-neutral-400 shrink-0">{filtered.length} channels</span>
        </div>

        {/* 컨트롤 바 */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search channels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
            />
          </div>
          <button
            onClick={() => setSortOrder((prev) => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            {sortOrder === 'newest' ? 'Recently Added' : 'Oldest First'}
          </button>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:border-red-300 hover:text-red-600 transition-colors">
            <Youtube className="w-4 h-4" />
            Connect YouTube
          </button>
        </div>

        {/* 채널 버블 목록 — 가로 스크롤 한 줄 고정 */}
        <div className="flex gap-5 overflow-x-auto py-2" ref={popoverRef}>
          {/* 채널 추가 버튼 */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => { setShowAddModal(true); setAddSearch('') }}
              className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xl hover:border-primary-400 hover:text-primary hover:bg-primary-50 transition-all"
            >
              +
            </button>
            <span className="text-xs text-neutral-400">Add</span>
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-neutral-400 self-center">No channels found.</p>
          )}

          {/* 채널 버블들 */}
          {filtered.map((channel) => {
            const isSelected = (selectedChannel?.id === channel.id)
            const isPopoverOpen = popoverId === channel.id
            return (
              <div key={channel.id} className="relative flex flex-col items-center gap-2">
                <button
                  onClick={() => handleBubbleClick(channel.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-full bg-primary-100 ring-2 transition-all flex items-center justify-center ${
                    isSelected ? 'ring-primary ring-offset-2' : 'ring-transparent group-hover:ring-primary-200'
                  }`}>
                    <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-primary group-hover:text-primary-700'}`}>
                      {channel.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-xs max-w-[64px] text-center truncate transition-colors ${
                    isSelected ? 'text-primary font-semibold' : 'text-neutral-500 group-hover:text-neutral-700'
                  }`}>
                    {channel.name}
                  </span>
                </button>

                {/* Unsubscribe 팝오버 */}
                {isPopoverOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-20 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                      onClick={() => handleUnsubscribe(channel.id)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Unsubscribe
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 선택된 채널 상세 — key로 채널 전환 시 페이지 초기화 */}
        {selectedChannel && <ChannelDetail key={selectedChannel.id} channel={selectedChannel} />}
      </div>

      {/* 채널 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          {/* 모달 */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[70vh]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div>
                <p className="text-base font-bold text-neutral-950">Add Channel</p>
                <p className="text-xs text-neutral-400 mt-0.5">Search for a YouTube channel to follow</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 검색 입력 */}
            <div className="px-6 py-4 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search YouTube channels..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* 검색 결과 */}
            <div className="overflow-y-auto flex-1 px-3 py-2">
              {addSearchResults.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-8">No channels found.</p>
              ) : (
                addSearchResults.map((result) => {
                  const isAdded = addedIds.has(result.id)
                  return (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      {/* 아바타 */}
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {result.name[0]}
                      </div>
                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-950 truncate">{result.name}</p>
                        <p className="text-xs text-neutral-400">{result.handle} · {result.subscriberCount}</p>
                      </div>
                      {/* 추가 버튼 */}
                      <button
                        onClick={() => handleAddChannel(result)}
                        disabled={isAdded}
                        className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isAdded
                            ? 'bg-neutral-100 text-neutral-400 cursor-default'
                            : 'bg-primary text-white hover:bg-primary-700'
                        }`}
                      >
                        {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
