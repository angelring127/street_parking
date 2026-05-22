# Vancouver Street Parking Price Finder

Vancouver 시 거리 주차 미터 정보를 지도와 리스트에서 확인할 수 있는 Next.js 애플리케이션입니다.

사용자는 현재 위치 또는 주소 검색으로 주변 주차 미터를 찾고, 선택한 요일과 시간 기준으로 요금을 비교할 수 있습니다.

## 현재 구현된 핵심 기능

- 지도 기반 주차 미터 탐색
- 리스트 기반 상세 정보 확인
- OpenStreetMap Nominatim 기반 주소 자동완성 검색
- GPS 현재 위치 이동
- 요일/시간 선택 기반 요금 표시
- 최대 요금 필터
- 신용카드 결제 가능 필터
- 가격/거리 기준 정렬
- 지도 마커 클러스터링
- Google Maps / Apple Maps 링크 제공
- 한국어 / 영어 UI 전환
- 모바일 지도/리스트 탭 전환

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Leaflet
- react-leaflet
- leaflet.markercluster

## 로컬 데이터 기준

- 런타임 데이터 파일: [parking-meters.geojson](/Users/hoya/Project/AI/street_parking_price/parking-meters.geojson)
- 현재 저장소에 포함된 GeoJSON feature 수: 3,949
- 현재 저장소에 포함된 파일 크기: 3,671,450 bytes

데이터는 갱신 시점에 따라 바뀔 수 있습니다.

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 됩니다.

## 주요 명령어

```bash
npm run dev
npm run lint
npm run build
npm run update-data
```

## 프로젝트 구조

```text
street_parking_price/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AdBanner.tsx
│   ├── FilterPanel.tsx
│   ├── ParkingList.tsx
│   ├── ParkingMap.tsx
│   ├── SearchBar.tsx
│   └── TimeRateInfo.tsx
├── contexts/
│   └── LanguageContext.tsx
├── docs/
│   ├── CLUSTERING.md
│   ├── DATA_STRUCTURE.md
│   ├── FEATURES.md
│   └── TIME_BASED_PRICING.md
├── lib/
│   └── utils.ts
├── parking-meters.geojson
├── public/
├── scripts/
│   └── update-data.sh
├── types/
│   └── parking.ts
├── PROJECT_SUMMARY.md
└── memory.md
```

## 문서

- [PROJECT_SUMMARY.md](/Users/hoya/Project/AI/street_parking_price/PROJECT_SUMMARY.md): 현재 구현 상태와 작업 메모 요약
- [docs/FEATURES.md](/Users/hoya/Project/AI/street_parking_price/docs/FEATURES.md): 사용자 기능 정리
- [docs/DATA_STRUCTURE.md](/Users/hoya/Project/AI/street_parking_price/docs/DATA_STRUCTURE.md): 데이터 구조 설명
- [docs/CLUSTERING.md](/Users/hoya/Project/AI/street_parking_price/docs/CLUSTERING.md): 지도/클러스터링 동작 설명
- [docs/TIME_BASED_PRICING.md](/Users/hoya/Project/AI/street_parking_price/docs/TIME_BASED_PRICING.md): 시간 기반 요금 로직 설명
- [memory.md](/Users/hoya/Project/AI/street_parking_price/memory.md): 실제 구현 기준의 작업용 메모

## 현재 상태 메모

- `npm run build`는 통과합니다.
- `npm run lint`는 오류 없이 통과합니다.
- Google AdSense 스크립트 로드 코드가 추가되어 있습니다.
- `AdBanner` 컴포넌트는 존재하지만 현재 메인 UI에서 실제로 렌더링되지는 않습니다.

## 데이터 출처

- Vancouver Open Data Portal
- OpenStreetMap

## 라이선스

MIT License
