import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registry — #teamAF",
};

export default function RegistryPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32">
      <h1 className="text-editorial text-5xl sm:text-6xl mb-6">Registry</h1>
      <p className="text-muted-foreground text-lg">Coming soon.</p>
    </main>
  );
}
