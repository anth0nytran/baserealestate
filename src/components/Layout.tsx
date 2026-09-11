import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { trackPhoneClick, trackEmailClick, trackCtaClick } from "@/lib/analytics";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AGENT, AREA, BRAND, CONTACT, CREDIT, LICENSE, PRIMARY_CTA, SERVICES, dreLine, licenseLine } from "@/config/site";

interface LayoutProps {
    children: ReactNode;
}

const NAV_LINKS = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Journal", path: "/blog" },
    { name: "Contact", path: "/contact" },
] as const;

/**
 * The logotype lockup: supplied wordmark artwork + typeset descriptor.
 *
 * The artwork reads "BASE REAL ESTATE" and cannot say "GROUP" — it is a
 * bespoke didone cut and nobody has the outlines, so the word is set in Jost
 * beside it rather than faked in a near-miss serif, which would read as a
 * mistake at every size. That word is not decoration: Sam is a salesperson
 * under a broker, and a mark reading "Base Real Estate" on its own claims a
 * brokerage he does not hold (see BRAND in src/config/site.ts).
 *
 * `size` sets the container's font-size to the artwork's cap height, and both
 * halves are then expressed in `em` — so one responsive value moves the
 * wordmark and the descriptor together instead of two that drift apart at the
 * next breakpoint. Bottom-aligned, because the trimmed artwork's lower edge
 * *is* the cap baseline.
 */
function Wordmark({
    src,
    srcSet,
    tone,
    size,
    /* Intrinsic size of `src`. Wrong values here reserve the wrong box and
       shunt the descriptor sideways on first paint — the nav variants are
       trimmed to roughly 13:1, the full mark with its gold rule is 9.6:1. */
    width = 600,
    height = 45,
    loading,
}: {
    src: string;
    srcSet?: string;
    /** Which ink the surrounding surface calls for. */
    tone: "navy" | "cream";
    /** Font-size utilities setting the cap height, e.g. "text-[17px] md:text-[27px]". */
    size: string;
    width?: number;
    height?: number;
    loading?: "lazy" | "eager";
}) {
    return (
        <span className={cn("flex items-end gap-[0.5em] leading-none", size)}>
            <img
                src={src}
                srcSet={srcSet}
                sizes="300px"
                alt={BRAND.name}
                width={width}
                height={height}
                loading={loading}
                className="h-[1em] w-auto object-contain transition-all duration-view ease-brand"
            />
            <span
                aria-hidden="true"
                className={cn(
                    "select-none whitespace-nowrap font-sans text-[0.58em] font-medium uppercase leading-none tracking-[0.28em]",
                    // The trimmed artwork has no descender room, so its box
                    // bottom is the baseline; a hairline nudge is what stops
                    // the descriptor floating above it.
                    "translate-y-[0.05em]",
                    tone === "cream" ? "text-cream/70" : "text-navy/60"
                )}
            >
                {BRAND.descriptor}
            </span>
        </span>
    );
}

