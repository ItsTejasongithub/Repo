'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function MotionRuntime() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<{
    ctx: AudioContext;
    osc: OscillatorNode;
    gain: GainNode;
    filter: BiquadFilterNode;
    lastX: number;
    lastY: number;
    moveHandler: (event: PointerEvent) => void;
    downHandler: () => void;
  } | null>(null);

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
      audioRef.current?.gain.disconnect();
      audioRef.current?.filter.disconnect();
      audioRef.current?.ctx.close();
      audioRef.current = null;
    };
  }, []);

  const startAudio = async () => {
    if (audioRef.current) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 620;
    gain.gain.value = 0.0001;
    osc.type = 'sine';
    osc.frequency.value = 110;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    const moveHandler = (event: PointerEvent) => {
      const audio = audioRef.current;
      if (!audio) return;
      const dx = event.clientX - audio.lastX;
      const dy = event.clientY - audio.lastY;
      const speed = Math.min(60, Math.hypot(dx, dy));
      audio.lastX = event.clientX;
      audio.lastY = event.clientY;

      const nextFrequency = 100 + speed * 8;
      audio.osc.frequency.linearRampToValueAtTime(nextFrequency, audio.ctx.currentTime + 0.03);
      audio.gain.gain.linearRampToValueAtTime(Math.min(0.035, 0.004 + speed * 0.0008), audio.ctx.currentTime + 0.05);
    };

    const downHandler = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.ctx.resume();
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerdown', downHandler);

    audioRef.current = {
      ctx,
      osc,
      gain,
      filter,
      lastX: 0,
      lastY: 0,
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
            await stopAudio();
            return;
          }

          setSoundEnabled(true);
          await startAudio();
        }}
        className="pointer-events-auto rounded-full border border-white/10 bg-black/75 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/80 backdrop-blur-md transition hover:border-cyan-300/40 hover:bg-black/90"
      >
        {soundEnabled ? 'Motion Audio On' : 'Motion Audio Off'}
      </button>
    </div>
  );
}
