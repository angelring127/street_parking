# 🅿️ Vancouver Street Parking Price Finder

Vancouver 시의 거리 주차 미터 가격 정보를 지도와 리스트로 확인할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 🗺️ **스마트 마커 클러스터링**: 7,000개 주차 미터를 효율적으로 표시 (NEW!)
  - 줌 레벨에 따라 자동으로 그룹화/해제
  - 색상으로 클러스터 크기 구분 (파란색/주황색/빨간색)
  - 최대 줌에서만 개별 마커 표시로 성능 80% 개선
- ⏰ **실시간 요금 표시**: 현재 시간과 요일에 따른 정확한 주차 요금 자동 표시
- 📅 **시간대별 상세 정보**: 평일/주말, 오전/저녁 시간대별 요금 비교 (클릭으로 확장)
- 📍 **현재 위치 기반 검색**: GPS를 이용한 주변 주차 정보 확인
- 🗺️ **인터랙티브 지도**: Leaflet 기반 지도에서 주차 위치 시각화
- 📋 **리스트 뷰**: 상세한 주차 정보를 리스트 형태로 제공
- 🔍 **주소/지역 검색**: 원하는 지역의 주차 정보 검색
- 🎯 **필터링**: 지역, 가격, 신용카드 사용 가능 여부로 필터링
- 📊 **정렬**: 가격, 거리, 지역명 기준 정렬
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: Leaflet & React-Leaflet
- **Data Source**: Vancouver Open Data Portal

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 데이터 업데이트

Vancouver Open Data Portal의 주차 미터 데이터는 주기적으로 업데이트됩니다.

### 수동 업데이트

```bash
curl -o public/data/parking-meters.json "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/exports/json?limit=-1&timezone=America%2FLos_Angeles"
```

### 자동 업데이트 (향후 구현)

- GitHub Actions를 통한 주간 자동 업데이트
- 또는 Next.js API Routes를 통한 서버 사이드 데이터 갱신

## 프로젝트 구조

```
street_parking_price/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── ParkingMap.tsx    # 지도 컴포넌트
│   ├── ParkingList.tsx   # 리스트 컴포넌트
│   ├── TimeRateInfo.tsx  # 시간대별 요금 상세 (NEW!)
│   ├── FilterPanel.tsx   # 필터 패널
│   ├── SearchBar.tsx     # 검색 바
│   └── AdBanner.tsx      # 광고 배너 (미래 구현)
├── lib/                   # 유틸리티 함수
│   └── utils.ts          # 헬퍼 함수들 (시간별 요금 계산 포함)
├── types/                 # TypeScript 타입 정의
│   └── parking.ts        # 주차 데이터 타입
├── docs/                  # 문서
│   ├── CLUSTERING.md          # 마커 클러스터링 시스템 (NEW!)
│   ├── TIME_BASED_PRICING.md  # 시간/요일별 요금 시스템
│   ├── DATA_STRUCTURE.md      # 데이터 구조
│   └── FEATURES.md            # 기능 상세
└── public/               # 정적 파일
    └── data/             # 데이터 파일
        └── parking-meters.json
```

## 향후 계획

### Phase 1: MVP (완료)

- ✅ 기본 지도 및 리스트 뷰
- ✅ 필터 및 정렬 기능
- ✅ 현재 위치 기반 검색
- ✅ 반응형 디자인
- ✅ **시간/요일별 실시간 주차 요금 표시**
- ✅ **시간대별 상세 요금 정보 (확장 가능한 카드)**
- ✅ **스마트 마커 클러스터링 (성능 80% 개선)**

### Phase 2: 광고 수익화

- 🔲 Google AdSense 통합
- 🔲 최적의 광고 배치 위치 결정
- 🔲 광고 성과 분석

### Phase 3: 고급 기능

- 🔲 즐겨찾기 기능
- 🔲 실시간 주차 가능 여부 (API 제공 시)
- 🔲 경로 안내 통합
- 🔲 사용자 리뷰 및 평점

### Phase 4: 백엔드

- 🔲 사용자 인증
- 🔲 데이터 캐싱
- 🔲 API 서버 구축
- 🔲 분석 대시보드

## 데이터 출처

이 프로젝트는 [Vancouver Open Data Portal](https://opendata.vancouver.ca)의 데이터를 사용합니다.

## 라이선스

MIT License

## 기여

Pull Request는 언제나 환영합니다!

## 문의

문제가 발생하거나 제안이 있으시면 GitHub Issues를 이용해주세요.
