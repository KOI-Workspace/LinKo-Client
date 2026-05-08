'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowUpDown, Youtube, X, Plus, Check } from 'lucide-react'
import UrlInput from '@/components/features/home/UrlInput'
import VideoCard from '@/components/features/home/VideoCard'
import type { LessonData } from '@/components/features/home/MyLessonsSection'

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface ChannelData {
  id: string
  name: string
  handle: string
  subscriberCount: string
  lessonCount: number
  youtubeUrl: string
  /** 채널 추가 순서 (낮을수록 최근) */
  addedOrder: number
  videos: LessonData[]
}

type SortOrder = 'newest' | 'oldest'

// ─── Mock 데이터 ──────────────────────────────────────────────────────────────

const MOCK_CHANNELS: ChannelData[] = [
  {
    id: '1',
    name: 'BANGTANTV',
    handle: '@BANGTANTV',
    subscriberCount: '7.4M',
    lessonCount: 3,
    youtubeUrl: 'https://youtube.com/@BANGTANTV',
    addedOrder: 1,
    videos: [
      {
        id: 'v1', title: "BTS 'Spring Day' Live Stage @ Music Bank 2026",
        channelName: 'BANGTANTV', duration: '5:42', date: '2026.05.07',
        generationStatus: 'generating', minutesLeft: 3,
      },
      {
        id: 'v2', title: 'BTS Behind the Scenes — World Tour Practice Room Talk',
        channelName: 'BANGTANTV', duration: '8:11', date: '2026.05.05',
        generationStatus: 'ready', flashcardDone: true, subtitleDone: false,
      },
      {
        id: 'v3', title: 'BTS - Butter MV Reaction',
        channelName: 'BANGTANTV', duration: '3:52', date: '2026.05.04',
        generationStatus: 'ready', flashcardDone: true, subtitleDone: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Learn Korean',
    handle: '@TalkToMeInKorean',
    subscriberCount: '1.2M',
    lessonCount: 2,
    youtubeUrl: 'https://youtube.com/@TalkToMeInKorean',
    addedOrder: 2,
    videos: [
      {
        id: 'v4', title: '10 Must-Know Korean Slang Words',
        channelName: 'Learn Korean', duration: '6:42', date: '2026.04.30',
        generationStatus: 'ready', flashcardDone: true, subtitleDone: true,
      },
      {
        id: 'v5', title: 'Korean Pronunciation Guide for Beginners',
        channelName: 'Learn Korean', duration: '8:15', date: '2026.04.28',
        generationStatus: 'ready', flashcardDone: false, subtitleDone: false,
      },
    ],
  },
  {
    id: '3',
    name: 'KBS Drama',
    handle: '@KBSDrama',
    subscriberCount: '4.8M',
    lessonCount: 2,
    youtubeUrl: 'https://youtube.com/@KBSDrama',
    addedOrder: 3,
    videos: [
      {
        id: 'v6', title: 'K-drama Vocabulary Basics',
        channelName: 'KBS Drama', duration: '12:30', date: '2026.05.03',
        generationStatus: 'ready', flashcardDone: true, subtitleDone: false,
      },
      {
        id: 'v7', title: 'Intermediate Korean Conversation Scene',
        channelName: 'KBS Drama', duration: '9:20', date: '2026.04.25',
        generationStatus: 'ready', flashcardDone: false, subtitleDone: false,
      },
    ],
  },
  {
    id: '4',
    name: 'BLACKPINK',
    handle: '@BLACKPINK',
    subscriberCount: '89.3M',
    lessonCount: 1,
    youtubeUrl: 'https://youtube.com/@BLACKPINK',
    addedOrder: 4,
    videos: [
      {
        id: 'v8', title: 'Learn Korean with BLACKPINK',
        channelName: 'BLACKPINK', duration: '5:21', date: '2026.05.02',
        generationStatus: 'ready', flashcardDone: true, subtitleDone: true,
      },
    ],
  },
  {
    id: '5',
    name: 'Maangchi',
    handle: '@Maangchi',
    subscriberCount: '6.1M',
    lessonCount: 1,
    youtubeUrl: 'https://youtube.com/@Maangchi',
    addedOrder: 5,
    videos: [
      {
        id: 'v9', title: 'Korean Food Vocabulary with Chef',
        channelName: 'Maangchi', duration: '15:20', date: '2026.04.29',
        generationStatus: 'ready', flashcardDone: false, subtitleDone: true,
      },
    ],
  },
  {
    id: '6',
    name: 'JYP Entertainment',
    handle: '@JYPEntertainment',
    subscriberCount: '12.3M',
    lessonCount: 1,
    youtubeUrl: 'https://youtube.com/@JYPE',
    addedOrder: 6,
    videos: [
      {
        id: 'v10', title: 'TWICE Dance Practice — Korean Lyrics',
        channelName: 'JYP Entertainment', duration: '3:34', date: '2026.04.26',
        generationStatus: 'generating', minutesLeft: 2,
      },
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

/** 선택된 채널 상세 패널 */
function ChannelDetail({ channel }: { channel: ChannelData }) {
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
          {channel.videos.map((video) => (
            <VideoCard key={video.id} {...video} showLearning={false} fluid />
          ))}
        </div>
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

        {/* 채널 버블 목록 */}
        <div className="flex flex-wrap gap-5 mb-2" ref={popoverRef}>
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

        {/* 선택된 채널 상세 */}
        {selectedChannel && <ChannelDetail channel={selectedChannel} />}
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
