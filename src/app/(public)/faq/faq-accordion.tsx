"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type FaqItem = {
  question: string;
  answer: ReactNode;
};

type FaqCategory = {
  heading: string;
  items: FaqItem[];
};

const FAQ_DATA: FaqCategory[] = [
  {
    heading: "The Basics",
    items: [
      {
        question: "When and where is the wedding?",
        answer:
          "August [PLACEHOLDER — Tim to provide exact date], 2026 at the Park of Roses in Columbus, Ohio.",
      },
      {
        question: "What time should I arrive?",
        answer: "[PLACEHOLDER — Tim to provide arrival guidance]",
      },
      {
        question: "What\u2019s the dress code?",
        answer:
          "Formal or cocktail attire for the ceremony and reception. The other events over the weekend are more relaxed \u2014 check your personalized itinerary for specifics after you RSVP.",
      },
    ],
  },
  {
    heading: "RSVPs & Guests",
    items: [
      {
        question: "How do I RSVP?",
        answer: (
          <>
            Head to our{" "}
            <Link
              href="/rsvp"
              className="text-burgundy underline hover:text-burgundy/80 inline-flex items-center min-h-[44px]"
            >
              RSVP page
            </Link>{" "}
            and enter your name. You&rsquo;ll see the specific events
            you&rsquo;re invited to and can respond to each one individually.
          </>
        ),
      },
      {
        question: "Can I bring a plus one?",
        answer:
          "If you\u2019ve been given a plus-one, it\u2019ll show up automatically in your RSVP form. If you don\u2019t see the option and think there\u2019s been a mistake, reach out to [PLACEHOLDER \u2014 contact person name and method, e.g., \u2018Tim at tim@timfulton.com\u2019].",
      },
      {
        question: "Are kids welcome?",
        answer:
          "Kids are welcome at the ceremony! The reception and other events are adults-only. If you\u2019re bringing little ones to the ceremony, you\u2019ll see a spot for their names and headcount in your RSVP form.",
      },
      {
        question: "Can I change my RSVP after I submit it?",
        answer: (
          <>
            Absolutely &mdash; you can update your response anytime before
            [PLACEHOLDER &mdash; cutoff date]. Just visit the{" "}
            <Link
              href="/rsvp"
              className="text-burgundy underline hover:text-burgundy/80 inline-flex items-center min-h-[44px]"
            >
              RSVP page
            </Link>{" "}
            again and enter your name.
          </>
        ),
      },
    ],
  },
  {
    heading: "Logistics",
    items: [
      {
        question: "Where should I stay?",
        answer: (
          <>
            We&rsquo;ve got all the details on our{" "}
            <Link
              href="/travel"
              className="text-burgundy underline hover:text-burgundy/80 inline-flex items-center min-h-[44px]"
            >
              Travel page
            </Link>{" "}
            &mdash; hotel blocks, Airbnb tips, and the lay of the land.
          </>
        ),
      },
      {
        question: "Is there parking?",
        answer:
          "[PLACEHOLDER \u2014 Tim to provide general parking note. Don\u2019t include event-specific addresses \u2014 those are gated.]",
      },
      {
        question: "What if it rains?",
        answer:
          "[PLACEHOLDER \u2014 Tim to provide contingency plan for outdoor ceremony at Park of Roses]",
      },
    ],
  },
  {
    heading: "Gifts",
    items: [
      {
        question: "Do you have a registry?",
        answer: (
          <>
            We do! We&rsquo;ve set up a registry on Zola with a mix of physical
            gifts and cash fund options. Check it out on our{" "}
            <Link
              href="/registry"
              className="text-burgundy underline hover:text-burgundy/80 inline-flex items-center min-h-[44px]"
            >
              Registry page
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    heading: "One More Thing",
    items: [
      {
        question: "Is there an open bar?",
        answer: "Yes.",
      },
    ],
  },
];

export function FaqAccordion() {
  return (
    <div className="mx-auto max-w-3xl px-6">
      {FAQ_DATA.map((category, catIndex) => (
        <div key={category.heading}>
          <h2
            className={`text-editorial text-2xl text-burgundy mb-4 ${catIndex === 0 ? "mt-0" : "mt-12"}`}
          >
            {category.heading}
          </h2>
          <Accordion.Root keepMounted>
            {category.items.map((item, idx) => (
              <Accordion.Item
                key={idx}
                value={idx}
                className="border-b border-spumante/30"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between min-h-[48px] py-4 text-left font-sans text-base font-semibold text-foreground sm:text-lg focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2">
                    {item.question}
                    <ChevronDown className="ml-4 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="h-0 overflow-hidden transition-[height] duration-200 ease-out data-[open]:h-[var(--accordion-panel-height)]">
                  <div className="pb-4 font-sans text-base leading-relaxed text-foreground/80">
                    {item.answer}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      ))}
    </div>
  );
}
