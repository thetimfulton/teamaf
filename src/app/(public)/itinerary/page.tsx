import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Clock, Car, Shirt, Users, Baby, Download } from "lucide-react";
import { getGuestFromCookie } from "@/lib/session";
import { verifySignedToken } from "@/lib/itinerary/signed-url";
import { buildItinerary } from "@/lib/itinerary/builder";
import type { Cohort, Itinerary, ItineraryEvent } from "@/types/database";

export const metadata: Metadata = {
  title: "Your Itinerary — #teamAF",
};

/* ── Cohort-specific intro copy ── */

const COHORT_INTROS: Record<Cohort, { heading: string; body: string }> = {
  wedding_party: {
    heading: "You\u2019re in the Wedding Party",
    body: "Here\u2019s everything you need to know for the weekend \u2014 from rehearsal to the last dance.",
  },
  immediate_family: {
    heading: "Family First",
    body: "Here\u2019s your full weekend itinerary. We\u2019re so glad you\u2019re part of this.",
  },
  out_of_town: {
    heading: "Welcome to Columbus!",
    body: "Here\u2019s your weekend, from Friday welcome drinks to Sunday brunch.",
  },
  full_local: {
    heading: "Here\u2019s the Plan",
    body: "Everything you need to know for the big day.",
  },
  ceremony_only: {
    heading: "We\u2019re So Glad You\u2019ll Be There",
    body: "Here\u2019s everything you need for the ceremony.",
  },
};

/* ── Helpers ── */

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return m === "00" ? `${hour12} ${ampm}` : `${hour12}:${m} ${ampm}`;
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/* ── Event Card ── */

