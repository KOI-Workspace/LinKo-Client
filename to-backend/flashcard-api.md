# Flashcard API 명세

플래시카드 기능은 레슨(영상)에서 추출된 단어/표현 카드와 어미 변형 카드를 학습자에게 보여주는 기능입니다.  
이 문서는 프론트엔드가 기대하는 API 응답 구조와 각 필드의 역할을 정리한 것입니다.

---

## 엔드포인트

```
GET /lessons/{lessonId}/flashcards
```

### 응답 예시

```json
{
  "lessonId": "3",
  "lessonTitle": "Korean Street Food Tour Seoul",
  "cards": [ ...카드 배열... ]
}
```

---

## 카드 타입

카드는 두 가지 타입이 있습니다. 배열 안에 두 타입이 섞여서 순서대로 내려옵니다.

| 타입 | `type` 값 | 설명 |
|------|-----------|------|
| 단어 카드 | `"word"` (또는 생략) | 단어/표현 학습 |
| 어미 카드 | `"ending"` | 어미 변형 패턴 학습 |

---

## 1. 단어 카드 (Word Card)

```json
{
  "id": "fc-3-1",
  "type": "word",
  "expression": "가득해요",
  "meaning": "To be full of / packed with",
  "exampleSentence": "이 시장은 맛있는 음식 가게로 가득해요.",
  "exampleTranslation": "This market is packed with delicious food stalls.",
  "video": {
    "youtubeId": "dQw4w9WgXcQ",
    "startSec": 45,
    "endSec": 62
  },
  "relatedVideos": [
    {
      "id": "6",
      "title": "Korean Pronunciation Guide for Beginners",
      "channelName": "Korean Class 101",
      "thumbnailUrl": "https://...",
      "startSec": 30
    }
  ],
  "dailyConversation": [
    { "text": "광장시장 가볼 만해요?", "isQuestion": true },
    { "text": "당연하죠. 빈대떡이랑 육회로 가득한 곳이에요.", "isQuestion": false }
  ]
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string | ✅ | 카드 고유 ID |
| `type` | `"word"` | - | 생략 가능. 있으면 `"word"` |
| `expression` | string | ✅ | **영상에 나온 그대로의 형태**. 동사/형용사는 활용형으로 (`가득하다` ❌ → `가득해요` ✅) |
| `meaning` | string | ✅ | 영문 뜻. 사전형 기준으로 작성 |
| `exampleSentence` | string | ✅ | 한국어 예문 |
| `exampleTranslation` | string | ✅ | 영문 번역 |
| `video` | object | ✅ | 해당 표현이 등장한 영상 구간 |
| `video.youtubeId` | string | ✅ | YouTube 영상 ID |
| `video.startSec` | number | ✅ | 구간 시작 초 |
| `video.endSec` | number | ✅ | 구간 종료 초 |
| `relatedVideos` | array | ✅ | 같은 표현이 등장하는 다른 영상 목록. 없으면 빈 배열 `[]` |
| `dailyConversation` | array | - | 실생활 대화 예시. 없으면 생략 가능 |
| `dailyConversation[].text` | string | ✅ | 대화문 |
| `dailyConversation[].isQuestion` | boolean | ✅ | `true` = 질문(왼쪽 말풍선), `false` = 답변(오른쪽 말풍선) |

---

## 2. 어미 카드 (Ending Card)

```json
{
  "id": "fc-3-e1",
  "type": "ending",
  "baseWord": "가득하다",
  "baseWordMeaning": "To be full of / packed with",
  "conjugatedForm": "가득해요",
  "conjugationBadges": [
    {
      "removed": "하",
      "added": "해요",
      "removedDetail": {
        "category": "어간변화",
        "subCategories": ["Contraction"],
        "explanation": "The stem-final '하' in 하다 verbs contracts with a following vowel ending. 하 + 아/어 → 해 is an irregular but extremely common pattern."
      },
      "addedDetail": {
        "category": "어말-종결",
        "subCategories": ["Declarative", "Informal"],
        "explanation": "The most common polite sentence-final ending in everyday conversation. Expresses present tense in a friendly, polite manner."
      }
    }
  ],
  "ending": "아/어요",
  "endingMeaning": "Polite present tense",
  "endingExplanation": "일상 대화에서 가장 많이 쓰이는 공손한 현재 어미예요. 하다 동사·형용사는 -하 뒤에 아/어 계열 어미가 올 때 -해로 줄어들어요.",
  "scriptSentence": "이 시장은 맛있는 음식 가게로 가득해요.",
  "scriptTranslation": "This market is packed with delicious food stalls.",
  "video": {
    "youtubeId": "dQw4w9WgXcQ",
    "startSec": 45,
    "endSec": 62
  },
  "relatedVideos": []
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string | ✅ | 카드 고유 ID |
| `type` | `"ending"` | ✅ | 반드시 `"ending"` |
| `baseWord` | string | ✅ | 사전형 (배지 시각화에 사용). e.g. `"가득하다"` |
| `baseWordMeaning` | string | - | 사전형의 영문 뜻. 타이틀 아래 작게 표시됨 |
| `conjugatedForm` | string | ✅ | **영상에 나온 활용형** (카드 타이틀로 크게 표시). e.g. `"가득해요"` |
| `conjugationBadges` | array | ✅ | 어미 변형 배지 목록. 복합 어미면 여러 개 가능 (아래 참고) |
| `ending` | string | ✅ | 어미 이름. e.g. `"아/어요"`, `"고"`, `"았/었어요"` |
| `endingMeaning` | string | ✅ | 어미의 영문 의미. e.g. `"Polite present tense"` |
| `endingExplanation` | string | ✅ | 어미에 대한 한국어 설명 (학습자용) |
| `scriptSentence` | string | ✅ | 영상 스크립트 원문 (활용형이 포함된 문장) |
| `scriptTranslation` | string | ✅ | 스크립트 영문 번역 |
| `video` | object | ✅ | 단어 카드와 동일 |
| `relatedVideos` | array | ✅ | 단어 카드와 동일. 없으면 `[]` |

---

## 어미 배지 (conjugationBadges)

`conjugationBadges`는 `가득하다 → 가득해요` 변형 과정을 시각화합니다.  
프론트엔드에서는 이 배열을 순서대로 배지로 렌더링합니다.

### 단순 어미 (배지 1개)

`다양하다 → 다양하고` : 어간에 `-고`만 붙는 경우

```json
"conjugationBadges": [
  {
    "added": "고",
    "addedDetail": {
      "category": "어말-연결",
      "subCategories": ["Listing", "Sequential"],
      "explanation": "Connective ending that lists facts or states side by side..."
    }
  }
]
```

### 복합 어미 (배지 여러 개)

`충격받다 → 충격받았어요` : 선어말어미 `았` + 종결어미 `어요`가 합쳐진 경우  
**배지를 어미 단위로 분리**해서 내려주세요.

```json
"conjugationBadges": [
  {
    "added": "았",
    "addedDetail": {
      "category": "선어말어미",
      "subCategories": ["Tense"],
      "explanation": "Pre-final ending marking past tense..."
    }
  },
  {
    "added": "어요",
    "addedDetail": {
      "category": "어말-종결",
      "subCategories": ["Declarative", "Informal"],
      "explanation": "Polite sentence-final ending for everyday speech..."
    }
  }
]
```

### 어간 탈락이 있는 경우 (removed + added 동시에)

`가득하다 → 가득해요` : 어간의 일부(`하`)가 빠지면서 새로운 형태(`해요`)로 대체

```json
"conjugationBadges": [
  {
    "removed": "하",
    "added": "해요",
    "removedDetail": {
      "category": "어간변화",
      "subCategories": ["Contraction"],
      "explanation": "..."
    },
    "addedDetail": {
      "category": "어말-종결",
      "subCategories": ["Declarative", "Informal"],
      "explanation": "..."
    }
  }
]
```

### 배지 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `removed` | string | - | 기본형에서 **제거**되는 부분. 프론트에서 주황색으로 표시 |
| `added` | string | ✅ | **추가**되는 어미. 프론트에서 초록색으로 표시 |
| `removedDetail` | object | - | `removed`가 있을 때 함께 제공 |
| `addedDetail` | object | - | 상세 분석 필요 시 제공. 없으면 배지만 표시됨 |

---

## 어미 카테고리 (EndingCategory)

`category` 필드에 들어갈 수 있는 값은 아래 6가지입니다.  
프론트에서 카테고리별로 색상이 다르게 렌더링됩니다.

| 값 | 프론트 표시 | 색상 | 해당 어미 예시 |
|----|------------|------|---------------|
| `"선어말어미"` | Pre-final | 파란색 | ~았/었, ~겠, ~시, ~더 |
| `"어말-종결"` | Final · Closing | 보라색 | ~아요/어요, ~습니다, ~다, ~지요 |
| `"어말-연결"` | Final · Connective | 황색 | ~고, ~서, ~면, ~지만, ~는데 |
| `"어말-전성"` | Final · Transformative | 청록색 | ~기, ~음, ~는, ~ㄴ, ~ㄹ |
| `"어말-보조적"` | Final · Auxiliary | 초록색 | ~아/어 (보조동사 연결) |
| `"어간변화"` | Stem Change | 회색 | 불규칙 어간 탈락/교체 |

### subCategories 가이드

`subCategories`는 아래 목록에서 해당하는 항목을 영문으로 작성합니다.

**선어말어미**
- `Tense` (시제: ~았/었)
- `Conjecture` / `Volition` (추측·의지: ~겠)
- `Honorific` (존경: ~시)
- `Retrospective` (회상: ~더)

**어말-종결**
- `Declarative` (평서)
- `Interrogative` (의문)
- `Imperative` (명령)
- `Propositive` (청유)
- `Exclamatory` (감탄)
- `Formal` (격식체)
- `Informal` (비격식체)

**어말-연결**
- `Listing` (나열)
- `Sequential` (순차)
- `Simultaneous` (동시)
- `Reason` / `Cause` (이유·원인: ~아서/어서)
- `Condition` (조건: ~면)
- `Concession` (양보: ~지만)
- `Purpose` (목적: ~려고)
- `Background` (배경: ~는데)
- `Transition` (전환)
- `Result` (결과)

**어말-전성**
- `Nominalization` (명사형: ~기, ~음)
- `Modifier` (관형형: ~는, ~ㄴ, ~ㄹ)
- `Adverbial` (부사형: ~게, ~도록)

**어말-보조적**
- `Completion` (완료: ~아/어 두다)
- `Continuation` (지속: ~고 있다)
- `Negation` (부정: ~지 않다)
- `Possibility` (가능: ~을 수 있다)

**어간변화**
- `Contraction` (축약: 하 + 아/어 → 해)
- `Irregular` (불규칙 활용)

---

## 카드 순서 규칙

프론트엔드는 서버에서 내려온 순서 그대로 카드를 표시합니다.  
권장 배치는 다음과 같습니다.

- 단어 카드 3~4장마다 어미 카드 1장 삽입
- 어미 카드는 바로 앞 단어 카드에서 등장한 어미를 다루는 것이 자연스러움
- 레슨 전체 카드 수 권장: 5~10장 (너무 많으면 학습 피로도 증가)

---

## TypeScript 타입 참조

프론트엔드 타입 파일 위치:  
`src/components/features/flashcard/flashcard.types.ts`

목데이터(API 연동 전 사용 중):  
`src/components/features/flashcard/mockFlashcards.ts`

API 연동 시 `mockFlashcards.ts`의 `MOCK_FLASHCARDS` 상수를 실제 API 호출로 교체할 예정입니다.  
환경변수: `NEXT_PUBLIC_API_URL`
