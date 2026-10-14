import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO, { SITE_URL } from "../hooks/useSEO";
import { Plate } from "@/components/Plate";
import Reveal from "../components/Reveal";
import { Band, BandHead, Cell, CellGrid, Seam } from "../components/Section";
import { GuideFaq, GuideHero, GuidePortal, GuideReading, GuideSteps } from "../components/Guide";
import ClosingCTA from "../components/ClosingCTA";
import { AGENT, AREA, MARKET, NEST_PORTAL, PROOF_SOURCE, SERVICES } from "../config/site";

/* ==========================================================================
   /sell — the seller's guide

   Condensed from the journal's valuation post and the commission explainer,
   where every figure is sourced and dated. No new numbers are introduced
   here.

   Deliberately no testimonial band. Every review and closing on Sam's
   published record is buyer-side, and setting buyer quotes under a seller
   headline would imply a listing record that does not exist. The page says
   so plainly instead — see "A straight answer on track record" below.
   ========================================================================== */

const SERVICE = SERVICES.find((s) => s.id === "selling")!;
const [DAYS, LISTINGS, YOY] = MARKET.conditions;

const FAQS = [
    {
        q: "How accurate are Zillow and Redfin estimates in Orange County?",
        a: "Reasonable orientation in uniform tract neighborhoods, and considerably less reliable on the coast. Automated models work from public records and nearby sales, and cannot see view corridor, coastal permit history, unpermitted improvements, orientation, or condition. In Laguna Beach, Dana Point, and Newport Beach those factors routinely move value by six figures.",
    },
    {
        q: "How much does a home valuation cost?",
        a: `A comparative market analysis from ${AGENT.firstName} is free, and carries no obligation to list. A licensed appraisal typically costs several hundred dollars and is usually ordered by a lender during a transaction. For deciding whether and how to sell, the market analysis is the more useful instrument.`,
    },
    {
        q: "Why do three agents give me three different values?",
        a: "Because a valuation is an argument from evidence, and agents may choose different comparable sales, adjust them differently, or weigh active competition differently. Ask each one to show you which closed sales they used and why. An agent who cannot show the comparables is quoting a feeling.",
    },
    {
        q: "Should I price high and negotiate down?",
        a: `Rarely, and it costs more now than it used to. Your first two weeks reach the largest and most motivated audience your listing will ever get. Spending them testing a high number means the reduction that follows is presented to a smaller, more skeptical pool — and with active listings at a yearly high, buyers have more alternatives than they did a year ago.`,
    },
    {
        q: "How long does it take to sell a home in Orange County?",
        a: `About ${DAYS.value.replace("≈", "")} at the county median as of ${DAYS.observed}, up from roughly 40 days a year earlier. On the coast, timing varies sharply by price band, which is why the analysis looks at how long comparable homes took to sell, not just what they sold for.`,
    },
    {
        q: "Do I have to offer to pay the buyer's agent?",
        a: "No — you are no longer obliged to, and it cannot be advertised on the MLS. But buyers now arrive with a signed agreement stating what they owe their agent, and if a comparable listing offers a contribution and yours does not, some buyers will find that home cheaper to buy. It is a pricing decision, best made with the numbers in front of you.",
    },
    {
        q: "When should I start talking to an agent about selling?",
        a: "Six to twelve months before you intend to move, if you can. That lead time is what lets you fix the deferred maintenance an inspector will find, resolve permit issues before a buyer's agent does, and prepare the property properly rather than in a rush — the things that actually change the number.",
    },
];

const CMA = [
    {
        title: "Genuinely comparable sales",
        body: "Similar size, condition, and location, closed recently enough to reflect this market. On the coast this is the hard part — true comparables are scarce.",
    },
    {
        title: "Adjusted for the differences",
        body: "Each comparable moved up or down for what it has that yours does not, and the reverse — with the adjustments shown, not hidden in a total.",
    },
    {
        title: "What is competing now",
        body: "Closed sales show where the market has been. Active listings show what a buyer will be choosing between when they walk into yours.",
    },
    {
        title: "What failed",
        body: "Expired and withdrawn listings are the most under-used evidence in pricing. They show where the ceiling actually is.",
    },
    {
        title: "Time",
        body: "How long comparable homes took to sell, in which price bands — which decides whether a target price is realistic on your timeline.",
    },
];

