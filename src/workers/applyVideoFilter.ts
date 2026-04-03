import type { VideoFilter } from "../components/player/playerFilters";

export function applyVideoFilter(pixels: Uint8ClampedArray, filter: VideoFilter) {
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    if (filter === "grayscale") {
      const value = red * 0.299 + green * 0.587 + blue * 0.114;
      pixels[index] = value;
      pixels[index + 1] = value;
      pixels[index + 2] = value;
      continue;
    }

    if (filter === "sepia") {
      pixels[index] = Math.min(255, red * 0.393 + green * 0.769 + blue * 0.189);
      pixels[index + 1] = Math.min(255, red * 0.349 + green * 0.686 + blue * 0.168);
      pixels[index + 2] = Math.min(255, red * 0.272 + green * 0.534 + blue * 0.131);
      continue;
    }

    if (filter === "invert") {
      pixels[index] = 255 - red;
      pixels[index + 1] = 255 - green;
      pixels[index + 2] = 255 - blue;
      continue;
    }

    pixels[index] = Math.min(255, red * 0.8 + 30);
    pixels[index + 1] = Math.min(255, green * 1.03 + 12);
    pixels[index + 2] = Math.min(255, blue * 1.12 + 42);
  }
}
