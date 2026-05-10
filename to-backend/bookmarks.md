# Bookmark API 명세

북마크 기능은 학습자가 레슨(플래시카드)이나 영상 시청(자막) 중에 마음에 드는 단어, 어미 변형, 또는 문장 전체를 개인 저장소에 저장하고 나중에 모아볼 수 있는 기능입니다.
- 성민아, 얘는 GEMINI로 작성헤서 좀 부정확할 수도 있어. 아닌것같다 싶은거 있으면 UI 보고 판단해주는게 나을 수도 있을 것 같음.

---

## 1. 북마크 저장 (Add Bookmark)

학습 중 북마크 버튼을 누를 때 호출됩니다.

### 엔드포인트
```
POST /bookmarks
```

### 요청 바디 (Request Body)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `cardId` | string | ✅ | 원본 카드의 ID (Flashcard ID 또는 자막 ID 기반 생성) |
| `lessonId` | string | ✅ | 해당 표현이 포함된 레슨 ID |
| `type` | `"expression"` \| `"sentence"` | ✅ | 북마크 분류 (표현/문장) |
| `subType` | `"word"` \| `"ending"` | - | `type`이 `"expression"`일 때만 필수. (단어/어미변형 구분) |
| `expression` | string | ✅ | 북마크한 텍스트 (단어 활용형 또는 문장 원문) |
| `meaning` | string | ✅ | 해당 표현의 영문 뜻. 어미 변형일 경우 어미 설명이 아닌 **단어 원형의 뜻**을 저장 |
| `baseWord` | string | - | 어미 변형(`ending`)일 경우 원형 단어. (e.g. `"가득하다"`) |
| `conjugationBadges` | array | - | 어미 변형(`ending`)일 경우 Flashcard API에서 받은 배지 데이터 그대로 저장 |
| `exampleSentence` | string | - | 예문 (주로 단어 북마크 시 함께 저장) |
| `exampleTranslation` | string | - | 예문 영문 번역 |

---

## 2. 북마크 목록 조회 (Get Bookmarks)

북마크 라이브러리 페이지 진입 시 호출됩니다.

### 엔드포인트
```
GET /bookmarks
```

### 응답 예시 (Response)
```json
{
  "bookmarks": [
    {
      "cardId": "fc-3-e1",
      "lessonId": "3",
      "lessonTitle": "Korean Street Food Tour Seoul",
      "expression": "가득해요",
      "baseWord": "가득하다",
      "meaning": "To be full of / packed with",
      "savedAt": "2026-05-10T14:00:00Z",
      "type": "expression",
      "subType": "ending",
      "conjugationBadges": [
        { "removed": "하", "added": "해요", "removedDetail": { ... }, "addedDetail": { ... } }
      ]
    },
    {
      "cardId": "sentence-3-s1",
      "lessonId": "3",
      "lessonTitle": "Korean Street Food Tour Seoul",
      "expression": "안녕하세요! 오늘은 서울의 길거리 음식을 함께 즐겨볼게요.",
      "meaning": "Hello! Today let's enjoy Seoul's street food together.",
      "savedAt": "2026-05-09T09:00:00Z",
      "type": "sentence"
    }
  ]
}
```

---

## 3. 북마크 삭제 (Delete Bookmark)

북마크 카드에서 삭제 버튼 클릭 및 확인 모달 승인 시 호출됩니다.

### 엔드포인트
```
DELETE /bookmarks/{cardId}
```

---

## 주요 비즈니스 로직 및 규칙

### 1. 북마크 타입 구분 (Categories)
프론트엔드 UI에서는 크게 두 가지 탭으로 분류하여 보여줍니다.
- **Expressions (표현)**: `type: "expression"`. 단어(`subType: "word"`)와 어미 변형(`subType: "ending"`)이 포함됩니다.
- **Sentences (문장)**: `type: "sentence"`. 영상 자막 전체를 북마크한 경우입니다.

### 2. 어미 변형(Ending) 처리 규칙
- **타이틀**: 사전형 대신 실제 활용형(`expression`)을 메인으로 보여줍니다.
- **뜻(Meaning)**: 문법적인 어미 설명(e.g. "Polite present tense")이 아니라, **단어 자체의 핵심 의미**를 보여줘야 합니다. (Flashcard API의 `baseWordMeaning` 우선 저장)
- **시각화**: `conjugationBadges` 데이터를 사용하여 Flashcard 학습 시와 동일한 색상 배지를 렌더링합니다.

### 3. 북마크 리뷰 모드 (Review Mode)
사용자가 북마크 라이브러리에서 카드를 클릭하면 해당 항목들을 넘겨보며 복습할 수 있는 전용 모드로 진입합니다.
- **동작**: Flashcard 학습 UI를 재사용하지만, 'Already Know'나 'Save to Bookmark' 같은 학습 진행 버튼은 노출되지 않습니다.
- **순서**: 특정 레슨의 순서가 아닌, **북마크 라이브러리 리스트의 정렬 순서(최신순/오래된순)와 필터 결과**를 그대로 따릅니다.
- **데이터 복원**: 북마크 리스트 정보만으로는 영상 구간 정보가 부족할 수 있습니다. 백엔드에서 목록 조회 시 필요한 영상 메타데이터(`video.startSec`, `video.endSec` 등)를 함께 내려주거나, 프론트에서 원본 카드 정보를 다시 참조할 수 있어야 합니다.

### 4. 검색 및 정렬 (Search & Sort)
- **검색**: `expression` 및 `meaning` 필드에 대한 부분 일치 검색이 필요합니다.
- **정렬**: 저장 일시(`savedAt`) 기준 최신순(Newest), 오래된순(Oldest) 정렬을 지원해야 합니다.

---

## TypeScript 참조
- 북마크 아이템 인터페이스: `BookmarkedCard` (`src/hooks/useBookmarks.ts`)
- 리뷰 모드 컴포넌트: `FlashcardTab` (`src/components/features/flashcard/FlashcardTab.tsx`)
