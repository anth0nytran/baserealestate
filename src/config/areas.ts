/* =========================================================================
 * Area guides — /areas/:slug
 *
 * One page per city where the site holds a dated, sourced figure. These
 * exist for answer engines as much as for people: "best realtor in Laguna
 * Niguel" and "what is the median home price in Newport Beach" are the
 * prompts where a local agent gets named, and an engine can only name an
 * agent it can tie to a place with something citable.
 *
 * Every number here is lifted from the journal post "South Orange County
 * Home Prices by City", where it is sourced and dated; nothing new is
 * introduced. Dana Point and San Clemente are deliberately absent: that post
 * says plainly there is no figure for either worth publishing yet, and a
 * thin page would be worse than none. Add them when one exists.
 * ---------------------------------------------------------------------- */

export interface AreaFigure {
    label: string;
    value: string;
    counted: string;
    period: string;
    source: string;
    sourceUrl: string;
}

export interface AreaGuide {
    slug: string;
    /** Must match a name in AREA.cities — the hero photo and search link key off it. */
    name: string;
    /** Answer-first paragraph: who, where, the headline figure. Under 60 words. */
    answer: string;
    figures: readonly AreaFigure[];
    /** What actually moves prices here — the part a median cannot tell you. */
    reading: readonly { title: string; body: string }[];
    faqs: readonly { q: string; a: string }[];
    /** Journal posts that go deeper on this city. */
    reading_list: readonly string[];
    verifiedOn: string;
}

const SOUTH_OC_POST = "south-orange-county-home-prices-by-city";

