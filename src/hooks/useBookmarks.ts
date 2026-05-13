'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ConjugationBadge } from '@/components/features/flashcard/flashcard.types'

export interface BookmarkedCard {
  cardId: string
  lessonId: string
  lessonTitle: string
  expression: string
  meaning: string
  exampleSentence: string
  exampleTranslation: string
  savedAt: string
  type?: 'sentence' | 'expression'
  subType?: 'word' | 'ending'
  conjugationBadges?: ConjugationBadge[]
  baseWord?: string
}

type BookmarkListener = (items: BookmarkedCard[]) => void

let bookmarkStore: BookmarkedCard[] = []
const listeners = new Set<BookmarkListener>()

function notifyBookmarks() {
  listeners.forEach((listener) => listener(bookmarkStore))
}

function subscribeBookmarks(listener: BookmarkListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function setBookmarkStore(next: BookmarkedCard[]) {
  bookmarkStore = next
  notifyBookmarks()
}

export function resetBookmarks() {
  if (bookmarkStore.length === 0) return
  setBookmarkStore([])
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCard[]>(bookmarkStore)

  useEffect(() => {
    setBookmarks(bookmarkStore)
    return subscribeBookmarks(setBookmarks)
  }, [])

  const addBookmark = useCallback((card: Omit<BookmarkedCard, 'savedAt'>) => {
    if (bookmarkStore.some((bookmark) => bookmark.cardId === card.cardId)) return
    setBookmarkStore([{ ...card, savedAt: new Date().toISOString() }, ...bookmarkStore])
  }, [])

  const removeBookmark = useCallback((cardId: string) => {
    setBookmarkStore(bookmarkStore.filter((bookmark) => bookmark.cardId !== cardId))
  }, [])

  const isBookmarked = useCallback(
    (cardId: string) => bookmarks.some((b) => b.cardId === cardId),
    [bookmarks]
  )

  return { bookmarks, addBookmark, removeBookmark, isBookmarked }
}
