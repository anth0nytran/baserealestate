import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

/**
 * The editorial band system.
 *
 * The first build stacked centred text blocks separated by large vertical
 * gaps and hard background flips. It had plenty of air but no structure, so
 * the space read as leftover rather than composed, and each section arrived as
 * a cut rather than a turn.
 *
 * This is the correction: a visible hairline grid. Full-bleed rules divide the
 * page into bands; vertical rules divide each band into a heading cell and a
 * body cell. The rules are the same 1px gold-and-navy hairlines the wordmark
 * and the section devices already use, so the structure is the brand's own
 * vocabulary rather than a new one — and generous space inside a ruled cell
 * reads as intent, which the same space in an open void does not.
 */

type Tone = "white" | "cream" | "navy";

const TONE: Record<Tone, string> = {
    white: "bg-white text-ink",
    cream: "bg-cream texture-linen text-ink",
    navy: "on-navy bg-navy text-cream",
};

const RULE: Record<Tone, string> = {
    white: "border-navy/12",
    cream: "border-navy/12",
    navy: "border-cream/14",
};

const DENSITY = {
    xs: "py-sec-xs",
    sm: "py-sec-sm",
    md: "py-sec-md",
    lg: "py-sec-lg",
} as const;

interface BandProps {
    children: ReactNode;
    tone?: Tone;
    /** Vertical density. Vary it between neighbours to create cadence. */
    density?: keyof typeof DENSITY;
    /** Draws the hairline that separates this band from the one above. */
    rule?: boolean;
    id?: string;
    className?: string;
}

export function Band({
    children,
    tone = "white",
    density = "md",
    rule = true,
    id,
    className,
}: BandProps) {
    return (
        <section id={id} className={cn("relative", TONE[tone], className)}>
            <div className={cn("mx-auto max-w-shell px-gutter", DENSITY[density])}>
                <div className={cn(rule && "border-t", rule && RULE[tone])}>{children}</div>
            </div>
        </section>
    );
}

/**
 * A band's two-cell head: heading on the left, body on the right, with a
 * vertical hairline between them on wide screens.
 *
 * The heading cell is deliberately narrow. A short display heading against a
 * tall body column is what makes the empty space beneath it read as a margin
 * rather than a gap.
 */
export function BandHead({
    heading,
    children,
    tone = "white",
    lede,
    aside,
    foot,
    layout = "split",
    className,
}: {
    heading: ReactNode;
    children?: ReactNode;
    tone?: Tone;
    lede?: ReactNode;
    aside?: ReactNode;
    /**
     * Anchors the bottom of the head column. A tall body beside a short
     * heading otherwise leaves a column of dead space; putting a real next
     * step there fills it with something worth reading rather than padding.
     */
    foot?: ReactNode;
    /**
     * "split" puts the heading in a sticky left column beside the body.
     * "stacked" runs the heading full width above it — the right choice when
     * the body is a long list, where a narrow head column would strand a very
     * tall empty margin next to it.
     */
    layout?: "split" | "stacked";
    className?: string;
}) {
    if (layout === "stacked") {
        return (
            <div className={className}>
                <Reveal className="flex flex-col gap-6 pt-10 lg:flex-row lg:items-end lg:justify-between lg:pt-14">
                    <h2 className="max-w-2xl font-display text-d-section">{heading}</h2>
                    {lede && (
                        <p
                            className={cn(
                                "max-w-measure text-body font-light lg:max-w-xs lg:text-right",
                                tone === "navy" ? "text-cream/60" : "text-navy-600"
                            )}
                        >
                            {lede}
                        </p>
                    )}
                </Reveal>
                {children && <div className="pb-4 pt-10 lg:pb-14">{children}</div>}
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-12", className)}>
            {/*
             * The head column is sticky on wide screens. A short display
             * heading beside a tall body column otherwise leaves a large void
             * under the heading — the single thing that made the first build
             * read as "text floating in space". Travelling with the body turns
             * that emptiness into a working margin and keeps the section's
             * subject on screen while its content scrolls past.
             */}
            <Reveal
                className={cn(
                    "flex flex-col pt-10 lg:col-span-4 lg:self-start lg:pr-12 lg:pt-14",
                    "lg:sticky lg:top-28",
                    (aside || foot) && "lg:pb-12"
                )}
            >
                <h2 className="font-display text-d-section">{heading}</h2>
                {lede && (
                    <p
                        className={cn(
                            "mt-6 max-w-measure text-body font-light",
                            tone === "navy" ? "text-cream/60" : "text-navy-600"
                        )}
                    >
                        {lede}
                    </p>
                )}
                {aside}
                {foot && (
                    <div className={cn("mt-10 border-t pt-8", RULE[tone])}>{foot}</div>
                )}
            </Reveal>

            {children && (
                <div
                    className={cn(
                        "pb-4 pt-8 lg:col-span-8 lg:border-l lg:pb-14 lg:pl-12 lg:pt-14",
                        RULE[tone]
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

/**
 * A hairline grid of cells. `gap-px` over a tinted background is what draws
 * the rules, so the cells share single-pixel borders rather than doubling them
 * the way per-cell borders would.
 */
export function CellGrid({
    children,
    cols = 3,
    tone = "white",
    as: Tag = "div",
    className,
}: {
    children: ReactNode;
    cols?: 2 | 3 | 4;
    tone?: Tone;
    as?: ElementType;
    className?: string;
}) {
    return (
        <Tag
            className={cn(
                "grid grid-cols-1 gap-px",
                cols === 2 && "sm:grid-cols-2",
                cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
                cols === 4 && "grid-cols-2 lg:grid-cols-4",
                tone === "navy" ? "bg-cream/14" : "bg-navy/12",
                className
            )}
        >
            {children}
        </Tag>
    );
}

export function Cell({
    children,
    tone = "white",
    as: Tag = "div",
    className,
}: {
    children: ReactNode;
    tone?: Tone;
    as?: ElementType;
    className?: string;
}) {
    return (
        <Tag className={cn("p-6 md:p-8", tone === "navy" ? "bg-navy" : "bg-white", className)}>
            {children}
        </Tag>
    );
}

/**
 * The seam between two bands.
 *
 * Rather than cutting from one background straight to the next, a seam carries
 * one line of real content across the boundary — a figure, a credential, a
 * next step. It gives the transition somewhere to land and turns what was dead
 * space at the join into the most scannable strip on the page.
 */
export function Seam({
    items,
    tone = "white",
}: {
    items: readonly { label: string; value: ReactNode }[];
    tone?: Tone;
}) {
    return (
        <div className={cn("relative", TONE[tone])}>
            <div className="mx-auto max-w-shell px-gutter">
                <dl
                    className={cn(
                        "grid grid-cols-2 gap-px border-y md:grid-cols-4",
                        RULE[tone],
                        tone === "navy" ? "bg-cream/14" : "bg-navy/12"
                    )}
                >
                    {items.map((item, i) => (
                        <Reveal
                            key={item.label}
                            variant="row"
                            index={i}
                            className={cn("px-5 py-7 md:px-7", tone === "navy" ? "bg-navy" : "bg-white")}
                        >
                            <dt
                                className={cn(
                                    "label",
                                    tone === "navy" ? "text-cream/40" : "text-navy-400"
                                )}
                            >
                                {item.label}
                            </dt>
                            <dd
                                className={cn(
                                    "mt-3 font-display text-d-item tabular",
                                    tone === "navy" ? "text-cream" : "text-ink"
                                )}
                            >
                                {item.value}
                            </dd>
                        </Reveal>
                    ))}
                </dl>
            </div>
        </div>
    );
}
