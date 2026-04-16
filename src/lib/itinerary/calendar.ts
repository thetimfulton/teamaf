/* ──────────────────────────────────────────────
   iCalendar (.ics) generation (Phase 4)
   No external deps — manual RFC 5545 formatting.
   ────────────────────────────────────────────── */

import type { Event, Rsvp, Guest } from "@/types/database";

const TIMEZONE = "America/New_York";
const DEFAULT_DURATION_HOURS = 2;

/**
 * Convert date ("2026-08-15") + time ("16:00") to iCal DTSTART format.
 * Returns TZID-qualified local time (not UTC).
 */
function toIcsDateTime(date: string, time: string | null): string {
  const t = time ?? "12:00";
  const [y, m, d] = date.split("-");
  const [h, min] = t.split(":");
  return `${y}${m}${d}T${h}${min}00`;
}

/** Add hours to a date+time and return iCal format */
function addHours(date: string, time: string | null, hours: number): string {
  const t = time ?? "12:00";
  const dt = new Date(`${date}T${t}:00`);
  dt.setHours(dt.getHours() + hours);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  const h = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}00`;
}

/** Escape special characters per RFC 5545 */
function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Generate a stable UID for an event+guest combo */
function eventUid(eventId: string, guestId: string): string {
  return `${eventId}-${guestId}@teamaf.wedding`;
}

/** Build a VTIMEZONE block for America/New_York (EDT for August) */
function vtimezone(): string {
  return [
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ].join("\r\n");
}

/** Generate a single VEVENT block */
function vevent(event: Event, guest: Guest): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${eventUid(event.id, guest.id)}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;TZID=${TIMEZONE}:${toIcsDateTime(event.date, event.time)}`,
    `DTEND;TZID=${TIMEZONE}:${addHours(event.date, event.time, DEFAULT_DURATION_HOURS)}`,
    `SUMMARY:${escapeIcs(event.name)} — #teamAF`,
    `LOCATION:${escapeIcs(`${event.venue}, ${event.address}`)}`,
  ];

  const descParts: string[] = [];
  if (event.description) descParts.push(event.description);
  if (event.dress_code) descParts.push(`Dress code: ${event.dress_code}`);
  if (event.parking_notes && event.parking_notes !== "TBD") {
    descParts.push(`Parking: ${event.parking_notes}`);
  }
  if (descParts.length > 0) {
    lines.push(`DESCRIPTION:${escapeIcs(descParts.join("\\n"))}`);
  }

  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

/** Generate a .ics file for a single event */
export function generateEventIcs(event: Event, guest: Guest): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//teamAF//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    vtimezone(),
    vevent(event, guest),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** Generate a combined .ics file with multiple events */
export function generateCombinedIcs(
  events: { event: Event; rsvp: Rsvp }[],
  guest: Guest
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//teamAF//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:#teamAF Wedding Weekend`,
    vtimezone(),
    ...events.map(({ event }) => vevent(event, guest)),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
