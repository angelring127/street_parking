# 기여 가이드

## 시작하기

```bash
git clone <repo-url>
cd street_parking_price
npm install
npm run dev
```

필요하면 최신 데이터도 다시 받아옵니다.

```bash
npm run update-data
```

## 작업 전 확인

변경 전후로 아래 명령을 우선 확인하는 것을 권장합니다.

```bash
npm run lint
npm run build
```

현재 기준으로 lint는 오류 없이 통과합니다.

## 코드 작성 기준

### TypeScript

- 타입을 명확히 유지합니다.
- `any` 사용은 가능한 한 피합니다.
- props와 데이터 구조는 명시적 타입을 둡니다.

### 컴포넌트

- 컴포넌트 단위로 책임을 나눕니다.
- 클라이언트 컴포넌트가 필요한 경우에만 `"use client"`를 둡니다.
- 지도 관련 로직은 SSR 이슈를 고려합니다.

### 스타일

- 현재 프로젝트는 Tailwind CSS 4를 사용합니다.
- Leaflet 관련 스타일은 [app/globals.css](/Users/hoya/Project/AI/street_parking_price/app/globals.css)에 있습니다.

### 주석과 문서

- 기존 코드에는 한국어와 일본어 주석이 섞여 있습니다.
- 새 주석은 짧고 실제로 필요한 설명만 추가하는 편이 낫습니다.
- 동작이 바뀌면 관련 문서도 함께 갱신합니다.

## 브랜치와 커밋

브랜치는 작업 의도가 드러나게 만듭니다.

예:

- `feature/address-search-improvements`
- `fix/mobile-sort-menu`
- `docs/update-project-docs`

커밋 메시지는 한 줄로도 충분하지만 변경 목적이 분명해야 합니다.

예:

- `feat: improve mobile search flow`
- `fix: align time-based sorting behavior`
- `docs: refresh project documentation`

## Pull Request 체크리스트

- 변경 목적이 설명되어 있는가
- UI 변경이면 영향 범위를 설명했는가
- `npm run lint` 결과를 확인했는가
- `npm run build` 결과를 확인했는가
- 문서가 낡아지지 않았는가

## 이 프로젝트에서 특히 주의할 점

- 가격 필터와 가격 정렬의 기준 시간이 현재 완전히 일치하지 않습니다.
- 모바일 정렬 메뉴는 데스크톱 필터와 구현이 완전히 동일하지 않습니다.
- 지도 마커 텍스트와 팝업 텍스트의 요금 기준이 다를 수 있습니다.
- `AdBanner` 컴포넌트는 존재하지만 현재 메인 화면에서 사용되지 않습니다.

이 영역을 수정할 때는 관련 문서와 동작을 함께 맞추는 것이 좋습니다.
