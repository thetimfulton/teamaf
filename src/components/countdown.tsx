"use client";

import { useState, useEffect } from "react";

// TODO: Tim to provide exact date
const WEDDING_DATE = new Date("2026-08-15T16:00:00-04:00");

type DisplayMode =
  | { unit: "days" }
  | { unit: "minutes" }
  | { unit: "seconds" }
  | { unit: "hours" }
  | { unit: "sleeps" }
  | { unit: "years" };

const ABSURD_UNITS: DisplayMode["unit"][] = [
  "minutes",
  "seconds",
  "hours",
  "sleeps",
  "years",
];

function getTimeLeft() {
  return WEDDING_DATE.getTime() - Date.now();
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function computeValue(unit: DisplayMode["unit"]): {
  value: string;
  caption: string;
} {
  const ms = getTimeLeft();

  if (ms <= 0) {
    return { value: "", caption: "" };
  }

  switch (unit) {
    case "days": {
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      return { value: formatNumber(days), caption: "days until we do" };
    }
    case "hours": {
      const hours = Math.floor(ms / (1000 * 60 * 60));
      return { value: formatNumber(hours), caption: "hours until we do" };
    }
    case "minutes": {
      const minutes = Math.floor(ms / (1000 * 60));
      return { value: formatNumber(minutes), caption: "minutes until we do" };
    }
    case "seconds": {
      const seconds = Math.floor(ms / 1000);
      return { value: formatNumber(seconds), caption: "seconds until we do" };
    }
    case "sleeps": {
      const sleeps = Math.floor(ms / (1000 * 60 * 60 * 24));
      return { value: formatNumber(sleeps), caption: "sleeps until we do" };
    }
    case "years": {
      const years = ms / (1000 * 60 * 60 * 24 * 365.25);
      return {
        value: years.toFixed(2),
        caption: "years until we do",
      };
    }
  }
}

export function Countdown() {
  const [mode, setMode] = useState<DisplayMode>({ unit: "days" });
  const [display, setDisplay] = useState<{
    value: string;
    caption: string;
  } | null>(null);
  const [hasPassed, setHasPassed] = useState(false);

  // Roll the dice on mount — 1 in 5 chance of absurd unit
  useEffect(() => {
    if (getTimeLeft() <= 0) {
      setHasPassed(true);
      return;
    }

    const roll = Math.random();
    let chosen: DisplayMode;
    if (roll < 0.2) {
      const absurdUnit =
        ABSURD_UNITS[Math.floor(Math.random() * ABSURD_UNITS.length)];
      chosen = { unit: absurdUnit };
    } else {
      chosen = { unit: "days" };
    }
    setMode(chosen);
    setDisplay(computeValue(chosen.unit));
  }, []);

  // Tick every second if showing seconds, otherwise static
  // Respects prefers-reduced-motion by not ticking
  useEffect(() => {
    if (hasPassed) return;
    if (mode.unit !== "seconds") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      const ms = getTimeLeft();
      if (ms <= 0) {
        setHasPassed(true);
        clearInterval(interval);
        return;
      }
      setDisplay(computeValue("seconds"));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, hasPassed]);

  if (hasPassed) {
    return (
      <div className="text-center" aria-live="polite">
        <p className="text-editorial text-6xl sm:text-7xl text-burgundy">
          We did it!
        </p>
      </div>
    );
  }

  if (!display) {
    // SSR / pre-hydration: show a reasonable default
    return (
      <div className="text-center" aria-live="polite">
        <p className="text-editorial text-6xl sm:text-7xl text-burgundy tabular-nums">
          &mdash;
        </p>
        <p className="mt-3 font-sans text-base text-muted-foreground tracking-wide">
          days until we do
        </p>
      </div>
    );
  }

  return (
    <div className="text-center" aria-live="polite">
      <p className="text-editorial text-6xl sm:text-7xl text-burgundy tabular-nums">
        {display.value}
      </p>
      <p className="mt-3 font-sans text-base text-muted-foreground tracking-wide">
        {display.caption}
      </p>
    </div>
  );
}
