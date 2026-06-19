import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        panel: 'rgba(10, 12, 18, 0.72)',
        line: 'rgba(104, 219, 255, 0.28)',
        electric: '#63d4ff',
        cyan: '#5ef0ff',
        purple: '#8b5cf6',
        steel: '#b7c4d4',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,212,255,0.15), 0 0 40px rgba(99,212,255,0.08)',
        'glow-lg': '0 0 0 1px rgba(99,212,255,0.22), 0 0 60px rgba(99,212,255,0.14), 0 0 120px rgba(139,92,246,0.07)',
        'glow-purple': '0 0 0 1px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.14)',
        profile:
          '0 0 0 2px rgba(94,240,255,0.32), 0 0 40px rgba(94,240,255,0.18), 0 0 80px rgba(139,92,246,0.12), 0 24px 60px rgba(0,0,0,0.7)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        orbitCw: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        orbitCcw: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatY2: {
          '0%, 100%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(5px)' },
        },
        scanLine: {
          '0%': { top: '-5%', opacity: '0' },
          '5%': { opacity: '1' },
          '92%': { opacity: '1' },
          '100%': { top: '105%', opacity: '0' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        gradientX: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '300% 50%' },
        },
        rayPulse: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        shimmer: 'shimmer 12s linear infinite',
        pulseGlow: 'pulseGlow 5s ease-in-out infinite',
        'orbit-cw': 'orbitCw 28s linear infinite',
        'orbit-cw-fast': 'orbitCw 14s linear infinite',
        'orbit-ccw': 'orbitCcw 38s linear infinite',
        'float-y': 'floatY 4s ease-in-out infinite',
        'float-y-2': 'floatY2 5s ease-in-out infinite',
        'scan-line': 'scanLine 6s ease-in-out 2s infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'gradient-x': 'gradientX 7s ease infinite',
        'border-flow': 'borderFlow 4s linear infinite',
        'ray-pulse': 'rayPulse 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
