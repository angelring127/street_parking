"use client";

import { ParkingMeter } from "@/types/parking";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimeRateInfoProps {
  meter: ParkingMeter;
}

/**
 * 시간대별, 요일별 요금 정보를 상세하게 표시하는 컴포넌트
 */
export default function TimeRateInfo({ meter }: TimeRateInfoProps) {
  const { t } = useLanguage();
  const now = new Date();
  const day = now.getDay(); // 0: 일요일, 1-5: 평일, 6: 토요일
  const hour = now.getHours();

  const isMorning = hour >= 9 && hour < 18;
  const isEvening = hour >= 18 && hour < 22;

  // 현재 시간대 결정
  const getCurrentPeriod = () => {
    if (isMorning) return "morning";
    if (isEvening) return "evening";
    return "closed";
  };

  const currentPeriod = getCurrentPeriod();

  // 현재 요일 타입
  const getDayType = () => {
    if (day === 0) return "sunday";
    if (day === 6) return "saturday";
    return "weekday";
  };

  const dayType = getDayType();

  // 각 시간대/요일의 요금 정보
  const rates = [
    {
      label: t("timeRate.weekdayMorning"),
      period: "9am-6pm",
      rate: meter.r_mf_9a_6p,
      limit: meter.t_mf_9a_6p,
      isActive: dayType === "weekday" && currentPeriod === "morning",
    },
    {
      label: t("timeRate.weekdayEvening"),
      period: "6pm-10pm",
      rate: meter.r_mf_6p_10,
      limit: meter.t_mf_6p_10,
      isActive: dayType === "weekday" && currentPeriod === "evening",
    },
    {
      label: t("timeRate.saturdayMorning"),
      period: "9am-6pm",
      rate: meter.r_sa_9a_6p,
      limit: meter.t_sa_9a_6p,
      isActive: dayType === "saturday" && currentPeriod === "morning",
    },
    {
      label: t("timeRate.saturdayEvening"),
      period: "6pm-10pm",
      rate: meter.r_sa_6p_10,
      limit: meter.t_sa_6p_10,
      isActive: dayType === "saturday" && currentPeriod === "evening",
    },
    {
      label: t("timeRate.sundayMorning"),
      period: "9am-6pm",
      rate: meter.r_su_9a_6p,
      limit: meter.t_su_9a_6p,
      isActive: dayType === "sunday" && currentPeriod === "morning",
    },
    {
      label: t("timeRate.sundayEvening"),
      period: "6pm-10pm",
      rate: meter.r_su_6p_10,
      limit: meter.t_su_6p_10,
      isActive: dayType === "sunday" && currentPeriod === "evening",
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-gray-700">
        {t("timeRate.title")}
      </h4>

      {currentPeriod === "closed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-red-700">
            {t("timeRate.closed")}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {t("timeRate.operatingHours")}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {rates.map((rate, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 transition-all ${
              rate.isActive
                ? "border-green-500 bg-green-50 shadow-md"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-medium text-sm ${
                      rate.isActive ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {rate.label}
                  </p>
                  {rate.isActive && (
                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full animate-pulse">
                      {t("timeRate.current")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{rate.period}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    rate.isActive ? "text-green-600" : "text-gray-700"
                  }`}
                >
                  {rate.rate || "N/A"}
                </p>
                <p className="text-xs text-gray-500">{rate.limit || "-"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {meter.timeineffe && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          ℹ️ {meter.timeineffe}
        </div>
      )}
    </div>
  );
}
