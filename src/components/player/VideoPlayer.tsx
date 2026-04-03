"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/formatTime";
import styles from "./VideoPlayer.module.css";

const SAMPLE_VIDEO_SOURCE = "/media/sample.mp4";

export function VideoPlayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleTogglePlayback() {
    const video = videoRef.current;

    if (!video || !isReady) {
      return;
    }

    if (video.paused) {
      setErrorMessage(null);

      try {
        await video.play();
      } catch {
        setErrorMessage("Playback was blocked by the browser.");
      }

      return;
    }

    video.pause();
  }

  useEffect(() => {
    const mediaElement = videoRef.current;

    if (!mediaElement) {
      return;
    }

    const video = mediaElement;
    let frameRequestId: number | null = null;

    function stopFrameLoop() {
      if (frameRequestId !== null) {
        cancelAnimationFrame(frameRequestId);
        frameRequestId = null;
      }
    }

    function drawCurrentFrame() {
      const canvas = canvasRef.current;

      if (!canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    function renderFrame() {
      drawCurrentFrame();

      if (video.paused || video.ended) {
        frameRequestId = null;
        return;
      }

      frameRequestId = requestAnimationFrame(renderFrame);
    }

    function startFrameLoop() {
      stopFrameLoop();
      frameRequestId = requestAnimationFrame(renderFrame);
    }

    function handleLoadedMetadata() {
      setDuration(video.duration || 0);
      setCurrentTime(video.currentTime || 0);
    }

    function handleLoadedData() {
      setIsReady(true);
      setErrorMessage(null);
      drawCurrentFrame();
    }

    function handleTimeUpdate() {
      setCurrentTime(video.currentTime || 0);
    }

    function handleSeeked() {
      setCurrentTime(video.currentTime || 0);
      drawCurrentFrame();
    }

    function handlePlay() {
      setIsPlaying(true);
      startFrameLoop();
    }

    function handlePause() {
      setIsPlaying(false);
      stopFrameLoop();
      drawCurrentFrame();
    }

    function handleEnded() {
      setIsPlaying(false);
      setCurrentTime(video.currentTime || 0);
      stopFrameLoop();
      drawCurrentFrame();
    }

    function handleError() {
      setErrorMessage("Could not load the video.");
      setIsReady(false);
      setIsPlaying(false);
      stopFrameLoop();
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata();
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      handleLoadedData();
    }

    return () => {
      stopFrameLoop();
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, []);

  const progressPercent = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Custom Video Player</p>
        </div>

        <div className={styles.viewport}>
          <canvas
            aria-label="Canvas video player"
            className={styles.canvas}
            ref={canvasRef}
            height={540}
            width={960}
          />

          {!isReady && !errorMessage ? (
            <div className={styles.statusOverlay}>Loading video...</div>
          ) : null}

          {errorMessage ? <div className={styles.statusOverlay}>{errorMessage}</div> : null}

          <video
            aria-hidden="true"
            className={styles.hiddenVideo}
            crossOrigin="anonymous"
            playsInline
            preload="auto"
            ref={videoRef}
            src={SAMPLE_VIDEO_SOURCE}
            tabIndex={-1}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.controlsRow}>
            <button
              className={styles.primaryButton}
              data-active={isPlaying}
              disabled={!isReady}
              onClick={handleTogglePlayback}
              type="button"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <div className={styles.timeReadout}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <label className={styles.filterField}>
              <span>Filter</span>
              <select disabled name="filter">
                <option>Grayscale</option>
                <option>Sepia</option>
                <option>Invert</option>
              </select>
            </label>
          </div>

          <div aria-hidden="true" className={styles.timeline}>
            <div className={styles.timelineTrack}>
              <div
                className={styles.timelineProgress}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={styles.playhead} style={{ left: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
