'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 개발 중 콘솔에 원인을 남겨 디버깅하기 쉽게 합니다.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-red-500">화면을 불러오지 못했습니다</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">잠시 후 다시 시도해주세요</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          일시적인 개발 서버 오류이거나, 화면 컴포넌트 내부 예외일 수 있습니다.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
