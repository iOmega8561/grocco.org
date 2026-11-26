import { useEffect, useState } from "react";

/** How long a burst of activity lasts once the drive is clicked. */
const busyFor = 1800;

/**
 * A hard drive with its cover off, beside the timeline: the platter spins and the arm seeks across
 * the tracks, its LED blinking as it reads. Clicked, it gets busy for a moment. Readers who ask for
 * less motion get it still.
 */
export function HardDrive() {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setBusy(false), busyFor);
    return () => window.clearTimeout(timer);
  }, [busy]);

  return (
    <div className="sa-hdd" data-busy={busy ? "" : undefined} onClick={() => setBusy(true)}>
      <span className="sa-hdd__platter" />
      <span className="sa-hdd__hub" />
      <span className="sa-hdd__arm" />
      <span className="sa-hdd__pivot" />
      <span className="sa-hdd__led" />
    </div>
  );
}
