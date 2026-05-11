# Landing Page Modal Interaction

랜딩페이지에서는 링크 입력 및 CTA 클릭 시 두 종류의 모달이 등장합니다.

- **Login Modal**
- **Unsupported Case Modal**

이 문서는 현재 프론트엔드에서 임시로 처리해둔 방식과, 실제로는 백엔드와 어떻게 연결되어야 하는지를 정리한 문서입니다.

---

## 1. 어떤 액션에서 모달이 뜨는지

### A. Hero Section 링크 제출 버튼 클릭
히어로 섹션의 유튜브 링크 입력창에 값을 넣고 제출 버튼(화살표)을 눌렀을 때 실행됩니다.

이 경우에는 입력한 링크가:
- **허용 가능한 링크면** → `Login Modal`
- **미허용 링크면** → `Unsupported Case Modal`

으로 분기되어야 합니다.

---

### B. Start with these videos 섹션의 영상 카드 클릭
랜딩페이지 중간의 예시 영상 카드 클릭 시에는 곧바로 `Login Modal`이 열립니다.

이 영역은 사용자가 "로그인 후 바로 시작할 수 있다"는 흐름을 보여주기 위한 진입점입니다.

---

### C. 하단 CTA 버튼 클릭
하단의 `Get Started for Free` 버튼 클릭 시에도 `Login Modal`이 열립니다.

---

## 2. 현재 프론트엔드 임시 처리 방식

백엔드 미연동 상태이기 때문에, 지금은 Hero Section 제출 버튼에서만 아주 단순한 임시 검사를 넣어둔 상태입니다.

### 현재 임시 규칙
- 입력값이 `https://`로 시작하지 않으면 → `Unsupported Case Modal`
- 입력값이 `https://`로 시작하면 → `Login Modal`

즉, 지금은 아래처럼 동작합니다.

| 입력값 예시 | 현재 동작 |
|------------|-----------|
| `ㄷㅈㄹ` | Unsupported Case Modal |
| `abc` | Unsupported Case Modal |
| `http://youtube.com/...` | Unsupported Case Modal |
| `https://youtube.com/...` | Login Modal |

이건 **진짜 유효성 검사**가 아니라, 화면 연결 확인을 위한 임시 분기입니다.

---

## 3. 실제로는 백엔드가 판단해야 하는 것

최종적으로는 프론트엔드가 문자열 시작만 보고 판단하면 안 되고, 백엔드가 링크를 검사해서 허용/미허용 여부를 내려줘야 합니다.

프론트가 기대하는 최종 흐름은 아래와 같습니다.

### Hero Section 최종 흐름
1. 사용자가 링크 입력
2. 제출 버튼 클릭
3. 프론트가 백엔드에 링크 검증 요청
4. 백엔드가 허용/미허용 여부 반환
5. 결과에 따라 모달 분기

- `allowed = true` → `Login Modal`
- `allowed = false` → `Unsupported Case Modal`

---

## 4. 미허용 케이스 기준

현재 랜딩페이지의 Unsupported Case Modal에는 아래 5가지 케이스가 안내되고 있습니다.

1. `360° videos`
2. `YouTube Shorts`
3. `Non-Korean videos`
4. `Videos longer than 2 hours`
5. `Videos that block external playback`

즉, 백엔드는 적어도 위 다섯 가지 조건을 기준으로 최종 허용 여부를 판단할 수 있어야 합니다.

---

## 5. 프론트엔드가 기대하는 백엔드 응답 형태

정확한 엔드포인트는 추후 정해도 되지만, 프론트 입장에서는 아래 정도의 응답이면 충분합니다.

### 예시
```json
{
  "allowed": false,
  "reason": "shorts"
}
```

또는

```json
{
  "allowed": true
}
```

### `reason` 예시 후보
- `360_video`
- `shorts`
- `non_korean`
- `too_long`
- `external_playback_blocked`

프론트는 이 값을 받아서:
- `allowed: true`면 로그인 모달 오픈
- `allowed: false`면 미허용 케이스 모달 오픈

정도로만 사용하면 됩니다.

---

## 6. 모달별 역할 정리

### Login Modal
목적:
- 사용자를 로그인 단계로 보내기 위한 모달

등장 위치:
- Hero Section의 허용 링크 제출 시
- Start with these videos 영상 카드 클릭 시
- 하단 `Get Started for Free` 버튼 클릭 시

---

### Unsupported Case Modal
목적:
- 현재 지원하지 않는 링크 형식이라는 점을 안내
- 사용자가 다른 영상을 고를 수 있게 유도

등장 위치:
- Hero Section에서 미허용 링크 제출 시

보조 동작:
- `Pick Other Videos` 버튼 클릭 시 `Start with these videos` 섹션으로 스크롤 이동

---

## 7. 정리

지금은 프론트에서 아래처럼 임시로 처리 중입니다.

- `https://`로 시작하지 않음 → Unsupported
- `https://`로 시작함 → Login

하지만 실제 서비스에서는 반드시 백엔드가 링크를 검사해서 허용 여부를 내려줘야 합니다.

즉, 최종 책임은 백엔드가 가지는 구조입니다.
