import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';

export type WelcomeVoiceStyle = 'soft-male' | 'neutral' | 'soft-female' | 'browser-default';
export type MotionSoundMode = 'off' | 'section-change' | 'cursor';

export type SectionVoicePrompt = {
  id: string;
  label: string;
  enabled: boolean;
  text: string;
};

export type WelcomeSettings = {
  enabled: boolean;
  text: string;
  voiceStyle: WelcomeVoiceStyle;
  voiceName: string | null;
  motionSoundMode: MotionSoundMode;
  sectionVoiceEnabled: boolean;
  sectionPrompts: SectionVoicePrompt[];
};

const PRIMARY_STORE_PATH = process.env.WELCOME_SETTINGS_STORE_PATH
  ? path.resolve(process.env.WELCOME_SETTINGS_STORE_PATH)
  : path.join(process.cwd(), 'data', 'welcome-settings.json');
const FALLBACK_STORE_PATH = path.join(os.tmpdir(), 'welcome-settings.json');
const STORE_DIR = path.dirname(PRIMARY_STORE_PATH);

export const defaultWelcomeSettings: WelcomeSettings = {
  enabled: true,
  text: 'Hi, welcome to my portfolio. This is Tejas. Explore my work in AI, systems, and engineering.',
  voiceStyle: 'soft-male',
  voiceName: null,
  motionSoundMode: 'section-change',
  sectionVoiceEnabled: true,
  sectionPrompts: [
    { id: 'snapshot', label: 'Engineering Snapshot', enabled: true, text: 'Here is a quick snapshot of delivery, scale, and system impact.' },
    { id: 'skills', label: 'Skills Matrix', enabled: true, text: 'Let us explore the skills matrix and the stack behind my work.' },
    { id: 'projects', label: 'Projects', enabled: true, text: 'Let us explore my projects now.' },
    { id: 'architecture', label: 'System Architectures', enabled: true, text: 'Let us look at the system architectures behind these builds.' },
    { id: 'timeline', label: 'Experience', enabled: true, text: 'Let us dive into my experience and engineering journey.' },
    { id: 'labs', label: 'Labs', enabled: true, text: 'These are the active labs where ideas turn into working systems.' },
    { id: 'github', label: 'GitHub Intelligence', enabled: true, text: 'Here is a look at GitHub activity, contributions, and momentum.' },
    { id: 'blog', label: 'Blog', enabled: true, text: 'Let us open the knowledge base and engineering articles.' },
    { id: 'contact', label: 'Contact', enabled: true, text: 'You can reach out here for direct collaboration.' },
  ],
};

let cachedSettings: WelcomeSettings = defaultWelcomeSettings;

function sanitizeSettings(input: Partial<WelcomeSettings>): WelcomeSettings {
  const allowedStyles: WelcomeVoiceStyle[] = ['soft-male', 'neutral', 'soft-female', 'browser-default'];
  const allowedMotionModes: MotionSoundMode[] = ['off', 'section-change', 'cursor'];
  const text = typeof input.text === 'string' ? input.text.trim().slice(0, 240) : '';
  const voiceStyle = allowedStyles.includes(input.voiceStyle as WelcomeVoiceStyle)
    ? input.voiceStyle as WelcomeVoiceStyle
    : defaultWelcomeSettings.voiceStyle;
  const motionSoundMode = allowedMotionModes.includes(input.motionSoundMode as MotionSoundMode)
    ? input.motionSoundMode as MotionSoundMode
    : defaultWelcomeSettings.motionSoundMode;
  const voiceName = typeof input.voiceName === 'string' && input.voiceName.trim()
    ? input.voiceName.trim().slice(0, 120)
    : null;
  const providedPrompts = Array.isArray(input.sectionPrompts) ? input.sectionPrompts : [];
  const sectionPrompts = defaultWelcomeSettings.sectionPrompts.map((fallback) => {
    const provided = providedPrompts.find((prompt) => prompt?.id === fallback.id);
    const promptText = typeof provided?.text === 'string' ? provided.text.trim().slice(0, 180) : '';

    return {
      id: fallback.id,
      label: fallback.label,
      enabled: typeof provided?.enabled === 'boolean' ? provided.enabled : fallback.enabled,
      text: promptText || fallback.text,
    };
  });

  return {
    enabled: typeof input.enabled === 'boolean' ? input.enabled : defaultWelcomeSettings.enabled,
    text: text || defaultWelcomeSettings.text,
    voiceStyle,
    voiceName,
    motionSoundMode,
    sectionVoiceEnabled: typeof input.sectionVoiceEnabled === 'boolean'
      ? input.sectionVoiceEnabled
      : defaultWelcomeSettings.sectionVoiceEnabled,
    sectionPrompts,
  };
}

async function ensureStore() {
  await mkdir(STORE_DIR, { recursive: true });
}

async function writeAtomicJson(targetPath: string, settings: WelcomeSettings) {
  const dir = path.dirname(targetPath);
  await mkdir(dir, { recursive: true });
  const tmpPath = path.join(
    dir,
    `${path.basename(targetPath)}.${process.pid}.${Date.now()}.tmp`,
  );
  await writeFile(tmpPath, JSON.stringify(settings, null, 2), 'utf8');
  await rename(tmpPath, targetPath);
}

export async function getWelcomeSettings(): Promise<WelcomeSettings> {
  try {
    const raw = await readFile(PRIMARY_STORE_PATH, 'utf8');
    if (!raw.trim()) return defaultWelcomeSettings;
    const parsed = JSON.parse(raw) as Partial<WelcomeSettings>;
    cachedSettings = sanitizeSettings({ ...defaultWelcomeSettings, ...parsed });
    return cachedSettings;
  } catch {
    try {
      const raw = await readFile(FALLBACK_STORE_PATH, 'utf8');
      if (!raw.trim()) return cachedSettings;
      const parsed = JSON.parse(raw) as Partial<WelcomeSettings>;
      cachedSettings = sanitizeSettings({ ...defaultWelcomeSettings, ...parsed });
      return cachedSettings;
    } catch {
      return cachedSettings;
    }
  }
}

export async function saveWelcomeSettings(input: Partial<WelcomeSettings>) {
  const settings = sanitizeSettings(input);
  try {
    await writeAtomicJson(PRIMARY_STORE_PATH, settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!message.includes('EROFS')) {
      throw error;
    }

    await writeAtomicJson(FALLBACK_STORE_PATH, settings);
  }
  cachedSettings = settings;
  return settings;
}
