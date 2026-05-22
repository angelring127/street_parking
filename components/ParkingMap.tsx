"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { ParkingMeter } from "@/types/parking";
import {
  calculateDistance,
  getCurrentRate,
  getRateByDayAndHour,
  parsePrice,
} from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ParkingMapProps {
  meters: ParkingMeter[];
  center: [number, number];
  zoom: number;
  selectedMeter?: ParkingMeter;
  onMeterClick?: (meter: ParkingMeter) => void;
  selectedDay?: number;
  selectedHour?: number;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  zoomToMax?: boolean;
  userLocation?: { lat: number; lon: number };
  followMyLocation?: boolean;
  onUserMapDrag?: () => void;
  onViewportChange?: (view: {
    center: [number, number];
    zoom: number;
  }) => void;
}

interface MarkerGroup {
  key: string;
  meters: ParkingMeter[];
  rate: string;
  priceValue: number;
  center: [number, number];
  representative: ParkingMeter;
}

const GROUPING_ZOOM = 16;
const BLOCK_GAP_METERS = 30;

function getRateForMeter(
  meter: ParkingMeter,
  selectedDay?: number,
  selectedHour?: number
) {
  if (selectedDay !== undefined && selectedHour !== undefined) {
    return getRateByDayAndHour(meter, selectedDay, selectedHour);
  }

  return getCurrentRate(meter);
}

function getPriceColor(price: number) {
  if (price >= 4) {
    return "#ef4444";
  }

  if (price >= 3) {
    return "#f59e0b";
  }

  return "#10b981";
}

function calculateCentroid(meters: ParkingMeter[]): [number, number] {
  const sums = meters.reduce(
    (acc, meter) => {
      acc.lat += meter.geo_point_2d.lat;
      acc.lon += meter.geo_point_2d.lon;
      return acc;
    },
    { lat: 0, lon: 0 }
  );

  return [sums.lat / meters.length, sums.lon / meters.length];
}

function findRepresentativeMeter(
  meters: ParkingMeter[],
  center: [number, number]
): ParkingMeter {
  let representative = meters[0];
  let minDistance = Infinity;

  meters.forEach((meter) => {
    const distance = calculateDistance(
      center[0],
      center[1],
      meter.geo_point_2d.lat,
      meter.geo_point_2d.lon
    );

    if (distance < minDistance) {
      minDistance = distance;
      representative = meter;
    }
  });

  return representative;
}

