'use client';

import { useEffect, useRef, useState } from 'react';

export function ArticleReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const frameRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

      setProgress(nextProgress);
      setIsVisible(true);

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 900);
    }

    function onScroll() {
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        updateProgress();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-toast h-[3px] w-screen origin-center bg-surface-elevated/50 transition-[opacity,transform] duration-200 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
      }}
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-accent-primary transition-transform duration-100 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
