export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center w-full py-32 px-6 bg-burgundy-section text-center">
        <p className="text-sm font-sans uppercase tracking-[0.3em] text-spumante mb-6">
          August 2026 &middot; Columbus, Ohio
        </p>
        <h1 className="text-editorial text-6xl sm:text-8xl lg:text-9xl text-lucent mb-4 tilt-2">
          Tim &amp; Stef
        </h1>
        <p className="text-lg font-sans text-spumante/80 mt-4">
          Park of Roses
        </p>
        <div className="mt-12">
          <a
            href="/rsvp"
            className="inline-block px-8 py-4 bg-meringue text-affenpinscher font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-meringue/80 transition-all duration-200 hover:rotate-[-0.5deg]"
          >
            RSVP
          </a>
        </div>
      </section>

      {/* ── Placeholder sections ── */}
      <section className="w-full max-w-3xl mx-auto py-24 px-6 text-center">
        <h2 className="text-editorial text-4xl sm:text-5xl mb-6">
          More to come.
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
          We&rsquo;re building something. It&rsquo;s going to be beautiful and
          only slightly unhinged. Check back soon.
        </p>
      </section>
    </main>
  );
}
