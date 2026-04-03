import type { VideoFilter } from "./playerFilters";

export type VideoWorkerRequest =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      width: number;
      height: number;
    }
  | {
      type: "render-frame";
      frame: ImageBitmap;
      filter: VideoFilter;
      width: number;
      height: number;
    };

export type VideoWorkerResponse =
  | { type: "ready" }
  | { type: "frame-rendered" }
  | { type: "error"; message: string };
