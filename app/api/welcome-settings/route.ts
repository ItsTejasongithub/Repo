import { NextResponse } from 'next/server';
import { getWelcomeSettings } from '@/lib/welcome-settings';

export async function GET() {
  const settings = await getWelcomeSettings();
  return NextResponse.json(settings);
}
