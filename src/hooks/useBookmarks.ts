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

const STORAGE_KEY = 'linko_bookmarks'

function loadFromStorage(): BookmarkedCard[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BookmarkedCard[]) : []
  } catch {
    return []
  }
}

function saveToStorage(items: BookmarkedCard[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCard[]>([])

  useEffect(() => {
    setBookmarks(loadFromStorage())
  }, [])

  const addBookmark = useCallback((card: Omit<BookmarkedCard, 'savedAt'>) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.cardId === card.cardId)) return prev
      const next = [{ ...card, savedAt: new Date().toISOString() }, ...prev]
      saveToStorage(next)
      return next
    })
  }, [])

  const removeBookmark = useCallback((cardId: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.cardId !== cardId)
      saveToStorage(next)
      return next
    })
  }, [])

  const isBookmarked = useCallback(
    (cardId: string) => bookmarks.some((b) => b.cardId === cardId),
    [bookmarks]
  )

  return { bookmarks, addBookmark, removeBookmark, isBookmarked }
}
