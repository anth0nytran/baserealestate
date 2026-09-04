import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import SEO from "../hooks/useSEO";
import { Plate } from "@/components/Plate";
import Reveal, { HeadlineDraw } from "../components/Reveal";
import { Band, BandHead, Cell, CellGrid, Seam } from "../components/Section";
import { cn } from "../lib/utils";
import {
    AGENT,
    AREA,
    BRAND,
    CONTACT,
    LICENSE,
    MARKET,
    PHOTOGRAPHED_CITIES,
    PRIMARY_CTA,
    PROCESS,
    PROMISES,
    PROOF,
    propertyPhoto,
    REVIEWS,
    SERVICES,
    STATS,
} from "../config/site";
import { trackCtaClick, trackPhoneClick } from "../lib/analytics";

/* ==========================================================================
   Answer-engine content

   FAQs here are deliberately different from the ones on /services: these are
   entity and market questions ("who is", "what areas", "why do prices
   differ"), which is what an AI engine resolves when someone asks about a
   person or a place. The service page owns the transactional questions.

   This array is the single source for both the visible section and the
   FAQPage schema, so the two cannot drift apart.
   ========================================================================== */

const otherCities = AREA.cities.filter((c) => !AREA.focus.some((f) => f.slug === c.slug));

const FAQS = [
    {
        q: "Who is Sam Elsherif?",
        a: `Bassam "Sam" Elsherif is a REALTOR® and the founder of ${BRAND.name}, working with home buyers, sellers, and investors in ${AREA.focusLabel}. His practice is built around knowledge transfer: explaining how a transaction actually works before a client commits to one.`,
    },
    {
        q: "What areas of Orange County does Base Real Estate serve?",
        a: `The practice is weighted to ${AREA.focusLabel} — ${AREA.focus.map((c) => c.name).join(", ")} — along with ${otherCities.map((c) => c.name).join(", ")}. ${AGENT.firstName} also works throughout the rest of Orange County, including ${AREA.alsoServing.join(", ")}.`,
    },
    {
        q: "What does a consultation with Sam cost?",
        a: "Nothing, and it carries no obligation to transact. The consultation is a working conversation about your situation and how the transaction in front of you operates. A large share of these are with people who are six to eighteen months out, or who are still deciding whether to move at all.",
    },
    {
        q: "Why do Orange County median home prices differ depending on where I look?",
        a: `Because the sources count different things. The California Association of REALTORS® reported a ${MARKET.medians[0].value} median for ${MARKET.medians[0].observed}, but that figure counts existing detached single-family homes only. Redfin reported roughly ${MARKET.medians[1].value.replace("≈", "")} for ${MARKET.medians[1].observed} counting every property type, condos and townhomes included, which pulls the median down. The two are about ${MARKET.medianGap.replace("≈", "")} apart and neither is wrong.`,
    },
    {
        q: "Does Sam work with first-time home buyers?",
        a: "Yes, and they are a large part of the practice. First-time buyers benefit most from the knowledge-transfer approach, because the parts of a transaction that cost people money — contingency deadlines, appraisal gaps, what is actually negotiable — are the parts nobody explains until they matter.",
    },
    {
        q: "How is this different from working with a typical real estate agent?",
        a: "The order of operations. Most agents begin by showing property; Sam begins by making sure you understand financing, contingencies, timelines, and cost well enough to explain them to someone else. Whether you then transact — and whether you transact this year at all — is treated as a separate and genuinely open question.",
    },
];

/* ==========================================================================
   Hero
   ========================================================================== */

const heroImage = (slug: string, size: "1600" | "2560") => `/neighborhoods/hero/${slug}-${size}.webp`;

/* Only photographed cities rotate — a slide captioned with a city it does not
   depict is a false claim about a place. */
const HERO_SLIDES = PHOTOGRAPHED_CITIES.map((city) => ({
    label: city.name,
    src: heroImage(city.photo!, "2560"),
    srcSet: `${heroImage(city.photo!, "1600")} 1600w, ${heroImage(city.photo!, "2560")} 2560w`,
}));

