"use client";

import { useState, useTransition } from "react";
import { GuestLookup } from "./guest-lookup";
import { RsvpForm } from "./rsvp-form";
import { RsvpConfirmation } from "./rsvp-confirmation";
import { getGuestRsvpData } from "./actions";
import type { GuestRsvpData } from "@/types/database";

type Step = "lookup" | "form" | "confirmation";

interface RsvpFlowProps {
  initialData: GuestRsvpData | null;
}

export function RsvpFlow({ initialData }: RsvpFlowProps) {
  const [step, setStep] = useState<Step>(initialData ? "form" : "lookup");
  const [data, setData] = useState<GuestRsvpData | null>(initialData);
  const [, startTransition] = useTransition();

  function handleFound(rsvpData: GuestRsvpData) {
    setData(rsvpData);
    setStep("form");
  }

  function handleSubmitted() {
    // Refresh data to get the latest RSVP responses for the confirmation view
    startTransition(async () => {
      const result = await getGuestRsvpData();
      if (result.success) {
        setData(result.data);
      }
      setStep("confirmation");
    });
  }

  function handleEdit() {
    // Refresh data before editing
    startTransition(async () => {
      const result = await getGuestRsvpData();
      if (result.success) {
        setData(result.data);
      }
      setStep("form");
    });
  }

  return (
    <>
      {step === "lookup" && <GuestLookup onFound={handleFound} />}

      {step === "form" && data && (
        <RsvpForm data={data} onSubmitted={handleSubmitted} />
      )}

      {step === "confirmation" && data && (
        <RsvpConfirmation data={data} onEdit={handleEdit} />
      )}
    </>
  );
}
