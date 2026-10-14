import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * A sequence that draws itself.
 *
 * A gold rail runs through numbered nodes; as the list scrolls into view the
 * rail fills step by step and each node lights in turn, so the order of the
 * steps is something you watch rather than read. "across" lays the steps out
 * in columns with the rail on top from the lg breakpoint (it is "down" below
 * that, where columns would be too narrow); "down" is always a vertical rail.
 *
 * Like Reveal, it ships finished. The prerendered HTML is fully drawn and
 * fully visible; this component only arms the animation at runtime, only
 * when the list starts below the fold, and never under reduced motion.
 * All motion is CSS — see the .tl rules in index.css.
 */
export default function Timeline({
    steps,
    tone = "light",
    orientation = "across",
    cols = 4,
}: {
    steps: readonly { title: string; body: string }[];
    tone?: "light" | "navy";
    orientation?: "across" | "down";
    /** Columns per row in the "across" layout. */
    cols?: 4 | 5;
}) {
    const ref = useRef<HTMLOListElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;

        el.setAttribute("data-armed", "");
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                el.setAttribute("data-in", "");
                observer.disconnect();
            },
            { threshold: 0.2 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const navy = tone === "navy";
    const across = orientation === "across";

    return (
        <ol
            ref={ref}
            className={cn(
                "tl grid grid-cols-1",
                across && ["tl-across lg:gap-y-16", cols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"]
            )}
        >
            {steps.map((step, i) => {
                const last = i === steps.length - 1;
                return (
                    <li
                        key={step.title}
                        className={cn("group relative pb-10 pl-16", across && "lg:pb-0 lg:pl-0 lg:pr-8 lg:pt-16")}
                        style={{ "--i": i } as CSSProperties}
                    >
                        {/* Rail: the track, then the gold fill that draws over it. */}
                        {!last && (
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "absolute left-5 top-10 bottom-0 w-px",
                                    across && "lg:left-10 lg:right-0 lg:top-5 lg:bottom-auto lg:h-px lg:w-auto",
                                    navy ? "bg-cream/20" : "bg-navy/15"
                                )}
                            >
                                <span className="tl-fill absolute inset-0 bg-gold" />
                            </span>
                        )}

                        <span
                            aria-hidden="true"
                            className={cn(
                                "tl-node absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-gold font-display text-[1.0625rem] text-navy",
                                "shadow-[0_0_0_6px_rgba(176,141,87,0.16)] transition-transform group-hover:scale-110"
                            )}
                        >
                            {i + 1}
                        </span>

                        <div className="tl-body">
                            <h3
                                className={cn(
                                    "font-display text-d-item leading-tight",
                                    navy ? "text-cream" : "text-ink"
                                )}
                            >
                                {step.title}
                            </h3>
                            <p
                                className={cn(
                                    "mt-3 max-w-measure text-body-sm",
                                    navy ? "text-cream/75" : "text-navy-600"
                                )}
                            >
                                {step.body}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
