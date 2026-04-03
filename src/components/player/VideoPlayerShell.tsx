import styles from "./VideoPlayerShell.module.css";

export function VideoPlayerShell() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
            <p className={styles.eyebrow}>Custom Video Player</p>
        </div>

        <div className={styles.viewport}>
          <canvas
            aria-label="Canvas video player placeholder"
            className={styles.canvas}
            height={540}
            width={960}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.controlsRow}>
            <button className={styles.primaryButton} disabled type="button">
              Play
            </button>

            <div className={styles.timeReadout}>00:00 / 00:00</div>

            <label className={styles.filterField}>
              <span>Filter</span>
              <select disabled name="filter">
                <option>Grayscale</option>
                <option>Sepia</option>
                <option>Invert</option>
              </select>
            </label>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineTrack}>
              <div className={styles.timelineProgress} />
            </div>
            <div className={styles.playhead} />
          </div>
        </div>
      </div>
    </section>
  );
}
