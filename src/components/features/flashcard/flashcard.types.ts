export interface FlashCardVideo {
  youtubeId: string
  startSec: number
  endSec: number
}

export interface RelatedVideo {
  id: string
  title: string
  channelName: string
  thumbnailUrl?: string
  startSec: number
}

export interface ConversationTurn {
  text: string
  isQuestion: boolean
}

export interface FlashCard {
  id: string
  type?: 'word'
  expression: string
  meaning: string
  exampleSentence: string
  exampleTranslation: string
  video: FlashCardVideo
  relatedVideos: RelatedVideo[]
  dailyConversation?: ConversationTurn[]
}

/** 어미 분류 카테고리 */
export type EndingCategory =
  | '선어말어미'
  | '어말-종결'
  | '어말-연결'
  | '어말-전성'
  | '어말-보조적'
  | '어간변화'

/** 배지 각 부분(제거/추가)에 대한 상세 정보 */
export interface BadgePartDetail {
  category: EndingCategory
  subCategories: string[]  // 해당 어미의 하위 분류 (칩으로 표시, 영문)
  explanation: string      // 영문 설명
}

/** 어미 변형 배지: removed는 교체된 부분(주황), added는 추가된 부분(초록) */
export interface ConjugationBadge {
  removed?: string
  added: string
  removedDetail?: BadgePartDetail
  addedDetail?: BadgePartDetail
}

export interface EndingCard {
  id: string
  type: 'ending'
  baseWord: string           // 사전형 e.g. '가득하다' (배지 시각화용)
  baseWordMeaning?: string   // 사전형의 뜻 e.g. 'To be full of / packed with'
  conjugatedForm: string     // 영상에 나온 활용형 e.g. '가득해요' (타이틀 표시용)
  conjugationBadges: ConjugationBadge[]
  ending: string             // 어미 이름 e.g. '아/어요'
  endingMeaning: string      // 영어 의미
  endingExplanation: string  // 한국어 설명
  scriptSentence: string     // 스크립트 원문
  scriptTranslation: string
  video: FlashCardVideo
  relatedVideos: RelatedVideo[]
}

export type AnyFlashCard = FlashCard | EndingCard

export interface LessonFlashcards {
  lessonId: string
  lessonTitle: string
  cards: AnyFlashCard[]
}
