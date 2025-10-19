import { ParkingMeter, SortOption } from "@/types/parking";

/**
 * 요금 문자열을 숫자로 변환
 */
export const parsePrice = (priceStr: string | null): number => {
  if (!priceStr) return 0;
  const match = priceStr.match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
};

/**
 * 현재 시간에 해당하는 요금 가져오기
 */
export const getCurrentRate = (meter: ParkingMeter): string => {
  const now = new Date();
  const day = now.getDay(); // 0: 일요일, 1-5: 평일, 6: 토요일
  const hour = now.getHours();

  return getRateByDayAndHour(meter, day, hour);
};

/**
 * 특정 요일과 시간에 해당하는 요금 가져오기
 */
export const getRateByDayAndHour = (
  meter: ParkingMeter,
  day: number,
  hour: number
): string => {
  const isMorning = hour >= 9 && hour < 18; // 9am-6pm
  const isEvening = hour >= 18 && hour < 22; // 6pm-10pm

  if (day === 0) {
    // 일요일
    return isMorning
      ? meter.r_su_9a_6p || "N/A"
      : isEvening
      ? meter.r_su_6p_10 || "N/A"
      : "N/A";
  } else if (day === 6) {
    // 토요일
    return isMorning
      ? meter.r_sa_9a_6p || "N/A"
      : isEvening
      ? meter.r_sa_6p_10 || "N/A"
      : "N/A";
  } else {
    // 평일
    return isMorning
      ? meter.r_mf_9a_6p || "N/A"
      : isEvening
      ? meter.r_mf_6p_10 || "N/A"
      : "N/A";
  }
};

/**
 * 두 지점 간 거리 계산 (Haversine formula, km 단위)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * 주차 미터 정렬
 */
export const sortParkingMeters = (
  meters: ParkingMeter[],
  sortOption: SortOption,
  userLocation?: { lat: number; lon: number }
): ParkingMeter[] => {
  const sorted = [...meters];

  switch (sortOption) {
    case "price-asc":
      return sorted.sort((a, b) => {
        const priceA = parsePrice(getCurrentRate(a));
        const priceB = parsePrice(getCurrentRate(b));
        return priceA - priceB;
      });
    case "price-desc":
      return sorted.sort((a, b) => {
        const priceA = parsePrice(getCurrentRate(a));
        const priceB = parsePrice(getCurrentRate(b));
        return priceB - priceA;
      });
    case "distance":
      if (!userLocation) return sorted;
      return sorted.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          a.geo_point_2d.lat,
          a.geo_point_2d.lon
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          b.geo_point_2d.lat,
          b.geo_point_2d.lon
        );
        return distA - distB;
      });
    default:
      return sorted;
  }
};

/**
 * 지역명 목록 추출
 */
export const getUniqueAreas = (meters: ParkingMeter[]): string[] => {
  const areas = new Set(meters.map((m) => m.geo_local_area));
  return Array.from(areas).sort();
};
