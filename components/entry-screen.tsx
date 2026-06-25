'use client';

import { useEffect, useState } from 'react';

interface EntryScreenProps {
  onBegin: () => void;
}

export function EntryScreen({ onBegin }: EntryScreenProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    // Prevent multiple clicks
    if (isClicked) return;

    setIsClicked(true);

    // Dispatch specific event only from this button to unlock audio (once only)
    window.dispatchEvent(new Event('portfolio-begin'));

    // Trigger the callback to hide entry screen
    onBegin();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center justify-center gap-8 px-6 text-center pointer-events-auto">

        {/* Desktop recommendation - only on mobile */}
        {isMobile && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-6 py-3">
            <p className="text-sm text-yellow-300/80">
              For better experience, open this on desktop with audio enabled
            </p>
          </div>
        )}

        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to My Portfolio
          </h1>
          <p className="text-lg md:text-xl text-white/70">
            Explore my work, projects, and engineering journey
          </p>
        </div>

        {/* Subtitle hint - above button */}
        <p className="mt-6 text-sm text-white/50">
          Watch as my avatar walks in and greets you with voice guidance
        </p>

        {/* CTA Button */}
        <button
          onClick={handleClick}
          disabled={isClicked}
          className={`group mt-4 px-10 py-4 rounded-lg border border-cyan-400/50 bg-cyan-500/10 font-semibold transition-all duration-300 text-lg ${
            isClicked
              ? 'opacity-50 cursor-not-allowed border-cyan-400/20 bg-cyan-500/5 text-cyan-400'
              : 'hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/30'
          }`}
        >
          <span className="flex items-center gap-3">
            {isClicked ? 'Beginning...' : 'Click Here to Begin'}
            <span className={isClicked ? '' : 'inline-block animate-pulse'}>→</span>
          </span>
        </button>
      </div>
    </div>
  );
}
