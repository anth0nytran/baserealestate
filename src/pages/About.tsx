import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO, { AUTHOR_ID, SITE_URL } from "../hooks/useSEO";
import Reveal, { HeadlineDraw } from "../components/Reveal";
import { Band, BandHead, Cell, CellGrid, Seam } from "../components/Section";
import { BrandName, BrokeredBy } from "../components/Brand";
import { GuideFaq } from "../components/Guide";
import Proof from "../components/Proof";
import { AREA_GUIDES } from "../config/areas";
import {
    AGENT,
    AREA,
    CONTACT,
    HOME_FINDER,
    LICENSE,
    NEST_PORTAL,
    PRIMARY_CTA,
    PROMISES,
    PROOF_SOURCE,
    areaSearchUrl,
    dreLine,
} from "../config/site";
import { posts } from "../lib/blog";
import { trackCtaClick, trackPhoneClick } from "../lib/analytics";

/* ==========================================================================
   /about — the page about Sam

   The entity home. When an answer engine is asked who Sam Elsherif is, which
   brokerage he is with, or whether he is licensed, this is the page built to
   be the answer: every fact on it is checkable, and the license links straight
   to the state's own public record. Marked up as a ProfilePage whose main
   entity is the same Person node the rest of the site points at.
   ========================================================================== */

const DRE_LOOKUP = "https://www2.dre.ca.gov/PublicASP/pplinfo.asp?License_id=02282409";

/* Entity questions only — the homepage owns "who is Sam", /services the process. */
const FAQS = [
    {
        q: "Is Sam Elsherif a licensed real estate agent?",
        a: `Yes. ${AGENT.displayName} holds California real estate salesperson license #02282409, issued by the California Department of Real Estate on June 27, 2025. The license can be checked on the DRE's public license lookup.`,
    },
    {
        q: "What brokerage is Sam Elsherif with?",
        a: `${LICENSE.brokerage.name} (CA DRE #02174581). Base Real Estate Group is ${AGENT.firstName}'s team, licensed under ${LICENSE.brokerage.name} — it is not a separate brokerage.`,
    },
    {
        q: "What areas does Sam Elsherif serve?",
        a: `All of Orange County, weighted to ${AREA.focusLabel}: ${AREA.focus.map((c) => c.name).join(", ")}, along with ${AREA.cities
            .filter((c) => !AREA.focus.some((f) => f.slug === c.slug))
            .map((c) => c.name)
            .join(", ")}.`,
    },
    {
        q: "What do clients say about Sam Elsherif?",
        a: `${AGENT.firstName} holds a ${PROOF_SOURCE.rating} rating across ${PROOF_SOURCE.reviewCount} reviews on his ${PROOF_SOURCE.label} profile, read ${PROOF_SOURCE.verifiedLabel}. The recurring theme is that clients always knew where they stood: every development explained in plain language.`,
    },
    {
        q: "How do I contact Sam Elsherif?",
        a: `Call ${CONTACT.phone} (${CONTACT.hours}, after-hours by appointment) or book a free consultation through this site. Inquiries are answered the same business day wherever possible.`,
    },
];

