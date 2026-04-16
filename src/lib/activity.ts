"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ActivityType } from "@/types/database";

export async function logActivity(params: {
  type: ActivityType;
  actor: string;
  subjectType?: string;
  subjectId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("activity_log").insert({
      type: params.type,
      actor: params.actor,
      subject_type: params.subjectType ?? null,
      subject_id: params.subjectId ?? null,
      details: params.details ?? {},
    });
  } catch {
    // Activity logging should never break the main flow
    console.error("Failed to log activity:", params.type);
  }
}
