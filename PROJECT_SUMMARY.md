# Project Summary

Last updated: 2026-03-25

## 프로젝트 개요

이 프로젝트는 Vancouver 시의 거리 주차 미터 데이터를 지도와 리스트로 탐색할 수 있게 만든 클라이언트 중심 웹 앱입니다.

핵심 사용자 흐름은 다음과 같습니다.

1. 주소 또는 현재 위치로 원하는 지역을 찾는다.
2. 요일과 시간을 선택해 해당 시점의 요금을 본다.
3. 지도와 리스트에서 주차 미터를 비교한다.
4. Google Maps 또는 Apple Maps로 이동한다.

## 현재 구현 상태

### 사용자 기능

- 주소 자동완성 검색
- 현재 위치 기반 탐색
- 지도/리스트 동기화
- 요일/시간 선택 기반 요금 표시
- 시간대별 상세 요금표
- 최대 요금 필터
- 신용카드 가능 여부 필터
- 가격/거리 정렬
- 지도 마커 클러스터링
- 모바일 지도/리스트 탭 전환
- 한국어/영어 전환

### 기술 상태

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Leaflet + react-leaflet + leaflet.markercluster
- 정적 데이터 파일 기반 동작

### 검증 상태

- `npm run build` 통과
- `npm run lint` 통과

## 실제 코드 구조

### 메인 페이지

- [app/page.tsx](/Users/hoya/Project/AI/street_parking_price/app/page.tsx)
  - 전체 UI 상태를 관리
  - 데이터 로드
  - 필터링/정렬
  - 모바일/데스크톱 레이아웃 분기

### 지도

- [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx)
  - Leaflet 지도 생성
  - 가격 마커 생성
  - 마커 클러스터 구성
  - 선택된 미터로 지도 이동
  - 사용자 위치 마커 표시

### 리스트

- [components/ParkingList.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingList.tsx)
  - 카드형 리스트 렌더링
  - 무한 스크롤 방식으로 초기 20개부터 렌더링
  - 상세 요금표 토글
  - 내비게이션 링크 표시

### 필터 및 검색

- [components/FilterPanel.tsx](/Users/hoya/Project/AI/street_parking_price/components/FilterPanel.tsx)
- [components/SearchBar.tsx](/Users/hoya/Project/AI/street_parking_price/components/SearchBar.tsx)

### 다국어

- [contexts/LanguageContext.tsx](/Users/hoya/Project/AI/street_parking_price/contexts/LanguageContext.tsx)

### 유틸리티 및 타입

- [lib/utils.ts](/Users/hoya/Project/AI/street_parking_price/lib/utils.ts)
- [types/parking.ts](/Users/hoya/Project/AI/street_parking_price/types/parking.ts)

## 데이터 현황

- 런타임 데이터 파일: [parking-meters.geojson](/Users/hoya/Project/AI/street_parking_price/parking-meters.geojson)
- 현재 저장소 스냅샷 GeoJSON feature 수: 3,949
- 현재 저장소 스냅샷 파일 크기: 3,671,450 bytes
- 갱신 스크립트: [scripts/update-data.sh](/Users/hoya/Project/AI/street_parking_price/scripts/update-data.sh)

데이터 수치는 고정값이 아니라 현재 저장소에 포함된 스냅샷 기준입니다.

## 현재 로컬 변경 사항

`git status` 기준으로 다음 파일들에 로컬 수정이 존재합니다.

- [app/layout.tsx](/Users/hoya/Project/AI/street_parking_price/app/layout.tsx)
- [components/AdBanner.tsx](/Users/hoya/Project/AI/street_parking_price/components/AdBanner.tsx)
- [components/SearchBar.tsx](/Users/hoya/Project/AI/street_parking_price/components/SearchBar.tsx)
- [components/TimeRateInfo.tsx](/Users/hoya/Project/AI/street_parking_price/components/TimeRateInfo.tsx)

수정 방향은 다음과 같습니다.

- AdSense 스크립트 로드
- AdSense 광고 컴포넌트 준비
- 모바일 메뉴 닫기 동작 보완
- 상세 요금표가 선택된 요일/시간을 받도록 변경

## 알려진 구현 차이와 주의점

### 1. AdBanner 미사용

[components/AdBanner.tsx](/Users/hoya/Project/AI/street_parking_price/components/AdBanner.tsx)는 존재하지만 메인 페이지에 아직 실제 배치되지 않았습니다.

### 2. 데이터 구조 변환

앱은 `/api/parking-meters`에서 [parking-meters.geojson](/Users/hoya/Project/AI/street_parking_price/parking-meters.geojson)을 `ParkingMeter` 형태로 정규화해서 사용합니다.

## 다음 작업 우선순위

1. 광고 컴포넌트를 실제 UI에 배치할지 결정할 것
2. 데이터 갱신 자동화가 필요하면 GitHub Actions 등을 추가할 것
