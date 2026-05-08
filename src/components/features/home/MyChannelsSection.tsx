'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, X, Plus, Check } from 'lucide-react'

interface ChannelBubble {
  id: string
  name: string
  profileImageUrl?: string
}

interface SearchResult {
  id: string
  name: string
  handle: string
  subscriberCount: string
}

const SEARCHABLE_CHANNELS: SearchResult[] = [
  { id: 's1', name: 'SMTOWN', handle: '@SMTOWN', subscriberCount: '33.8M' },
  { id: 's2', name: 'HYBE LABELS', handle: '@HYBELABELS', subscriberCount: '24.5M' },
  { id: 's3', name: 'KBS World TV', handle: '@KBSWorldTV', subscriberCount: '8.1M' },
  { id: 's4', name: 'tvN Drama', handle: '@tvNDrama', subscriberCount: '5.6M' },
  { id: 's5', name: 'Korean Unnie', handle: '@KoreanUnnie', subscriberCount: '2.3M' },
  { id: 's6', name: 'Seoul Eats', handle: '@SeoulEats', subscriberCount: '980K' },
  { id: 's7', name: 'GO! Billy Korean', handle: '@GoBillyKorean', subscriberCount: '1.1M' },
  { id: 's8', name: 'Arirang TV', handle: '@ArirangTV', subscriberCount: '3.7M' },
]

interface MyChannelsSectionProps {
  initialChannels: ChannelBubble[]
}

export default function MyChannelsSection({ initialChannels }: MyChannelsSectionProps) {
  const [channels, setChannels] = useState<ChannelBubble[]>(initialChannels)
  const [showModal, setShowModal] = useState(false)
  const [addSearch, setAddSearch] = useState('')

  const addedIds = new Set(channels.map((c) => c.id))

  const searchResults = useMemo(() => {
    if (!addSearch.trim()) return SEARCHABLE_CHANNELS
    const q = addSearch.toLowerCase()
    return SEARCHABLE_CHANNELS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
    )
  }, [addSearch])

  const handleAddChannel = (result: SearchResult) => {
    if (addedIds.has(result.id)) return
    setChannels((prev) => [...prev, { id: result.id, name: result.name }])
  }

  const openModal = () => {
    setAddSearch('')
    setShowModal(true)
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-neutral-950 truncate">My Channels</h2>
        <Link
          href="/channels"
          className="flex items-center gap-0.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-start gap-5 flex-wrap">
        {channels.map((channel) => (
          <div key={channel.id} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-neutral-200 overflow-hidden ring-2 ring-transparent group-hover:ring-primary-200 transition-all">
              {channel.profileImageUrl ? (
                <img src={channel.profileImageUrl} alt={channel.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-500">
                  {channel.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors max-w-[64px] text-center truncate">
              {channel.name}
            </span>
          </div>
        ))}

        {/* 채널 추가 버튼 */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={openModal}
            className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xl hover:border-primary-400 hover:text-primary hover:bg-primary-50 transition-all"
            aria-label="채널 추가"
          >
            +
          </button>
          <span className="text-xs text-neutral-400">Add</span>
        </div>
      </div>

      {/* 채널 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[70vh]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div>
                <p className="text-base font-bold text-neutral-950">Add Channel</p>
                <p className="text-xs text-neutral-400 mt-0.5">Search for a YouTube channel to follow</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 검색 입력 */}
            <div className="px-6 py-4 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search YouTube channels..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* 검색 결과 */}
            <div className="overflow-y-auto flex-1 px-3 py-2">
              {searchResults.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-8">No channels found.</p>
              ) : (
                searchResults.map((result) => {
                  const isAdded = addedIds.has(result.id)
                  return (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {result.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-950 truncate">{result.name}</p>
                        <p className="text-xs text-neutral-400">{result.handle} · {result.subscriberCount}</p>
                      </div>
                      <button
                        onClick={() => handleAddChannel(result)}
                        disabled={isAdded}
                        className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isAdded
                            ? 'bg-neutral-100 text-neutral-400 cursor-default'
                            : 'bg-primary text-white hover:bg-primary-700'
                        }`}
                      >
                        {isAdded ? (
                          <><Check className="w-3 h-3" /> Added</>
                        ) : (
                          <><Plus className="w-3 h-3" /> Add</>
                        )}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
