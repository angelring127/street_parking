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

interface ParkingMapProps {
  meters: ParkingMeter[];
  center: [number, number];
  zoom: number;
  selectedMeter?: ParkingMeter;
  onMeterClick?: (meter: ParkingMeter) => void;
  selectedDay?: number;
  selectedHour?: number;
}

// 지도 중심 변경을 위한 컴포넌트 (selectedMeter가 변경될 때만)
function ChangeView({ selectedMeter }: { selectedMeter?: ParkingMeter }) {
  const map = useMap();
  const prevSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedMeter && prevSelectedRef.current !== selectedMeter.meterid) {
      prevSelectedRef.current = selectedMeter.meterid;
      // 선택된 마커로 부드럽게 이동 (줌 변경 없음)
      map.flyTo(
        [selectedMeter.geo_point_2d.lat, selectedMeter.geo_point_2d.lon],
        map.getZoom(),
        { duration: 0.5 }
      );
    }
  }, [selectedMeter, map]);

  return null;
}

// 금액 표시 아이콘 생성 함수
const createPriceIcon = (meter: ParkingMeter, day?: number, hour?: number) => {
  // 요일/시간이 지정되면 해당 시간의 요금, 아니면 현재 시간 요금
  const rate =
    day !== undefined && hour !== undefined
      ? getRateByDayAndHour(meter, day, hour)
      : getCurrentRate(meter);
  const price = parsePrice(rate);

  // 가격에 따른 색상 설정
  let bgColor = "#10b981"; // 초록색 (저렴)
  if (price >= 4) {
    bgColor = "#ef4444"; // 빨간색 (비쌈)
  } else if (price >= 3) {
    bgColor = "#f59e0b"; // 주황색 (중간)
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
}: {
  meters: ParkingMeter[];
  selectedMeter?: ParkingMeter;
  onMeterClick?: (meter: ParkingMeter) => void;
  selectedDay?: number;
  selectedHour?: number;
}) {
  const map = useMap();
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    // マーカークラスターグループを作成
    const markerClusterGroup = L.markerClusterGroup({
      // クラスターアイコンのカスタマイズ
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let className = "marker-cluster-small";

        if (count >= 100) {
          className = "marker-cluster-large";
        } else if (count >= 50) {
          className = "marker-cluster-medium";
        }

        return L.divIcon({
          html: `<div><span>${count}개</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(80, 80), // 크기 더 증가
        });
      },
      // ズームレベルに応じてクラスター解除
      disableClusteringAtZoom: 17,
      // クラスター半径
      maxClusterRadius: 80,
      // スパイダーファイを無効化 (物方울 효과 제거)
      spiderfyOnMaxZoom: false,
      spiderfyOnEveryZoom: false,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
    });

    // 各メーターにマーカーを追加
    meters.forEach((meter) => {
      // 금액 표시 아이콘 사용 (선택된 요일/시간 반영)
      const priceIcon = createPriceIcon(meter, selectedDay, selectedHour);

      const marker = L.marker(
        [meter.geo_point_2d.lat, meter.geo_point_2d.lon],
        { icon: priceIcon }
      );

      // マーカー参照を保存
      markerRefs.current.set(meter.meterid, marker);

      // ポップアップ設定
      const lat = meter.geo_point_2d.lat;
      const lon = meter.geo_point_2d.lon;
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      const appleMapsUrl = `http://maps.apple.com/?ll=${lat},${lon}&q=Parking`;

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm mb-2">${meter.meterhead}</h3>
          <p class="text-xs mb-1">
            <strong>지역:</strong> ${meter.geo_local_area}
          </p>
          <p class="text-xs mb-1">
            <strong>현재 요금:</strong> ${getCurrentRate(meter)}
          </p>
          <p class="text-xs mb-1">
            <strong>운영 시간:</strong> ${meter.timeineffe || "N/A"}
          </p>
          <p class="text-xs mb-2">
            <strong>신용카드:</strong> ${
              meter.creditcard === "Yes" ? "가능" : "불가"
            }
          </p>
          <div class="flex gap-2 mt-2">
            <a href="${googleMapsUrl}" target="_blank" 
               style="flex: 1; background-color: #3b82f6; color: white; text-align: center; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              🗺️ Google Maps
            </a>
            <a href="${appleMapsUrl}" target="_blank"
               style="flex: 1; background-color: #374151; color: white; text-align: center; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              🍎 Apple Maps
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // クリックイベント (줌 변경 방지)
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onMeterClick?.(meter);
      });

      markerClusterGroup.addLayer(marker);
    });

    // マップに追加
    map.addLayer(markerClusterGroup);

    // クリーンアップ
    return () => {
      map.removeLayer(markerClusterGroup);
      markerRefs.current.clear();
    };
  }, [map, meters, onMeterClick, selectedDay, selectedHour]);

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
}: ParkingMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p>지도 로딩 중...</p>
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
      <ChangeView selectedMeter={selectedMeter} />
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
      />
    </MapContainer>
  );
}
