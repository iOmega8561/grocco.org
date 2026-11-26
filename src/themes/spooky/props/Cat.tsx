/** A black cat sitting on the line above the footer, on every page. */
export function Cat() {
  return (
    <div className="hw-cat">
      <svg viewBox="0 0 92 80" width="92" height="80">
        <path className="hw-cat__tail" d="M56 76 C72 79 82 70 79 58 C77 51 82 46 88 49" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M30 79 C20 79 19 60 25 48 C30 39 38 35 46 37 C57 40 61 53 61 65 C61 75 57 79 50 79 Z" fill="currentColor" />
        <path d="M29 23 L29 6 L39 15 Q42 14 45 15 L55 6 L55 23 C57 34 50 41 42 41 C34 41 27 34 29 23 Z" fill="currentColor" />
        <g className="hw-cat__eyes" fill="#ffb02e">
          <ellipse cx="37" cy="26" rx="2.8" ry="3.4" />
          <ellipse cx="47" cy="26" rx="2.8" ry="3.4" />
        </g>
      </svg>
    </div>
  );
}
