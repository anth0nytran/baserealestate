import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { CONTACT, PRIMARY_CTA, propertyPhoto } from "../config/site";
import { trackCtaClick, trackPhoneClick } from "../lib/analytics";

/* ==========================================================================
   Closing
   ========================================================================== */

export default function ClosingCTA({
    source = "closing-cta",
    service,
    photo = "cta",
}: {
    source?: string;
    /** Base name for propertyPhoto() — each page gets its own frame. */
    photo?: string;
    /** Prefills the contact form's service select. */
    service?: string;
}) {
    return (
        <section className="on-navy relative overflow-hidden bg-navy">
            <img
                {...propertyPhoto(photo)}
                sizes="100vw"
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/55 to-navy/85" />

            <div className="relative z-10 mx-auto max-w-shell px-gutter py-sec-lg">
                <Reveal className="max-w-3xl">
                    <h2 className="font-display text-d-page text-cream">Start with a conversation.</h2>
                    <p className="mb-12 mt-8 max-w-measure-lg text-lead font-light text-cream/70">
                        {PRIMARY_CTA.promise} Bring your questions — the harder the better.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link
                            to={service ? `${PRIMARY_CTA.href}?service=${service}` : PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, source)}
                            className="btn-cream group"
                        >
                            {PRIMARY_CTA.label}
                            <ArrowRight
                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                strokeWidth={1.25}
                            />
                        </Link>
                        <a
                            href={`tel:${CONTACT.phoneHref}`}
                            onClick={() => trackPhoneClick(source)}
                            className="btn-outline-light"
                        >
                            {CONTACT.phone}
                        </a>
                    </div>

                    <p className="label mt-10 text-cream/35">
                        {CONTACT.hours} · {CONTACT.hoursNote}
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
