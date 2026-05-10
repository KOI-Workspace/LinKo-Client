'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Bookmark, Settings, PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',      label: 'Home',      icon: Home },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
]

/** 앱 전역 사이드바 — 접기/펼치기 토글 지원 */
export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`shrink-0 sticky top-0 h-screen flex flex-col bg-neutral-50 border-r border-neutral-200 transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* 로고 + 토글 버튼 */}
      <div className={`flex items-center py-4 transition-all duration-300 ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
        {!isCollapsed && (
          <span className="text-lg font-bold text-neutral-950 tracking-tight">LinKo</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isCollapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Create 버튼
          - 버튼은 항상 w-full 유지 → mx-auto 없이 덜컹임 방지
          - 컨테이너 패딩을 px-3 → px-4 로 조절해 접혔을 때 (64-32=32px) 완전한 원형 */}
      <div
        className={`pb-4 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-4' : 'px-3'}`}
      >
        <button
          className={`w-full flex items-center justify-center bg-neutral-950 text-white hover:bg-neutral-800 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'h-8 rounded-full gap-0' : 'py-2.5 rounded-pill gap-2'
          }`}
          aria-label="Create"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span
            className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ${
              isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[80px] opacity-100'
            }`}
          >
            Create
          </span>
        </button>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center rounded-md text-sm transition-all duration-300 ${
                isCollapsed ? 'justify-center px-2 py-2.5 gap-0' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'text-primary font-medium bg-primary-50'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-neutral-400'}`}
                strokeWidth={1.5}
              />
              {/* whitespace-nowrap + max-w 트랜지션으로 줄바꿈 없이 자연스럽게 */}
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* 구분선 */}
      <div className="mx-3 border-t border-neutral-200" />

      {/* 사용자 정보 */}
      <div className="px-3 py-4 space-y-3">
        {isCollapsed ? (
          /* 접힌 상태 — 아바타만 표시 */
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary">
              N
            </div>
          </div>
        ) : (
          /* 펼친 상태 — 이름·이메일·설정·업그레이드 */
          <>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                N
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-neutral-950">Name</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-pill bg-neutral-100 text-neutral-500 border border-neutral-200">
                    free
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate">aa@gmail.com</p>
              </div>
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
          </>
        )}
      </div>
    </aside>
  )
}
