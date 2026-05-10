import type { BookmarkedCard } from '@/hooks/useBookmarks'

// 데모용 북마크 데이터
export const MOCK_DEMO_BOOKMARKS: BookmarkedCard[] = [
  {
    cardId: 'demo-1',
    lessonId: '3',
    lessonTitle: 'Korean Street Food Tour Seoul',
    expression: '가득해요',
    baseWord: '가득하다',
    meaning: 'To be full of / packed with',
    exampleSentence: '이 시장은 맛있는 음식 가게로 가득해요.',
    exampleTranslation: '',
    savedAt: new Date().toISOString(),
    type: 'expression',
    subType: 'ending',
    conjugationBadges: [
      {
        removed: '하',
        added: '해요',
      }
    ]
  },
  {
    cardId: 'demo-2',
    lessonId: '3',
    lessonTitle: 'Korean Street Food Tour Seoul',
    expression: '다양하고',
    baseWord: '다양하다',
    meaning: 'To be diverse / varied',
    exampleSentence: '서울의 길거리 음식은 정말 다양하고 맛있어요.',
    exampleTranslation: '',
    savedAt: new Date(Date.now() - 3600000).toISOString(),
    type: 'expression',
    subType: 'ending',
    conjugationBadges: [
      {
        added: '고',
      }
    ]
  },
  {
    cardId: 'demo-3',
    lessonId: '4',
    lessonTitle: 'K-drama Vocabulary Basics',
    expression: '충격받았어요',
    baseWord: '충격받다',
    meaning: 'To be shocked / taken aback',
    exampleSentence: '마지막 반전에서 완전히 충격받았어요.',
    exampleTranslation: '',
    savedAt: new Date(Date.now() - 7200000).toISOString(),
    type: 'expression',
    subType: 'ending',
    conjugationBadges: [
      { added: '았' },
      { added: '어요' }
    ]
  },
  {
    cardId: 'demo-4',
    lessonId: '3',
    lessonTitle: 'Korean Street Food Tour Seoul',
    expression: '길거리 음식',
    meaning: 'Street food',
    exampleSentence: '',
    exampleTranslation: '',
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'expression',
    subType: 'word'
  },
  {
    cardId: 'demo-5',
    lessonId: '3',
    lessonTitle: 'Korean Street Food Tour Seoul',
    expression: '서울의 길거리 음식은 정말 다양하고 맛있어요.',
    meaning: 'Street food in Seoul is incredibly diverse and delicious.',
    exampleSentence: '',
    exampleTranslation: '',
    savedAt: new Date(Date.now() - 172800000).toISOString(),
    type: 'sentence',
  }
]
