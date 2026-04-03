import { useCallback, useRef } from "react";

export function useTimelineSync() {
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const syncTimeline = useCallback((currentTime: number, duration: number) => {
    const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${progress})`;
    }

    if (playheadRef.current) {
      playheadRef.current.style.left = `${progress * 100}%`;
    }
  }, []);

  return { playheadRef, progressRef, syncTimeline };
}