const Hero = () => {
    const [index, setIndex] = useState(0);
    const advance = useCallback(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), []);

    useEffect(() => {
        const timer = setTimeout(advance, 7000);
        return () => clearTimeout(timer);
    }, [index, advance]);

    const slide = HERO_SLIDES[index];

    return (
        <section className="on-navy relative flex min-h-[100svh] items-end overflow-hidden bg-navy">
            <AnimatePresence initial={false}>
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{
                        opacity: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 9, ease: "linear" },
                    }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={slide.src}
                        srcSet={slide.srcSet}
                        sizes="100vw"
                        alt={`${slide.label}, Orange County, California`}
                        className="h-full w-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/*
             * Every opacity here is a multiple of five, and that is a hard
             * constraint rather than a preference. Tailwind emits only the
             * opacity steps in its scale, so `from-navy/96` compiles to
             * nothing at all — and a gradient whose `from` stop is missing
             * resolves to `background-image: none`, removing the entire scrim
             * rather than merely weakening it. Nothing warns you; the text
             * simply ends up sitting on bare photograph.
             *
             * Stop *positions* follow the same scale (`via-40%`, not
             * `via-42%`) but fail more gently — an invalid position drops
             * just that stop and leaves the gradient standing, which is
             * exactly why it is easy to miss.
             */
            /*
             * The scrim carries the headline, so it is tuned to the darkest
             * thing behind the text rather than to the photograph as a whole.
             *
             * These stops were originally set against dusk photography, where
             * the frames were already dark and a light veil was enough. The
             * photography is now shot in daylight — bright sky, pale sand, a
             * white resort directly behind the second line — and the old
             * values left the gold line sitting on near-white at the middle of
             * the ramp. The `via` stop is held high and pushed past the
             * headline's right edge for that reason; anything softer reads as
             * elegant right up until a slide with a bright centre arrives.
             */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-navy/95 via-navy/80 via-55% to-navy/25" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-navy/90 via-navy/10 to-navy/45" />

            <div className="relative z-10 mx-auto w-full max-w-shell px-gutter pb-sec-sm pt-40">
                <div className="max-w-3xl">
                    {/*
                     * The authored moment: a gold hairline sweeps across and
                     * the line resolves behind it. Runs once, above the fold,
                     * and nothing else on the site moves like it.
                     */}
                    <h1 className="mb-8 font-display text-d-hero text-cream [text-shadow:0_2px_40px_rgba(17,28,44,0.45)]">
                        <HeadlineDraw delay={120}>Orange County real estate,</HeadlineDraw>{" "}
                        <HeadlineDraw delay={420} className="italic text-gold-300">
                            explained first.
                        </HeadlineDraw>
                    </h1>

                    {/*
                     * Snippet target: entity + credential + place + service in
                     * the opening sentence. This is the paragraph an answer
                     * engine lifts when asked who Sam is.
                     */}
                    <p className="mb-12 max-w-measure-lg text-lead font-light text-cream/80 [text-shadow:0_1px_24px_rgba(17,28,44,0.55)]">
                        <strong className="font-normal text-cream">{AGENT.displayName}</strong> is a {AGENT.title} in{" "}
                        {AREA.primaryFull}, specialising in {AREA.focusLabel} —{" "}
                        {AREA.focus.map((c) => c.name).join(", ")}. He works with buyers, sellers, and investors, and
                        starts every engagement by making sure you understand the transaction before you commit to one.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, "hero")}
                            className="btn-cream group"
                        >
                            {PRIMARY_CTA.label}
                            <ArrowRight
                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                strokeWidth={1.25}
                            />
                        </Link>
                        <Link
                            to="/services"
                            onClick={() => trackCtaClick("How Sam Works", "hero")}
                            className="btn-outline-light"
                        >
                            How {AGENT.firstName} works
                        </Link>
                    </div>
                </div>
            </div>

            {/* Rotating city label — quiet counterweight, bottom right. */}
            <div className="absolute bottom-16 right-gutter z-10 hidden items-center gap-4 sm:flex">
                <span className="block h-px w-8 bg-gold-400/60" aria-hidden="true" />
                <div className="relative h-4 overflow-hidden">
                    <AnimatePresence initial={false} mode="wait">
                        <motion.span
                            key={slide.label}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -14 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="label block whitespace-nowrap text-cream/70"
                        >
                            {slide.label}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            <div className="absolute bottom-6 left-gutter z-10 flex items-center gap-2">
                {HERO_SLIDES.map((s, i) => (
                    <button
                        key={s.label}
                        onClick={() => setIndex(i)}
                        aria-label={`Show ${s.label}`}
                        className={cn(
                            "h-px transition-all duration-view ease-brand",
                            i === index ? "w-10 bg-gold-400" : "w-4 bg-cream/25 hover:bg-cream/50"
                        )}
                    />
                ))}
            </div>
        </section>
    );
};

