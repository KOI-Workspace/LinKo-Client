import { Play, Loader2, Check, BookOpen, Clock } from 'lucide-react'

export type GenerationStatus = 'generating' | 'ready'
export type LessonDisplayStatus = 'generating' | 'not_started' | 'in_progress' | 'completed'
export type LessonFilterStatus = 'all' | LessonDisplayStatus

export interface VideoCardProps {
  title: string
  channelName?: string
  duration?: string
  date: string
  generationStatus: GenerationStatus
  minutesLeft?: number
  /** 플래시카드 학습 완료 여부 */
  flashcardDone?: boolean
  /** 자막 시청 완료 여부 */
  subtitleDone?: boolean
  thumbnailUrl?: string
  /** false이면 학습 상태 배지·진행률 미표시 (Recommendations 등에 사용) */
  showLearning?: boolean
}

/** generationStatus + 학습 활동 조합으로 표시 상태 도출 */
export function deriveDisplayStatus(
  generationStatus: GenerationStatus,
  flashcardDone = false,
  subtitleDone = false
): LessonDisplayStatus {
  if (generationStatus === 'generating') return 'generating'
  const count = (flashcardDone ? 1 : 0) + (subtitleDone ? 1 : 0)
  if (count === 0) return 'not_started'
  if (count === 1) return 'in_progress'
  return 'completed'
}

/** 학습 상태 배지 */
function StatusBadge({ status }: { status: Exclude<LessonDisplayStatus, 'generating'> }) {
  const configs = {
    completed:   { icon: Check,    label: 'Completed',   className: 'bg-emerald-500 text-white' },
    in_progress: { icon: BookOpen, label: 'In Progress',  className: 'bg-primary text-white' },
    not_started: { icon: Clock,    label: 'Not Started',  className: 'bg-white border border-neutral-200 text-neutral-600' },
  } as const
  const { icon: Icon, label, className } = configs[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-pill shadow-sm ${className}`}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {label}
    </span>
  )
}

/**
 * 플래시카드·시청 두 단계를 각각 세그먼트로 표시
 * — 영상 재생 타임라인과 혼동되지 않도록 카드 정보 영역 내에 레이블과 함께 배치
 */
function LearningSteps({
  flashcardDone,
  subtitleDone,
}: {
  flashcardDone: boolean
  subtitleDone: boolean
}) {
  const pct = flashcardDone && subtitleDone ? '100%' : flashcardDone || subtitleDone ? '50%' : '0%'

  return (
    <div className="mt-3 pt-2.5 border-t border-neutral-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
          Learning
        </span>
        <span className="text-[10px] font-bold text-primary">{pct}</span>
      </div>
      <div className="flex gap-1.5">
        {/* 플래시카드 세그먼트 */}
        <div className="flex-1 flex flex-col gap-1">
          <div
            className={`h-1.5 rounded-full transition-colors duration-300 ${
              flashcardDone ? 'bg-primary' : 'bg-neutral-200'
            }`}
          />
          <span
            className={`text-[10px] ${flashcardDone ? 'text-primary font-medium' : 'text-neutral-400'}`}
          >
            Flashcard
          </span>
        </div>
        {/* 자막 시청 세그먼트 */}
        <div className="flex-1 flex flex-col gap-1 items-end">
          <div
            className={`w-full h-1.5 rounded-full transition-colors duration-300 ${
              subtitleDone ? 'bg-primary' : 'bg-neutral-200'
            }`}
          />
          <span
            className={`text-[10px] ${subtitleDone ? 'text-primary font-medium' : 'text-neutral-400'}`}
          >
            Watch
          </span>
        </div>
      </div>
    </div>
  )
}

/** generating 상태에서 카드 높이 통일용 빈 플레이스홀더 */
function GeneratingHeightPlaceholder() {
  return (
    <div aria-hidden="true" className="mt-3 pt-2.5 border-t border-neutral-800">
      <div className="flex items-center justify-between mb-2 opacity-0">
        <span className="text-[10px] font-medium uppercase tracking-wider">Learning</span>
        <span className="text-[10px] font-bold">0%</span>
      </div>
      <div className="flex gap-1.5 opacity-0">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 rounded-full bg-neutral-700" />
          <span className="text-[10px]">Flashcard</span>
        </div>
        <div className="flex-1 flex flex-col gap-1 items-end">
          <div className="w-full h-1.5 rounded-full bg-neutral-700" />
          <span className="text-[10px]">Watch</span>
        </div>
      </div>
    </div>
  )
}

/** 비디오 카드 */
export default function VideoCard({
  title,
  channelName,
  duration,
  date,
  generationStatus,
  minutesLeft,
  flashcardDone = false,
  subtitleDone = false,
  thumbnailUrl,
  showLearning = true,
}: VideoCardProps) {
  const displayStatus = deriveDisplayStatus(generationStatus, flashcardDone, subtitleDone)

  if (displayStatus === 'generating') {
    return (
      <div className="w-[240px] shrink-0 rounded-xl bg-neutral-900 overflow-hidden cursor-pointer flex flex-col">
        <div className="w-full aspect-video flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" strokeWidth={1.5} />
          <span className="text-sm font-medium text-neutral-300">Generating lesson...</span>
          <span className="text-xs text-neutral-500">
            {minutesLeft != null ? `~${minutesLeft} min left` : 'Processing...'}
          </span>
        </div>
        <div className="px-3 py-3 border-t border-neutral-800 flex-1">
          <p className="text-sm font-semibold text-neutral-300 truncate">{title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {channelName && (
              <p className="text-xs text-neutral-600 truncate max-w-[120px]">{channelName}</p>
            )}
            {channelName && <span className="text-neutral-700 text-xs">·</span>}
            <p className="text-xs text-neutral-500">{date}</p>
          </div>
          {showLearning && <GeneratingHeightPlaceholder />}
        </div>
      </div>
    )
  }

  return (
    <div className="w-[240px] shrink-0 rounded-xl bg-white border border-neutral-200 overflow-hidden cursor-pointer group hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col">
      {/* 썸네일 */}
      <div className="relative w-full aspect-video bg-neutral-100">
        {thumbnailUrl && (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center">
            <Play className="w-4 h-4 text-neutral-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {showLearning && (
          <div className="absolute top-2 left-2">
            <StatusBadge status={displayStatus} />
          </div>
        )}
        {duration && (
          <div className="absolute bottom-2 right-2">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-black/70 text-white">
              {duration}
            </span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="px-3 py-3 flex-1">
        <p className="text-sm font-semibold text-neutral-950 truncate">{title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {channelName && (
            <p className="text-xs text-neutral-400 truncate max-w-[120px]">{channelName}</p>
          )}
          {channelName && <span className="text-neutral-300 text-xs">·</span>}
          <p className="text-xs text-neutral-400">{date}</p>
        </div>
        {showLearning && (
          <LearningSteps flashcardDone={flashcardDone} subtitleDone={subtitleDone} />
        )}
      </div>
    </div>
  )
}
