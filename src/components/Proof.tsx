import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import { Band } from "./Section";
import { BrandName } from "./Brand";
import { cn } from "../lib/utils";
import { AGENT, CLOSINGS, PRIMARY_CTA, PROOF, PROOF_SOURCE, REVIEWS, STATS } from "../config/site";
import { trackCtaClick } from "../lib/analytics";

/* ==========================================================================
   Proof

   Real reviews when the client supplies them; an honest "not yet" otherwise.
   Never a fabricated quote, rating, or sale count — see PROOF in
   src/config/site.ts.
   ========================================================================== */

export default function Proof() {
    const [index, setIndex] = useState(0);

    if (!PROOF.hasReviews || REVIEWS.length === 0) {
        return (
            <Band tone="navy" density="md" rule={false}>
                <Reveal className="mx-auto max-w-3xl py-6 text-center">
                    <h2 className="font-display text-d-section text-cream">
                        Reviews are being collected, and will appear here{" "}
                        <em className="italic text-gold-300">in clients’ own words</em>.
                    </h2>
                    <p className="mx-auto mt-8 max-w-measure-lg text-body font-light text-cream/55">
                        Nothing goes on this page until a real client has said it, with a name attached. If you would
                        like to speak with a past client before you decide, ask {AGENT.firstName} and he will connect
                        you.
                    </p>
                    <div className="mt-12">
                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick("Ask for a reference", "proof-empty")}
                            className="btn-outline-light"
                        >
                            {PRIMARY_CTA.label}
                            <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
                        </Link>
                    </div>
                </Reveal>
            </Band>
        );
    }

    const review = REVIEWS[index];

    return (
        <Band tone="navy" density="sm" rule={false}>
            {/*
             * Two columns, not one stacked column.
             *
             * Run vertically — a display-size pull quote, then a stat row, then
             * a five-row sale list — this band was about 1,800px of unbroken
             * navy, and a reader scrolling it had no idea when it would end.
             * Side by side it is one panel: testimony on the left, the record
             * on the right, both legible in a single screen. The quote also
             * drops a size, because at `d-section` a three-line quote sets the
             * height of everything beside it.
             */}
            <div className="grid gap-14 py-10 lg:grid-cols-12 lg:gap-16 lg:py-14">
                {/* ---------------------------------------- Testimony */}
                <div className="lg:col-span-5">
                    <p className="label mb-8 text-cream/35">In clients’ own words</p>

                    {/*
                     * min-height holds the column while quotes of different
                     * lengths swap through it. Without it the stat grid beside
                     * this jumps every time a reader changes the slide.
                     */}
                    <div className="flex min-h-[15rem] flex-col justify-start sm:min-h-[13rem]">
                        <AnimatePresence mode="wait">
                            <motion.blockquote
                                key={index}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <p className="font-display text-d-block italic leading-[1.4] text-cream">
                                    “{review.quote}”
                                </p>
                                <footer className="mt-7">
                                    <span className="mb-4 block h-px w-8 bg-gold" aria-hidden="true" />
                                    <cite className="block text-body-sm font-normal not-italic text-cream">
                                        {review.name}
                                    </cite>
                                    <span className="label mt-1.5 block text-cream/40">{review.detail}</span>
                                </footer>
                            </motion.blockquote>
                        </AnimatePresence>
                    </div>

                    {REVIEWS.length > 1 && (
                        <div className="mt-8 flex items-center gap-2">
                            {REVIEWS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    aria-label={`Show review ${i + 1}`}
                                    className={cn(
                                        "h-px transition-all duration-view ease-brand",
                                        i === index ? "w-10 bg-gold" : "w-4 bg-cream/25 hover:bg-cream/50"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ------------------------------------------- Record */}
                <div className="lg:col-span-7 lg:border-l lg:border-cream/12 lg:pl-16">
                    {PROOF.hasStats && STATS.length > 0 && (
                        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
                            {STATS.map((stat) => (
                                <div key={stat.label}>
                                    <dd className="tabular font-display text-d-item leading-none text-cream">
                                        {stat.value}
                                    </dd>
                                    <dt className="label mt-2.5 block leading-[1.5] text-cream/40">{stat.label}</dt>
                                </div>
                            ))}
                        </dl>
                    )}

                    {PROOF.hasSales && CLOSINGS.length > 0 && <Closings />}

                    {/*
                     * The figures above are only worth anything if a reader can
                     * go and check them, so the link out is part of the proof,
                     * not a footnote.
                     */}
                    <p className="mt-8 text-micro font-light leading-[1.8] text-cream/45">
                        Reviews and closings as published on{" "}
                        <a
                            href={PROOF_SOURCE.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-b border-cream/25 pb-0.5 text-cream/70 transition-colors hover:border-gold hover:text-gold-300"
                        >
                            {AGENT.firstName}’s {PROOF_SOURCE.label} profile
                        </a>
                        , read {PROOF_SOURCE.verifiedLabel}. Average price and volume are calculated by <BrandName />{" "}
                        from the five closings listed.
                    </p>
                </div>
            </div>
        </Band>
    );
}

/* ==========================================================================
   Closings

   A sale list is the one proof surface that cannot be written by anyone —
   each row is an address a reader can put into Zillow or the county recorder
   and check in under a minute. Three of the five are outside the coastal
   focus this site leads with; they stay, because editing the record down to
   the flattering half is the thing this page is arguing against.
   ========================================================================== */

const Closings = () => (
    <div className="mt-12">
        <div className="mb-5 flex items-baseline justify-between gap-6">
            <h3 className="label text-cream/35">Recent closings</h3>
            <span className="label text-cream/35">All buyer-side</span>
        </div>

        <ol className="border-t border-cream/12">
            {CLOSINGS.map((sale) => (
                <li
                    key={sale.address}
                    className="flex flex-col gap-1 border-b border-cream/12 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                    <span className="min-w-0">
                        <span className="block text-body-sm font-light text-cream">
                            {sale.address}, {sale.city}
                        </span>
                        <span className="mt-0.5 block text-micro font-light text-cream/45">
                            {sale.spec} · Closed {sale.closed}
                        </span>
                    </span>
                    <span className="tabular shrink-0 text-body-sm font-light text-gold-300">{sale.price}</span>
                </li>
            ))}
        </ol>
    </div>
);
