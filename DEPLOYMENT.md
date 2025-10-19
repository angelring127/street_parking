# 배포 가이드

## Vercel 배포 (권장)

### 1. Vercel 계정 생성

[Vercel](https://vercel.com)에서 계정을 만드세요.

### 2. GitHub 저장소 연결

1. GitHub에 프로젝트를 푸시합니다
2. Vercel 대시보드에서 "New Project" 클릭
3. GitHub 저장소를 선택하고 Import

### 3. 환경 변수 설정 (선택사항)

광고 통합 시 필요한 환경 변수:

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Google AdSense 클라이언트 ID

### 4. 배포

Vercel이 자동으로 빌드하고 배포합니다.

## 데이터 업데이트 전략

### 방법 1: 수동 업데이트

```bash
npm run update-data
git add public/data/parking-meters.json
git commit -m "Update parking data"
git push
```

### 방법 2: GitHub Actions (자동)

`.github/workflows/update-data.yml` 파일을 생성:

```yaml
name: Update Parking Data

on:
  schedule:
    - cron: "0 0 * * 0" # 매주 일요일 자정
  workflow_dispatch: # 수동 실행 가능

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Download data
        run: npm run update-data

      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/data/parking-meters.json
          git diff --quiet && git diff --staged --quiet || git commit -m "🔄 Update parking data [automated]"
          git push
```

### 방법 3: API Routes (향후)

Next.js API Routes를 이용한 서버 사이드 데이터 갱신

- 캐싱 전략 사용
- Redis 또는 Vercel KV 활용

## 성능 최적화

### 1. 이미지 최적화

- Vercel은 자동으로 이미지를 최적화합니다

### 2. 데이터 크기 최적화

- GeoJSON 대신 간소화된 JSON 사용
- 필요한 필드만 포함

### 3. 캐싱

- Static Generation 활용
- ISR (Incremental Static Regeneration) 고려

## Google AdSense 통합

### 1. AdSense 계정 승인

1. [Google AdSense](https://www.google.com/adsense) 계정 생성
2. 사이트 추가 및 승인 대기 (1-2주 소요 가능)

### 2. 광고 코드 추가

1. `app/layout.tsx`에 AdSense 스크립트 추가:

```typescript
<head>
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
    crossOrigin="anonymous"
  />
</head>
```

2. `components/AdBanner.tsx` 주석 해제 및 설정

### 3. 광고 배치 최적화

- 헤더 상단: 리더보드 (728x90)
- 사이드바: 중형 직사각형 (300x250)
- 콘텐츠 중간: 인피드 광고
- 푸터: 와이드 스카이스크래퍼

## 모니터링

### Vercel Analytics

무료 프로젝트에도 기본 분석 제공:

- 페이지 뷰
- 사용자 통계
- Core Web Vitals

### Google Analytics (선택사항)

더 상세한 분석을 원한다면:

1. Google Analytics 4 속성 생성
2. `next-google-analytics` 패키지 설치
3. 환경 변수에 Measurement ID 추가

## 문제 해결

### 빌드 실패

- Node.js 버전 확인 (18 이상 권장)
- `package-lock.json` 삭제 후 재설치

### 지도가 표시되지 않음

- Leaflet CSS가 제대로 로드되었는지 확인
- 브라우저 콘솔에서 에러 확인

### 데이터가 로드되지 않음

- `public/data/parking-meters.json` 파일 존재 확인
- 파일 크기 확인 (너무 크면 로딩 시간 증가)

## 라이선스 및 크레딧

- 데이터: [Vancouver Open Data Portal](https://opendata.vancouver.ca)
- 지도: [OpenStreetMap](https://www.openstreetmap.org)
- 아이콘: [Leaflet](https://leafletjs.com)
