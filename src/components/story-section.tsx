import { cn } from "@/lib/utils";

interface StorySectionProps {
  heading: string;
  body: string;
  imagePosition: "left" | "right";
  imagePlaceholder?: boolean;
}

export function StorySection({
  heading,
  body,
  imagePosition,
  imagePlaceholder = true,
}: StorySectionProps) {
  const tiltClass =
    imagePosition === "right" ? "md:tilt-1" : "md:tilt-3";

  const image = imagePlaceholder ? (
    <div
      className={cn(
        "relative aspect-[4/5] rounded-sm bg-spumante/30 flex items-center justify-center",
        tiltClass
      )}
      role="img"
      aria-label={`Photo — ${heading}`}
    >
      <span className="text-muted-foreground text-sm font-sans text-center px-4">
        Photo — {heading}
      </span>
      {/* TODO: Replace with <Image src="..." alt="..." fill className="object-cover" /> */}
    </div>
  ) : null;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Mobile: single column, image on top */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-0 items-center"
          )}
        >
          {/* Image column */}
          <div
            className={cn(
              "md:col-span-6",
              imagePosition === "right" ? "md:order-2 md:col-start-7" : "md:order-1 md:col-start-1"
            )}
          >
            {image}
          </div>

          {/* Text column */}
          <div
            className={cn(
              "md:col-span-5",
              imagePosition === "right" ? "md:order-1 md:col-start-1" : "md:order-2 md:col-start-8"
            )}
          >
            <h2 className="text-editorial text-3xl sm:text-4xl text-burgundy text-center md:text-left mb-4">
              {heading}
            </h2>
            <p className="font-sans text-base sm:text-lg text-foreground/80 leading-relaxed max-w-prose">
              {body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
