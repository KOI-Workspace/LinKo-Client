'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Bookmark, Settings, PanelLeftClose, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/study', label: 'My Study', icon: BookOpen },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
]

/** 앱 전역 사이드바 */
export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 sticky top-0 h-screen flex flex-col bg-neutral-50 border-r border-neutral-200">
      {/* 로고 */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-lg font-bold text-neutral-950 tracking-tight">LinKo</span>
        <button
          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Create 버튼 */}
      <div className="px-4 pb-4">
        <button className="w-full flex items-center justify-center gap-2 rounded-pill bg-neutral-950 text-white text-sm font-medium py-2.5 hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'text-primary font-medium bg-primary-50'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-neutral-400'}`}
                strokeWidth={1.5}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* 구분선 */}
      <div className="mx-4 border-t border-neutral-200" />

      {/* 사용자 정보 + 업그레이드 */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            N
          </div>
          {/* 이름·이메일 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-neutral-950">Name</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-pill bg-neutral-100 text-neutral-500 border border-neutral-200">
                free
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate">aa@gmail.com</p>
          </div>
          {/* 설정 */}
          <button
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors shrink-0"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="w-full rounded-pill bg-primary text-white text-sm font-medium py-2.5 hover:bg-primary-700 transition-colors">
          Upgrade to Pro
        </button>
      </div>
    </aside>
  )
}
