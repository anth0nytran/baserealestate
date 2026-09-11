/**
 * Every client-specific fact on this site lives here.
 *
 * Pages import from this module rather than hard-coding a phone number or a
 * headline, so a change of brokerage, licence number, or service area is one
 * edit in one file instead of a grep across twelve components.
 *
 * Anything the client has not yet supplied is marked TODO(client) and carries
 * a visibly provisional value. Nothing in this file is invented: no review,
 * sale count, rating, or licence number is written here unless the client
 * provided it. Search this file for "TODO(client)" before launch.
 */

/* -------------------------------------------------------------------------
 * Identity
 * ---------------------------------------------------------------------- */

/*
 * "Group", not "Real Estate", is load-bearing.
 *
 * Sam is a salesperson licensed under a broker, not a brokerage. A name that
 * reads as a brokerage — "Base Real Estate" — is a misleading trade name under
 * BPC §10159.5 and §10140, and the wordmark, the <title>s, and the schema all
 * derive from this one string. "Base Real Estate Group" names the team; the
 * responsible broker is named separately in LICENSE.brokerage.
 */
export const BRAND = {
    name: "Base Real Estate Group",
    shortName: "Base",
    /** Used in <title> suffixes and the footer copyright line. */
    legalName: "Base Real Estate Group",
    /**
     * The logotype is set as an image, and the supplied artwork reads
     * "BASE REAL ESTATE". `descriptor` is locked up beside it in Jost rather
     * than redrawn in the display face, which nobody has the outlines for.
     * See the wordmark lockup in components/Layout.tsx.
     */
    descriptor: "Group",
    tagline: "Where the right move begins.",
    /** One-line positioning statement. Appears in the footer and llms.txt. */
    positioning:
        "Orange County real estate guided by knowledge, not pressure. Buy, sell, and invest with an advisor whose first job is making sure you understand the decision.",
} as const;

export const AGENT = {
    firstName: "Sam",
    /** Full legal name, as it should appear in schema and licence disclosures. */
    fullName: "Bassam Elsherif",
    /** How he is addressed everywhere in body copy. */
    displayName: 'Bassam "Sam" Elsherif',
    shortDisplayName: "Sam Elsherif",
    title: "REALTOR®",
    role: "Founder & Real Estate Advisor",
} as const;

/* -------------------------------------------------------------------------
 * Contact
 * ---------------------------------------------------------------------- */

export const CONTACT = {
    phone: "(949) 945-8225",
    /** E.164, for tel: links and schema. */
    phoneE164: "+1-949-945-8225",
    /** Digits only, for tel: hrefs. */
    phoneHref: "9499458225",
    email: "sam.elsherif@gmail.com",
    hours: "Mon – Fri, 8 AM – 7 PM",
    hoursNote: "After-hours available by appointment",
    /** Schema openingHoursSpecification. */
    hoursSchema: {
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "19:00",
    },
} as const;

/* -------------------------------------------------------------------------
 * Licensing & brokerage
 *
 * California BPC §10140.6 requires an agent's licence number and responsible
 * broker on marketing material, so both fields below are legal content, not
 * footer decoration.
 *
 * The licence number is verified against the DRE public register
 * (https://www2.dre.ca.gov/PublicASP/pplinfo.asp?License_id=02282409):
 * Elsherif, Bassam Salah — SALESPERSON — #02282409 — LICENSED, issued
 * 06/27/25, expires 06/26/29, no disciplinary action.
 *
 * KNOWN LAG: that same register still named WERE Real Estate Inc (#02102670)
 * as the responsible broker when it was read on 2026-09-10. Sam has moved to
 * Nest Real Estate and confirmed the transfer; the DRE record is expected to
 * catch up, and the register itself warns it does not reflect pending
 * changes. Re-check the link above and remove this note once it does. If the
 * transfer were ever to fall through, `brokerage.name` is the single string
 * to change.
 * ---------------------------------------------------------------------- */

