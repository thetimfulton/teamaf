"use client";

import { useState, useTransition } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { lookupGuest, selectCandidate, getGuestRsvpData } from "./actions";
import type { GuestRsvpData } from "@/types/database";

interface GuestLookupProps {
  onFound: (data: GuestRsvpData) => void;
}

export function GuestLookup({ onFound }: GuestLookupProps) {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<
    { id: string; name: string }[] | null
  >(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCandidates(null);

    startTransition(async () => {
      const result = await lookupGuest(searchText);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.data.found === "none") {
        setError(
          "We couldn\u2019t find that name on our guest list. Double-check the spelling, or try your email address."
        );
        return;
      }

      if (result.data.found === "multiple") {
        setCandidates(result.data.candidates);
        return;
      }

      // Single match — load RSVP data and proceed
      const rsvpResult = await getGuestRsvpData();
      if (rsvpResult.success) {
        onFound(rsvpResult.data);
      } else {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function handleSelectCandidate(guestId: string) {
    setError(null);
    startTransition(async () => {
      const result = await selectCandidate(guestId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      const rsvpResult = await getGuestRsvpData();
      if (rsvpResult.success) {
        onFound(rsvpResult.data);
      } else {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="bg-white border border-spumante/50 rounded-lg p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-editorial text-3xl text-burgundy">
            Find Your Invitation
          </h2>
          <p className="mt-3 font-sans text-base text-muted-foreground">
            Enter your name or email to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Your name or email"
              required
              minLength={2}
              disabled={isPending}
              className="w-full rounded-lg border border-spumante/50 bg-lucent py-3 pl-11 pr-4 font-sans text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-burgundy transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || searchText.trim().length < 2}
            className="w-full inline-flex items-center justify-center min-h-[48px] bg-burgundy text-lucent font-sans font-semibold text-sm px-8 py-3 rounded-lg hover:bg-burgundy/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Look Me Up"
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-6 rounded-lg bg-burgundy/5 border border-burgundy/20 p-4">
            <p className="font-sans text-sm text-burgundy">{error}</p>
          </div>
        )}

        {/* Disambiguation list */}
        {candidates && (
          <div className="mt-6">
            <p className="font-sans text-sm text-muted-foreground mb-3">
              We found a few matches. Which one is you?
            </p>
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => handleSelectCandidate(candidate.id)}
                  disabled={isPending}
                  className="w-full flex items-center justify-between rounded-lg border border-spumante/50 bg-lucent p-4 text-left font-sans text-base text-foreground hover:border-burgundy hover:bg-burgundy/5 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  <span>{candidate.name}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center font-sans text-sm text-muted-foreground">
        Having trouble? Reach out to us directly and we&rsquo;ll help you out.
      </p>
    </div>
  );
}
