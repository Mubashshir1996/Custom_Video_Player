# Custom Video Player

This Video Player built with Next.js and TypeScript mainly to explore how video rendering works with Canvas + Web Workers.

Instead of showing the default <video> element, the video is rendered onto a <canvas>, and all frame processing (like filters) is handled in a worker so the UI stays smooth.

## What is included

- Plays a local sample.mp4 file
- Hides default video controls
- Renders video frames on a <canvas>
- Custom play / pause button
- Custom timeline with draggable playhead
- Smooth timeline updates using requestAnimationFrame
- Applies basic pixel filters (grayscale / tint etc.)
- Uses a Web Worker + OffscreenCanvas for frame processing
- Basic keyboard support for timeline interaction

## How it works (high level)

- The hidden <video> element controls playback (time, play, pause, etc.)
- The <canvas> is what the user actually sees
- On each frame:
  - The current video frame is read
  - Sent to the worker
  - Filter is applied
  - Drawn back on canvas
- Timeline updates are handled using requestAnimationFrame to avoid lag

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

scripts:

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production build
```

## Project structure

```text
public/
  media/
    sample.mp4

src/
  app/
    (video-player)/
      page.tsx

  features/
    video-player/
      components/
      hooks/
      lib/
      workers/
```

## Deployment

This project is deployed on Vercel.
- Live Link : https://custom-video-player-lemon.vercel.app/.

No environment variables are required.