export const LICENSE = {
    /** Verified against the DRE public register, 2026-09-10. */
    dreLicense: "02282409",
    /** Gates the licence half of the disclosure line. */
    dreConfirmed: true,
    brokerage: {
        /**
         * The responsible broker, named as licensed — nestbrokerage.com
         * trades as "Nest Real Estate" (DRE #02174581), so that is the name
         * the disclosure carries, not the domain.
         */
        name: "Nest Real Estate",
        confirmed: true,
        /** No usable Nest artwork supplied; the line is typographic for now. */
        showMark: false,
        mark: "/base/brokerage-mark.png",
    },
} as const;

/**
 * Renders the licence disclosure, degrading a clause at a time.
 *
 * The two halves are gated independently because they arrive independently:
 * a confirmed brokerage with an unverified number, or the reverse, are both
 * states this site has actually been in. Neither is ever invented.
 */
export const licenseLine = (): string =>
    [`${AGENT.shortDisplayName}, ${AGENT.title}`, LICENSE.brokerage.confirmed ? LICENSE.brokerage.name : null, dreLine()]
        .filter(Boolean)
        .join(" · ");

/**
 * The licence number as it must read anywhere it stands on its own.
 *
 * A bare "CA 02282409" is not a licence disclosure — the issuing body has to
 * be legible, and four surfaces print this number without the rest of the
 * line around it. Returns null rather than a placeholder so a caller has to
 * decide what an unconfirmed licence renders as.
 */
export const dreLine = (): string | null => (LICENSE.dreConfirmed ? `CA DRE #${LICENSE.dreLicense}` : null);

/* -------------------------------------------------------------------------
 * Geography
 *
 * Sam's practice is weighted to South Orange County and the coast. The city
 * list inherited from the template build was north-county heavy (Santa Ana,
 * Anaheim, Orange, North Tustin) and did not describe where he actually
 * works; those are still served, but they are not the pitch.
 *
 * `focus` is the SEO/GEO-bearing list — it drives titles, schema areaServed,
 * FAQ answers, and llms.txt. `cities` drives the visual grid and hero
 * rotation, and carries whether real photography exists for each place.
 * ---------------------------------------------------------------------- */

/**
 * A city in the neighbourhood grid and hero rotation.
 *
 * `photo` and `photoAlt` travel together by construction. A photograph with
 * no description of what it shows is how the grid ended up captioning a
 * harbour aerial, a cove, a marina, and a pier all as "Residential street in
 * ..." — true of the generated stock that preceded them, false of every real
 * photograph that replaced it. Making the pair a union means the compiler
 * catches that rather than a reader noticing it a year later.
 */
export type City = {
    name: string;
    slug: string;
    /** One line of genuine local character. Used on tiles and in copy. */
    note: string;
} & (
    | {
          /** Base name of the photograph under /public/neighborhoods. */
          photo: string;
          /** What the photograph actually shows — the frame, not the city. */
          photoAlt: string;
      }
    | {
          /**
           * No licensed photograph of this city exists yet, so the tile
           * renders typographically rather than borrowing a similar-looking
           * coastal frame. A shot captioned "Dana Point" that was taken in
           * Newport is a false claim about a place.
           *
           * TODO(client): to add one, drop a file into
           * assets/renders/photography/cities/<slug>.jpg, add the slug to
           * CITY_SLUGS in scripts/prepare-brand-assets.mjs, set `photo` and
           * `photoAlt` here, and run `npm run images:brand`.
           * See PHOTOGRAPHY.md.
           */
          photo: null;
          photoAlt?: never;
      }
);

