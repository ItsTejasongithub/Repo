'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { WelcomeSettings } from '@/lib/welcome-settings';

gsap.registerPlugin(ScrollTrigger);

const fallbackWelcomeSettings: WelcomeSettings = {
  enabled: true,
  text: 'Hi, welcome to my portfolio. This is Tejas. Explore my work of art now.',
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

export function MotionRuntime() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<{
    ctx: AudioContext;
    osc: OscillatorNode;
    osc2: OscillatorNode;
    gain: GainNode;
    filter: BiquadFilterNode;
    lastX: number;
    lastY: number;
    moveHandler: (event: PointerEvent) => void;
    downHandler: () => void;
  } | null>(null);
  const soundEnabledRef = useRef(false);
  const portfolioBeganRef = useRef(false); // Tracks if user clicked "Begin" button
  const welcomeQueuedRef = useRef(false);
  const welcomePendingRef = useRef(false);
  const welcomeSpokenThisLoadRef = useRef(false);
  const welcomeSettingsRef = useRef<WelcomeSettings>(fallbackWelcomeSettings);
  const activeSectionRef = useRef<string | null>(null);
  const spokenSectionsRef = useRef<Set<string>>(new Set());

  const getConfiguredVoice = (settings: WelcomeSettings) => {
    const voices = window.speechSynthesis.getVoices();
    const exactVoice = settings.voiceName
      ? voices.find((voice) => voice.name === settings.voiceName)
      : null;
    if (exactVoice) return exactVoice;
    if (settings.voiceStyle === 'browser-default') return null;

    const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
    const styleVoiceNames =
      settings.voiceStyle === 'soft-female'
        ? ['zira', 'samantha', 'susan', 'victoria', 'karen', 'female']
        : settings.voiceStyle === 'soft-male'
          ? ['guy', 'david', 'mark', 'daniel', 'alex', 'fred', 'george', 'ryan', 'male']
          : [];

    return (
      englishVoices.find((voice) => styleVoiceNames.some((name) => voice.name.toLowerCase().includes(name))) ??
      englishVoices.find((voice) => voice.localService) ??
      englishVoices[0] ??
      voices[0]
    );
  };

  const speakText = (text: string) => {
    if (!soundEnabledRef.current) return false;
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return false;
    const settings = welcomeSettingsRef.current;
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return false;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getConfiguredVoice(settings) ?? null;
    utterance.rate = settings.voiceStyle === 'soft-male' ? 0.82 : 0.9;
    utterance.pitch =
      settings.voiceStyle === 'soft-male'
        ? 0.72
        : settings.voiceStyle === 'soft-female'
          ? 1.05
          : 0.9;
    utterance.volume = 0.68;
    window.speechSynthesis.speak(utterance);
    return true;
  };

  const speakWelcome = () => {
    if (welcomeQueuedRef.current || welcomeSpokenThisLoadRef.current) return;
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    const settings = welcomeSettingsRef.current;
    if (!settings.enabled) return;

    welcomeQueuedRef.current = true;
    welcomePendingRef.current = false;
    const utterance = new SpeechSynthesisUtterance(settings.text);
    utterance.voice = getConfiguredVoice(settings) ?? null;
    utterance.rate = settings.voiceStyle === 'soft-male' ? 0.82 : 0.9;
    utterance.pitch =
      settings.voiceStyle === 'soft-male'
        ? 0.72
        : settings.voiceStyle === 'soft-female'
          ? 1.05
          : 0.9;
    utterance.volume = 0.68;
    utterance.onstart = () => {
      welcomePendingRef.current = false;
      welcomeSpokenThisLoadRef.current = true;
    };
    utterance.onend = () => {
      welcomeQueuedRef.current = false;
      welcomeSpokenThisLoadRef.current = true;
    };
    utterance.onerror = () => {
      welcomeQueuedRef.current = false;
      if (!welcomeSpokenThisLoadRef.current) {
        welcomePendingRef.current = true;
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const requestWelcomeSpeech = () => {
    // Only set pending if user clicked "Click Here to Begin" button
    if (!portfolioBeganRef.current) return;

    welcomePendingRef.current = true;
    // Ensure speech happens quickly after the greeting starts (avatar animation)
    speakWelcome();
    // Retry once more if the first attempt fails
    window.setTimeout(() => {
      if (welcomePendingRef.current && !welcomeSpokenThisLoadRef.current) {
        speakWelcome();
      }
    }, 400);
  };

  const playSectionCue = () => {
    const audio = audioRef.current;
    if (!audio || welcomeSettingsRef.current.motionSoundMode !== 'section-change') return;
    audio.ctx.resume();
    const now = audio.ctx.currentTime;
    audio.osc.frequency.cancelScheduledValues(now);
    audio.osc2.frequency.cancelScheduledValues(now);
    audio.gain.gain.cancelScheduledValues(now);
    audio.osc.frequency.setValueAtTime(170, now);
    audio.osc.frequency.linearRampToValueAtTime(260, now + 0.08);
    audio.osc2.frequency.setValueAtTime(255, now);
    audio.osc2.frequency.linearRampToValueAtTime(390, now + 0.08);
    audio.gain.gain.linearRampToValueAtTime(0.045, now + 0.018);
    audio.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  };

  const handleSectionEnter = (sectionId: string) => {
    if (!sectionId || activeSectionRef.current === sectionId) return;
    activeSectionRef.current = sectionId;
    playSectionCue();

    const settings = welcomeSettingsRef.current;
    if (!settings.sectionVoiceEnabled || !soundEnabledRef.current) return;
    if (spokenSectionsRef.current.has(sectionId)) return;

    const prompt = settings.sectionPrompts.find((item) => item.id === sectionId);
    if (!prompt?.enabled || !prompt.text.trim()) return;

    spokenSectionsRef.current.add(sectionId);
    window.setTimeout(() => speakText(prompt.text), 180);
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    const lenis = new Lenis({
      duration: 1.15,
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    let frame = requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 34, filter: 'blur(10px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      if (!isMobile) {
        gsap.utils.toArray<HTMLElement>('[data-zigzag]').forEach((el, index) => {
          gsap.fromTo(
            el,
            { x: index % 2 === 0 ? -72 : 72 },
            {
              x: 0,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 78%',
                end: 'bottom 25%',
                scrub: 0.8,
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const depth = Number(el.dataset.parallax ?? '0.2');

          gsap.fromTo(
            el,
            { y: depth * 60, scale: 0.98 },
            {
              y: -depth * 60,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        });
      } else {
        gsap.utils.toArray<HTMLElement>('[data-zigzag], [data-parallax]').forEach((el) => {
          gsap.set(el, { x: 0, y: 0, scale: 1, clearProps: 'transform' });
        });
      }

    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh);
    refresh();

    return () => {
      ctx.revert();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('load', refresh);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.osc.stop();
      audioRef.current?.osc2.stop();
      audioRef.current?.gain.disconnect();
      audioRef.current?.filter.disconnect();
      audioRef.current?.ctx.close();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetch('/api/welcome-settings')
      .then((response) => response.ok ? response.json() : null)
      .then((settings: WelcomeSettings | null) => {
        if (settings) welcomeSettingsRef.current = settings;
      })
      .catch(() => {
        welcomeSettingsRef.current = fallbackWelcomeSettings;
      });

    const saved = localStorage.getItem('motionAudioEnabled');
    const enabledByDefault = saved !== 'false';
    soundEnabledRef.current = enabledByDefault;
    setSoundEnabled(enabledByDefault);

    // DO NOT set welcomePendingRef to true here - only set it when portfolio-begin fires

    const welcomeWithAvatar = () => requestWelcomeSpeech();
    window.addEventListener('portfolio-avatar-greeting', welcomeWithAvatar);
    const sectionListeners = Array.from(document.querySelectorAll<HTMLElement>('[data-voice-section]'))
      .map((element) => {
        const sectionId = element.dataset.voiceSection;
        const onEnter = () => {
          if (sectionId) handleSectionEnter(sectionId);
        };
        element.addEventListener('pointerenter', onEnter);
        return { element, onEnter };
      });

    if (!enabledByDefault) {
      return () => {
        window.removeEventListener('portfolio-avatar-greeting', welcomeWithAvatar);
        sectionListeners.forEach(({ element, onEnter }) => {
          element.removeEventListener('pointerenter', onEnter);
        });
      };
    }

    // Unlock audio context only when user clicks the "Begin" button
    const onPortfolioBegin = async () => {
      if (!soundEnabledRef.current) return;
      // Mark that portfolio has begun
      portfolioBeganRef.current = true;
      // Mark welcome as pending now that user clicked Begin
      welcomePendingRef.current = true;
      await startAudio();
      if (audioRef.current?.ctx) {
        try {
          await audioRef.current.ctx.resume();
        } catch {
          // Continue anyway
        }
      }
      // Try to speak welcome voice now that audio is unlocked
      window.setTimeout(() => {
        if (welcomePendingRef.current && !welcomeSpokenThisLoadRef.current) {
          speakWelcome();
        }
      }, 100);
    };

    // Listen for the specific "Begin" button click event only
    window.addEventListener('portfolio-begin', onPortfolioBegin, { once: true });

    return () => {
      window.removeEventListener('portfolio-begin', onPortfolioBegin);
      window.removeEventListener('portfolio-avatar-greeting', welcomeWithAvatar);
      sectionListeners.forEach(({ element, onEnter }) => {
        element.removeEventListener('pointerenter', onEnter);
      });
    };
  }, []);

  const startAudio = async () => {
    if (audioRef.current) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 920;
    gain.gain.value = 0.0001;
    osc.type = 'triangle';
    osc.frequency.value = 132;
    osc2.type = 'sine';
    osc2.frequency.value = 198;

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc2.start();

    const moveHandler = (event: PointerEvent) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (welcomeSettingsRef.current.motionSoundMode !== 'cursor') {
        audio.lastX = event.clientX;
        audio.lastY = event.clientY;
        return;
      }
      audio.ctx.resume();
      const dx = event.clientX - audio.lastX;
      const dy = event.clientY - audio.lastY;
      const speed = Math.min(60, Math.hypot(dx, dy));
      audio.lastX = event.clientX;
      audio.lastY = event.clientY;
      if (speed < 2) return;

      const now = audio.ctx.currentTime;
      const nextFrequency = 130 + speed * 10;
      const nextGain = Math.min(0.09, 0.012 + speed * 0.0013);

      audio.osc.frequency.cancelScheduledValues(now);
      audio.osc2.frequency.cancelScheduledValues(now);
      audio.gain.gain.cancelScheduledValues(now);
      audio.osc.frequency.linearRampToValueAtTime(nextFrequency, now + 0.035);
      audio.osc2.frequency.linearRampToValueAtTime(nextFrequency * 1.5, now + 0.035);
      audio.gain.gain.linearRampToValueAtTime(nextGain, now + 0.025);
      audio.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    };

    const downHandler = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.ctx.resume();
      if (welcomePendingRef.current) {
        speakWelcome();
      }
      if (welcomeSettingsRef.current.motionSoundMode === 'off') return;
      const now = audio.ctx.currentTime;
      audio.gain.gain.cancelScheduledValues(now);
      audio.gain.gain.linearRampToValueAtTime(0.055, now + 0.015);
      audio.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerdown', downHandler);

    audioRef.current = {
      ctx,
      osc,
      osc2,
      gain,
      filter,
      lastX: window.innerWidth / 2,
      lastY: window.innerHeight / 2,
      moveHandler,
      downHandler,
    };

    try {
      await ctx.resume();
    } catch {
      // If the browser blocks it, the pointer interaction listener will resume it later.
    };
  };

  const stopAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    window.removeEventListener('pointermove', audio.moveHandler);
    window.removeEventListener('pointerdown', audio.downHandler);
    audio.osc.stop();
    audio.osc2.stop();
    audio.gain.disconnect();
    audio.filter.disconnect();
    await audio.ctx.close();
    audioRef.current = null;
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 hidden md:block">
      <button
        type="button"
        onClick={async () => {
          if (soundEnabled) {
            setSoundEnabled(false);
            soundEnabledRef.current = false;
            localStorage.setItem('motionAudioEnabled', 'false');
            window.speechSynthesis?.cancel();
            await stopAudio();
            return;
          }

          setSoundEnabled(true);
          soundEnabledRef.current = true;
          localStorage.setItem('motionAudioEnabled', 'true');
          await startAudio();
          await audioRef.current?.ctx.resume();
          if (welcomePendingRef.current) {
            speakWelcome();
          }
        }}
        className="pointer-events-auto rounded-full border border-white/10 bg-black/75 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/80 backdrop-blur-md transition hover:border-cyan-300/40 hover:bg-black/90"
      >
        {soundEnabled ? 'Motion Audio On' : 'Motion Audio Off'}
      </button>
    </div>
  );
}
