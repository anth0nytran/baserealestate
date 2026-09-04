import { cn } from "@/lib/utils";
import { editorialPhoto, type EditorialName } from "@/config/site";
import Reveal from "./Reveal";

/**
 * An editorial photograph set into a band's head column.
 *
 * These are the quiet frames between the headline photographs — an entry
 * hall, a kitchen counter, water seen from above. They carry no caption and
 * make no claim about a place, so they are chosen on tone alone and must
 * never be labelled with a city name.
 *
 * The gold rule is rendered as an absolutely-positioned sibling *before* the
 * image rather than behind it with a negative z-index. A negative z-index
 * escapes the local stacking context and the offset frame disappears under
 * the band background — which is exactly how the portrait frame broke the
 * first time it was built.
 */
export function Plate({
    name,
    aspect = "portrait",
    className,
}: {
    name: EditorialName;
    /** Portrait suits a narrow head column; wide suits a full-width slot. */
    aspect?: "portrait" | "square" | "wide";
    className?: string;
}) {
    const photo = editorialPhoto(name);

    return (
        <Reveal variant="frame" className={cn("mt-12", className)}>
            <figure className="relative">
                <span
                    aria-hidden="true"
                    className="absolute -bottom-2.5 -right-2.5 h-full w-full border border-gold/40"
                />
                <img
                    src={photo.src}
                    srcSet={photo.srcSet}
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                        "relative w-full object-cover",
                        aspect === "portrait" && "aspect-[4/5]",
                        aspect === "square" && "aspect-square",
                        aspect === "wide" && "aspect-[16/10]"
                    )}
                />
            </figure>
        </Reveal>
    );
}
