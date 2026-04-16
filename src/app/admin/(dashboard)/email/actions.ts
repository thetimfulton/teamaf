"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { logActivity } from "@/lib/activity";
import { sendTransactionalEmail, TEMPLATES } from "@/lib/brevo";
import {
  emailBroadcastSchema,
  type EmailBroadcastInput,
} from "@/lib/validations/admin";
import type { Cohort } from "@/types/database";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

interface Recipient {
  id: string;
  name: string;
  email: string;
}

async function queryRecipients(
  cohorts: Cohort[],
  rsvpFilter: string
): Promise<Recipient[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("guests")
    .select("id, name, email")
    .in("cohort", cohorts)
    .not("email", "is", null);

  const { data: guests } = await query;
  let recipients = ((guests ?? []) as Recipient[]).filter((g) => g.email);

  if (rsvpFilter !== "all") {
    const { data: rsvps } = await supabase
      .from("rsvps")
      .select("guest_id, status");

    const guestsWithRsvp = new Set(
      ((rsvps ?? []) as { guest_id: string }[]).map((r) => r.guest_id)
    );
    const guestsAccepted = new Set(
      ((rsvps ?? []) as { guest_id: string; status: string }[])
        .filter((r) => r.status === "accepted")
        .map((r) => r.guest_id)
    );
    const guestsDeclined = new Set(
      ((rsvps ?? []) as { guest_id: string; status: string }[])
        .filter((r) => r.status === "declined")
        .map((r) => r.guest_id)
    );

    switch (rsvpFilter) {
      case "has_rsvp":
        recipients = recipients.filter((r) => guestsWithRsvp.has(r.id));
        break;
      case "no_rsvp":
        recipients = recipients.filter((r) => !guestsWithRsvp.has(r.id));
        break;
      case "accepted":
        recipients = recipients.filter((r) => guestsAccepted.has(r.id));
        break;
      case "declined":
        recipients = recipients.filter((r) => guestsDeclined.has(r.id));
        break;
    }
  }

  return recipients;
}

export async function getRecipientCount(
  cohorts: Cohort[],
  rsvpFilter: string
): Promise<ActionResult<number>> {
  await requireAdmin();
  const recipients = await queryRecipients(cohorts, rsvpFilter);
  return { success: true, data: recipients.length };
}

export async function getRecipientList(
  cohorts: Cohort[],
  rsvpFilter: string
): Promise<ActionResult<Recipient[]>> {
  await requireAdmin();
  const recipients = await queryRecipients(cohorts, rsvpFilter);
  return { success: true, data: recipients };
}

export async function sendBroadcast(
  input: EmailBroadcastInput
): Promise<ActionResult<{ sent: number; failed: number }>> {
  const admin = await requireAdmin();
  const parsed = emailBroadcastSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const recipients = await queryRecipients(
    parsed.data.cohorts,
    parsed.data.rsvpFilter
  );

  const supabase = createAdminClient();
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const messageId = await sendTransactionalEmail({
      to: { email: recipient.email, name: recipient.name },
      templateId: TEMPLATES.ADMIN_BROADCAST,
      params: {
        guestName: recipient.name,
        subject: parsed.data.subject,
        body: parsed.data.body,
      },
    });

    if (messageId) {
      sent++;
      await supabase.from("email_log").insert({
        guest_id: recipient.id,
        template: "ADMIN_BROADCAST",
        brevo_message_id: messageId,
        sent_at: new Date().toISOString(),
        status: "sent",
      });
    } else {
      failed++;
    }
  }

  await logActivity({
    type: "email_broadcast",
    actor: `admin:${admin.email}`,
    details: {
      subject: parsed.data.subject,
      cohorts: parsed.data.cohorts,
      rsvpFilter: parsed.data.rsvpFilter,
      sent,
      failed,
      totalRecipients: recipients.length,
    },
  });

  return { success: true, data: { sent, failed } };
}
