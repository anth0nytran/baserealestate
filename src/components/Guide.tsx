import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal, { HeadlineDraw } from "./Reveal";
import { Band, BandHead } from "./Section";
import { Plate } from "./Plate";
import Timeline from "./Timeline";
import { BrokerageMark, BrokeredBy } from "./Brand";
import { cn } from "../lib/utils";
import { brandify } from "../lib/brand";
import { getPost } from "../lib/blog";
import { AGENT, CONTACT, PRIMARY_CTA, dreLine, propertyPhoto, type EditorialName } from "../config/site";
import { trackCtaClick, trackPhoneClick } from "../lib/analytics";

/*
 * The building blocks /buy and /sell share. Each page is a guide to one side
 * of the transaction; these keep the two reading as a pair — same hero, same
 * FAQ treatment, same way out to the journal — so neither drifts.
 */

export function GuideHero({
    photo,
    lead,
    accent,
    children,
    service,
    source,
    portal,
}: {
    /** Base name for propertyPhoto(). */
    photo: string;
    lead: string;
    accent: string;
    /** The answer-first paragraph: what this page is, in under 60 words. */
    children: ReactNode;
    /** Prefills the contact form's "What can Sam help with?" select. */
    service: string;
    source: string;
    /** A secondary path to Sam's page on the brokerage site. */
    portal?: { href: string; label: string };
}) {
    return (
        <section className="on-navy relative overflow-hidden bg-navy">
            <img
                {...propertyPhoto(photo)}
                sizes="100vw"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            {/* Same veil as /services: carried on the left third where the headline sits. */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-navy/25" />

            <div className="relative z-10 mx-auto max-w-shell px-gutter pb-sec-md pt-44 md:pt-52">
                <div className="max-w-3xl">
                    <h1 className="mb-8 font-display text-d-page text-cream">
                        <HeadlineDraw delay={100}>{lead}</HeadlineDraw>{" "}
                        <HeadlineDraw delay={380} className="italic text-gold-300">
                            {accent}
                        </HeadlineDraw>
                    </h1>

                    <p className="max-w-measure-lg text-lead font-light text-cream/80">{children}</p>

                    <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                        <Link
                            to={`${PRIMARY_CTA.href}?service=${service}`}
                            onClick={() => trackCtaClick(PRIMARY_CTA.label, `${source}-hero`)}
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
                            onClick={() => trackPhoneClick(`${source}-hero`)}
                            className="btn-outline-light"
                        >
                            {CONTACT.phone}
                        </a>
                    </div>

                    {portal && (
                        <a
                            href={portal.href}
                            target="_blank"
                            rel="noopener"
                            onClick={() => trackCtaClick(portal.label, `${source}-hero-portal`)}
                            className="label mt-7 inline-flex items-center gap-2 border-b border-gold/50 pb-1 text-cream/85 transition-colors hover:border-gold hover:text-cream"
                        >
                            {portal.label}
                            <ArrowUpRight className="h-3.5 w-3.5 text-gold-300" strokeWidth={1.25} />
                        </a>
                    )}

                    {/* Who is behind the page, and who brokers him — before anyone scrolls. */}
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
    );
}

/**
 * The way through to Sam's page on his brokerage's site.
 *
 * Set as its own panel rather than a footnote: for a visitor who would
 * rather start on their own, it is the next step, not a detour. The copy
 * says plainly that it opens on Nest's site.
 */
export function GuidePortal({
    heading,
    body,
    points,
    href,
    action,
    source,
}: {
    heading: string;
    body: string;
    points: readonly string[];
    href: string;
    action: string;
    source: string;
}) {
    return (
        <Band tone="white" density="sm" rule={false}>
            <Reveal className="relative mt-4 grid gap-10 border border-navy/12 bg-white p-8 shadow-lift md:p-12 lg:grid-cols-12 lg:items-center lg:gap-16">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-gold" />
                <div className="lg:col-span-7">
                    <h2 className="font-display text-d-section text-ink">{heading}</h2>
                    <p className="mt-5 max-w-measure-lg text-body text-navy-600">{body}</p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                        {points.map((point) => (
                            <li key={point} className="flex items-start gap-3 text-body-sm text-ink">
                                <span className="mt-[0.7em] block h-px w-4 flex-shrink-0 bg-gold" aria-hidden="true" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-5 lg:border-l lg:border-navy/12 lg:pl-16">
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener"
                        onClick={() => trackCtaClick(action, `${source}-portal`)}
                        className="btn-primary group w-full justify-between"
                    >
                        {action}
                        <ArrowUpRight
                            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            strokeWidth={1.25}
                        />
                    </a>
                    <div className="mt-6 flex items-center gap-3">
                        <span className="label text-navy-500">Opens on</span>
                        <BrokerageMark tone="navy" className="h-[22px]" />
                    </div>
                </div>
            </Reveal>
        </Band>
    );
}

/** A numbered sequence on navy — how one side of a transaction runs, in order. */
export function GuideSteps({
    heading,
    lede,
    steps,
}: {
    heading: string;
    lede: string;
    steps: readonly { title: string; body: string }[];
}) {
    return (
        <Band tone="navy" density="md">
            <BandHead tone="navy" layout="stacked" heading={heading} lede={lede}>
                <Timeline steps={steps} tone="navy" cols={4} />
            </BandHead>
        </Band>
    );
}

/**
 * Questions and answers, always in the DOM — no accordion — so the
 * prerendered page carries every answer for crawlers that never click.
 * The same array feeds the page's FAQPage schema through <SEO faqs>.
 */
export function GuideFaq({
    faqs,
    plate,
    source,
}: {
    faqs: readonly { q: string; a: string }[];
    plate: EditorialName;
    source: string;
}) {
    return (
        <Band tone="cream" density="md" id="faq">
            <BandHead
                tone="cream"
                heading="Asked and answered."
                lede="If yours is not here, it is a good first question for the consultation."
                aside={<Plate name={plate} />}
                bodySticky
                foot={
                    <div className="space-y-3">
                        <a
                            href={`tel:${CONTACT.phoneHref}`}
                            onClick={() => trackPhoneClick(`${source}-faq`)}
                            className="block font-display text-d-item text-ink transition-colors hover:text-gold-600"
                        >
                            {CONTACT.phone}
                        </a>
                        <p className="label text-navy-400">{CONTACT.hours}</p>
                    </div>
                }
            >
                <dl>
                    {faqs.map((faq, i) => (
                        <Reveal
                            key={faq.q}
                            variant="row"
                            index={i}
                            className={cn("py-8", i > 0 && "border-t border-navy/12")}
                        >
                            <dt className="font-display text-d-block leading-snug text-ink">{brandify(faq.q)}</dt>
                            <dd className="mt-4 max-w-measure-lg text-body-sm font-light text-navy-600">
                                {brandify(faq.a)}
                            </dd>
                        </Reveal>
                    ))}
                </dl>
            </BandHead>
        </Band>
    );
}

/**
 * The long-form version of each section, from the journal.
 *
 * Looked up by slug rather than hard-coded, so a post that is unpublished or
 * renamed drops out of the list instead of becoming a dead link.
 */
export function GuideReading({ slugs, heading }: { slugs: readonly string[]; heading: string }) {
    const posts = slugs.map((slug) => getPost(slug)).filter((post) => post !== undefined);
    if (posts.length === 0) return null;

    return (
        <Band tone="white" density="md">
            <BandHead
                layout="stacked"
                heading={heading}
                lede="Each of these goes further than this page can, with every figure sourced and dated."
            >
                <div className="grid grid-cols-1 gap-px bg-navy/12 md:grid-cols-3">
                    {posts.map((post, i) => (
                        <Reveal key={post.slug} variant="row" index={i} className="bg-white">
                            <Link to={`/blog/${post.slug}`} className="group flex h-full flex-col p-6 md:p-8">
                                <h3 className="font-display text-d-item leading-[1.25] text-ink transition-colors duration-view group-hover:text-gold-600">
                                    {post.title}
                                </h3>
                                <span className="mb-6 mt-4 block flex-1 text-body-sm font-light text-navy-600">
                                    {brandify(post.description)}
                                </span>
                                <span className="label inline-flex items-center gap-3 text-ink">
                                    Read
                                    <ArrowUpRight className="h-4 w-4 text-gold" strokeWidth={1.25} />
                                </span>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </BandHead>
        </Band>
    );
}
