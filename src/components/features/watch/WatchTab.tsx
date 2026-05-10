'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Play, Pause, BookmarkCheck, Eye, EyeOff, Info, Check } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'
import type { BookmarkedCard } from '@/hooks/useBookmarks'
import { MOCK_FLASHCARDS } from '@/components/features/flashcard/mockFlashcards'

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface VocabEntry {
  meaning: string
  cardId: string
  lessonId: string
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

const MOCK_SUBTITLES: SubtitleLine[] = [
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

const YOUTUBE_ID = 'dQw4w9WgXcQ'
const TOTAL_DURATION = MOCK_SUBTITLES[MOCK_SUBTITLES.length - 1].endSec

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── 자막 텍스트 토크나이저 ───────────────────────────────────────────────────────

type TextToken =
  | { type: 'plain'; text: string }
  | { type: 'vocab'; word: string; entry: VocabEntry }

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
    // 다른 레슨에서 북마크된 단어 (현재 vocab에 없는 것만)
    ...bookmarks
      .filter((bm) => bm.lessonId !== currentLessonId && !(bm.expression in vocabMap))
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
    if (pos < m.start) tokens.push({ type: 'plain', text: text.slice(pos, m.start) })
    tokens.push({ type: 'vocab', word: m.word, entry: m.entry })
    pos = m.end
  }
  if (pos < text.length) tokens.push({ type: 'plain', text: text.slice(pos) })
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
  word, entry, isCurrentLesson, bookmarked, onAdd, isBlind, revealed, onRevealToggle,
}: {
  word: string
  entry: VocabEntry
  isCurrentLesson: boolean
  bookmarked: boolean
  onAdd: (e: React.MouseEvent) => void
  isBlind: boolean
  revealed: boolean
  onRevealToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setOpen(true)
  }
  const hide = () => {
    hideTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const hasBookmarkBadge = isCurrentLesson && bookmarked
  const tokenClass = isCurrentLesson && bookmarked
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
      className={`relative inline-block cursor-pointer ${wrapperClass}`}
      onMouseEnter={isBlind ? undefined : show}
      onMouseLeave={isBlind ? undefined : hide}
      onClick={handleClick}
    >
      <span
        className={`inline-flex items-center gap-1 align-baseline leading-tight transition-colors ${
          isHidden ? hiddenTokenClass : tokenClass
        } ${isHidden ? 'select-none' : ''}`}
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
          className="absolute bottom-full left-0 mb-1 z-50 flex items-center gap-1.5 bg-neutral-900 border border-neutral-600 rounded-lg px-2.5 py-1.5 shadow-2xl text-xs whitespace-nowrap"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <span className="text-neutral-200 font-medium">{entry.meaning}</span>
          {bookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <button
              onClick={onAdd}
              className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white hover:bg-violet-600 transition-colors font-bold text-[11px] shrink-0 leading-none"
            >
              +
            </button>
          )}
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
        const isCurrentLesson = entry.lessonId === currentLessonId
        const bookmarked = bookmarks.some((b) => b.cardId === entry.cardId)

        const handleAdd = (e: React.MouseEvent) => {
          e.stopPropagation()
          addBookmark({
            cardId: entry.cardId,
            lessonId: currentLessonId,
            lessonTitle,
            expression: entry.expression,
            meaning: entry.meaning,
            exampleSentence: entry.exampleSentence,
            exampleTranslation: entry.exampleTranslation,
          })
        }

        return (
          <VocabToken
            key={i}
            word={word}
            entry={entry}
            isCurrentLesson={isCurrentLesson}
            bookmarked={bookmarked}
            onAdd={handleAdd}
            isBlind={isBlind}
            revealed={revealedCards.has(entry.cardId)}
            onRevealToggle={() => onRevealToggle(entry.cardId)}
          />
        )
      })}
    </>
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function WatchTab({ lessonId, onComplete }: { lessonId: string; onComplete?: () => void }) {
  const { bookmarks, addBookmark } = useBookmarks()
  const [currentSec, setCurrentSec]     = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [speed, setSpeed]               = useState(1)
  const [isBlind, setIsBlind]           = useState(false)
  const [subtitleMode, setSubtitleMode] = useState<SubtitleDisplayMode>('bilingual')
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set())
  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const completionFired = useRef(false)

  const vocabMap    = WATCH_VOCAB[lessonId] ?? {}
  const lessonTitle = MOCK_FLASHCARDS[lessonId]?.lessonTitle ?? ''
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
  const activeLine = MOCK_SUBTITLES.slice().reverse().find((s) => currentSec >= s.startSec) ?? MOCK_SUBTITLES[0]

  // 시뮬레이션 타이머 — 종료 시 reachedEnd 플래그 설정
  const reachedEnd = useRef(false)
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentSec((prev) => {
        const next = prev + speed * 0.5
        if (next >= TOTAL_DURATION) {
          setIsPlaying(false)
          reachedEnd.current = true
          return TOTAL_DURATION
        }
        return next
      })
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying, speed])

  // 자연 재생 종료 감지 → onComplete 호출 (1회만)
  useEffect(() => {
    if (reachedEnd.current && !isPlaying && !completionFired.current) {
      completionFired.current = true
      reachedEnd.current = false
      onComplete?.()
    }
  }, [isPlaying, onComplete])

  // 현재 자막 라인으로 자동 스크롤
  useEffect(() => {
    lineRefs.current[activeLine.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeLine.id])

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

  const subtitleProps = {
    vocabMap, bookmarks: mergedBookmarks, currentLessonId: lessonId, lessonTitle, addBookmark,
    isBlind, revealedCards, onRevealToggle: toggleReveal,
  }

  const subtitleModeOptions: Array<{ value: SubtitleDisplayMode; label: string }> = [
    { value: 'bilingual', label: 'Dual' },
    { value: 'korean', label: 'Korean' },
    { value: 'english', label: 'English' },
  ]

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">

      {/* ── 좌: 영상 + 자막 + 컨트롤 ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-neutral-950">

        {/* 유튜브 임베드 */}
        <div className="relative w-full aspect-video shrink-0 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Lesson video"
          />
        </div>

        {/* 현재 자막 (크게) */}
        <div className="shrink-0 px-8 py-6 min-h-[120px] flex flex-col justify-center border-b border-neutral-800">
          {subtitleMode !== 'english' && (
            <p className="text-white text-2xl font-semibold leading-snug">
              <SubtitleText text={activeLine.korean} {...subtitleProps} />
            </p>
          )}
          {subtitleMode !== 'korean' && (
            <p className={`text-2xl leading-relaxed ${subtitleMode === 'english' ? 'text-white font-semibold' : 'mt-2 text-neutral-400'}`}>
              {activeLine.english}
            </p>
          )}
        </div>

        {/* 컨트롤 바 */}
        <div className="shrink-0 px-8 py-5">
          <input
            type="range"
            min={0} max={TOTAL_DURATION} value={currentSec} step={0.5}
            onChange={(e) => setCurrentSec(Number(e.target.value))}
            className="w-full h-1 mb-1 cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-600 mb-5">
            <span>{formatTime(currentSec)}</span>
            <span>{formatTime(TOTAL_DURATION)}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsPlaying((v) => !v)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              {isPlaying
                ? <Pause className="w-4 h-4" fill="white" />
                : <Play className="w-4 h-4 translate-x-px" fill="white" />
              }
            </button>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-white/10 text-white text-xs px-3 py-2 rounded-lg border border-white/20 outline-none cursor-pointer"
            >
              <option value={0.5}>×0.5</option>
              <option value={0.75}>×0.75</option>
              <option value={1}>×1.0</option>
              <option value={1.5}>×1.5</option>
            </select>

            <button
              onClick={toggleBlind}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                isBlind
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/10 text-neutral-400 border-white/20 hover:border-white/40 hover:text-white'
              }`}
            >
              {isBlind ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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

      {/* ── 우: 자막 목록 ── */}
      <div className="w-80 shrink-0 border-l border-neutral-800 flex flex-col min-h-0 bg-neutral-900">

        <div className="shrink-0 px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Transcript</p>
          <div className="flex items-center gap-2">
            {/* 단어 색상 범례 안내 */}
            <div className="relative group">
              <button className="text-neutral-500 hover:text-neutral-300 transition-colors p-0.5">
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 z-50 invisible group-hover:visible bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 shadow-xl w-44">
                <p className="text-[10px] text-neutral-400 font-medium mb-2">Word labels</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded px-1 py-px text-[10px] font-medium text-neutral-100 bg-neutral-600/80 shrink-0">단어</span>
                    <span className="text-[10px] text-neutral-400">Previously bookmarked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded px-1 py-px text-[10px] font-semibold text-white bg-violet-600 shrink-0">
                      단어
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-violet-400/60">
                        <Check className="w-2 h-2 text-white" />
                      </span>
                    </span>
                    <span className="text-[10px] text-neutral-400">Bookmarked in this flashcard lesson</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-violet-300 shrink-0">단어</span>
                    <span className="text-[10px] text-neutral-400">Appeared in this flashcard lesson</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs text-neutral-500">{MOCK_SUBTITLES.length} lines</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MOCK_SUBTITLES.map((line) => {
            const isActive = line.id === activeLine.id
            return (
              <div
                key={line.id}
                ref={(el) => { lineRefs.current[line.id] = el }}
                onClick={() => setCurrentSec(line.startSec)}
                className={`px-5 py-3.5 border-b border-neutral-800/60 cursor-pointer transition-all ${
                  isActive ? 'bg-neutral-800 border-l-2 border-l-primary' : 'hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${
                    isActive ? 'text-primary font-bold' : 'text-neutral-500'
                  }`}>
                    {formatTime(line.startSec)}
                  </span>
                  <div className="flex-1 min-w-0">
                    {subtitleMode !== 'english' && (
                      <p className={`text-sm leading-relaxed ${isActive ? 'text-white font-medium' : 'text-neutral-300'}`}>
                        <SubtitleText text={line.korean} {...subtitleProps} />
                      </p>
                    )}
                    {subtitleMode !== 'korean' && (
                      <p className={`text-sm leading-relaxed ${subtitleMode === 'english' ? 'text-neutral-200' : 'mt-0.5 text-neutral-500'}`}>
                        {line.english}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
