// 主차 미터 데이터 타입 정의
export interface ParkingMeter {
  meterid: string;
  meterhead: string;
  r_mf_9a_6p: string | null; // 평일 9am-6pm 요금
  r_mf_6p_10: string | null; // 평일 6pm-10pm 요금
  r_sa_9a_6p: string | null; // 토요일 9am-6pm 요금
  r_sa_6p_10: string | null; // 토요일 6pm-10pm 요금
  r_su_9a_6p: string | null; // 일요일 9am-6pm 요금
  r_su_6p_10: string | null; // 일요일 6pm-10pm 요금
  rate_misc: string | null;
  timeineffe: string | null; // 운영 시간
  t_mf_9a_6p: string | null; // 평일 9am-6pm 시간 제한
  t_mf_6p_10: string | null; // 평일 6pm-10pm 시간 제한
  t_sa_9a_6p: string | null; // 토요일 9am-6pm 시간 제한
  t_sa_6p_10: string | null; // 토요일 6pm-10pm 시간 제한
  t_su_9a_6p: string | null; // 일요일 9am-6pm 시간 제한
  t_su_6p_10: string | null; // 일요일 6pm-10pm 시간 제한
  time_misc: string | null;
  creditcard: string | null; // 신용카드 가능 여부
  pay_phone: string | null;
  geom: {
    type: string;
    geometry: {
      coordinates: [number, number];
      type: string;
    };
    properties: Record<string, unknown>;
  };
  geo_local_area: string; // 지역명
  geo_point_2d: {
    lon: number;
    lat: number;
  };
}

// 필터 타입
export interface FilterOptions {
  area: string;
  maxPrice: number;
  creditCardOnly: boolean;
  timeOfDay: "morning" | "evening" | "all";
}

// 정렬 옵션
export type SortOption = "price-asc" | "price-desc" | "distance";
