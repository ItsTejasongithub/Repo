'use client';

import { useEffect, useState } from 'react';

const phrases = ['Production-Grade Systems', 'AI Workflows', 'Real-Time Dashboards', 'Robotics Interfaces'];
const longestPhrase = phrases.reduce((cur, p) => (p.length > cur.length ? p : cur), phrases[0]);

export function TypingHeadline() {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index % phrases.length];
    const isComplete = !deleting && text === current;
    const isEmpty    = deleting && text.length === 0;

    const timeout = window.setTimeout(() => {
      if (isComplete) { setDeleting(true); return; }
      if (isEmpty)    { setDeleting(false); setIndex((v) => v + 1); return; }
      if (!deleting)  { setText(current.slice(0, text.length + 1)); return; }
      setText(current.slice(0, text.length - 1));
    }, isComplete ? 1300 : isEmpty ? 520 : deleting ? 85 : 125);

    return () => window.clearTimeout(timeout);
  }, [deleting, index, text]);

  return (
    <span className="typing-slot relative block min-h-[5.5rem] max-w-full text-center sm:min-h-[1.35em] lg:min-h-[2.8rem]">
      {/* invisible spacer keeps layout stable */}
      <span aria-hidden="true" className="invisible block leading-tight lg:whitespace-nowrap">
        {longestPhrase}
      </span>
      <span className="absolute inset-x-0 top-0 inline-flex items-baseline justify-center leading-tight lg:whitespace-nowrap">
        <span className="gradient-text">{text}</span>
        <span className="ml-2 inline-block h-[0.85em] w-[2px] animate-pulse bg-electric translate-y-[0.08em]" />
      </span>
    </span>
  );
}
