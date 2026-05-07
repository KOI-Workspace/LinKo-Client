import { Play, Loader2 } from 'lucide-react'

export type VideoCardStatus = 'completed' | 'generating' | 'studied'

interface VideoCardProps {
  title: string
  date: string
  status: VideoCardStatus
  minutesLeft?: number
}

/** 비디오 카드 — completed / generating / studied */
export default function VideoCard({ title, date, status, minutesLeft }: VideoCardProps) {
  if (status === 'generating') {
    return (
      <div className="w-[240px] shrink-0 rounded-xl bg-neutral-900 overflow-hidden cursor-pointer">
        <div className="relative w-full aspect-video flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" strokeWidth={1.5} />
          <span className="text-sm font-medium text-neutral-300">Generating lesson...</span>
          <span className="text-xs text-neutral-500">
            {minutesLeft != null ? `~${minutesLeft} min left` : 'Processing...'}
          </span>
          {/* 진행 표시 바 */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-700">
            <div className="h-full w-1/3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        <div className="px-3 py-3 border-t border-neutral-800">
          <p className="text-sm font-semibold text-neutral-300 truncate">{title}</p>
          <p className="text-xs text-neutral-600 mt-0.5">{date}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[240px] shrink-0 rounded-xl bg-white border border-neutral-200 overflow-hidden cursor-pointer group hover:shadow-md hover:border-neutral-300 transition-all duration-200">
      {/* 썸네일 */}
      <div className="relative w-full aspect-video bg-neutral-100">
        {/* 호버 시 재생 버튼 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center">
            <Play className="w-4 h-4 text-neutral-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* 완료 배지 */}
        {status === 'completed' && (
          <div className="absolute top-2 left-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-pill bg-primary text-white shadow-sm">
              Ready to Play!
            </span>
          </div>
        )}
      </div>
      {/* 정보 */}
      <div className="px-3 py-3">
        <p className="text-sm font-semibold text-neutral-950 truncate">{title}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{date}</p>
      </div>
    </div>
  )
}
