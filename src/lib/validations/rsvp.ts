/* ──────────────────────────────────────────────
   Zod validation schemas for the RSVP flow
   ────────────────────────────────────────────── */

import { z } from "zod";

/** Guest lookup input — at least 2 characters */
export const lookupSchema = z.object({
  searchText: z
    .string()
    .trim()
    .min(2, "Please enter at least 2 characters")
    .max(100),
});

/** Selecting a specific guest from disambiguation list */
export const selectCandidateSchema = z.object({
  guestId: z.string().uuid(),
});

/** Per-event response within the RSVP form */
export const eventResponseSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(["accepted", "declined"]),
  plusOneAttending: z.boolean().default(false),
  kidsAttending: z.number().int().min(0).max(10).default(0),
  dietaryNotes: z.string().max(500).optional().default(""),
});

/** Full RSVP submission */
export const rsvpSubmissionSchema = z.object({
  responses: z.array(eventResponseSchema).min(1, "Please respond to at least one event"),
  songRequest: z.string().max(200).optional().default(""),
  globalDietaryNotes: z.string().max(500).optional().default(""),
});

export type LookupInput = z.infer<typeof lookupSchema>;
export type EventResponse = z.infer<typeof eventResponseSchema>;
export type RsvpSubmission = z.infer<typeof rsvpSubmissionSchema>;
