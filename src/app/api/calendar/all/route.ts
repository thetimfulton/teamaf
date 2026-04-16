/* ── Combined .ics download (all accepted events) ── */

import { NextRequest, NextResponse } from "next/server";
import { getGuestFromCookie } from "@/lib/session";
import { verifySignedToken } from "@/lib/itinerary/signed-url";
import { buildItinerary } from "@/lib/itinerary/builder";
import { generateCombinedIcs } from "@/lib/itinerary/calendar";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  // Auth
  let guestId = await getGuestFromCookie();
  if (!guestId && token) {
    guestId = await verifySignedToken(token);
  }
  if (!guestId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const itinerary = await buildItinerary(guestId);
  if (!itinerary || itinerary.days.length === 0) {
    return NextResponse.json({ error: "No events" }, { status: 404 });
  }

  const allEvents = itinerary.days.flatMap((d) => d.events);
  const ics = generateCombinedIcs(allEvents, itinerary.guest);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="teamaf-wedding-weekend.ics"`,
    },
  });
}
