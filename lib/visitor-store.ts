import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type VisitorRecord = {
  id: string;
  createdAt: string;
  pathname: string;
  referrer: string | null;
  userAgent: string | null;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  ip: string;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  consent: 'accepted';
};

type VisitorStoreShape = {
  visits: VisitorRecord[];
};

const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(STORE_DIR, 'visitors.json');

async function ensureStore() {
  await mkdir(STORE_DIR, { recursive: true });
}

async function readStore(): Promise<VisitorStoreShape> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    if (!raw.trim()) return { visits: [] };
    const parsed = JSON.parse(raw) as Partial<VisitorStoreShape>;
    return { visits: Array.isArray(parsed.visits) ? parsed.visits : [] };
  } catch {
    return { visits: [] };
  }
}

async function writeStore(store: VisitorStoreShape) {
  await ensureStore();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function addVisitor(record: VisitorRecord) {
  const store = await readStore();
  store.visits.unshift(record);
  await writeStore(store);
  return record;
}

export async function getVisitors() {
  const store = await readStore();
  return store.visits;
}

export async function getVisitorSummary() {
  const visits = await getVisitors();
  const uniqueCountries = new Set(visits.map((visit) => visit.countryCode).filter(Boolean));
  const uniqueIps = new Set(visits.map((visit) => visit.ip).filter(Boolean));

  return {
    totalVisits: visits.length,
    uniqueCountries: uniqueCountries.size,
    uniqueIps: uniqueIps.size,
    latestVisit: visits[0] ?? null,
    visits,
  };
}

export async function getRecentKnownVisitorGeo() {
  const visits = await getVisitors();
  const recent = visits.find(
    (visit) =>
      Boolean(visit.city?.trim()) ||
      Boolean(visit.country?.trim()) ||
      Boolean(visit.timezone?.trim())
  );

  if (!recent) {
    return {
      city: null,
      region: null,
      country: null,
      countryCode: null,
      latitude: null,
      longitude: null,
      timezone: null,
    };
  }

  return {
    city: recent.city ?? null,
    region: recent.region ?? null,
    country: recent.country ?? null,
    countryCode: recent.countryCode ?? null,
    latitude: recent.latitude ?? null,
    longitude: recent.longitude ?? null,
    timezone: recent.timezone ?? null,
  };
}