export const AREA = {
    primary: "Orange County",
    primaryFull: "Orange County, California",
    /** How Sam's territory is described in a sentence. */
    focusLabel: "South Orange County and the coast",
    state: "CA",
    /** Centroid of the coastal South OC corridor, not the county centroid. */
    geo: { lat: 33.5427, lng: -117.7854 },

    /** The markets Sam actively pursues. Order is priority order. */
    focus: [
        { name: "Newport Beach", slug: "newport-beach" },
        { name: "Laguna Beach", slug: "laguna-beach" },
        { name: "Dana Point", slug: "dana-point" },
        { name: "Laguna Niguel", slug: "laguna-niguel" },
    ],

    /** Cities rendered in the neighbourhood grid and hero rotation. */
    cities: [
        { name: "Newport Beach", slug: "newport-beach", photo: "newport-beach", photoAlt: "Balboa Pier and moored sailboats in Newport Harbour, Newport Beach, California", note: "Harbour, peninsula, and the bluffs above it" },
        { name: "Laguna Beach", slug: "laguna-beach", photo: "laguna-beach", photoAlt: "Bluff-top homes above a sandy cove at Laguna Beach, California", note: "Coves, canyon lots, and a market of one-offs" },
        { name: "Dana Point", slug: "dana-point", photo: "dana-point", photoAlt: "Boats moored in Dana Point Harbour behind the breakwater, Dana Point, California", note: "Harbour-side, Monarch Beach, and the headlands" },
        { name: "Laguna Niguel", slug: "laguna-niguel", photo: "laguna-niguel", photoAlt: "Coastal canyon and ridgeline seen from the trail at Badlands Park, Laguna Niguel, California", note: "Inland hills with coastal access" },
        { name: "Huntington Beach", slug: "huntington-beach", photo: "huntington-beach", photoAlt: "Huntington Beach Pier and surfers in the water, Huntington Beach, California", note: "Downtown, Huntington Harbour, and the wetlands" },
        { name: "Costa Mesa", slug: "costa-mesa", photo: "costa-mesa", photoAlt: "Sandstone and running water in Isamu Noguchi's California Scenario garden, Costa Mesa, California", note: "Eastside character, close to everything" },
        { name: "Irvine", slug: "irvine", photo: "irvine", photoAlt: "White footbridge over the lake at Woodbridge, with snow on the mountains behind, Irvine, California", note: "Villages, schools, and predictable inventory" },
        { name: "San Clemente", slug: "san-clemente", photo: "san-clemente", photoAlt: "Bluff-top homes above the coastal rail line and the pier clock tower, San Clemente, California", note: "The south end of the county, and the quietest coast" },
    ] as const satisfies readonly City[],

    /** Served, and named for completeness, but not the focus of the practice. */
    alsoServing: [
        "Corona Del Mar",
        "San Juan Capistrano",
        "Aliso Viejo",
        "Mission Viejo",
        "Tustin",
        "Orange",
        "Santa Ana",
        "Anaheim",
    ],
} as const;

/** Cities with real photography — the only ones that render an image tile. */
export const PHOTOGRAPHED_CITIES = AREA.cities.filter((city) => city.photo !== null);

/* -------------------------------------------------------------------------
 * Offer & services
 *
 * Ordered exactly as the client ranked them. `knowledge-transfer` is the
 * declared focal point and is treated as the hero service throughout.
 * ---------------------------------------------------------------------- */

export const PRIMARY_CTA = {
    label: "Book a Consultation",
    shortLabel: "Book Consultation",
    href: "/contact",
    /** The single reason to act today. */
    promise: "A no-pressure consultation where you leave understanding the market better than you arrived.",
} as const;

/**
 * Responsive source set for the property photography in /public/services.
 *
 * Regenerated by `npm run images:brand` from the originals in
 * assets/renders/photography/services, which are not deployed.
 */
export const propertyPhoto = (name: string) => ({
    src: `/services/${name}-2400.webp`,
    srcSet: `/services/${name}-1280.webp 1280w, /services/${name}-2400.webp 2400w`,
});

/* -------------------------------------------------------------------------
 * Editorial photography
 *
 * Interior and architectural detail shots used as section imagery — the
 * quiet frames between the headline photographs. Unlike AREA.cities these
 * make no claim about *where* they were taken, so they can be placed on
 * feeling alone; that is exactly why none of them may ever be captioned with
 * a city name.
 *
 * Selected against the brand palette rather than at random: white walls,
 * cream and sand textiles, brass and pale oak, navy water. Nothing shot at
 * dusk — the client rejected a dark site explicitly, and a twilight interior
 * drags the whole band down with it however good the photograph is.
 * ---------------------------------------------------------------------- */

export type EditorialName =
    | "entry"
    | "living"
    | "kitchen"
    | "facade"
    | "bluff"
    | "terrace"
    | "water"
    | "coastline";

