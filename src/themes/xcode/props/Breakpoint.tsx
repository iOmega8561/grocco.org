import { useLayoutEffect, useRef, useState } from "react";

/** The marker's size, and its distance from the name. */
const width = 26;
const height = 16;
const gap = 14;

/** Where the marker sits, in the slot's own coordinates. */
type Spot = { left: number; top: number };

/**
 * A breakpoint in the gutter of a project page, beside the first line of the name. Clicked, it turns
 * off and on again, as in an editor. Where the name leaves no room beside it, as with a long name on
 * a phone, there is no breakpoint rather than one over the name.
 */
export function Breakpoint() {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [enabled, setEnabled] = useState(true);

  useLayoutEffect(() => {
    const slot = ref.current?.closest(".theme-slot");
    const name = slot?.parentElement?.querySelector(".project-hero__name");
    if (!slot || !name) return;

    const place = () => {
      const range = document.createRange();
      range.selectNodeContents(name);
      const line = range.getClientRects()[0];
      if (!line || line.left - gap - width < 4) return setSpot(null);
      const box = slot.getBoundingClientRect();
      setSpot({ left: line.left - box.left - gap - width, top: line.top - box.top + (line.height - height) / 2 });
    };

    place();
    // The name moves when the page is resized and once the web font has loaded.
    const observer = new ResizeObserver(place);
    observer.observe(slot);
    document.fonts.ready.then(place);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {spot && (
        <span
          className="x-breakpoint"
          data-enabled={enabled ? "" : undefined}
          style={spot}
          onClick={() => setEnabled(!enabled)}
        >
          <svg viewBox="0 0 26 16" width={width} height={height}>
            <path d="M3 0 H19 L26 8 L19 16 H3 Q0 16 0 13 V3 Q0 0 3 0 Z" />
          </svg>
        </span>
      )}
    </div>
  );
}
