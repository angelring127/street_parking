"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { ParkingMeter } from "@/types/parking";
import { getCurrentRate, getRateByDayAndHour, parsePrice } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ParkingMapProps {
  meters: ParkingMeter[];
  center: [number, number];
  zoom: number;
  selectedMeter?: ParkingMeter;
  onMeterClick?: (meter: ParkingMeter) => void;
  selectedDay?: number;
  selectedHour?: number;
  onBoundsChange?: (bounds: any) => void;
  zoomToMax?: boolean;
}

// 地図中心変更用コンポーネント (selectedMeter変更時のみ)
function ChangeView({
  selectedMeter,
  zoomToMax,
}: {
  selectedMeter?: ParkingMeter;
  zoomToMax?: boolean;
}) {
  const map = useMap();
  const prevSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedMeter && prevSelectedRef.current !== selectedMeter.meterid) {
      // 좌표 유효성 검사
      const lat = selectedMeter.geo_point_2d.lat;
      const lon = selectedMeter.geo_point_2d.lon;

      console.log(
        "ChangeView: Checking coordinates for meter:",
        selectedMeter.meterid,
        { lat, lon }
      );

      if (
        isNaN(lat) ||
        isNaN(lon) ||
        lat === null ||
        lon === null ||
        lat === undefined ||
        lon === undefined
      ) {
        console.error("Invalid coordinates for meter:", selectedMeter.meterid, {
          lat,
          lon,
          latType: typeof lat,
          lonType: typeof lon,
        });
        return;
      }

      // 좌표 범위 검사 (Vancouver 지역)
      if (lat < 49.0 || lat > 49.5 || lon < -123.5 || lon > -122.5) {
        console.warn("Coordinates outside Vancouver area:", { lat, lon });
        return;
      }

      // 최종 좌표 검증 (flyTo 실행 전)
      const finalLat = Number(lat);
      const finalLon = Number(lon);

      console.log("Final validation - original:", { lat, lon }, "converted:", {
        finalLat,
        finalLon,
      });

      if (
        isNaN(finalLat) ||
        isNaN(finalLon) ||
        !isFinite(finalLat) ||
        !isFinite(finalLon) ||
        finalLat === 0 ||
        finalLon === 0
      ) {
        console.error("Final coordinate validation failed:", {
          originalLat: lat,
          originalLon: lon,
          finalLat,
          finalLon,
          latType: typeof lat,
          lonType: typeof lon,
          isNaNLat: isNaN(finalLat),
          isNaNLon: isNaN(finalLon),
          isFiniteLat: isFinite(finalLat),
          isFiniteLon: isFinite(finalLon),
        });
        return;
      }

      // 최종 좌표 검증 - 더 엄격한 검사
      const safeLat = parseFloat(finalLat.toString());
      const safeLon = parseFloat(finalLon.toString());

      console.log("ChangeView: Final coordinates check:", {
        originalLat: lat,
        originalLon: lon,
        finalLat,
        finalLon,
        safeLat,
        safeLon,
        latType: typeof finalLat,
        lonType: typeof finalLon,
        isNaNLat: isNaN(safeLat),
        isNaNLon: isNaN(safeLon),
        isFiniteLat: isFinite(safeLat),
        isFiniteLon: isFinite(safeLon),
      });

      if (
        isNaN(safeLat) ||
        isNaN(safeLon) ||
        !isFinite(safeLat) ||
        !isFinite(safeLon)
      ) {
        console.error("Final coordinate validation failed - skipping flyTo:", {
          safeLat,
          safeLon,
          originalLat: lat,
          originalLon: lon,
        });
        return;
      }

      // 최종 안전 검사
      if (safeLat === 0 && safeLon === 0) {
        console.warn("Coordinates are (0,0) - skipping flyTo");
        return;
      }

      prevSelectedRef.current = selectedMeter.meterid;

      try {
        // 줌 레벨 안전 검사
        const currentZoom = map.getZoom();
        const targetZoom = zoomToMax ? 18 : currentZoom;

        console.log("ChangeView: Zoom levels:", {
          currentZoom,
          targetZoom,
          zoomToMax,
          isNaNCurrentZoom: isNaN(currentZoom),
          isNaNTargetZoom: isNaN(targetZoom),
        });

        // 줌 레벨이 유효하지 않으면 기본값 사용
        const safeZoom = isNaN(targetZoom) ? 15 : targetZoom;

        console.log("ChangeView: Attempting flyTo with coordinates:", {
          safeLat,
          safeLon,
          safeZoom,
        });

        // 選択マーカーへスムーズ移動 (zoomToMaxがtrueなら最大ズーム、そうでなければ現在のズーム維持)
        // flyTo 대신 setView 사용하여 NaN 오류 방지
        map.setView([safeLat, safeLon], safeZoom);
        console.log("setView executed successfully");
      } catch (error) {
        console.error("setView failed:", error, {
          safeLat,
          safeLon,
          currentZoom: map.getZoom(),
          targetZoom: zoomToMax ? 18 : map.getZoom(),
        });
      }
    }
  }, [selectedMeter, map, zoomToMax]);

  return null;
}