/** What each frame shows, for alt text and for choosing between them. */
export const EDITORIAL: Record<EditorialName, string> = {
    entry: "Entry hall of a coastal home in white oak and brass, opening to an ocean view",
    living: "Bright living room in cream and sand tones with full-height windows",
    kitchen: "White and gold marble kitchen island with brass counter stools",
    facade: "White modernist house facade against a clear sky",
    bluff: "White coastal homes on a bluff above the Pacific",
    terrace: "Glass-walled house opening onto a pool terrace in daylight",
    water: "Paddleboarders crossing deep navy open water, seen from above",
    coastline: "Southern California coastline curving away past a hillside town",
};

/**
 * Responsive source set for an editorial frame.
 *
 * No fixed aspect: these are cropped by the layout with object-fit, so the
 * same file serves a tall cell, a wide band, and a square detail.
 */
export const editorialPhoto = (name: EditorialName) => ({
    src: `/editorial/${name}-2000.webp`,
    srcSet: `/editorial/${name}-1200.webp 1200w, /editorial/${name}-2000.webp 2000w`,
    alt: EDITORIAL[name],
});

export interface Service {
    id: string;
    /** Query value posted to /api/send. Must match ALLOWED_SERVICES there. */
    value: string;
    name: string;
    short: string;
    blurb: string;
    /** Three concrete things the client actually receives. */
    includes: readonly string[];
    /** Base name for propertyPhoto(). */
    photo: string;
}

export const SERVICES: readonly Service[] = [
    {
        id: "knowledge",
        value: "knowledge",
        name: "Knowledge Transfer",
        short: "Understand the decision before you make it",
        blurb:
            "Most people buy a home having never been taught how the process actually works. Sam starts every relationship by fixing that — walking you through financing, contingencies, timelines, and cost, in plain language, until the decision is genuinely yours.",
        includes: [
            "A walkthrough of the full transaction, start to close",
            "Straight answers on cost, timing, and what can go wrong",
            "No obligation to transact — ever",
        ],
        photo: "hero",
    },
    {
        id: "consulting",
        value: "consulting",
        name: "Real Estate Consulting",
        short: "A second opinion with nothing to sell you",
        blurb:
            "Deciding whether to hold, sell, refinance, or wait is not a listing question — it is a strategy question. Sam works through the numbers on your specific property and situation and tells you what he would do, including when the answer is do nothing.",
        includes: [
            "Property-specific analysis against current market data",
            "Hold, sell, or wait — with the reasoning shown",
            "Honest recommendation, including \"not yet\"",
        ],
        photo: "aerial",
    },
    {
        id: "buying",
        value: "buying",
        name: "Home Purchase",
        short: "Buy the right home, on the right terms",
        blurb:
            "From first-time buyers to move-up families, Sam represents you through search, offer, inspection, and close — negotiating on terms as hard as on price, because in Orange County the terms are often where the money actually is.",
        includes: [
            "Search shaped around your real criteria, not the MLS default",
            "Offer strategy built for a competitive market",
            "Guidance held all the way through escrow",
        ],
        photo: "buy",
    },
    {
        id: "selling",
        value: "selling",
        name: "Home Sale",
        short: "Priced on evidence, marketed properly",
        blurb:
            "A listing price is a hypothesis, and the market tests it within two weeks. Sam prices from comparable evidence, prepares the property honestly, and manages the negotiation so the number on the contract survives to the closing statement.",
        includes: [
            "Pricing built from comparable sales, shown to you",
            "Preparation and photography that earn the showings",
            "Negotiation through appraisal and inspection",
        ],
        photo: "sell",
    },
    {
        id: "investing",
        value: "investing",
        name: "Investor Assistance",
        short: "Numbers first, property second",
        blurb:
            "Investment property is underwriting before it is real estate. Sam models cash flow, carrying cost, and exit before anyone tours anything — so the properties you see are the ones that already survived the math.",
        includes: [
            "Cash-flow and carrying-cost modelling",
            "Neighbourhood-level rent and appreciation context",
            "Exit strategy considered before entry",
        ],
        photo: "cta",
    },
] as const;

