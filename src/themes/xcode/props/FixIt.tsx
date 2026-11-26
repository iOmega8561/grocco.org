import { useEffect, useState } from "react";

/** How long the fix takes to be applied, before the error comes back. */
const fixingFor = 1300;

/**
 * The missing page, as Xcode would report it: an inline error by the title, with a Fix button.
 * Applying the fix takes a moment, and the error comes back: the page still does not exist.
 */
export function FixIt() {
  const [fixing, setFixing] = useState(false);
  const [returns, setReturns] = useState(0);

  useEffect(() => {
    if (!fixing) return;
    const timer = window.setTimeout(() => {
      setFixing(false);
      setReturns((n) => n + 1);
    }, fixingFor);
    return () => window.clearTimeout(timer);
  }, [fixing]);

  return (
    // A new key each time the error comes back, so it shakes again.
    <div key={returns} className="x-issue" data-fixing={fixing ? "" : undefined} data-returned={returns > 0 ? "" : undefined}>
      <svg className="x-issue__icon" viewBox="0 0 16 16" width="16" height="16">
        <path d="M5.2 1 H10.8 L15 5.2 V10.8 L10.8 15 H5.2 L1 10.8 V5.2 Z" />
        <path d="M5.6 5.6 L10.4 10.4 M10.4 5.6 L5.6 10.4" />
      </svg>
      <span className="x-issue__message">{fixing ? "Applying fix…" : "Cannot find this page in scope"}</span>
      <span className="x-issue__fix" onClick={() => !fixing && setFixing(true)}>
        Fix
      </span>
    </div>
  );
}
