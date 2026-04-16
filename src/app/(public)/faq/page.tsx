import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — #teamAF",
};

export default function FaqPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32">
      <h1 className="text-editorial text-5xl sm:text-6xl mb-6">FAQ</h1>
      <p className="text-muted-foreground text-lg">Coming soon.</p>
    </main>
  );
}
