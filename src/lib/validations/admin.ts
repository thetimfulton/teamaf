import { z } from "zod";

const cohortEnum = z.enum([
  "wedding_party",
  "immediate_family",
  "out_of_town",
  "full_local",
  "ceremony_only",
]);

/* ── Guest CRUD ── */

export const guestSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").max(320).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  cohort: cohortEnum,
  plus_one_allowed: z.boolean().default(false),
  plus_one_name: z.string().max(200).nullable().optional(),
  kids_count: z.number().int().min(0).max(20).default(0),
  kids_names: z.string().max(500).nullable().optional(),
  dietary_notes: z.string().max(500).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type GuestInput = z.infer<typeof guestSchema>;

/* ── Guest Filters ── */

export const guestFilterSchema = z.object({
  search: z.string().optional(),
  cohort: cohortEnum.optional(),
  rsvpStatus: z.enum(["all", "pending", "has_accepted", "has_declined", "no_rsvp"]).optional(),
  sortField: z.enum(["name", "cohort", "created_at"]).default("name"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(50),
});

export type GuestFilter = z.infer<typeof guestFilterSchema>;

/* ── RSVP Override ── */

export const rsvpOverrideSchema = z.object({
  status: z.enum(["accepted", "declined", "pending"]),
  plus_one_attending: z.boolean().default(false),
  kids_attending: z.number().int().min(0).max(20).default(0),
  dietary_notes: z.string().max(500).nullable().optional(),
});

export type RsvpOverrideInput = z.infer<typeof rsvpOverrideSchema>;

/* ── CSV Row ── */

export const csvRowSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  cohort: cohortEnum,
  plus_one_allowed: z
    .string()
    .transform((v) => v.toLowerCase() === "true" || v === "1" || v.toLowerCase() === "yes")
    .or(z.boolean())
    .default(false),
  plus_one_name: z.string().optional(),
  kids_count: z
    .string()
    .transform((v) => parseInt(v, 10) || 0)
    .or(z.number())
    .default(0),
  kids_names: z.string().optional(),
  dietary_notes: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

/* ── Event Update ── */

export const eventUpdateSchema = z.object({
  name: z.string().min(1).max(200),
  date: z.string().min(1),
  time: z.string().min(1),
  venue: z.string().min(1).max(300),
  address: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().optional(),
  dress_code: z.string().max(200).nullable().optional(),
  parking_notes: z.string().max(500).nullable().optional(),
  kids_allowed: z.boolean(),
  sort_order: z.number().int().default(0),
  map_url: z.string().url().max(500).nullable().optional(),
});

export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

/* ── Email Broadcast ── */

export const emailBroadcastSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Message is required").max(10000),
  cohorts: z.array(cohortEnum).min(1, "Select at least one cohort"),
  rsvpFilter: z
    .enum(["all", "has_rsvp", "no_rsvp", "accepted", "declined"])
    .default("all"),
});

export type EmailBroadcastInput = z.infer<typeof emailBroadcastSchema>;
