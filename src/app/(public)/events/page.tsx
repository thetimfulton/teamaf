import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Wedding Weekend — #teamAF",
};

// ── Static event data (source of truth: database schema, rendered statically) ──

type WeddingEvent = {
  name: string;
  time: string;
  venue: string;
  dressCode: string;
  audience: string;
};

type WeddingDay = {
  label: string;
  date: string;
  events: WeddingEvent[];
};

const WEDDING_WEEKEND: WeddingDay[] = [
  {
    label: "Friday",
    date: "August 14",
    events: [
      {
        name: "Rehearsal Dinner",
        time: "Evening",
        venue: "[PLACEHOLDER — Tim to provide venue name]",
        dressCode: "[PLACEHOLDER]",
        audience: "Wedding party & family",
      },
      {
        name: "Welcome Event",
        time: "Late evening",
        venue: "[PLACEHOLDER — Tim to provide venue name]",
        dressCode: "Casual",
        audience: "Wedding party, family & out-of-town guests",
      },
    ],
  },
  {
    label: "Saturday",
    date: "August 15",
    events: [
      {
        name: "Ceremony",
        time: "[PLACEHOLDER — e.g., Late afternoon]",
        venue: "Park of Roses",
        dressCode: "Formal",
        audience: "All guests",
      },
      {
        name: "Reception",
        time: "Following ceremony",
        venue: "[PLACEHOLDER — Tim to provide venue name]",
        dressCode: "Formal / cocktail",
        audience: "Invited guests (not ceremony-only)",
      },
    ],
  },
  {
    label: "Sunday",
    date: "August 16",
    events: [
      {
        name: "Day-After Brunch",
        time: "Late morning",
        venue: "[PLACEHOLDER — Tim to provide venue name]",
        dressCode: "Casual",
        audience: "Wedding party, family & out-of-towners",
      },
    ],
  },
];

// ── Page ──

export default function EventsPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ── Page Hero ── */}
      <section className="pt-32 pb-12 px-6 text-center">
        <h1 className="text-editorial text-5xl sm:text-7xl text-burgundy">
          The Wedding Weekend
        </h1>
        <p className="mt-4 font-sans text-lg text-muted-foreground">
          Three days in Columbus
        </p>
      </section>

      {/* ── Day-by-day Timeline ── */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16">
        {WEDDING_WEEKEND.map((day, dayIndex) => (
          <div key={day.label} className={dayIndex > 0 ? "mt-16" : ""}>
            {/* Day header */}
            <div className="mb-8">
              <h2 className="text-editorial text-3xl text-burgundy">
                {day.label}
              </h2>
              <p className="mt-1 font-sans text-sm text-muted-foreground">
                {day.date}
              </p>
              <div className="mt-3 h-px bg-spumante" />
            </div>

            {/* Events for this day */}
            <div className="relative">
              {/* Timeline spine — desktop only */}
              <div className="absolute left-3 top-0 bottom-0 hidden sm:block w-px bg-spumante" />

              <div className="flex flex-col gap-6">
                {day.events.map((event, eventIndex) => (
                  <div key={event.name} className="relative sm:ml-10">
                    {/* Timeline dot — desktop only */}
                    <div className="absolute -left-10 top-8 hidden sm:block">
                      <div className="size-[7px] rounded-full bg-burgundy ring-2 ring-spumante" />
                    </div>

                    {/* Event card */}
                    <div className="bg-lucent border border-spumante/50 rounded-sm p-6 sm:p-8">
                      <h3 className="text-editorial text-xl sm:text-2xl text-foreground">
                        {event.name}
                      </h3>
                      <p className="mt-2 font-sans text-sm text-muted-foreground uppercase tracking-wider">
                        {event.time}
                      </p>
                      <p className="mt-1 font-sans text-base text-foreground/80">
                        {event.venue}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="inline-block bg-spumante/20 text-foreground/70 text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                          {event.dressCode}
                        </span>
                      </div>
                      <p className="mt-3 font-sans text-sm text-muted-foreground italic">
                        {event.audience}
                      </p>
                    </div>

                    {/* Kids policy note — after the Ceremony card */}
                    {day.label === "Saturday" && eventIndex === 0 && (
                      <aside className="mt-6 bg-spumante/10 border-l-4 border-burgundy p-6 rounded-r-sm">
                        <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                          Kids are welcome at the ceremony. The reception and
                          other events are adults-only. If you&rsquo;re bringing
                          little ones, you&rsquo;ll see a spot for them when you
                          RSVP.
                        </p>
                      </aside>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Personalized Details CTA ── */}
      <section className="py-16 px-6 text-center">
        <p className="mx-auto max-w-xl font-sans text-lg text-foreground">
          Want the full details&mdash;times, addresses, parking, and your
          personalized schedule?
        </p>
        <Link
          href="/rsvp"
          className="mt-6 inline-flex items-center justify-center min-h-[44px] bg-burgundy text-lucent font-sans font-medium text-sm px-8 py-3 rounded-lg hover:bg-burgundy/90 transition-colors duration-200"
        >
          Find Your Invitation
        </Link>
        <p className="mt-4 font-sans text-sm text-muted-foreground">
          Enter your name to see exactly what your weekend looks like.
        </p>
      </section>
    </main>
  );
}
