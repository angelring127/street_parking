# Street Parking Price Memory

Last updated: 2026-03-25

## 프로젝트 목적

- Vancouver 시의 거리 주차 미터 정보를 지도와 리스트로 보여주는 Next.js 앱.
- 사용자는 현재 위치 또는 주소 검색으로 주변 주차 미터를 찾고, 선택한 요일/시간 기준 요금을 비교할 수 있다.

## 현재 스택

- Next.js 16 App Router + Turbopack
- React 19
- TypeScript
- Tailwind CSS 4
- Leaflet + react-leaflet + leaflet.markercluster
- 주소 검색: OpenStreetMap Nominatim
- 데이터 소스: `parking-meters.geojson`

## 실행 기준

- 개발 서버: `npm run dev`
- 린트: `npm run lint`
- 프로덕션 빌드: `npm run build`
- 데이터 갱신: `npm run update-data`

2026-05-21 기준 확인 결과:

- `npm run build` 통과
- `npm run lint` 통과
- 로컬 GeoJSON 파일 크기: 3,671,450 bytes
- 로컬 GeoJSON feature 수: 3,949

## 실제 아키텍처

### 페이지 진입점

- [app/page.tsx](/Users/hoya/Project/AI/street_parking_price/app/page.tsx)
  - 전체 상태를 관리하는 메인 클라이언트 페이지
  - 주차 데이터 로드, 필터링, 정렬, 지도/리스트 동기화를 담당
  - `ParkingMap`은 `dynamic(..., { ssr: false })`로 CSR 전용 로드

### 핵심 상태

- `allMeters`: 원본 주차 미터 데이터
- `selectedMeter`: 지도/리스트에서 현재 선택한 미터
- `userLocation`: GPS 위치
- `mapCenter`, `mapZoom`, `zoomToMax`: 지도 이동 제어
- `selectedDay`, `selectedHour`: 사용자가 고른 요일/시간
- `maxPrice`, `creditCardOnly`, `sortOption`: 필터/정렬 상태
- `viewMode`, `isMobileMenuOpen`: 모바일 UI 상태

### 주요 컴포넌트 역할

- [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx)
  - Leaflet 지도 렌더링
  - 클러스터 생성
  - 가격 마커 생성
  - 선택된 미터로 지도 이동
  - 사용자 위치 마커 표시
- [components/ParkingList.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingList.tsx)
  - 카드형 리스트 렌더링
  - 무한 스크롤 방식으로 초기 20개부터 추가 로드
  - 상세 요금표 토글
  - Google/Apple Maps 링크 제공
- [components/FilterPanel.tsx](/Users/hoya/Project/AI/street_parking_price/components/FilterPanel.tsx)
  - 데스크톱 필터 UI
  - 요일/시간/최대요금/카드결제/정렬 제어
- [components/SearchBar.tsx](/Users/hoya/Project/AI/street_parking_price/components/SearchBar.tsx)
  - Nominatim 자동완성 검색
  - 현재 위치 버튼
  - 최신 로컬 변경으로 모바일 메뉴 닫기 콜백 지원
- [components/TimeRateInfo.tsx](/Users/hoya/Project/AI/street_parking_price/components/TimeRateInfo.tsx)
  - 요일/시간대별 상세 요금표
  - 최신 로컬 변경으로 `selectedDay`, `selectedHour`를 props로 받을 수 있음
- [contexts/LanguageContext.tsx](/Users/hoya/Project/AI/street_parking_price/contexts/LanguageContext.tsx)
  - 현재 다국어는 `ko`, `en`만 지원
  - 기본 언어는 `ko`

## 실제 동작 메모

- 데이터는 클라이언트에서 `/api/parking-meters`를 fetch한다.
- API route가 `parking-meters.geojson`을 읽어 `ParkingMeter` 형태로 정규화한다.
- 가격 필터는 사용자가 선택한 요일/시간 기준으로 동작한다.
- 리스트 카드의 표시 요금도 선택한 요일/시간 기준이다.
- 지도 마커 라벨은 선택한 요일/시간 기준으로 생성된다.
- 지도에서 마커를 누르면 리스트의 해당 카드로 스크롤한다.
- 리스트에서 카드를 누르면 지도가 해당 미터로 이동한다.
- 모바일에서는 지도/리스트 탭 전환 UI가 있고, 햄버거 메뉴 안에 모바일용 필터 UI가 따로 있다.
- 레이아웃에서 Font Awesome CDN과 Google AdSense 스크립트를 로드한다.

## 데이터 구조 핵심

- 타입 정의: [types/parking.ts](/Users/hoya/Project/AI/street_parking_price/types/parking.ts)
- 요금 필드
  - `r_mf_9a_6p`, `r_mf_6p_10`
  - `r_sa_9a_6p`, `r_sa_6p_10`
  - `r_su_9a_6p`, `r_su_6p_10`
- 시간 제한 필드
  - `t_mf_9a_6p`, `t_mf_6p_10`
  - `t_sa_9a_6p`, `t_sa_6p_10`
  - `t_su_9a_6p`, `t_su_6p_10`
- 위치 필드
  - `geo_point_2d.lat`
  - `geo_point_2d.lon`
  - `geom.geometry.coordinates`

## 중요 구현 주의점

- [lib/utils.ts](/Users/hoya/Project/AI/street_parking_price/lib/utils.ts)의 `sortParkingMeters()`는 `selectedDay`, `selectedHour`가 전달되면 선택한 요일/시간 기준으로 가격을 정렬한다.
- [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx)의 팝업 요금 표시는 지도 마커와 같은 선택 시간 기준 rate 값을 사용한다.
- 모바일 정렬 select는 `SortOption` 타입과 같은 `price-asc | price-desc | distance` 값을 사용한다.
- [components/AdBanner.tsx](/Users/hoya/Project/AI/street_parking_price/components/AdBanner.tsx)는 AdSense용으로 수정되어 있지만 현재 앱에서 실제 렌더링되는 곳은 없다.
- 기존 `docs/*.md`, `README.md`, `PROJECT_SUMMARY.md`에는 실제 구현과 다른 설명이 섞여 있다.
  - 예: 데이터 건수 7,000개 설명
  - 예: 주소 자동완성 미구현으로 적힌 문서가 있으나 실제 코드는 Nominatim 자동완성을 이미 사용 중
  - 예: 클러스터 색상 설명이 문서와 실제 구현 사이에서 다름

## 현재 로컬 변경 상태

`git status` 기준 수정 파일:

- [app/layout.tsx](/Users/hoya/Project/AI/street_parking_price/app/layout.tsx)
- [components/AdBanner.tsx](/Users/hoya/Project/AI/street_parking_price/components/AdBanner.tsx)
- [components/SearchBar.tsx](/Users/hoya/Project/AI/street_parking_price/components/SearchBar.tsx)
- [components/TimeRateInfo.tsx](/Users/hoya/Project/AI/street_parking_price/components/TimeRateInfo.tsx)

변경 방향:

- AdSense 스크립트 로드 및 광고 컴포넌트 실제화
- 검색/현재위치 액션 후 모바일 메뉴 닫기
- 상세 요금표가 선택된 요일/시간을 props로 반영

## 현재 린트 경고

- 없음.

## 다음에 바로 확인할 우선순위

1. 광고 컴포넌트를 실제 UI에 배치할지 결정할 것
2. 데이터 갱신 자동화가 필요하면 GitHub Actions 등을 추가할 것
