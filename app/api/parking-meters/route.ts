import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ParkingMeter } from "@/types/parking";

interface ParkingGeoJsonFeature {
  geometry?: {
    type?: string;
    coordinates?: [number, number];
  };
  properties?: {
    meter_id?: string;
    meter_head?: string;
    credit_card?: string | null;
    mobile_payment_number?: number | string | null;
    sector?: number | null;
    direction?: string | null;
    rate_9am_6pm?: string | null;
    rate_6pm_10pm?: string | null;
    flat_rate?: string | null;
    time_limit_9am_6pm?: string | null;
    time_limit_6pm_10pm?: string | null;
    time_limit_weekend_9am_6pm?: string | null;
    time_limit_weekend_6pm_10pm?: string | null;
    geo_point_2d?: {
      lon?: number;
      lat?: number;
    };
  };
}

interface ParkingGeoJsonCollection {
  features?: ParkingGeoJsonFeature[];
}

function normalizeMeter(feature: ParkingGeoJsonFeature) {
  const properties = feature.properties || {};
  const coordinates = feature.geometry?.coordinates;
  const lon = properties.geo_point_2d?.lon ?? coordinates?.[0];
  const lat = properties.geo_point_2d?.lat ?? coordinates?.[1];

  if (
    feature.geometry?.type !== "Point" ||
    lon === undefined ||
    lat === undefined ||
    Number.isNaN(lon) ||
    Number.isNaN(lat)
  ) {
    return null;
  }

  const sectorLabel =
    typeof feature.properties?.sector === "number"
      ? `Sector ${feature.properties.sector}`
      : "Unknown Sector";

  return {
    meterid: properties.meter_id || "",
    meterhead: properties.meter_head || "Unknown",
    r_mf_9a_6p: properties.rate_9am_6pm || null,
    r_mf_6p_10: properties.rate_6pm_10pm || null,
    r_sa_9a_6p: properties.rate_9am_6pm || null,
    r_sa_6p_10: properties.rate_6pm_10pm || null,
    r_su_9a_6p: properties.rate_9am_6pm || null,
    r_su_6p_10: properties.rate_6pm_10pm || null,
    rate_misc: properties.flat_rate || null,
    timeineffe: null,
    t_mf_9a_6p: properties.time_limit_9am_6pm || null,
    t_mf_6p_10: properties.time_limit_6pm_10pm || null,
    t_sa_9a_6p: properties.time_limit_weekend_9am_6pm || null,
    t_sa_6p_10: properties.time_limit_weekend_6pm_10pm || null,
    t_su_9a_6p: properties.time_limit_weekend_9am_6pm || null,
    t_su_6p_10: properties.time_limit_weekend_6pm_10pm || null,
    time_misc: null,
    creditcard: properties.credit_card || null,
    pay_phone:
      properties.mobile_payment_number !== undefined &&
      properties.mobile_payment_number !== null
        ? String(properties.mobile_payment_number)
        : null,
    geom: {
      type: "Feature",
      geometry: {
        coordinates: [lon, lat] as [number, number],
        type: "Point",
      },
      properties: {},
    },
    geo_local_area: sectorLabel,
    geo_point_2d: {
      lon,
      lat,
    },
    sector: properties.sector ?? null,
    direction: properties.direction ?? null,
  };
}

let cachedMetersPromise: Promise<ParkingMeter[]> | null = null;

async function loadMeters() {
  if (!cachedMetersPromise) {
    cachedMetersPromise = readFile(
      path.join(process.cwd(), "parking-meters.geojson"),
      "utf8"
    ).then((content) => {
      const data = JSON.parse(content) as ParkingGeoJsonCollection;
      return (data.features || [])
        .map((feature) => normalizeMeter(feature))
        .filter((meter): meter is NonNullable<typeof meter> => meter !== null);
    });
  }

  return cachedMetersPromise;
}

export async function GET() {
  try {
    const meters = await loadMeters();
    return NextResponse.json(meters);
  } catch (error) {
    console.error("Failed to load parking meters GeoJSON:", error);
    return NextResponse.json(
      { error: "Failed to load parking meters" },
      { status: 500 }
    );
  }
}
