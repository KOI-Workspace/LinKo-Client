'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Bookmark, Settings, PanelLeftClose } from 'lucide-react'

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
      {/* 로고 + 토글 */}
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-xl font-bold text-neutral-950 tracking-tight">LinKo</span>
        <button
          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Create 버튼 */}
      <div className="px-3 pb-3">
        <button className="w-full rounded-pill bg-neutral-950 text-white text-sm font-medium py-2.5 hover:bg-neutral-800 transition-colors">
          + Create
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
                  ? 'text-primary font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-neutral-500'}`}
                strokeWidth={1.5}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* 사용자 정보 + 업그레이드 */}
      <div className="px-3 pb-5 space-y-3">
        <div className="flex items-center gap-2">
          {/* 아바타 */}
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 shrink-0">
            N
          </div>
          {/* 이름·이메일 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-neutral-950">Name</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-pill bg-primary-100 text-primary-800">
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
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <button className="w-full rounded-pill bg-neutral-950 text-white text-sm font-medium py-2.5 hover:bg-neutral-800 transition-colors">
          Upgrade
        </button>
      </div>
    </aside>
  )
}
