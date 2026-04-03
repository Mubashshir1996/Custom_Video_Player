import type { RefObject } from "react";
import styles from "./VideoPlayer.module.css";

type PlayerCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  source: string;
  statusMessage: string | null;
};

export function PlayerCanvas({
  canvasRef,
  videoRef,
  source,
  statusMessage,
}: PlayerCanvasProps) {
  return (
    <div className={styles.viewport}>
      <canvas
        aria-label="Canvas video player"
        className={styles.canvas}
        ref={canvasRef}
        height={540}
        width={960}
      />

      {statusMessage ? <div className={styles.statusOverlay}>{statusMessage}</div> : null}

      <video
        aria-hidden="true"
        className={styles.hiddenVideo}
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        ref={videoRef}
        src={source}
        tabIndex={-1}
      />
    </div>
  );
}
