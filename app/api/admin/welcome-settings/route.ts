import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/admin-auth';
import { getWelcomeSettings, saveWelcomeSettings } from '@/lib/welcome-settings';
import type { MotionSoundMode, SectionVoicePrompt, WelcomeVoiceStyle } from '@/lib/welcome-settings';

async function requireAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getWelcomeSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        enabled?: unknown;
        text?: unknown;
        voiceStyle?: unknown;
        voiceName?: unknown;
        motionSoundMode?: unknown;
        sectionVoiceEnabled?: unknown;
        sectionPrompts?: unknown;
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });
  }

  const settings = await saveWelcomeSettings({
    enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
    text: typeof body.text === 'string' ? body.text : undefined,
    voiceStyle: typeof body.voiceStyle === 'string' ? body.voiceStyle as WelcomeVoiceStyle : undefined,
    voiceName: typeof body.voiceName === 'string' ? body.voiceName : null,
    motionSoundMode: typeof body.motionSoundMode === 'string' ? body.motionSoundMode as MotionSoundMode : undefined,
    sectionVoiceEnabled: typeof body.sectionVoiceEnabled === 'boolean' ? body.sectionVoiceEnabled : undefined,
    sectionPrompts: Array.isArray(body.sectionPrompts) ? body.sectionPrompts as SectionVoicePrompt[] : undefined,
  });

  return NextResponse.json(settings);
}
