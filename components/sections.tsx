import { AnimatedCounter } from '@/components/animated-counter';
import { skillGroups, stats, timeline, blogPosts } from '@/lib/site-data';
import { ProjectCommandCenter } from '@/components/project-command-center';
import { AvatarCanvas } from '@/components/AvatarCanvas';

/* ─── Skill category colour maps (literal strings for Tailwind JIT) ─── */
const groupAccent: Record<string, { dot: string; ring: string; bg: string; label: string }> = {
  Backend:              { dot: 'bg-cyan-400',    ring: 'hover:border-cyan-400/40',    bg: 'hover:bg-cyan-400/[0.07]',    label: 'text-cyan-400/70' },
  Frontend:             { dot: 'bg-blue-400',    ring: 'hover:border-blue-400/40',    bg: 'hover:bg-blue-400/[0.07]',    label: 'text-blue-400/70' },
  'AI & LLM':           { dot: 'bg-purple-400',  ring: 'hover:border-purple-400/40',  bg: 'hover:bg-purple-400/[0.07]',  label: 'text-purple-400/70' },
  DevOps:               { dot: 'bg-emerald-400', ring: 'hover:border-emerald-400/40', bg: 'hover:bg-emerald-400/[0.07]', label: 'text-emerald-400/70' },
  'Microsoft Stack':    { dot: 'bg-orange-400',  ring: 'hover:border-orange-400/40',  bg: 'hover:bg-orange-400/[0.07]',  label: 'text-orange-400/70' },
  'Hardware & Embedded':{ dot: 'bg-amber-400',   ring: 'hover:border-amber-400/40',   bg: 'hover:bg-amber-400/[0.07]',   label: 'text-amber-400/70' },
};

