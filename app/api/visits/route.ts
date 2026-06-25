import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { addVisitor, getRecentKnownVisitorGeo } from '@/lib/visitor-store';
import { extractIp, isPrivateIp, parseUserAgent } from '@/lib/analytics-helpers';

export const runtime = 'nodejs';

type GeoResponse = {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number | string;
  longitude?: number | string;
  timezone?: string;
};

type VisitorGeo = {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
};

function getHostedGeo(request: Request) {
  const headers = request.headers;
  const city = headers.get('x-vercel-ip-city');
  const region = headers.get('x-vercel-ip-country-region');
  const country = headers.get('x-vercel-ip-country');
  const latitude = headers.get('x-vercel-ip-latitude');
  const longitude = headers.get('x-vercel-ip-longitude');
  const timezone = headers.get('x-vercel-ip-timezone');

  if (!city && !region && !country && !latitude && !longitude && !timezone) {
    return null;
  }

  return {
    city: city ?? null,
    region: region ?? null,
    country: country ?? null,
    countryCode: country ?? null,
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
    timezone: timezone ?? null,
  };
}

async function resolveGeo(ip: string): Promise<VisitorGeo | null> {
  if (!ip || ip === 'unknown') {
    return null;
  }

  const endpoint = isPrivateIp(ip)
    ? 'http://ip-api.com/json/?fields=status,country,city,timezone,lat,lon'
    : `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city,timezone,lat,lon`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const raw = await response.text();
    if (!raw.trim()) return null;

    const data = JSON.parse(raw) as {
      status?: string;
      country?: string | null;
      city?: string | null;
      timezone?: string | null;
      lat?: number | null;
      lon?: number | null;
    };

    if (data.status && data.status !== 'success') return null;

    return {
      city: data.city ?? null,
      region: null,
      country: data.country ?? null,
      countryCode: null,
      latitude: data.lat ?? null,
      longitude: data.lon ?? null,
      timezone: data.timezone ?? null,
    };
  } catch {
    return null;
  }
}

async function resolveGeoWithFallback(request: Request, ip: string): Promise<VisitorGeo | null> {
  const hostedGeo = getHostedGeo(request);
  if (hostedGeo) {
    return hostedGeo;
  }

  let geo = await resolveGeo(ip);
  if (geo) return geo;

  if (isPrivateIp(ip)) {
    geo = await getRecentKnownVisitorGeo();
    if (geo) return geo;
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        pathname?: string;
        referrer?: string | null;
        userAgent?: string | null;
        timezone?: string | null;
        consent?: string;
      }
    | null;

  if (!body || body.consent !== 'accepted') {
    return NextResponse.json({ ok: true, tracked: false });
  }

  const ip = extractIp(request.headers);
  const location = await resolveGeoWithFallback(request, ip);
  const { deviceType, os, browser } = parseUserAgent(body.userAgent ?? request.headers.get('user-agent') ?? '');
  const localNetwork = isPrivateIp(ip);
  const record = await addVisitor({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    pathname: body.pathname ?? '/',
    referrer: body.referrer ?? null,
    userAgent: body.userAgent ?? request.headers.get('user-agent'),
    deviceType,
    os,
    browser,
    ip,
    city: location?.city ?? (localNetwork ? 'Local device' : null),
    region: location?.region ?? null,
    country: location?.country ?? (localNetwork ? 'Private network' : null),
    countryCode: location?.countryCode ?? null,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    timezone: body.timezone ?? location?.timezone ?? null,
    consent: 'accepted',
  });

  return NextResponse.json({ ok: true, visit: record });
}
