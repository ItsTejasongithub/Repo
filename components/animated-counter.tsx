'use client';

import { useEffect, useState } from 'react';

export function AnimatedCounter({ value }: { value: string }) {
  const numeric = Number.parseInt(value, 10);
  const isNumeric = Number.isFinite(numeric);
  const [display, setDisplay] = useState(isNumeric ? 0 : value);

  useEffect(() => {
    if (!isNumeric) return;
    let frame = 0;
    const duration = 900;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.floor(numeric * (0.15 + progress * 0.85)));
      frame = requestAnimationFrame(animate);
      if (progress >= 1) cancelAnimationFrame(frame);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isNumeric, numeric]);

  return <span className="font-numbers">{isNumeric ? `${display}+` : value}</span>;
}
