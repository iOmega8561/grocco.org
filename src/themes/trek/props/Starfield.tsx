import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "../../hooks";
import { onWarp, type WarpKind } from "../warp";

type Star = { x: number; y: number; z: number; light: number; tint: string };

/** How each kind of warp unfolds: its length, and the speed along it (0 → 1). */
const profiles: Record<WarpKind, { duration: number; speed: (t: number) => number }> = {
  arrive: { duration: 1600, speed: (t) => 0.04 * (1 - t) ** 3 },
  pass: { duration: 850, speed: (t) => 0.03 * Math.sin(Math.PI * t) ** 2 },
  jump: { duration: 1500, speed: (t) => 0.065 * Math.sin(Math.PI * t) ** 2 },
};

/** How many frames of travel each streak shows. */
const trail = 7;

const tints = ["220 230 255", "255 255 255", "200 215 255", "255 236 210"];

function newStar(z = 0.05 + Math.random() * 0.95): Star {
  return {
    x: (Math.random() * 2 - 1) * 1.6,
    y: (Math.random() * 2 - 1) * 1.6,
    z,
    light: 0.45 + Math.random() ** 2 * 0.55,
    tint: tints[Math.floor(Math.random() * tints.length)],
  };
}

/**
 * Stars on a canvas, seen from the bridge. Drawn once and left still, so the page costs nothing while
 * nothing happens; the animation loop runs only during a warp effect.
 */
class Sky {
  private stars: Star[] = [];
  private context: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private frame = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.context = canvas.getContext("2d")!;
    this.resize();
  }

  resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(800, Math.round((this.width * this.height) / 1900));
    while (this.stars.length < count) this.stars.push(newStar());
    this.stars.length = count;
    if (!this.frame) this.still();
  }

  private project(star: Star, z = star.z): [number, number] {
    const scale = Math.max(this.width, this.height) * 0.25;
    return [this.width / 2 + (star.x / z) * scale, this.height / 2 + (star.y / z) * scale];
  }

  private size(star: Star): number {
    return 0.5 + (1 - star.z) * 1.6;
  }

  /** The resting sky: points, nearer ones larger and brighter. */
  still(): void {
    const c = this.context;
    c.clearRect(0, 0, this.width, this.height);
    for (const star of this.stars) {
      const [x, y] = this.project(star);
      if (x < -2 || y < -2 || x > this.width + 2 || y > this.height + 2) continue;
      const size = this.size(star);
      c.fillStyle = `rgb(${star.tint} / ${star.light * (1 - star.z * 0.55)})`;
      c.beginPath();
      c.arc(x, y, size / 2 + 0.2, 0, Math.PI * 2);
      c.fill();
    }
  }

  warp(kind: WarpKind): void {
    cancelAnimationFrame(this.frame);
    const { duration, speed } = profiles[kind];
    const start = performance.now();
    let last = start;

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const advance = speed(t) * ((now - last) / 16.7);
      last = now;
      const c = this.context;
      c.clearRect(0, 0, this.width, this.height);
      c.lineCap = "round";

      for (const star of this.stars) {
        star.z -= advance;
        if (star.z <= 0.03) {
          Object.assign(star, newStar(1));
          continue;
        }
        const [toX, toY] = this.project(star);
        // The streak trails behind the star, longer the faster the ship goes.
        const [fromX, fromY] = this.project(star, Math.min(star.z + advance * trail, 1.2));
        if (toX < -40 || toY < -40 || toX > this.width + 40 || toY > this.height + 40) {
          if (star.z < 0.3) Object.assign(star, newStar(1));
          continue;
        }
        c.strokeStyle = `rgb(${star.tint} / ${star.light * (1 - star.z * 0.5)})`;
        c.lineWidth = this.size(star) + 0.15;
        c.beginPath();
        c.moveTo(fromX, fromY);
        c.lineTo(toX + 0.01, toY);
        c.stroke();
      }

      if (t < 1) this.frame = requestAnimationFrame(step);
      else {
        this.frame = 0;
        this.still();
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
}

/** How long after the page opens the first distant ship goes to warp, and how long between them. */
const firstFlyby = 20_000;
const betweenFlybys = 75_000;

/**
 * Behind the site: deep space. The page opens dropping out of warp, a change of page is a short
 * stretch of warp, and now and then a distant ship leaves in a flash. Readers who ask for less motion
 * get the still sky only.
 */
export function Starfield() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sky = useRef<Sky | null>(null);
  const reduced = useReducedMotion();
  const { pathname } = useLocation();
  const opened = useRef(false);
  const [flyby, setFlyby] = useState(0);

  useEffect(() => {
    if (!canvas.current) return;
    const current = new Sky(canvas.current);
    sky.current = current;
    let timer = 0;
    const resize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => current.resize(), 120);
    };
    window.addEventListener("resize", resize);
    const off = onWarp((kind) => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) current.warp(kind);
    });
    return () => {
      window.removeEventListener("resize", resize);
      window.clearTimeout(timer);
      off();
      current.stop();
      sky.current = null;
    };
  }, []);

  // Dropping out of warp when the page opens; a short stretch on every later change of page.
  useEffect(() => {
    if (reduced || !sky.current) return;
    sky.current.warp(opened.current ? "pass" : "arrive");
    opened.current = true;
  }, [pathname, reduced]);

  useEffect(() => {
    if (reduced) return;
    const launch = () => {
      if (!document.hidden) setFlyby((n) => n + 1);
    };
    const first = window.setTimeout(launch, firstFlyby);
    const every = window.setInterval(launch, betweenFlybys);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, [reduced]);

  // Each distant ship appears somewhere else, but never in the middle of the reading column.
  const top = 12 + ((flyby * 37) % 50);
  const left = flyby % 2 ? 6 + ((flyby * 13) % 14) : 68 + ((flyby * 11) % 18);

  return (
    <div className="st-sky">
      <canvas ref={canvas} className="st-sky__stars" />
      {!reduced && flyby > 0 && <span key={flyby} className="st-flyby" style={{ top: `${top}%`, left: `${left}%` }} />}
    </div>
  );
}
