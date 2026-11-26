import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks";

/** A LED on a rack down the aisle. Power LEDs stay on; activity LEDs flicker at their own pace. */
type Led = { x: number; y: number; rgb: string; level: number; activity: boolean; seed: number };

/** Mostly green, some amber, the odd blue: the colours of a room full of running machines. */
function pickColour(): string {
  const n = Math.random();
  return n < 0.78 ? "54 208 108" : n < 0.94 ? "255 176 0" : "90 160 255";
}

/**
 * Racks in the dark at the far end of the room: columns of LEDs, two to a unit where a unit is
 * populated, spaced as racks would be.
 */
function placeLeds(width: number, height: number): Led[] {
  const leds: Led[] = [];
  for (let x = 24 + Math.random() * 60; x < width; x += 90 + Math.random() * 110) {
    for (let y = 28 + Math.random() * 50; y < height; y += 16 + Math.random() * 30) {
      if (Math.random() > 0.45) continue;
      const level = 0.06 + Math.random() * 0.1;
      leds.push({ x, y, rgb: pickColour(), level, activity: false, seed: 0 });
      if (Math.random() < 0.65) leds.push({ x: x + 7, y, rgb: "54 208 108", level, activity: true, seed: Math.random() * 1000 });
    }
  }
  return leds;
}

/** Whether an activity LED is lit at a given time: busy in bursts, never in step with the others. */
function lit(led: Led, time: number): boolean {
  const tick = Math.floor(time / 110 + led.seed);
  const noise = Math.sin(tick * 12.9898 + led.seed * 78.233) * 43758.5453;
  return noise - Math.floor(noise) > 0.45;
}

/** How often the room is redrawn: LEDs blink, they don’t glide, so ten frames a second are plenty. */
const frameEvery = 100;

/**
 * Behind the site: the server room with the lights off, racks down the aisle blinking away. Readers
 * who ask for less motion get the room still.
 */
export function ServerRoom() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    let leds: Led[] = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(window.innerWidth * ratio);
      element.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      leds = placeLeds(window.innerWidth, window.innerHeight);
      draw(performance.now());
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const led of leds) {
        if (led.activity && !reduced && !lit(led, time)) continue;
        context.fillStyle = `rgb(${led.rgb} / ${led.level * 0.3})`;
        context.beginPath();
        context.arc(led.x, led.y, 3.2, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgb(${led.rgb} / ${led.level})`;
        context.beginPath();
        context.arc(led.x, led.y, 1.3, 0, Math.PI * 2);
        context.fill();
      }
    };

    resize();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);

    let frame = 0;
    let last = 0;
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (document.hidden || time - last < frameEvery) return;
      last = time;
      draw(time);
    };
    if (!reduced) frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return <canvas ref={canvas} className="sa-room" />;
}
