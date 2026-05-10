'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
          <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-red-500">전역 오류가 발생했습니다</p>
            <h1 className="mt-2 text-2xl font-semibold text-neutral-900">앱을 다시 불러와야 합니다</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              브라우저 상태가 꼬였거나, 서버 렌더링 단계에서 예외가 났을 수 있습니다.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              다시 시도
            </button>
            <p className="mt-4 text-xs text-neutral-400">{error.digest}</p>
          </div>
        </div>
      </body>
    </html>
  )
}
