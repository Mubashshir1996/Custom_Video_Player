"use client";

import { PlayerCanvas } from "./PlayerCanvas";
import { PlayerControls } from "./PlayerControls";
import { PlayerTimeline } from "./PlayerTimeline";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import styles from "./VideoPlayer.module.css";

const SAMPLE_VIDEO_SOURCE = "/media/sample.mp4";

export function VideoPlayer() {
  const player = useVideoPlayer({ source: SAMPLE_VIDEO_SOURCE });

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Custom Video Player</p>
        </div>

        <PlayerCanvas
          canvasRef={player.canvasRef}
          source={player.source}
          statusMessage={player.statusMessage}
          videoRef={player.videoRef}
        />

        <div className={styles.controls}>
          <PlayerControls
            currentTime={player.currentTime}
            duration={player.duration}
            filter={player.filter}
            isPlaying={player.isPlaying}
            isReady={player.isReady}
            onFilterChange={player.handleFilterChange}
            onTogglePlayback={player.handleTogglePlayback}
          />
          <PlayerTimeline
            currentTime={player.currentTime}
            duration={player.duration}
            isReady={player.isReady}
            playheadRef={player.playheadRef}
            progressRef={player.progressRef}
            timelineProps={player.timelineProps}
            timelineRef={player.timelineRef}
          />
        </div>
      </div>
    </section>
  );
}
