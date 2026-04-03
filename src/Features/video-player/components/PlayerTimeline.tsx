import type { ComponentPropsWithoutRef, RefObject } from "react";
import styles from "./VideoPlayer.module.css";

type PlayerTimelineProps = {
  currentTime: number;
  duration: number;
  isReady: boolean;
  playheadRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLDivElement | null>;
  timelineProps: ComponentPropsWithoutRef<"div">;
  timelineRef: RefObject<HTMLDivElement | null>;
};

export function PlayerTimeline({
  currentTime,
  duration,
  isReady,
  playheadRef,
  progressRef,
  timelineProps,
  timelineRef,
}: PlayerTimelineProps) {
  return (
    <div
      aria-disabled={!isReady}
      aria-label="Video timeline"
      aria-valuemax={Math.round(duration)}
      aria-valuemin={0}
      aria-valuenow={Math.round(currentTime)}
      className={`${styles.timeline} ${styles.timelineInteractive}`}
      ref={timelineRef}
      role="slider"
      {...timelineProps}
    >
      <div className={styles.timelineTrack}>
        <div className={styles.timelineProgress} ref={progressRef} />
      </div>
      <div className={styles.playhead} ref={playheadRef} />
    </div>
  );
}
