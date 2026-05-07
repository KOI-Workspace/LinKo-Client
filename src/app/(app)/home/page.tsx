import { ChevronRight } from 'lucide-react'
import UrlInput from '@/components/features/home/UrlInput'
import VideoCard from '@/components/features/home/VideoCard'
import type { VideoCardStatus } from '@/components/features/home/VideoCard'

// ─── Mock 데이터 ─────────────────────────────────────────────────────────────

interface MockVideo {
  id: string
  title: string
  date: string
  status: VideoCardStatus
  minutesLeft?: number
}

interface MockChannel {
  id: string
  name: string
  initial: string
}

const MOCK_MY_VIDEOS: MockVideo[] = [
  { id: '1', title: 'BTS - Butter MV Reaction', date: '2026.05.05', status: 'completed' },
  { id: '2', title: 'Korean Street Food Tour Seoul', date: '2026.05.05', status: 'generating', minutesLeft: 3 },
  { id: '3', title: 'How to Order at a Korean Cafe', date: '2026.05.05', status: 'generating', minutesLeft: 7 },
  { id: '4', title: 'K-drama Vocabulary Basics', date: '2026.05.04', status: 'studied' },
  { id: '5', title: 'Learn Korean with BLACKPINK', date: '2026.05.03', status: 'studied' },
]

const MOCK_CHANNELS: MockChannel[] = [
  { id: '1', name: 'BLACKPINK', initial: 'B' },
  { id: '2', name: 'Learn Korean', initial: 'L' },
  { id: '3', name: 'KBS Drama', initial: 'K' },
]

const MOCK_RECOMMENDATIONS: MockVideo[] = [
  { id: 'r1', title: 'Korean Pronunciation Guide for Beginners', date: '2026.05.07', status: 'studied' },
  { id: 'r2', title: '10 Must-Know Korean Slang Words', date: '2026.05.06', status: 'studied' },
  { id: 'r3', title: 'Korean Food Vocabulary with Chef', date: '2026.05.06', status: 'studied' },
  { id: 'r4', title: 'K-pop Lyrics Korean Lesson', date: '2026.05.05', status: 'studied' },
]

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-bold text-neutral-950">{title}</h2>
      <button className="flex items-center gap-0.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
        View All
        <ChevronRight className="w-4 h-4" />
      </button>
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
        {/* My videos */}
        <section>
          <SectionHeader title="My videos" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {MOCK_MY_VIDEOS.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
        </section>

        {/* My channels */}
        <section>
          <SectionHeader title="My channels" />
          <div className="flex items-start gap-5">
            {MOCK_CHANNELS.map((channel) => (
              <div
                key={channel.id}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-500 group-hover:ring-2 group-hover:ring-primary-200 transition-all">
                  {channel.initial}
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors max-w-[64px] text-center truncate">
                  {channel.name}
                </span>
              </div>
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

        {/* Recommendations */}
        <section>
          <SectionHeader title="Recommendations" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {MOCK_RECOMMENDATIONS.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