function buildMarkerGroups(
  meters: ParkingMeter[],
  selectedDay?: number,
  selectedHour?: number
) {
  const validMeters = meters.filter((meter) => {
    const lat = meter.geo_point_2d.lat;
    const lon = meter.geo_point_2d.lon;

    return (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat !== null &&
      lon !== null &&
      isFinite(lat) &&
      isFinite(lon)
    );
  });

  const byGroupKey = new Map<
    string,
    Array<{ meter: ParkingMeter; rate: string; priceValue: number }>
  >();

  validMeters.forEach((meter) => {
    const rate = getRateForMeter(meter, selectedDay, selectedHour);
    const priceValue = parsePrice(rate);
    const sectorKey =
      typeof meter.sector === "number" ? `sector-${meter.sector}` : "sector-none";
    const groupKey = `${rate}::${sectorKey}`;
    const items = byGroupKey.get(groupKey) || [];
    items.push({ meter, rate, priceValue });
    byGroupKey.set(groupKey, items);
  });

  const groups: MarkerGroup[] = [];

  byGroupKey.forEach((items, groupKey) => {
    const [rate] = groupKey.split("::");

    const byDirection = new Map<
      string,
      Array<{ meter: ParkingMeter; rate: string; priceValue: number }>
    >();

    items.forEach((item) => {
      const directionKey = item.meter.direction?.trim() || "direction-none";
      const directionItems = byDirection.get(directionKey) || [];
      directionItems.push(item);
      byDirection.set(directionKey, directionItems);
    });

    byDirection.forEach((directionItems, directionKey) => {
      const orderedItems = [...directionItems].sort((a, b) => {
        const direction = directionKey.toLowerCase();

        if (direction === "east" || direction === "west") {
          return (
            a.meter.geo_point_2d.lon - b.meter.geo_point_2d.lon ||
            a.meter.geo_point_2d.lat - b.meter.geo_point_2d.lat
          );
        }

        if (direction === "north" || direction === "south") {
          return (
            a.meter.geo_point_2d.lat - b.meter.geo_point_2d.lat ||
            a.meter.geo_point_2d.lon - b.meter.geo_point_2d.lon
          );
        }

        const deltaLat = Math.max(
          ...directionItems.map((item) => item.meter.geo_point_2d.lat)
        ) - Math.min(...directionItems.map((item) => item.meter.geo_point_2d.lat));
        const deltaLon = Math.max(
          ...directionItems.map((item) => item.meter.geo_point_2d.lon)
        ) - Math.min(...directionItems.map((item) => item.meter.geo_point_2d.lon));

        if (deltaLon >= deltaLat) {
          return (
            a.meter.geo_point_2d.lon - b.meter.geo_point_2d.lon ||
            a.meter.geo_point_2d.lat - b.meter.geo_point_2d.lat
          );
        }

        return (
          a.meter.geo_point_2d.lat - b.meter.geo_point_2d.lat ||
          a.meter.geo_point_2d.lon - b.meter.geo_point_2d.lon
        );
      });

      let currentBlock: typeof orderedItems = [];

      const flushCurrentBlock = () => {
        if (currentBlock.length === 0) {
          return;
        }

        const groupedMeters = currentBlock.map((item) => item.meter);
        const center = calculateCentroid(groupedMeters);
        const representative = findRepresentativeMeter(groupedMeters, center);
        const priceValue = currentBlock[0].priceValue;

        groups.push({
          key: `${rate}-${directionKey}-${representative.meterid}-${groupedMeters.length}`,
          meters: groupedMeters,
          rate,
          priceValue,
          center,
          representative,
        });

        currentBlock = [];
      };

      orderedItems.forEach((item, index) => {
        if (index === 0) {
          currentBlock.push(item);
          return;
        }

        const previous = orderedItems[index - 1];
        const gapMeters =
          calculateDistance(
            previous.meter.geo_point_2d.lat,
            previous.meter.geo_point_2d.lon,
            item.meter.geo_point_2d.lat,
            item.meter.geo_point_2d.lon
          ) * 1000;

        if (gapMeters > BLOCK_GAP_METERS) {
          flushCurrentBlock();
        }

        currentBlock.push(item);
      });

      flushCurrentBlock();
    });
  });

  return groups;
}

function createPriceIcon(rate: string, priceValue: number) {
  const bgColor = getPriceColor(priceValue);

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
}

function createGroupedPriceIcon(rate: string, priceValue: number) {
  const bgColor = getPriceColor(priceValue);
  const label = rate;
  const width = Math.max(72, label.length * 9 + 18);

  return L.divIcon({
    html: `
      <div
        style="
          min-width: ${width}px;
          height: 32px;
          padding: 0 12px;
          border-radius: 9999px;
          background-color: ${bgColor};
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        "
      >
        ${label}
      </div>
    `,
    className: "custom-price-marker grouped-price-marker",
    iconSize: [width, 32],
    iconAnchor: [width / 2, 32],
    popupAnchor: [0, -32],
  });
}

function dedupePoints(points: [number, number][]) {
  return Array.from(
    new Map(points.map((point) => [`${point[0]}:${point[1]}`, point])).values()
  );
}

