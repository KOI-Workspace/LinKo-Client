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

const MOCK_MY_VIDEOS: MockVideo[] = [
  { id: '1', title: 'Title', date: '2026.05.05', status: 'completed' },
  { id: '2', title: 'Title 2', date: '2026.05.05', status: 'generating', minutesLeft: 3 },
  { id: '3', title: 'Title 3', date: '2026.05.05', status: 'generating', minutesLeft: 5 },
  { id: '4', title: 'Title 4', date: '2026.05.04', status: 'studied' },
]

const MOCK_CHANNELS = [
  { id: '1', name: 'Channel 1' },
  { id: '2', name: 'Channel 2' },
  { id: '3', name: 'Channel 3' },
]

const MOCK_RECOMMENDATIONS: MockVideo[] = [
  { id: 'r1', title: 'Recommended Video 1', date: '2026.05.07', status: 'studied' },
  { id: 'r2', title: 'Recommended Video 2', date: '2026.05.06', status: 'studied' },
  { id: 'r3', title: 'Recommended Video 3', date: '2026.05.06', status: 'studied' },
  { id: 'r4', title: 'Recommended Video 4', date: '2026.05.05', status: 'studied' },
]

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-neutral-950">{title}</h2>
      <button className="flex items-center gap-0.5 text-sm text-neutral-500 hover:text-neutral-950 transition-colors">
        View All
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── 홈 페이지 ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="px-10 py-10">
      {/* 헤더 */}
      <h1 className="text-3xl font-bold text-neutral-950 mb-2">
        Which video will you learn Korean today?
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        Paste a YouTube link and we&apos;ll build a lesson for you automatically.
      </p>

      {/* URL 입력 */}
      <div className="max-w-2xl mb-12">
        <UrlInput />
      </div>

      {/* My videos */}
      <section className="mb-10">
        <SectionHeader title="My videos" />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {MOCK_MY_VIDEOS.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </section>

      {/* My channels */}
      <section className="mb-10">
        <SectionHeader title="My channels" />
        <div className="flex items-center gap-4">
          {MOCK_CHANNELS.map((channel) => (
            <div
              key={channel.id}
              className="w-16 h-16 rounded-full bg-neutral-200 shrink-0 cursor-pointer hover:bg-neutral-300 transition-colors"
              title={channel.name}
            />
          ))}
          {/* 채널 추가 버튼 */}
          <button
            className="w-16 h-16 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-2xl text-neutral-500 hover:bg-neutral-100 transition-colors shrink-0"
            aria-label="채널 추가"
          >
            +
          </button>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mb-10">
        <SectionHeader title="Recommendations" />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {MOCK_RECOMMENDATIONS.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </section>
    </div>
  )
}
