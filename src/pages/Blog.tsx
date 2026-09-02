import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO, { SITE_URL } from "../hooks/useSEO";
import Reveal, { HeadlineDraw } from "../components/Reveal";
import { Band, BandHead, Seam } from "../components/Section";
import { posts, formatDate, type BlogPost } from "@/lib/blog";
import { AGENT, AREA, BRAND, MARKET, PRIMARY_CTA } from "@/config/site";
import { trackCtaClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Journal hub.
 *
 * Nothing here is wrapped in a scroll-reveal that could hide it: the
 * prerendered markup is the whole point of this route existing, and it has to
 * be readable by crawlers and answer engines that never run JavaScript.
 */
export default function Blog() {
    const [featured, ...rest] = posts;

    return (
        <div className="w-full overflow-x-hidden">
            <SEO
                title="Orange County Market Reports & Buyer Guides"
                description={`Sourced Orange County housing market reports and buyer and seller guides from ${AGENT.displayName}, ${AGENT.title}. Every figure carries its source and its observation date.`}
                path="/blog"
                breadcrumbs={[{ name: "Journal", path: "/blog" }]}
            />

            {/* Blog schema helps answer engines reason about the collection. */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Blog",
                        "@id": `${SITE_URL}/blog#blog`,
                        name: `${BRAND.name} — Orange County Market Journal`,
                        description:
                            "Sourced Orange County housing market reports and home buying and selling guides.",
                        url: `${SITE_URL}/blog`,
                        inLanguage: "en-US",
                        publisher: { "@id": `${SITE_URL}/#real-estate-agent` },
                        blogPost: posts.map((post) => ({
                            "@type": "BlogPosting",
                            "@id": `${SITE_URL}/blog/${post.slug}#article`,
                            headline: post.title,
                            description: post.description,
                            url: `${SITE_URL}/blog/${post.slug}`,
                            datePublished: post.datePublished,
                            dateModified: post.dateModified,
                            author: { "@id": `${SITE_URL}/#sam-elsherif` },
                        })),
                    })}
                </script>
            </Helmet>

            <BlogHero />

            <Seam
                items={[
                    { label: "Guides published", value: String(posts.length) },
                    { label: "Coverage", value: AREA.focusLabel },
                    { label: "Data refreshed", value: MARKET.asOf },
                    { label: "Every figure", value: "Sourced & dated" },
                ]}
            />

            {featured && <FeaturedPost post={featured} />}
            <PostGrid posts={rest} />
            <BlogCTA />
        </div>
    );
}

/* ========================================================================== */

const BlogHero = () => (
    <section className="on-navy bg-navy text-cream">
        <div className="mx-auto max-w-shell px-gutter pb-sec-sm pt-44 md:pt-52">
            <div className="max-w-3xl">
                <h1 className="mb-8 font-display text-d-page text-cream">
                    <HeadlineDraw delay={100}>Real numbers.</HeadlineDraw>{" "}
                    <HeadlineDraw delay={380} className="italic text-gold-300">
                        Sourced and dated.
                    </HeadlineDraw>
                </h1>

                <p className="max-w-measure-lg text-lead font-light text-cream/70">
                    Straight answers about the {AREA.primaryFull} housing market — what homes actually sell for, what
                    buyers really pay, and what it means for your next move. Every figure names its source and the month
                    it was observed, and every calculation is labelled as one.
                </p>
            </div>
        </div>
    </section>
);

/* ========================================================================== */

const FeaturedPost = ({ post }: { post: BlogPost }) => (
    <article className="border-b border-navy/12">
        <Link to={`/blog/${post.slug}`} className="group grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[42vh] overflow-hidden bg-cream lg:h-auto lg:min-h-[32rem]">
                <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-brand group-hover:scale-105"
                />
            </div>

            <div className="flex items-center bg-white p-8 py-14 md:p-16 lg:p-20">
                <div className="max-w-lg">
                    <h2 className="font-display text-d-section text-ink transition-colors duration-view group-hover:text-gold-600">
                        {post.title}
                    </h2>
                    <p className="mb-8 mt-6 text-body font-light text-navy-600">{post.description}</p>
                    <PostMeta post={post} />
                    <span className="link-rule label mt-8">
                        Read the report
                        <ArrowRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                    </span>
                </div>
            </div>
        </Link>
    </article>
);

