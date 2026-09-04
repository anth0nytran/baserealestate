import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO, { SITE_URL } from "../hooks/useSEO";
import { Plate } from "@/components/Plate";
import Reveal, { HeadlineDraw } from "../components/Reveal";
import { Band, BandHead, Seam } from "../components/Section";
import { cn } from "../lib/utils";
import {
    AGENT,
    AREA,
    BRAND,
    CONTACT,
    MARKET,
    PRIMARY_CTA,
    PROCESS,
    propertyPhoto,
    SERVICES,
} from "../config/site";
import { trackCtaClick, trackPhoneClick } from "../lib/analytics";

/* ==========================================================================
   Answer-engine content

   These are the transactional questions — cost, timing, mechanics. The
   homepage owns the entity questions ("who is Sam", "what areas"). Splitting
   them that way stops the two FAQPage blocks from competing for the same
   query, and gives each page a distinct set of answers to be cited for.

   This array is the single source for both the visible section and the
   FAQPage schema, so the two cannot drift apart.
   ========================================================================== */

const FAQS = [
    {
        q: "What actually happens in the first consultation?",
        a: `It is a conversation, not a presentation. ${AGENT.firstName} asks what you own, what you want, and what is worrying you, then walks you through how the transaction ahead of you actually works — financing, contingencies, costs, and timeline. Nothing is decided in that meeting, and there is no obligation to work together afterwards.`,
    },
    {
        q: "Do I have to be ready to buy or sell to book a consultation?",
        a: "No. A large share of these conversations are with people six to eighteen months out, or people deciding whether to move at all. Knowledge transfer is the first service on this list for exactly that reason — understanding the market is useful whether or not you transact.",
    },
    {
        q: "What does it cost to work with a buyer's agent in California?",
        a: `Buyer representation compensation is negotiable and must be agreed in writing before ${AGENT.firstName} shows you a property — that has been the rule nationally since August 2024. Depending on the transaction it may be offered by the seller, negotiated into the deal, or paid directly by the buyer. ${AGENT.firstName} walks through the specific numbers for your situation during the consultation, before you commit to anything.`,
    },
    {
        q: "Which parts of Orange County does Sam cover?",
        a: `The practice is weighted to ${AREA.focusLabel}: ${AREA.focus.map((c) => c.name).join(", ")}. ${AGENT.firstName} also works ${AREA.cities.filter((c) => !AREA.focus.some((f) => f.slug === c.slug)).map((c) => c.name).join(", ")}, and throughout the rest of the county including ${AREA.alsoServing.slice(0, 4).join(", ")}.`,
    },
    {
        q: "How is real estate consulting different from having you list my home?",
        a: "Consulting is advice with nothing attached to it. If you want to know whether to sell now, hold, refinance, or renovate first, Sam works through the numbers on your specific property and tells you what he would do — including when the answer is to do nothing this year. A listing is one possible outcome of that conversation, not its purpose.",
    },
    {
        q: "What do you need from me to help with an investment purchase?",
        a: "Your target return, your capital position, and your time horizon. From there Sam models cash flow, carrying cost, and exit before anyone tours a property, so the ones you see have already survived the math.",
    },
    {
        q: "How quickly will I hear back?",
        a: `${AGENT.firstName} works ${CONTACT.hours}, with after-hours availability by appointment. Enquiries sent through this site are answered the same business day wherever possible.`,
    },
];

/*
 * The decision table.
 *
 * A named citation-magnet format: an answer engine asked "should I talk to an
 * agent before I'm ready to buy" can lift a single row and attribute it. It is
 * also the fastest way for a visitor to self-select, which is what the page is
 * actually for.
 */
const DECISION_ROWS = [
    {
        situation: "I do not understand how any of this works yet",
        service: "Knowledge Transfer",
        id: "knowledge",
        outcome: "You can explain the transaction to someone else",
    },
    {
        situation: "I own a home and cannot decide whether to sell",
        service: "Real Estate Consulting",
        id: "consulting",
        outcome: "A hold / sell / wait recommendation, with the reasoning shown",
    },
    {
        situation: "I am ready to buy and want to compete properly",
        service: "Home Purchase",
        id: "buying",
        outcome: "Offer strategy, negotiation, and guidance through escrow",
    },
    {
        situation: "I need to sell and want the contract price to survive",
        service: "Home Sale",
        id: "selling",
        outcome: "Evidence-based pricing, preparation, and negotiation",
    },
    {
        situation: "I want the numbers to work before I look at anything",
        service: "Investor Assistance",
        id: "investing",
        outcome: "Cash-flow, carrying-cost, and exit modelling first",
    },
];

/* ========================================================================== */

