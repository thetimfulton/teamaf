"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/events", label: "Events" },
  { href: "/travel", label: "Travel" },
  { href: "/registry", label: "Registry" },
  { href: "/faq", label: "FAQ" },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const showSolid = !isHome || scrolled;

  const handleMobileNavClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        showSolid
          ? "bg-affenpinscher/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-editorial text-xl tracking-tight text-lucent hover:text-meringue transition-colors"
        >
          #teamAF
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium tracking-wide uppercase transition-colors",
                  isActive
                    ? "text-meringue"
                    : "text-lucent/80 hover:text-meringue"
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* RSVP CTA */}
          <Link
            href="/rsvp"
            className={cn(
              "inline-block rounded-sm px-5 py-2 text-sm font-semibold uppercase tracking-widest transition-all duration-200",
              pathname === "/rsvp"
                ? "bg-meringue text-affenpinscher"
                : "bg-burgundy text-lucent hover:bg-burgundy/80"
            )}
          >
            RSVP
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm min-h-[44px] min-w-[44px] p-2 text-lucent hover:text-meringue transition-colors md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="sr-only">
            {mobileOpen ? "Close menu" : "Open menu"}
          </span>
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-0 top-0 z-50 flex flex-col bg-affenpinscher transition-all duration-300 md:hidden",
          mobileOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="text-editorial text-xl tracking-tight text-lucent"
            onClick={handleMobileNavClick}
          >
            #teamAF
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm min-h-[44px] min-w-[44px] p-2 text-lucent hover:text-meringue transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <X className="size-6" />
          </button>
        </div>

        {/* Mobile links */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={handleMobileNavClick}
                className={cn(
                  "text-editorial text-3xl transition-colors min-h-12 flex items-center",
                  isActive
                    ? "text-meringue"
                    : "text-lucent/80 hover:text-meringue"
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* Mobile RSVP */}
          <Link
            href="/rsvp"
            onClick={handleMobileNavClick}
            className="mt-4 inline-block rounded-sm bg-burgundy px-8 py-4 text-sm font-semibold uppercase tracking-widest text-lucent transition-all hover:bg-burgundy/80 min-h-12 flex items-center"
          >
            RSVP
          </Link>
        </div>
      </div>
    </nav>
  );
}