/* ========================================================================== */

const PostGrid = ({ posts: items }: { posts: BlogPost[] }) => {
    if (!items.length) return null;

    return (
        <Band tone="white" density="sm" rule={false}>
            <BandHead
                layout="stacked"
                heading="More guides & reports"
                lede="Written for the questions people actually arrive with."
            >
                <ul className="grid grid-cols-1 gap-px border border-navy/12 bg-navy/12 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((post, i) => (
                        <Reveal key={post.slug} variant="row" index={i} as="li" className="bg-white">
                            <Link
                                to={`/blog/${post.slug}`}
                                className="group flex h-full flex-col transition-colors duration-view hover:bg-cream/60"
                            >
                                <span className="relative block h-56 overflow-hidden bg-cream">
                                    <img
                                        src={post.image}
                                        alt={post.imageAlt}
                                        loading="lazy"
                                        decoding="async"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-brand group-hover:scale-105"
                                    />
                                </span>

                                <span className="flex flex-1 flex-col p-7 md:p-8">
                                    <span className="label mb-4 block text-gold-600">{post.category}</span>
                                    <h3 className="font-display text-d-item leading-[1.25] text-ink transition-colors duration-view group-hover:text-gold-600">
                                        {post.title}
                                    </h3>
                                    <span className="mb-7 mt-4 block flex-1 text-body-sm font-light text-navy-600">
                                        {post.description}
                                    </span>
                                    <PostMeta post={post} />
                                </span>
                            </Link>
                        </Reveal>
                    ))}

                    {/* Closes out the grid so a partial final row never leaves a
                        bare cell, and adds a conversion path to the archive. */}
                    <li className="on-navy bg-navy">
                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, "blog-grid")}
                            className="group flex h-full min-h-[20rem] flex-col justify-between p-7 text-cream transition-colors duration-view hover:bg-navy-900 md:p-8"
                        >
                            <span>
                                <h3 className="font-display text-d-item leading-[1.2]">
                                    Reading only gets you so far.
                                </h3>
                                <span className="mt-4 block text-body-sm font-light text-cream/60">
                                    Bring the questions these guides raised to a consultation with {AGENT.firstName} and
                                    get answers for your specific situation.
                                </span>
                            </span>
                            <span className="label mt-8 inline-flex items-center gap-3">
                                {PRIMARY_CTA.label}
                                <ArrowUpRight
                                    className="h-4 w-4 text-gold-300 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                                    strokeWidth={1.25}
                                />
                            </span>
                        </Link>
                    </li>
                </ul>
            </BandHead>
        </Band>
    );
};

/* ========================================================================== */

const PostMeta = ({ post }: { post: BlogPost }) => (
    <span className="label flex items-center gap-5 border-t border-navy/12 pt-5 text-navy-400">
        <time dateTime={post.dateModified}>{formatDate(post.dateModified)}</time>
        <span className="block h-px w-3 bg-gold" aria-hidden="true" />
        <span>{post.readingTime}</span>
    </span>
);

/* ========================================================================== */

const BlogCTA = () => (
    <Band tone="cream" density="md">
        <BandHead
            tone="cream"
            heading={
                <>
                    Every market is local. <em className="italic text-gold-600">Yours is more local still.</em>
                </>
            }
            lede="County-wide figures describe an aggregate. Your street, your tract, and your timing behave differently."
        >
            <Reveal className={cn("max-w-measure-lg")}>
                <p className="text-body font-light text-navy-600">
                    {AGENT.firstName} will walk you through what the current numbers mean for the decision actually in
                    front of you — including when they mean you should wait.
                </p>
                <Link
                    to={PRIMARY_CTA.href}
                    onClick={() => trackCtaClick(PRIMARY_CTA.label, "blog-closing")}
                    className="btn-primary group mt-10"
                >
                    {PRIMARY_CTA.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.25} />
                </Link>
            </Reveal>
        </BandHead>
    </Band>
);
