# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 기술 스택
- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS
- 패키지 매니저: **pnpm** (npm·yarn 금지)
- 아이콘: lucide-react
- **현재 설치된 라이브러리는 위가 전부** — Zustand, TanStack Query, Zod, React Hook Form은 계획 중이나 미설치. 새 라이브러리 추가 전 반드시 사용자 확인

## 명령어
```bash
pnpm dev          # 개발 서버 (http://localhost:3000)
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint
pnpm type-check   # TypeScript 타입 검사 (tsc --noEmit)
pnpm format       # Prettier
```
작업 후 항상 `pnpm lint && pnpm type-check` 통과 확인.

## 라우팅 구조

```
src/app/
├── page.tsx                    # / → /home 리다이렉트
├── (marketing)/                # 비로그인 퍼블릭 영역 (Sidebar 없음)
│   └── page.tsx                # 랜딩 페이지 — FlashcardTab/WatchTab 직접 포함 (공개 데모)
└── (app)/                      # 인증 영역 — Sidebar + main 레이아웃
    ├── layout.tsx              # Sidebar + <main className="flex-1 overflow-y-auto">
    ├── home/page.tsx
    ├── lessons/page.tsx
    ├── lessons/[id]/page.tsx   # Flashcard ↔ Watch 탭 전환, 완료 모달 포함
    ├── channels/page.tsx
    ├── recommendations/page.tsx
    └── bookmarks/
        ├── page.tsx            # 저장한 단어/문장 목록
        └── review/page.tsx     # 북마크 복습 화면
```

- `(app)` 레이아웃이 `Sidebar`를 주입하므로 새 앱 페이지는 `(app)/` 아래에 만들면 자동으로 레이아웃 적용
- `(marketing)` 페이지는 Sidebar 없이 독립 렌더링

## 핵심 컴포넌트 패턴

### VideoCard (`src/components/features/home/VideoCard.tsx`)
앱 전반에서 쓰는 핵심 카드 컴포넌트.

```tsx
<VideoCard
  {...lessonData}
  fluid        // true → w-full (그리드용), false(기본) → w-[240px] 고정 (가로 스크롤용)
  showLearning // false → Flashcard/Watch 배지 숨김 (Recommendations, 미생성 채널 영상)
/>
```

- `generationStatus: 'generating'` → 로딩 카드 UI (어두운 배경)
- `generationStatus: 'ready'` → 썸네일 + 학습 상태 UI
- `LessonData` 타입은 `MyLessonsSection.tsx`에서 export

### FlashcardTab / WatchTab
두 탭 모두 아래 두 prop으로 공개/모바일 모드를 전환한다.

```tsx
<WatchTab
  lessonId="3"
  isPublic      // true → /public/* API 사용 (랜딩 페이지 데모용)
  mobileStacked // true → 모바일 세로 스택 레이아웃, false(기본) → 데스크톱 사이드 패널
/>
```

- `isPublic` 미지정 시 인증 토큰이 필요한 `/lessons/:id/*` API 호출
- `mobileStacked`일 때 사이드 패널 대신 영상 아래에 Transcript/Cultural Notes 영역을 배치

### UrlInput (`src/components/features/home/UrlInput.tsx`)
YouTube URL을 받아 학습자료 생성을 요청하는 핵심 진입점. Home·Channels·Recommendations 히어로 섹션에서 공통 사용. 현재 `handleSubmit` 내부 API 연동이 TODO 상태.

### Sidebar (`src/components/ui/Sidebar.tsx`)
- 접기/펼치기 토글 (w-16 ↔ w-60), `usePathname()`으로 active 감지
- `NAV_ITEMS` 배열에 추가하면 자동 렌더링

## 상태 및 내비게이션 규칙

- 페이지 기본은 서버 컴포넌트. 상태 필요 시 상단에 `'use client'` 추가
- **내비게이션**: `useRouter().push('/path')` 사용 — `<Link>`는 일부 환경에서 동작 안 하는 이슈 있었음
- 채널 전환 등 자식 컴포넌트 상태 초기화가 필요할 때: `key={selectedId}` prop 패턴 사용

## API 레이어

```
src/lib/
├── api.ts        # apiFetch 래퍼 — Authorization 헤더 자동 주입, ApiError 클래스
├── lessonsApi.ts # 레슨 CRUD, 플래시카드/자막 조회, 공개 API
├── authApi.ts    # Google OAuth ID 토큰 → JWT 교환
└── waitlistApi.ts
```

- 인증 토큰은 `localStorage('linko_access_token')` 에 저장; 개발 시 `NEXT_PUBLIC_DEV_AUTH_TOKEN` 환경변수로 대체 가능
- 공개 엔드포인트는 `/public/*` prefix — `isPublic` prop이 true인 컴포넌트에서 사용
- `NEXT_PUBLIC_API_URL` 미설정 시 `http://127.0.0.1:8000/api` 로 폴백

## 타입 시스템 핵심

- `AnyFlashCard = FlashCard | EndingCard` — 단어 카드와 어미 카드를 구분. `card.type === 'ending'`으로 분기
- `LessonSummary.generationStatus: 'generating' | 'ready' | 'failed'` — VideoCard 렌더링 분기 기준
- `BookmarkedCard` — `useBookmarks` 훅이 localStorage로 관리; `type: 'sentence' | 'expression'`, `subType: 'word' | 'ending'`

## Mock 데이터 전략
백엔드 미연동 상태. Mock 데이터 위치:
- `src/data/mockLessons.ts` — 레슨 목록
- `src/components/features/flashcard/mockFlashcards.ts` — 플래시카드 (lessonId 키)
- `WatchTab.tsx` 상단 `MOCK_SUBTITLES`, `MOCK_CULTURAL_NOTES_BY_LESSON` — 자막·문화 노트
- 각 페이지 파일 상단의 `MOCK_*` 상수 — 페이지별 로컬 데이터
- `isLesson?: boolean` — channels 페이지 영상에서 레슨화 여부 구분 (`false`면 `showLearning={false}`)

## 디자인 시스템 (Lavender Pulse)
- **`design.json`** — 색상·여백·라운딩 정확한 스펙. 컴포넌트 구현 시 참조, 값 임의 수정 금지
- **`design.md`** — 새 화면 설계·톤 가이드. 충돌 시 JSON 우선
- `primary` = 라벤더/퍼플, `rounded-pill` = 커스텀 Tailwind 클래스
- 그린·민트 계열, 핑크 CTA, `design.json` 외 색상 추가 금지

## 사용자 (현수) 톤
- 한국어 존댓말, 핵심부터, 불필요한 서론 생략
- 기획자 눈높이로 기술 설명 (개발자 출신 아님)

## 작업 규칙
- `any` 타입 금지, `console.log` 커밋 금지
- 라이브러리 임의 추가 금지 (사용자 확인 필수)
- `git push`, deploy 자동 실행 금지
