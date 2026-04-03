/// <reference lib="webworker" />

import type {
  VideoWorkerRequest,
  VideoWorkerResponse,
} from "../lib/playerWorkerMessages";
import { applyVideoFilter } from "./applyVideoFilter";

const workerScope = self as DedicatedWorkerGlobalScope;
let outputCanvas: OffscreenCanvas | null = null;
let outputContext: OffscreenCanvasRenderingContext2D | null = null;

function postResponse(message: VideoWorkerResponse) {
  workerScope.postMessage(message);
}

function ensureContext(width: number, height: number) {
  if (!outputCanvas || !outputContext) {
    return false;
  }

  if (outputCanvas.width !== width || outputCanvas.height !== height) {
    outputCanvas.width = width;
    outputCanvas.height = height;
  }

  return true;
}

workerScope.onmessage = (event: MessageEvent<VideoWorkerRequest>) => {
  if (event.data.type === "init") {
    outputCanvas = event.data.canvas;
    outputContext = outputCanvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
    });

    if (!outputContext || !ensureContext(event.data.width, event.data.height)) {
      postResponse({ type: "error", message: "Could not start the worker renderer." });
      return;
    }

    postResponse({ type: "ready" });
    return;
  }

  if (!outputCanvas || !outputContext || !ensureContext(event.data.width, event.data.height)) {
    event.data.frame.close();
    postResponse({ type: "error", message: "Worker renderer is not ready." });
    return;
  }

  outputContext.drawImage(event.data.frame, 0, 0, event.data.width, event.data.height);
  event.data.frame.close();

  const imageData = outputContext.getImageData(0, 0, event.data.width, event.data.height);
  applyVideoFilter(imageData.data, event.data.filter);
  outputContext.putImageData(imageData, 0, 0);
  postResponse({ type: "frame-rendered" });
};
