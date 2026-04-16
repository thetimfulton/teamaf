// PHOTO GUIDE:
// 1. Add photos to /public/images/story/ (e.g., how-we-met.jpg)
// 2. Replace the placeholder <div> in each StorySection with:
//    <Image src="/images/story/how-we-met.jpg" alt="Description" fill className="object-cover rounded-sm" />
// 3. Wrap the Image in a <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
// 4. Recommended: optimize images to ≤400KB, 1200px wide, WebP format

import type { Metadata } from "next";
import Link from "next/link";
import { StorySection } from "@/components/story-section";

export const metadata: Metadata = {
  title: "Our Story — #teamAF",
};

const STORY_SECTIONS = [
  {
    heading: "How We Met",
    body: "[PLACEHOLDER — Tim and Stef to provide]",
  },
  {
    heading: "The First Date",
    body: "[PLACEHOLDER — Tim and Stef to provide]",
  },
  {
    heading: "When We Knew",
    body: "[PLACEHOLDER — Tim and Stef to provide]",
  },
  {
    heading: "Adventures Together",
    body: "[PLACEHOLDER — Tim and Stef to provide]",
  },
  {
    heading: "The Proposal",
    body: "[PLACEHOLDER — Tim and Stef to provide]",
  },
  {
    heading: "The Wedding",
    body: "[PLACEHOLDER — Tim and Stef to provide]",
  },
] as const;

export default function OurStoryPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ── Page Hero ── */}
      <section className="bg-lucent pt-32 pb-16">
        <div className="mx-auto max-w-6xl px-6 text-center md:text-left">
          <h1 className="text-editorial text-5xl sm:text-7xl lg:text-8xl text-burgundy">
            Our Story
          </h1>
          <p className="mt-4 font-sans text-lg text-muted-foreground">
            [PLACEHOLDER — e.g., &ldquo;A timeline of questionable decisions&rdquo;]
          </p>
        </div>
      </section>

      {/* ── Timeline / Narrative Sections ── */}
      {STORY_SECTIONS.map((section, index) => (
        <StorySection
          key={section.heading}
          heading={section.heading}
          body={section.body}
          imagePosition={index % 2 === 0 ? "right" : "left"}
        />
      ))}

      {/* ── Closing Section ── */}
      <section className="w-full bg-dark-section py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-editorial text-3xl sm:text-4xl text-lucent">
            [PLACEHOLDER — Tim &amp; Stef closing message about what this wedding means to them]
          </p>
          <Link
            href="/rsvp"
            className="mt-10 inline-block font-sans text-lg text-meringue hover:text-meringue/80 transition-colors duration-200"
          >
            Join us &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}