const Hero = () => (
    <section className="on-navy relative overflow-hidden bg-navy">
        <img
            {...propertyPhoto("hero")}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        {/* Opacities must be multiples of five — see the note in Home.tsx. */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/45" />

        <div className="relative z-10 mx-auto max-w-shell px-gutter pb-sec-md pt-44 md:pt-52">
            <div className="max-w-3xl">
                <h1 className="mb-8 font-display text-d-page text-cream">
                    <HeadlineDraw delay={100}>Five ways to work with</HeadlineDraw>{" "}
                    <HeadlineDraw delay={380} className="italic text-gold-300">
                        {AGENT.firstName}.
                    </HeadlineDraw>
                </h1>

                {/* Answer-first block: what this page is, in under 55 words. */}
                <p className="max-w-measure-lg text-lead font-light text-cream/80">
                    {BRAND.name} offers knowledge transfer, real estate consulting, home purchase and sale
                    representation, and investor assistance across {AREA.focusLabel}. They are listed in the order{" "}
                    {AGENT.firstName} believes they should happen — most clients start at the top and never think about
                    the rest until they are ready.
                </p>
            </div>
        </div>
    </section>
);

/* ========================================================================== */

const ServiceSection = ({ service, index }: { service: (typeof SERVICES)[number]; index: number }) => {
    const flipped = index % 2 === 1;

    return (
        <Band tone={flipped ? "cream" : "white"} density="sm" id={service.id} rule={index > 0}>
            <div className="grid grid-cols-1 items-center gap-10 pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-14">
                <Reveal
                    variant="frame"
                    className={cn("lg:col-span-6", flipped ? "lg:order-2 lg:col-start-7" : "")}
                >
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                            {...propertyPhoto(service.photo)}
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            alt={`${service.name} — ${BRAND.name}, ${AREA.primaryFull}`}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                </Reveal>

                <Reveal className={cn("lg:col-span-5", flipped ? "lg:order-1 lg:col-start-1" : "lg:col-start-8")}>
                    <h2 className="font-display text-d-section text-ink">{service.name}</h2>
                    <p className="mt-3 text-body-sm font-normal text-gold-600">{service.short}</p>

                    <p className="mt-8 max-w-measure-lg text-body font-light text-navy-600">{service.blurb}</p>

                    <ul className="mt-9 space-y-4 border-t border-navy/12 pt-8">
                        {service.includes.map((item) => (
                            <li key={item} className="flex items-start gap-4 text-body-sm font-light text-ink">
                                <span className="mt-[0.72em] block h-px w-5 flex-shrink-0 bg-gold" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Link
                        to={`${PRIMARY_CTA.href}?service=${service.value}`}
                        onClick={() => trackCtaClick(`Enquire — ${service.name}`, "service-detail")}
                        className="link-rule label mt-10"
                    >
                        Start with {service.name.toLowerCase()}
                        <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                    </Link>
                </Reveal>
            </div>
        </Band>
    );
};

/* ========================================================================== */

export default function Services() {
    return (
        <div className="w-full overflow-x-hidden">
            <SEO
                title="Real Estate Services in Orange County"
                description={`Knowledge transfer, real estate consulting, home purchase and sale representation, and investor assistance across ${AREA.focusLabel} with ${AGENT.displayName}, ${AGENT.title}. Book a no-pressure consultation.`}
                path="/services"
                breadcrumbs={[{ name: "Services", path: "/services" }]}
                faqs={FAQS}
            />

            {/*
             * One Service entity per offering, each naming its provider and the
             * area it is offered in. The site-wide graph in index.html declares
             * the OfferCatalog; this declares the services themselves so an
             * answer engine can resolve "who offers X in Y" directly.
             */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": SERVICES.map((service) => ({
                            "@type": "Service",
                            "@id": `${SITE_URL}/services#${service.id}`,
                            name: service.name,
                            serviceType: service.name,
                            description: service.blurb,
                            provider: { "@id": `${SITE_URL}/#real-estate-agent` },
                            areaServed: [
                                { "@type": "AdministrativeArea", name: "Orange County, CA" },
                                ...AREA.focus.map((city) => ({ "@type": "City", name: city.name })),
                            ],
                            audience: { "@type": "Audience", audienceType: "Home buyers, sellers, and investors" },
                            offers: {
                                "@type": "Offer",
                                availability: "https://schema.org/InStock",
                                priceSpecification: {
                                    "@type": "PriceSpecification",
                                    description:
                                        "Initial consultation provided at no cost. Representation compensation is negotiable and agreed in writing before representation begins.",
                                },
                            },
                        })),
                    })}
                </script>
            </Helmet>

            <Hero />

            <Seam
                items={[
                    { label: "Services", value: String(SERVICES.length) },
                    { label: "Consultation", value: "No cost" },
                    { label: "Focus", value: "South OC & the coast" },
                    { label: "Response", value: "Same business day" },
                ]}
            />

            {/* --------------------------------------------- Decision table */}
            <Band tone="white" density="md" rule={false}>
                <BandHead
                    heading="Which one do you need?"
                    lede="Find the row that sounds like you. Most people start at the top of this table, not the bottom."
                    aside={<Plate name="living" />}
                    foot={
                        <p className="text-body-sm font-light text-navy-500">
                            Not sure? That is what the consultation is for, and it is the first row.
                        </p>
                    }
                >
                    <Reveal>
                        <div className="overflow-x-auto border border-navy/12">
                            <table className="w-full min-w-[40rem] border-collapse text-left">
                                <caption className="sr-only">
                                    Choosing a service at {BRAND.name} by client situation
                                </caption>
                                <thead className="bg-navy text-cream">
                                    <tr>
                                        <th scope="col" className="label p-4">
                                            If this sounds like you
                                        </th>
                                        <th scope="col" className="label p-4">
                                            Start with
                                        </th>
                                        <th scope="col" className="label p-4">
                                            What you leave with
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DECISION_ROWS.map((row) => (
                                        <tr key={row.id} className="border-t border-navy/10 bg-white align-top">
                                            <th
                                                scope="row"
                                                className="p-4 text-body-sm font-light text-navy-600"
                                            >
                                                {row.situation}
                                            </th>
                                            <td className="p-4">
                                                <a
                                                    href={`#${row.id}`}
                                                    className="font-display text-d-item text-ink underline decoration-gold underline-offset-4"
                                                >
                                                    {row.service}
                                                </a>
                                            </td>
                                            <td className="p-4 text-body-sm font-light text-navy-600">
                                                {row.outcome}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Reveal>
                </BandHead>
            </Band>

            {SERVICES.map((service, i) => (
                <ServiceSection key={service.id} service={service} index={i} />
            ))}

            {/* ------------------------------------------------------ Process */}
            <Band tone="navy" density="md" id="process">
                <BandHead
                    tone="navy"
                    layout="stacked"
                    heading="How a working relationship runs."
                    lede="Five stages, in order. Nothing is decided in the first, and nothing is rushed in the last."
                >
                    <ol className="grid grid-cols-1 gap-px bg-cream/14 md:grid-cols-2 lg:grid-cols-5">
                        {PROCESS.map((step, i) => (
                            <Reveal key={step.step} variant="row" index={i} as="li" className="bg-navy p-6 md:p-7">
                                <span className="tabular mb-6 block font-display text-d-item text-gold">
                                    {step.step}
                                </span>
                                <h3 className="font-display text-d-item leading-tight text-cream">{step.title}</h3>
                                <p className="mt-4 text-body-sm font-light text-cream/60">{step.body}</p>
                            </Reveal>
                        ))}
                    </ol>
                </BandHead>
            </Band>

            {/* --------------------------------------------------------- FAQ */}
            <Band tone="cream" density="md" id="faq">
                <BandHead
                    tone="cream"
                    heading="Asked and answered."
                    lede="If yours is not here, it is a good first question for the consultation."
                    aside={<Plate name="kitchen" />}
                    foot={
                        <div className="space-y-3">
                            <a
                                href={`tel:${CONTACT.phoneHref}`}
                                onClick={() => trackPhoneClick("services-faq")}
                                className="block font-display text-d-item text-ink transition-colors hover:text-gold-600"
                            >
                                {CONTACT.phone}
                            </a>
                            <p className="label text-navy-400">{CONTACT.hours}</p>
                        </div>
                    }
                >
                    {/*
                     * Answers are always in the DOM and visible — no accordion.
                     * The prerendered document carries every answer in full for
                     * crawlers and answer engines that never click anything.
                     */}
                    <dl>
                        {FAQS.map((faq, i) => (
                            <Reveal
                                key={faq.q}
                                variant="row"
                                index={i}
                                className={cn("py-8", i > 0 && "border-t border-navy/12")}
                            >
                                <dt className="font-display text-d-block leading-snug text-ink">{faq.q}</dt>
                                <dd className="mt-4 max-w-measure-lg text-body-sm font-light text-navy-600">{faq.a}</dd>
                            </Reveal>
                        ))}
                    </dl>
                </BandHead>
            </Band>

            {/* Market context carries the reader out of the FAQ. */}
            <Seam
                tone="cream"
                items={[
                    { label: MARKET.conditions[0].label, value: MARKET.conditions[0].value },
                    { label: MARKET.conditions[1].label, value: MARKET.conditions[1].value },
                    { label: MARKET.conditions[2].label, value: MARKET.conditions[2].value },
                    { label: "Figures verified", value: MARKET.verifiedOn },
                ]}
            />

            {/* ------------------------------------------------------ Closing */}
            <Band tone="cream" density="md" rule={false}>
                <Reveal className="max-w-3xl py-6">
                    <h2 className="font-display text-d-section text-ink">Bring the hard questions.</h2>
                    <p className="mb-11 mt-8 max-w-measure-lg text-lead font-light text-navy-600">
                        {PRIMARY_CTA.promise}
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, "services-closing")}
                            className="btn-primary group"
                        >
                            {PRIMARY_CTA.label}
                            <ArrowRight
                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                strokeWidth={1.25}
                            />
                        </Link>
                        <a
                            href={`tel:${CONTACT.phoneHref}`}
                            onClick={() => trackPhoneClick("services-closing")}
                            className="btn-outline"
                        >
                            {CONTACT.phone}
                        </a>
                    </div>
                </Reveal>
            </Band>
        </div>
    );
}
