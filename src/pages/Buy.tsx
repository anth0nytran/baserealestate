import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO, { SITE_URL } from "../hooks/useSEO";
import { Plate } from "@/components/Plate";
import Reveal from "../components/Reveal";
import { Band, BandHead, Cell, CellGrid, Seam } from "../components/Section";
import { GuideFaq, GuideHero, GuidePortal, GuideReading, GuideSteps } from "../components/Guide";
import Proof from "../components/Proof";
import CitySearch from "../components/CitySearch";
import ClosingCTA from "../components/ClosingCTA";
import { AGENT, AREA, MARKET, NEST_PORTAL, SERVICES } from "../config/site";

/* ==========================================================================
   /buy — the buyer's guide

   Every figure and rule on this page is already sourced and dated in the
   journal (first-time buyer guide, "is now a good time", and the commission
   explainer). This page condenses them; it does not introduce new numbers.
   If a figure changes, change it in MARKET or in the post, not here.
   ========================================================================== */

const SERVICE = SERVICES.find((s) => s.id === "buying")!;
const SFH = MARKET.medians[0];
const [DAYS, LISTINGS] = MARKET.conditions;

const FAQS = [
    {
        q: "How much do I need to buy a house in Orange County?",
        a: `More than the down payment. Budget for closing costs, property tax at California's 1% base rate plus local assessments, insurance, any HOA dues or Mello-Roos, and reserves left over after closing. The county median was ${SFH.value} for existing detached single-family homes in ${SFH.observed} (C.A.R.), and roughly ${MARKET.medians[1].value.replace("≈", "")} across all property types in ${MARKET.medians[1].observed} (Redfin) — condos and townhomes are the more common entry path.`,
    },
    {
        q: "Do I have to sign an agreement with a buyer's agent in California?",
        a: "Yes. Since January 1, 2025, California Civil Code §1670.50 has required a written buyer-broker representation agreement, signed no later than when you make an offer, stating the compensation, the services, when payment is due, and the term. For an individual buyer the term cannot exceed 90 days. National practice changes since August 2024 also require a written agreement before touring a home.",
    },
    {
        q: "Does the buyer pay the agent's commission in California now?",
        a: `The buyer is contractually responsible under that written agreement, but sellers frequently still cover some or all of it as a concession negotiated in the purchase contract, and many buyers still pay nothing out of pocket. ${AGENT.firstName} walks through the specific numbers — including what happens if a seller offers less than the agreed figure — before you sign anything.`,
    },
    {
        q: "What is Mello-Roos, and will I have to pay it?",
        a: "Mello-Roos is a community facilities district assessment used to fund infrastructure in certain developments, charged in addition to property tax. It is common in newer planned communities across south county. Whether a home carries it depends on the specific property, and it should be identified before you make an offer.",
    },
    {
        q: "Is it a good time to buy in Orange County?",
        a: `Buyers have more leverage than in 2024. Active listings reached ${LISTINGS.value.replace("≈", "about ")} in ${LISTINGS.observed.replace(/^Late/, "late")}, a yearly high, and median days on market rose to ${DAYS.value.replace("≈", "roughly ")} from about 40 a year earlier. Prices are still up ${MARKET.conditions[2].value.replace("+", "")} year over year, so this is more choice and more room to negotiate — not a falling market.`,
    },
    {
        q: "What is the biggest mistake buyers make?",
        a: "Removing a contingency before they have the information it was protecting them against — most often waiving inspection or appraisal protection to win a competitive situation. With inventory at a yearly high and homes taking about 54 days to sell, that is much less often necessary than it was two years ago.",
    },
    {
        q: "Do I need to be pre-approved before I talk to Sam?",
        a: "No. Many buyers book the consultation six to eighteen months before they intend to move, and the conversation covers how pre-approval works and when to get it. You will want it before you make an offer — sellers treat a pre-approval very differently from a pre-qualification.",
    },
];

const COSTS = [
    {
        title: "Closing costs",
        body: "Escrow, title, lender fees, and recording. Real money, and due at close — not something to discover in the final week.",
    },
    {
        title: "Property tax",
        body: "California's base rate under Proposition 13 is 1% of assessed value, plus local voter-approved assessments. Your assessed value resets to your purchase price.",
    },
    {
        title: "Insurance",
        body: "Coastal proximity, fire-risk zoning, and older construction all move the premium — and in some canyon and coastal areas, availability itself. Quote it before you are in contract.",
    },
    {
        title: "HOA dues",
        body: "Common in Irvine, Laguna Niguel, and much of planned south county. Read the reserves and the minutes, not just the monthly figure.",
    },
    {
        title: "Mello-Roos",
        body: "An assessment attached to certain newer developments, on top of property tax. Identify it before you offer, not after.",
    },
    {
        title: "Reserves",
        body: "What is left after closing. A purchase that leaves you with nothing is a purchase that cannot absorb a water heater.",
    },
];

