'use client'

import { useState, useEffect, useRef, useMemo, useCallback, type CSSProperties } from 'react'
import {
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  Settings2,
  Info,
  Check,
  GripVertical,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'
import type { BookmarkedCard } from '@/hooks/useBookmarks'
import { MOCK_FLASHCARDS } from '@/components/features/flashcard/mockFlashcards'
import { getLessonSubtitles, getPublicLessonSubtitles } from '@/lib/lessonsApi'

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface VocabEntry {
  meaning: string
  cardId?: string
  lessonId?: string
  expression: string
  exampleSentence: string
  exampleTranslation: string
}

interface SubtitleLine {
  id: string
  startSec: number
  endSec: number
  korean: string
  english: string
}

type SubtitleDisplayMode = 'bilingual' | 'korean' | 'english'
type SidePanelTab = 'transcript' | 'culture'

interface CulturalNote {
  id: string
  subtitleId: string
  title: string
  keyword: string
  explanation: string
}

// ─── 레슨별 단어 매핑 (자막에 나오는 텍스트 형태 → 플래시카드 정보) ─────────────────

const WATCH_VOCAB: Record<string, Record<string, VocabEntry>> = {
  '3': {
    // ── 핵심 레슨 단어 ──
    '길거리 음식': {
      meaning: 'Street food',
      cardId: 'fc-3-1', lessonId: '3', expression: '길거리 음식',
      exampleSentence: '서울의 길거리 음식은 정말 다양하고 맛있어요.',
      exampleTranslation: 'Street food in Seoul is incredibly diverse and delicious.',
    },
    '가득해요': {
      meaning: 'To be full of / packed with',
      cardId: 'fc-3-2', lessonId: '3', expression: '가득하다',
      exampleSentence: '이 시장은 맛있는 음식 가게로 가득해요.',
      exampleTranslation: 'This market is packed with delicious food stalls.',
    },
    '먹어봐야 해요': {
      meaning: 'You must try it',
      cardId: 'fc-3-3', lessonId: '3', expression: '꼭 먹어봐야 해',
      exampleSentence: '한국에 오면 떡볶이는 꼭 먹어봐야 해요.',
      exampleTranslation: 'If you come to Korea, you must try tteokbokki.',
    },
    '줄을 서요': {
      meaning: 'To stand in line',
      cardId: 'fc-3-4', lessonId: '3', expression: '줄을 서다',
      exampleSentence: '사람들이 이 꼬치를 사려고 몇 시간씩 줄을 서요.',
      exampleTranslation: 'People stand in line for hours to buy these skewers.',
    },
    '저렴해요': {
      meaning: 'Affordable / inexpensive',
      cardId: 'fc-3-5', lessonId: '3', expression: '저렴하다',
      exampleSentence: '여기 길거리 음식은 놀랍도록 저렴해요.',
      exampleTranslation: 'Street food here is surprisingly affordable.',
    },
    '노점상': {
      meaning: 'Street vendor / food stall',
      cardId: 'fc-3-6', lessonId: '3', expression: '노점상',
      exampleSentence: '노점상 아저씨가 따뜻한 어묵 국물을 건네주셨어요.',
      exampleTranslation: 'The street vendor handed me a steaming cup of fish cake broth.',
    },
    // ── 자막 전체 단어 ──
    '안녕하세요': {
      meaning: 'Hello (formal greeting)',
      cardId: 'fc-3-7', lessonId: '3', expression: '안녕하세요',
      exampleSentence: '안녕하세요! 처음 뵙겠습니다.',
      exampleTranslation: 'Hello! Nice to meet you.',
    },
    '오늘': {
      meaning: 'Today',
      cardId: 'fc-3-8', lessonId: '3', expression: '오늘',
      exampleSentence: '오늘 날씨가 정말 좋아요.',
      exampleTranslation: 'The weather is really nice today.',
    },
    '서울': {
      meaning: 'Seoul (capital of South Korea)',
      cardId: 'fc-3-9', lessonId: '3', expression: '서울',
      exampleSentence: '서울은 한국의 수도예요.',
      exampleTranslation: 'Seoul is the capital of Korea.',
    },
    '함께': {
      meaning: 'Together / With',
      cardId: 'fc-3-10', lessonId: '3', expression: '함께',
      exampleSentence: '우리 함께 공부해요.',
      exampleTranslation: "Let's study together.",
    },
    '시장': {
      meaning: 'Market',
      cardId: 'fc-3-11', lessonId: '3', expression: '시장',
      exampleSentence: '광장시장은 서울에서 유명한 전통 시장이에요.',
      exampleTranslation: 'Gwangjang Market is a famous traditional market in Seoul.',
    },
    '다양하고': {
      meaning: 'Diverse / Various',
      cardId: 'fc-3-12', lessonId: '3', expression: '다양하다',
      exampleSentence: '한국 음식은 종류가 정말 다양해요.',
      exampleTranslation: 'Korean food comes in really diverse varieties.',
    },
    '맛있는': {
      meaning: 'Delicious / Tasty',
      cardId: 'fc-3-13', lessonId: '3', expression: '맛있다',
      exampleSentence: '이 떡볶이는 정말 맛있어요.',
      exampleTranslation: 'This tteokbokki is really delicious.',
    },
    '한국': {
      meaning: 'Korea / South Korea',
      cardId: 'fc-3-14', lessonId: '3', expression: '한국',
      exampleSentence: '한국에는 맛있는 음식이 정말 많아요.',
      exampleTranslation: 'There is so much delicious food in Korea.',
    },
    '떡볶이': {
      meaning: 'Tteokbokki (spicy stir-fried rice cakes)',
      cardId: 'fc-3-15', lessonId: '3', expression: '떡볶이',
      exampleSentence: '떡볶이는 한국에서 가장 인기 있는 길거리 음식이에요.',
      exampleTranslation: 'Tteokbokki is the most popular street food in Korea.',
    },
    '꼭': {
      meaning: 'Definitely / Must / Without fail',
      cardId: 'fc-3-16', lessonId: '3', expression: '꼭',
      exampleSentence: '한국에 오면 꼭 삼겹살을 먹어봐야 해요.',
      exampleTranslation: 'If you come to Korea, you must definitely try samgyeopsal.',
    },
    '사람들': {
      meaning: 'People',
      cardId: 'fc-3-17', lessonId: '3', expression: '사람들',
      exampleSentence: '사람들이 이 가게 앞에 매일 줄을 서요.',
      exampleTranslation: 'People stand in line in front of this shop every day.',
    },
    '꼬치': {
      meaning: 'Skewer / Grilled skewer',
      cardId: 'fc-3-18', lessonId: '3', expression: '꼬치',
      exampleSentence: '이 꼬치는 간이 딱 맞아요.',
      exampleTranslation: 'This skewer is perfectly seasoned.',
    },
    '놀랍도록': {
      meaning: 'Surprisingly / Amazingly',
      cardId: 'fc-3-19', lessonId: '3', expression: '놀랍다',
      exampleSentence: '이 가격은 놀랍도록 저렴해요.',
      exampleTranslation: 'This price is surprisingly affordable.',
    },
    '아저씨': {
      meaning: 'Middle-aged man / Sir (informal)',
      cardId: 'fc-3-20', lessonId: '3', expression: '아저씨',
      exampleSentence: '아저씨, 이거 얼마예요?',
      exampleTranslation: 'Sir, how much is this?',
    },
    '따뜻한': {
      meaning: 'Warm / Cozy',
      cardId: 'fc-3-21', lessonId: '3', expression: '따뜻하다',
      exampleSentence: '따뜻한 국물이 정말 맛있어요.',
      exampleTranslation: 'Warm broth is really delicious.',
    },
    '어묵': {
      meaning: 'Fish cake (eomuk)',
      cardId: 'fc-3-22', lessonId: '3', expression: '어묵',
      exampleSentence: '어묵 국물은 겨울에 특히 맛있어요.',
      exampleTranslation: 'Fish cake broth is especially delicious in winter.',
    },
    '국물': {
      meaning: 'Broth / Soup base',
      cardId: 'fc-3-23', lessonId: '3', expression: '국물',
      exampleSentence: '이 국물은 깊고 진한 맛이 나요.',
      exampleTranslation: 'This broth has a deep, rich flavor.',
    },
    '순대': {
      meaning: 'Sundae (Korean blood sausage)',
      cardId: 'fc-3-24', lessonId: '3', expression: '순대',
      exampleSentence: '순대는 찹쌀과 당면으로 만들어요.',
      exampleTranslation: 'Sundae is made with glutinous rice and glass noodles.',
    },
    '쫄깃하고': {
      meaning: 'Chewy / Springy in texture',
      cardId: 'fc-3-25', lessonId: '3', expression: '쫄깃하다',
      exampleSentence: '이 떡은 정말 쫄깃하고 맛있어요.',
      exampleTranslation: 'This rice cake is really chewy and delicious.',
    },
    '담백해서': {
      meaning: 'Mild / Light in flavor (not greasy)',
      cardId: 'fc-3-26', lessonId: '3', expression: '담백하다',
      exampleSentence: '이 음식은 담백해서 자꾸 먹게 돼요.',
      exampleTranslation: "This food is so mild in flavor that you can't stop eating it.",
    },
    '정말': {
      meaning: 'Really / Truly / Genuinely',
      cardId: 'fc-3-27', lessonId: '3', expression: '정말',
      exampleSentence: '이거 정말 맛있어요!',
      exampleTranslation: 'This is really delicious!',
    },
    '맛있어요': {
      meaning: 'Is delicious / Tastes good',
      cardId: 'fc-3-28', lessonId: '3', expression: '맛있다',
      exampleSentence: '순대가 정말 맛있어요.',
      exampleTranslation: 'The sundae is really delicious.',
    },
    '광장시장': {
      meaning: 'Gwangjang Market (famous Seoul market)',
      cardId: 'fc-3-29', lessonId: '3', expression: '광장시장',
      exampleSentence: '광장시장은 먹을거리로 유명해요.',
      exampleTranslation: 'Gwangjang Market is famous for its food.',
    },
    '먹을거리': {
      meaning: 'Food / Things to eat',
      cardId: 'fc-3-30', lessonId: '3', expression: '먹을거리',
      exampleSentence: '이 시장에는 먹을거리가 정말 많아요.',
      exampleTranslation: 'There is so much food in this market.',
    },
    '접시': {
      meaning: 'Plate / Dish',
      cardId: 'fc-3-31', lessonId: '3', expression: '접시',
      exampleSentence: '접시에 가득 담긴 음식이 정말 맛있어 보여요.',
      exampleTranslation: 'The food piled high on the plate looks really delicious.',
    },
    '싸죠': {
      meaning: "Cheap, right? / It's inexpensive, isn't it?",
      cardId: 'fc-3-32', lessonId: '3', expression: '싸다',
      exampleSentence: '이 가격이 정말 싸죠?',
      exampleTranslation: "This price is really cheap, right?",
    },
    '좋아하는': {
      meaning: 'Favorite / That one likes',
      cardId: 'fc-3-33', lessonId: '3', expression: '좋아하다',
      exampleSentence: '제가 제일 좋아하는 음식은 떡볶이예요.',
      exampleTranslation: 'My favorite food is tteokbokki.',
    },
    '호떡': {
      meaning: 'Hotteok (sweet filled Korean pancake)',
      cardId: 'fc-3-34', lessonId: '3', expression: '호떡',
      exampleSentence: '호떡 안에는 달콤한 흑설탕이 들어있어요.',
      exampleTranslation: 'Hotteok is filled with sweet brown sugar inside.',
    },
    '맛집': {
      meaning: 'Famous restaurant / Best food spot',
      cardId: 'fc-3-35', lessonId: '3', expression: '맛집',
      exampleSentence: '이 골목에는 유명한 맛집이 많아요.',
      exampleTranslation: 'There are many famous restaurants in this alley.',
    },
    '고마워요': {
      meaning: 'Thank you (informal-polite)',
      cardId: 'fc-3-36', lessonId: '3', expression: '고맙다',
      exampleSentence: '함께해줘서 정말 고마워요.',
      exampleTranslation: 'Thank you so much for being here with me.',
    },
    '영상': {
      meaning: 'Video / Footage',
      cardId: 'fc-3-37', lessonId: '3', expression: '영상',
      exampleSentence: '다음 영상에서 더 많은 맛집을 소개할게요.',
      exampleTranslation: "I'll introduce more great restaurants in the next video.",
    },
  },
}

// ─── 자막 데이터 ───────────────────────────────────────────────────────────────

export const MOCK_SUBTITLES: SubtitleLine[] = [
  {
    id: 's1', startSec: 0, endSec: 5,
    korean: '안녕하세요! 오늘은 서울의 길거리 음식을 함께 즐겨볼게요.',
    english: "Hello! Today let's enjoy Seoul's street food together.",
  },
  {
    id: 's2', startSec: 5, endSec: 10,
    korean: '이 시장은 현지인도 자주 와서 다양하고 맛있는 음식 가게로 가득해요.',
    english: 'Locals come here often, so this market is packed with diverse and delicious food stalls.',
  },
  {
    id: 's3', startSec: 10, endSec: 16,
    korean: '한국에 오면 떡볶이는 꼭 먹어봐야 해요.',
    english: 'If you come to Korea, you absolutely must try tteokbokki.',
  },
  {
    id: 's4', startSec: 16, endSec: 22,
    korean: '사람들이 이 꼬치를 사려고 몇 시간씩 줄을 서요.',
    english: 'People stand in line for hours to buy these skewers.',
  },
  {
    id: 's5', startSec: 22, endSec: 27,
    korean: '여기 길거리 음식은 놀랍도록 저렴해요.',
    english: 'Street food here is surprisingly affordable.',
  },
  {
    id: 's6', startSec: 27, endSec: 32,
    korean: '포장마차 노점상 아저씨가 따뜻한 어묵 국물을 건네주셨어요.',
    english: 'The street stall vendor handed me a warm cup of fish cake broth.',
  },
  {
    id: 's7', startSec: 32, endSec: 37,
    korean: '이 순대는 쫄깃하고 담백해서 정말 맛있어요.',
    english: "This sundae is chewy and light — it's really delicious.",
  },
  {
    id: 's8', startSec: 37, endSec: 43,
    korean: '광장시장에는 먹을거리가 너무 많아서 어디서부터 시작해야 할지 모르겠어요.',
    english: "Gwangjang Market has so much food that I don't know where to start.",
  },
  {
    id: 's9', startSec: 43, endSec: 49,
    korean: '떡볶이 한 접시에 3천 원밖에 안 해요. 정말 싸죠?',
    english: "A plate of tteokbokki is only 3,000 won. Pretty cheap, right?",
  },
  {
    id: 's10', startSec: 49, endSec: 54,
    korean: '다음에는 현지인이 추천한 제가 제일 좋아하는 호떡 맛집을 소개할게요.',
    english: "Next time, I'll introduce my favorite hotteok spot recommended by a local.",
  },
  {
    id: 's11', startSec: 54, endSec: 60,
    korean: '오늘도 함께해줘서 고마워요. 다음 영상에서 또 봐요!',
    english: "Thanks for watching today. See you in the next video!",
  },
]

const MOCK_BOOKMARKS_BY_LESSON: Record<string, BookmarkedCard[]> = {
  '3': [
    {
      cardId: 'fc-3-1',
      lessonId: '3',
      lessonTitle: 'Korean Street Food Tour Seoul',
      expression: '길거리 음식',
      meaning: 'Street food',
      exampleSentence: '서울의 길거리 음식은 정말 다양하고 맛있어요.',
      exampleTranslation: 'Street food in Seoul is incredibly diverse and delicious.',
      savedAt: '2026-05-08T09:00:00.000Z',
    },
    {
      cardId: 'fc-3-5',
      lessonId: '3',
      lessonTitle: 'Korean Street Food Tour Seoul',
      expression: '저렴하다',
      meaning: 'Affordable / inexpensive',
      exampleSentence: '여기 길거리 음식은 놀랍도록 저렴해요.',
      exampleTranslation: 'Street food here is surprisingly affordable.',
      savedAt: '2026-05-08T09:05:00.000Z',
    },
    {
      cardId: 'fc-mock-1',
      lessonId: '9',
      lessonTitle: 'K-pop Lyrics Korean Lesson',
      expression: '현지인',
      meaning: 'Local person',
      exampleSentence: '현지인이 추천한 가게는 실패가 적어요.',
      exampleTranslation: 'Places recommended by locals rarely disappoint.',
      savedAt: '2026-05-07T14:00:00.000Z',
    },
    {
      cardId: 'fc-mock-2',
      lessonId: '10',
      lessonTitle: 'Essential Korean Phrases for Travel',
      expression: '포장마차',
      meaning: 'Street stall / pojangmacha',
      exampleSentence: '밤에는 포장마차에서 간단히 먹는 사람이 많아요.',
      exampleTranslation: 'At night, many people grab a quick bite at street stalls.',
      savedAt: '2026-05-07T14:10:00.000Z',
    },
  ],
}

const MOCK_CULTURAL_NOTES_BY_LESSON: Record<string, CulturalNote[]> = {
  '3': [
    {
      id: 'culture-3-1',
      subtitleId: 's2',
      title: '현지인',
      keyword: 'Local perspective',
      explanation: 'In Korean content, 현지인 usually implies more than just someone who lives there. It suggests a person whose recommendation feels more trustworthy and less touristy, especially when people talk about restaurants, markets, or neighborhoods.',
    },
    {
      id: 'culture-3-2',
      subtitleId: 's3',
      title: '꼭 먹어봐야 해요',
      keyword: 'Strong recommendation',
      explanation: 'This phrase means more than a literal “you should try it.” In travel and food videos, it carries the tone of a strong personal recommendation, as if the speaker is saying this is part of the essential Korean experience.',
    },
    {
      id: 'culture-3-3',
      subtitleId: 's6',
      title: '포장마차',
      keyword: 'Late-night street culture',
      explanation: '포장마차 refers to a tented street stall, but culturally it also evokes a familiar late-night atmosphere. It often brings up ideas like casual drinking, quick food after work, and a very everyday, unpolished side of city life.',
    },
    {
      id: 'culture-3-4',
      subtitleId: 's9',
      title: '3천 원밖에 안 해요',
      keyword: '밖에 안 pattern',
      explanation: '밖에 안 is a Korean pattern used to stress that something is less than expected. When used with price, it does not just mean “it costs only this much.” It also carries the speaker’s feeling that the price is surprisingly cheap.',
    },
  ],
}

const YOUTUBE_ID = 'dQw4w9WgXcQ'
const TOTAL_DURATION = MOCK_SUBTITLES[MOCK_SUBTITLES.length - 1].endSec
const SIDE_PANEL_MIN_WIDTH = 280
const SIDE_PANEL_DEFAULT_WIDTH = 336

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── 자막 텍스트 토크나이저 ───────────────────────────────────────────────────────

type TextToken =
  | { type: 'plain'; text: string }
  | { type: 'word'; word: string; entry?: VocabEntry }

function splitPlainTextToTokens(text: string): TextToken[] {
  return text
    .split(/(\s+)/)
    .filter((part) => part.length > 0)
    .map((part) => {
      if (/^\s+$/.test(part)) return { type: 'plain', text: part }
      return { type: 'word', word: part }
    })
}

/**
 * 자막 텍스트를 일반 토큰 + vocab 토큰으로 분리
 * - 현재 레슨 vocab: WATCH_VOCAB 기준
 * - 이전 레슨 북마크: bookmarks 배열에서 다른 레슨 expression을 텍스트에서 탐색
 */
function tokenizeSubtitle(
  text: string,
  vocabMap: Record<string, VocabEntry>,
  bookmarks: BookmarkedCard[],
  currentLessonId: string,
): TextToken[] {
  const candidates: Array<{ word: string; entry: VocabEntry }> = [
    ...Object.entries(vocabMap).map(([word, entry]) => ({ word, entry })),
    // 북마크된 단어 (현재 vocab에 없는 것만)
    ...bookmarks
      .filter((bm) => !bm.cardId.startsWith('sentence-') && !(bm.expression in vocabMap))
      .map((bm) => ({
        word: bm.expression,
        entry: {
          meaning: bm.meaning,
          cardId: bm.cardId,
          lessonId: bm.lessonId,
          expression: bm.expression,
          exampleSentence: bm.exampleSentence,
          exampleTranslation: bm.exampleTranslation,
        },
      })),
  ]

  // 텍스트 내 각 단어 위치 탐색 (긴 단어 우선으로 오버랩 방지)
  const matches: Array<{ start: number; end: number; word: string; entry: VocabEntry }> = []
  for (const { word, entry } of candidates.sort((a, b) => b.word.length - a.word.length)) {
    let idx = text.indexOf(word)
    while (idx !== -1) {
      const hasOverlap = matches.some((m) => idx < m.end && idx + word.length > m.start)
      if (!hasOverlap) matches.push({ start: idx, end: idx + word.length, word, entry })
      idx = text.indexOf(word, idx + 1)
    }
  }
  matches.sort((a, b) => a.start - b.start)

  // 토큰 리스트 생성
  const tokens: TextToken[] = []
  let pos = 0
  for (const m of matches) {
    if (pos < m.start) tokens.push(...splitPlainTextToTokens(text.slice(pos, m.start)))
    tokens.push({ type: 'word', word: m.word, entry: m.entry })
    pos = m.end
  }
  if (pos < text.length) tokens.push(...splitPlainTextToTokens(text.slice(pos)))
  return tokens
}

// ─── VocabToken: 단어 하이라이트 + 툴팁 ─────────────────────────────────────────
/**
 * CSS group-hover 대신 React state 사용
 * - 즉시 열기 (onMouseEnter → setOpen(true))
 * - 150ms 지연 닫기 → 단어→버튼 이동 중 사라지지 않음
 * - 툴팁에도 onMouseEnter/Leave 등록해 머무는 동안 유지
 */
function VocabToken({
  word, entry, isCurrentLesson, bookmarked, onAdd, isBlind, revealed, onRevealToggle, forceTooltipBelow,
}: {
  word: string
  entry?: VocabEntry
  isCurrentLesson: boolean
  bookmarked: boolean
  onAdd: (e: React.MouseEvent) => void
  isBlind: boolean
  revealed: boolean
  onRevealToggle: () => void
  forceTooltipBelow?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>('above')
  const hasEntry = Boolean(entry)
  const hasHighlight = hasEntry || bookmarked
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLSpanElement | null>(null)
  const tooltipRef = useRef<HTMLSpanElement | null>(null)

  const show = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    setOpen(true)
  }
  const hide = () => {
    hideTimer.current = setTimeout(() => {
      setOpen(false)
      hideTimer.current = null
    }, 80)
  }

  useEffect(() => {
    if (!open || isBlind) return

    const updateTooltipPosition = () => {
      if (forceTooltipBelow) {
        setTooltipPosition('below')
        return
      }

      const wrapperEl = wrapperRef.current
      const tooltipEl = tooltipRef.current
      if (!wrapperEl || !tooltipEl) return

      const wrapperRect = wrapperEl.getBoundingClientRect()
      const tooltipRect = tooltipEl.getBoundingClientRect()
      const gap = 4
      const aboveSpace = wrapperRect.top
      const belowSpace = window.innerHeight - wrapperRect.bottom
      const needsBelow = aboveSpace < tooltipRect.height + gap && belowSpace > aboveSpace

      setTooltipPosition(needsBelow ? 'below' : 'above')
    }

    updateTooltipPosition()
    window.addEventListener('resize', updateTooltipPosition)

    return () => {
      window.removeEventListener('resize', updateTooltipPosition)
    }
  }, [forceTooltipBelow, open, isBlind, word])

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  const hasBookmarkBadge = isCurrentLesson && bookmarked
  const tokenClass = !hasHighlight
    ? 'text-inherit'
    : isCurrentLesson && bookmarked
    ? 'rounded-[0.32em] bg-violet-600 px-[0.26em] py-[0.08em] text-white font-semibold shadow-[0_8px_20px_rgba(124,58,237,0.2)]'
    : isCurrentLesson
    ? 'rounded-[0.28em] px-[0.22em] py-[0.05em] text-violet-300 font-medium'
    : 'rounded-[0.28em] px-[0.22em] py-[0.05em] bg-neutral-600/80 text-neutral-100 font-medium'

  const isHidden = isBlind && !revealed
  const hiddenTokenClass = hasBookmarkBadge
    ? 'rounded-[0.32em] bg-violet-500/25 px-[0.26em] py-[0.08em] text-transparent'
    : isCurrentLesson
    ? 'rounded-[0.28em] px-[0.22em] py-[0.05em] bg-violet-500/25 text-transparent'
    : 'rounded-[0.28em] px-[0.22em] py-[0.05em] bg-white/20 text-transparent ring-1 ring-white/10'
  const wrapperClass = hasBookmarkBadge ? 'mr-[0.18em]' : ''

  const handleClick = (e: React.MouseEvent) => {
    if (isBlind) {
      e.stopPropagation()
      onRevealToggle()
    }
  }

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-block cursor-pointer ${wrapperClass}`}
      onMouseEnter={isBlind && hasEntry ? undefined : show}
      onMouseLeave={isBlind && hasEntry ? undefined : hide}
      onClick={handleClick}
    >
      <span
        className={`inline-flex items-center gap-1 align-baseline leading-tight transition-colors ${
          isHidden ? hiddenTokenClass : tokenClass
        } ${isHidden ? 'select-none' : ''} ${hasHighlight ? '' : 'font-inherit'}`}
      >
        {word}
        {hasBookmarkBadge && (
          <span
            className={`ml-[0.02em] flex h-[0.94em] w-[0.94em] shrink-0 items-center justify-center rounded-full ${
              isHidden
                ? 'bg-white/14 ring-1 ring-white/10'
                : 'bg-white/14 ring-1 ring-white/10'
            }`}
          >
            <Check className={`h-[0.52em] w-[0.52em] ${isHidden ? 'text-white/75' : 'text-white'}`} />
          </span>
        )}
      </span>

      {!isBlind && open && (
        <span
          ref={tooltipRef}
          className={`absolute left-0 z-50 flex items-center gap-1.5 rounded-lg border border-neutral-600 bg-neutral-900 px-2.5 py-1.5 text-xs whitespace-nowrap shadow-2xl ${
            tooltipPosition === 'below' ? 'top-full' : 'bottom-full'
          }`}
          style={{ transform: tooltipPosition === 'below' ? 'translateY(4px)' : 'translateY(-4px)' }}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <button
              onClick={onAdd}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/18 text-violet-100 hover:bg-white/26 transition-colors"
            >
              <Bookmark className="h-3 w-3" />
            </button>
          )}
          <span className="text-neutral-200 font-medium">{entry?.meaning || word}</span>
        </span>
      )}
    </span>
  )
}

// ─── 자막 텍스트 렌더러 ───────────────────────────────────────────────────────

function SubtitleText({
  text,
  vocabMap,
  bookmarks,
  currentLessonId,
  lessonTitle,
  addBookmark,
  isBlind,
  revealedCards,
  onRevealToggle,
  forceTooltipBelow,
}: {
  text: string
  vocabMap: Record<string, VocabEntry>
  bookmarks: BookmarkedCard[]
  currentLessonId: string
  lessonTitle: string
  addBookmark: (card: Omit<BookmarkedCard, 'savedAt'>) => void
  isBlind: boolean
  revealedCards: Set<string>
  onRevealToggle: (cardId: string) => void
  forceTooltipBelow?: boolean
}) {
  const tokens = useMemo(
    () => tokenizeSubtitle(text, vocabMap, bookmarks, currentLessonId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, vocabMap, bookmarks.length, currentLessonId],
  )

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === 'plain') return <span key={i}>{token.text}</span>

        const { word, entry } = token
        const bookmark = bookmarks.find((b) => b.expression === word)
        const fallbackCardId = `custom-${currentLessonId}-${word}`
        const resolvedEntry = entry ?? (bookmark
          ? {
              meaning: bookmark.meaning,
              cardId: bookmark.cardId,
              lessonId: bookmark.lessonId,
              expression: bookmark.expression,
              exampleSentence: bookmark.exampleSentence,
              exampleTranslation: bookmark.exampleTranslation,
            }
          : undefined)
        const resolvedCardId = resolvedEntry?.cardId ?? fallbackCardId
        const isCurrentLesson = resolvedEntry?.lessonId === currentLessonId
        const bookmarked = Boolean(bookmark || resolvedEntry && bookmarks.some((b) => b.cardId === resolvedEntry.cardId))

        const handleAdd = (e: React.MouseEvent) => {
          e.stopPropagation()
          const expression = resolvedEntry?.expression ?? word
          addBookmark({
            cardId: resolvedCardId,
            lessonId: currentLessonId,
            lessonTitle,
            expression,
            meaning: resolvedEntry?.meaning ?? expression,
            exampleSentence: resolvedEntry?.exampleSentence ?? text,
            exampleTranslation: resolvedEntry?.exampleTranslation ?? '',
            type: 'expression',
            subType: resolvedEntry && 'type' in resolvedEntry && resolvedEntry.type === 'ending' ? 'ending' : 'word',
          })
        }

        return (
          <VocabToken
            key={i}
            word={word}
            entry={resolvedEntry}
            isCurrentLesson={Boolean(isCurrentLesson)}
            bookmarked={bookmarked}
            onAdd={handleAdd}
            isBlind={Boolean(resolvedEntry) && isBlind}
            revealed={resolvedEntry ? revealedCards.has(resolvedCardId) : false}
            onRevealToggle={() => {
              if (resolvedEntry) onRevealToggle(resolvedCardId)
            }}
            forceTooltipBelow={forceTooltipBelow}
          />
        )
      })}
    </>
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function WatchTab({ 
  lessonId, 
  isPublic = false,
  onComplete,
  mobileStacked = false,
}: { 
  lessonId: string; 
  isPublic?: boolean;
  onComplete?: () => void;
  mobileStacked?: boolean;
}) {
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const [currentSec, setCurrentSec]     = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [speed, setSpeed]               = useState(1)
  const [isBlind, setIsBlind]           = useState(false)
  const [subtitleMode, setSubtitleMode] = useState<SubtitleDisplayMode>('bilingual')
  const [sidePanelTab, setSidePanelTab] = useState<SidePanelTab>('transcript')
  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true)
  const [sidePanelWidth, setSidePanelWidth] = useState(SIDE_PANEL_DEFAULT_WIDTH)
  const [isResizingSidePanel, setIsResizingSidePanel] = useState(false)
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set())
  const [apiData, setApiData] = useState<{
    youtubeId: string
    durationSec: number
    lines: SubtitleLine[]
    vocabMap: Record<string, VocabEntry>
    culturalNotes: CulturalNote[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const controlMenuRef = useRef<HTMLDivElement | null>(null)
  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const completionFired = useRef(false)

  const hasMockLesson = Boolean(MOCK_FLASHCARDS[lessonId])
  const subtitles = apiData?.lines ?? (hasMockLesson ? MOCK_SUBTITLES : [])
  const vocabMap    = apiData?.vocabMap ?? WATCH_VOCAB[lessonId] ?? {}
  const lessonTitle = MOCK_FLASHCARDS[lessonId]?.lessonTitle ?? 'Generated lesson'
  const youtubeId = apiData?.youtubeId ?? (hasMockLesson ? YOUTUBE_ID : '')
  const youtubeOrigin = typeof window === 'undefined' ? '' : window.location.origin
  const totalDuration = apiData?.durationSec ?? subtitles[subtitles.length - 1]?.endSec ?? 0
  const culturalNotes = useMemo(
    () => apiData?.culturalNotes ?? MOCK_CULTURAL_NOTES_BY_LESSON[lessonId] ?? [],
    [apiData?.culturalNotes, lessonId],
  )
  const mergedBookmarks = useMemo(() => {
    const mockBookmarks = MOCK_BOOKMARKS_BY_LESSON[lessonId] ?? []
    const bookmarkMap = new Map<string, BookmarkedCard>()

    mockBookmarks.forEach((bookmark) => {
      bookmarkMap.set(bookmark.cardId, bookmark)
    })
    bookmarks.forEach((bookmark) => {
      bookmarkMap.set(bookmark.cardId, bookmark)
    })

    return Array.from(bookmarkMap.values())
  }, [bookmarks, lessonId])

  // 현재 자막 (currentSec 기준 마지막으로 시작된 라인)
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const fetchFn = isPublic ? getPublicLessonSubtitles : getLessonSubtitles
    fetchFn(lessonId)
      .then((subtitlesResponse) => {
        if (!cancelled) setApiData(subtitlesResponse)
      })
      .catch((err) => {
        if (!cancelled) {
          setApiData(null)
          setError(MOCK_FLASHCARDS[lessonId] ? null : err instanceof Error ? err.message : 'Could not load subtitles.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lessonId, isPublic])

  const activeLine = subtitles.slice().reverse().find((s) => currentSec >= s.startSec) ?? subtitles[0]

  const sendYouTubeCommand = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*',
    )
  }, [])

  // YouTube IFrame과 상태 동기화
  const reachedEnd = useRef(false)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime !== undefined) {
            setCurrentSec(data.info.currentTime)
          }
          if (data.info.playerState !== undefined) {
            const state = data.info.playerState
            // 1: playing, 2: paused, 3: buffering, 0: ended
            if (state === 1) setIsPlaying(true)
            else if (state === 2 || state === 0) setIsPlaying(false)
            
            if (state === 0) reachedEnd.current = true
          }
        }
      } catch (e) {}
    }

    window.addEventListener('message', handleMessage)
    const interval = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening' }),
        '*'
      )
    }, 1000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(interval)
    }
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev
      sendYouTubeCommand(next ? 'playVideo' : 'pauseVideo')
      return next
    })
  }, [sendYouTubeCommand])

  useEffect(() => {
    sendYouTubeCommand('setPlaybackRate', [speed])
  }, [sendYouTubeCommand, speed])

  // 자연 재생 종료 감지 → onComplete 호출 (1회만)
  useEffect(() => {
    if (reachedEnd.current && !isPlaying && !completionFired.current) {
      completionFired.current = true
      reachedEnd.current = false
      onComplete?.()
    }
  }, [isPlaying, onComplete])

  const toggleBlind = () => {
    setIsBlind((v) => {
      if (!v) setRevealedCards(new Set())
      return !v
    })
  }

  const toggleReveal = (cardId: string) => {
    setRevealedCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  const seekTo = (seconds: number) => {
    setCurrentSec(seconds)
    sendYouTubeCommand('seekTo', [seconds, true])
    sendYouTubeCommand('playVideo')
    setIsPlaying(true)
  }

  const subtitleProps = {
    vocabMap, bookmarks: mergedBookmarks, currentLessonId: lessonId, lessonTitle, addBookmark,
    isBlind, revealedCards, onRevealToggle: toggleReveal,
  }
  const firstSubtitleId = subtitles[0]?.id
  const activeLineIndex = Math.max(0, subtitles.findIndex((line) => line.id === activeLine.id))
  const upcomingTranscriptLines = subtitles.length > 1
    ? [...subtitles.slice(activeLineIndex + 1), ...subtitles.slice(0, activeLineIndex)]
    : []

  const subtitleModeOptions: Array<{ value: SubtitleDisplayMode; label: string }> = [
    { value: 'bilingual', label: 'Dual' },
    { value: 'korean', label: 'Korean' },
    { value: 'english', label: 'English' },
  ]
  const playbackSpeedOptions = [0.5, 0.75, 1, 1.5]
  const shouldStackMobile = mobileStacked

  useEffect(() => {
    if (!isControlMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!controlMenuRef.current?.contains(event.target as Node)) {
        setIsControlMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isControlMenuOpen])

  useEffect(() => {
    if (!activeLine) return
    lineRefs.current[activeLine.id]?.scrollIntoView({
      behavior: 'smooth',
      block: shouldStackMobile ? 'start' : 'nearest',
    })
  }, [activeLine, shouldStackMobile])

  useEffect(() => {
    if (shouldStackMobile || !isResizingSidePanel) return

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = window.innerWidth - event.clientX
      const maxWidth = Math.floor(window.innerWidth / 2)
      setSidePanelWidth(Math.min(maxWidth, Math.max(SIDE_PANEL_MIN_WIDTH, nextWidth)))
    }

    const handleMouseUp = () => {
      setIsResizingSidePanel(false)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingSidePanel, shouldStackMobile])

  if (isLoading && !apiData && !hasMockLesson) {
    return (
      <div className="flex flex-1 items-center justify-center bg-neutral-950 text-sm font-medium text-neutral-400">
        Loading subtitles...
      </div>
    )
  }

  if (!activeLine) {
    return (
      <div className="flex flex-1 items-center justify-center bg-neutral-950 text-sm font-medium text-neutral-400">
        {error ?? 'No subtitles available for this lesson yet.'}
      </div>
    )
  }

  const toggleSentenceBookmark = (line: SubtitleLine) => {
    const sentenceBookmarkId = `sentence-${lessonId}-${line.id}`

    if (isBookmarked(sentenceBookmarkId)) {
      removeBookmark(sentenceBookmarkId)
      return
    }

    addBookmark({
      cardId: sentenceBookmarkId,
      lessonId,
      lessonTitle,
      expression: line.korean,
      meaning: line.english,
      exampleSentence: line.korean,
      exampleTranslation: line.english,
      type: 'sentence',
    })
  }

  if (!shouldStackMobile) {
    const panelWidth = isSidePanelOpen ? sidePanelWidth : 48
    const sidePanelStyle = { '--side-panel-width': `${panelWidth}px` } as CSSProperties

    return (
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-neutral-950">
          <div className="relative w-full aspect-video shrink-0 bg-black">
            {youtubeId ? (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&controls=0&disablekb=1&playsinline=1&enablejsapi=1${youtubeOrigin ? `&origin=${encodeURIComponent(youtubeOrigin)}` : ''}`}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Lesson video"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-neutral-500">
                Video is not available.
              </div>
            )}
          </div>

          <div className="shrink-0 flex h-[220px] flex-col justify-start border-b border-neutral-800 px-8 py-6">
            {subtitleMode !== 'english' && (
              <p className="text-2xl font-semibold leading-[1.7] text-white">
                <SubtitleText
                  text={activeLine.korean}
                  forceTooltipBelow={activeLine.id === firstSubtitleId}
                  {...subtitleProps}
                />
              </p>
            )}
            {subtitleMode !== 'korean' && (
              <p className={`text-2xl leading-relaxed ${subtitleMode === 'english' ? 'font-semibold text-white' : 'mt-2 text-neutral-400'}`}>
                {activeLine.english}
              </p>
            )}
          </div>

          <div className="shrink-0 px-8 py-5">
            <input
              type="range"
              min={0}
              max={totalDuration}
              value={currentSec}
              step={0.5}
              onChange={(e) => {
                const nextSec = Number(e.target.value)
                setCurrentSec(nextSec)
                sendYouTubeCommand('seekTo', [nextSec, true])
              }}
              className="mb-1 h-1 w-full cursor-pointer accent-violet-500"
            />
            <div className="mb-5 flex justify-between text-[10px] text-neutral-600">
              <span>{formatTime(currentSec)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                {isPlaying
                  ? <Pause className="h-4 w-4" fill="white" />
                  : <Play className="h-4 w-4 translate-x-px" fill="white" />
                }
              </button>

              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white outline-none"
              >
                <option value={0.5}>×0.5</option>
                <option value={0.75}>×0.75</option>
                <option value={1}>×1.0</option>
                <option value={1.5}>×1.5</option>
              </select>

              <button
                onClick={toggleBlind}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isBlind
                    ? 'border-primary bg-primary text-white'
                    : 'border-white/20 bg-white/10 text-neutral-400 hover:border-white/40 hover:text-white'
                }`}
              >
                {isBlind ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                Blind
              </button>

              <div className="inline-flex items-center rounded-pill border border-white/15 bg-white/5 p-1">
                {subtitleModeOptions.map((option) => {
                  const isSelected = subtitleMode === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSubtitleMode(option.value)}
                      className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-[0_6px_18px_rgba(139,92,246,0.28)]'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`relative shrink-0 border-l border-neutral-800 flex flex-col min-h-0 bg-neutral-900 overflow-hidden transition-[width] duration-300 ease-in-out ${
            isSidePanelOpen ? '' : 'w-12'
          }`}
          style={isSidePanelOpen ? sidePanelStyle : { width: 48 }}
        >
          <button
            type="button"
            onMouseDown={() => setIsResizingSidePanel(true)}
            className={`absolute -left-1.5 top-0 z-20 flex h-full w-3 cursor-col-resize items-center justify-center text-neutral-600 transition-opacity duration-300 ${
              isSidePanelOpen ? 'opacity-100 hover:text-neutral-300' : 'pointer-events-none opacity-0'
            }`}
            aria-label="자막 패널 너비 조정"
          >
            <span className="flex h-12 w-3 items-center justify-center rounded-full bg-neutral-800/80 opacity-0 transition-opacity hover:opacity-100">
              <GripVertical className="h-3.5 w-3.5" />
            </span>
          </button>

          <div className={`shrink-0 border-b border-neutral-800 transition-opacity duration-300 ${isSidePanelOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
            <div className="flex items-start justify-between gap-3 px-5 pt-4">
              <div className="flex min-w-0 items-center gap-5">
                <button
                  onClick={() => setSidePanelTab('transcript')}
                  className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                    sidePanelTab === 'transcript'
                      ? 'border-primary text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setSidePanelTab('culture')}
                  className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                    sidePanelTab === 'culture'
                      ? 'border-primary text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Cultural Notes
                </button>
              </div>
              <button
                onClick={() => setIsSidePanelOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="자막 패널 접기"
                title="자막 패널 접기"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            {sidePanelTab === 'transcript' ? (
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-sm font-semibold text-white">Transcript</p>
                <div className="flex items-center gap-2">
                  <div className="group relative">
                    <button className="p-0.5 text-neutral-500 transition-colors hover:text-neutral-300">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                    <div className="invisible absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 shadow-xl group-hover:visible">
                      <p className="mb-2 text-[10px] font-medium text-neutral-400">Word labels</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 rounded bg-neutral-600/80 px-1 py-px text-[10px] font-medium text-neutral-100">단어</span>
                          <span className="text-[10px] text-neutral-400">Previously bookmarked</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-violet-600 px-1 py-px text-[10px] font-semibold text-white">
                            단어
                            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-violet-400/60">
                              <Check className="h-2 w-2 text-white" />
                            </span>
                          </span>
                          <span className="text-[10px] text-neutral-400">Bookmarked in this flashcard lesson</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 text-[10px] font-medium text-violet-300">단어</span>
                          <span className="text-[10px] text-neutral-400">Appeared in this flashcard lesson</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500">{subtitles.length} lines</span>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4">
                <p className="text-sm font-semibold text-white">Cultural Notes</p>
              </div>
            )}
          </div>

          {isSidePanelOpen && sidePanelTab === 'transcript' ? (
            <div className="flex-1 overflow-y-auto">
              {subtitles.map((line) => {
                const isActive = line.id === activeLine.id
                const isSentenceBookmarked = isBookmarked(`sentence-${lessonId}-${line.id}`)
                return (
                  <div
                    key={line.id}
                    ref={(el) => { lineRefs.current[line.id] = el }}
                    onClick={() => seekTo(line.startSec)}
                    className={`cursor-pointer border-b border-neutral-800/60 px-5 py-3.5 transition-all ${
                      isActive ? 'border-l-2 border-l-primary bg-neutral-800' : 'hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 shrink-0 font-mono text-[10px] ${
                        isActive ? 'font-bold text-primary' : 'text-neutral-500'
                      }`}>
                        {formatTime(line.startSec)}
                      </span>
                      <div className="min-w-0 flex-1">
                        {subtitleMode !== 'english' && (
                          <p className={`text-sm leading-[1.9] ${
                            isActive ? 'font-medium text-white' : 'text-neutral-300'
                          }`}>
                            <SubtitleText
                              text={line.korean}
                              forceTooltipBelow={line.id === firstSubtitleId}
                              {...subtitleProps}
                            />
                          </p>
                        )}
                        {subtitleMode !== 'korean' && (
                          <p className={`mt-0.5 text-sm leading-relaxed ${subtitleMode === 'english' ? 'text-neutral-200' : 'text-neutral-500'}`}>
                            {line.english}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSentenceBookmark(line)
                        }}
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSentenceBookmarked
                            ? 'border-primary/30 bg-primary/15 text-primary'
                            : 'border-white/10 bg-white/5 text-neutral-500 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                        title={isSentenceBookmarked ? 'Remove sentence bookmark' : 'Save sentence bookmark'}
                        aria-label={isSentenceBookmarked ? 'Remove sentence bookmark' : 'Save sentence bookmark'}
                      >
                        {isSentenceBookmarked ? (
                          <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : isSidePanelOpen ? (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {culturalNotes.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5">
                  <p className="text-sm font-medium text-white">No cultural notes yet</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                    Add notes for slang, idioms, and local context when this lesson needs them.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {culturalNotes.map((note) => {
                    const isFocused = note.subtitleId === activeLine.id
                    const linkedSubtitle = subtitles.find((line) => line.id === note.subtitleId)
                    return (
                      <div
                        key={note.id}
                        onClick={() => {
                          if (linkedSubtitle) seekTo(linkedSubtitle.startSec)
                        }}
                        className={`cursor-pointer rounded-2xl border px-4 py-4 transition-all ${
                          isFocused
                            ? 'border-primary/30 bg-primary/[0.1] ring-1 ring-primary/20 shadow-[0_12px_28px_rgba(139,92,246,0.14)]'
                            : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 h-12 w-1 shrink-0 rounded-full transition-colors ${
                            isFocused ? 'bg-primary' : 'bg-transparent'
                          }`} />
                          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                            <div>
                              <h3 className={`text-base font-semibold ${isFocused ? 'text-white' : 'text-neutral-100'}`}>{note.title}</h3>
                              <p className={`mt-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
                                isFocused ? 'text-primary-300' : 'text-primary-300/70'
                              }`}>
                                {note.keyword}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                              isFocused
                                ? 'bg-primary/18 text-primary'
                                : 'bg-white/6 text-neutral-500'
                            }`}>
                              {formatTime(linkedSubtitle?.startSec ?? 0)}
                            </span>
                          </div>
                        </div>

                        <div className="pl-4">
                          <p className={`mt-3 text-xs leading-6 ${isFocused ? 'text-white' : 'text-neutral-200'}`}>
                            {note.explanation}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-start justify-center pt-4">
              <button
                onClick={() => setIsSidePanelOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="자막 패널 펼치기"
                title="자막 패널 펼치기"
              >
                <PanelRightOpen className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={shouldStackMobile ? 'flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row' : 'flex flex-1 min-h-0 overflow-hidden'}>
      <div className={shouldStackMobile ? 'order-1 flex min-w-0 flex-col bg-neutral-950 lg:flex-1' : 'flex min-w-0 flex-1 flex-col bg-neutral-950'}>
        <div className={shouldStackMobile ? 'relative w-full aspect-video shrink-0 bg-black' : 'relative w-full aspect-video shrink-0 bg-black'}>
          {youtubeId ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&controls=0&disablekb=1&playsinline=1&enablejsapi=1${youtubeOrigin ? `&origin=${encodeURIComponent(youtubeOrigin)}` : ''}`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Lesson video"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-neutral-500">
              Video is not available.
            </div>
          )}
        </div>

        <div className={shouldStackMobile ? 'shrink-0 border-b border-neutral-800 px-4 py-4 sm:px-6 lg:px-8 lg:py-5' : 'shrink-0 border-b border-neutral-800 px-8 py-5'}>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-70"
            >
              {isPlaying
                ? <Pause className="h-4 w-4" fill="white" />
                : <Play className="h-4 w-4 translate-x-px" fill="white" />
              }
            </button>
            <div className="min-w-0 flex-1">
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={currentSec}
                step={0.5}
                onChange={(e) => {
                  const nextSec = Number(e.target.value)
                  setCurrentSec(nextSec)
                  sendYouTubeCommand('seekTo', [nextSec, true])
                }}
                className="mb-1 h-1 w-full cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-600">
                <span>{formatTime(currentSec)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            <div className="relative shrink-0" ref={controlMenuRef}>
              <button
                type="button"
                onClick={() => setIsControlMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-white"
                aria-label="재생 설정 열기"
              >
                <Settings2 className="h-4 w-4" />
              </button>

              {isControlMenuOpen && (
                <div className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-neutral-900/98 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Speed</p>
                      <div className="flex flex-wrap gap-2">
                        {playbackSpeedOptions.map((option) => {
                          const isSelected = speed === option
                          return (
                            <button
                              key={option}
                              onClick={() => setSpeed(option)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-primary text-white shadow-[0_6px_18px_rgba(139,92,246,0.28)]'
                                  : 'border border-white/12 bg-white/6 text-neutral-300 hover:bg-white/12'
                              }`}
                            >
                              x{option}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Study Mode</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={toggleBlind}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            isBlind
                              ? 'bg-primary text-white shadow-[0_6px_18px_rgba(139,92,246,0.28)]'
                              : 'border border-white/12 bg-white/6 text-neutral-300 hover:bg-white/12'
                          }`}
                        >
                          {isBlind ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          Blind
                        </button>
                        <span className="text-neutral-600">|</span>
                        {subtitleModeOptions.map((option) => {
                          const isSelected = subtitleMode === option.value
                          return (
                            <button
                              key={option.value}
                              onClick={() => setSubtitleMode(option.value)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-primary text-white shadow-[0_6px_18px_rgba(139,92,246,0.28)]'
                                  : 'border border-white/12 bg-white/6 text-neutral-300 hover:bg-white/12'
                              }`}
                            >
                              {option.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={shouldStackMobile ? 'order-2 flex min-h-0 flex-1 flex-col overflow-hidden bg-neutral-900' : 'flex min-h-0 w-[336px] shrink-0 flex-col overflow-hidden border-l border-neutral-800 bg-neutral-900'}>
        <div className="shrink-0 border-b border-neutral-800">
          <div className="flex items-start justify-between gap-3 px-5 pt-4">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSidePanelTab('transcript')}
                  className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                    sidePanelTab === 'transcript'
                      ? 'border-primary text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Transcript
                </button>
                <div className="group relative mb-2">
                  <button className="p-0.5 text-neutral-500 transition-colors hover:text-neutral-300">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 shadow-xl group-hover:visible">
                    <p className="mb-2 text-[10px] font-medium text-neutral-400">Word labels</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 rounded bg-neutral-600/80 px-1 py-px text-[10px] font-medium text-neutral-100">단어</span>
                        <span className="text-[10px] text-neutral-400">Previously bookmarked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-violet-600 px-1 py-px text-[10px] font-semibold text-white">
                          단어
                          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-violet-400/60">
                            <Check className="h-2 w-2 text-white" />
                          </span>
                        </span>
                        <span className="text-[10px] text-neutral-400">Bookmarked in this flashcard lesson</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-[10px] font-medium text-violet-300">단어</span>
                        <span className="text-[10px] text-neutral-400">Appeared in this flashcard lesson</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSidePanelTab('culture')}
                className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                  sidePanelTab === 'culture'
                    ? 'border-primary text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Cultural Notes
              </button>
            </div>
          </div>
        </div>

        {sidePanelTab === 'transcript' ? (
          <div className="flex-1 overflow-y-auto">
            {subtitles.map((line) => {
              const isActive = line.id === activeLine.id
              const isSentenceBookmarked = isBookmarked(`sentence-${lessonId}-${line.id}`)
              return (
                <div
                  key={line.id}
                  ref={(el) => { lineRefs.current[line.id] = el }}
                  onClick={() => seekTo(line.startSec)}
                  className={`cursor-pointer border-b border-neutral-800/60 px-5 py-3.5 transition-all ${
                    isActive ? 'border-l-2 border-l-primary bg-neutral-800' : 'hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 shrink-0 font-mono text-[10px] ${isActive ? 'font-bold text-primary' : 'text-neutral-500'}`}>
                      {formatTime(line.startSec)}
                    </span>
                    <div className="min-w-0 flex-1">
                      {subtitleMode !== 'english' && (
                        <p className={`text-sm leading-[1.9] ${isActive ? 'font-medium text-white' : 'text-neutral-300'}`}>
                          <SubtitleText
                            text={line.korean}
                            forceTooltipBelow={line.id === firstSubtitleId}
                            {...subtitleProps}
                          />
                        </p>
                      )}
                      {subtitleMode !== 'korean' && (
                        <p className={`mt-0.5 text-sm leading-relaxed ${subtitleMode === 'english' ? 'text-neutral-200' : 'text-neutral-500'}`}>
                          {line.english}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSentenceBookmark(line)
                      }}
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSentenceBookmarked
                          ? 'border-primary/30 bg-primary/15 text-primary'
                          : 'border-white/10 bg-white/5 text-neutral-500 hover:border-white/20 hover:bg-white/10 hover:text-white'
                      }`}
                      title={isSentenceBookmarked ? 'Remove sentence bookmark' : 'Save sentence bookmark'}
                      aria-label={isSentenceBookmarked ? 'Remove sentence bookmark' : 'Save sentence bookmark'}
                    >
                      {isSentenceBookmarked ? (
                        <BookmarkCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Bookmark className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {culturalNotes.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5">
                <p className="text-sm font-medium text-white">No cultural notes yet</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  Add notes for slang, idioms, and local context when this lesson needs them.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {culturalNotes.map((note) => {
                  const isFocused = note.subtitleId === activeLine.id
                  const linkedSubtitle = subtitles.find((line) => line.id === note.subtitleId)
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        if (linkedSubtitle) seekTo(linkedSubtitle.startSec)
                      }}
                      className={`cursor-pointer rounded-2xl border px-4 py-4 transition-all ${
                        isFocused
                          ? 'border-primary/30 bg-primary/[0.1] ring-1 ring-primary/20 shadow-[0_12px_28px_rgba(139,92,246,0.14)]'
                          : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 h-12 w-1 shrink-0 rounded-full transition-colors ${
                          isFocused ? 'bg-primary' : 'bg-transparent'
                        }`} />
                        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                          <div>
                            <h3 className={`text-base font-semibold ${isFocused ? 'text-white' : 'text-neutral-100'}`}>{note.title}</h3>
                            <p className={`mt-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
                              isFocused ? 'text-primary-300' : 'text-primary-300/70'
                            }`}>
                              {note.keyword}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                            isFocused
                              ? 'bg-primary/18 text-primary'
                              : 'bg-white/6 text-neutral-500'
                          }`}>
                            {formatTime(linkedSubtitle?.startSec ?? 0)}
                          </span>
                        </div>
                      </div>

                      <div className="pl-4">
                        <p className={`mt-3 text-xs leading-6 ${isFocused ? 'text-white' : 'text-neutral-200'}`}>
                          {note.explanation}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