function EventCard({
  item,
  calendarBaseUrl,
}: {
  item: ItineraryEvent;
  calendarBaseUrl: string;
}) {
  const { event, rsvp } = item;

  return (
    <div className="bg-white border border-spumante/50 rounded-lg overflow-hidden shadow-sm">
      <div className="p-6 sm:p-8">
        {/* Name + time */}
        <h3 className="text-editorial text-xl sm:text-2xl text-foreground">
          {event.name}
        </h3>

        <div className="mt-3 flex flex-col gap-2">
          {event.time && (
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Clock className="size-4 shrink-0 text-burgundy" />
              <span className="font-sans">{formatTime(event.time)}</span>
            </div>
          )}

          {/* Venue + address */}
          <div className="flex items-start gap-2 text-sm text-foreground/70">
            <MapPin className="size-4 shrink-0 text-burgundy mt-0.5" />
            <div className="font-sans">
              <p className="font-medium text-foreground">{event.venue}</p>
              <a
                href={mapsUrl(event.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-burgundy underline underline-offset-2 hover:text-burgundy/80"
              >
                {event.address}
              </a>
            </div>
          </div>

          {/* Dress code */}
          {event.dress_code && (
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Shirt className="size-4 shrink-0 text-burgundy" />
              <span className="font-sans">{event.dress_code}</span>
            </div>
          )}

          {/* Parking */}
          {event.parking_notes && event.parking_notes !== "TBD" && (
            <div className="flex items-start gap-2 text-sm text-foreground/70">
              <Car className="size-4 shrink-0 text-burgundy mt-0.5" />
              <span className="font-sans">{event.parking_notes}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-4 font-sans text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Attendance details */}
        <div className="mt-4 flex flex-wrap gap-3">
          {rsvp.plus_one_attending && (
            <span className="inline-flex items-center gap-1 bg-spumante/15 text-foreground/70 text-xs px-3 py-1 rounded-full">
              <Users className="size-3" />
              +1 attending
            </span>
          )}
          {rsvp.kids_attending > 0 && (
            <span className="inline-flex items-center gap-1 bg-spumante/15 text-foreground/70 text-xs px-3 py-1 rounded-full">
              <Baby className="size-3" />
              {rsvp.kids_attending} {rsvp.kids_attending === 1 ? "child" : "children"}
            </span>
          )}
        </div>

        {/* Calendar download */}
        <div className="mt-4 pt-4 border-t border-spumante/30">
          <a
            href={`${calendarBaseUrl}/${event.id}`}
            className="inline-flex items-center gap-2 text-sm font-sans text-burgundy hover:text-burgundy/80 transition-colors"
          >
            <Calendar className="size-4" />
            Add to calendar
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */

export default async function ItineraryPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  // Auth: session cookie first, then signed URL token
  let guestId = await getGuestFromCookie();

  if (!guestId && params.token) {
    guestId = await verifySignedToken(params.token);
  }

  if (!guestId) {
    redirect("/rsvp");
  }

  // Build the itinerary
  const itinerary: Itinerary | null = await buildItinerary(guestId);

  if (!itinerary) {
    // No accepted events — friendly redirect
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-32 pb-16 text-center">
        <h1 className="text-editorial text-4xl sm:text-5xl text-burgundy">
          No Itinerary Yet
        </h1>
        <p className="mt-4 font-sans text-lg text-muted-foreground max-w-md">
          It looks like you haven&rsquo;t RSVP&rsquo;d to any events yet.
          Head over to the RSVP page to let us know you&rsquo;re coming!
        </p>
        <Link
          href="/rsvp"
          className="mt-8 inline-flex items-center justify-center min-h-[48px] bg-burgundy text-lucent font-sans font-semibold text-sm px-8 py-3 rounded-lg hover:bg-burgundy/90 transition-colors duration-200"
        >
          RSVP Now
        </Link>
      </main>
    );
  }

  const { guest, days } = itinerary;
  const intro = COHORT_INTROS[guest.cohort];
  const firstName = guest.name.split(" ")[0];

  // Calendar base URL (token passed through for auth)
  const calendarBaseUrl = params.token
    ? `/api/calendar?token=${params.token}`
    : "/api/calendar";

  // Combined calendar URL
  const combinedCalendarUrl = params.token
    ? `/api/calendar/all?token=${params.token}`
    : "/api/calendar/all";

  return (
    <main className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section className="pt-32 pb-12 px-6 text-center">
        <h1 className="text-editorial text-4xl sm:text-6xl text-burgundy">
          {firstName}&rsquo;s Weekend
        </h1>
        <div className="mt-6 mx-auto max-w-xl">
          <h2 className="text-editorial text-2xl text-foreground">
            {intro.heading}
          </h2>
          <p className="mt-2 font-sans text-base text-muted-foreground">
            {intro.body}
          </p>
        </div>
      </section>

      {/* ── Day-by-day timeline ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16">
        {days.map((day, dayIndex) => (
          <div key={day.date} className={dayIndex > 0 ? "mt-16" : ""}>
            {/* Day header */}
            <div className="mb-8">
              <h2 className="text-editorial text-3xl text-burgundy">
                {day.label}
              </h2>
              <div className="mt-3 h-px bg-spumante" />
            </div>

            {/* Events */}
            <div className="relative">
              {/* Timeline spine — desktop */}
              <div className="absolute left-3 top-0 bottom-0 hidden sm:block w-px bg-spumante" />

              <div className="flex flex-col gap-6">
                {day.events.map((item) => (
                  <div key={item.event.id} className="relative sm:ml-10">
                    {/* Timeline dot */}
                    <div className="absolute -left-10 top-8 hidden sm:block">
                      <div className="size-[7px] rounded-full bg-burgundy ring-2 ring-spumante" />
                    </div>
                    <EventCard
                      item={item}
                      calendarBaseUrl={calendarBaseUrl}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Combined calendar download ── */}
      <section className="py-12 px-6 text-center border-t border-spumante/30">
        <a
          href={combinedCalendarUrl}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] bg-burgundy text-lucent font-sans font-semibold text-sm px-8 py-3 rounded-lg hover:bg-burgundy/90 transition-colors duration-200"
        >
          <Download className="size-4" />
          Add All Events to Calendar
        </a>
        <p className="mt-3 font-sans text-sm text-muted-foreground">
          Downloads a single .ics file with all your events.
        </p>
      </section>

      {/* ── Edit RSVP link ── */}
      <section className="pb-16 px-6 text-center">
        <p className="font-sans text-sm text-muted-foreground">
          Need to change your plans?{" "}
          <Link
            href="/rsvp"
            className="text-burgundy underline underline-offset-2 hover:text-burgundy/80"
          >
            Update your RSVP
          </Link>
        </p>
      </section>
    </main>
  );
}
