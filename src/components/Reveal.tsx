import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-entry motion that is invisible to the prerenderer.
 *
 * Every framer-motion `initial={{ opacity: 0 }}` in the previous build was
 * serialised into the static HTML as `opacity:0`. Google renders JavaScript
 * and recovers; GPTBot, PerplexityBot, and ClaudeBot generally do not, so the
 * page they read was a document of invisible text. Since AI citation is the
 * primary goal for this site, that trade was backwards.
 *
 * So the markup ships fully visible and JavaScript opts elements *into* a
 * hidden state at runtime — and only elements that are still below the fold,
 * which is what keeps above-the-fold content from flashing on hydration. A
 * failed or blocked script leaves a completely readable page.
 *
 * Motion itself lives in CSS (see the [data-reveal] rules in index.css) so
 * `prefers-reduced-motion` can neutralise it without a JS branch.
 */

export type RevealVariant =
    /** Prose and supporting blocks. The quiet default. */
    | "settle"
    /** Editorial list rows. Pairs with `index` for a capped stagger. */
    | "row"
    /** Framed photography — opens from a slight overscale. */
    | "frame";

interface RevealProps {
    children: ReactNode;
    as?: ElementType;
    variant?: RevealVariant;
    /** Stagger position within a list. Capped at 6 so long lists stay snappy. */
    index?: number;
    className?: string;
    id?: string;
}

/** Total stagger never exceeds ~360ms however long the list is. */
const STAGGER_MS = 60;
const STAGGER_CAP = 6;

export default function Reveal({
    children,
    as: Tag = "div",
    variant = "settle",
    index,
    className,
    id,
}: RevealProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Honour the OS setting before touching the DOM at all: with reduced
        // motion the element stays exactly as the server rendered it.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        if (index !== undefined) {
            el.style.setProperty("--reveal-delay", `${Math.min(index, STAGGER_CAP) * STAGGER_MS}ms`);
        }

        /*
         * Visibility is decided by the observer's own first report rather than
         * by measuring the element here.
         *
         * An earlier version hid the element up front when geometry said it was
         * below the fold, and returned early when it wasn't. If that effect ever
         * ran twice — a remount, a dependency change, StrictMode — the first run
         * hid the element and disconnected its observer on cleanup, and the
         * second run took the early return and left it hidden permanently. A
         * whole strip of the homepage was invisible.
         *
         * Deciding inside the callback removes the geometry guess and makes the
         * effect idempotent: however many times it runs, an element already on
         * screen ends up visible and an element below the fold ends up armed.
         */
        let primed = false;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const target = entry.target as HTMLElement;

                    if (!primed) {
                        primed = true;
                        if (entry.isIntersecting) {
                            // Already on screen at hydration. Show it with no
                            // motion rather than hiding and re-showing, which
                            // reads as a flash.
                            target.dataset.reveal = "shown";
                            observer.unobserve(target);
                            continue;
                        }
                        // Below the fold, so hiding it now is unobservable.
                        target.dataset.reveal = "pending";
                        continue;
                    }

                    if (entry.isIntersecting) {
                        target.dataset.reveal = "in";
                        observer.unobserve(target);
                        continue;
                    }

                    /*
                     * Safety net. If the element is geometrically on screen but
                     * still reports no intersection, something is clipping it to
                     * a zero-area box and the observer will never fire again.
                     * Show it rather than leaving content permanently hidden.
                     */
                    const box = target.getBoundingClientRect();
                    if (box.bottom > 0 && box.top < window.innerHeight && box.width === 0 && box.height === 0) {
                        target.dataset.reveal = "shown";
                        observer.unobserve(target);
                    }
                }
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0.01 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [index]);

    return (
        <Tag ref={ref} id={id} data-reveal-variant={variant} className={className}>
            {children}
        </Tag>
    );
}

/**
 * The hero's authored moment.
 *
 * A gold hairline sweeps left to right and the headline resolves behind it —
 * the rule appears to draw the words. It is the same hairline that sits under
 * the BASE wordmark, so the one piece of choreography on the site is the
 * brand's own mark performing itself, rather than a generic fade-and-rise.
 *
 * Runs once, on load, above the fold. Nothing else on the site moves like it.
 */
export function HeadlineDraw({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // Play once per element; a re-running effect must not restart it.
        if (el.dataset.draw) return;

        el.dataset.draw = "pending";
        el.style.setProperty("--draw-delay", `${delay}ms`);
        // Two frames: one to apply the closed state, one to transition out of it.
        const raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                el.dataset.draw = "in";
            })
        );
        return () => cancelAnimationFrame(raf);
    }, [delay]);

    return (
        <span ref={ref} className={cn("headline-draw", className)}>
            {children}
        </span>
    );
}
