import { Play, Loader2, CreditCard, Captions } from 'lucide-react'

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
  /** showLearning이 false여도 학습 상태 영역 높이를 예약할지 여부 */
  reserveLearningSpace?: boolean
  /** true이면 w-full로 그리드 레이아웃에 맞춤 (기본값: false → w-[240px] 고정) */
  fluid?: boolean
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


/** 학습 활동 독립 pill — 완료 여부에 따라 색상만 변경 */
export function ActivityPill({
  done,
  label,
  icon: Icon,
  onClick,
  className = '',
}: {
  done: boolean
  label: string
  icon: React.ElementType
  onClick?: (e: React.MouseEvent) => void
  className?: string
}) {
  const baseClass = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${
    done
      ? 'bg-primary-50 text-primary border-primary-200'
      : 'bg-neutral-50 text-neutral-400 border-neutral-200'
  } ${className}`

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClass} hover:shadow-sm hover:border-primary hover:text-primary`}>
        <Icon className="w-3 h-3 shrink-0" />
        {label}
      </button>
    )
  }

  return (
    <div className={baseClass}>
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </div>
  )
}

/**
 * 학습 상태 라벨 + 두 활동을 독립 pill로 표시
 * — 순서 무관, 각 활동의 완료 여부만 반영
 */
export function LearningStatusPills({
  flashcardDone,
  subtitleDone,
}: {
  flashcardDone: boolean
  subtitleDone: boolean
}) {
  const doneCount = (flashcardDone ? 1 : 0) + (subtitleDone ? 1 : 0)

  const statusLabel = (
    { 0: 'Not Started', 1: 'In Progress', 2: 'Completed' } as const
  )[doneCount as 0 | 1 | 2]

  return (
    <div className="mt-3 pt-2.5 border-t border-neutral-100">
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-neutral-500">
        {statusLabel}
      </p>
      <div className="flex gap-2">
        <ActivityPill done={flashcardDone} label="Flashcard" icon={CreditCard} className="flex-1" />
        <ActivityPill done={subtitleDone}  label="Watch"     icon={Captions} className="flex-1" />
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
  reserveLearningSpace = false,
  fluid = false,
}: VideoCardProps) {
  const displayStatus = deriveDisplayStatus(generationStatus, flashcardDone, subtitleDone)
  const sizeClass = fluid ? 'w-full' : 'w-[240px] shrink-0'

  if (displayStatus === 'generating') {
    return (
      <div className={`${sizeClass} rounded-xl bg-neutral-900 overflow-hidden cursor-pointer flex flex-col`}>
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
          {/* 높이를 맞추기 위한 보이지 않는 공간 (ready 카드의 LearningSteps 영역만큼 차지) */}
          {showLearning && (
            <div className="invisible">
              <LearningStatusPills flashcardDone={false} subtitleDone={false} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded-xl bg-white border border-neutral-200 overflow-hidden cursor-pointer group hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col`}>
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
          <LearningStatusPills flashcardDone={flashcardDone} subtitleDone={subtitleDone} />
        )}
        {!showLearning && reserveLearningSpace && (
          <div className="invisible">
            <LearningStatusPills flashcardDone={false} subtitleDone={false} />
          </div>
        )}
      </div>
    </div>
  )
}
