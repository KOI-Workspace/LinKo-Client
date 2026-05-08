import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import UrlInput from '@/components/features/home/UrlInput'
import VideoCard from '@/components/features/home/VideoCard'
import MyLessonsSection from '@/components/features/home/MyLessonsSection'
import MyChannelsSection from '@/components/features/home/MyChannelsSection'
import type { LessonData } from '@/components/features/home/MyLessonsSection'

// ─── Mock 데이터 ─────────────────────────────────────────────────────────────

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

const MOCK_CHANNELS = [
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
        <MyChannelsSection initialChannels={MOCK_CHANNELS} />

        {/* Recommendations — 학습 상태 미표시 */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-bold text-neutral-950 truncate">Recommendations</h2>
            <Link href="/recommendations" className="flex items-center gap-0.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {MOCK_RECOMMENDATIONS.slice(0, 9).map((item) => (
              <VideoCard key={item.id} {...item} showLearning={false} fluid />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
