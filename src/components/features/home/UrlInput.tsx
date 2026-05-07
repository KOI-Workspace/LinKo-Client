'use client'

import { useState } from 'react'
import { Link2, ArrowUp } from 'lucide-react'

/** YouTube URL 입력 + 학습자료 생성 요청 컴포넌트 */
export default function UrlInput() {
  const [url, setUrl] = useState('')

  const handleSubmit = () => {
    if (!url.trim()) return
    // TODO: 학습자료 생성 API 연동
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-xs focus-within:border-primary transition-all">
      <Link2 className="w-5 h-5 text-neutral-400 shrink-0" strokeWidth={1.5} />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https:// ~~"
        className="flex-1 text-sm text-neutral-950 placeholder:text-neutral-400 bg-transparent outline-none"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-700 transition-colors shrink-0"
        aria-label="학습자료 생성"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  )
}
