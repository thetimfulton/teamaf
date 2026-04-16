/* ── Per-event .ics download ── */

import { NextRequest, NextResponse } from "next/server";
import { getGuestFromCookie } from "@/lib/session";
import { verifySignedToken } from "@/lib/itinerary/signed-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEventIcs } from "@/lib/itinerary/calendar";
import type { Event, Guest } from "@/types/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const token = request.nextUrl.searchParams.get("token");

  // Auth
  let guestId = await getGuestFromCookie();
  if (!guestId && token) {
    guestId = await verifySignedToken(token);
  }
  if (!guestId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Verify guest accepted this event
  const { data: rsvp } = await supabase
    .from("rsvps")
    .select("*")
    .eq("guest_id", guestId)
    .eq("event_id", eventId)
    .eq("status", "accepted")
    .single();

  if (!rsvp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch event + guest
  const [{ data: event }, { data: guest }] = await Promise.all([
    supabase.from("events").select("*").eq("id", eventId).single(),
    supabase.from("guests").select("*").eq("id", guestId).single(),
  ]);

  if (!event || !guest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ics = generateEventIcs(event as Event, guest as Guest);
  const filename = `${(event as Event).name.replace(/\s+/g, "-").toLowerCase()}-teamaf.ics`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