function getSegmentFromPoints(points: [number, number][]): L.LatLngExpression[] | null {
  const uniquePoints = dedupePoints(points);

  if (uniquePoints.length <= 1) {
    return null;
  }

  let maxDistance = -1;
  let endpoints: [[number, number], [number, number]] | null = null;

  for (let i = 0; i < uniquePoints.length; i++) {
    for (let j = i + 1; j < uniquePoints.length; j++) {
      const pointA = uniquePoints[i];
      const pointB = uniquePoints[j];
      const distance = calculateDistance(
        pointA[0],
        pointA[1],
        pointB[0],
        pointB[1]
      );

      if (distance > maxDistance) {
        maxDistance = distance;
        endpoints = [pointA, pointB];
      }
    }
  }

  return endpoints ? [endpoints[0], endpoints[1]] : null;
}

function getGroupedLineSegments(meters: ParkingMeter[]): L.LatLngExpression[][] {
  const segment = getSegmentFromPoints(
    meters.map((meter) => [meter.geo_point_2d.lat, meter.geo_point_2d.lon])
  );

  return segment ? [segment] : [];
}

function parseOperatingHours(timeineffe: string | null) {
  if (!timeineffe) return "N/A";

  const match = timeineffe.match(
    /(\d{1,2}:\d{2}\s*[AP]M\s*TO\s*\d{1,2}:\d{2}\s*[AP]M)/i
  );

  return match ? match[1] : "N/A";
}

