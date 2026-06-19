'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type PointerPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
};

type CritterKind = 'bug' | 'bird' | 'cat' | 'spark';

type Critter = {
  id: number;
  kind: CritterKind;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};

type Burst = {
  id: number;
  kind: CritterKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  rotation: number;
  life: number;
};

const followerBlueprints = [
  { kind: 'bug' as const, lag: 0.12, spread: 22, orbit: 0.8 },
  { kind: 'bird' as const, lag: 0.16, spread: 42, orbit: 1.5 },
  { kind: 'cat' as const, lag: 0.21, spread: 58, orbit: 2.2 },
  { kind: 'spark' as const, lag: 0.09, spread: 16, orbit: 2.8 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function Icon({ kind }: { kind: CritterKind }) {
  if (kind === 'bird') {
    return (
      <svg viewBox="0 0 44 44" className="h-full w-full">
        <path d="M7 25 C14 17, 22 15, 31 17 C25 20, 19 27, 14 31" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M14 19 C20 13, 27 12, 36 15" fill="none" stroke="#5ef0ff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="18" r="2.5" fill="#fff" />
      </svg>
    );
  }

  if (kind === 'cat') {
    return (
      <svg viewBox="0 0 44 44" className="h-full w-full">
        <path
          d="M11 18 L15 10 L20 16 L24 10 L29 16 L33 18 C34 27, 30 32, 22 32 C14 32, 10 27, 11 18 Z"
          fill="rgba(94,240,255,0.14)"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="23" r="1.6" fill="#fff" />
        <circle cx="26" cy="23" r="1.6" fill="#fff" />
        <path d="M19 27 C21 29, 23 29, 25 27" fill="none" stroke="#5ef0ff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'bug') {
    return (
      <svg viewBox="0 0 44 44" className="h-full w-full">
        <ellipse cx="22" cy="23" rx="8" ry="11" fill="rgba(94,240,255,0.16)" stroke="rgba(255,255,255,0.92)" strokeWidth="2" />
        <path d="M16 17 L12 13 M28 17 L32 13" stroke="#5ef0ff" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 26 L11 31 M28 26 L33 31" stroke="#5ef0ff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="19" cy="20" r="1.2" fill="#fff" />
        <circle cx="25" cy="20" r="1.2" fill="#fff" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 44 44" className="h-full w-full">
      <circle cx="22" cy="22" r="6.5" fill="rgba(94,240,255,0.8)" />
      <circle cx="22" cy="22" r="13" fill="none" stroke="rgba(94,240,255,0.18)" strokeWidth="2" strokeDasharray="4 8" />
    </svg>
  );
}

export function ScrollLine() {
  const [progress, setProgress] = useState(0);
  const [viewport, setViewport] = useState({ width: 1920, height: 1080 });
  const [renderTick, setRenderTick] = useState(0);
  const pointerRef = useRef<PointerPoint>({ x: 0, y: 0, vx: 0, vy: 0, active: false });
  const viewportRef = useRef({ width: 1920, height: 1080 });
  const crittersRef = useRef<Critter[]>(
    followerBlueprints.map((item, index) => ({
      id: index + 1,
      kind: item.kind,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 0,
    }))
  );
  const burstsRef = useRef<Burst[]>([]);
  const idRef = useRef(1000);

  useEffect(() => {
    const update = () => {
      const nextViewport = { width: window.innerWidth, height: window.innerHeight };
      viewportRef.current = nextViewport;
      setViewport(nextViewport);
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? scrollTop / height : 0);
    };

    const onMove = (event: MouseEvent) => {
      const pointer = pointerRef.current;
      const nextX = event.clientX;
      const nextY = event.clientY;
      pointer.vx = nextX - pointer.x;
      pointer.vy = nextY - pointer.y;
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.active = true;
    };

    const onClick = (event: MouseEvent) => {
      const pointer = pointerRef.current;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;

      const kinds: CritterKind[] = ['bug', 'bird', 'cat', 'spark'];
      const nextBursts = Array.from({ length: 9 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 9 + Math.random() * 0.55;
        const speed = 2.5 + Math.random() * 4.5;

        return {
          id: idRef.current++,
          kind: kinds[index % kinds.length],
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          scale: 0.58 + Math.random() * 0.44,
          rotation: Math.random() * 360,
          life: 1,
        } satisfies Burst;
      });

      burstsRef.current.push(...nextBursts);
    };

    let frame = 0;

    const animate = () => {
      const pointer = pointerRef.current;
      const time = performance.now() / 1000;
      const currentViewport = viewportRef.current;

      crittersRef.current = crittersRef.current.map((critter, index) => {
        const blueprint = followerBlueprints[index];
        const targetX = pointer.active
          ? pointer.x + Math.cos(time * blueprint.orbit + index * 0.8) * blueprint.spread + pointer.vx * (0.12 + index * 0.02)
          : currentViewport.width * 0.15 + 80 + index * 56;
        const targetY = pointer.active
          ? pointer.y + Math.sin(time * (blueprint.orbit + 0.3) + index * 0.9) * (blueprint.spread * 0.56) + pointer.vy * 0.12
          : currentViewport.height * 0.16 + 38 + index * 28;

        const nextX = critter.x === 0 && critter.y === 0 ? targetX : lerp(critter.x, targetX, blueprint.lag);
        const nextY = critter.x === 0 && critter.y === 0 ? targetY : lerp(critter.y, targetY, blueprint.lag);
        const wiggle = Math.sin(time * 5 + index) * 8;
        const turn = Math.atan2(pointer.vy || 1, pointer.vx || 1) * (180 / Math.PI);

        return {
          ...critter,
          x: nextX,
          y: nextY,
          scale: 0.92 + Math.sin(time * 4 + index) * 0.05,
          rotation: turn + wiggle,
          opacity: pointer.active ? 1 : 0.78,
        };
      });

      burstsRef.current = burstsRef.current
        .map((burst) => ({
          ...burst,
          x: burst.x + burst.vx,
          y: burst.y + burst.vy,
          vx: burst.vx * 0.985,
          vy: burst.vy * 0.985 + 0.04,
          rotation: burst.rotation + 4,
          life: burst.life - 0.013,
        }))
        .filter((burst) => burst.life > 0);

      setRenderTick((value) => (value + 1) % 100000);
      frame = requestAnimationFrame(animate);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  const droplets = [
    { offset: 0, size: 26, blur: 0, opacity: 1 },
    { offset: 0.045, size: 20, blur: 1, opacity: 0.72 },
    { offset: 0.09, size: 16, blur: 2, opacity: 0.54 },
    { offset: 0.135, size: 12, blur: 4, opacity: 0.38 },
  ];

  const pathPoint = (t: number) => {
    const clamped = Math.max(0, Math.min(1, t));
    const height = viewport.height;
    const width = viewport.width;
    const y = clamped * (height - 120) + 60;
    const zig = Math.sin(clamped * Math.PI * 8) * 74;
    const drift = Math.cos(clamped * Math.PI * 3) * 18;
    const x = width * 0.18 + zig * 0.45 + drift;
    return { x, y };
  };

  const leader = pathPoint(progress);

  const renderedCritters = useMemo(() => crittersRef.current, [renderTick]);
  const renderedBursts = useMemo(() => burstsRef.current, [renderTick]);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 hidden lg:block">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 20%, rgba(94,240,255,0.06), transparent 18%), radial-gradient(circle at 10% 76%, rgba(139,92,246,0.05), transparent 14%)',
        }}
      />
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <radialGradient id="dropletGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="28%" stopColor="#5ef0ff" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#63d4ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#63d4ff" stopOpacity="0" />
          </radialGradient>
          <filter id="dropletBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path
          d={`M ${leader.x} 60 C ${leader.x + 80} ${leader.y * 0.22} ${leader.x - 85} ${leader.y * 0.52} ${leader.x + 18} ${leader.y}`}
          stroke="rgba(94,240,255,0.22)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="7 12"
        />
        {droplets.map((drop, index) => {
          const position = pathPoint(progress - drop.offset);
          const scale = 1 - index * 0.08;

          return (
            <g
              key={drop.offset}
              transform={`translate(${position.x}, ${position.y}) scale(${scale})`}
              style={{
                opacity: drop.opacity,
                filter: `blur(${drop.blur}px) drop-shadow(0 0 18px rgba(94,240,255,0.55))`,
              }}
            >
              <circle cx="0" cy="0" r={drop.size} fill="url(#dropletGlow)" />
              <circle cx="-4" cy="-6" r={drop.size * 0.28} fill="rgba(255,255,255,0.78)" />
            </g>
          );
        })}
      </svg>

      {renderedCritters.map((critter) => (
        <div
          key={critter.id}
          className="absolute h-12 w-12"
          style={{
            transform: `translate3d(${critter.x}px, ${critter.y}px, 0) translate(-50%, -50%) rotate(${critter.rotation}deg) scale(${critter.scale})`,
            opacity: critter.opacity,
            filter: 'drop-shadow(0 0 18px rgba(94,240,255,0.4))',
          }}
        >
          <div className="h-full w-full rounded-full bg-white/[0.02] backdrop-blur-sm">
            <Icon kind={critter.kind} />
          </div>
        </div>
      ))}

      {renderedBursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute h-10 w-10"
          style={{
            transform: `translate3d(${burst.x}px, ${burst.y}px, 0) translate(-50%, -50%) rotate(${burst.rotation}deg) scale(${burst.scale})`,
            opacity: clamp(burst.life, 0, 1),
            filter: 'drop-shadow(0 0 16px rgba(94,240,255,0.45))',
          }}
        >
          <Icon kind={burst.kind} />
        </div>
      ))}
    </div>
  );
}
