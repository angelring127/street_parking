# 배포 가이드

## 현재 배포 대상

이 프로젝트는 정적 데이터 파일과 클라이언트 중심 UI를 사용하는 Next.js 앱이므로 Vercel 배포가 가장 단순합니다.

## 권장 배포 절차

### 1. 의존성 설치

```bash
npm install
```

### 2. 로컬 검증

```bash
npm run lint
npm run build
```

### 3. Vercel 배포

1. GitHub 저장소에 푸시
2. Vercel에서 Import
3. 기본 설정으로 배포

현재 코드 기준으로 필수 환경 변수는 없습니다.

## 데이터 갱신 방식

### 수동 갱신

```bash
npm run update-data
git add parking-meters.geojson
git commit -m "Update parking meter data"
git push
```

### 자동 갱신

필요하면 GitHub Actions로 `npm run update-data`를 주기 실행할 수 있습니다.

## AdSense 관련 메모

- [app/layout.tsx](/Users/hoya/Project/AI/street_parking_price/app/layout.tsx)에 AdSense 스크립트 로드 코드가 들어 있습니다.
- [components/AdBanner.tsx](/Users/hoya/Project/AI/street_parking_price/components/AdBanner.tsx)도 준비되어 있습니다.
- 하지만 현재 메인 화면에는 실제 광고 컴포넌트가 배치되어 있지 않습니다.

즉, 스크립트는 로드되지만 광고 노출 구조는 아직 완성되지 않았습니다.

## 확인 포인트

### 빌드 관련

- `npm run build`는 현재 통과합니다.
- `npm run lint`도 오류 없이 통과합니다.

### 지도 관련

- Leaflet CSS는 [app/globals.css](/Users/hoya/Project/AI/street_parking_price/app/globals.css)에서 import 됩니다.
- 지도 컴포넌트는 SSR이 아닌 CSR로 로드됩니다.

### 데이터 관련

- 배포 결과는 저장소에 포함된 `parking-meters.geojson` 스냅샷을 `/api/parking-meters`에서 정규화해 사용합니다.
- 데이터 최신성이 중요하면 배포 전 `npm run update-data` 실행 여부를 확인해야 합니다.

## 문제 해결

### 데이터가 오래된 경우

`npm run update-data`를 실행한 뒤 다시 배포합니다.

### 지도가 안 보이는 경우

- 브라우저 콘솔 에러 확인
- Leaflet CSS import 누락 여부 확인
- `ParkingMap`의 클라이언트 렌더링 경로 확인

### 광고가 안 보이는 경우

- 현재 실제 화면에 `AdBanner`가 배치되어 있는지 먼저 확인
- AdSense 승인 상태 확인
- 브라우저 확장 프로그램에 의한 차단 여부 확인
