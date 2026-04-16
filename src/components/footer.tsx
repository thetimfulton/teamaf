import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-dark-section py-16 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm tracking-wide text-spumante/80">
          #teamAF &middot; August 2026 &middot; Columbus, Ohio
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Link
            href="/rsvp"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 text-sm text-spumante underline-offset-4 transition-colors hover:text-meringue hover:underline"
          >
            RSVP
          </Link>
          <Link
            href="/registry"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 text-sm text-spumante underline-offset-4 transition-colors hover:text-meringue hover:underline"
          >
            Registry
          </Link>
        </div>
      </div>
    </footer>
  );
}
