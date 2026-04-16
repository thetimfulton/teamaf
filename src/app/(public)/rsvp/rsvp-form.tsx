"use client";

import { useState, useTransition } from "react";
import {
  Check,
  X,
  Loader2,
  Music,
  UtensilsCrossed,
  Users,
  Baby,
} from "lucide-react";
import { submitRsvp } from "./actions";
import type { GuestRsvpData } from "@/types/database";

interface RsvpFormProps {
  data: GuestRsvpData;
  onSubmitted: () => void;
}

type EventResponseState = {
  status: "accepted" | "declined" | null;
  plusOneAttending: boolean;
  kidsAttending: number;
  dietaryNotes: string;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return m === "00" ? `${hour12} ${ampm}` : `${hour12}:${m} ${ampm}`;
}

export function RsvpForm({ data, onSubmitted }: RsvpFormProps) {
  const { guest, events } = data;
  const isEditing = events.some((e) => e.existingRsvp !== null);

  // Initialize response state from existing RSVPs (or blank)
  const [responses, setResponses] = useState<
    Record<string, EventResponseState>
  >(() => {
    const initial: Record<string, EventResponseState> = {};
    for (const { event, existingRsvp } of events) {
      initial[event.id] = {
        status: existingRsvp
          ? existingRsvp.status === "pending"
            ? null
            : (existingRsvp.status as "accepted" | "declined")
          : null,
        plusOneAttending: existingRsvp?.plus_one_attending ?? false,
        kidsAttending: existingRsvp?.kids_attending ?? 0,
        dietaryNotes: existingRsvp?.dietary_notes ?? "",
      };
    }
    return initial;
  });

  const [songRequest, setSongRequest] = useState(
    events.find((e) => e.existingRsvp?.song_request)?.existingRsvp
      ?.song_request ?? ""
  );
  const [globalDietary, setGlobalDietary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateResponse(
    eventId: string,
    updates: Partial<EventResponseState>
  ) {
    setResponses((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], ...updates },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate: at least one response selected
    const responseEntries = Object.entries(responses).filter(
      ([, r]) => r.status !== null
    );

    if (responseEntries.length === 0) {
      setError("Please respond to at least one event.");
      return;
    }

    startTransition(async () => {
      const result = await submitRsvp({
        responses: responseEntries.map(([eventId, r]) => ({
          eventId,
          status: r.status!,
          plusOneAttending: r.plusOneAttending,
          kidsAttending: r.kidsAttending,
          dietaryNotes: r.dietaryNotes,
        })),
        songRequest,
        globalDietaryNotes: globalDietary,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSubmitted();
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Welcome */}
      <div className="text-center mb-10">
        <h2 className="text-editorial text-3xl sm:text-4xl text-burgundy">
          Hey, {guest.name.split(" ")[0]}!
        </h2>
        <p className="mt-3 font-sans text-base text-muted-foreground">
          {isEditing
            ? "Here are your current responses. Update anything you need."
            : "Let us know which events you can make it to."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event cards */}
        {events.map(({ event }) => {
          const response = responses[event.id];
          const isAccepted = response.status === "accepted";
          const isDeclined = response.status === "declined";
          const showConditionalFields = isAccepted;

          return (
            <div
              key={event.id}
              className="bg-white border border-spumante/50 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Event header */}
              <div className="p-6 pb-4">
                <h3 className="text-editorial text-xl sm:text-2xl text-foreground">
                  {event.name}
                </h3>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  {formatDate(event.date)}
                  {event.time ? ` \u2022 ${formatTime(event.time)}` : ""}
                </p>
                <p className="mt-1 font-sans text-sm text-foreground/70">
                  {event.venue}
                </p>
                {event.dress_code && (
                  <span className="mt-2 inline-block bg-spumante/20 text-foreground/70 text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    {event.dress_code}
                  </span>
                )}
              </div>

              {/* Accept / Decline toggle */}
              <div className="px-6 pb-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    aria-label={`Attending ${event.name}`}
                    aria-pressed={isAccepted}
                    onClick={() =>
                      updateResponse(event.id, { status: "accepted" })
                    }
                    className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-lg border-2 font-sans text-sm font-semibold transition-all duration-200 ${
                      isAccepted
                        ? "border-burgundy bg-burgundy text-lucent"
                        : "border-spumante/50 bg-transparent text-foreground/70 hover:border-burgundy/50"
                    }`}
                  >
                    <Check className="size-4" />
                    Attending
                  </button>
                  <button
                    type="button"
                    aria-label={`Decline ${event.name}`}
                    aria-pressed={isDeclined}
                    onClick={() =>
                      updateResponse(event.id, {
                        status: "declined",
                        plusOneAttending: false,
                        kidsAttending: 0,
                      })
                    }
                    className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-lg border-2 font-sans text-sm font-semibold transition-all duration-200 ${
                      isDeclined
                        ? "border-foreground/30 bg-foreground/10 text-foreground"
                        : "border-spumante/50 bg-transparent text-foreground/70 hover:border-foreground/30"
                    }`}
                  >
                    <X className="size-4" />
                    Can&rsquo;t Make It
                  </button>
                </div>
              </div>

              {/* Conditional fields (shown only when accepted) */}
              {showConditionalFields && (
                <div className="px-6 pb-6 space-y-4 border-t border-spumante/30 pt-4">
                  {/* Plus-one */}
                  {guest.plus_one_allowed && (
                    <div className="flex items-start gap-3">
                      <Users className="size-5 text-burgundy mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                          <input
                            type="checkbox"
                            checked={response.plusOneAttending}
                            onChange={(e) =>
                              updateResponse(event.id, {
                                plusOneAttending: e.target.checked,
                              })
                            }
                            className="size-5 rounded border-spumante accent-burgundy"
                          />
                          <span className="font-sans text-sm text-foreground">
                            {guest.plus_one_name
                              ? `${guest.plus_one_name} will join me`
                              : "Bringing a guest"}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Kids (only for kids_allowed events) */}
                  {event.kids_allowed && guest.kids_count > 0 && (
                    <div className="flex items-start gap-3">
                      <Baby className="size-5 text-burgundy mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <label className="font-sans text-sm text-foreground block mb-2">
                          How many children will attend?
                        </label>
                        <select
                          value={response.kidsAttending}
                          onChange={(e) =>
                            updateResponse(event.id, {
                              kidsAttending: parseInt(e.target.value, 10),
                            })
                          }
                          className="rounded-lg border border-spumante/50 bg-lucent px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-burgundy min-h-[44px]"
                        >
                          {Array.from(
                            { length: guest.kids_count + 1 },
                            (_, i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            )
                          )}
                        </select>
                        {guest.kids_names && (
                          <p className="mt-1 font-sans text-xs text-muted-foreground">
                            ({guest.kids_names})
                          </p>
                        )}
                        <p className="mt-1 font-sans text-xs text-muted-foreground italic">
                          Kids are welcome at the ceremony only &mdash; all
                          other events are adults-only.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Per-event dietary notes */}
                  <div className="flex items-start gap-3">
                    <UtensilsCrossed className="size-5 text-burgundy mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <label className="font-sans text-sm text-foreground block mb-1">
                        Dietary needs for this event
                      </label>
                      <input
                        type="text"
                        value={response.dietaryNotes}
                        onChange={(e) =>
                          updateResponse(event.id, {
                            dietaryNotes: e.target.value,
                          })
                        }
                        placeholder="Vegetarian, allergies, etc."
                        maxLength={500}
                        className="w-full rounded-lg border border-spumante/50 bg-lucent px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-burgundy min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Global fields */}
        <div className="bg-white border border-spumante/50 rounded-lg p-6 shadow-sm space-y-5">
          {/* Song request */}
          <div className="flex items-start gap-3">
            <Music className="size-5 text-burgundy mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="font-sans text-sm font-semibold text-foreground block mb-1">
                What song gets you on the dance floor?
              </label>
              <input
                type="text"
                value={songRequest}
                onChange={(e) => setSongRequest(e.target.value)}
                placeholder="Artist — Song name"
                maxLength={200}
                className="w-full rounded-lg border border-spumante/50 bg-lucent px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-burgundy min-h-[44px]"
              />
            </div>
          </div>

          {/* Global dietary notes */}
          <div className="flex items-start gap-3">
            <UtensilsCrossed className="size-5 text-burgundy mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="font-sans text-sm font-semibold text-foreground block mb-1">
                Any dietary needs we should know about?
              </label>
              <input
                type="text"
                value={globalDietary}
                onChange={(e) => setGlobalDietary(e.target.value)}
                placeholder="Applies to all events"
                maxLength={500}
                className="w-full rounded-lg border border-spumante/50 bg-lucent px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-burgundy min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-burgundy/5 border border-burgundy/20 p-4">
            <p className="font-sans text-sm text-burgundy">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center min-h-[52px] bg-burgundy text-lucent font-sans font-semibold text-base px-8 py-3 rounded-lg hover:bg-burgundy/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : isEditing ? (
            "Update RSVP"
          ) : (
            "Submit RSVP"
          )}
        </button>
      </form>
    </div>
  );
}
