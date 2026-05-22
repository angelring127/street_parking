# 지도와 클러스터링

## 개요

이 프로젝트는 [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx)에서 Leaflet과 `leaflet.markercluster`를 사용해 주차 미터를 렌더링합니다.

## 현재 구현 방식

### 가격 마커

- 개별 미터는 텍스트가 들어간 `divIcon`으로 표시됩니다.
- 마커 텍스트는 현재 선택된 요일/시간 기준 요금을 사용합니다.
- 색상 기준은 가격 숫자를 파싱해서 결정합니다.

현재 기준:

- `$0.00` 이상 ~ `$2.99`: 초록
- `$3.00` 이상 ~ `$3.99`: 주황
- `$4.00` 이상: 빨강

### 클러스터 아이콘

- 클러스터 색상은 클러스터 안에 들어 있는 마커들의 평균 가격 기준입니다.
- 클러스터 아이콘은 `40px x 40px` 원형으로 렌더링됩니다.
- 아이콘 안에는 포함된 마커 개수만 표시됩니다.

### 클러스터 해제 줌

- `disableClusteringAtZoom: 16`
- 즉, 줌 레벨 16 이상에서는 개별 마커 중심으로 보이게 됩니다.

## 현재 주요 옵션

```ts
L.markerClusterGroup({
  disableClusteringAtZoom: 16,
  maxClusterRadius: 80,
  spiderfyOnMaxZoom: false,
  spiderfyOnEveryZoom: false,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
});
```

## 지도 상호작용

### 마커 클릭

- `onMeterClick` 콜백 호출
- 상위 컴포넌트에서 선택된 미터 상태 갱신
- 리스트 쪽 스크롤 동기화
- 선택된 미터에 대해 팝업 열기 시도

### 리스트 클릭

- 리스트 카드 클릭 시 지도 중심 이동
- 일부 흐름에서는 `zoomToMax`를 사용해 줌 18로 이동

### 현재 위치

- 사용자 위치가 있으면 별도 파란색 원형 마커를 표시합니다.

## 현재 구현 주의점

### 팝업 요금과 마커 라벨 불일치

마커 라벨은 선택된 요일/시간 기준이지만, 팝업 내부의 "현재 요금" 텍스트는 `getCurrentRate()`를 사용합니다.

즉, 사용자가 다른 시간대를 선택한 경우 마커 표기와 팝업 텍스트가 다를 수 있습니다.

### CSS 문서화 차이

[app/globals.css](/Users/hoya/Project/AI/street_parking_price/app/globals.css)에 클러스터 관련 CSS가 있지만, 실제 클러스터 색상은 `iconCreateFunction` 내부의 inline style이 결정합니다.

그래서 오래된 문서처럼 small / medium / large 클래스 기준으로 설명하면 현재 코드와 다릅니다.

## 관련 파일

- [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx)
- [app/globals.css](/Users/hoya/Project/AI/street_parking_price/app/globals.css)
- [lib/utils.ts](/Users/hoya/Project/AI/street_parking_price/lib/utils.ts)
