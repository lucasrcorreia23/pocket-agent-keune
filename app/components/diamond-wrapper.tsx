'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

function DiamondIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ffffff" />
      <path d="M12 2L7 9H17L12 2Z" fill="#e2e8f0" opacity="0.9" />
      <path d="M7 9L12 22L2 9H7Z" fill="#cbd5f5" opacity="0.8" />
    </svg>
  );
}

function DiamondFallback() {
  return (
    <div className="fixed inset-0 bg-[#f6f7fb] flex items-center justify-center pointer-events-none">
      <div className="absolute w-[760px] h-[760px] bg-[#eef5ff] rounded-full blur-[150px] opacity-80" />
      <div className="absolute w-[980px] h-[980px] bg-[#e9f2ff] rounded-full blur-[220px] opacity-45" />
      <div className="relative w-48 h-48 animate-diamond-rotate">
        <DiamondIcon className="w-full h-full drop-shadow-2xl" />
      </div>
    </div>
  );
}

const DiamondBackground = dynamic(
  () => import('./diamond-background').then((mod) => mod.DiamondBackground),
  {
    ssr: false,
    loading: () => <DiamondFallback />
  }
);

export function DiamondWrapper() {
  return (
    <Suspense fallback={<DiamondFallback />}>
      <DiamondBackground />
    </Suspense>
  );
}