/* -------------------------------------------------------------------------
 * Market data
 *
 * Every figure carries its source and its observation date, and anything
 * derived here is labelled as a calculation rather than a published statistic.
 * That is the rule the whole site is held to — it is also the single strongest
 * reason for an answer engine to cite this page instead of one of the many
 * Orange County sites that publish a median price with no date and no source.
 *
 * REFRESH MONTHLY. `asOf` drives the "verified" line rendered next to the
 * table; a stale date is worse than no date, because it is a claim.
 * ---------------------------------------------------------------------- */

export interface MarketFigure {
    label: string;
    value: string;
    /** What the number actually counts. The methodology IS the story here. */
    basis: string;
    source: string;
    sourceUrl: string;
    observed: string;
}

export const MARKET = {
    asOf: "September 2026",
    /** Set to the month the figures below were last verified against source. */
    verifiedOn: "2026-09-02",

    /*
     * The two-medians comparison. A buyer searching "Orange County median home
     * price" gets answers roughly $270,000 apart depending on the source, and
     * almost nobody explains why. The gap is entirely methodology: C.A.R.
     * counts existing detached single-family homes only; Redfin counts all
     * home types, condos and townhomes included, which pulls the median down.
     */
    medians: [
        {
            label: "Existing single-family homes",
            value: "$1,470,000",
            basis: "Detached single-family resales only. Excludes condos, townhomes, and new construction.",
            source: "California Association of REALTORS®",
            sourceUrl: "https://www.car.org/marketdata/data/countysalesactivity",
            observed: "July 2026",
        },
        {
            label: "All home types",
            value: "≈$1,200,000",
            basis: "Every property type, including condos and townhomes, which pulls the median down.",
            source: "Redfin",
            sourceUrl: "https://www.redfin.com/county/332/CA/Orange-County/housing-market",
            observed: "August 2026",
        },
    ] as const satisfies readonly MarketFigure[],

    /** Derived by Base Real Estate Group from the two rows above. Labelled as such. */
    medianGap: "≈$270,000",

    conditions: [
        {
            label: "Median days on market",
            value: "≈54 days",
            basis: "Up from roughly 40 days a year earlier — the clearest sign of a slower market.",
            source: "Redfin",
            sourceUrl: "https://www.redfin.com/county/332/CA/Orange-County/housing-market",
            observed: "August 2026",
        },
        {
            label: "Active listings",
            value: "≈5,165",
            basis: "A 2026 high. More choice for buyers than at any point this year.",
            source: "Orange County weekly housing report",
            sourceUrl: "https://www.ocrealestateinc.com/orange-county-housing-report/",
            observed: "Late August 2026",
        },
        {
            label: "Year-over-year price change",
            value: "+3.2%",
            basis: "July 2026 versus July 2025, existing single-family detached homes.",
            source: "California Association of REALTORS®",
            sourceUrl: "https://www.car.org/marketdata/data/countysalesactivity",
            observed: "July 2026",
        },
    ] as const satisfies readonly MarketFigure[],
} as const;

/* -------------------------------------------------------------------------
 * Ideal client & brand promises
 * ---------------------------------------------------------------------- */

export const AUDIENCE = "home buyers of all types — first-time, move-up, relocating, and investing";

/** The four feelings the client named, translated into claims the site can keep. */
export const PROMISES = [
    {
        title: "Trustworthy",
        body: "You will never be told something is a good idea because it happens to be a transaction. If waiting is the better move, that is what you will hear.",
    },
    {
        title: "Subject-Matter Expertise",
        body: "Orange County pricing, financing, and contract mechanics — explained clearly enough that you could explain them to someone else.",
    },
    {
        title: "Loyalty",
        body: "One advisor, start to finish. The person you meet at the consultation is the person negotiating your contract.",
    },
    {
        title: "Your Interest First",
        body: "Every recommendation is made against what you said you wanted, not against what closes fastest.",
    },
] as const;

/* -------------------------------------------------------------------------
 * Process
 * ---------------------------------------------------------------------- */

