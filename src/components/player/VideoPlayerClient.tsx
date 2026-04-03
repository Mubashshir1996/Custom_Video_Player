"use client";

import dynamic from "next/dynamic";

const VideoPlayer = dynamic(
  () => import("./VideoPlayer").then((module) => module.VideoPlayer),
  { ssr: false }
);

export function VideoPlayerClient() {
  return <VideoPlayer />;
}
