"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  onSearch: (lat: number, lon: number, address: string) => void;
  onGetCurrentLocation: () => void;
  onCloseMenu?: () => void; // 햄버거 메뉴 닫기 콜백
  followMyLocation: boolean;
  onFollowMyLocationChange: (value: boolean) => void;
  isLocationTracking?: boolean;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
}

export default function SearchBar({
  onSearch,
  onGetCurrentLocation,
  onCloseMenu,
  followMyLocation,
  onFollowMyLocationChange,
  isLocationTracking = false,
}: SearchBarProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Nominatim API 呼び出し (debounce付き)
  useEffect(() => {
    if (searchQuery.length < 3) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // OpenStreetMap Nominatim API (完全無料、APIキー不要)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(searchQuery)}` +
            `&format=json` +
            `&addressdetails=1` +
            `&countrycodes=ca` + // カナダに制限
            `&limit=5` +
            `&bounded=1` +
            `&viewbox=-123.3,-49.1,-123,49.4`, // Vancouver周辺に優先
          {
            headers: {
              "User-Agent": "Vancouver-Parking-App", // Nominatim要件
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("住所検索エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce (Nominatim負荷軽減)

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 外部クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 提案選択
  const handleSelectSuggestion = (suggestion: NominatimResult) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    onSearch(lat, lon, suggestion.display_name);
    // 햄버거 메뉴 닫기
    if (onCloseMenu) {
      onCloseMenu();
    }
  };

  // キーボード検索 (Enterキー)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  // 내 위치 버튼 클릭 핸들러
  const handleGetCurrentLocationClick = () => {
    onGetCurrentLocation();
    // 햄버거 메뉴 닫기
    if (onCloseMenu) {
      onCloseMenu();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2 md:p-4">
      <div className="relative" ref={searchRef}>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={t("search.placeholder")}
              className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              autoComplete="off"
            />

            {/* ローディング表示 */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}

            {/* 自動完成提案リスト */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">📍</span>
                      <span className="text-sm text-gray-700 line-clamp-2">
                        {suggestion.display_name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* モバイル用: 内位置ボタンを右下に配置 */}
          <div className="flex justify-end md:block">
            <button
              type="button"
              onClick={handleGetCurrentLocationClick}
              className="px-3 py-2 md:px-6 md:py-3 text-xs md:text-base bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
              title={t("search.currentLocationTitle")}
            >
              <i className="fas fa-location-arrow mr-1"></i>
              {t("search.currentLocation")}
            </button>
          </div>
        </form>

        {/* 無料API情報 */}
        <p className="text-xs text-gray-500 mt-1 md:mt-2 hidden md:block">
          {t("search.apiInfo")}
        </p>

        <div className="mt-3 flex items-start gap-2">
          <input
            id="follow-my-location"
            type="checkbox"
            checked={followMyLocation}
            disabled={!isLocationTracking}
            onChange={(e) => onFollowMyLocationChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="min-w-0">
            <label
              htmlFor="follow-my-location"
              className={`text-sm font-medium ${
                isLocationTracking ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {t("search.followMyLocation")}
            </label>
            <p
              className={`text-xs mt-0.5 ${
                isLocationTracking ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {isLocationTracking
                ? t("search.followMyLocationHelp")
                : t("search.followMyLocationDisabled")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
