import type { Metadata } from "next";
import { Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Registry — #teamAF",
};

// ── Zola registry URL — Tim to replace with actual URL ──
const ZOLA_REGISTRY_URL =
  "https://www.zola.com/registry/PLACEHOLDER";

// NOTE: Zola offers an embeddable widget for external sites. If you want to
// embed the registry inline rather than linking out, create a client component
// that injects the following into the DOM:
//
//   <a class="zola-registry-embed"
//      href="https://www.zola.com/registry/YOUR_KEY"
//      data-registry-key="YOUR_KEY">Our Zola Wedding Registry</a>
//   <script id="zola-wjs" async src="https://widget.zola.com/js/widget.js"></script>
//
// The widget requires client-side JS and won't SSR, so wrap it in a
// "use client" component with a dynamic import (ssr: false).

export default function RegistryPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ── Page Hero ── */}
      <section className="bg-lucent pt-32 pb-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-editorial text-5xl sm:text-7xl text-burgundy">
            Registry
          </h1>
        </div>
      </section>

      {/* ── Registry Card ── */}
      <section className="w-full px-6 pb-24">
        <div className="mx-auto max-w-2xl bg-lucent border border-spumante rounded-sm p-8 sm:p-12 text-center md:tilt-1">
          {/* Decorative icon */}
          <Gift
            className="mx-auto mb-6 text-spumante"
            size={48}
            strokeWidth={1.2}
          />

          {/* Warm note */}
          <p className="font-sans text-lg leading-relaxed text-foreground">
            [PLACEHOLDER &mdash; Tim and Stef to write a brief note about
            gifts. Tone: &ldquo;Your presence is the real gift, but if
            you&rsquo;d like to give something&hellip;&rdquo;]
          </p>

          <p className="mt-6 font-sans text-base leading-relaxed text-muted-foreground">
            We&rsquo;ve set up our registry on Zola with a mix of household
            items and fund contributions for [PLACEHOLDER &mdash; e.g.,
            honeymoon, house fund, etc.].
          </p>

          {/* Primary CTA */}
          <a
            href={ZOLA_REGISTRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="registry-outbound"
            className="mt-10 inline-block bg-burgundy text-lucent px-8 py-4 text-lg font-sans rounded-sm hover:bg-burgundy/90 transition-colors duration-200"
          >
            View Our Registry on Zola
          </a>

          {/* Helper text */}
          <p className="mt-4 text-sm text-muted-foreground font-sans">
            You&rsquo;ll be taken to our Zola registry, where you can browse
            and purchase items directly.
          </p>
        </div>
      </section>
    </main>
  );
}
