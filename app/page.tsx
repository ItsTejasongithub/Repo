import {
  HeroVisual,
  EngineeringSnapshot,
  SkillsMatrix,
  SystemArchitectures,
  EngineeringTimeline,
  Labs,
  GitHubIntelligence,
  BlogPreview,
  ContactSection,
  ProjectsSection,
} from '@/components/sections';
import { TypingHeadline } from '@/components/typing-headline';
import { ThreeAmbient } from '@/components/three-ambient';
import { stats } from '@/lib/site-data';

export default function Page() {
  return (
    <main className="relative overflow-x-hidden">

      {/* ── Hero section ── */}
      <section className="relative min-h-screen">
        {/* Full-screen Three.js particle field */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <ThreeAmbient />
        </div>

        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 z-0 grid-bg opacity-25" />

        {/* Ray burst from top */}
        <div className="hero-rays z-0" />

        {/* Top-left cyan orb */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-400/[0.06] blur-[120px] z-0" />
        {/* Bottom-right purple orb */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-purple-500/[0.07] blur-[100px] z-0" />

        <div className="container-pad relative z-10 grid min-h-screen items-center gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">

          {/* ── Left: text content ── */}
          <div
            className="relative z-20 space-y-6 text-center lg:space-y-8 lg:pr-10 lg:text-left"
            data-reveal
            data-zigzag
          >
            {/* Status pill */}
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.95)] animate-pulse" />
              Real-time systems online
            </div>

            {/* Heading */}
            <div className="space-y-4 sm:space-y-5">
              <p className="text-xs uppercase tracking-[0.45em] text-electric/70">Tejas Kandi</p>
              <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:mx-0 lg:text-7xl">
                <span className="block text-white">Full-Stack Engineer building</span>
                <span className="block min-h-[1.35em]">
                  <TypingHeadline />
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8 lg:mx-0">
                Building software, hardware and intelligent systems that operate in the real world.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-2.5 text-sm lg:justify-start">
              {stats.slice(0, 4).map((s) => (
                <div
                  key={s.label}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm"
                >
                  <span className="gradient-text font-semibold">{s.value}</span>
                  <span className="ml-2 text-white/50 text-xs">{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <a
                href="#contact"
                className="group relative rounded-full px-7 py-3.5 text-center text-sm font-medium text-black transition hover:scale-[1.03] overflow-hidden"
                style={{
                  background: 'linear-gradient(130deg, #5ef0ff, #63d4ff 45%, #a78bfa)',
                  boxShadow: '0 0 24px rgba(94,240,255,0.3), 0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                <span className="relative z-10">Get in Touch</span>
              </a>
              <a
                href="#projects"
                className="rounded-full border border-white/12 bg-white/[0.05] px-7 py-3.5 text-center text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/[0.09] hover:border-electric/30"
              >
                Explore Projects
              </a>
            </div>
          </div>

          {/* ── Right: profile showcase ── */}
          <div className="relative z-20" data-reveal data-parallax="0.18">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── All other sections ── */}
      <div className="container-pad space-y-24 pb-24">
        <div data-reveal data-zigzag>
          <EngineeringSnapshot />
        </div>
        <div data-reveal data-zigzag>
          <SkillsMatrix />
        </div>
        <section id="projects" className="space-y-8" data-reveal data-zigzag>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Project Command Center</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Software, AI, hardware, and automation workspaces.
            </h2>
          </div>
          <ProjectsSection />
        </section>
        <div data-reveal data-zigzag>
          <SystemArchitectures />
        </div>
        <div data-reveal data-zigzag>
          <EngineeringTimeline />
        </div>
        <div data-reveal data-zigzag>
          <Labs />
        </div>
        <div data-reveal data-zigzag>
          <GitHubIntelligence />
        </div>
        <div data-reveal data-zigzag>
          <BlogPreview />
        </div>
        <div data-reveal data-zigzag>
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