export const PROCESS = [
    {
        step: "01",
        title: "The Consultation",
        body: "A conversation, not a pitch. What you own, what you want, what you are worried about. Nothing is decided in this meeting.",
    },
    {
        step: "02",
        title: "The Education",
        body: "Sam walks you through exactly how the transaction ahead of you works — financing, contingencies, costs, timeline — until it stops feeling opaque.",
    },
    {
        step: "03",
        title: "The Strategy",
        body: "With the mechanics understood, you set the plan together: price, timing, target areas, and what you are and are not willing to trade.",
    },
    {
        step: "04",
        title: "The Execution",
        body: "Search, offer, negotiation, inspection, escrow. Sam runs it and keeps you informed at every decision point.",
    },
    {
        step: "05",
        title: "After the Close",
        body: "Vendor referrals, market updates, and a standing second opinion on the asset you now own. The relationship does not end at funding.",
    },
] as const;

/* -------------------------------------------------------------------------
 * Social proof
 *
 * Every quote, figure, and closing below was read off Sam's Zillow agent
 * profile on 11 September 2026 and is reproduced, not summarised. Quotes are
 * verbatim excerpts; where a word was obviously dropped by the reviewer it is
 * restored in [brackets] and nothing else is touched.
 *
 * Two of Zillow's own summary tiles are NOT republished here. Its profile
 * shows a "$930K-$1.3M" price range and a "$1.1M" average against a sales
 * list whose top closing is $1,390,000 and whose mean is $1,187,200 — the
 * tiles disagree with the list on the same page. The list is the primary
 * record, so the figures in STATS are computed from it and labelled as
 * derived. If Zillow ever fixes its tiles the numbers here should still hold.
 * ---------------------------------------------------------------------- */

/** Where the reviews and closings below can be checked, by anyone. */
export const PROOF_SOURCE = {
    label: "Zillow",
    profileUrl: "https://www.zillow.com/profile/sam75344",
    /** Re-read this profile and this date together, or neither. */
    verifiedOn: "2026-09-11",
    verifiedLabel: "11 September 2026",
    rating: "5.0",
    reviewCount: 6,
} as const;

export interface Review {
    quote: string;
    name: string;
    detail: string;
}

export const PROOF = {
    hasReviews: true,
    hasStats: true,
    hasSales: true,
} as const;

/*
 * Ordered by what each one demonstrates, not by date. The first is the
 * clearest statement of the thing this whole site claims — that you always
 * know where you stand — and the carousel opens on it.
 */
export const REVIEWS: readonly Review[] = [
    {
        quote:
            "From the very beginning, he made sure we always knew exactly where we stood. He explained every development in plain language, never left us wondering what was happening or why.",
        name: "Carol Curchoe",
        detail: "Bought a condo in Newport Beach · April 2026",
    },
    {
        quote:
            "When we were touring homes, Sam helped call out green and red flags to look out for in different homes and we learned a lot by working together.",
        name: "Alex Cheng",
        detail: "Bought a single-family home in Yorba Linda · April 2026",
    },
    {
        quote:
            "He was lightning fast getting an offer together, working with lenders and inspectors on a short timeline, and communicating night and day through the process.",
        name: "tanneravery6",
        detail: "Bought a home in Orange County · March 2026",
    },
    {
        quote:
            "Sam was always available to answer our questions, offered honest advice, and guided us through every step with professionalism.",
        name: "Emirjona Bashi",
        detail: "Bought a home in Orange County · July 2026",
    },
    {
        quote:
            "He's very knowledgeable and proved to be an advantage to us. He'll understand what you want and need and will go out and find what will fit you.",
        name: "Ken",
        detail: "Bought a single-family home in Santa Ana · June 2026",
    },
    {
        quote:
            "Sam ultimately was trying to make sure I was [in a] home that I'd be comfortable in and not trying to get a sale.",
        name: "mcalister95",
        detail: "Bought a home in Orange County · March 2026",
    },
];

/*
 * Four figures: two countable off the profile, two arithmetic on CLOSINGS
 * below — which is why the band that renders them carries the source line
 * rather than leaving a reader to assume Zillow published them.
 *
 * Every value is kept short enough to set on one line. A four-column cell at
 * display size fits about seven characters; "$930K–$1.39M" wrapped mid-figure
 * and shoved its own label out of the cell, which is why the price range is
 * left to the closings list — where each end of it is a checkable address
 * rather than a number a reader has to take on faith.
 */
