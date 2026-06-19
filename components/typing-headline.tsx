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
    }, isComplete ? 1000 : isEmpty ? 380 : deleting ? 65 : 95);

    return () => window.clearTimeout(timeout);
  }, [deleting, index, text]);

  return (
    <span className="typing-slot relative block min-h-[5.5rem] max-w-full sm:min-h-[1.35em] lg:min-h-[2.8rem]">
      {/* invisible spacer keeps layout stable */}
      <span aria-hidden="true" className="invisible absolute left-0 top-0">
        {longestPhrase}
      </span>
      <span className="block leading-tight gradient-text lg:whitespace-nowrap">{text}</span>
      <span className="inline-block h-5 w-[2px] animate-pulse bg-electric align-baseline sm:h-6" />
    </span>
  );
}