export default function About() {
    return (
        <div className="w-full overflow-x-clip">
            <SEO
                title={`About ${AGENT.shortDisplayName}, Orange County ${AGENT.title}`}
                description={`${AGENT.shortDisplayName} is an Orange County REALTOR® (CA DRE #02282409) and founder of Base Real Estate Group with ${LICENSE.brokerage.name}. License, record, and areas served.`}
                path="/about"
                image="/base/sam-portrait.jpg"
                imageAlt={`${AGENT.displayName}, ${AGENT.title}`}
                breadcrumbs={[{ name: "About", path: "/about" }]}
                faqs={FAQS}
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ProfilePage",
                        "@id": `${SITE_URL}/about`,
                        url: `${SITE_URL}/about`,
                        name: `About ${AGENT.shortDisplayName}`,
                        mainEntity: { "@id": AUTHOR_ID },
                        dateModified: "2026-11-06",
                    })}
                </script>
            </Helmet>

            {/* ------------------------------------------------------ Hero */}
            <section className="on-navy relative overflow-hidden bg-navy">
                <div className="relative z-10 mx-auto grid max-w-shell gap-12 px-gutter pb-sec-md pt-40 md:pt-48 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <h1 className="mb-8 font-display text-d-page text-cream">
                            <HeadlineDraw delay={100}>{AGENT.displayName},</HeadlineDraw>{" "}
                            <HeadlineDraw delay={380} className="italic text-gold-300">
                                {AGENT.title}.
                            </HeadlineDraw>
                        </h1>
                        {/* Answer-first: who he is, where, licensed under whom — in one breath. */}
                        <p className="max-w-measure-lg text-lead text-cream/85">
                            {AGENT.displayName} is an Orange County, California {AGENT.title} and the founder of{" "}
                            <BrandName />, a team licensed under {LICENSE.brokerage.name}. He works with buyers,
                            sellers, and investors across {AREA.focusLabel}, and starts every engagement by making sure
                            the client understands how the transaction works before committing to one.
                        </p>
                        <div className="mt-10 space-y-4 border-t border-cream/15 pt-6">
                            <p className="label text-cream/70">
                                {dreLine()} ·{" "}
                                <a
                                    href={DRE_LOOKUP}
                                    target="_blank"
                                    rel="noopener"
                                    className="underline decoration-gold-300 underline-offset-4 hover:text-cream"
                                >
                                    Verify on the DRE register
                                </a>
                            </p>
                            <BrokeredBy tone="cream" className="text-[22px]" />
                        </div>
                    </div>
                    <div className="lg:col-span-4 lg:col-start-9">
                        <img
                            src="/base/sam-portrait.jpg"
                            alt={`${AGENT.displayName}, ${AGENT.title} and founder of Base Real Estate Group`}
                            width={720}
                            height={720}
                            className="w-full max-w-sm border border-gold/40 object-cover lg:max-w-none"
                        />
                    </div>
                </div>
            </section>

            <Seam
                items={[
                    { label: "License", value: "CA DRE #02282409" },
                    { label: "Brokerage", value: LICENSE.brokerage.name },
                    { label: `${PROOF_SOURCE.label} rating`, value: `${PROOF_SOURCE.rating} · ${PROOF_SOURCE.reviewCount} reviews` },
                    { label: "Hours", value: CONTACT.hours },
                ]}
            />

            {/* --------------------------------------------------- Approach */}
            <Band tone="white" density="md" rule={false}>
                <BandHead
                    heading="How does Sam work?"
                    lede="Explain everything first. It is slower at the start and considerably faster once things are moving."
                >
                    <Reveal>
                        <p className="max-w-measure-lg text-body text-navy-600">
                            {AGENT.firstName} works with buyers of every kind along the Orange County coast — first-time,
                            moving up, relocating in, and investing. What they have in common is that they arrive with
                            questions nobody has taken the time to answer properly. A client who understands the market
                            makes better decisions, negotiates from a steadier place, and never has to wonder whether
                            they were pushed.
                        </p>
                        <CellGrid cols={2} className="mt-10">
                            {PROMISES.map((promise) => (
                                <Cell key={promise.title}>
                                    <h3 className="font-display text-d-item text-ink">{promise.title}</h3>
                                    <p className="mt-3 text-body-sm text-navy-600">{promise.body}</p>
                                </Cell>
                            ))}
                        </CellGrid>
                    </Reveal>
                </BandHead>
            </Band>

            <Proof />

            {/* ----------------------------------------------------- Areas */}
            <Band tone="cream" density="md" id="areas" rule={false}>
                <BandHead
                    tone="cream"
                    heading="Where does Sam work?"
                    lede={`All of Orange County, weighted to ${AREA.focusLabel}. The city guides carry sourced prices and what moves value in each.`}
                >
                    <Reveal>
                        <h3 className="label text-navy-500">City guides</h3>
                        <ul className="mt-5 grid gap-px bg-navy/12 sm:grid-cols-3">
                            {AREA_GUIDES.map((guide) => (
                                <li key={guide.slug} className="bg-white">
                                    <Link
                                        to={`/areas/${guide.slug}`}
                                        className="cell-accent group flex items-center justify-between p-6 hover:bg-cream"
                                    >
                                        <span className="font-display text-d-item text-ink">{guide.name}</span>
                                        <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" strokeWidth={1.25} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <h3 className="label mt-10 text-navy-500">Also serving</h3>
                        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                            {[...AREA.cities.map((c) => c.name), ...AREA.alsoServing]
                                .filter((name) => !AREA_GUIDES.some((g) => g.name === name))
                                .map((name) => (
                                    <li key={name}>
                                        <a
                                            href={areaSearchUrl(name)}
                                            target="_blank"
                                            rel="noopener"
                                            className="text-body-sm text-navy-600 underline decoration-gold/50 underline-offset-4 hover:text-ink"
                                        >
                                            {name}
                                        </a>
                                    </li>
                                ))}
                        </ul>
                    </Reveal>
                </BandHead>
            </Band>

            {/* --------------------------------------------------- Writing */}
            <Band tone="white" density="md">
                <BandHead
                    heading={`What does ${AGENT.firstName} write about?`}
                    lede="Orange County market reports and buyer and seller guides — every figure attributed to a named source and dated."
                >
                    <Reveal>
                        <ul className="border-t border-navy/12">
                            {posts.map((post) => (
                                <li key={post.slug} className="border-b border-navy/12">
                                    <Link to={`/blog/${post.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                                        <span className="font-display text-d-item text-ink group-hover:text-gold-600">{post.title}</span>
                                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-gold" strokeWidth={1.25} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </BandHead>
            </Band>

            {/* ------------------------------------------------ Elsewhere */}
            <Band tone="navy" density="sm">
                <BandHead tone="navy" layout="stacked" heading={`Find ${AGENT.firstName} elsewhere.`}>
                    <Reveal>
                        <ul className="grid gap-px bg-cream/14 md:grid-cols-3">
                            {[
                                { href: PROOF_SOURCE.profileUrl, label: `${PROOF_SOURCE.label} profile`, note: "Reviews and closed sales" },
                                { href: NEST_PORTAL.home, label: "Nest Real Estate", note: "His page with his brokerage" },
                                { href: HOME_FINDER, label: "Home search", note: "Every Orange County listing" },
                            ].map((item) => (
                                <li key={item.href} className="bg-navy">
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener"
                                        onClick={() => trackCtaClick(item.label, "about-elsewhere")}
                                        className="cell-accent group block p-6 md:p-8"
                                    >
                                        <span className="flex items-center justify-between font-display text-d-item text-cream">
                                            {item.label}
                                            <ArrowUpRight className="h-4 w-4 text-gold-300" strokeWidth={1.25} />
                                        </span>
                                        <span className="mt-2 block text-body-sm text-cream/70">{item.note}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </BandHead>
            </Band>

            <GuideFaq faqs={FAQS} plate="entry" source="about" />

            <Band tone="cream" density="md" rule={false}>
                <Reveal className="max-w-3xl py-6">
                    <h2 className="font-display text-d-section text-ink">Bring the hard questions.</h2>
                    <p className="mb-11 mt-8 max-w-measure-lg text-lead text-navy-600">{PRIMARY_CTA.promise}</p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link to={PRIMARY_CTA.href} onClick={() => trackCtaClick(PRIMARY_CTA.label, "about-closing")} className="btn-primary group">
                            {PRIMARY_CTA.label}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.25} />
                        </Link>
                        <a href={`tel:${CONTACT.phoneHref}`} onClick={() => trackPhoneClick("about-closing")} className="btn-outline">
                            {CONTACT.phone}
                        </a>
                    </div>
                </Reveal>
            </Band>
        </div>
    );
}