export const STATS: readonly { value: string; label: string }[] = [
    { value: "5.0", label: `Rating across ${PROOF_SOURCE.reviewCount} reviews` },
    { value: "5", label: "Homes closed, last 12 months" },
    { value: "$1.19M", label: "Average closed price" },
    { value: "$5.9M", label: "Closed volume" },
];

/**
 * A closed transaction, as published on the source profile.
 *
 * `closed` is a month, but Zillow publishes these as "sold 4 months ago"
 * relative to the read date — so each month here is that offset applied to
 * PROOF_SOURCE.verifiedOn, and is accurate to about a month either way. It is
 * rendered as the month it is, not as a date, for exactly that reason.
 */
export interface Closing {
    address: string;
    city: string;
    price: string;
    /** "3 bd · 2.5 ba · 1,730 sqft", pre-composed so the grid stays dumb. */
    spec: string;
    /** Which side of the table Sam sat on. */
    side: "Buyer" | "Seller";
    closed: string;
}

export const CLOSINGS: readonly Closing[] = [
    {
        address: "21 Stern St",
        city: "Laguna Niguel",
        price: "$1,290,000",
        spec: "3 bd · 2.5 ba · 1,730 sqft",
        side: "Buyer",
        closed: "May 2026",
    },
    {
        address: "3418 S Baker St",
        city: "Santa Ana",
        price: "$1,390,000",
        spec: "4 bd · 3 ba · 2,125 sqft",
        side: "Buyer",
        closed: "May 2026",
    },
    {
        address: "19811 Sienna Ln",
        city: "Yorba Linda",
        price: "$1,275,000",
        spec: "3 bd · 2 ba · 1,680 sqft",
        side: "Buyer",
        closed: "April 2026",
    },
    {
        address: "21 Summerwalk Ct",
        city: "Newport Beach",
        price: "$930,000",
        spec: "2 bd · 2 ba · 989 sqft",
        side: "Buyer",
        closed: "April 2026",
    },
    {
        address: "28 Hermosa Ave",
        city: "Long Beach",
        price: "$1,051,000",
        spec: "2 bd · 1 ba · 1,184 sqft",
        side: "Buyer",
        closed: "February 2026",
    },
];

/* -------------------------------------------------------------------------
 * Lead qualification
 *
 * The exact fields the client asked for, in the order he asked for them.
 * `value` strings are the contract with api/send.ts — change both together.
 * ---------------------------------------------------------------------- */

export const URGENCY_OPTIONS = [
    { value: "immediately", label: "Right away — this week" },
    { value: "2-4-weeks", label: "In the next 2–4 weeks" },
    { value: "1-3-months", label: "1–3 months out" },
    { value: "3-6-months", label: "3–6 months out" },
    { value: "researching", label: "Still researching" },
] as const;

/**
 * Market/area of interest.
 *
 * Derived from AREA so the form can never drift from the service areas the
 * rest of the site advertises. These `value` strings are the contract with
 * ALLOWED_MARKETS in api/send.ts — change both together, or a valid
 * submission starts getting rejected.
 */
export const MARKET_OPTIONS = [
    ...AREA.cities.map((city) => ({ value: city.slug, label: city.name })),
    ...AREA.alsoServing.map((name) => ({
        value: name.toLowerCase().replace(/\s+/g, "-"),
        label: name,
    })),
    { value: "elsewhere-oc", label: "Elsewhere in Orange County" },
    { value: "undecided", label: "Not sure yet — need guidance" },
] as const;

/* -------------------------------------------------------------------------
 * Deployment
 *
 * TODO(client): domain not chosen. SITE_URL is referenced by canonical tags,
 * OG tags, sitemap.xml, robots.txt, llms.txt, and the JSON-LD @id graph in
 * index.html. Changing it is one edit here plus one in index.html.
 * ---------------------------------------------------------------------- */

export const SITE_URL = "https://www.baserealestate.com";

export const CREDIT = {
    label: "QuickLaunchWeb",
    href: "https://quicklaunchweb.us",
} as const;
