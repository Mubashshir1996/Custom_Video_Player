export function formatTime(valueInSeconds: number) {
  if (!Number.isFinite(valueInSeconds) || valueInSeconds < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(valueInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
