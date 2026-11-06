import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO, { AGENT_ID, AUTHOR_ID, SITE_URL } from "../hooks/useSEO";
import Reveal, { HeadlineDraw } from "../components/Reveal";
import { Band, BandHead, Cell, CellGrid } from "../components/Section";
import { BrokeredBy } from "../components/Brand";
import { GuideFaq, GuideReading } from "../components/Guide";
import ClosingCTA from "../components/ClosingCTA";
import { getAreaGuide } from "../config/areas";
import { AGENT, AREA, CLOSINGS, PRIMARY_CTA, REVIEWS, dreLine, homeSearchUrl } from "../config/site";
import { trackCtaClick } from "../lib/analytics";

/* ==========================================================================
   /areas/:slug — a city guide

   Built for the prompts where a local agent gets named: "best realtor in
   Laguna Niguel", "median home price in Newport Beach". The page answers the
   question in its first paragraph, shows the sourced figures with what each
   one counts, reads them the way Sam would, and ties him to the place with
   the closings and reviews he actually has there — nothing more.
   ========================================================================== */

export default function Area() {
    const { slug } = useParams();
    const guide = getAreaGuide(slug);
    if (!guide) return <Navigate to="/" replace />;

    const city = AREA.cities.find((c) => c.name === guide.name);
    const closings = CLOSINGS.filter((sale) => sale.city === guide.name);
    const reviews = REVIEWS.filter((review) => review.detail.includes(guide.name));
    const searchUrl = homeSearchUrl({ city: guide.name });
    const path = `/areas/${guide.slug}`;

    return (
        <div className="w-full overflow-x-clip">
            <SEO
                title={`${guide.name} Real Estate Agent & Home Prices`}
                description={`${guide.name} home prices from named sources, what moves value there, and how ${AGENT.shortDisplayName}, REALTOR®, helps ${guide.name} buyers and sellers.`}
                path={path}
                image={`/neighborhoods/hero/${guide.slug}-1600.webp`}
                imageAlt={city?.photoAlt}
                breadcrumbs={[
                    { name: "Areas", path: "/about#areas" },
                    { name: guide.name, path },
                ]}
                faqs={[...guide.faqs]}
            />

            {/*
             * The page is about a place, and offered by an agent who serves it:
             * the WebPage names the City it is about, and the Service ties the
             * agent entity to that City as an areaServed — the relation an
             * answer engine needs to name him for that city.
             */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": `${SITE_URL}${path}`,
                                url: `${SITE_URL}${path}`,
                                name: `${guide.name} real estate — home prices and local guidance`,
                                about: { "@type": "City", name: guide.name, containedInPlace: { "@type": "AdministrativeArea", name: "Orange County, CA" } },
                                author: { "@id": AUTHOR_ID },
                                publisher: { "@id": AGENT_ID },
                            },
                            {
                                "@type": "Service",
                                "@id": `${SITE_URL}${path}#service`,
                                name: `Real estate representation in ${guide.name}`,
                                serviceType: "Residential real estate agent",
                                provider: { "@id": AGENT_ID },
                                areaServed: { "@type": "City", name: guide.name },
                            },
                        ],
                    })}
                </script>
            </Helmet>

            {/* ------------------------------------------------------ Hero */}
            <section className="on-navy relative overflow-hidden bg-navy">
                <img
                    src={`/neighborhoods/hero/${guide.slug}-2560.webp`}
                    srcSet={`/neighborhoods/hero/${guide.slug}-1600.webp 1600w, /neighborhoods/hero/${guide.slug}-2560.webp 2560w`}
                    sizes="100vw"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-navy/25" />
                <div className="relative z-10 mx-auto max-w-shell px-gutter pb-sec-md pt-44 md:pt-52">
                    <div className="max-w-3xl">
                        <h1 className="mb-8 font-display text-d-page text-cream">
                            <HeadlineDraw delay={100}>{guide.name}</HeadlineDraw>{" "}
                            <HeadlineDraw delay={380} className="italic text-gold-300">
                                real estate.
                            </HeadlineDraw>
                        </h1>
                        <p className="max-w-measure-lg text-lead text-cream/85">{guide.answer}</p>

                        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                            <a
                                href={searchUrl}
                                target="_blank"
                                rel="noopener"
                                onClick={() => trackCtaClick(`Search homes — ${guide.name}`, "area-hero")}
                                className="btn-cream group"
                            >
                                Homes for sale in {guide.name}
                                <ArrowUpRight className="h-4 w-4" strokeWidth={1.25} />
                            </a>
                            <Link
                                to={PRIMARY_CTA.href}
                                onClick={() => trackCtaClick(PRIMARY_CTA.label, "area-hero")}
                                className="btn-outline-light"
                            >
                                {PRIMARY_CTA.label}
                            </Link>
                        </div>

                        <div className="mt-12 space-y-4 border-t border-cream/15 pt-6">
                            <p className="label text-cream/70">
                                <span className="whitespace-nowrap">
                                    {AGENT.shortDisplayName}, {AGENT.title}
                                </span>
                                {dreLine() && <span className="whitespace-nowrap"> · {dreLine()}</span>}
                            </p>
                            <BrokeredBy tone="cream" className="text-[22px]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --------------------------------------------------- Figures */}
            <Band tone="white" density="md" rule={false}>
                <BandHead
                    heading={`What do homes cost in ${guide.name}?`}
                    lede="Every figure says what it counts and when, because a median without those two things is not usable."
                >
                    <Reveal>
                        <CellGrid cols={2}>
                            {guide.figures.map((figure) => (
                                <Cell key={figure.label}>
                                    <p className="label text-navy-500">{figure.label}</p>
                                    <p className="tabular mt-3 font-display text-d-section leading-none text-ink">
                                        {figure.value}
                                    </p>
                                    <p className="mt-4 text-body-sm text-navy-600">
                                        {figure.counted} · {figure.period}
                                    </p>
                                    <a
                                        href={figure.sourceUrl}
                                        target="_blank"
                                        rel="noopener nofollow"
                                        className="mt-3 inline-block text-micro text-ink underline decoration-gold underline-offset-4"
                                    >
                                        Source: {figure.source}
                                    </a>
                                </Cell>
                            ))}
                            {guide.figures.length === 1 && (
                                <Cell>
                                    <p className="label text-navy-500">Live listings</p>
                                    <p className="mt-3 text-body text-navy-600">
                                        Medians describe what already sold. For what is on the market in{" "}
                                        {guide.name} today, open the live search.
                                    </p>
                                    <a
                                        href={searchUrl}
                                        target="_blank"
                                        rel="noopener"
                                        onClick={() => trackCtaClick(`Search homes — ${guide.name}`, "area-figures")}
                                        className="link-rule label mt-5"
                                    >
                                        Homes for sale in {guide.name}
                                        <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                                    </a>
                                </Cell>
                            )}
                        </CellGrid>
                        <p className="mt-5 text-micro text-navy-500">
                            Figures verified {guide.verifiedOn}. Medians describe closed sales in aggregate and do not
                            indicate the value of any individual property.
                        </p>
                    </Reveal>
                </BandHead>
            </Band>

            {/* --------------------------------------------------- Reading */}
            <Band tone="navy" density="md">
                <BandHead tone="navy" layout="stacked" heading={`What actually moves value in ${guide.name}?`}>
                    <Reveal>
                        <CellGrid cols={3} tone="navy">
                            {guide.reading.map((item) => (
                                <Cell key={item.title} tone="navy" className="md:p-8">
                                    <h3 className="font-display text-d-item text-cream">{item.title}</h3>
                                    <p className="mt-4 text-body-sm leading-[1.85] text-cream/75">{item.body}</p>
                                </Cell>
                            ))}
                        </CellGrid>
                    </Reveal>
                </BandHead>
            </Band>

            {/* --------------------------------------------------- Record */}
            {(closings.length > 0 || reviews.length > 0) && (
                <Band tone="cream" density="md" rule={false}>
                    <BandHead
                        tone="cream"
                        heading={`${AGENT.firstName} in ${guide.name}`}
                        lede={`From ${AGENT.firstName}'s published record — each closing is an address you can check.`}
                    >
                        <Reveal className="space-y-10">
                            {closings.length > 0 && (
                                <ul className="border-t border-navy/12">
                                    {closings.map((sale) => (
                                        <li
                                            key={sale.address}
                                            className="flex flex-col gap-1 border-b border-navy/12 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                                        >
                                            <span>
                                                <span className="block text-body text-ink">
                                                    {sale.address}, {sale.city}
                                                </span>
                                                <span className="text-body-sm text-navy-500">
                                                    {sale.spec} · {sale.side}-side · Closed {sale.closed}
                                                </span>
                                            </span>
                                            <span className="tabular font-display text-d-item text-gold-600">
                                                {sale.price}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {reviews.map((review) => (
                                <blockquote key={review.name} className="border-l border-gold pl-7">
                                    <p className="font-display text-d-block italic leading-[1.5] text-ink">
                                        “{review.quote}”
                                    </p>
                                    <footer className="label mt-4 text-navy-500">
                                        {review.name} · {review.detail}
                                    </footer>
                                </blockquote>
                            ))}
                        </Reveal>
                    </BandHead>
                </Band>
            )}

            <GuideFaq faqs={guide.faqs} plate="coastline" source={`area-${guide.slug}`} />

            <GuideReading heading={`Read further on ${guide.name}.`} slugs={guide.reading_list} />

            <ClosingCTA source={`area-${guide.slug}`} />
        </div>
    );
}
