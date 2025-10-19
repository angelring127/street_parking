"use client";

import { SortOption } from "@/types/parking";

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
  const getDayName = (day: number) => {
    const days = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
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
      <h2 className="text-xl font-bold mb-4">필터 & 정렬</h2>

      {/* 요일 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          요일: {getDayName(selectedDay)}
        </label>
        <select
          value={selectedDay}
          onChange={(e) => onDayChange(parseInt(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="0">일요일</option>
          <option value="1">월요일</option>
          <option value="2">화요일</option>
          <option value="3">수요일</option>
          <option value="4">목요일</option>
          <option value="5">금요일</option>
          <option value="6">토요일</option>
        </select>
      </div>

      {/* 시간 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          시간: {selectedHour}:00
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
        🕐 현재 날짜/시간으로 설정
      </button>

      {/* 최대 가격 필터 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          최대 요금: ${maxPrice}
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
          <span className="text-sm font-medium">신용카드 가능한 곳만</span>
        </label>
      </div>

      {/* 정렬 옵션 */}
      <div>
        <label className="block text-sm font-medium mb-2">정렬</label>
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="price-asc">가격 낮은 순</option>
          <option value="price-desc">가격 높은 순</option>
          <option value="distance">거리 가까운 순</option>
        </select>
      </div>
    </div>
  );
}
