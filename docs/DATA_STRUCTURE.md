# 데이터 구조

## 데이터 파일

- 원본 경로: [parking-meters.geojson](/Users/hoya/Project/AI/street_parking_price/parking-meters.geojson)
- API 경로: `/api/parking-meters`
- 현재 저장소 기준 GeoJSON feature 수: 3,949
- 현재 저장소 기준 파일 크기: 3,671,450 bytes

데이터 수치는 갱신 시점에 따라 바뀔 수 있습니다.

## 타입 정의

실제 TypeScript 타입은 [types/parking.ts](/Users/hoya/Project/AI/street_parking_price/types/parking.ts)에 있습니다.

```ts
export interface ParkingMeter {
  meterid: string;
  meterhead: string;
  r_mf_9a_6p: string | null;
  r_mf_6p_10: string | null;
  r_sa_9a_6p: string | null;
  r_sa_6p_10: string | null;
  r_su_9a_6p: string | null;
  r_su_6p_10: string | null;
  rate_misc: string | null;
  timeineffe: string | null;
  t_mf_9a_6p: string | null;
  t_mf_6p_10: string | null;
  t_sa_9a_6p: string | null;
  t_sa_6p_10: string | null;
  t_su_9a_6p: string | null;
  t_su_6p_10: string | null;
  time_misc: string | null;
  creditcard: string | null;
  pay_phone: string | null;
  geom: {
    type: string;
    geometry: {
      coordinates: [number, number];
      type: string;
    };
    properties: Record<string, unknown>;
  };
  geo_local_area: string;
  geo_point_2d: {
    lon: number;
    lat: number;
  };
  sector?: number | null;
  direction?: string | null;
}
```

## 필드 설명

### 기본 식별 정보

- `meterid`: 미터 고유 ID
- `meterhead`: 미터 타입 또는 표기명
- `geo_local_area`: 지역명

### 요금 필드

- `r_mf_9a_6p`: 평일 9am-6pm 요금
- `r_mf_6p_10`: 평일 6pm-10pm 요금
- `r_sa_9a_6p`: 토요일 9am-6pm 요금
- `r_sa_6p_10`: 토요일 6pm-10pm 요금
- `r_su_9a_6p`: 일요일 9am-6pm 요금
- `r_su_6p_10`: 일요일 6pm-10pm 요금
- `rate_misc`: 기타 요금 메모

### 제한 시간 필드

- `t_mf_9a_6p`
- `t_mf_6p_10`
- `t_sa_9a_6p`
- `t_sa_6p_10`
- `t_su_9a_6p`
- `t_su_6p_10`
- `time_misc`

### 운영 시간 필드

- `timeineffe`: 전체 운영 시간 설명 문자열

예시:

- `: 9:00 AM TO 10:00 PM`
- `METER IN EFFECT: 9:00 AM TO 10:00 PM`

현재 UI는 정규식으로 시간 범위만 추출해서 보여줍니다.

### 결제 필드

- `creditcard`: `"Yes"` 또는 그 외 값
- `pay_phone`: 전화 결제 관련 문자열

### 위치 필드

- `geo_point_2d.lat`
- `geo_point_2d.lon`
- `geom.geometry.coordinates`
- `sector`
- `direction`

`geo_point_2d`가 화면 렌더링과 거리 계산에서 직접 사용됩니다.
`sector`와 `direction`은 지도에서 같은 블록의 미터를 묶어 표시할 때 사용됩니다.

## 실제 코드에서의 사용 위치

- [app/page.tsx](/Users/hoya/Project/AI/street_parking_price/app/page.tsx): 데이터 fetch, 필터링, 정렬
- [components/ParkingMap.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingMap.tsx): 마커 위치와 팝업 정보
- [components/ParkingList.tsx](/Users/hoya/Project/AI/street_parking_price/components/ParkingList.tsx): 카드 렌더링
- [components/TimeRateInfo.tsx](/Users/hoya/Project/AI/street_parking_price/components/TimeRateInfo.tsx): 시간대별 요금표
- [lib/utils.ts](/Users/hoya/Project/AI/street_parking_price/lib/utils.ts): 요금 파싱, 거리 계산, 정렬

## 데이터 갱신

- 스크립트: [scripts/update-data.sh](/Users/hoya/Project/AI/street_parking_price/scripts/update-data.sh)
- 실행 명령: `npm run update-data`

이 스크립트는 Vancouver Open Data Portal export endpoint에서 GeoJSON을 다시 내려받아 앱이 실제로 읽는 [parking-meters.geojson](/Users/hoya/Project/AI/street_parking_price/parking-meters.geojson)을 갱신합니다.

## 데이터 사용 시 주의점

- 일부 요금 필드는 `null`일 수 있습니다.
- `parsePrice()`는 숫자만 추출해 비교하므로 `"N/A"`는 `0`으로 처리됩니다.
- 운영 시간은 필드마다 일관된 형식이 아닐 수 있어 현재 UI에서 보수적으로 파싱합니다.
- 좌표가 잘못된 레코드는 지도/리스트 렌더링에서 건너뜁니다.
