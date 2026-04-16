"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { ActivityLog } from "@/types/database";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface ActivityEntry extends ActivityLog {
  subjectName?: string;
}

export async function getActivityLog(
  page: number = 1,
  limit: number = 50,
  typeFilter?: string
): Promise<
  ActionResult<{ entries: ActivityEntry[]; total: number }>
> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("activity_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return { success: false, error: error.message };

  // Resolve guest names for subject_type = 'guest'
  const guestIds = ((data ?? []) as ActivityLog[])
    .filter((a) => a.subject_type === "guest" && a.subject_id)
    .map((a) => a.subject_id!);

  const uniqueGuestIds = [...new Set(guestIds)];
  let guestNames = new Map<string, string>();

  if (uniqueGuestIds.length > 0) {
    const { data: guests } = await supabase
      .from("guests")
      .select("id, name")
      .in("id", uniqueGuestIds);

    for (const g of (guests ?? []) as { id: string; name: string }[]) {
      guestNames.set(g.id, g.name);
    }
  }

  const entries: ActivityEntry[] = ((data ?? []) as ActivityLog[]).map((a) => ({
    ...a,
    subjectName:
      a.subject_type === "guest" && a.subject_id
        ? guestNames.get(a.subject_id)
        : undefined,
  }));

  return { success: true, data: { entries, total: count ?? 0 } };
}
