"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ParkingMeter, SortOption } from "@/types/parking";
import {
  sortParkingMeters,
  parsePrice,
  getRateByDayAndHour,
} from "@/lib/utils";
import ParkingList from "@/components/ParkingList";
import FilterPanel from "@/components/FilterPanel";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";

// 지도 컴포넌트는 CSR로 로드 (Leaflet은 SSR 불가)
const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => {
    // 다국어 지원을 위해 여기서는 간단한 로딩 메시지만 표시
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p>Loading map...</p>
      </div>
    );
  },
});

// Vancouver 중심 좌표
const VANCOUVER_CENTER: [number, number] = [49.2827, -123.1207];

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [allMeters, setAllMeters] = useState<ParkingMeter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<ParkingMeter | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [mapCenter, setMapCenter] =
    useState<[number, number]>(VANCOUVER_CENTER);
  const [mapZoom, setMapZoom] = useState(12);
  const [viewMode, setViewMode] = useState<"map" | "list" | "both">("map");
  const [zoomToMax, setZoomToMax] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 現在の日時を取得してデフォルト値に設定
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(now.getDay());
  const [selectedHour, setSelectedHour] = useState(now.getHours());

  // フィルター状態
  const [maxPrice, setMaxPrice] = useState(10);
  const [creditCardOnly, setCreditCardOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");

  // データ読み込み
  useEffect(() => {
    fetch("/data/parking-meters.json")
      .then((res) => res.json())
      .then((data: ParkingMeter[]) => {
        setAllMeters(data);
      })
      .catch((error) => {
        console.error("データの読み込みに失敗:", error);
      });
  }, []);

  // フィルタリングとソート
  const filteredAndSortedMeters = useMemo(() => {
    let filtered = allMeters;

    // 価格フィルター (選択された曜日と時間に基づく)
    if (maxPrice < 10) {
      filtered = filtered.filter((m) => {
        const price = parsePrice(
          getRateByDayAndHour(m, selectedDay, selectedHour)
        );
        return price <= maxPrice;
      });
    }

    // クレジットカードフィルター
    if (creditCardOnly) {
      filtered = filtered.filter((m) => m.creditcard === "Yes");
    }

    // ソート
    return sortParkingMeters(filtered, sortOption, userLocation || undefined);
  }, [
    allMeters,
    maxPrice,
    creditCardOnly,
    sortOption,
    userLocation,
    selectedDay,
    selectedHour,
  ]);

  // 디버깅을 위한 콘솔 출력
  console.log("Current language:", language);
  console.log("Translation test:", t("header.title"));

  // 現在位置取得
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t("location.browserNotSupported"));
      return;
    }

    console.log("Getting current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Location success:", { latitude, longitude });
        setUserLocation({ lat: latitude, lon: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(16);
      },
      (error) => {
        console.error("Location error:", error);
        let errorMessage = t("location.generalError");

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t("location.permissionDenied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t("location.unavailable");
            break;
          case error.TIMEOUT:
            errorMessage = t("location.timeout");
            break;
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 検索機能 (住所オートコンプリートから座標取得)
  const handleSearch = (lat: number, lon: number, address: string) => {
    // 좌표 유효성 검사
    if (isNaN(lat) || isNaN(lon)) {
      console.error("Invalid search coordinates:", { lat, lon });
      return;
    }

    // 検索位置に地図移動
    setMapCenter([lat, lon]);
    setMapZoom(15);

    // 検索位置に最も近い駐車メーターを探す
    const findNearestMeter = () => {
      let nearest: ParkingMeter | null = null;
      let minDistance = Infinity;

      filteredAndSortedMeters.forEach((meter) => {
        const meterLat = meter.geo_point_2d.lat;
        const meterLon = meter.geo_point_2d.lon;

        // 유효한 좌표인지 확인
        if (isNaN(meterLat) || isNaN(meterLon)) {
          return;
        }

        const distance = Math.sqrt(
          Math.pow(meterLat - lat, 2) + Math.pow(meterLon - lon, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = meter;
        }
      });

      return nearest;
    };

    const nearest = findNearestMeter();
    if (nearest) {
      setSelectedMeter(nearest);
    }
  };

  // メーター選択
  const handleMeterClick = (meter: ParkingMeter, shouldZoomToMax?: boolean) => {
    // 좌표 유효성 검사
    const lat = meter.geo_point_2d.lat;
    const lon = meter.geo_point_2d.lon;

    console.log(
      "handleMeterClick: Checking meter coordinates:",
      meter.meterid,
      { lat, lon }
    );

    // 강화된 좌표 검증
    const finalLat = Number(lat);
    const finalLon = Number(lon);

    if (
      isNaN(finalLat) ||
      isNaN(finalLon) ||
      !isFinite(finalLat) ||
      !isFinite(finalLon)
    ) {
      console.error(
        "Cannot select meter with invalid coordinates:",
        meter.meterid,
        {
          originalLat: lat,
          originalLon: lon,
          finalLat,
          finalLon,
          latType: typeof lat,
          lonType: typeof lon,
        }
      );
      return;
    }

    setSelectedMeter(meter);
    setZoomToMax(shouldZoomToMax || false);
  };

  // モバイル用: リストからメーター選択時は地図タブに切り替えしない
  const handleMeterClickFromList = (
    meter: ParkingMeter,
    shouldZoomToMax?: boolean
  ) => {
    // 좌표 유효성 검사
    const lat = meter.geo_point_2d.lat;
    const lon = meter.geo_point_2d.lon;

    console.log(
      "handleMeterClickFromList: Checking meter coordinates:",
      meter.meterid,
      { lat, lon }
    );

    // 강화된 좌표 검증
    const finalLat = Number(lat);
    const finalLon = Number(lon);

    if (
      isNaN(finalLat) ||
      isNaN(finalLon) ||
      !isFinite(finalLat) ||
      !isFinite(finalLon)
    ) {
      console.error(
        "Cannot select meter with invalid coordinates:",
        meter.meterid,
        {
          originalLat: lat,
          originalLon: lon,
          finalLat,
          finalLon,
          latType: typeof lat,
          lonType: typeof lon,
        }
      );
      return;
    }

    setSelectedMeter(meter);
    setZoomToMax(shouldZoomToMax || false);
    // モバイルでは地図タブに切り替えしない
  };

  // zoomToMaxはリセット不要 (次回クリック時に上書きされる)

  // モバイル用: リストから地図タブに移動
  const handleGoToMap = (meter: ParkingMeter) => {
    setSelectedMeter(meter);
    setViewMode("map");
    setZoomToMax(true); // 최대 줌으로 이동
  };

  // 시간 변경 핸들러
  const onHourChange = (hour: number) => {
    setSelectedHour(hour);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white p-2 md:p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* 모바일 햄버거 버튼 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1 rounded hover:bg-blue-500 transition-colors"
                aria-label="메뉴 열기"
              >
                <i className="fas fa-bars text-lg"></i>
              </button>
              <div>
                <h1 className="text-lg md:text-3xl font-bold mb-1 md:mb-2">
                  {t("header.title")}
                </h1>
                <p className="text-xs md:text-base opacity-90 hidden md:block">
                  {t("header.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage("ko")}
                className={`px-2 py-1 rounded text-xs md:text-sm font-medium transition-colors ${
                  language === "ko"
                    ? "bg-white text-blue-600"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                }`}
              >
                KO
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded text-xs md:text-sm font-medium transition-colors ${
                  language === "en"
                    ? "bg-white text-blue-600"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 検索バー (デスクトップのみ) */}
      <div className="hidden md:block p-2 md:p-4 bg-gray-50">
        <div className="container mx-auto">
          <SearchBar
            onSearch={handleSearch}
            onGetCurrentLocation={handleGetCurrentLocation}
          />
        </div>
      </div>

      {/* モバイル用タブ (モバイルのみ表示) */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
              viewMode === "map"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-map-marked-alt mr-1"></i>
            {t("tabs.map")}
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-list mr-1"></i>
            {t("tabs.list")}
          </button>
        </div>
      </div>

      {/* 모바일 햄버거 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[9999]">
          {/* 쉐도우아웃 배경 */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* 햄버거 메뉴 */}
          <div
            className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out max-h-[85vh] z-50"
            style={{
              position: "absolute",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="p-4" style={{ position: "relative", zIndex: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  <i className="fas fa-bars mr-2"></i>
                  {t("header.menu")}
                </h3>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="메뉴 닫기"
                >
                  <i className="fas fa-times text-gray-600"></i>
                </button>
              </div>

              {/* 주소 검색 섹션 */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3 text-gray-700">
                  <i className="fas fa-search mr-2"></i>
                  {t("search.title")}
                </h4>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <SearchBar
                    onSearch={handleSearch}
                    onGetCurrentLocation={handleGetCurrentLocation}
                  />
                </div>
              </div>

              {/* 필터 섹션 */}
              <div className="mb-4 space-y-4">
                <h4 className="text-md font-semibold mb-3 text-gray-700">
                  <i className="fas fa-filter mr-2"></i>
                  {t("filter.title")}
                </h4>

                {/* 요일 선택 */}
                <div className="relative" style={{ zIndex: "auto" }}>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    {t("filter.day")}
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
                    style={{
                      fontSize: "16px",
                      backgroundImage:
                        "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
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
                <div className="relative" style={{ zIndex: "auto" }}>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    {t("filter.hour")}
                  </label>
                  <select
                    value={selectedHour}
                    onChange={(e) => onHourChange(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
                    style={{
                      fontSize: "16px",
                      backgroundImage:
                        "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} style={{ padding: "8px" }}>
                        {i.toString().padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>

                {/* 최대 가격 */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    {t("filter.maxPrice")} ${maxPrice}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* 신용카드만 */}
                <div className="flex items-center relative">
                  <input
                    type="checkbox"
                    id="creditCardOnly"
                    checked={creditCardOnly}
                    onChange={(e) => setCreditCardOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="creditCardOnly"
                    className="ml-2 text-sm text-gray-600"
                  >
                    {t("filter.creditCardOnly")}
                  </label>
                </div>

                {/* 정렬 옵션 */}
                <div className="relative" style={{ zIndex: "auto" }}>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    {t("filter.sortBy")}
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) =>
                      setSortOption(e.target.value as SortOption)
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
                    style={{
                      fontSize: "16px",
                      backgroundImage:
                        "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="price-asc">
                      {t("filter.sort.priceAsc")}
                    </option>
                    <option value="price-desc">
                      {t("filter.sort.priceDesc")}
                    </option>
                    <option value="distance-asc">
                      {t("filter.sort.distanceAsc")}
                    </option>
                    <option value="distance-desc">
                      {t("filter.sort.distanceDesc")}
                    </option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  {t("parking.totalMeters").replace(
                    "{count}",
                    filteredAndSortedMeters.length.toString()
                  )}
                </p>
              </div>

              {/* 클러스터 정보 */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  {t("map.clusterInfo")}
                </p>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>{t("map.clusterGreen")}</p>
                  <p>{t("map.clusterOrange")}</p>
                  <p>{t("map.clusterRed")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden">
        {/* モバイル: フルスクリーン表示 */}
        <div className="md:hidden h-full">
          {/* 地図ビュー (モバイル) */}
          {viewMode === "map" && (
            <div className="h-full">
              <ParkingMap
                meters={filteredAndSortedMeters}
                center={mapCenter}
                zoom={mapZoom}
                selectedMeter={selectedMeter || undefined}
                onMeterClick={handleMeterClick}
                selectedDay={selectedDay}
                selectedHour={selectedHour}
                zoomToMax={zoomToMax}
              />
            </div>
          )}

          {/* リストビュー (モバイル) */}
          {viewMode === "list" && (
            <div className="h-full overflow-hidden bg-white">
              <ParkingList
                meters={filteredAndSortedMeters}
                onMeterClick={handleMeterClickFromList}
                selectedMeter={selectedMeter || undefined}
                userLocation={userLocation || undefined}
                selectedDay={selectedDay}
                selectedHour={selectedHour}
                onGoToMap={handleGoToMap}
              />
            </div>
          )}
        </div>

        {/* デスクトップ: グリッドレイアウト */}
        <div className="hidden md:block container mx-auto h-full p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
            {/* フィルターパネル */}
            <div className="md:col-span-1 overflow-y-auto">
              <FilterPanel
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                creditCardOnly={creditCardOnly}
                onCreditCardOnlyChange={setCreditCardOnly}
                sortOption={sortOption}
                onSortChange={setSortOption}
                selectedDay={selectedDay}
                onDayChange={setSelectedDay}
                selectedHour={selectedHour}
                onHourChange={setSelectedHour}
              />
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  {t("parking.totalMeters").replace(
                    "{count}",
                    filteredAndSortedMeters.length.toString()
                  )}
                </p>
              </div>
            </div>

            {/* 地図ビュー */}
            <div className="md:col-span-2 h-full rounded-lg overflow-hidden shadow-lg">
              <ParkingMap
                meters={filteredAndSortedMeters}
                center={mapCenter}
                zoom={mapZoom}
                selectedMeter={selectedMeter || undefined}
                onMeterClick={handleMeterClick}
                selectedDay={selectedDay}
                selectedHour={selectedHour}
                zoomToMax={zoomToMax}
              />
            </div>

            {/* リストビュー */}
            <div className="md:col-span-1 h-full rounded-lg overflow-hidden shadow-lg bg-white">
              <ParkingList
                meters={filteredAndSortedMeters}
                onMeterClick={handleMeterClickFromList}
                selectedMeter={selectedMeter || undefined}
                userLocation={userLocation || undefined}
                selectedDay={selectedDay}
                selectedHour={selectedHour}
                onGoToMap={handleGoToMap}
                scrollToMeter={(meterId) => {
                  // PC에서만 스크롤 기능 사용
                  const meterElement = document.getElementById(
                    `meter-${meterId}`
                  );
                  if (meterElement) {
                    meterElement.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* フッター (広告スペース) */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm">
            {t("footer.dataSource")}{" "}
            <a
              href="https://opendata.vancouver.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Vancouver Open Data Portal
            </a>
          </p>
          <p className="text-xs mt-2 text-gray-400">
            {/* 広告スペース: Google AdSense を後で追加 */}
            {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
