import type { Metadata } from "next";
import { getGuestFromCookie } from "@/lib/session";
import { getGuestRsvpData } from "./actions";
import { RsvpFlow } from "./rsvp-flow";

export const metadata: Metadata = {
  title: "RSVP — #teamAF",
};

export default async function RsvpPage() {
  // Check for returning guest with a valid session
  let initialData = null;

  const guestId = await getGuestFromCookie();
  if (guestId) {
    const result = await getGuestRsvpData();
    if (result.success) {
      initialData = result.data;
    }
  }

  return (
    <main className="flex flex-1 flex-col px-6 pt-32 pb-16">
      <div className="text-center mb-10">
        <h1 className="text-editorial text-5xl sm:text-6xl text-burgundy">
          RSVP
        </h1>
      </div>

      <RsvpFlow initialData={initialData} />
    </main>
  );
}
