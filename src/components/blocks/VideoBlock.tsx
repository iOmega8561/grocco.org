import { useEffect, useRef, useState } from "react";
import { Picture } from "./Picture";
import { useColorScheme } from "../../lib/colorScheme";

type Props = { src: string; poster: string; srcDark?: string; posterDark?: string; alt: string; className?: string };

/**
 * A silent demo: it plays while at least half of it is on screen and pauses otherwise.
 * With a dark variant, it shows the recording that matches the reader's colour scheme.
 * Readers who asked for reduced motion get the poster and the controls, and start it themselves.
 * If the file can't be loaded, the poster stands in for it.
 */
export function Video({ src, poster, srcDark, posterDark, alt, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const { dark } = useColorScheme();
  const [failed, setFailed] = useState(false);

  const source = dark && srcDark ? srcDark : src;
  const still = dark && posterDark ? posterDark : poster;

  useEffect(() => {
    const video = ref.current;
    if (!video || failed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [failed, source]);

  if (failed) return <Picture className={className} src={poster} srcDark={posterDark} alt={alt} />;

  // The key makes a scheme change load the other recording from the start.
  return (
    <video key={source} ref={ref} className={className} poster={still} aria-label={alt} muted loop playsInline controls preload="metadata">
      <source src={source} type="video/mp4" onError={() => setFailed(true)} />
    </video>
  );
}
