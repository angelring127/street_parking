"use client";

import { useState, useEffect, useRef } from "react";
import { ParkingMeter } from "@/types/parking";
import { getRateByDayAndHour, calculateDistance } from "@/lib/utils";
import TimeRateInfo from "./TimeRateInfo";
import { useLanguage } from "@/contexts/LanguageContext";

interface ParkingListProps {
  meters: ParkingMeter[];
  onMeterClick?: (meter: ParkingMeter, zoomToMax?: boolean) => void;
  selectedMeter?: ParkingMeter;
  userLocation?: { lat: number; lon: number };
  selectedDay: number;
  selectedHour: number;
  onGoToMap?: (meter: ParkingMeter) => void;
}

export default function ParkingList({
  meters,
  onMeterClick,
  selectedMeter,
  userLocation,
  selectedDay,
  selectedHour,
  onGoToMap,
}: ParkingListProps) {
  const { t } = useLanguage();
  const [expandedMeterId, setExpandedMeterId] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const meterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 가상 스크롤링 상태
  const [visibleEndIndex, setVisibleEndIndex] = useState(20); // 초기 20개 표시
  const ITEMS_PER_PAGE = 20;

  // 스크롤 이벤트 핸들러 - 무한 스크롤
  useEffect(() => {
    const handleScroll = () => {
      if (!listContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        listContainerRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // 80% 스크롤했을 때 더 많은 아이템 로드
      if (scrollPercentage > 0.8 && visibleEndIndex < meters.length) {
        setVisibleEndIndex((prev) =>
          Math.min(prev + ITEMS_PER_PAGE, meters.length)
        );
      }
    };

    const container = listContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [visibleEndIndex, meters.length]);

  // 지도에서 핀을 클릭하면 자동으로 스크롤만 (상세카드는 열지 않음)
  useEffect(() => {
    if (selectedMeter && listContainerRef.current) {
      const meterElement = meterRefs.current.get(selectedMeter.meterid);
      if (meterElement) {
        // 해당 항목으로 스크롤
        meterElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        // 상세 카드는 자동 확장하지 않음
      }
    }
  }, [selectedMeter]);

  const handleCardClick = (meter: ParkingMeter) => {
    // 지도 최대 줌으로 이동
    onMeterClick?.(meter, true);
  };

  const handleDetailButtonClick = (e: React.MouseEvent, meterId: string) => {
    e.stopPropagation();
    // 상세보기 토글
    setExpandedMeterId(expandedMeterId === meterId ? null : meterId);
  };

  // 운영 시간 파싱 함수 (9:00 AM TO 10:00 PM 형태 추출)
  const parseOperatingHours = (timeineffe: string | null) => {
    if (!timeineffe) return "N/A";
    // "METER IN EFFECT: 9:00 AM TO 10:00 PM" 형태에서 시간 부분만 추출
    const match = timeineffe.match(
      /(\d{1,2}:\d{2}\s*[AP]M\s*TO\s*\d{1,2}:\d{2}\s*[AP]M)/i
    );
    return match ? match[1] : "N/A";
  };

  return (
    <div ref={listContainerRef} className="h-full overflow-y-auto">
      {meters.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          {t("list.noResults")}
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {meters.slice(0, visibleEndIndex).map((meter) => {
            // 선택된 요일/시간의 요금 표시
            const currentRate = getRateByDayAndHour(
              meter,
              selectedDay,
              selectedHour
            );
            // 좌표 유효성 검사
            const lat = meter.geo_point_2d.lat;
            const lon = meter.geo_point_2d.lon;

            if (isNaN(lat) || isNaN(lon) || lat === null || lon === null) {
              console.warn(
                "Skipping meter with invalid coordinates in list:",
                meter.meterid,
                { lat, lon }
              );
              return null;
            }

            const distance = userLocation
              ? calculateDistance(userLocation.lat, userLocation.lon, lat, lon)
              : null;
            const isSelected = selectedMeter?.meterid === meter.meterid;
            const isExpanded = expandedMeterId === meter.meterid;
            const operatingHours = parseOperatingHours(meter.timeineffe);

            // 구글 맵 및 애플 맵 URL
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            const appleMapsUrl = `http://maps.apple.com/?ll=${lat},${lon}&q=Parking`;

            return (
              <div
                key={meter.meterid}
                id={`meter-${meter.meterid}`}
                ref={(el) => {
                  if (el) {
                    meterRefs.current.set(meter.meterid, el);
                  } else {
                    meterRefs.current.delete(meter.meterid);
                  }
                }}
                onClick={() => handleCardClick(meter)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{meter.meterhead}</h3>
                    <p className="text-sm text-gray-600">
                      {meter.geo_local_area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {currentRate}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("list.selectedTimeRate")}
                    </p>
                  </div>
                </div>

                {distance !== null && (
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {distance.toFixed(2)} km
                  </p>
                )}

                <div className="text-sm mb-2">
                  <p className="text-gray-600 mb-1">
                    <strong>{t("list.operatingHours")}</strong> {operatingHours}
                  </p>
                  <p className="text-gray-600">
                    <strong>{t("list.creditCard")}</strong>{" "}
                    {meter.creditcard === "Yes"
                      ? t("list.creditCardYes")
                      : t("list.creditCardNo")}
                  </p>
                </div>

                {/* 시간대별 요금 상세 정보 (확장 시 표시) */}
                {isExpanded && (
                  <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <TimeRateInfo
                      meter={meter}
                      selectedDay={selectedDay}
                      selectedHour={selectedHour}
                    />
                  </div>
                )}

                {/* 지도 링크 버튼 - 한 줄로 표시 */}
                <div className="flex gap-2 mb-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded text-center font-medium transition-colors whitespace-nowrap"
                  >
                    {t("list.googleMaps")}
                  </a>
                  <a
                    href={appleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-xs py-2 px-3 rounded text-center font-medium transition-colors whitespace-nowrap"
                  >
                    {t("list.appleMaps")}
                  </a>
                </div>

                {/* 모바일용 지도 탭 이동 버튼 - PC에서는 숨김 */}
                {onGoToMap && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGoToMap(meter);
                    }}
                    className="w-full mb-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-md hover:shadow-lg md:hidden"
                  >
                    <i className="fas fa-map-marked-alt mr-2"></i>
                    {t("list.goToMap")}
                  </button>
                )}

                {/* 상세보기 버튼 */}
                <button
                  onClick={(e) => handleDetailButtonClick(e, meter.meterid)}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {isExpanded ? t("list.hideDetails") : t("list.showDetails")}
                </button>
              </div>
            );
          })}

          {/* 로딩 인디케이터 */}
          {visibleEndIndex < meters.length && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
