/* ──────────────────────────────────────────────
   Brevo transactional email client (v5 SDK)
   ────────────────────────────────────────────── */

import { BrevoClient } from "@getbrevo/brevo";

let client: BrevoClient | null = null;

function getClient(): BrevoClient {
  if (!client) {
    client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
  }
  return client;
}

/* ── Template IDs — update after creating templates in Brevo ── */
export const TEMPLATES = {
  RSVP_CONFIRMATION: 1, // "We got your RSVP" — MVP launch
  ITINERARY_READY: 2, // "Your personalized itinerary is ready" — Phase 4
  REMINDER_2_WEEKS: 3, // 2-week reminder — Phase 4
  REMINDER_3_DAYS: 4, // 3-day reminder with weather — Phase 4
  EVENT_UPDATE: 5, // Event details changed — Phase 4
  ADMIN_BROADCAST: 6, // Custom admin broadcast — Phase 5
} as const;

interface SendEmailParams {
  to: { email: string; name: string };
  templateId: number;
  params?: Record<string, unknown>;
}

/**
 * Send a transactional email via Brevo.
 * Returns the Brevo messageId on success.
 */
export async function sendTransactionalEmail({
  to,
  templateId,
  params = {},
}: SendEmailParams): Promise<string | null> {
  const brevo = getClient();

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      to: [to],
      templateId,
      params,
    });
    return result.messageId ?? null;
  } catch (error) {
    console.error("[Brevo] Failed to send email:", error);
    return null;
  }
}
