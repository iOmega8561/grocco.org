import { useEffect, useState } from "react";
import { PresentShape, wrappings } from "./Present";

/** How long the box stays open. */
const openFor = 2400;

/**
 * On the missing page: a present. Clicked, its lid comes off, and the box is empty: the page is not
 * in there either. A moment later the lid goes back on.
 */
export function EmptyGift() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), openFor);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <div className="xm-gift" data-open={open ? "" : undefined} onClick={() => setOpen(true)}>
      <PresentShape {...wrappings[0]} />
    </div>
  );
}