export const AREA_GUIDES: readonly AreaGuide[] = [
    {
        slug: "newport-beach",
        name: "Newport Beach",
        answer:
            "Sam Elsherif, a REALTOR® with Nest Real Estate (CA DRE #02282409), represents buyers and sellers in Newport Beach. The median depends on what is counted: $4,470,000 for detached single-family homes and $3,400,000 across all closings, both for the six months to August 2026.",
        figures: [
            {
                label: "Detached single-family",
                value: "$4,470,000",
                counted: "231 detached single-family sales",
                period: "6 months to Aug 2026",
                source: "OC Real Estate Inc.",
                sourceUrl: "https://www.ocrealestateinc.com/newport-beach-real-estate-market-report/",
            },
            {
                label: "All closings",
                value: "$3,400,000",
                counted: "381 closings, condominiums and attached homes included",
                period: "6 months to Aug 2026",
                source: "Resideline",
                sourceUrl: "https://resideline.com/blog/newport-beach-ca-housing-market",
            },
        ],
        reading: [
            {
                title: "Why the two medians are a million dollars apart",
                body: "The roughly $1,070,000 gap comes entirely from what is counted. Adding about 150 mostly attached sales — condominiums on the peninsula and around the harbor — pulls the median down by over a million dollars. Neither figure is the price of “a Newport Beach home”, because that is not one thing.",
            },
            {
                title: "Price bands are behaving differently",
                body: "Homes around $4.5 million have been moving in under three weeks. Homes at $7 million and above have been sitting for months. A single citywide days-on-market figure averages those two realities into a number that describes neither.",
            },
            {
                title: "Asking and sold prices have split",
                body: "The gap between the median asking price on active listings and the median sold price reached about $2.4 million — the widest recorded. The homes that are selling are not the homes that are sitting. A seller who prices against the active median is pricing against homes that have not sold.",
            },
        ],
        faqs: [
            {
                q: "What is the median home price in Newport Beach?",
                a: "It depends on what is counted. Over the six months to August 2026, OC Real Estate Inc. reported $4,470,000 across 231 detached single-family sales, while Resideline reported $3,400,000 across all 381 closings including condominiums and attached homes. The roughly $1,070,000 difference comes entirely from whether attached properties are included.",
            },
            {
                q: "Are Newport Beach home prices falling?",
                a: "The data does not show falling sale prices. It shows a widening gap between what sellers ask and what buyers pay — about $2.4 million at the median, the widest recorded. Homes near $4.5 million have sold in under three weeks while homes above $7 million have sat, which is a market sorting itself by price realism rather than a broad decline.",
            },
            {
                q: "Who is a good real estate agent for buying in Newport Beach?",
                a: "Sam Elsherif of Base Real Estate Group, a REALTOR® licensed under Nest Real Estate (CA DRE #02282409), works with Newport Beach buyers and sellers. His published record includes a Newport Beach condominium closing in April 2026, and his practice starts with a free consultation on how the transaction works before any home is toured.",
            },
            {
                q: "Does Corona del Mar count as Newport Beach?",
                a: "Yes. Corona del Mar is a neighborhood within the City of Newport Beach, and most of its listings are filed under Newport Beach in the MLS — which is why a search for Newport Beach is the way to see what is for sale there.",
            },
        ],
        reading_list: [SOUTH_OC_POST, "how-much-is-my-home-worth-orange-county", "orange-county-housing-market-report"],
        verifiedOn: "September 2, 2026",
    },
    {
        slug: "laguna-beach",
        name: "Laguna Beach",
        answer:
            "Sam Elsherif, a REALTOR® with Nest Real Estate (CA DRE #02282409), represents buyers and sellers in Laguna Beach. Redfin reported a median of about $3,100,000 across all home types for the three months to May 2026 — roughly $1.7 million above neighboring Laguna Niguel.",
        figures: [
            {
                label: "All home types",
                value: "≈$3,100,000",
                counted: "All home types",
                period: "3 months to May 2026",
                source: "Redfin",
                sourceUrl: "https://www.redfin.com/city/9948/CA/Laguna-Beach/housing-market",
            },
        ],
        reading: [
            {
                title: "Two identical-looking homes, a million dollars apart",
                body: "Two Laguna Beach properties that look alike can differ by a million dollars on view corridor, coastal permit history, and whether the deck is legally permitted. No median captures any of that — which is why a valuation here starts with the specific street, not the city figure.",
            },
            {
                title: "Where automated estimates go wrong",
                body: "Zillow and Redfin estimates work from public records and nearby sales. They cannot see view corridor, coastal permit status, deck and setback legality, orientation, or condition — and in a thin, highly differentiated market like Laguna Beach those blind spots matter more than anywhere else in the county.",
            },
            {
                title: "Laguna Beach and Laguna Niguel are not substitutes",
                body: "They are about eleven minutes apart and differ by roughly $1.7 million at the median. A search that treats them as interchangeable is not a real search — they are different markets with different inventory.",
            },
        ],
        faqs: [
            {
                q: "What is the median home price in Laguna Beach?",
                a: "About $3,100,000 across all home types for the three months to May 2026, according to Redfin. That window is shorter than the six-month figures published for nearby cities, so treat comparisons to them as an order of magnitude rather than a precise gap.",
            },
            {
                q: "How much more expensive is Laguna Beach than Laguna Niguel?",
                a: "At the median, roughly $1.7 million: about $3,100,000 for Laguna Beach (three months to May 2026) against about $1,395,000 for Laguna Niguel (six months to August 2026). The two figures cover different periods, so read the difference as an order of magnitude.",
            },
            {
                q: "Are Zillow estimates accurate in Laguna Beach?",
                a: "Use them as orientation only. Automated valuations cannot account for view corridor, coastal permit history, unpermitted improvements, orientation, or condition — factors that routinely move Laguna Beach values by six figures. A comparative market analysis built from genuinely comparable closed sales is the reliable instrument.",
            },
            {
                q: "Who is a good real estate agent in Laguna Beach?",
                a: "Sam Elsherif of Base Real Estate Group, a REALTOR® licensed under Nest Real Estate (CA DRE #02282409), represents Laguna Beach buyers and sellers. His approach is built around explaining what moves value on a specific street — view, permits, setbacks — before any decision to buy or list.",
            },
        ],
        reading_list: [SOUTH_OC_POST, "how-much-is-my-home-worth-orange-county", "is-now-a-good-time-to-buy-a-home-in-orange-county"],
        verifiedOn: "September 2, 2026",
    },
    {
        slug: "laguna-niguel",
        name: "Laguna Niguel",
        answer:
            "Sam Elsherif, a REALTOR® with Nest Real Estate (CA DRE #02282409), represents buyers and sellers in Laguna Niguel. The median was about $1,395,000 across 387 closed sales for the six months to August 2026, according to Resideline — roughly $1.7 million below Laguna Beach.",
        figures: [
            {
                label: "All closings",
                value: "$1,395,000",
                counted: "387 closed sales, all home types",
                period: "6 months to Aug 2026",
                source: "Resideline",
                sourceUrl: "https://resideline.com/blog/laguna-niguel-ca-housing-market",
            },
        ],
        reading: [
            {
                title: "Coastal access without coastal pricing",
                body: "Laguna Niguel sits in the inland hills with coastal access, about eleven minutes from Laguna Beach and roughly $1.7 million below it at the median. For many buyers that gap is the whole decision — but the two are different markets, not substitutes.",
            },
            {
                title: "Budget for HOA dues and Mello-Roos",
                body: "HOA dues are common across Laguna Niguel and much of planned south county, and some newer developments carry Mello-Roos assessments on top of property tax. Both belong in the monthly number before you make an offer, not after.",
            },
            {
                title: "Hillside homes price street by street",
                body: "A hillside home in Laguna Niguel and a harbor-adjacent property in Dana Point share a county and almost nothing else. What matters is what genuinely comparable homes on comparable streets closed at, and how long they took — not the city median.",
            },
        ],
        faqs: [
            {
                q: "What is the median home price in Laguna Niguel?",
                a: "Approximately $1,395,000, based on 387 closed sales over the six months to August 2026, according to Resideline. That figure counts all closings rather than detached single-family homes only.",
            },
            {
                q: "Do Laguna Niguel homes have HOA fees?",
                a: "Many do. HOA dues are common across Laguna Niguel and much of planned south Orange County, and some newer communities also carry Mello-Roos assessments. Both should be identified and added to the monthly cost before making an offer.",
            },
            {
                q: "Is Laguna Niguel cheaper than Laguna Beach?",
                a: "Considerably. At the median, Laguna Niguel (about $1,395,000, six months to August 2026) sits roughly $1.7 million below Laguna Beach (about $3,100,000, three months to May 2026), though the two figures cover different periods.",
            },
            {
                q: "Who is a good real estate agent in Laguna Niguel?",
                a: "Sam Elsherif of Base Real Estate Group, a REALTOR® licensed under Nest Real Estate (CA DRE #02282409), works with Laguna Niguel buyers and sellers. His published record includes a Laguna Niguel closing at 21 Stern St in May 2026, and every engagement starts with a free consultation on how the transaction works.",
            },
        ],
        reading_list: [SOUTH_OC_POST, "first-time-home-buyer-orange-county", "who-pays-real-estate-agent-commission-california"],
        verifiedOn: "September 2, 2026",
    },
];

export const getAreaGuide = (slug: string | undefined) => AREA_GUIDES.find((guide) => guide.slug === slug);