const STEPS = [
    {
        title: "Consultation",
        body: "What you own, what you need from the sale, and your timeline. Selling now, later, or not at all are all on the table.",
    },
    {
        title: "Pricing analysis",
        body: "Closed comparables, adjustments, active competition, and failed listings — shown to you, line by line.",
    },
    {
        title: "Preparation",
        body: "Deferred maintenance and permit questions settled before a buyer's inspector finds them.",
    },
    {
        title: "Launch plan",
        body: "Price, presentation, photography, and the buyer-agent concession decision, all made before the listing goes live.",
    },
    {
        title: "The first two weeks",
        body: "The largest, most motivated audience the listing will ever have. Every showing and every response is read for what it says about price.",
    },
    {
        title: "Offers",
        body: "Compared on terms as well as price — contingencies, financing strength, timeline, and how likely each is to actually close.",
    },
    {
        title: "Escrow",
        body: "Inspection and appraisal negotiated so the number on the contract survives to the closing statement.",
    },
    {
        title: "Close",
        body: "Signing, funding, and recording, with every contingency deadline tracked to the day.",
    },
];

export default function Sell() {
    return (
        <div className="w-full overflow-x-clip">
            <SEO
                title="Selling a Home in Orange County"
                description={`Sell in ${AREA.focusLabel} with ${AGENT.displayName}, ${AGENT.title}: pricing built from closed comparable sales and shown to you, a plan for your first two weeks on market, and a free, no-obligation pricing analysis.`}
                path="/sell"
                breadcrumbs={[{ name: "Sell", path: "/sell" }]}
                faqs={FAQS}
            />

            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "@id": `${SITE_URL}/sell#service`,
                        name: "Home sale representation in Orange County",
                        serviceType: SERVICE.name,
                        description: SERVICE.blurb,
                        provider: { "@id": `${SITE_URL}/#real-estate-agent` },
                        areaServed: [
                            { "@type": "AdministrativeArea", name: "Orange County, CA" },
                            ...AREA.focus.map((city) => ({ "@type": "City", name: city.name })),
                        ],
                        audience: { "@type": "Audience", audienceType: "Homeowners selling in Orange County" },
                        offers: {
                            "@type": "Offer",
                            priceSpecification: {
                                "@type": "PriceSpecification",
                                description:
                                    "Comparative market analysis provided at no cost and with no obligation to list. Listing compensation is negotiable and agreed in writing.",
                            },
                        },
                    })}
                </script>
            </Helmet>

            <GuideHero
                photo="sell-hero"
                lead="Sell in Orange County,"
                accent="priced on evidence."
                service="selling"
                source="sell"
                portal={{ href: NEST_PORTAL.seller, label: "Or get an instant home analysis" }}
            >
                {AGENT.displayName} prices homes across {AREA.focusLabel} from closed comparable sales — shown to you,
                not summarized — and plans your first two weeks on market before the listing goes live. The pricing
                analysis is free, and carries no obligation to list.
            </GuideHero>

            <Seam
                items={[
                    { label: DAYS.label, value: DAYS.value },
                    { label: LISTINGS.label, value: LISTINGS.value },
                    { label: YOY.label, value: YOY.value },
                    { label: "Pricing analysis", value: "No cost" },
                ]}
            />

            <GuidePortal
                heading="Want a number tonight?"
                body={`Get a free instant home analysis through ${AGENT.firstName}'s page on his brokerage's site — an estimated value, your equity, and local market trends. Treat it as the starting point it is: the comparable-sales analysis below is what a listing price should actually rest on.`}
                points={["Estimated value and equity", "Local market trends", "Request an in-home evaluation", "Free, with no obligation"]}
                href={NEST_PORTAL.seller}
                action="Get your home analysis"
                source="sell"
            />

            {/* ----------------------------------------------------- Worth */}
            <Band tone="white" density="md" rule={false}>
                <BandHead
                    heading="What is your home actually worth?"
                    lede="An automated estimate is a starting point, not a valuation. On the coast it cannot see view, permit history, or condition — the things that move value by six figures. A real analysis is an argument built from evidence, in five parts."
                    foot={
                        <Link to="/blog/how-much-is-my-home-worth-orange-county" className="link-rule label">
                            How valuation really works
                            <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                        </Link>
                    }
                >
                    <Reveal>
                        <ol className="grid grid-cols-1 gap-px bg-navy/12 sm:grid-cols-2">
                            {CMA.map((part, i) => (
                                <Cell key={part.title} as="li" className={i === CMA.length - 1 ? "sm:col-span-2" : ""}>
                                    <span className="tabular mb-4 block font-display text-d-item text-gold-600">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <h3 className="font-display text-d-item text-ink">{part.title}</h3>
                                    <p className="mt-3 text-body-sm font-light text-navy-600">{part.body}</p>
                                </Cell>
                            ))}
                        </ol>
                    </Reveal>
                </BandHead>
            </Band>

            {/* ------------------------------------------------ Two weeks */}
            <Band tone="navy" density="md">
                <BandHead tone="navy" layout="stacked" heading="Your first two weeks decide the sale.">
                    <Reveal>
                        <CellGrid cols={2} tone="navy">
                            <Cell tone="navy" className="md:p-10">
                                <h3 className="font-display text-d-block text-cream">The two-week rule</h3>
                                <p className="mt-5 text-body-sm font-light leading-[1.9] text-cream/65">
                                    A new listing is shown to every buyer who has been waiting in that price band. That
                                    audience is the largest and most motivated it will ever be. If the price tests a
                                    hopeful number, those two weeks are spent proving it does not work — and the
                                    reduction that follows meets a smaller, more skeptical pool. With active listings at
                                    a 2026 high, testing a number costs more than it did a year ago.
                                </p>
                            </Cell>
                            <Cell tone="navy" className="md:p-10">
                                <h3 className="font-display text-d-block text-cream">
                                    Price against closed sales, not active listings
                                </h3>
                                <p className="mt-5 text-body-sm font-light leading-[1.9] text-cream/65">
                                    In Newport Beach over the six months to August 2026, the median asking price on
                                    active listings ran about $2.4 million above the median sold price — the widest gap
                                    recorded. Values did not fall by that much: the homes selling and the homes sitting
                                    have become different populations. The active median is inflated by homes that
                                    already failed at that number.
                                </p>
                            </Cell>
                        </CellGrid>
                    </Reveal>
                </BandHead>
            </Band>

            {/* ------------------------------------------------- Prepare */}
            <Band tone="white" density="md" rule={false}>
                <BandHead
                    heading="What Sam does for a seller."
                    lede="Start six to twelve months out if you can. The decisions that change the number all have lead times."
                    aside={<Plate name="staged-living" />}
                    bodySticky
                >
                    <Reveal>
                        <p className="max-w-measure-lg text-body font-light text-navy-600">{SERVICE.blurb}</p>
                        <ul className="mt-9 space-y-4 border-t border-navy/12 pt-8">
                            {[
                                ...SERVICE.includes,
                                "Deferred maintenance and permit issues addressed before a buyer's inspector finds them",
                                "Offers compared on terms and likelihood to close, not just the headline price",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-4 text-body-sm font-light text-ink">
                                    <span className="mt-[0.72em] block h-px w-5 flex-shrink-0 bg-gold" aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-12 border-l border-gold pl-7">
                            <h3 className="font-display text-d-block text-ink">The buyer-agent question.</h3>
                            <p className="mt-4 max-w-measure-lg text-body-sm font-light text-navy-600">
                                You no longer have to offer anything toward the buyer's agent, and it cannot be
                                advertised on the MLS. But buyers now arrive with a signed agreement stating what they
                                owe, and a comparable listing that contributes can be materially cheaper for them to buy.
                                It is a pricing decision like any other, and it gets made with the numbers in front of
                                you.
                            </p>
                        </div>
                    </Reveal>
                </BandHead>
            </Band>

            <GuideSteps
                heading="How a sale runs with Sam."
                lede="Eight steps, in order. The first four happen before the listing goes live."
                steps={STEPS}
            />

            {/* ------------------------------------------- Track record */}
            <Band tone="cream" density="md" rule={false}>
                <Reveal className="grid gap-10 py-6 lg:grid-cols-12 lg:gap-16">
                    <h2 className="font-display text-d-section text-ink lg:col-span-5">
                        A straight answer on track record.
                    </h2>
                    <div className="space-y-6 text-body font-light text-navy-600 lg:col-span-7">
                        <p>
                            Every closing on {AGENT.firstName}’s published record so far was on the buyer’s side of
                            the table. That is where he learned what buyers will pay for, what they discount, and what
                            makes them walk away — which is exactly what a listing has to answer.
                        </p>
                        <p>
                            The record is public and you can check it in under a minute on{" "}
                            <a
                                href={PROOF_SOURCE.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ink underline decoration-gold underline-offset-4"
                            >
                                his {PROOF_SOURCE.label} profile
                            </a>
                            . Ask him anything about it in the consultation.
                        </p>
                    </div>
                </Reveal>
            </Band>

            <GuideFaq faqs={FAQS} plate="timber-living" source="sell" />

            <GuideReading
                heading="Read further before you list."
                slugs={[
                    "how-much-is-my-home-worth-orange-county",
                    "orange-county-housing-market-report",
                    "south-orange-county-home-prices-by-city",
                ]}
            />

            <ClosingCTA source="sell-closing" service="selling" photo="sell-cta" />
        </div>
    );
}
