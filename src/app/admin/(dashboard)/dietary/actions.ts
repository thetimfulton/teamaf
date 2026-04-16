"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { generateCsvString } from "@/lib/csv";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface DietaryEntry {
  guestName: string;
  guestId: string;
  note: string;
  source: "guest_profile" | "rsvp";
  eventName?: string;
}

export interface DietaryCategory {
  label: string;
  entries: DietaryEntry[];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Vegetarian: ["vegetarian", "veggie", "no meat"],
  Vegan: ["vegan", "plant-based", "plant based"],
  "Gluten-free": ["gluten-free", "gluten free", "celiac", "coeliac"],
  "Nut allergy": ["nut allergy", "nut-free", "peanut", "tree nut"],
  "Dairy-free": ["dairy-free", "dairy free", "lactose", "no dairy"],
  Kosher: ["kosher"],
  Halal: ["halal"],
};

function categorize(note: string): string[] {
  const lower = note.toLowerCase();
  const matches: string[] = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matches.push(category);
    }
  }
  return matches.length > 0 ? matches : ["Other"];
}

export async function getDietaryReport(): Promise<
  ActionResult<DietaryCategory[]>
> {
  await requireAdmin();
  const supabase = createAdminClient();

  // Get dietary notes from guest profiles
  const { data: guests } = await supabase
    .from("guests")
    .select("id, name, dietary_notes")
    .not("dietary_notes", "is", null);

  // Get dietary notes from RSVP responses
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("guest_id, event_id, dietary_notes, guests!inner(name), events!inner(name)")
    .not("dietary_notes", "is", null);

  const allEntries: DietaryEntry[] = [];

  for (const g of (guests ?? []) as {
    id: string;
    name: string;
    dietary_notes: string;
  }[]) {
    if (g.dietary_notes?.trim()) {
      allEntries.push({
        guestName: g.name,
        guestId: g.id,
        note: g.dietary_notes.trim(),
        source: "guest_profile",
      });
    }
  }

  for (const r of (rsvps ?? []) as {
    guest_id: string;
    dietary_notes: string;
    guests: { name: string }[];
    events: { name: string }[];
  }[]) {
    if (r.dietary_notes?.trim()) {
      allEntries.push({
        guestName: r.guests[0].name,
        guestId: r.guest_id,
        note: r.dietary_notes.trim(),
        source: "rsvp",
        eventName: r.events[0].name,
      });
    }
  }

  // Group into categories
  const categoryMap = new Map<string, DietaryEntry[]>();
  for (const entry of allEntries) {
    const categories = categorize(entry.note);
    for (const cat of categories) {
      const list = categoryMap.get(cat) ?? [];
      list.push(entry);
      categoryMap.set(cat, list);
    }
  }

  // Sort categories, "Other" last
  const result: DietaryCategory[] = Array.from(categoryMap.entries())
    .sort(([a], [b]) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    })
    .map(([label, entries]) => ({ label, entries }));

  return { success: true, data: result };
}

export async function exportDietaryCsv(): Promise<ActionResult<string>> {
  await requireAdmin();
  const result = await getDietaryReport();
  if (!result.success) return result;

  const rows = result.data.flatMap((cat) =>
    cat.entries.map((e) => ({
      category: cat.label,
      guest: e.guestName,
      note: e.note,
      source: e.source,
      event: e.eventName ?? "",
    }))
  );

  return {
    success: true,
    data: generateCsvString(rows, [
      "category",
      "guest",
      "note",
      "source",
      "event",
    ]),
  };
}
