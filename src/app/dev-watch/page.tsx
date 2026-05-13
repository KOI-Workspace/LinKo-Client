'use client'

import WatchTab from '@/components/features/watch/WatchTab'

/** 개발용 페이지 — Watch UI 확인용. 배포 전 삭제 예정. */
export default function DevWatchPage() {
  return (
    <div className="flex h-screen w-screen bg-neutral-950">
      <WatchTab lessonId="3" isPublic mobileStacked={false} />
    </div>
  )
}
