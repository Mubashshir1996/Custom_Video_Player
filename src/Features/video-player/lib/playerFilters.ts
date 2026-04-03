export const FILTER_OPTIONS = [
  { label: "Grayscale", value: "grayscale" },
  { label: "Sepia", value: "sepia" },
  { label: "Invert", value: "invert" },
  { label: "Tint", value: "tint" },
] as const;

export type VideoFilter = (typeof FILTER_OPTIONS)[number]["value"];
