"use client";

import { SortOption } from "@/types/parking";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterPanelProps {
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  creditCardOnly: boolean;
  onCreditCardOnlyChange: (value: boolean) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  selectedDay: number;
  onDayChange: (day: number) => void;
  selectedHour: number;
  onHourChange: (hour: number) => void;
}

export default function FilterPanel({
  maxPrice,
  onMaxPriceChange,
  creditCardOnly,
  onCreditCardOnlyChange,
  sortOption,
  onSortChange,
  selectedDay,
  onDayChange,
  selectedHour,
  onHourChange,
}: FilterPanelProps) {
  const { t } = useLanguage();

  const getDayName = (day: number) => {
    const days = [
      t("filter.days.sunday"),
      t("filter.days.monday"),
      t("filter.days.tuesday"),
      t("filter.days.wednesday"),
      t("filter.days.thursday"),
      t("filter.days.friday"),
      t("filter.days.saturday"),
    ];
    return days[day];
  };

  const resetToNow = () => {
    const now = new Date();
    onDayChange(now.getDay());
    onHourChange(now.getHours());
    onMaxPriceChange(10);
    onCreditCardOnlyChange(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">{t("filter.title")}</h2>

      {/* 요일 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("filter.day")} {getDayName(selectedDay)}
        </label>
        <select
          value={selectedDay}
          onChange={(e) => onDayChange(parseInt(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">{t("filter.days.sunday")}</option>
          <option value="1">{t("filter.days.monday")}</option>
          <option value="2">{t("filter.days.tuesday")}</option>
          <option value="3">{t("filter.days.wednesday")}</option>
          <option value="4">{t("filter.days.thursday")}</option>
          <option value="5">{t("filter.days.friday")}</option>
          <option value="6">{t("filter.days.saturday")}</option>
        </select>
      </div>

      {/* 시간 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("filter.hour")} {selectedHour}:00
        </label>
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={selectedHour}
          onChange={(e) => onHourChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* 현재 시간으로 설정 버튼 */}
      <button
        onClick={resetToNow}
        className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors text-blue-700"
      >
        {t("filter.setCurrentTime")}
      </button>

      {/* 최대 가격 필터 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("filter.maxPrice")} ${maxPrice}
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>$0</span>
          <span>$10</span>
        </div>
      </div>

      {/* 신용카드 필터 */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={creditCardOnly}
            onChange={(e) => onCreditCardOnlyChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">
            {t("filter.creditCardOnly")}
          </span>
        </label>
      </div>

      {/* 정렬 옵션 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("filter.sort")}
        </label>
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="price-asc">{t("filter.sortPriceAsc")}</option>
          <option value="price-desc">{t("filter.sortPriceDesc")}</option>
          <option value="distance">{t("filter.sortDistance")}</option>
        </select>
      </div>

      {/* 클러스터 색상 설명 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-medium text-blue-800 mb-2">
          {t("map.clusterInfo")}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>{t("map.clusterGreen")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>{t("map.clusterOrange")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>{t("map.clusterRed")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
