import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SEO from "../hooks/useSEO";
import Reveal from "../components/Reveal";
import { Band, BandHead, Seam } from "../components/Section";
import { trackCtaClick, trackPhoneClick } from "../lib/analytics";
import NotFound from "./NotFound";
import { getPost, getRelatedPosts, formatDate, type BlogPost as Post } from "@/lib/blog";
import { AGENT, AREA, BRAND, CONTACT, LICENSE, MARKET, PRIMARY_CTA, dreLine, licenseLine } from "@/config/site";

/**
 * Single article view.
 *
 * The article body is plain, fully-visible HTML — no scroll-reveal animations
 * wrapping text. That keeps the prerendered markup directly extractable by
 * answer engines (ChatGPT, Perplexity, Claude, AI Overviews), which is the
 * entire point of this page existing.
 */
export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const post = getPost(slug);

    if (!post) return <NotFound />;

    const related = getRelatedPosts(post.slug);

    return (
        <div className="bg-white w-full min-h-screen overflow-x-clip">
            <SEO
                title={post.title}
                description={post.description}
                path={`/blog/${post.slug}`}
                type="article"
                image={post.image}
                imageAlt={post.imageAlt}
                datePublished={post.datePublished}
                dateModified={post.dateModified}
                articleSection={post.category}
                keywords={post.tags}
                faqs={post.faqs}
                breadcrumbs={[
                    { name: "Journal", path: "/blog" },
                    { name: post.title, path: `/blog/${post.slug}` },
                ]}
            />

            <ArticleHero post={post} />

            {/* Provenance strip: authorship, recency, and the market vintage.
                Answer engines weight all three heavily when choosing what to cite. */}
            <Seam
                items={[
                    { label: "Written by", value: AGENT.shortDisplayName },
                    { label: "Updated", value: formatDate(post.dateModified) },
                    { label: "Reading time", value: post.readingTime },
                    { label: "Market data", value: MARKET.asOf },
                ]}
            />

            <ArticleBody post={post} />
            <AuthorBio />
            {related.length > 0 && <RelatedPosts posts={related} />}
            <ArticleCTA />
        </div>
    );
}

/* ========================================================================== */

const ArticleHero = ({ post }: { post: Post }) => (
    <section className="on-navy bg-navy text-cream">
        <div className="max-w-4xl mx-auto px-6 md:px-12 pt-36 md:pt-44 pb-12 md:pb-16">
            {/* Visible breadcrumb trail, mirrored by BreadcrumbList schema. */}
            <nav aria-label="Breadcrumb" className="mb-10">
                <ol className="label flex items-center gap-3 text-cream/40">
                    <li><Link to="/" className="hover:text-cream transition-colors">Home</Link></li>
                    <li aria-hidden="true" className="text-cream/25">/</li>
                    <li><Link to="/blog" className="hover:text-cream transition-colors">Journal</Link></li>
                    <li aria-hidden="true" className="text-cream/25">/</li>
                    <li className="text-gold-400 truncate max-w-[12rem] md:max-w-none">{post.category}</li>
                </ol>
            </nav>

            <p className="label mb-7 text-gold-300">{post.category}</p>

            <h1 className="mb-9 font-display text-d-page text-cream">{post.title}</h1>

            <div className="label flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-cream/12 pt-7 text-cream/45">
                <span className="flex items-center gap-3 text-cream/80">
                    <img
                        src="/base/sam-portrait.jpg"
                        alt={`${AGENT.displayName}, ${AGENT.title}`}
                        width={720}
                        height={720}
                        className="w-8 h-8 object-cover"
                    />
                    {AGENT.shortDisplayName}, {AGENT.title}
                </span>
                <span>
                    Updated <time dateTime={post.dateModified}>{formatDate(post.dateModified)}</time>
                </span>
                <span>{post.readingTime}</span>
            </div>
        </div>

        {post.image && (
            <div className="relative w-full h-[34vh] md:h-[48vh] overflow-hidden">
                <img src={post.image} alt={post.imageAlt} className="absolute inset-0 w-full h-full object-cover" />
            </div>
        )}
    </section>
);

/* ========================================================================== */

/**
 * Splits rendered article HTML before the nth `<h2>`.
 *
 * Placing the call to action at a section boundary rather than a character
 * offset means it never lands mid-sentence or inside a table, whatever the
 * article's length.
 */