const blogCategory: Record<string, string> = {
  'Full Stack': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  AI:           'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Embedded:     'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

/* ─────────────────────────── HERO VISUAL ─────────────────────────── */
interface HeroVisualProps {
  shouldStartIntro?: boolean;
}

export function HeroVisual({ shouldStartIntro = true }: HeroVisualProps) {
  return (
    <div className="relative flex items-center justify-center py-6 lg:py-0">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-cyan-400/10 blur-[90px] animate-pulseGlow" />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px] animate-pulseGlow"
        style={{ animationDelay: '2.5s' }}
      />

      {/* Avatar container — large and centred, owns the top half */}
      <div className="relative w-[92vw] max-w-[520px] sm:max-w-[680px] mx-auto h-[58vh] sm:h-[72vh]">

        {/* Subtle ground shadow to anchor the avatar */}
        <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 h-10 w-48 rounded-full bg-cyan-400/20 blur-[22px]" />

        {/* 3D Avatar — fills the container */}
        <AvatarCanvas shouldStartIntro={shouldStartIntro} />

        {/* ── Status badge ── */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="glass metal-border rounded-full px-4 py-1.5 text-xs text-emerald-300 flex items-center gap-2 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
            Available for work
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── ENGINEERING SNAPSHOT ─────────────────────── */
export function EngineeringSnapshot() {
  return (
    <section id="snapshot" className="space-y-8">
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Engineering Snapshot</p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            A dashboard view of delivery, scale, and systems impact.
          </h2>
        </div>
        <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2 text-sm text-emerald-200 md:flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)] animate-pulse" />
          Available for selective collaborations
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="glass metal-border rounded-3xl p-5 card-hover group"
            data-parallax="0.05"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-white/40 group-hover:text-white/60 transition-colors">
              {item.label}
            </div>
            <div className="mt-4 text-4xl font-semibold gradient-text">
              <AnimatedCounter value={item.value} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────── SKILLS MATRIX ──────────────────────────── */
export function SkillsMatrix() {
  return (
    <section id="skills" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Skills Matrix</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Interactive engineering map of the stack.
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {skillGroups.map((group, index) => {
          const accent = groupAccent[group.name] ?? groupAccent.Backend;
          return (
            <div key={group.name} className="glass metal-border rounded-3xl p-5 sm:p-6 card-hover" data-parallax="0.06">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${accent.dot} shadow-[0_0_10px_currentColor]`} />
                  <h3 className="text-lg font-semibold text-white sm:text-xl">{group.name}</h3>
                </div>
                <span className="text-xs uppercase tracking-[0.25em] text-white/30">Node {String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={item}
                    className={`skill-chip group rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3.5 ${accent.ring} ${accent.bg} transition`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[10px] ${accent.label}`}>
                        {String(itemIndex + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="text-sm text-white/90">{item}</div>
                        <div className="text-[10px] text-white/35 mt-0.5">Active node</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────────────── SYSTEM ARCHITECTURES ──────────────────────── */
const layerColors: Record<string, { stroke: string; a: string; b: string; c: string }> = {
  Frontend:           { stroke: '#63d4ff', a: '#63d4ff', b: '#63d4ff', c: '#8b5cf6' },
  Backend:            { stroke: '#8b5cf6', a: '#8b5cf6', b: '#63d4ff', c: '#8b5cf6' },
  Database:           { stroke: '#34d399', a: '#34d399', b: '#63d4ff', c: '#34d399' },
  'LLM Layer':        { stroke: '#a78bfa', a: '#a78bfa', b: '#63d4ff', c: '#a78bfa' },
  Infrastructure:     { stroke: '#60a5fa', a: '#60a5fa', b: '#63d4ff', c: '#60a5fa' },
  'Hardware Layer':   { stroke: '#fbbf24', a: '#fbbf24', b: '#63d4ff', c: '#fbbf24' },
};

export function SystemArchitectures() {
  return (
    <section id="architecture" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">System Architectures</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Interactive data flow diagrams across product layers.
        </h2>
      </div>

      <div className="glass metal-border rounded-[2rem] p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Object.entries(layerColors).map(([layer, col], index) => (
            <div key={layer} className="rounded-2xl border border-white/[0.07] bg-black/25 p-4 card-hover group">
              <div className="text-xs uppercase tracking-[0.25em] text-white/35">0{index + 1}</div>
              <div className="mt-3 text-base text-white group-hover:gradient-text transition">{layer}</div>
              <div className="mt-4 h-24 rounded-xl bg-gradient-to-b from-white/[0.06] to-transparent overflow-hidden">
                <svg viewBox="0 0 180 90" className="h-full w-full">
                  <defs>
                    <linearGradient id={`arc-${index}`} x1="0" x2="1">
                      <stop offset="0%"   stopColor={col.a} />
                      <stop offset="100%" stopColor={col.c} />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M18 70 C55 18, 122 18, 162 70`}
                    stroke={`url(#arc-${index})`}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="7 7"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="120" dur={`${8 + index}s`} repeatCount="indefinite" />
                  </path>
                  <circle cx="18" cy="70" r="5"  fill={col.a} opacity="0.85" />
                  <circle cx="90" cy="22" r="6"  fill={col.b} opacity="0.9">
                    <animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="162" cy="70" r="5" fill={col.c} opacity="0.85" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── ENGINEERING TIMELINE ───────────────────────── */
const timelineAccents = [
  'bg-cyan-300 shadow-[0_0_16px_rgba(94,240,255,0.9)]',
  'bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.85)]',
  'bg-purple-400 shadow-[0_0_14px_rgba(167,139,250,0.85)]',
  'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]',
  'bg-cyan-300 shadow-[0_0_14px_rgba(94,240,255,0.8)]',
  'bg-electric shadow-[0_0_14px_rgba(99,212,255,0.85)]',
];

const timelinePeriods = [
  '2018 – 2022',
  '2022 – 2023',
  '2023',
  '2023 – 2024',
  '2024',
  '2024 – Present',
];

export function EngineeringTimeline() {
  return (
    <section id="timeline" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Engineering Timeline</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          A connected journey from education to systems delivery.
        </h2>
      </div>

      <div className="relative pl-6 sm:pl-8">
        {/* Gradient vertical line */}
        <div className="absolute left-2 top-2 h-full w-px sm:left-3"
          style={{ background: 'linear-gradient(to bottom, #5ef0ff, #63d4ff 40%, #8b5cf6 75%, rgba(139,92,246,0.1))' }}
        />

        <div className="space-y-4">
          {timeline.map((step, index) => (
            <div key={step} className="relative glass metal-border rounded-2xl p-4 sm:p-5 card-hover group">
              <span
                className={`absolute -left-[30px] top-5 h-4 w-4 rounded-full sm:-left-[34px] sm:top-6 ${timelineAccents[index] ?? timelineAccents[0]}`}
              />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/35">
                    {timelinePeriods[index] ?? `0${index + 1}`}
                  </div>
                  <div className="mt-1.5 text-lg text-white group-hover:gradient-text transition">{step}</div>
                </div>
                <span className="hidden text-xs uppercase tracking-[0.2em] text-white/20 sm:block">
                  0{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── LABS ─────────────────────────────────── */
const labConfig = [
  {
    title: 'AI Lab',
    icon: '◈',
    iconColor: 'text-purple-400',
    borderHover: 'hover:border-purple-400/30',
    items: ['LLM Applications', 'RAG Systems', 'AI Assistants', 'Voice Systems', 'Agent Workflows'],
    itemColor: 'hover:bg-purple-400/[0.07] hover:border-purple-400/30',
  },
  {
    title: 'Hardware Lab',
    icon: '◉',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-400/30',
    items: ['Robotics', 'IoT', 'ESP32', 'Arduino', 'Sensors', 'Embedded Systems'],
    itemColor: 'hover:bg-amber-400/[0.07] hover:border-amber-400/30',
  },
  {
    title: 'DevOps Center',
    icon: '◎',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-400/30',
    items: ['Docker', 'PM2', 'GitHub Actions', 'CI/CD Pipelines', 'Deployment Workflows', 'Monitoring'],
    itemColor: 'hover:bg-emerald-400/[0.07] hover:border-emerald-400/30',
  },
];

export function Labs() {
  return (
    <section id="labs" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Active Labs</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Specialized engineering environments in production.
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labConfig.map((lab) => (
          <div key={lab.title} className={`glass metal-border rounded-3xl p-5 sm:p-6 card-hover border border-white/[0.07] transition ${lab.borderHover}`} data-parallax="0.07">
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-2xl ${lab.iconColor}`}>{lab.icon}</span>
              <h3 className="text-xl font-semibold text-white">{lab.title}</h3>
            </div>
            <div className="space-y-2.5">
              {lab.items.map((item) => (
                <div
                  key={item}
                  className={`skill-chip rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition ${lab.itemColor}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────── GITHUB INTELLIGENCE ───────────────────────── */
const ghMetrics = [
  {
    label: 'Contributions',
    color: '#5ef0ff',
    path: 'M8 72 C28 35, 58 22, 82 48 S128 75, 148 42 S178 18, 200 35',
    fill: '#5ef0ff',
    value: '2 400+',
  },
  {
    label: 'Languages',
    color: '#8b5cf6',
    path: 'M8 60 C30 40, 55 30, 80 55 S120 68, 150 30 S185 8, 200 28',
    fill: '#8b5cf6',
    value: '12+',
  },
  {
    label: 'Repositories',
    color: '#34d399',
    path: 'M8 68 C35 50, 65 55, 95 40 S138 20, 165 45 S188 58, 200 52',
    fill: '#34d399',
    value: '60+',
  },
  {
    label: 'Commit Activity',
    color: '#60a5fa',
    path: 'M8 75 C22 55, 45 48, 70 60 S105 72, 130 45 S168 20, 200 38',
    fill: '#60a5fa',
    value: 'Daily',
  },
];

export function GitHubIntelligence() {
  return (
    <section id="github" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">GitHub Intelligence</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          A custom analytics surface for contributions and momentum.
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ghMetrics.map((m, i) => (
          <div key={m.label} className="glass metal-border rounded-3xl p-4 sm:p-5 card-hover" data-parallax="0.06">
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">{m.label}</div>
            <div className="mt-4 h-28 rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${m.color}08, ${m.color}14)` }}>
              <svg viewBox="0 0 208 100" className="h-full w-full">
                <defs>
                  <linearGradient id={`gh-${i}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%"   stopColor={m.color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={m.fill}  stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id={`gha-${i}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%"   stopColor={m.color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={m.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${m.path} L200 90 L8 90 Z`} fill={`url(#gha-${i})`} />
                <path d={m.path} stroke={`url(#gh-${i})`} strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl font-semibold gradient-text">{m.value}</span>
              <span className="text-xs text-white/35 uppercase tracking-widest">rolling</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── BLOG PREVIEW ────────────────────────────── */
export function BlogPreview() {
  return (
    <section id="blog" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Blog / Knowledge Base</p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            MDX-powered engineering articles.
          </h2>
        </div>
        <a className="text-sm text-white/50 hover:text-white transition sm:self-start" href="/blog">
          View all articles →
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {blogPosts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block h-full glass metal-border rounded-3xl p-6 card-hover transition group"
            data-parallax="0.06"
          >
            <div className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] uppercase tracking-[0.3em] ${blogCategory[post.category] ?? 'text-white/40 border-white/10'}`}>
              {post.category}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white group-hover:gradient-text transition">{post.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">{post.excerpt}</p>
            <div className="mt-5 text-xs text-electric/60 group-hover:text-electric transition">
              Read article →
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── CONTACT SECTION ───────────────────────────── */
const contactLinks = [
  { label: 'Email',           href: 'mailto:direct@tejaskandi.dev', external: false, color: 'hover:border-cyan-400/40 hover:text-electric' },
  { label: 'LinkedIn',        href: 'https://www.linkedin.com/in/tejaskandi', external: true, color: 'hover:border-blue-400/40 hover:text-blue-300' },
  { label: 'GitHub',          href: 'https://github.com/tejaskandi', external: true, color: 'hover:border-purple-400/40 hover:text-purple-300' },
  { label: 'Resume Download', href: '/resume.pdf', external: false, color: 'hover:border-emerald-400/40 hover:text-emerald-300' },
];

export function ContactSection() {
  return (
    <section id="contact" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Contact</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Terminal-style contact for direct collaboration.
        </h2>
      </div>

      <div className="glass metal-border rounded-[2rem] p-4 sm:p-6" data-parallax="0.06">
        {/* Terminal window */}
        <div className="rounded-2xl border border-white/[0.08] bg-black/65 p-4 sm:p-6"
          style={{ boxShadow: '0 0 0 1px rgba(94,240,255,0.05), inset 0 0 40px rgba(0,0,0,0.4)' }}
        >
          {/* Traffic lights */}
          <div className="mb-5 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="ml-3 text-xs text-white/25 tracking-widest">tejas@portfolio ~ contact</span>
          </div>

          {/* Terminal lines */}
          <div className="font-mono text-sm space-y-1.5">
            <p className="text-white/90">
              <span className="text-electric">❯</span>{' '}
              <span className="text-purple-300">open</span>{' '}
              collaboration
            </p>
            <div className="mt-4 space-y-1 text-white/55 pl-2 border-l border-white/10">
              <p><span className="text-white/30">email</span>     &nbsp;—&nbsp; <span className="text-electric/80">direct@tejaskandi.dev</span></p>
              <p><span className="text-white/30">linkedin</span>  &nbsp;—&nbsp; <span className="text-blue-300/80">/in/tejaskandi</span></p>
              <p><span className="text-white/30">github</span>    &nbsp;—&nbsp; <span className="text-purple-300/80">/ItsTejasongithub</span></p>
              <p><span className="text-white/30">resume</span>    &nbsp;—&nbsp; <span className="text-emerald-300/80">download available</span></p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-electric">❯</span>
              <span className="inline-block w-2 h-4 bg-electric/70 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Link buttons */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          {contactLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              className={`rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-center text-sm text-white/75 transition ${item.color}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── PROJECTS SECTION ──────────────────────────── */
export function ProjectsSection() {
  return <ProjectCommandCenter />;
}
