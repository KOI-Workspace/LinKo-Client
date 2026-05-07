# Project Context

YouTube 링크를 한국어 학습 자료로 변환하는 웹 서비스. 이 레포는 **프론트엔드만** 다룹니다.

## 기술 스택
- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS, TanStack Query, Zustand
- 패키지 매니저: **pnpm** (npm·yarn 금지)

## 백엔드 분리
- 백엔드는 별도 레포. 이 레포에 백엔드 로직 구현 금지
- API 호출은 `NEXT_PUBLIC_API_URL` 환경변수 사용
- 백엔드 없을 땐 `NEXT_PUBLIC_USE_MOCK=true`로 Mock 응답 사용
- API 응답 타입은 `types/api.ts`에 정의, Zod로 검증 후 사용

## 디자인 시스템 (Lavender Pulse)
- **`design.json`** — 정확한 스펙 (색상·여백·라운딩). 컴포넌트 구현·토큰 적용 시 참조. 값 임의 수정 금지
- **`design.md`** — 창의 가이드 (톤·원칙). 새 화면 설계·일러스트·마케팅 시 참조
- 충돌 시 JSON 우선
- 새 색상·폰트 추가 금지. 그린·민트 계열 절대 도입 금지

## 사용자 (현수) 톤
- 한국어 존댓말, 핵심부터, 불필요한 서론 생략
- 옵션 1~3개 제시 후 추천 명시
- 기획자 눈높이로 기술 설명 (개발자 출신 아님)

## 작업 규칙
- `any` 타입 금지, `console.log` 커밋 금지
- 라이브러리 임의 추가 금지 (사용자 확인 필수)
- 작업 후 `pnpm lint && pnpm type-check` 통과 확인
- 새 패턴이 재사용 가치 있으면 → 작업 끝에 "이건 추가하는 걸 추천드립니다"로 제안 (임의 수정 X)
