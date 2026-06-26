'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { projectCards, projectTabs } from '@/lib/site-data';
import meetFlashKTShot from '../asset/MeetFlash_KT.png';
import meetFlashLandingShot from '../asset/MeetFlash_LandingPage.png';
import meetFlashNavShot from '../asset/MeetFlash_NavBar.png';
import orbitLaunchShot from '../asset/orbit-launch-screen.png';
import orbitControlShot from '../asset/orbit-control-panel.png';
import orbitTrajectoryShot from '../asset/orbit-trajectory-map.png';
import orbitActivityShot from '../asset/orbit-activity-feed.png';

export function ProjectCommandCenter() {
  const [active, setActive] = useState(projectTabs[0].key);
  const activeTab = projectTabs.find((tab) => tab.key === active) ?? projectTabs[0];
  const visibleProjects = projectCards.filter((project) => project.tab === active);

  return (
    <section className="space-y-8">
      <div className="no-scrollbar flex flex-nowrap gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {projectTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
              active === tab.key
                ? 'bg-white text-black shadow-glow'
                : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.key}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, filter: 'blur(10px)' }}
          transition={{ duration: 0.35 }}
          className="space-y-4 lg:space-y-6"
        >
          {visibleProjects.map((project) => {
            const gradientId = `g-${project.name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
            const previewMode = (project.previewMode ?? (project.liveUrl ? 'iframe' : 'diagram')) as
              | 'iframe'
              | 'carousel'
              | 'diagram';

            return (
              <article key={project.name} className="glass metal-border overflow-hidden rounded-3xl border border-white/[0.08]">
                <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6 sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-electric/80">{project.type}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{project.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                      {project.liveLabel ?? 'Live'}
                    </span>
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs uppercase tracking-[0.3em] text-electric/70 transition hover:text-electric"
                      >
                        Open site
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-5 p-5 sm:p-6">
                  {previewMode === 'carousel' && project.name === 'MeetFlash' ? (
                    <ProjectScreenshotCarousel
                      topTag={project.previewTag ?? 'Please contact for live demo'}
                      slides={[
                        { key: 'landing', label: 'Landing page', image: meetFlashLandingShot },
                        {
                          key: 'navbar',
                          label: 'Navigation',
                          image: meetFlashNavShot,
                          fitMode: 'contain',
                        },
                        { key: 'knowledge', label: 'Knowledge context', image: meetFlashKTShot },
                      ]}
                    />
                  ) : previewMode === 'carousel' ? (
                    <ProjectScreenshotCarousel
                      topTag="Live Preview"
                      slides={[
                        { key: 'login', label: 'Launch screen', image: orbitLaunchShot },
                        { key: 'dashboard', label: 'Control panel', image: orbitControlShot },
                        { key: 'trajectory', label: 'Trajectory map', image: orbitTrajectoryShot },
                        { key: 'activity', label: 'Activity feed', image: orbitActivityShot },
                      ]}
                      ctaHref="https://orbit.10xtechclub.in/"
                      ctaLabel="Visit live site"
                    />
                  ) : project.liveUrl && previewMode === 'iframe' ? (
                    <div className="relative min-h-[560px]">
                      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-cyan-400/10 blur-2xl" />
                      <motion.div
                        className="relative h-full rounded-[2rem] border border-white/10 bg-black/30 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                      >
                        <div className="mb-3 flex items-center justify-between rounded-t-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                          </div>
                          <div className="max-w-[60%] truncate text-[10px] uppercase tracking-[0.3em] text-white/45">
                            Live Preview
                          </div>
                        </div>
                        <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#04060b]">
                          <iframe
                            src={project.liveUrl}
                            title={`${project.name} live preview`}
                            className="h-[460px] w-full rounded-[1.4rem]"
                            loading="lazy"
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#04060b] to-transparent" />
                        </div>
                        <div className="mt-3 flex justify-end px-1 text-xs text-white/45">
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-electric transition hover:text-white"
                          >
                            Visit live site
                          </a>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-cyan-500/15 via-white/5 to-purple-500/10 p-4">
                      <svg viewBox="0 0 400 240" className="h-full w-full">
                        <defs>
                          <linearGradient id={gradientId} x1="0" x2="1">
                            <stop offset="0%" stopColor="#5ef0ff" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                        <rect x="28" y="36" width="120" height="44" rx="12" fill="rgba(255,255,255,0.06)" stroke={`url(#${gradientId})`} />
                        <rect x="248" y="36" width="120" height="44" rx="12" fill="rgba(255,255,255,0.06)" stroke={`url(#${gradientId})`} />
                        <rect x="138" y="130" width="124" height="52" rx="14" fill="rgba(255,255,255,0.08)" stroke={`url(#${gradientId})`} />
                        <path d="M148 58 C192 58, 208 58, 252 58" stroke={`url(#${gradientId})`} strokeWidth="2" strokeDasharray="6 6" />
                        <path d="M200 80 L200 130" stroke={`url(#${gradientId})`} strokeWidth="2" />
                        <circle cx="200" cy="80" r="7" fill="#63d4ff" />
                        <circle cx="200" cy="130" r="7" fill="#8b5cf6" />
                      </svg>
                    </div>
                  )}

                  <p className="text-sm leading-6 text-white/70">{project.challenge}</p>
                  {project.showcase ? (
                    <p className="text-sm leading-6 text-white/55">{project.showcase}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <span key={item} className="rounded-full border border-white/[0.08] bg-white/5 px-3 py-1 text-xs text-white/70">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-2 text-sm text-white/75">
                    {project.metrics.map((metric) => (
                      <div key={metric} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-electric" />
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

type ScreenshotSlide = {
  key: string;
  label: string;
  image: StaticImageData;
  fitMode?: 'cover' | 'contain';
};

function ProjectScreenshotCarousel({
  slides,
  topTag,
  ctaHref,
  ctaLabel,
}: {
  slides: ScreenshotSlide[];
  topTag: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <div className="relative min-h-[560px]">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-cyan-400/10 blur-2xl" />
      <motion.div
        key={slide.key}
        initial={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative h-full rounded-[2rem] border border-white/10 bg-black/30 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
      >
        <div className="mb-3 flex items-center justify-between rounded-t-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-3">
            <span className="max-w-[38vw] truncate text-[10px] uppercase tracking-[0.3em] text-white/45">
              {topTag}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-electric/75">
              {slide.label}
            </span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#04060b]">
          <div className="relative flex aspect-[16/9] w-full items-center justify-center">
            <Image
              src={slide.image}
              alt={`${topTag} ${slide.label}`}
              fill
              priority={active === 0}
              sizes="(max-width: 768px) 100vw, 900px"
              className={slide.fitMode === 'contain' ? 'object-contain object-center' : 'object-cover object-top'}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(94,240,255,0.16),transparent_34%),linear-gradient(to_bottom,rgba(4,6,11,0)_70%,rgba(4,6,11,0.92)_100%)]" />
        </div>
        <div className="mt-3 flex items-center justify-between px-1 text-xs text-white/45">
          <div className="flex gap-1.5">
            {slides.map((item, index) => (
              <span
                key={item.key}
                className={`h-1.5 rounded-full transition-all ${index === active ? 'w-8 bg-electric' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
          {ctaHref && ctaLabel ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noreferrer"
              className="text-electric transition hover:text-white"
            >
              {ctaLabel}
            </a>
          ) : (
            <span className="text-white/40">Available on request</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
