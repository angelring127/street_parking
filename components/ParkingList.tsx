"use client";

import { useState, useEffect } from "react";
import { ParkingMeter } from "@/types/parking";
import { getRateByDayAndHour, calculateDistance } from "@/lib/utils";
import TimeRateInfo from "./TimeRateInfo";

interface ParkingListProps {
  meters: ParkingMeter[];
  onMeterClick?: (meter: ParkingMeter) => void;
  selectedMeter?: ParkingMeter;
  userLocation?: { lat: number; lon: number };
  selectedDay: number;
  selectedHour: number;
}

export default function ParkingList({
  meters,
  onMeterClick,
  selectedMeter,
  userLocation,
  selectedDay,
  selectedHour,
}: ParkingListProps) {
  const [expandedMeterId, setExpandedMeterId] = useState<string | null>(null);

  // 지도에서 핀을 클릭하면 자동으로 해당 항목 확장
  useEffect(() => {
    if (selectedMeter) {
      setExpandedMeterId(selectedMeter.meterid);
    }
  }, [selectedMeter]);

  const handleCardClick = (meter: ParkingMeter) => {
    onMeterClick?.(meter);
    setExpandedMeterId(
      expandedMeterId === meter.meterid ? null : meter.meterid
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      {meters.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          조건에 맞는 주차 정보가 없습니다.
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {meters.map((meter) => {
            // 선택된 요일/시간의 요금 표시
            const currentRate = getRateByDayAndHour(
              meter,
              selectedDay,
              selectedHour
            );
            const distance = userLocation
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lon,
                  meter.geo_point_2d.lat,
                  meter.geo_point_2d.lon
                )
              : null;
            const isSelected = selectedMeter?.meterid === meter.meterid;
            const isExpanded = expandedMeterId === meter.meterid;

            // 구글 맵 및 애플 맵 URL
            const lat = meter.geo_point_2d.lat;
            const lon = meter.geo_point_2d.lon;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            const appleMapsUrl = `http://maps.apple.com/?ll=${lat},${lon}&q=Parking`;

            return (
              <div
                key={meter.meterid}
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
                    <p className="text-xs text-gray-500">선택한 시간 요금</p>
                  </div>
                </div>

                {distance !== null && (
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {distance.toFixed(2)} km
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <p className="text-gray-600">평일 (9am-6pm)</p>
                    <p className="font-semibold">{meter.r_mf_9a_6p || "N/A"}</p>
                    <p className="text-xs text-gray-500">
                      {meter.t_mf_9a_6p || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">평일 (6pm-10pm)</p>
                    <p className="font-semibold">{meter.r_mf_6p_10 || "N/A"}</p>
                    <p className="text-xs text-gray-500">
                      {meter.t_mf_6p_10 || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">주말</p>
                    <p className="font-semibold">{meter.r_sa_9a_6p || "N/A"}</p>
                    <p className="text-xs text-gray-500">
                      {meter.t_sa_9a_6p || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">신용카드</p>
                    <p className="font-semibold">
                      {meter.creditcard === "Yes" ? "✅ 가능" : "❌ 불가"}
                    </p>
                  </div>
                </div>

                {/* 지도 링크 버튼 */}
                <div className="flex gap-2 mb-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded text-center font-medium transition-colors"
                  >
                    🗺️ Google Maps
                  </a>
                  <a
                    href={appleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-xs py-2 px-3 rounded text-center font-medium transition-colors"
                  >
                    🍎 Apple Maps
                  </a>
                </div>

                {/* 시간대별 요금 상세 정보 (확장 시 표시) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <TimeRateInfo meter={meter} />
                  </div>
                )}

                {/* 클릭하여 상세 정보 보기 안내 */}
                {!isExpanded && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-blue-600 font-medium">
                      👆 클릭하여 시간대별 요금 상세 보기
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
