import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

interface OsmNode {
  "@_id": string;
  "@_lat": string;
  "@_lon": string;
}

interface OsmWayNodeRef {
  "@_ref": string;
}

interface OsmTag {
  "@_k": string;
  "@_v": string;
}

interface OsmWay {
  "@_id": string;
  nd?: OsmWayNodeRef | OsmWayNodeRef[];
  tag?: OsmTag | OsmTag[];
}

interface OsmMapResponse {
  osm?: {
    node?: OsmNode | OsmNode[];
    way?: OsmWay | OsmWay[];
  };
}

interface RoadWay {
  id: number;
  highway: string;
  name: string | null;
  points: [number, number][];
}

const OSM_MAP_ENDPOINT = "https://api.openstreetmap.org/api/0.6/map";
const MAX_BBOX_AREA = 0.02;
const CACHE_TTL_MS = 1000 * 60 * 30;
const ROAD_HIGHWAY_TYPES = new Set([
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "unclassified",
  "residential",
  "living_street",
]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (_name, jPath) =>
    jPath === "osm.node" || jPath === "osm.way" || jPath === "osm.way.nd" || jPath === "osm.way.tag",
});

const roadCache = new Map<
  string,
  {
    expiresAt: number;
    roads: RoadWay[];
  }
>();

function parseBbox(value: string | null) {
  if (!value) {
    return null;
  }

  const parts = value.split(",").map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [south, west, north, east] = parts;

  if (south >= north || west >= east) {
    return null;
  }

  const area = (north - south) * (east - west);

  if (area > MAX_BBOX_AREA) {
    return null;
  }

  return { south, west, north, east };
}

function getCacheKey(bbox: NonNullable<ReturnType<typeof parseBbox>>) {
  return [
    bbox.south.toFixed(4),
    bbox.west.toFixed(4),
    bbox.north.toFixed(4),
    bbox.east.toFixed(4),
  ].join(",");
}

function buildOsmMapUrl(bbox: NonNullable<ReturnType<typeof parseBbox>>) {
  const params = new URLSearchParams({
    bbox: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`,
  });

  return `${OSM_MAP_ENDPOINT}?${params.toString()}`;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeRoads(data: OsmMapResponse): RoadWay[] {
  const nodes = asArray(data.osm?.node);
  const ways = asArray(data.osm?.way);
  const nodeMap = new Map<string, [number, number]>();

  nodes.forEach((node) => {
    const lat = Number(node["@_lat"]);
    const lon = Number(node["@_lon"]);

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      nodeMap.set(node["@_id"], [lat, lon]);
    }
  });

  return ways
    .map((way) => {
      const tags = new Map(
        asArray(way.tag).map((tag) => [tag["@_k"], tag["@_v"]])
      );
      const highway = tags.get("highway");

      if (!highway || !ROAD_HIGHWAY_TYPES.has(highway)) {
        return null;
      }

      const points = asArray(way.nd)
        .map((ref) => nodeMap.get(ref["@_ref"]))
        .filter((point): point is [number, number] => point !== undefined);

      if (points.length < 2) {
        return null;
      }

      return {
        id: Number(way["@_id"]),
        highway,
        name: tags.get("name") || null,
        points,
      };
    })
    .filter((road): road is RoadWay => road !== null);
}

export async function GET(request: NextRequest) {
  const bbox = parseBbox(request.nextUrl.searchParams.get("bbox"));

  if (!bbox) {
    return NextResponse.json({ roads: [] });
  }

  const cacheKey = getCacheKey(bbox);
  const cached = roadCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ roads: cached.roads });
  }

  try {
    const response = await fetch(buildOsmMapUrl(bbox), {
      headers: {
        "User-Agent": "Vancouver-Street-Parking/1.0",
      },
      next: {
        revalidate: 60 * 30,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ roads: [] }, { status: 502 });
    }

    const xml = await response.text();
    const data = xmlParser.parse(xml) as OsmMapResponse;
    const roads = normalizeRoads(data);

    roadCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      roads,
    });

    return NextResponse.json({ roads });
  } catch (error) {
    console.error("Failed to load OSM road geometry:", error);
    return NextResponse.json({ roads: [] }, { status: 502 });
  }
}