/* ==========================================================================
   Page
   ========================================================================== */

export default function Home() {
    return (
        <div className="w-full overflow-x-hidden">
            <SEO
                title={`Orange County Real Estate Agent — ${AGENT.shortDisplayName}, REALTOR® | ${BRAND.name}`}
                description={`${AGENT.displayName} is a REALTOR® specialising in ${AREA.focusLabel}: ${AREA.focus.map((c) => c.name).join(", ")}. Knowledge transfer, consulting, home purchase and sale, investor assistance. Book a no-pressure consultation.`}
                path="/"
                faqs={FAQS}
            />

            {/* LCP hint for the first hero slide. Scoped to this route so other
                pages don't download an image they never render. */}
            <Helmet>
                <link
                    rel="preload"
                    as="image"
                    type="image/webp"
                    href={HERO_SLIDES[0].src}
                    imageSrcSet={HERO_SLIDES[0].srcSet}
                    imageSizes="100vw"
                />
            </Helmet>

            <Hero />

            {/* The join under the hero carries the four facts a visitor and an
                answer engine both want first. */}
            <Seam
                items={[
                    { label: "Credential", value: LICENSE.dreConfirmed ? `CA ${LICENSE.dreLicense}` : AGENT.title },
                    { label: "Focus", value: "South OC & the coast" },
                    { label: "Consultation", value: "No cost, no obligation" },
                    { label: "Hours", value: CONTACT.hours },
                ]}
            />

            {/* ---------------------------------------------------- The offer */}
            <Band tone="white" density="md" rule={false}>
                <BandHead
                    heading={
                        <>
                            A consultation that <em className="italic text-gold-600">teaches</em>, not sells.
                        </>
                    }
                    aside={<Plate name="entry" />}
                >
                    <p className="max-w-measure-lg text-lead font-light text-navy-600">
                        Most people make the largest financial decision of their life having never been taught how it
                        works. {AGENT.firstName} starts everywhere else — with the mechanics. Financing, contingencies,
                        timelines, what things actually cost, and where deals quietly go wrong.
                    </p>
                    <p className="mt-7 max-w-measure-lg text-lead font-light text-navy-600">
                        By the end you can explain the transaction to someone else. That is the point. Whether you then
                        work with {AGENT.firstName} is a separate question, and an honest one.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-navy/12 pt-8">
                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, "offer")}
                            className="link-rule label"
                        >
                            {PRIMARY_CTA.label}
                            <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                        </Link>
                        <a
                            href={`tel:${CONTACT.phoneHref}`}
                            onClick={() => trackPhoneClick("offer")}
                            className="label text-navy-400 transition-colors hover:text-ink"
                        >
                            Or call {CONTACT.phone}
                        </a>
                    </div>
                </BandHead>
            </Band>

            {/* --------------------------------------------- The two medians */}
            <Band tone="cream" density="md" id="market">
                <BandHead
                    tone="cream"
                    heading="Why you will see two different median prices for Orange County."
                    lede={
                        <>
                            Search the median home price here and you will get answers roughly{" "}
                            <strong className="font-normal text-ink">{MARKET.medianGap}</strong> apart. Neither is
                            wrong. They count different things, and almost nobody says so.
                        </>
                    }
                    aside={
                        <p className="mt-5 max-w-measure text-body-sm font-light text-navy-500">
                            This is the kind of thing {AGENT.firstName} walks through in a first consultation — not
                            because it is clever, but because a buyer who budgets off the wrong median is off by a down
                            payment.
                        </p>
                    }
                >
                    <Reveal>
                        <div className="overflow-x-auto border border-navy/12 bg-white">
                            <table className="w-full min-w-[34rem] border-collapse text-left">
                                <caption className="sr-only">
                                    Orange County median home price by source and methodology, {MARKET.asOf}
                                </caption>
                                <thead className="bg-navy text-cream">
                                    <tr>
                                        <th scope="col" className="label p-4">
                                            What is counted
                                        </th>
                                        <th scope="col" className="label p-4">
                                            Median
                                        </th>
                                        <th scope="col" className="label p-4">
                                            Source &amp; period
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MARKET.medians.map((row) => (
                                        <tr key={row.label} className="border-t border-navy/10 align-top">
                                            <th scope="row" className="p-4 text-body-sm font-normal text-ink">
                                                {row.label}
                                                <span className="mt-1.5 block text-micro font-light text-navy-500">
                                                    {row.basis}
                                                </span>
                                            </th>
                                            <td className="tabular p-4 font-display text-d-item text-ink">
                                                {row.value}
                                            </td>
                                            <td className="p-4 text-micro font-light text-navy-500">
                                                <a
                                                    href={row.sourceUrl}
                                                    target="_blank"
                                                    rel="noopener nofollow"
                                                    className="text-ink underline decoration-gold underline-offset-4"
                                                >
                                                    {row.source}
                                                </a>
                                                <span className="mt-1 block">{row.observed}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="border-t border-navy/10 bg-cream/60">
                                        <th scope="row" className="p-4 text-body-sm font-normal text-ink">
                                            The gap
                                            <span className="mt-1.5 block text-micro font-light text-navy-500">
                                                Methodology alone — not a change in the market.
                                            </span>
                                        </th>
                                        <td className="tabular p-4 font-display text-d-item text-gold-600">
                                            {MARKET.medianGap}
                                        </td>
                                        <td className="p-4 text-micro font-light text-navy-500">
                                            Calculated by {BRAND.name} from the two rows above
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="mt-5 text-micro font-light text-navy-400">
                            Figures verified {MARKET.verifiedOn}. Orange County conditions change month to month — cite
                            the observation date alongside any number taken from this page.
                        </p>
                    </Reveal>
                </BandHead>
            </Band>

            {/* Market conditions ride the seam out of the table section. */}
            <Seam
                tone="cream"
                items={MARKET.conditions.map((figure) => ({
                    label: figure.label,
                    value: figure.value,
                }))}
            />

            {/* ---------------------------------------------------- Sam */}
            <Band tone="cream" density="lg" rule={false}>
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
                    <Reveal variant="frame" className="lg:col-span-5">
                        <div className="relative w-full max-w-[460px] overflow-hidden">
                            <img
                                src="/base/sam-portrait.jpg"
                                alt={`${AGENT.displayName}, ${AGENT.title} and founder of ${BRAND.name}, ${AREA.primaryFull}`}
                                width={720}
                                height={720}
                                loading="lazy"
                                className="w-full object-cover"
                            />
                        </div>
                    </Reveal>

                    <Reveal className="lg:col-span-6 lg:col-start-7">
                        <h2 className="font-display text-d-section text-ink">{AGENT.displayName}</h2>
                        <p className="mt-4 text-body-sm font-normal text-gold-600">
                            {AGENT.title} · {AGENT.role} · {AREA.focusLabel}
                        </p>

                        <div className="mt-9 space-y-6 text-body font-light text-navy-600">
                            <p className="max-w-measure-lg">
                                {AGENT.firstName} works with buyers of every kind along the Orange County coast —
                                first-time, moving up, relocating in, and investing. What they have in common is that
                                they arrive with questions nobody has taken the time to answer properly.
                            </p>
                            <p className="max-w-measure-lg">
                                His approach is unusually simple: explain everything first. A client who understands the
                                market makes better decisions, negotiates from a steadier place, and never has to wonder
                                whether they were pushed. It is slower at the start. It is considerably faster once
                                things are moving.
                            </p>
                        </div>

                        {/* Expert pull-quote — an E-E-A-T and GEO signal, and a
                            break in the texture of the page. */}
                        <blockquote className="mt-10 border-l border-gold pl-7">
                            <p className="font-display text-d-block italic leading-[1.5] text-ink">
                                “The best outcome is a client who could have done it themselves — and chose not to have
                                to.”
                            </p>
                            <footer className="label mt-4 text-navy-400">
                                {AGENT.shortDisplayName}, {AGENT.title}
                            </footer>
                        </blockquote>
                    </Reveal>
                </div>
            </Band>

            {/* ----------------------------------------------- Services index */}
            <Band tone="navy" density="md">
                <BandHead
                    tone="navy"
                    layout="stacked"
                    heading={<>What can {AGENT.firstName} help with?</>}
                    lede="Five services, in the order Sam believes they should happen."
                >
                    <div>
                        {SERVICES.map((service, i) => (
                            <Reveal key={service.id} variant="row" index={i}>
                                <Link
                                    to={`/services#${service.id}`}
                                    className={cn(
                                        "group grid grid-cols-1 items-baseline gap-4 py-8 transition-colors duration-view hover:border-gold/50 md:grid-cols-12 md:gap-10",
                                        i > 0 && "border-t border-cream/14"
                                    )}
                                >
                                    <h3 className="font-display text-d-block leading-tight text-cream transition-colors duration-view group-hover:text-gold-300 md:col-span-4">
                                        {service.name}
                                    </h3>
                                    <p className="text-body-sm font-light leading-[1.8] text-cream/55 md:col-span-7">
                                        {service.short}
                                    </p>
                                    <span className="md:col-span-1 md:justify-self-end" aria-hidden="true">
                                        <ArrowUpRight
                                            className="h-5 w-5 text-cream/25 transition-all duration-view group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold-300"
                                            strokeWidth={1}
                                        />
                                    </span>
                                </Link>
                            </Reveal>
                        ))}

                        <Reveal className="mt-10 border-t border-cream/14 pt-10">
                            <Link
                                to="/services"
                                onClick={() => trackCtaClick("See all services", "services-index")}
                                className="btn-outline-light"
                            >
                                See how each one works
                                <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
                            </Link>
                        </Reveal>
                    </div>
                </BandHead>
            </Band>

            {/* --------------------------------------------------- Promises */}
            <Band tone="white" density="md">
                <BandHead
                    heading="What should you expect?"
                    lede="Four commitments, and the reason each one is worth stating out loud."
                    foot={
                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, "promises")}
                            className="link-rule label"
                        >
                            {PRIMARY_CTA.label}
                            <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                        </Link>
                    }
                >
                    <CellGrid cols={2} as="dl">
                        {PROMISES.map((promise, i) => (
                            <Reveal key={promise.title} variant="row" index={i} className="bg-white p-6 md:p-8">
                                <dt className="font-display text-d-block leading-tight text-ink">{promise.title}</dt>
                                <dd className="mt-4 text-body-sm font-light text-navy-600">{promise.body}</dd>
                            </Reveal>
                        ))}
                    </CellGrid>
                </BandHead>
            </Band>

            {/* ---------------------------------------------------- Process */}
            <Band tone="cream" density="md" id="process">
                <BandHead
                    tone="cream"
                    heading="How does working together actually go?"
                    lede="Five stages, in order. Nothing is decided in the first meeting, and nothing is rushed in the last."
                    aside={<Plate name="terrace" />}
                    foot={
                        <p className="text-body-sm font-light text-navy-500">
                            Stage one is the consultation, and it is free. Most people are six to eighteen months from
                            a move when they book it.
                        </p>
                    }
                >
                    <ol>
                        {PROCESS.map((step, i) => (
                            <Reveal
                                key={step.step}
                                variant="row"
                                index={i}
                                as="li"
                                className={cn("flex gap-6 py-8 md:gap-8", i > 0 && "border-t border-navy/12")}
                            >
                                <span
                                    className="tabular w-10 flex-shrink-0 pt-1 font-display text-d-item text-gold"
                                    aria-hidden="true"
                                >
                                    {step.step}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-display text-d-block leading-tight text-ink">{step.title}</h3>
                                    <p className="mt-3 max-w-measure-lg text-body-sm font-light text-navy-600">
                                        {step.body}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </ol>
                </BandHead>
            </Band>

            {/* ---------------------------------------------- Neighbourhoods */}
            <Band tone="white" density="sm">
                <div className="pt-10 lg:pt-14">
                    <Reveal className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <h2 className="max-w-xl font-display text-d-section text-ink">
                            Where along the coast does {AGENT.firstName} work?
                        </h2>
                        <p className="max-w-xs text-body-sm font-light leading-[1.8] text-navy-600 md:text-right">
                            Weighted to {AREA.focusLabel}, and available throughout the county — including{" "}
                            {AREA.alsoServing.slice(0, 3).join(", ")}.
                        </p>
                    </Reveal>

                    <ul className="grid grid-cols-2 gap-px bg-navy/12 lg:grid-cols-4">
                        {AREA.cities.map((city, i) => (
                            <Reveal
                                key={city.slug}
                                variant={city.photo ? "frame" : "row"}
                                index={i}
                                as="li"
                                className="group relative aspect-[4/5] overflow-hidden bg-navy"
                            >
                                {city.photo ? (
                                    <>
                                        <img
                                            src={`/neighborhoods/tiles/${city.photo}.webp`}
                                            alt={city.photoAlt}
                                            loading="lazy"
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-brand group-hover:scale-105"
                                        />
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/60 via-40% to-navy/10 transition-opacity duration-view group-hover:from-navy/100"
                                        />
                                    </>
                                ) : (
                                    /*
                                     * No licensed photograph of this city yet, so
                                     * the tile is typographic rather than a
                                     * stand-in image. A coastal shot captioned
                                     * "Dana Point" that was taken in Newport is a
                                     * false claim about a place. Swapping a real
                                     * photo in later is a one-line config change.
                                     */
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 bg-navy texture-linen transition-colors duration-view group-hover:bg-navy-900"
                                    />
                                )}

                                <span className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                                    <span
                                        className="mb-3 block h-px w-6 bg-gold-400 transition-all duration-view ease-brand group-hover:w-12"
                                        aria-hidden="true"
                                    />
                                    <span className="block font-display text-d-item text-cream">{city.name}</span>
                                    <span className="mt-1.5 block text-micro font-light text-cream/70">
                                        {city.note}
                                    </span>
                                </span>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </Band>

            {/* -------------------------------------------------------- FAQ */}
            <Band tone="cream" density="md" id="faq">
                <BandHead
                    tone="cream"
                    heading="Common questions"
                    lede="If yours is not here, it is a good first question for the consultation."
                    foot={
                        <div className="space-y-3">
                            <a
                                href={`tel:${CONTACT.phoneHref}`}
                                onClick={() => trackPhoneClick("faq")}
                                className="block font-display text-d-item text-ink transition-colors hover:text-gold-600"
                            >
                                {CONTACT.phone}
                            </a>
                            <p className="label text-navy-400">{CONTACT.hours}</p>
                        </div>
                    }
                >
                    {/*
                     * Every answer is in the DOM and visible — no accordion. The
                     * prerendered document therefore carries all six answers in
                     * full for crawlers and answer engines that never click.
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

            <Proof />
            <ClosingCTA />
        </div>
    );
}

/* ==========================================================================
   Proof

   Real reviews when the client supplies them; an honest "not yet" otherwise.
   Never a fabricated quote, rating, or sale count — see PROOF in
   src/config/site.ts.
   ========================================================================== */

const Proof = () => {
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
        <Band tone="navy" density="md" rule={false}>
            <div className="mx-auto max-w-4xl py-6 text-center">
                <AnimatePresence mode="wait">
                    <motion.blockquote
                        key={index}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="font-display text-d-section italic leading-[1.35] text-cream">
                            “{review.quote}”
                        </p>
                        <footer className="mt-10">
                            <span className="mx-auto mb-6 block h-px w-10 bg-gold" aria-hidden="true" />
                            <cite className="block font-display text-d-item not-italic text-cream">{review.name}</cite>
                            <span className="label mt-2 block text-cream/40">{review.detail}</span>
                        </footer>
                    </motion.blockquote>
                </AnimatePresence>

                {REVIEWS.length > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
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

                {PROOF.hasStats && STATS.length > 0 && (
                    <CellGrid cols={4} tone="navy" as="dl" className="mt-20 text-left">
                        {STATS.map((stat) => (
                            <Cell key={stat.label} tone="navy">
                                <dd className="tabular font-display text-d-section leading-none text-cream">
                                    {stat.value}
                                </dd>
                                <dt className="label mt-4 block text-cream/40">{stat.label}</dt>
                            </Cell>
                        ))}
                    </CellGrid>
                )}
            </div>
        </Band>
    );
};

/* ==========================================================================
   Closing
   ========================================================================== */

const ClosingCTA = () => (
    <section className="on-navy relative overflow-hidden bg-navy">
        <img
            {...propertyPhoto("cta")}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/75 to-navy/95" />

        <div className="relative z-10 mx-auto max-w-shell px-gutter py-sec-lg">
            <Reveal className="max-w-3xl">
                <h2 className="font-display text-d-page text-cream">Start with a conversation.</h2>
                <p className="mb-12 mt-8 max-w-measure-lg text-lead font-light text-cream/70">
                    {PRIMARY_CTA.promise} Bring your questions — the harder the better.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                        to={PRIMARY_CTA.href}
                        onClick={() => trackCtaClick(PRIMARY_CTA.label, "closing-cta")}
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
                        onClick={() => trackPhoneClick("closing-cta")}
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
