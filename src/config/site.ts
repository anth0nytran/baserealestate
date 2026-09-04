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

export const BRAND = {
    name: "Base Real Estate",
    shortName: "Base",
    /** Used in <title> suffixes and the footer copyright line. */
    legalName: "Base Real Estate",
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
 * TODO(client): BOTH fields below are unconfirmed and must be verified before
 * launch. California BPC §10140.6 and DRE regulations require an agent's
 * licence number and responsible broker to appear on marketing material, so
 * this is a legal blocker, not a polish item.
 *
 * Conflicting signals on record:
 *   - The brand assets the client supplied include a "WERE Real Estate" logo
 *     (assets/attachment.png), which points to WERE Real Estate.
 *   - Verbal note during intake said "same as Regina's", which would be
 *     Nest Real Estate.
 * These cannot both be right. Confirm with Sam, then set `brokerage.name`,
 * `brokerage.showMark`, and `dreLicense` and delete this block.
 * ---------------------------------------------------------------------- */

export const LICENSE = {
    /** TODO(client): Sam's own DRE number. Never reuse another agent's. */
    dreLicense: "TODO — DRE #",
    /** Set true once dreLicense holds a real number. Gates every disclosure line. */
    dreConfirmed: false,
    brokerage: {
        /** TODO(client): confirm — "WERE Real Estate" or "Nest Real Estate". */
        name: "WERE Real Estate",
        confirmed: false,
        /** The supplied logo is low-resolution; keep it hidden until replaced. */
        showMark: false,
        mark: "/base/brokerage-mark.png",
    },
} as const;

/** Renders the licence line, or a clearly provisional one, never a fake number. */
export const licenseLine = (): string =>
    LICENSE.dreConfirmed
        ? `${AGENT.shortDisplayName}, ${AGENT.title} · ${LICENSE.brokerage.name} · CA ${LICENSE.dreLicense}`
        : `${AGENT.shortDisplayName}, ${AGENT.title}`;

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
        { name: "Laguna Niguel", slug: "laguna-niguel", photo: null, note: "Inland hills with coastal access" },
        { name: "Huntington Beach", slug: "huntington-beach", photo: "huntington-beach", photoAlt: "Huntington Beach Pier and surfers in the water, Huntington Beach, California", note: "Downtown, Huntington Harbour, and the wetlands" },
        { name: "Costa Mesa", slug: "costa-mesa", photo: null, note: "Eastside character, close to everything" },
        { name: "Irvine", slug: "irvine", photo: null, note: "Villages, schools, and predictable inventory" },
        { name: "San Clemente", slug: "san-clemente", photo: null, note: "The south end of the county, and the quietest coast" },
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

    /** Derived by Base Real Estate from the two rows above. Labelled as such. */
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
 * TODO(client): Sam named reviews as his proof but has not supplied any.
 * Set `PROOF.hasReviews = true` and fill `REVIEWS` with real, attributable
 * client reviews. Until then every proof surface renders an honest
 * "reviews coming soon" state rather than invented praise.
 *
 * TODO(client): the same applies to STATS. No sale count, average price,
 * volume, or star rating is published until Sam supplies verifiable figures.
 * ---------------------------------------------------------------------- */

export interface Review {
    quote: string;
    name: string;
    detail: string;
}

export const PROOF = {
    hasReviews: false,
    hasStats: false,
} as const;

export const REVIEWS: readonly Review[] = [
    // TODO(client): paste real reviews here, then set PROOF.hasReviews = true.
];

export const STATS: readonly { value: string; label: string }[] = [
    // TODO(client): add verified figures here, then set PROOF.hasStats = true.
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