// 価格表示アイコン生成関数
const createPriceIcon = (meter: ParkingMeter, day?: number, hour?: number) => {
  // 曜日/時間指定時はその時間の料金、そうでなければ現在時刻の料金
  const rate =
    day !== undefined && hour !== undefined
      ? getRateByDayAndHour(meter, day, hour)
      : getCurrentRate(meter);
  const price = parsePrice(rate);

  // 価格による色設定
  let bgColor = "#10b981"; // 緑 (安い)
  if (price >= 4) {
    bgColor = "#ef4444"; // 赤 (高い)
  } else if (price >= 3) {
    bgColor = "#f59e0b"; // オレンジ (中間)
  }

  return L.divIcon({
    html: `
      <div class="price-marker" style="background-color: ${bgColor}">
        <span>${rate}</span>
      </div>
    `,
    className: "custom-price-marker",
    iconSize: [50, 30],
    iconAnchor: [25, 30],
    popupAnchor: [0, -30],
  });
};

// マーカークラスタリングコンポーネント
function MarkerClusterGroup({
  meters,
  selectedMeter,
  onMeterClick,
  selectedDay,
  selectedHour,
  onBoundsChange,
}: {
  meters: ParkingMeter[];
  selectedMeter?: ParkingMeter;
  onMeterClick?: (meter: ParkingMeter) => void;
  selectedDay?: number;
  selectedHour?: number;
  onBoundsChange?: (bounds: any) => void;
}) {
  const { t } = useLanguage();
  const map = useMap();
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // マーカーとクラスターグループを生成
  useEffect(() => {
    if (!map) return;

    // マーカークラスターグループ作成
    const markerClusterGroup = L.markerClusterGroup({
      // クラスターアイコンカスタマイズ (平均価格で色分け)
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();

        // クラスター内の全マーカーの平均価格を計算
        let totalPrice = 0;
        let validPriceCount = 0;

        markers.forEach((marker: any) => {
          if (marker.options.priceValue !== undefined) {
            totalPrice += marker.options.priceValue;
            validPriceCount++;
          }
        });

        const avgPrice = validPriceCount > 0 ? totalPrice / validPriceCount : 0;

        // 平均価格による色設定
        let bgColor = "#10b981"; // 緑 (安い)
        if (avgPrice >= 4) {
          bgColor = "#ef4444"; // 赤 (高い)
        } else if (avgPrice >= 3) {
          bgColor = "#f59e0b"; // オレンジ (中間)
        }

        return L.divIcon({
          html: `<div style="background-color: ${bgColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><span>${count}</span></div>`,
          className: "marker-cluster-custom",
          iconSize: L.point(40, 40),
        });
      },
      // ズームレベル14以上(18-4=14)でクラスター解除
      disableClusteringAtZoom: 16,
      // クラスター半径
      maxClusterRadius: 80,
      // スパイダーファイ無効化
      spiderfyOnMaxZoom: false,
      spiderfyOnEveryZoom: false,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
    });

    // クラスターグループ参照保存
    clusterGroupRef.current = markerClusterGroup;

    // 各メーターにマーカー追加
    meters.forEach((meter) => {
      // 좌표 유효성 검사
      const meterLat = meter.geo_point_2d.lat;
      const meterLon = meter.geo_point_2d.lon;

      if (
        isNaN(meterLat) ||
        isNaN(meterLon) ||
        meterLat === null ||
        meterLon === null
      ) {
        console.warn(
          "Skipping meter with invalid coordinates:",
          meter.meterid,
          { lat: meterLat, lon: meterLon }
        );
        return;
      }

      // 価格表示アイコン使用 (選択曜日/時間反映)
      const priceIcon = createPriceIcon(meter, selectedDay, selectedHour);

      // 価格値を取得してマーカーオプションに保存
      const rate =
        selectedDay !== undefined && selectedHour !== undefined
          ? getRateByDayAndHour(meter, selectedDay, selectedHour)
          : getCurrentRate(meter);
      const priceValue = parsePrice(rate);

      const marker = L.marker([meterLat, meterLon], {
        icon: priceIcon,
        priceValue: priceValue,
      } as any);

      // マーカー参照保存
      markerRefs.current.set(meter.meterid, marker);

      // ポップアップ設定
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${meterLat},${meterLon}`;
      const appleMapsUrl = `http://maps.apple.com/?ll=${meterLat},${meterLon}&q=Parking`;

      // 営業時間パース (9:00 AM TO 10:00 PM形式抽出)
      const parseOperatingHours = (timeineffe: string | null) => {
        if (!timeineffe) return "N/A";
        const match = timeineffe.match(
          /(\d{1,2}:\d{2}\s*[AP]M\s*TO\s*\d{1,2}:\d{2}\s*[AP]M)/i
        );
        return match ? match[1] : "N/A";
      };

      const operatingHours = parseOperatingHours(meter.timeineffe);

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm mb-2">${meter.meterhead}</h3>
          <p class="text-xs mb-1">
            <strong>${t("parking.area")}:</strong> ${meter.geo_local_area}
          </p>
          <p class="text-xs mb-1">
            <strong>${t("parking.currentRate")}:</strong> ${getCurrentRate(
        meter
      )}
          </p>
          <p class="text-xs mb-1">
            <strong>${t("parking.operatingHours")}:</strong> ${operatingHours}
          </p>
          <p class="text-xs mb-2">
            <strong>${t("parking.creditCard")}:</strong> ${
        meter.creditcard === "Yes"
          ? t("parking.creditCardYes")
          : t("parking.creditCardNo")
      }
          </p>
          <div class="flex gap-2 mt-2">
            <a href="${googleMapsUrl}" target="_blank" 
               style="flex: 1; background-color: #3b82f6; color: white; text-align: center; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              <i class="fab fa-google" style="margin-right: 4px;"></i>${t(
                "parking.googleMaps"
              )}
            </a>
            <a href="${appleMapsUrl}" target="_blank"
               style="flex: 1; background-color: #374151; color: white; text-align: center; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              <i class="fab fa-apple" style="margin-right: 4px;"></i>${t(
                "parking.appleMaps"
              )}
            </a>
          </div>
        </div>
      `;

      // ポップアップがクリック時に閉じないよう設定
      marker.bindPopup(popupContent, {
        autoClose: false, // 他のポップアップ開いても閉じない
        closeOnClick: false, // マップクリック時も閉じない
      });

      // クリックイベント (onMeterClickのみ呼び出し)
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onMeterClick?.(meter);
      });

      markerClusterGroup.addLayer(marker);
    });

    // マップ追加
    map.addLayer(markerClusterGroup);

    // 地図移動/ズーム時bounds変更検知
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onBoundsChange?.({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };

    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);

    // クリーンアップ
    return () => {
      map.removeLayer(markerClusterGroup);
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);
      markerRefs.current.clear();
      clusterGroupRef.current = null;
    };
  }, [map, meters, onMeterClick, selectedDay, selectedHour, onBoundsChange]);

  // selectedMeter変更時、該当マーカーのポップアップを開く
  useEffect(() => {
    if (!selectedMeter || !clusterGroupRef.current) return;

    // クラスターグループから該当マーカーを探す
    const findAndOpenPopup = () => {
      const marker = markerRefs.current.get(selectedMeter.meterid);
      if (marker && map.hasLayer(marker)) {
        // マーカーが表示されているか確認
        marker.openPopup();
      }
    };

    // flyToアニメーション完了後にポップアップ開く
    const timer = setTimeout(findAndOpenPopup, 700);

    return () => clearTimeout(timer);
  }, [selectedMeter, map]);

  return null;
}

export default function ParkingMap({
  meters,
  center,
  zoom,
  selectedMeter,
  onMeterClick,
  selectedDay,
  selectedHour,
  onBoundsChange,
  zoomToMax,
}: ParkingMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <ChangeView selectedMeter={selectedMeter} zoomToMax={zoomToMax} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        meters={meters}
        selectedMeter={selectedMeter}
        onMeterClick={onMeterClick}
        selectedDay={selectedDay}
        selectedHour={selectedHour}
        onBoundsChange={onBoundsChange}
      />
    </MapContainer>
  );
}
