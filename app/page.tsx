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

// 지도 컴포넌트는 CSR로 로드 (Leaflet은 SSR 불가)
const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p>지도 로딩 중...</p>
    </div>
  ),
});

// Vancouver 중심 좌표
const VANCOUVER_CENTER: [number, number] = [49.2827, -123.1207];

export default function Home() {
  const [allMeters, setAllMeters] = useState<ParkingMeter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<ParkingMeter | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [mapCenter, setMapCenter] =
    useState<[number, number]>(VANCOUVER_CENTER);
  const [mapZoom, setMapZoom] = useState(12);
  const [viewMode, setViewMode] = useState<"map" | "list" | "both">("both");

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

  // 現在位置取得
  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setMapCenter([latitude, longitude]);
          setMapZoom(14);
        },
        (error) => {
          console.error("位置情報の取得に失敗:", error);
          alert("현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
        }
      );
    } else {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  // 検索機能
  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    const lowerQuery = query.toLowerCase();
    const found = allMeters.find((meter) =>
      meter.geo_local_area.toLowerCase().includes(lowerQuery)
    );

    if (found) {
      setMapCenter([found.geo_point_2d.lat, found.geo_point_2d.lon]);
      setMapZoom(15);
      setSelectedMeter(found);
    } else {
      alert("검색 결과가 없습니다.");
    }
  };

  // メーター選択
  const handleMeterClick = (meter: ParkingMeter) => {
    setSelectedMeter(meter);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            🅿️ Vancouver 스트리트 파킹 가격 정보
          </h1>
          <p className="text-sm md:text-base opacity-90">
            현재 위치 또는 주소 검색으로 주차 정보를 확인하세요
          </p>
        </div>
      </header>

      {/* 検索バー */}
      <div className="p-4 bg-gray-50">
        <div className="container mx-auto">
          <SearchBar
            onSearch={handleSearch}
            onGetCurrentLocation={handleGetCurrentLocation}
          />
        </div>
      </div>

      {/* ビュー切り替えボタン (モバイル用) */}
      <div className="p-2 bg-gray-100 flex justify-center gap-2 md:hidden">
        <button
          onClick={() => setViewMode("map")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === "map"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          🗺️ 지도
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          📋 리스트
        </button>
        <button
          onClick={() => setViewMode("both")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === "both"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          ⚡ 전체
        </button>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full p-4">
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
                  📊 총 {filteredAndSortedMeters.length}개의 주차 미터
                </p>
              </div>
            </div>

            {/* 地図ビュー */}
            <div
              className={`${
                viewMode === "list" ? "hidden" : ""
              } md:block md:col-span-2 h-[400px] md:h-full rounded-lg overflow-hidden shadow-lg`}
            >
              <ParkingMap
                meters={filteredAndSortedMeters}
                center={mapCenter}
                zoom={mapZoom}
                selectedMeter={selectedMeter || undefined}
                onMeterClick={handleMeterClick}
                selectedDay={selectedDay}
                selectedHour={selectedHour}
              />
            </div>

            {/* リストビュー */}
            <div
              className={`${
                viewMode === "map" ? "hidden" : ""
              } md:block md:col-span-1 h-[500px] md:h-full rounded-lg overflow-hidden shadow-lg bg-white`}
            >
              <ParkingList
                meters={filteredAndSortedMeters}
                onMeterClick={handleMeterClick}
                selectedMeter={selectedMeter || undefined}
                userLocation={userLocation || undefined}
                selectedDay={selectedDay}
                selectedHour={selectedHour}
              />
            </div>
          </div>
        </div>
      </div>

      {/* フッター (広告スペース) */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container mx-auto">
          <p className="text-sm">
            데이터 출처:{" "}
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
            {/* 広告スペース: Google AdSense を後で追加 */}© 2025 Vancouver
            Street Parking Info
          </p>
        </div>
      </footer>
    </div>
  );
}