const STEPS = [
    {
        title: "Consultation",
        body: "What you want, what you can carry, and how the transaction ahead of you actually works. Nothing is decided here.",
    },
    {
        title: "Pre-approval",
        body: "Not pre-qualification. A lender examines your documents, and sellers treat the difference seriously.",
    },
    {
        title: "Written agreement",
        body: "Compensation, services, and term in writing — read, understood, and signed before touring, as the rules now require.",
    },
    {
        title: "Real criteria",
        body: "The two or three things that are genuinely non-negotiable, and everything you would trade for them.",
    },
    {
        title: "Search to calibrate",
        body: "The first handful of homes are education. You see enough to know what a fair one looks like before you offer.",
    },
    {
        title: "Offer on terms",
        body: "Price, contingencies, timeline, and credits — all negotiable, all part of the number you actually pay.",
    },
    {
        title: "Inspect and negotiate",
        body: "On older coastal and canyon homes, expect findings. The report is your leverage for repairs or credits.",
    },
    {
        title: "Close",
        body: "Final walkthrough, signing, funding, recording, keys — with every contingency deadline tracked to the day.",
    },
];

const LEVERS = [
    {
        title: "Repair credits",
        body: "On older coastal properties inspections surface real findings — roofs, decks, plumbing, unpermitted work. A credit against those is often the largest number on the table after the price itself.",
    },
    {
        title: "Closing timeline",
        body: "Sellers who will not move on price will often move on a date, which has real value if you are coordinating a sale of your own.",
    },
    {
        title: "Contingency periods",
        body: "More time to inspect and to secure financing costs a seller nothing but patience, and protects you more than any discount.",
    },
    {
        title: "What stays",
        body: "Rarely decisive, occasionally worth five figures. It belongs in the offer, not in a conversation at the walkthrough.",
    },
];

