import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoFilter } from "../lib/playerFilters";
import { useCanvasWorker } from "./useCanvasWorker";
import { useTimelineScrubbing } from "./useTimelineScrubbing";
import { useTimelineSync } from "./useTimelineSync";

type UseVideoPlayerOptions = {
  source: string;
};

export function useVideoPlayer({ source }: UseVideoPlayerOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [filter, setFilter] = useState<VideoFilter>("grayscale");
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const resumePlaybackAfterScrubRef = useRef(false);
  const { playheadRef, progressRef, syncTimeline } = useTimelineSync();
  const { isWorkerReady, renderFrame, workerError } = useCanvasWorker({ canvasRef, filter });
  const errorMessage = mediaError ?? workerError;
  const isReady = isMediaReady && isWorkerReady && !errorMessage;
  const statusMessage =
    errorMessage ??
    (!isMediaReady ? "Loading video..." : !isWorkerReady ? "Starting renderer..." : null);

  const scrubToTime = useCallback(
    (nextTime: number) => {
      const video = videoRef.current;

      if (!video) {
        return;
      }

      const safeDuration = video.duration || duration;
      const clampedTime = Math.min(Math.max(nextTime, 0), safeDuration || 0);

      setCurrentTime(clampedTime);
      syncTimeline(clampedTime, safeDuration);

      if (Math.abs(video.currentTime - clampedTime) > 0.01) {
        video.currentTime = clampedTime;
      }
    },
    [duration, syncTimeline]
  );

  const handleScrubStart = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    resumePlaybackAfterScrubRef.current = !video.paused && !video.ended;

    if (resumePlaybackAfterScrubRef.current) {
      video.pause();
    }
  }, []);

  const handleScrubEnd = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (resumePlaybackAfterScrubRef.current) {
      resumePlaybackAfterScrubRef.current = false;
      void video.play().catch(() => {
        setMediaError("Playback was blocked by the browser.");
      });
      return;
    }

    void renderFrame(video);
  }, [renderFrame]);

  const { timelineProps, timelineRef } = useTimelineScrubbing({
    currentTime,
    duration,
    isReady,
    onScrub: scrubToTime,
    onScrubEnd: handleScrubEnd,
    onScrubStart: handleScrubStart,
  });

  async function handleTogglePlayback() {
    const video = videoRef.current;

    if (!video || !isReady) {
      return;
    }

    if (video.paused) {
      setMediaError(null);

      try {
        await video.play();
      } catch {
        setMediaError("Playback was blocked by the browser.");
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

    function syncCurrentFrame() {
      syncTimeline(video.currentTime, video.duration);
      void renderFrame(video);
    }

    function stopFrameLoop() {
      if (frameRequestId !== null) {
        cancelAnimationFrame(frameRequestId);
        frameRequestId = null;
      }
    }

    function renderLoop() {
      syncCurrentFrame();

      if (video.paused || video.ended) {
        frameRequestId = null;
        return;
      }

      frameRequestId = requestAnimationFrame(renderLoop);
    }

    function handleLoadedMetadata() {
      setDuration(video.duration || 0);
      setCurrentTime(video.currentTime || 0);
      syncCurrentFrame();
    }

    function handleLoadedData() {
      setIsMediaReady(true);
      setMediaError(null);
      syncCurrentFrame();
    }

    function handleTimeUpdate() {
      setCurrentTime(video.currentTime || 0);
      syncTimeline(video.currentTime, video.duration);
    }

    function handleSeeked() {
      setCurrentTime(video.currentTime || 0);
      syncCurrentFrame();
    }

    function handlePlay() {
      setIsPlaying(true);
      stopFrameLoop();
      frameRequestId = requestAnimationFrame(renderLoop);
    }

    function handlePause() {
      setIsPlaying(false);
      stopFrameLoop();
      syncCurrentFrame();
    }

    function handleEnded() {
      setIsPlaying(false);
      setCurrentTime(video.currentTime || 0);
      stopFrameLoop();
      syncCurrentFrame();
    }

    function handleError() {
      setMediaError("Could not load the video.");
      setIsMediaReady(false);
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
  }, [renderFrame, syncTimeline]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isMediaReady || !isWorkerReady) {
      return;
    }

    syncTimeline(video.currentTime, video.duration);
    void renderFrame(video);
  }, [filter, isMediaReady, isWorkerReady, renderFrame, syncTimeline]);

  return {
    canvasRef,
    currentTime,
    duration,
    filter,
    handleFilterChange: setFilter,
    handleTogglePlayback,
    isPlaying,
    isReady,
    playheadRef,
    progressRef,
    source,
    statusMessage,
    timelineProps,
    timelineRef,
    videoRef,
  };
}
