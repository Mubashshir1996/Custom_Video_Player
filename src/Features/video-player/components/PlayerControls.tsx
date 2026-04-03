import { formatTime } from "../lib/formatTime";
import { FILTER_OPTIONS, type VideoFilter } from "../lib/playerFilters";
import styles from "./VideoPlayer.module.css";

type PlayerControlsProps = {
  currentTime: number;
  duration: number;
  filter: VideoFilter;
  isPlaying: boolean;
  isReady: boolean;
  onFilterChange: (nextFilter: VideoFilter) => void;
  onTogglePlayback: () => void | Promise<void>;
};

export function PlayerControls({
  currentTime,
  duration,
  filter,
  isPlaying,
  isReady,
  onFilterChange,
  onTogglePlayback,
}: PlayerControlsProps) {
  return (
    <div className={styles.controlsRow}>
      <button
        className={styles.primaryButton}
        data-active={isPlaying}
        disabled={!isReady}
        onClick={onTogglePlayback}
        type="button"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <div className={styles.timeReadout}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <label className={styles.filterField}>
        <span>Filter</span>
        <select
          disabled={!isReady}
          name="filter"
          onChange={(event) => onFilterChange(event.target.value as VideoFilter)}
          value={filter}
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
