"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ko: {
    // Header
    "header.title": "Vancouver Street parking",
    "header.subtitle": "현재 위치 또는 주소 검색으로 주차 정보를 확인하세요",
    "header.menu": "메뉴",

    // Search
    "search.title": "주소 검색",
    "search.placeholder": "주소 또는 장소 검색... (예: Robson Street)",
    "search.currentLocation": "내 위치",
    "search.currentLocationTitle": "현재 위치로 이동",
    "search.loading": "현재 위치를 가져오는 중...",
    "search.apiInfo": "💡 OpenStreetMap 기반 무료 주소 검색 (API 키 불필요)",

    // Location errors
    "location.browserNotSupported":
      "이 브라우저는 위치 정보를 지원하지 않습니다.",
    "location.permissionDenied":
      "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.",
    "location.unavailable": "위치 정보를 사용할 수 없습니다.",
    "location.timeout": "위치 요청 시간이 초과되었습니다.",
    "location.generalError": "현재 위치를 가져올 수 없습니다.",

    // Map/List tabs
    "tabs.map": "지도",
    "tabs.list": "리스트",

    // Parking info
    "parking.totalMeters": "📊 총 {count}개의 주차 미터",
    "parking.area": "지역",
    "parking.currentRate": "현재 요금",
    "parking.operatingHours": "운영 시간",
    "parking.creditCard": "신용카드",
    "parking.creditCardYes": "가능",
    "parking.creditCardNo": "불가",
    "parking.googleMaps": "Google Maps",
    "parking.appleMaps": "Apple Maps",

    // Footer
    "footer.dataSource": "데이터 출처:",
    "footer.copyright": "© 2025 Vancouver Street Parking Info",

    // ParkingList
    "list.noResults": "조건에 맞는 주차 정보가 없습니다.",
    "list.selectedTimeRate": "선택한 시간 요금",
    "list.operatingHours": "운영 시간:",
    "list.creditCard": "신용카드:",
    "list.creditCardYes": "✅ 가능",
    "list.creditCardNo": "❌ 불가",
    "list.googleMaps": "Google",
    "list.appleMaps": "Apple",
    "list.goToMap": "지도에서 보기",
    "list.showDetails": "🔽 시간대별 요금 상세 보기",
    "list.hideDetails": "🔼 상세 정보 닫기",

    // FilterPanel
    "filter.title": "필터 & 정렬",
    "filter.day": "요일:",
    "filter.hour": "시간:",
    "filter.setCurrentTime": "🕐 현재 날짜/시간으로 설정",
    "filter.maxPrice": "최대 요금:",
    "filter.creditCardOnly": "신용카드 가능한 곳만",
    "filter.sortBy": "정렬 기준:",
    "filter.sort": "정렬",
    "filter.sortPriceAsc": "가격 낮은 순",
    "filter.sortPriceDesc": "가격 높은 순",
    "filter.sortDistance": "거리 가까운 순",
    "filter.sort.priceAsc": "가격 낮은 순",
    "filter.sort.priceDesc": "가격 높은 순",
    "filter.sort.distanceAsc": "거리 가까운 순",
    "filter.sort.distanceDesc": "거리 먼 순",
    "filter.days.sunday": "일요일",
    "filter.days.monday": "월요일",
    "filter.days.tuesday": "화요일",
    "filter.days.wednesday": "수요일",
    "filter.days.thursday": "목요일",
    "filter.days.friday": "금요일",
    "filter.days.saturday": "토요일",

    // TimeRateInfo
    "timeRate.title": "📋 시간대별 요금표",
    "timeRate.closed": "⏰ 현재 주차 미터 미운영 시간입니다",
    "timeRate.operatingHours": "운영 시간: 9:00 AM - 10:00 PM",
    "timeRate.current": "현재",
    "timeRate.weekdayMorning": "평일 오전",
    "timeRate.weekdayEvening": "평일 저녁",
    "timeRate.saturdayMorning": "토요일 오전",
    "timeRate.saturdayEvening": "토요일 저녁",
    "timeRate.sundayMorning": "일요일 오전",
    "timeRate.sundayEvening": "일요일 저녁",

    // Map loading
    "map.loading": "지도 로딩 중...",
    "map.clusterInfo": "💡 클러스터 색상은 평균 가격을 나타냅니다",
    "map.clusterGreen": "초록: $3 미만",
    "map.clusterOrange": "주황: $3-4",
    "map.clusterRed": "빨강: $4 이상",
  },
  en: {
    // Header
    "header.title": "Vancouver Street parking",
    "header.subtitle":
      "Find parking information by current location or address search",
    "header.menu": "Menu",

    // Search
    "search.title": "Address Search",
    "search.placeholder": "Search address or place... (e.g. Robson Street)",
    "search.currentLocation": "My Location",
    "search.currentLocationTitle": "Move to current location",
    "search.loading": "Getting current location...",
    "search.apiInfo":
      "💡 Free address search based on OpenStreetMap (No API key required)",

    // Location errors
    "location.browserNotSupported":
      "This browser does not support location services.",
    "location.permissionDenied":
      "Location permission denied. Please allow location access in browser settings.",
    "location.unavailable": "Location information is not available.",
    "location.timeout": "Location request timed out.",
    "location.generalError": "Unable to get current location.",

    // Map/List tabs
    "tabs.map": "Map",
    "tabs.list": "List",

    // Parking info
    "parking.totalMeters": "📊 Total {count} parking meters",
    "parking.area": "Area",
    "parking.currentRate": "Current Rate",
    "parking.operatingHours": "Operating Hours",
    "parking.creditCard": "Credit Card",
    "parking.creditCardYes": "Available",
    "parking.creditCardNo": "Not Available",
    "parking.googleMaps": "Google Maps",
    "parking.appleMaps": "Apple Maps",

    // Footer
    "footer.dataSource": "Data source:",
    "footer.copyright": "© 2025 Vancouver Street Parking Info",

    // ParkingList
    "list.noResults": "No parking information matching the criteria.",
    "list.selectedTimeRate": "Selected time rate",
    "list.operatingHours": "Operating Hours:",
    "list.creditCard": "Credit Card:",
    "list.creditCardYes": "✅ Available",
    "list.creditCardNo": "❌ Not Available",
    "list.googleMaps": "Google",
    "list.appleMaps": "Apple",
    "list.goToMap": "View on Map",
    "list.showDetails": "🔽 Show detailed time-based rates",
    "list.hideDetails": "🔼 Hide details",

    // FilterPanel
    "filter.title": "Filter & Sort",
    "filter.day": "Day:",
    "filter.hour": "Hour:",
    "filter.setCurrentTime": "🕐 Set to current date/time",
    "filter.maxPrice": "Max rate:",
    "filter.creditCardOnly": "Credit card only",
    "filter.sortBy": "Sort by:",
    "filter.sort": "Sort",
    "filter.sortPriceAsc": "Price (Low to High)",
    "filter.sortPriceDesc": "Price (High to Low)",
    "filter.sortDistance": "Distance (Nearest)",
    "filter.sort.priceAsc": "Price (Low to High)",
    "filter.sort.priceDesc": "Price (High to Low)",
    "filter.sort.distanceAsc": "Distance (Nearest)",
    "filter.sort.distanceDesc": "Distance (Farthest)",
    "filter.days.sunday": "Sunday",
    "filter.days.monday": "Monday",
    "filter.days.tuesday": "Tuesday",
    "filter.days.wednesday": "Wednesday",
    "filter.days.thursday": "Thursday",
    "filter.days.friday": "Friday",
    "filter.days.saturday": "Saturday",

    // TimeRateInfo
    "timeRate.title": "📋 Time-based Rate Schedule",
    "timeRate.closed": "⏰ Parking meters are currently closed",
    "timeRate.operatingHours": "Operating Hours: 9:00 AM - 10:00 PM",
    "timeRate.current": "Current",
    "timeRate.weekdayMorning": "Weekday Morning",
    "timeRate.weekdayEvening": "Weekday Evening",
    "timeRate.saturdayMorning": "Saturday Morning",
    "timeRate.saturdayEvening": "Saturday Evening",
    "timeRate.sundayMorning": "Sunday Morning",
    "timeRate.sundayEvening": "Sunday Evening",

    // Map loading
    "map.loading": "Loading map...",
    "map.clusterInfo": "💡 Cluster colors represent average price",
    "map.clusterGreen": "Green: under $3",
    "map.clusterOrange": "Orange: $3-4",
    "map.clusterRed": "Red: over $4",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// 기본값 제공
const defaultContext: LanguageContextType = {
  language: "ko",
  setLanguage: () => {},
  t: (key: string) => key, // 키를 그대로 반환
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ko");

  const t = (key: string): string => {
    try {
      // "P " 접두사 제거 (혹시 어디선가 추가된 경우)
      const cleanKey = key.replace(/^P\s+/, "");

      // translations 객체는 평평한 구조이므로 직접 접근
      const value = (translations[language] as Record<string, string>)[
        cleanKey
      ];

      // 번역을 찾지 못한 경우 콘솔에 경고 출력
      if (!value) {
        console.warn(
          `Translation not found for key: ${cleanKey} in language: ${language}`
        );
        return cleanKey;
      }

      return value;
    } catch (error) {
      console.error("Translation error:", error);
      return key;
    }
  };

  console.log("LanguageProvider rendering with language:", language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.warn(
      "useLanguage used outside LanguageProvider, using default context"
    );
    return defaultContext;
  }
  return context;
}
