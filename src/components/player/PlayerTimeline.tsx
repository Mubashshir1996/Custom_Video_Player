import type { RefObject } from "react";
import styles from "./VideoPlayer.module.css";

type PlayerTimelineProps = {
  playheadRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLDivElement | null>;
};

export function PlayerTimeline({ playheadRef, progressRef }: PlayerTimelineProps) {
  return (
    <div aria-hidden="true" className={styles.timeline}>
      <div className={styles.timelineTrack}>
        <div className={styles.timelineProgress} ref={progressRef} />
      </div>
      <div className={styles.playhead} ref={playheadRef} />
    </div>
  );
}