function splitAtHeading(html: string, nth: number): [string, string] {
    const parts = html.split(/(?=<h2[\s>])/);
    if (parts.length <= nth + 1) return [html, ""];
    return [parts.slice(0, nth).join(""), parts.slice(nth).join("")];
}

const ArticleBody = ({ post }: { post: Post }) => {
    /* Deep enough that the reader is engaged, early enough that they are still
       here. Articles too short to have four sections get no interruption. */
    const [bodyBefore, bodyAfter] = splitAtHeading(post.html, 4);

    return (
    <article className="max-w-4xl mx-auto px-6 md:px-12 py-14 md:py-20">
        {/* Snippet-target answer block: the ~55-word direct answer engines lift. */}
        {post.answer && (
            <div className="border-l border-gold bg-cream p-7 md:p-9 mb-14">
                <span className="label mb-4 block text-navy-400">The short answer</span>
                <p className="text-lead font-light leading-[1.75] text-ink">{post.answer}</p>
            </div>
        )}

        {post.toc.length > 2 && (
            <nav aria-label="Table of contents" className="mb-14 border border-navy/10">
                <span className="label block bg-navy px-6 py-4 text-cream">What this guide covers</span>
                <ol className="p-6 md:p-7 space-y-3.5">
                    {post.toc.map((item, i) => (
                        <li key={item.id} className="flex gap-4 items-baseline">
                            <span className="font-display text-gold text-[12px] flex-shrink-0">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <a href={`#${item.id}`} className="text-body-sm font-light text-navy-600 transition-colors hover:text-ink">
                                {item.text}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
        )}

        {/*
         * The article body is split around a contextual call to action.
         * Markdown is authored in-repo and rendered at build time, so this is
         * trusted content rather than user input.
         */}
        <div className="prose-base" dangerouslySetInnerHTML={{ __html: bodyBefore }} />
        {post.ctaPrompt && <InlineCTA prompt={post.ctaPrompt} />}
        {bodyAfter && <div className="prose-base" dangerouslySetInnerHTML={{ __html: bodyAfter }} />}

        {post.tags.length > 0 && (
            <div className="mt-16 pt-9 border-t border-navy/10 flex flex-wrap gap-2.5">
                {post.tags.map((tag) => (
                    <span key={tag} className="label border border-navy/12 px-4 py-2 text-navy-400">
                        {tag}
                    </span>
                ))}
            </div>
        )}
    </article>
    );
};

/**
 * Mid-article call to action.
 *
 * Framed as an offer of explanation rather than an offer to transact, because
 * that is the actual proposition — and because a hard sell dropped into the
 * middle of a sourced market report undermines the thing that made the report
 * worth reading.
 */
const InlineCTA = ({ prompt }: { prompt: string }) => (
    <aside className="my-14 border border-navy/12 bg-cream">
        <div className="border-l-2 border-gold p-7 md:p-9">
            <p className="font-display text-d-block leading-snug text-ink">{prompt}</p>
            <p className="mt-5 max-w-measure-lg text-body-sm font-light text-navy-600">
                {AGENT.firstName} will walk you through it against your actual situation — no cost, no obligation, and
                no expectation that you transact. Most of these conversations are with people six to eighteen months
                out.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                    to={PRIMARY_CTA.href}
                    onClick={() => trackCtaClick(PRIMARY_CTA.label, "article-inline")}
                    className="btn-primary group"
                >
                    {PRIMARY_CTA.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.25} />
                </Link>
                <a
                    href={`tel:${CONTACT.phoneHref}`}
                    onClick={() => trackPhoneClick("article-inline")}
                    className="label text-navy-500 transition-colors hover:text-ink"
                >
                    Or call {CONTACT.phone}
                </a>
            </div>
        </div>
    </aside>
);

/* ==========================================================================
   E-E-A-T signal: a named, verifiable human behind the analysis.

   The licence and brokerage lines render only once confirmed in
   src/config/site.ts — an unverified credential is worse than none.
   ========================================================================== */

const AuthorBio = () => (
    <Band tone="cream" density="sm">
        <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-8 pt-10 sm:flex-row md:gap-12 lg:pt-14">
                <Reveal variant="frame" className="flex-shrink-0 overflow-hidden">
                    <img
                        src="/base/sam-portrait.jpg"
                        alt={`${AGENT.displayName}, ${AREA.primaryFull} ${AGENT.title}`}
                        width={720}
                        height={720}
                        loading="lazy"
                        className="h-28 w-28 object-cover md:h-36 md:w-36"
                    />
                </Reveal>
                <Reveal>
                    <h2 className="font-display text-d-block text-ink">
                        {AGENT.displayName}, {AGENT.title}
                    </h2>
                    <p className="mb-7 mt-5 max-w-measure-lg text-body-sm font-light text-navy-600">
                        {AGENT.firstName} is an {AREA.primaryFull} {AGENT.title} and founder of {BRAND.name},
                        specialising in {AREA.focusLabel} — {AREA.focus.map((c) => c.name).join(", ")}. He writes these
                        reports from live MLS activity and published C.A.R., Freddie Mac, and Redfin data, and labels
                        every figure with the month it was observed.
                    </p>

                    <div className="label mb-8 flex flex-wrap gap-x-8 gap-y-3 text-navy-400">
                        {dreLine() && <span>{dreLine()}</span>}
                        {LICENSE.brokerage.confirmed && <span>{LICENSE.brokerage.name}</span>}
                        <span>{AREA.primaryFull}</span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <a
                            href={`tel:${CONTACT.phoneHref}`}
                            onClick={() => trackPhoneClick("blog-post-author")}
                            className="btn-primary"
                        >
                            {CONTACT.phone}
                        </a>
                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, "blog-post-author")}
                            className="btn-outline group"
                        >
                            Ask {AGENT.firstName} a question
                            <ArrowRight
                                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                                strokeWidth={1.25}
                            />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </div>
    </Band>
);

/* ========================================================================== */

const RelatedPosts = ({ posts: items }: { posts: Post[] }) => (
    <Band tone="white" density="sm">
        <BandHead
            layout="stacked"
            heading="Related guides"
            lede={
                <Link to="/blog" className="link-rule label inline-flex text-ink">
                    <ArrowLeft className="h-3.5 w-3.5 text-gold" strokeWidth={1.25} />
                    All articles
                </Link>
            }
        >
            <ul className="grid grid-cols-1 gap-px border border-navy/12 bg-navy/12 md:grid-cols-3">
                {items.map((post, i) => (
                    <Reveal key={post.slug} variant="row" index={i} as="li" className="bg-white">
                        <Link
                            to={`/blog/${post.slug}`}
                            className="group flex h-full flex-col p-7 transition-colors duration-view hover:bg-cream/60 md:p-8"
                        >
                            <span className="label mb-4 block text-gold-600">{post.category}</span>
                            <h3 className="font-display text-d-item leading-[1.25] text-ink transition-colors duration-view group-hover:text-gold-600">
                                {post.title}
                            </h3>
                            <span className="mb-6 mt-4 block flex-1 text-body-sm font-light text-navy-600">
                                {post.description}
                            </span>
                            <span className="label inline-flex items-center gap-3 text-ink">
                                Read
                                <ArrowRight
                                    className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-x-1"
                                    strokeWidth={1.25}
                                />
                            </span>
                        </Link>
                    </Reveal>
                ))}
            </ul>
        </BandHead>
    </Band>
);

/* ========================================================================== */

const ArticleCTA = () => (
    <Band tone="navy" density="md" rule={false}>
        <Reveal className="mx-auto max-w-3xl py-6 text-center">
            <h2 className="font-display text-d-section text-cream">
                Questions about <em className="italic text-gold-300">your situation?</em>
            </h2>
            <p className="mx-auto mb-11 mt-8 max-w-measure-lg text-body font-light text-cream/65">
                Market averages are a starting point, not an answer. Tell {AGENT.firstName} what you are weighing —
                buying, selling, investing, or simply timing it right — and get a straight read on your specific
                situation.
            </p>

            <Link
                to={PRIMARY_CTA.href}
                onClick={() => trackCtaClick(PRIMARY_CTA.label, "blog-post-closing")}
                className="btn-cream group"
            >
                Talk to {AGENT.firstName}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.25} />
            </Link>

            <p className="label mt-8 text-cream/30">{licenseLine()}</p>
        </Reveal>
    </Band>
);