export default function Layout({ children }: LayoutProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    /*
     * Normalised because a host may serve these routes with a trailing slash.
     * Matching the raw pathname would silently drop the dark-hero treatment on
     * "/services/" and leave cream marks on a white bar.
     */
    const route = location.pathname.replace(/\/+$/, "") || "/";

    /*
     * Routes whose first screen is a full-bleed dark surface let the bar start
     * transparent with cream marks. /contact is deliberately excluded: its top
     * screen is split navy-left / white-right, and no single mark colour reads
     * against both — so it gets the solid white plate from the first paint.
     */
    const darkHero = route === "/" || route === "/services" || route.startsWith("/blog");
    const lightMarks = darkHero && !scrolled;
    const plated = !darkHero || scrolled;

    useEffect(() => {
        if (location.hash) {
            // Small delay so the target page renders before scrolling
            setTimeout(() => {
                const el = document.querySelector(location.hash);
                if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.pathname, location.hash]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mobileMenuOpen]);

    const isActive = (path: string) => (path === "/blog" ? route.startsWith("/blog") : route === path);

    return (
        <div className="min-h-screen bg-white font-sans text-ink">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[70] focus:bg-navy focus:px-6 focus:py-3 focus:text-cream focus:label"
            >
                Skip to content
            </a>

            {/* ---------------------------------------------------------------
                Navigation — a single hairline bar that resolves from
                transparent to white and tightens. It does not detach into a
                floating pill, which keeps the wordmark on a fixed baseline.
            --------------------------------------------------------------- */}
            <nav aria-label="Primary" className={cn("fixed inset-x-0 top-0 z-50", lightMarks && "on-navy")}>
                {/*
                 * Two layers. The scrim exists only over a dark hero, where
                 * cream marks would otherwise sit on whatever the rotating
                 * photograph puts behind them — a bright sky loses the wordmark
                 * entirely. The white plate takes over once scrolled.
                 */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-32 transition-opacity duration-view ease-brand"
                    style={{
                        opacity: lightMarks ? 1 : 0,
                        background:
                            "linear-gradient(to bottom, rgba(17,28,44,0.62), rgba(17,28,44,0.28) 55%, transparent)",
                    }}
                />
                <div
                    className="absolute inset-0 transition-all duration-view ease-brand"
                    style={{
                        backgroundColor: plated ? "rgba(255,255,255,0.94)" : "transparent",
                        backdropFilter: plated ? "blur(20px)" : "none",
                        borderBottom: plated ? "1px solid rgba(27,42,65,0.10)" : "1px solid transparent",
                    }}
                />

                <div
                    className={cn(
                        "relative z-10 mx-auto flex max-w-shell items-center justify-between px-gutter",
                        "transition-all duration-view ease-brand",
                        scrolled ? "h-[68px]" : "h-[92px]"
                    )}
                >
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} aria-label={`${BRAND.name} — home`}>
                        {/*
                         * Nav-scale variants are optically corrected (see
                         * scripts/prepare-brand-assets.mjs); the full-scale
                         * wordmark greys out below about 60px of height.
                         */}
                        <Wordmark
                            src={lightMarks ? "/base/wordmark-cream-nav-600.png" : "/base/wordmark-navy-nav-600.png"}
                            srcSet={
                                lightMarks
                                    ? "/base/wordmark-cream-nav-600.png 600w, /base/wordmark-cream-nav-900.png 900w"
                                    : "/base/wordmark-navy-nav-600.png 600w, /base/wordmark-navy-nav-900.png 900w"
                            }
                            tone={lightMarks ? "cream" : "navy"}
                            // The wordmark is 13:1; at full nav height it would
                            // run into the Menu button on a 390px screen.
                            size={
                                scrolled
                                    ? "text-[15px] sm:text-[17px] md:text-[19px]"
                                    : "text-[17px] sm:text-[20px] md:text-[27px]"
                            }
                        />
                    </Link>

                    <div className="hidden items-center gap-10 md:flex">
                        {NAV_LINKS.slice(0, 3).map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                aria-current={isActive(link.path) ? "page" : undefined}
                                className={cn(
                                    "label relative transition-colors duration-state",
                                    lightMarks ? "text-cream/80 hover:text-cream" : "text-navy-600 hover:text-ink"
                                )}
                            >
                                {link.name}
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "absolute -bottom-2 left-0 h-px bg-gold transition-all duration-state ease-brand",
                                        isActive(link.path) ? "w-full" : "w-0"
                                    )}
                                />
                            </Link>
                        ))}

                        <a
                            href={`tel:${CONTACT.phoneHref}`}
                            onClick={() => trackPhoneClick("nav")}
                            className={cn(
                                "label hidden transition-colors duration-state lg:inline",
                                lightMarks ? "text-cream/60 hover:text-cream" : "text-navy-400 hover:text-ink"
                            )}
                        >
                            {CONTACT.phone}
                        </a>

                        <Link
                            to={PRIMARY_CTA.href}
                            onClick={() => trackCtaClick(PRIMARY_CTA.shortLabel, "nav")}
                            className={cn(
                                "label px-6 py-3 transition-all duration-state ease-brand",
                                lightMarks
                                    ? "text-cream shadow-[inset_0_0_0_1px_rgba(250,247,240,0.4)] hover:bg-cream hover:text-navy"
                                    : "bg-navy text-cream hover:bg-navy-900"
                            )}
                        >
                            {PRIMARY_CTA.shortLabel}
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={mobileMenuOpen}
                        className={cn("label md:hidden", lightMarks ? "text-cream" : "text-ink")}
                    >
                        Menu
                    </button>
                </div>
            </nav>

            {/* --------------------------- Mobile menu --------------------------- */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="on-navy fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-navy text-cream"
                    >
                        {/* flex-shrink-0: the panel is a scrolling flex column, and
                            without it the header collapses and clips the wordmark. */}
                        <div className="flex h-[76px] flex-shrink-0 items-center justify-between border-b border-cream/10 px-6 sm:h-[92px]">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                                <Wordmark
                                    src="/base/wordmark-cream-nav-600.png"
                                    tone="cream"
                                    size="text-[17px] sm:text-[20px]"
                                />
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-1">
                                <X className="h-5 w-5 text-cream" strokeWidth={1.25} />
                            </button>
                        </div>

                        <div className="border-b border-cream/10 px-6 py-8">
                            {NAV_LINKS.map((route_, i) => (
                                <motion.div
                                    key={route_.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <Link
                                        to={route_.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between py-4 font-display text-[2rem] leading-tight transition-colors",
                                            isActive(route_.path) ? "text-gold-400" : "text-cream"
                                        )}
                                    >
                                        {route_.name}
                                        <ArrowRight className="h-4 w-4 text-cream/25" strokeWidth={1} />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="border-b border-cream/10 px-6 py-8">
                            <h2 className="label mb-5 font-sans text-cream/40">Services</h2>
                            <ul className="grid grid-cols-1 gap-3">
                                {SERVICES.map((service) => (
                                    <li key={service.id}>
                                        <Link
                                            to={`/services#${service.id}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-body-sm font-light text-cream/65 transition-colors hover:text-cream"
                                        >
                                            {service.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4 px-6 py-8">
                            <h2 className="label mb-5 font-sans text-cream/40">Get in touch</h2>
                            <a
                                href={`tel:${CONTACT.phoneHref}`}
                                onClick={() => trackPhoneClick("mobile-menu")}
                                className="flex items-center gap-3 text-body-sm font-light text-cream"
                            >
                                <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.25} /> {CONTACT.phone}
                            </a>
                            <a
                                href={`mailto:${CONTACT.email}`}
                                onClick={() => trackEmailClick("mobile-menu")}
                                className="flex items-center gap-3 break-all text-body-sm font-light text-cream/65"
                            >
                                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gold" strokeWidth={1.25} /> {CONTACT.email}
                            </a>
                            <p className="flex items-center gap-3 text-body-sm font-light text-cream/65">
                                <Clock className="h-3.5 w-3.5 text-gold" strokeWidth={1.25} /> {CONTACT.hours}
                            </p>
                            <p className="flex items-center gap-3 text-body-sm font-light text-cream/65">
                                <MapPin className="h-3.5 w-3.5 text-gold" strokeWidth={1.25} /> {AREA.primaryFull}
                            </p>
                        </div>

                        <div className="mt-auto px-6 pb-8">
                            <Link
                                to={PRIMARY_CTA.href}
                                onClick={() => {
                                    trackCtaClick(PRIMARY_CTA.label, "mobile-menu");
                                    setMobileMenuOpen(false);
                                }}
                                className="btn-cream group w-full"
                            >
                                {PRIMARY_CTA.label}
                                <ArrowRight
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    strokeWidth={1.25}
                                />
                            </Link>
                            <p className="label mt-5 text-center text-cream/30">{licenseLine()}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ----------------------- Sticky mobile CTA ----------------------- */}
            <div
                className={cn(
                    "fixed inset-x-0 bottom-0 z-40 transition-transform duration-view ease-brand md:hidden",
                    scrolled && !mobileMenuOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                <Link
                    to={PRIMARY_CTA.href}
                    onClick={() => trackCtaClick(PRIMARY_CTA.label, "sticky-bar")}
                    className="on-navy flex items-center justify-between gap-4 border-t border-gold/30 bg-navy/97 px-5 py-4 backdrop-blur-md"
                >
                    <span className="min-w-0">
                        <span className="label mb-1 block text-gold-400">No pressure, no obligation</span>
                        <span className="block font-display text-d-item leading-tight text-cream">
                            {PRIMARY_CTA.label}
                        </span>
                    </span>
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-cream text-navy">
                        <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
                    </span>
                </Link>
            </div>

            <main id="main">{children}</main>

            {/* ------------------------------ Footer ------------------------------ */}
            <footer className="on-navy bg-navy text-cream">
                <div className="mx-auto max-w-shell">
                    <div className="grid grid-cols-1 border-b border-cream/10 md:grid-cols-12">
                        {/* Brand */}
                        <div className="flex flex-col justify-between border-b border-cream/10 p-8 md:col-span-4 md:border-b-0 md:border-r md:p-14">
                            <div>
                                {/*
                                 * The full-scale mark, which carries the gold
                                 * rule the nav variants drop — so the artwork
                                 * box extends below the baseline here and the
                                 * descriptor rides a touch lower with it.
                                 */}
                                <Wordmark
                                    src="/base/wordmark-cream.png"
                                    tone="cream"
                                    size="mb-8 text-[22px]"
                                    width={3000}
                                    height={313}
                                    loading="lazy"
                                />
                                <p className="max-w-measure text-body-sm font-light leading-[1.9] text-cream/55">
                                    {BRAND.positioning}
                                </p>
                            </div>

                            <div className="mt-12 border-t border-cream/10 pt-8">
                                <p className="mb-1 font-display text-d-item text-cream">{AGENT.displayName}</p>
                                <p className="label text-cream/40">
                                    {AGENT.title} · {AGENT.role}
                                </p>
                                {dreLine() && <p className="label mt-3 text-cream/30">{dreLine()}</p>}
                                {LICENSE.brokerage.confirmed && (
                                    <p className="label mt-2 text-cream/30">{LICENSE.brokerage.name}</p>
                                )}
                            </div>
                        </div>

                        {/* Pages + Services */}
                        <nav
                            aria-label="Footer"
                            className="border-b border-cream/10 p-8 md:col-span-3 md:border-b-0 md:border-r md:p-12"
                        >
                            <h2 className="label mb-7 font-sans text-cream/35">Pages</h2>
                            <ul className="mb-12 space-y-4">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="text-body-sm font-light text-cream/70 transition-colors hover:text-cream"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <h2 className="label mb-7 font-sans text-cream/35">Services</h2>
                            <ul className="space-y-4">
                                {SERVICES.map((service) => (
                                    <li key={service.id}>
                                        <Link
                                            to={`/services#${service.id}`}
                                            className="text-body-sm font-light text-cream/70 transition-colors hover:text-cream"
                                        >
                                            {service.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Areas */}
                        <div className="border-b border-cream/10 p-8 md:col-span-3 md:border-b-0 md:border-r md:p-12 lg:col-span-2">
                            <h2 className="label mb-7 font-sans text-cream/35">Areas Served</h2>
                            {/* Two columns: a single 15-item stack made this row
                                twice the height of every other footer column. */}
                            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-1 lg:grid-cols-2">
                                {[AREA.primary, ...AREA.cities.map((c) => c.name), ...AREA.alsoServing].map((area) => (
                                    <li key={area} className="text-body-sm font-light text-cream/55">
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col justify-between p-8 md:col-span-6 md:p-12 lg:col-span-3">
                            <div>
                                <h2 className="label mb-7 font-sans text-cream/35">Contact</h2>
                                <div className="space-y-5">
                                    <a
                                        href={`tel:${CONTACT.phoneHref}`}
                                        onClick={() => trackPhoneClick("footer")}
                                        className="block font-display text-d-block text-cream transition-colors hover:text-gold-400"
                                    >
                                        {CONTACT.phone}
                                    </a>
                                    <a
                                        href={`mailto:${CONTACT.email}`}
                                        onClick={() => trackEmailClick("footer")}
                                        className="block break-all text-body-sm font-light text-cream/60 transition-colors hover:text-cream"
                                    >
                                        {CONTACT.email}
                                    </a>
                                    <div className="border-t border-cream/10 pt-5">
                                        <h3 className="label mb-2 font-sans text-cream/35">Hours</h3>
                                        <p className="text-body-sm font-light leading-relaxed text-cream/60">
                                            {CONTACT.hours}
                                            <span className="mt-1 block italic text-cream/40">{CONTACT.hoursNote}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={PRIMARY_CTA.href}
                                onClick={() => trackCtaClick(PRIMARY_CTA.label, "footer")}
                                className="btn-outline-light group mt-10 w-full"
                            >
                                {PRIMARY_CTA.label}
                                <ArrowRight
                                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                                    strokeWidth={1.25}
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Oversized wordmark, set in the display face rather than shouted in caps. */}
                    <div className="pointer-events-none flex w-full select-none items-center justify-center overflow-hidden px-6 pb-14 pt-20">
                        <span
                            aria-hidden="true"
                            className="whitespace-nowrap font-display leading-none tracking-[0.06em] text-cream/[0.055]"
                            style={{ fontSize: "min(13vw, 190px)" }}
                        >
                            BASE
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-5 border-t border-cream/10 px-6 py-8 md:flex-row md:px-12">
                        <p className="label text-center text-cream/30 md:text-left">
                            © {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.
                        </p>
                        <p className="label text-center text-cream/30">{licenseLine()}</p>
                        <a
                            href={CREDIT.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label text-cream/30 transition-colors hover:text-cream"
                        >
                            Website by <span className="text-cream/60">{CREDIT.label}</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
