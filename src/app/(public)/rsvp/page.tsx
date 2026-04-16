import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RSVP — #teamAF",
};

export default function RsvpPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32">
      <h1 className="text-editorial text-5xl sm:text-6xl mb-6">RSVP</h1>
      <p className="text-muted-foreground text-lg max-w-md text-center">
        RSVP is coming soon. Check back shortly — we&rsquo;ll have everything
        ready for you.
      </p>
    </main>
  );
}
