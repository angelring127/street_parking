# 데이터 구조 문서

## Parking Meter 데이터 구조

Vancouver Open Data Portal에서 제공하는 주차 미터 데이터의 구조입니다.

### JSON 스키마

```typescript
interface ParkingMeter {
  meterid: string; // 미터기 고유 ID
  meterhead: string; // 미터기 타입 (예: "Pay Station", "Twin")

  // 요금 정보 (시간대별, 요일별)
  r_mf_9a_6p: string | null; // 평일 9am-6pm 요금 (예: "$2.50")
  r_mf_6p_10: string | null; // 평일 6pm-10pm 요금
  r_sa_9a_6p: string | null; // 토요일 9am-6pm 요금
  r_sa_6p_10: string | null; // 토요일 6pm-10pm 요금
  r_su_9a_6p: string | null; // 일요일 9am-6pm 요금
  r_su_6p_10: string | null; // 일요일 6pm-10pm 요금
  rate_misc: string | null; // 기타 요금 정보

  // 시간 제한 정보
  t_mf_9a_6p: string | null; // 평일 9am-6pm 시간 제한 (예: "2 Hr")
  t_mf_6p_10: string | null; // 평일 6pm-10pm 시간 제한
  t_sa_9a_6p: string | null; // 토요일 9am-6pm 시간 제한
  t_sa_6p_10: string | null; // 토요일 6pm-10pm 시간 제한
  t_su_9a_6p: string | null; // 일요일 9am-6pm 시간 제한
  t_su_6p_10: string | null; // 일요일 6pm-10pm 시간 제한
  time_misc: string | null; // 기타 시간 정보
  timeineffe: string | null; // 운영 시간 전체 설명

  // 결제 정보
  creditcard: string | null; // 신용카드 사용 가능 여부 ("Yes"/"No")
  pay_phone: string | null; // 결제 전화번호

  // 위치 정보
  geo_local_area: string; // 지역명 (예: "Downtown", "Kitsilano")
  geo_point_2d: {
    lon: number; // 경도
    lat: number; // 위도
  };
  geom: {
    // GeoJSON 형식 위치 정보
    type: string;
    geometry: {
      coordinates: [number, number]; // [경도, 위도]
      type: string;
    };
    properties: Record<string, unknown>;
  };
}
```

### 실제 데이터 예시

```json
{
  "meterid": "591124",
  "meterhead": "Pay Station",
  "r_mf_9a_6p": "$2.50",
  "r_mf_6p_10": "$2.00",
  "r_sa_9a_6p": "$2.50",
  "r_sa_6p_10": "$2.00",
  "r_su_9a_6p": "$2.50",
  "r_su_6p_10": "$2.00",
  "rate_misc": null,
  "timeineffe": "METER IN EFFECT: 9:00 AM TO 10:00 PM",
  "t_mf_9a_6p": "3 Hr",
  "t_mf_6p_10": "4 Hr",
  "t_sa_9a_6p": "3 Hr",
  "t_sa_6p_10": "4 Hr",
  "t_su_9a_6p": "3 Hr",
  "t_su_6p_10": "4 Hr",
  "time_misc": null,
  "creditcard": "Yes",
  "pay_phone": "67208",
  "geo_local_area": "Downtown",
  "geo_point_2d": {
    "lon": -123.12342364855705,
    "lat": 49.27632478331332
  },
  "geom": {
    "type": "Feature",
    "geometry": {
      "coordinates": [-123.12342364855705, 49.27632478331332],
      "type": "Point"
    },
    "properties": {}
  }
}
```

## 데이터 소스

- **URL**: https://opendata.vancouver.ca/explore/dataset/parking-meters
- **API Endpoint**: https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/exports/json
- **업데이트 주기**: 주간 (Vancouver Open Data Portal)
- **라이선스**: Open Government License - Vancouver
- **총 레코드 수**: 약 7,000개 (2025년 기준)

## 지역 목록

주요 지역:

- Downtown
- West End
- Kitsilano
- Mount Pleasant
- Fairview
- Strathcona
- Grandview-Woodland
- Commercial Drive
- Kerrisdale
- 기타 Vancouver 전역

## 요금 범위

- **최저 요금**: $0.50/시간
- **최고 요금**: $6.00/시간
- **평균 요금**: $2.00-$3.00/시간

## 시간 제한

- **최소**: 1시간
- **최대**: 10시간
- **일반적**: 2-4시간

## 데이터 주의사항

1. **블록 단위 정보**: 데이터는 블록 단위로 표시되며, 블록 전체에 미터기가 있는 것은 아님
2. **정확도**: 시스템 업데이트 속도에 따라 실제와 차이가 있을 수 있음
3. **Null 값**: 일부 필드가 null일 수 있음 (특별 요금대, 특별 시간대 등)
4. **최신성**: 주간 업데이트이므로 최신 정보와 다를 수 있음

## 향후 데이터 개선 사항

- [ ] 실시간 주차 가능 여부
- [ ] 주차장 리뷰 및 평점
- [ ] 교통 체증 정보 연계
- [ ] 이벤트 기반 요금 변동
- [ ] 예약 시스템 통합
