'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { projectCards, projectTabs } from '@/lib/site-data';

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
          className="grid gap-4 lg:grid-cols-3 lg:gap-6"
        >
          {visibleProjects.map((project) => {
            const gradientId = `g-${project.name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;

            return (
              <article key={project.name} className="glass metal-border rounded-3xl p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6 sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-electric/80">{project.type}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{project.name}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Live
                  </span>
                </div>
                <div className="mb-5 aspect-[16/10] rounded-2xl border border-white/[0.08] bg-gradient-to-br from-cyan-500/15 via-white/5 to-purple-500/10 p-4">
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
                <p className="text-sm leading-6 text-white/70">{project.challenge}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span key={item} className="rounded-full border border-white/[0.08] bg-white/5 px-3 py-1 text-xs text-white/70">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid gap-2 text-sm text-white/75">
                  {project.metrics.map((metric) => (
                    <div key={metric} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-electric" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
              <article className="glass metal-border rounded-3xl p-5 sm:p-6 lg:col-span-3">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-semibold text-white">{activeTab.title} Network</h3>
              <span className="text-sm text-white/50">{activeTab.projects.length} featured nodes</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {activeTab.projects.map((project, index) => (
                <div key={project} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.25em] text-white/40">0{index + 1}</span>
                    <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(94,240,255,0.9)]" />
                  </div>
                  <p className="text-lg text-white">{project}</p>
                </div>
              ))}
            </div>
          </article>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