export default function Buy() {
    return (
        <div className="w-full overflow-x-clip">
            <SEO
                title="Buying a Home in Orange County"
                description={`Buy in ${AREA.focusLabel} with ${AGENT.displayName}, ${AGENT.title}: real costs beyond the down payment, California's buyer-agreement rules, what is negotiable now, and a free buyer consultation.`}
                path="/buy"
                breadcrumbs={[{ name: "Buy", path: "/buy" }]}
                faqs={FAQS}
            />

            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "@id": `${SITE_URL}/buy#service`,
                        name: "Buyer representation in Orange County",
                        serviceType: SERVICE.name,
                        description: SERVICE.blurb,
                        provider: { "@id": `${SITE_URL}/#real-estate-agent` },
                        areaServed: [
                            { "@type": "AdministrativeArea", name: "Orange County, CA" },
                            ...AREA.focus.map((city) => ({ "@type": "City", name: city.name })),
                        ],
                        audience: {
                            "@type": "Audience",
                            audienceType: "Home buyers — first-time, move-up, relocating, and investing",
                        },
                        offers: {
                            "@type": "Offer",
                            priceSpecification: {
                                "@type": "PriceSpecification",
                                description:
                                    "Initial consultation provided at no cost. Buyer representation compensation is negotiable and agreed in writing before representation begins.",
                            },
                        },
                    })}
                </script>
            </Helmet>

            <GuideHero
                photo="buy-hero"
                lead="Buy in Orange County,"
                accent="knowing every step."
                service="buying"
                source="buy"
                portal={{ href: NEST_PORTAL.buyer, label: "Or open your buyer account" }}
            >
                {AGENT.displayName} represents home buyers across {AREA.focusLabel} — first-time, moving up, relocating,
                and investing. Every purchase starts with a free consultation that walks through financing,
                contingencies, costs, and timeline before you tour a single home.
            </GuideHero>

            <Seam
                items={[
                    { label: `Single-family median · ${SFH.observed}`, value: SFH.value },
                    { label: DAYS.label, value: DAYS.value },
                    { label: LISTINGS.label, value: LISTINGS.value },
                    { label: "Buyer consultation", value: "No cost" },
                ]}
            />

            <GuidePortal
                heading="Rather start on your own?"
                body={`Open a free buyer account with ${AGENT.firstName} on his brokerage's site. It keeps you connected to him directly, so when you are ready to talk through a home, he already knows what you have been looking at.`}
                points={["Free to create", "Linked directly to Sam", "No obligation to work together", "Book the consultation any time"]}
                href={NEST_PORTAL.buyer}
                action="Open your buyer account"
                source="buy"
            />

            <CitySearch source="buy-city-search" />

            {/* ---------------------------------------------------- Costs */}
            <Band tone="white" density="md" rule={false}>
                <BandHead
                    heading="What it actually costs to buy here."
                    lede="More than the down payment, and the gap is what surprises people. These are the lines to budget before you look."
                    foot={
                        <Link to="/blog/first-time-home-buyer-orange-county" className="link-rule label">
                            The first-time buyer guide
                            <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                        </Link>
                    }
                >
                    <Reveal>
                        <CellGrid cols={2}>
                            {COSTS.map((cost) => (
                                <Cell key={cost.title}>
                                    <h3 className="font-display text-d-item text-ink">{cost.title}</h3>
                                    <p className="mt-3 text-body-sm font-light text-navy-600">{cost.body}</p>
                                </Cell>
                            ))}
                        </CellGrid>
                        <p className="mt-5 text-micro font-light text-navy-400">
                            Median: {SFH.source}, {SFH.observed}, existing detached single-family homes. Figures
                            verified {MARKET.verifiedOn}.
                        </p>
                    </Reveal>
                </BandHead>
            </Band>

            <GuideSteps
                heading="How a purchase runs with Sam."
                lede="Eight steps, in order. The first three happen before you see a single house."
                steps={STEPS}
            />

            {/* ------------------------------------------------ Agreement */}
            <Band tone="cream" density="md" rule={false}>
                <BandHead
                    tone="cream"
                    heading="The agreement you sign before you tour."
                    aside={<Plate name="oak-living" />}
                    bodySticky
                    foot={
                        <Link to="/blog/who-pays-real-estate-agent-commission-california" className="link-rule label">
                            Who pays the commission now
                            <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                        </Link>
                    }
                >
                    <Reveal className="max-w-measure-lg space-y-6 text-body font-light text-navy-600">
                        <p>
                            Since August 17, 2024, national practice has required a written agreement with your agent
                            before you tour a home. Since January 1, 2025, California Civil Code §1670.50 has required
                            a written buyer-broker representation agreement, signed no later than your offer, that
                            states the compensation, the services, when payment is due, and the term — capped at 90
                            days for an individual buyer.
                        </p>
                        <p>
                            You are contractually responsible for that compensation. Sellers still frequently cover
                            some or all of it as a concession negotiated into the purchase, and many buyers still pay
                            nothing out of pocket — but it is no longer automatic, and it is no longer a footnote.
                        </p>
                        <p className="text-ink">
                            {AGENT.firstName} puts the numbers in front of you first — what the agreement says, what
                            it means if a seller offers less, and what is negotiable — so you sign it understanding
                            it.
                        </p>
                    </Reveal>
                </BandHead>
            </Band>

            {/* ------------------------------------------------- Leverage */}
            <Band tone="white" density="md">
                <BandHead
                    heading="What you can negotiate right now."
                    lede={`At ${DAYS.value.replace("≈", "about ")} on market, terms are often worth more than the price concession you did not get.`}
                    foot={
                        <Link to="/blog/is-now-a-good-time-to-buy-a-home-in-orange-county" className="link-rule label">
                            Is now a good time to buy?
                            <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                        </Link>
                    }
                >
                    <Reveal>
                        <CellGrid cols={2}>
                            {LEVERS.map((lever) => (
                                <Cell key={lever.title}>
                                    <h3 className="font-display text-d-item text-ink">{lever.title}</h3>
                                    <p className="mt-3 text-body-sm font-light text-navy-600">{lever.body}</p>
                                </Cell>
                            ))}
                        </CellGrid>

                        <div className="mt-12 border-l border-gold pl-7">
                            <h3 className="font-display text-d-block text-ink">The deadlines that cost people money.</h3>
                            <p className="mt-4 max-w-measure-lg text-body-sm font-light text-navy-600">
                                Inspection, appraisal, and loan contingencies give you a window to investigate and to
                                withdraw with your deposit intact. Remove one before you have the information it was
                                protecting you against, and that protection is gone. Know before you offer what you
                                would do if the appraisal comes in under the contract price — your lender lends against
                                the lower figure, and the difference becomes yours.
                            </p>
                        </div>
                    </Reveal>
                </BandHead>
            </Band>

            {/* Every review and closing on the record is buyer-side — this is where they belong. */}
            <Proof />

            <GuideFaq faqs={FAQS} plate="marble-kitchen" source="buy" />

            <GuideReading
                heading="Read further before you buy."
                slugs={[
                    "first-time-home-buyer-orange-county",
                    "is-now-a-good-time-to-buy-a-home-in-orange-county",
                    "who-pays-real-estate-agent-commission-california",
                ]}
            />

            <ClosingCTA source="buy-closing" service="buying" photo="buy-cta" />
        </div>
    );
}
