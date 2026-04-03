import { useCallback, useRef } from "react";

type UseTimelineScrubbingOptions = {
  currentTime: number;
  duration: number;
  isReady: boolean;
  onScrub: (nextTime: number) => void;
  onScrubEnd: () => void;
  onScrubStart: () => void;
};

export function useTimelineScrubbing({
  currentTime,
  duration,
  isReady,
  onScrub,
  onScrubEnd,
  onScrubStart,
}: UseTimelineScrubbingOptions) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef(false);

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      const timeline = timelineRef.current;

      if (!timeline || duration <= 0) {
        return 0;
      }

      const { left, width } = timeline.getBoundingClientRect();
      const progress = Math.min(Math.max((clientX - left) / width, 0), 1);
      return progress * duration;
    },
    [duration]
  );

  const updateScrubPosition = useCallback(
    (clientX: number) => {
      onScrub(getTimeFromPosition(clientX));
    },
    [getTimeFromPosition, onScrub]
  );

  const finishScrubbing = useCallback(() => {
    if (!isScrubbingRef.current) {
      return;
    }

    isScrubbingRef.current = false;
    onScrubEnd();
  }, [onScrubEnd]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isReady) {
        return;
      }

      event.preventDefault();
      isScrubbingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      onScrubStart();
      updateScrubPosition(event.clientX);
    },
    [isReady, onScrubStart, updateScrubPosition]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isScrubbingRef.current) {
        return;
      }

      updateScrubPosition(event.clientX);
    },
    [updateScrubPosition]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isScrubbingRef.current) {
        return;
      }

      updateScrubPosition(event.clientX);
      finishScrubbing();
    },
    [finishScrubbing, updateScrubPosition]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isReady || duration <= 0) {
        return;
      }

      const step = duration > 60 ? 5 : 1;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onScrub(Math.max(currentTime - step, 0));
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onScrub(Math.min(currentTime + step, duration));
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        onScrub(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        onScrub(duration);
      }
    },
    [currentTime, duration, isReady, onScrub]
  );

  return {
    timelineRef,
    timelineProps: {
      onKeyDown: handleKeyDown,
      onLostPointerCapture: finishScrubbing,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      tabIndex: isReady ? 0 : -1,
    },
  };
}
