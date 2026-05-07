export type VideoCardStatus = 'completed' | 'generating' | 'studied'

interface VideoCardProps {
  title: string
  date: string
  status: VideoCardStatus
  minutesLeft?: number
}

/** 비디오 카드 — completed(생성 완료) / generating(생성 중) / studied(학습 완료) */
export default function VideoCard({ title, date, status, minutesLeft }: VideoCardProps) {
  if (status === 'generating') {
    return (
      <div className="w-[220px] shrink-0 rounded-lg bg-neutral-800 overflow-hidden cursor-pointer hover:bg-neutral-700 transition-colors">
        <div className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-1">
          <span className="text-sm font-medium text-neutral-100">Generating..</span>
          <span className="text-xs text-neutral-400">
            {minutesLeft != null ? `${minutesLeft} minutes left` : 'n minutes left'}
          </span>
        </div>
        <div className="px-3 py-3 bg-neutral-800 border-t border-neutral-700">
          <p className="text-sm font-medium text-neutral-300 truncate">{title}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{date}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[220px] shrink-0 rounded-lg bg-white border border-neutral-200 overflow-hidden cursor-pointer hover:border-neutral-300 transition-colors">
      <div className="w-full aspect-[4/3] bg-neutral-200" />
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-neutral-950 truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-neutral-400">{date}</span>
          {status === 'completed' && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-pill bg-neutral-950 text-white">
              Ready to Play!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
