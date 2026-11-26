import { useEffect, useState } from "react";

/**
 * The power of the rack: on since the page opened, off for a moment after the button is pressed, then
 * up again, booting from the bottom. The LEDs of the slabs read it from the button, in the theme’s CSS.
 */
type Power = "on" | "off" | "up";

/** How long the rack stays dark before it boots again. */
const offFor = 1400;

/**
 * Over the stack: the two rails it is mounted on and a power button. Pressed, the button turns the
 * rack off, and a moment later it boots again from the System slab up.
 */
export function Rack() {
  const [power, setPower] = useState<Power>("on");

  useEffect(() => {
    if (power !== "off") return;
    const timer = window.setTimeout(() => setPower("up"), offFor);
    return () => window.clearTimeout(timer);
  }, [power]);

  return (
    <>
      <span className="sa-rail" data-side="left" />
      <span className="sa-rail" data-side="right" />
      <span className="sa-power" data-state={power} onClick={() => power !== "off" && setPower("off")}>
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M12 3 V11" />
          <path d="M7.4 6.6 A7.5 7.5 0 1 0 16.6 6.6" />
        </svg>
      </span>
    </>
  );
}
