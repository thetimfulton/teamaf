import type { Metadata } from "next";
import { FaqAccordion } from "./faq-accordion";

export const metadata: Metadata = {
  title: "FAQ — #teamAF",
};

export default function FaqPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ── Page Hero ── */}
      <section className="pt-32 pb-12 px-6 text-center">
        <h1 className="text-editorial text-5xl sm:text-7xl text-burgundy">
          Questions &amp; Answers
        </h1>
        <p className="mt-4 font-sans text-lg text-muted-foreground">
          Everything you need to know (and a few things you didn&rsquo;t)
        </p>
      </section>

      {/* ── FAQ Accordion ── */}
      <section className="pb-16">
        <FaqAccordion />
      </section>
    </main>
  );
}
