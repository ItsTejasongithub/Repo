'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MotionSoundMode, WelcomeSettings, WelcomeVoiceStyle } from '@/lib/welcome-settings';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const voiceStyles: { value: WelcomeVoiceStyle; label: string }[] = [
  { value: 'soft-male', label: 'Soft male' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'soft-female', label: 'Soft female' },
  { value: 'browser-default', label: 'Browser default' },
];

const motionModes: { value: MotionSoundMode; label: string }[] = [
  { value: 'section-change', label: 'Section change only' },
  { value: 'off', label: 'Off' },
  { value: 'cursor', label: 'Every cursor move' },
];

export function WelcomeSettingsForm({ initialSettings }: { initialSettings: WelcomeSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [state, setState] = useState<SaveState>('idle');

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const englishVoices = useMemo(
    () => voices.filter((voice) => voice.lang.toLowerCase().startsWith('en')),
    [voices],
  );

  const updateSettings = (next: Partial<WelcomeSettings>) => {
    setSettings((current) => ({ ...current, ...next }));
    setState('idle');
  };

  const updateSectionPrompt = (
    id: string,
    next: { enabled?: boolean; text?: string },
  ) => {
    setSettings((current) => ({
      ...current,
      sectionPrompts: current.sectionPrompts.map((prompt) =>
        prompt.id === id ? { ...prompt, ...next } : prompt,
      ),
    }));
    setState('idle');
  };

  const preview = (text = settings.text) => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find((voice) => voice.name === settings.voiceName);
    utterance.voice = selectedVoice ?? null;
    utterance.rate = settings.voiceStyle === 'soft-male' ? 0.82 : 0.9;
    utterance.pitch =
      settings.voiceStyle === 'soft-male'
        ? 0.72
        : settings.voiceStyle === 'soft-female'
          ? 1.05
          : 0.9;
    utterance.volume = 0.7;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const save = async () => {
    setState('saving');
    const response = await fetch('/api/admin/welcome-settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      setState('error');
      return;
    }

    const saved = await response.json() as WelcomeSettings;
    setSettings(saved);
    setState('saved');
  };

  return (
    <section className="glass metal-border rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-electric/70">Voice welcome</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Avatar greeting settings</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            This controls the one-time welcome played when the avatar starts the intro greeting.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => updateSettings({ enabled: event.target.checked })}
            className="h-4 w-4 accent-cyan-300"
          />
          Enabled
        </label>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-white/40">Welcome text</span>
          <textarea
            value={settings.text}
            onChange={(event) => updateSettings({ text: event.target.value })}
            maxLength={240}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-electric/60"
          />
          <span className="mt-1 block text-xs text-white/35">{settings.text.length}/240</span>
        </label>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.25em] text-white/40">Voice style</span>
            <select
              value={settings.voiceStyle}
              onChange={(event) => updateSettings({ voiceStyle: event.target.value as WelcomeVoiceStyle })}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/60"
            >
              {voiceStyles.map((style) => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.25em] text-white/40">Exact voice</span>
            <select
              value={settings.voiceName ?? ''}
              onChange={(event) => updateSettings({ voiceName: event.target.value || null })}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/60"
            >
              <option value="">Auto select</option>
              {englishVoices.map((voice) => (
                <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.25em] text-white/40">Mouse audio</span>
          <select
            value={settings.motionSoundMode}
            onChange={(event) => updateSettings({ motionSoundMode: event.target.value as MotionSoundMode })}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-electric/60"
          >
            {motionModes.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-white/40">
            Section change only plays a short cue when the pointer enters a new section.
          </span>
        </label>

        <label className="inline-flex cursor-pointer items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
          <input
            type="checkbox"
            checked={settings.sectionVoiceEnabled}
            onChange={(event) => updateSettings({ sectionVoiceEnabled: event.target.checked })}
            className="h-4 w-4 accent-cyan-300"
          />
          Section hover voice enabled
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">Section voice lines</p>
          <p className="mt-1 text-xs leading-5 text-white/40">
            These play once per section per page load when the pointer enters that section.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {settings.sectionPrompts.map((prompt) => (
            <div key={prompt.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">{prompt.label}</p>
                <label className="inline-flex items-center gap-2 text-xs text-white/55">
                  <input
                    type="checkbox"
                    checked={prompt.enabled}
                    onChange={(event) => updateSectionPrompt(prompt.id, { enabled: event.target.checked })}
                    className="h-3.5 w-3.5 accent-cyan-300"
                  />
                  On
                </label>
              </div>
              <textarea
                value={prompt.text}
                onChange={(event) => updateSectionPrompt(prompt.id, { text: event.target.value })}
                maxLength={180}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs leading-5 text-white outline-none transition focus:border-electric/60"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-white/35">{prompt.text.length}/180</span>
                <button
                  type="button"
                  onClick={() => preview(prompt.text)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75 transition hover:border-electric/40 hover:text-white"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={state === 'saving'}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'saving' ? 'Saving...' : 'Save greeting'}
        </button>
        <button
          type="button"
          onClick={() => preview()}
          className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-electric/40 hover:text-white"
        >
          Preview voice
        </button>
        {state === 'saved' && <span className="text-sm text-emerald-300">Saved.</span>}
        {state === 'error' && <span className="text-sm text-red-300">Could not save settings.</span>}
      </div>
    </section>
  );
}
