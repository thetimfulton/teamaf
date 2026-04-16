"use client";

import { Check, X, Music, UtensilsCrossed, Baby, Users } from "lucide-react";
import Link from "next/link";
import type { GuestRsvpData } from "@/types/database";

interface RsvpConfirmationProps {
  data: GuestRsvpData;
  onEdit: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function RsvpConfirmation({ data, onEdit }: RsvpConfirmationProps) {
  const { guest, events } = data;
  const firstName = guest.name.split(" ")[0];

  // Separate accepted and declined from the latest RSVP data
  const accepted = events.filter(
    (e) => e.existingRsvp?.status === "accepted"
  );
  const declined = events.filter(
    (e) => e.existingRsvp?.status === "declined"
  );
  const songRequest = events.find(
    (e) => e.existingRsvp?.song_request
  )?.existingRsvp?.song_request;

  const allDeclined = accepted.length === 0 && declined.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl text-center">
      {/* Hero */}
      <div className="mb-10">
        <h2 className="text-editorial text-4xl sm:text-5xl text-burgundy">
          {allDeclined ? `We\u2019ll Miss You, ${firstName}` : `You\u2019re All Set!`}
        </h2>
        <p className="mt-4 font-sans text-lg text-muted-foreground">
          {allDeclined
            ? "We\u2019re sorry you can\u2019t make it. We\u2019ll be thinking of you."
            : `Thanks for RSVPing, ${firstName}. Here\u2019s a summary of your responses.`}
        </p>
      </div>

      {/* Event summary */}
      <div className="bg-white border border-spumante/50 rounded-lg overflow-hidden shadow-sm text-left">
        {/* Attending */}
        {accepted.length > 0 && (
          <div className="p-6">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Attending
            </h3>
            <div className="space-y-4">
              {accepted.map(({ event, existingRsvp }) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-burgundy/10">
                    <Check className="size-3.5 text-burgundy" />
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-base font-medium text-foreground">
                      {event.name}
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">
                      {formatDate(event.date)} &bull; {event.venue}
                    </p>
                    {/* Details */}
                    <div className="mt-1 flex flex-wrap gap-3">
                      {existingRsvp?.plus_one_attending && (
                        <span className="inline-flex items-center gap-1 font-sans text-xs text-foreground/60">
                          <Users className="size-3" />
                          +1
                          {guest.plus_one_name
                            ? ` (${guest.plus_one_name})`
                            : ""}
                        </span>
                      )}
                      {existingRsvp &&
                        existingRsvp.kids_attending > 0 && (
                          <span className="inline-flex items-center gap-1 font-sans text-xs text-foreground/60">
                            <Baby className="size-3" />
                            {existingRsvp.kids_attending}{" "}
                            {existingRsvp.kids_attending === 1
                              ? "child"
                              : "children"}
                          </span>
                        )}
                      {existingRsvp?.dietary_notes && (
                        <span className="inline-flex items-center gap-1 font-sans text-xs text-foreground/60">
                          <UtensilsCrossed className="size-3" />
                          {existingRsvp.dietary_notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Declined */}
        {declined.length > 0 && (
          <div
            className={`p-6 ${accepted.length > 0 ? "border-t border-spumante/30" : ""}`}
          >
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Not Attending
            </h3>
            <div className="space-y-3">
              {declined.map(({ event }) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/5">
                    <X className="size-3.5 text-muted-foreground" />
                  </div>
                  <p className="font-sans text-base text-foreground/60">
                    {event.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Song request */}
        {songRequest && (
          <div className="p-6 border-t border-spumante/30">
            <div className="flex items-center gap-2">
              <Music className="size-4 text-burgundy" />
              <p className="font-sans text-sm text-foreground/70">
                Song request: <span className="font-medium">{songRequest}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email note */}
      {guest.email && (
        <p className="mt-6 font-sans text-sm text-muted-foreground">
          We sent a confirmation to {guest.email}.
        </p>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center min-h-[48px] border-2 border-burgundy text-burgundy font-sans font-semibold text-sm px-8 py-3 rounded-lg hover:bg-burgundy/5 transition-colors duration-200"
        >
          Edit Your RSVP
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[48px] bg-burgundy text-lucent font-sans font-semibold text-sm px-8 py-3 rounded-lg hover:bg-burgundy/90 transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>

      <p className="mt-6 font-sans text-xs text-muted-foreground">
        Need to make changes later? Just come back to this page and enter your
        name again.
      </p>
    </div>
  );
}
