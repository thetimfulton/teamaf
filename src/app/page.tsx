import Link from "next/link";
import { Countdown } from "@/components/countdown";

const QUICK_LINKS = [
  {
    href: "/our-story",
    title: "Our Story",
    description: "How we got here",
  },
  {
    href: "/events",
    title: "Events",
    description: "The wedding weekend",
  },
  {
    href: "/travel",
    title: "Travel",
    description: "Getting to Columbus",
  },
  {
    href: "/registry",
    title: "Registry",
    description: "If you\u2019re feeling generous",
  },
] as const;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center w-full min-h-screen px-6 pb-20 bg-burgundy-section text-center overflow-hidden">
        {/* TODO: Replace with Next.js <Image> when Tim provides hero photo */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-burgundy)_0%,var(--color-affenpinscher)_100%)] opacity-40"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-sm font-sans uppercase tracking-[0.3em] text-spumante mb-6">
            August 2026
          </p>

          <h1
            className="text-editorial text-lucent md:tilt-2"
            style={{
              fontSize: "clamp(3rem, 12vw, 10rem)",
            }}
          >
            Tim &amp; Stef
          </h1>

          <p className="mt-4 text-sm font-sans uppercase tracking-[0.3em] text-spumante/70">
            Park of Roses &middot; Columbus, Ohio
          </p>

          <div className="mt-12">
            <Link
              href="/rsvp"
              className="inline-block min-h-12 px-8 py-4 bg-meringue text-affenpinscher font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-meringue/80 transition-all duration-200 hover:rotate-[-0.5deg]"
            >
              RSVP
            </Link>
          </div>
        </div>
      </section>

      {/* ── Countdown ── */}
      <section className="w-full py-24 px-6 bg-lucent">
        <div className="mx-auto max-w-2xl">
          <Countdown />
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section className="w-full py-24 px-6 bg-spumante/10">
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block border border-spumante rounded-sm p-8 transition-all duration-300 hover:shadow-lg hover:border-meringue md:hover:rotate-[-0.5deg]"
            >
              <h2 className="text-editorial text-2xl text-burgundy">
                {link.title}
              </h2>
              <p className="mt-2 font-sans text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="w-full py-24 px-6 bg-dark-section text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-editorial text-3xl sm:text-4xl text-lucent">
            [PLACEHOLDER &mdash; Tim &amp; Stef welcome message]
          </p>
          <div className="mt-10">
            <Link
              href="/rsvp"
              className="inline-block min-h-12 px-8 py-4 bg-meringue text-affenpinscher font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-meringue/80 transition-all duration-200 hover:rotate-[-0.5deg]"
            >
              RSVP
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