function buildPopupContent(group: MarkerGroup, t: (key: string) => string) {
  const { representative, center, meters, rate } = group;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${center[0]},${center[1]}`;
  const appleMapsUrl = `http://maps.apple.com/?ll=${center[0]},${center[1]}&q=Parking`;
  const operatingHours = parseOperatingHours(representative.timeineffe);
  const areas = Array.from(new Set(meters.map((meter) => meter.geo_local_area)));
  const title = meters.length > 1 ? rate : representative.meterhead;
  const areaText = areas.join(", ");

  return `
    <div class="p-2">
      <h3 class="font-bold text-sm mb-2">${title}</h3>
      <p class="text-xs mb-1">
        <strong>${t("parking.area")}:</strong> ${areaText}
      </p>
      <p class="text-xs mb-1">
        <strong>${t("parking.currentRate")}:</strong> ${rate}
      </p>
      <p class="text-xs mb-1">
        <strong>${t("parking.meterCount")}:</strong> ${meters.length}
      </p>
      <p class="text-xs mb-1">
        <strong>${t("parking.operatingHours")}:</strong> ${operatingHours}
      </p>
      <p class="text-xs mb-2">
        <strong>${t("parking.creditCard")}:</strong> ${
          representative.creditcard === "Yes"
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
}

function ChangeView({
  selectedMeter,
  zoomToMax,
  center,
  zoom,
}: {
  selectedMeter?: ParkingMeter;
  zoomToMax?: boolean;
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  const prevSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedMeter && prevSelectedRef.current !== selectedMeter.meterid) {
      const lat = Number(selectedMeter.geo_point_2d.lat);
      const lon = Number(selectedMeter.geo_point_2d.lon);

      if (
        isNaN(lat) ||
        isNaN(lon) ||
        !isFinite(lat) ||
        !isFinite(lon) ||
        lat === 0 ||
        lon === 0
      ) {
        return;
      }

      prevSelectedRef.current = selectedMeter.meterid;

      const currentZoom = map.getZoom();
      const targetZoom = zoomToMax ? 18 : currentZoom;
      const safeZoom = isNaN(targetZoom) ? 15 : targetZoom;

      map.setView([lat, lon], safeZoom);
    }
  }, [selectedMeter, map, zoomToMax]);

  useEffect(() => {
    if (
      center &&
      center.length === 2 &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

function MapInteractionHandler({
  followMyLocation,
  onUserMapDrag,
  onViewportChange,
}: {
  followMyLocation?: boolean;
  onUserMapDrag?: () => void;
  onViewportChange?: (view: { center: [number, number]; zoom: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleDragStart = () => {
      if (followMyLocation) {
        onUserMapDrag?.();
      }
    };

    const handleViewportChange = () => {
      const center = map.getCenter();
      onViewportChange?.({
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      });
    };

    map.on("dragstart", handleDragStart);
    map.on("moveend", handleViewportChange);
    map.on("zoomend", handleViewportChange);

    return () => {
      map.off("dragstart", handleDragStart);
      map.off("moveend", handleViewportChange);
      map.off("zoomend", handleViewportChange);
    };
  }, [map, followMyLocation, onUserMapDrag, onViewportChange]);

  return null;
}

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
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}) {
  const { t } = useLanguage();
  const map = useMap();
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [currentZoom, setCurrentZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const handleZoomChange = () => {
      setCurrentZoom(map.getZoom());
    };

    map.on("zoomend", handleZoomChange);

    return () => {
      map.off("zoomend", handleZoomChange);
    };
  }, [map]);

  useEffect(() => {
    const markerRefsSnapshot = markerRefs.current;
    markerRefsSnapshot.clear();
    const extraLayers: L.Layer[] = [];

    const markerClusterGroup = L.markerClusterGroup({
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();

        let totalPrice = 0;
        let validPriceCount = 0;

        markers.forEach((marker: L.Marker) => {
          const priceValue = (
            marker.options as L.MarkerOptions & { priceValue?: number }
          ).priceValue;

          if (priceValue !== undefined) {
            totalPrice += priceValue;
            validPriceCount++;
          }
        });

        const avgPrice = validPriceCount > 0 ? totalPrice / validPriceCount : 0;
        const bgColor = getPriceColor(avgPrice);

        return L.divIcon({
          html: `<div style="background-color: ${bgColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><span>${count}</span></div>`,
          className: "marker-cluster-custom",
          iconSize: L.point(40, 40),
        });
      },
      disableClusteringAtZoom: GROUPING_ZOOM,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: false,
      spiderfyOnEveryZoom: false,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
    });

    clusterGroupRef.current = markerClusterGroup;

    const markerGroups =
      currentZoom >= GROUPING_ZOOM
        ? buildMarkerGroups(meters, selectedDay, selectedHour)
        : meters
            .filter((meter) => {
              const lat = meter.geo_point_2d.lat;
              const lon = meter.geo_point_2d.lon;

              return (
                !isNaN(lat) &&
                !isNaN(lon) &&
                lat !== null &&
                lon !== null &&
                isFinite(lat) &&
                isFinite(lon)
              );
            })
            .map((meter) => {
              const rate = getRateForMeter(meter, selectedDay, selectedHour);
              const priceValue = parsePrice(rate);

              return {
                key: `${meter.meterid}-${rate}`,
                meters: [meter],
                rate,
                priceValue,
                center: [meter.geo_point_2d.lat, meter.geo_point_2d.lon] as [
                  number,
                  number,
                ],
                representative: meter,
              };
            });

    markerGroups.forEach((group) => {
      const isGrouped = group.meters.length > 1;
      const icon = isGrouped
        ? createGroupedPriceIcon(group.rate, group.priceValue)
        : createPriceIcon(group.rate, group.priceValue);
      const popupContent = buildPopupContent(group, t);
      const groupedLines: L.Polyline[] = [];

      const marker = L.marker(group.center, {
        icon,
        priceValue: group.priceValue,
      } as L.MarkerOptions & { priceValue?: number });

      group.meters.forEach((meter) => {
        markerRefsSnapshot.set(meter.meterid, marker);
      });

      marker.bindPopup(popupContent, {
        autoClose: false,
        closeOnClick: false,
        autoPan: false,
      });

      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        onMeterClick?.(group.representative);
      });

      markerClusterGroup.addLayer(marker);

      const setMarkerHoverAppearance = (hovered: boolean) => {
        marker.setZIndexOffset(hovered ? 1000 : 0);

        const markerElement = marker.getElement();
        const markerInner = markerElement?.firstElementChild as HTMLElement | null;

        if (markerInner) {
          markerInner.style.transform = hovered ? "scale(1.08)" : "scale(1)";
          markerInner.style.transformOrigin = "center bottom";
          markerInner.style.transition = "transform 120ms ease";
          markerInner.style.boxShadow = hovered
            ? "0 4px 12px rgba(0, 0, 0, 0.45)"
            : "0 2px 6px rgba(0, 0, 0, 0.35)";
        }
      };

      if (isGrouped) {
        const lineSegments = getGroupedLineSegments(group.meters);

        lineSegments.forEach((lineLatLngs) => {
          const line = L.polyline(lineLatLngs, {
            color: getPriceColor(group.priceValue),
            weight: 8,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          });

          line.bindPopup(popupContent, {
            autoClose: false,
            closeOnClick: false,
            autoPan: false,
          });

          const setHoveredStyle = (hovered: boolean) => {
            line.setStyle({
              color: getPriceColor(group.priceValue),
              weight: hovered ? 11 : 8,
              opacity: hovered ? 1 : 0.85,
              lineCap: "round",
              lineJoin: "round",
            });
            setMarkerHoverAppearance(hovered);
          };

          line.on("mouseover", () => {
            setHoveredStyle(true);
            line.openPopup();
          });

          line.on("mouseout", () => {
            setHoveredStyle(false);
            line.closePopup();
          });

          line.on("click", () => {
            onMeterClick?.(group.representative);
            line.openPopup();
          });

          line.addTo(map);
          groupedLines.push(line);
          extraLayers.push(line);
        });
      }

      if (isGrouped) {
        const setGroupedHoverState = (hovered: boolean) => {
          groupedLines.forEach((line) => {
            line.setStyle({
              weight: hovered ? 11 : 8,
              opacity: hovered ? 1 : 0.85,
            });
          });
          setMarkerHoverAppearance(hovered);
        };

        marker.on("mouseover", () => {
          setGroupedHoverState(true);
          marker.openPopup();
        });

        marker.on("mouseout", () => {
          setGroupedHoverState(false);
          marker.closePopup();
        });
      }
    });

    map.addLayer(markerClusterGroup);

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

    return () => {
      map.removeLayer(markerClusterGroup);
      extraLayers.forEach((layer) => map.removeLayer(layer));
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);
      markerRefsSnapshot.clear();
      clusterGroupRef.current = null;
    };
  }, [map, meters, onMeterClick, selectedDay, selectedHour, onBoundsChange, t, currentZoom]);

  useEffect(() => {
    if (!selectedMeter || !clusterGroupRef.current) return;

    const findAndOpenPopup = () => {
      const marker = markerRefs.current.get(selectedMeter.meterid);
      if (marker && map.hasLayer(marker)) {
        marker.openPopup();
      }
    };

    const timer = setTimeout(findAndOpenPopup, 700);

    return () => clearTimeout(timer);
  }, [selectedMeter, map]);

  return null;
}

function UserLocationMarker({
  userLocation,
}: {
  userLocation?: { lat: number; lon: number };
}) {
  const map = useMap();
  const { t } = useLanguage();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!userLocation || !map) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
      className: "user-location-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
    } else {
      const marker = L.marker([userLocation.lat, userLocation.lon], {
        icon: userIcon,
        zIndexOffset: 1000,
      });
      marker.addTo(map);
      markerRef.current = marker;

      marker.bindPopup(
        `<div style="text-align: center; padding: 4px;">
          <strong>${t("location.yourLocation")}</strong>
        </div>`,
        {
          autoPan: false,
        }
      );
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [userLocation, map, t]);

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
  userLocation,
  followMyLocation,
  onUserMapDrag,
  onViewportChange,
}: ParkingMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <ChangeView
        selectedMeter={selectedMeter}
        zoomToMax={zoomToMax}
        center={center}
        zoom={zoom}
      />
      <MapInteractionHandler
        followMyLocation={followMyLocation}
        onUserMapDrag={onUserMapDrag}
        onViewportChange={onViewportChange}
      />
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
      <UserLocationMarker userLocation={userLocation} />
    </MapContainer>
  );
}
