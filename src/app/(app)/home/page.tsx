import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import UrlInput from '@/components/features/home/UrlInput'
import VideoCard from '@/components/features/home/VideoCard'
import MyLessonsSection from '@/components/features/home/MyLessonsSection'
import type { LessonData } from '@/components/features/home/MyLessonsSection'

// ─── Mock 데이터 ─────────────────────────────────────────────────────────────

interface MockChannel {
  id: string
  name: string
  /** YouTube Data API V3로 가져올 채널 프로필 이미지 URL (백엔드 연동 전 undefined) */
  profileImageUrl?: string
}

const MOCK_MY_LESSONS: LessonData[] = [
  {
    id: '1',
    title: 'BTS - Butter MV Reaction',
    channelName: 'HYBE Labels',
    duration: '3:52',
    date: '2026.05.05',
    generationStatus: 'generating',
    minutesLeft: 3,
  },
  {
    id: '2',
    title: 'How to Order at a Korean Cafe',
    channelName: 'Korean Daily',
    duration: '8:40',
    date: '2026.05.05',
    generationStatus: 'generating',
    minutesLeft: 7,
  },
  {
    id: '3',
    title: 'Korean Street Food Tour Seoul',
    channelName: 'Seoul Eats',
    duration: '14:22',
    date: '2026.05.04',
    generationStatus: 'ready',
    flashcardDone: false,
    subtitleDone: false,
  },
  {
    id: '4',
    title: 'K-drama Vocabulary Basics',
    channelName: 'KBS Drama',
    duration: '12:30',
    date: '2026.05.03',
    generationStatus: 'ready',
    flashcardDone: true,
    subtitleDone: false,
  },
  {
    id: '5',
    title: 'Learn Korean with BLACKPINK',
    channelName: 'BLACKPINK',
    duration: '5:21',
    date: '2026.05.02',
    generationStatus: 'ready',
    flashcardDone: true,
    subtitleDone: true,
  },
]

// 최근 추가 순 — 가장 왼쪽이 가장 최근 (실제 정렬은 백엔드 담당)
const MOCK_CHANNELS: MockChannel[] = [
  { id: '1', name: 'BLACKPINK' },
  { id: '2', name: 'Learn Korean' },
  { id: '3', name: 'KBS Drama' },
]

// 이미 Lesson화된 영상은 Recommendations에서 제외 (백엔드 로직)
const MOCK_RECOMMENDATIONS: LessonData[] = [
  {
    id: 'r1',
    title: 'Korean Pronunciation Guide for Beginners',
    channelName: 'Korean Class 101',
    duration: '8:15',
    date: '2026.05.07',
    generationStatus: 'ready',
  },
  {
    id: 'r2',
    title: '10 Must-Know Korean Slang Words',
    channelName: 'Talk To Me In Korean',
    duration: '6:42',
    date: '2026.05.06',
    generationStatus: 'ready',
  },
  {
    id: 'r3',
    title: 'Korean Food Vocabulary with Chef',
    channelName: 'Maangchi',
    duration: '15:20',
    date: '2026.05.06',
    generationStatus: 'ready',
  },
  {
    id: 'r4',
    title: 'K-pop Lyrics Korean Lesson',
    channelName: 'SMTOWN',
    duration: '4:58',
    date: '2026.05.05',
    generationStatus: 'ready',
  },
]

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

/** 채널 버블 — profileImageUrl이 있으면 프로필 이미지, 없으면 이름 첫 글자 표시 */
function ChannelBubble({ name, profileImageUrl }: MockChannel) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="w-14 h-14 rounded-full bg-neutral-200 overflow-hidden ring-2 ring-transparent group-hover:ring-primary-200 transition-all">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-500">
            {name[0].toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors max-w-[64px] text-center truncate">
        {name}
      </span>
    </div>
  )
}

// ─── 홈 페이지 ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* 히어로 — URL 입력 영역 */}
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

      {/* 콘텐츠 영역 */}
      <div className="px-10 py-8 space-y-10">
        {/* My Lessons — 상태 필터 포함 클라이언트 컴포넌트 */}
        <MyLessonsSection lessons={MOCK_MY_LESSONS} />

        {/* My Channels */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-neutral-950">My Channels</h2>
            <Link href="/channels" className="flex items-center gap-0.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-start gap-5">
            {MOCK_CHANNELS.map((channel) => (
              <ChannelBubble key={channel.id} {...channel} />
            ))}
            {/* 채널 추가 */}
            <div className="flex flex-col items-center gap-2">
              <button
                className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xl hover:border-primary-400 hover:text-primary hover:bg-primary-50 transition-all"
                aria-label="채널 추가"
              >
                +
              </button>
              <span className="text-xs text-neutral-400">Add</span>
            </div>
          </div>
        </section>

        {/* Recommendations — 학습 상태 미표시 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-neutral-950">Recommendations</h2>
            <Link href="/recommendations" className="flex items-center gap-0.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {MOCK_RECOMMENDATIONS.map((item) => (
              <VideoCard key={item.id} {...item} showLearning={false} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
