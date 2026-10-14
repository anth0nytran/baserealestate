import { BRAND, LICENSE } from "@/config/site";
import { brandify } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** The brand's full name, backward S included. */
export function BrandName({ legal = false }: { legal?: boolean }) {
    return <>{brandify(legal ? BRAND.legalName : BRAND.name)}</>;
}

/**
 * The responsible brokerage's logo, at 1em tall.
 *
 * Falls back to the name set as text if the artwork is switched off, and to
 * nothing at all until the brokerage is confirmed — a guessed broker on a
 * licensee's site is worse than none.
 */
export function BrokerageMark({ tone, className }: { tone: "navy" | "cream"; className?: string }) {
    const { brokerage } = LICENSE;
    if (!brokerage.confirmed) return null;
    if (!brokerage.showMark) return <span className={className}>{brokerage.name}</span>;
    return (
        <img
            src={brokerage.mark[tone]}
            alt={brokerage.name}
            width={brokerage.mark.width}
            height={brokerage.mark.height}
            className={cn("h-[1em] w-auto object-contain", className)}
        />
    );
}

/**
 * "Brokered by [Nest]" — set beside Sam's name and the Base mark wherever the
 * site identifies him, so nobody reads Base Real Estate Group as a brokerage.
 * Size it with a font-size on the parent; the logo is 1em tall.
 */
export function BrokeredBy({ tone, className }: { tone: "navy" | "cream"; className?: string }) {
    if (!LICENSE.brokerage.confirmed) return null;
    return (
        <span className={cn("inline-flex items-center gap-[0.7em] leading-none", className)}>
            <span
                className={cn(
                    "whitespace-nowrap font-sans text-[0.42em] font-medium uppercase tracking-[0.24em]",
                    tone === "cream" ? "text-cream/55" : "text-navy/55"
                )}
            >
                Brokered by
            </span>
            <BrokerageMark tone={tone} />
        </span>
    );
}
