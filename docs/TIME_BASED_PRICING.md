# 시간 기반 요금 로직

## 기준 로직

시간 기반 요금 계산은 [lib/utils.ts](/Users/hoya/Project/AI/street_parking_price/lib/utils.ts)의 `getRateByDayAndHour()`를 중심으로 동작합니다.

```ts
const isMorning = hour >= 9 && hour < 18;
const isEvening = hour >= 18 && hour < 22;
```

적용 규칙:

- 일요일: `r_su_*`
- 토요일: `r_sa_*`
- 그 외: `r_mf_*`
- 오전 외 저녁 외 시간대는 `"N/A"`

## 현재 시간대 구분

- 09:00 ~ 17:59: 오전 요금
- 18:00 ~ 21:59: 저녁 요금
- 22:00 ~ 08:59: `"N/A"`

## 실제 UI 반영 위치

### 리스트 카드

- [components/ParkingList.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingList.tsx)
- 카드 상단의 큰 가격 텍스트는 `selectedDay`, `selectedHour` 기준

### 상세 요금표

- [components/TimeRateInfo.tsx](/Users/hoya/Project/AI/street_parking_price/components/TimeRateInfo.tsx)
- 현재 로컬 코드 기준으로 `selectedDay`, `selectedHour` props를 받을 수 있음
- 해당 시간대는 초록색 강조와 "현재" 배지로 표시

### 지도 마커

- [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx)
- 가격 마커 라벨은 선택된 요일/시간 기준 요금을 사용

## 현재 구현과 문서에서 주의할 점

### 가격 정렬

[lib/utils.ts](/Users/hoya/Project/AI/street_parking_price/lib/utils.ts)의 `sortParkingMeters()`는 `selectedDay`, `selectedHour`가 전달되면 선택된 요일/시간 기준으로 가격을 정렬합니다.

현재 기준:

- 가격 필터: 사용자가 선택한 요일/시간 기준
- 리스트/지도 마커: 사용자가 선택한 요일/시간 기준
- 가격 정렬: 사용자가 선택한 요일/시간 기준

선택 시간이 전달되지 않는 호출에서는 실제 현재 시각 기준 요금을 fallback으로 사용합니다.

### 지도 팝업 요금

[components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx) 팝업의 요금도 지도 마커와 같은 그룹 rate 값을 사용하므로 선택된 요일/시간 기준과 일치합니다.

## 시간 제한 표시

상세 요금표는 각 시간대별 시간 제한도 함께 보여줍니다.

예:

- `t_mf_9a_6p`
- `t_mf_6p_10`
- `t_sa_9a_6p`
- `t_sa_6p_10`
- `t_su_9a_6p`
- `t_su_6p_10`

## 운영 시간 표시

전체 운영 시간은 `timeineffe`에서 가져오고, UI에서는 보통 `9:00 AM TO 10:00 PM` 같은 구간만 추출해서 보여줍니다.

## 관련 파일

- [lib/utils.ts](/Users/hoya/Project/AI/street_parking_price/lib/utils.ts)
- [components/ParkingList.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingList.tsx)
- [components/TimeRateInfo.tsx](/Users/hoya/Project/AI/street_parking_price/components/TimeRateInfo.tsx)
- [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx)
