import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { VideoFilter } from "../lib/playerFilters";
import type { VideoWorkerRequest, VideoWorkerResponse } from "../lib/playerWorkerMessages";

type UseCanvasWorkerOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  filter: VideoFilter;
};

type OffscreenCanvasElement = HTMLCanvasElement & {
  transferControlToOffscreen?: () => OffscreenCanvas;
};

export function useCanvasWorker({ canvasRef, filter }: UseCanvasWorkerOptions) {
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef(false);
  const framePendingRef = useRef(false);
  const filterRef = useRef(filter);
  const queuedVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasTransferredRef = useRef(false);
  const cleanupTimerRef = useRef<number | null>(null);
  const disposeWorkerRef = useRef<(() => void) | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [runtimeWorkerError, setRuntimeWorkerError] = useState<string | null>(null);
  const supportsWorkerCanvas =
    typeof window !== "undefined" &&
    typeof Worker !== "undefined" &&
    typeof createImageBitmap !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "transferControlToOffscreen" in HTMLCanvasElement.prototype;

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const renderFrame = useCallback(
    async function processFrame(video: HTMLVideoElement) {
      const worker = workerRef.current;

      if (!worker || !workerReadyRef.current || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      if (framePendingRef.current) {
        queuedVideoRef.current = video;
        return;
      }

      framePendingRef.current = true;
      queuedVideoRef.current = null;

      try {
        const frame = await createImageBitmap(video);
        const activeWorker = workerRef.current;

        if (!activeWorker || !workerReadyRef.current) {
          framePendingRef.current = false;
          frame.close();
          return;
        }

        const message: VideoWorkerRequest = {
          type: "render-frame",
          frame,
          filter: filterRef.current,
          width: video.videoWidth,
          height: video.videoHeight,
        };

        activeWorker.postMessage(message, [frame]);
      } catch {
        framePendingRef.current = false;
        setRuntimeWorkerError("Could not capture a frame for worker rendering.");
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current as OffscreenCanvasElement | null;

    if (!canvas) {
      return;
    }

    if (!supportsWorkerCanvas || typeof canvas.transferControlToOffscreen !== "function") {
      return;
    }

    if (cleanupTimerRef.current !== null) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    if (workerRef.current) {
      return () => {
        cleanupTimerRef.current = window.setTimeout(() => {
          cleanupTimerRef.current = null;
          disposeWorkerRef.current?.();
        }, 0);
      };
    }

    if (canvasTransferredRef.current) {
      return;
    }

    const worker = new Worker(new URL("../workers/videoFilter.worker.ts", import.meta.url), {
      type: "module",
    });
    const offscreenCanvas = canvas.transferControlToOffscreen();
    canvasTransferredRef.current = true;

    function handleMessage(event: MessageEvent<VideoWorkerResponse>) {
      if (event.data.type === "ready") {
        workerReadyRef.current = true;
        setIsWorkerReady(true);
        setRuntimeWorkerError(null);
        return;
      }

      if (event.data.type === "frame-rendered") {
        framePendingRef.current = false;

        if (queuedVideoRef.current) {
          const queuedVideo = queuedVideoRef.current;
          queuedVideoRef.current = null;
          void renderFrame(queuedVideo);
        }

        return;
      }

      framePendingRef.current = false;
      queuedVideoRef.current = null;
      workerReadyRef.current = false;
      setIsWorkerReady(false);
      setRuntimeWorkerError(event.data.message);
    }

    function handleError() {
      framePendingRef.current = false;
      queuedVideoRef.current = null;
      workerReadyRef.current = false;
      setIsWorkerReady(false);
      setRuntimeWorkerError("The video worker stopped responding.");
    }

    workerRef.current = worker;
    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);
    disposeWorkerRef.current = () => {
      framePendingRef.current = false;
      queuedVideoRef.current = null;
      workerReadyRef.current = false;
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      worker.terminate();
      workerRef.current = null;
      disposeWorkerRef.current = null;
    };

    const message: VideoWorkerRequest = {
      type: "init",
      canvas: offscreenCanvas,
      width: canvas.width,
      height: canvas.height,
    };

    worker.postMessage(message, [offscreenCanvas]);

    return () => {
      cleanupTimerRef.current = window.setTimeout(() => {
        cleanupTimerRef.current = null;
        disposeWorkerRef.current?.();
      }, 0);
    };
  }, [canvasRef, renderFrame, supportsWorkerCanvas]);

  const workerError =
    runtimeWorkerError ??
    (supportsWorkerCanvas
      ? null
      : "This browser needs OffscreenCanvas worker support for filtered playback.");

  return { isWorkerReady, renderFrame, workerError };
}
