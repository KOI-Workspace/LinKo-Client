'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowUpDown, ExternalLink, Youtube, ChevronRight, Play, Loader2, CreditCard, Captions } from 'lucide-react'
import UrlInput from '@/components/features/home/UrlInput'
import { deriveDisplayStatus } from '@/components/features/home/VideoCard'
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

/** 미니 비디오 카드 (채널 상세 내부용) */
function MiniVideoCard({ lesson }: { lesson: LessonData }) {
  const isGenerating = lesson.generationStatus === 'generating'
  const displayStatus = isGenerating
    ? null
    : deriveDisplayStatus(lesson.generationStatus, lesson.flashcardDone, lesson.subtitleDone)

  const doneCount = isGenerating ? 0
    : (lesson.flashcardDone ? 1 : 0) + (lesson.subtitleDone ? 1 : 0)

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group">
      {/* 썸네일 */}
      <div className="relative w-24 aspect-video rounded-md bg-neutral-100 shrink-0 overflow-hidden">
        {isGenerating ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" strokeWidth={1.5} />
          </div>
        ) : (
          <>
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-3 h-3 text-neutral-600" fill="currentColor" />
            </div>
            {lesson.duration && (
              <span className="absolute bottom-0.5 right-0.5 text-[9px] font-medium px-1 py-0.5 rounded bg-black/70 text-white">
                {lesson.duration}
              </span>
            )}
          </>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-950 truncate group-hover:text-primary transition-colors">
          {lesson.title}
        </p>
        <p className="text-[10px] text-neutral-400 mt-0.5">{lesson.date}</p>
      </div>

      {/* 활동 상태 */}
      <div className="shrink-0">
        {isGenerating ? (
          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            {lesson.minutesLeft != null ? `~${lesson.minutesLeft}min` : '...'}
          </span>
        ) : (
          <div className="flex gap-1">
            <div className={`w-5 h-5 rounded flex items-center justify-center border ${
              lesson.flashcardDone ? 'bg-primary-50 border-primary-200 text-primary' : 'bg-neutral-50 border-neutral-200 text-neutral-300'
            }`}>
              <CreditCard className="w-2.5 h-2.5" />
            </div>
            <div className={`w-5 h-5 rounded flex items-center justify-center border ${
              lesson.subtitleDone ? 'bg-primary-50 border-primary-200 text-primary' : 'bg-neutral-50 border-neutral-200 text-neutral-300'
            }`}>
              <Captions className="w-2.5 h-2.5" />
            </div>
          </div>
        )}
      </div>
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
        <a
          href={channel.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 transition-colors shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          View on YouTube
        </a>
      </div>

      {/* 최신 영상 목록 */}
      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
          Latest Videos
        </p>
        <div className="flex flex-col gap-0.5">
          {channel.videos.map((video) => (
            <MiniVideoCard key={video.id} lesson={video} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function ChannelsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = MOCK_CHANNELS

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q))
    }

    result = [...result].sort((a, b) =>
      sortOrder === 'newest' ? a.addedOrder - b.addedOrder : b.addedOrder - a.addedOrder
    )

    return result
  }, [search, sortOrder])

  const selectedChannel = MOCK_CHANNELS.find((c) => c.id === selectedId) ?? null

  const handleChannelClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/home')}
              className="text-sm text-neutral-400 hover:text-neutral-600 hover:underline transition-colors"
            >
              Home
            </button>
            <span className="text-neutral-300 text-sm">/</span>
            <span className="text-sm font-semibold text-primary">My Channels</span>
          </div>
          <span className="text-sm text-neutral-400">{filtered.length} channels</span>
        </div>

        {/* 컨트롤 바 */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search channels..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedId(null) }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
            />
          </div>

          {/* 정렬 토글 */}
          <button
            onClick={() => setSortOrder((prev) => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            {sortOrder === 'newest' ? 'Recently Added' : 'Oldest First'}
          </button>

          {/* YouTube 연동 */}
          <button className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:border-red-300 hover:text-red-600 transition-colors">
            <Youtube className="w-4 h-4" />
            Connect YouTube
          </button>
        </div>

        {/* 채널 그리드 */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-neutral-950 mb-1">No channels found</p>
            <p className="text-xs text-neutral-400">Try adjusting the search.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {/* 채널 추가 버튼 */}
            <div className="flex flex-col items-center gap-2">
              <button className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xl hover:border-primary-400 hover:text-primary hover:bg-primary-50 transition-all">
                +
              </button>
              <span className="text-xs text-neutral-400">Add</span>
            </div>

            {/* 채널 버블들 */}
            {filtered.map((channel) => {
              const isSelected = selectedId === channel.id
              return (
                <div
                  key={channel.id}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => handleChannelClick(channel.id)}
                >
                  <div className={`w-14 h-14 rounded-full bg-primary-100 overflow-hidden ring-2 transition-all ${
                    isSelected
                      ? 'ring-primary ring-offset-2'
                      : 'ring-transparent group-hover:ring-primary-200'
                  } flex items-center justify-center`}>
                    <span className={`text-sm font-bold transition-colors ${
                      isSelected ? 'text-primary' : 'text-primary group-hover:text-primary-700'
                    }`}>
                      {channel.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-xs max-w-[64px] text-center truncate transition-colors ${
                    isSelected ? 'text-primary font-semibold' : 'text-neutral-500 group-hover:text-neutral-700'
                  }`}>
                    {channel.name}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* 선택된 채널 상세 */}
        {selectedChannel && <ChannelDetail channel={selectedChannel} />}
      </div>
    </div>
  )
}
