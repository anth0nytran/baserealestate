import { Helmet } from "react-helmet-async";
import { BRAND, SITE_URL } from "@/config/site";

export { SITE_URL };
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/base-og.jpg`;

/** Stable @id references into the site-wide entity graph declared in index.html. */
export const AGENT_ID = `${SITE_URL}/#real-estate-agent`;
export const AUTHOR_ID = `${SITE_URL}/#sam-elsherif`;

export interface Breadcrumb {
    name: string;
    path: string;
}

export interface FaqItem {
    q: string;
    a: string;
}

interface SEOProps {
    title: string;
    description: string;
    path: string;
    type?: "website" | "article";
    image?: string;
    imageAlt?: string;
    /** Renders BreadcrumbList schema. Home is prepended automatically. */
    breadcrumbs?: Breadcrumb[];
    /** Renders FAQPage schema. Must mirror FAQs visible on the page. */
    faqs?: FaqItem[];
    /** Article-only fields. */
    datePublished?: string;
    dateModified?: string;
    articleSection?: string;
    keywords?: string[];
    noindex?: boolean;
}

const DESCRIPTION_MAX = 160;

function clampDescription(text: string): string {
    if (text.length <= DESCRIPTION_MAX) return text;
    const cut = text.slice(0, DESCRIPTION_MAX - 1);
    return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "")}…`;
}

export default function SEO({
    title,
    description,
    path,
    type = "website",
    image,
    imageAlt,
    breadcrumbs,
    faqs,
    datePublished,
    dateModified,
    articleSection,
    keywords,
    noindex = false,
}: SEOProps) {
    const url = `${SITE_URL}${path}`;
    /*
     * Search results cut titles near 60 characters and descriptions near 160.
     * The brand suffix rides along only while the whole title still fits; past
     * that the page's own title is what should survive the cut. Descriptions
     * over the limit are trimmed at a word boundary rather than mid-word —
     * a safety net under the hand-written ones, not a substitute for them.
     */
    const suffixed = `${title} | ${BRAND.name}`;
    const fullTitle = path === "/" || suffixed.length > 60 ? title : suffixed;
    description = clampDescription(description);
    const ogImage = image ? `${SITE_URL}${image}` : DEFAULT_OG_IMAGE;

    const graph: Record<string, unknown>[] = [];

    if (type === "article") {
        graph.push({
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            headline: title,
            description,
            image: ogImage,
            datePublished,
            dateModified: dateModified || datePublished,
            author: { "@id": AUTHOR_ID },
            publisher: { "@id": AGENT_ID },
            inLanguage: "en-US",
            isAccessibleForFree: true,
            ...(articleSection ? { articleSection } : {}),
            ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
        });
    }

    if (breadcrumbs?.length) {
        graph.push({
            "@type": "BreadcrumbList",
            "@id": `${url}#breadcrumb`,
            itemListElement: [{ name: "Home", path: "/" }, ...breadcrumbs].map((crumb, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: crumb.name,
                item: `${SITE_URL}${crumb.path}`,
            })),
        });
    }

    if (faqs?.length) {
        graph.push({
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            mainEntity: faqs.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
        });
    }

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noindex && <meta name="robots" content="noindex, follow" />}

            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:image" content={ogImage} />
            {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {type === "article" && datePublished && (
                <meta property="article:published_time" content={datePublished} />
            )}
            {type === "article" && (dateModified || datePublished) && (
                <meta property="article:modified_time" content={dateModified || datePublished} />
            )}
            {type === "article" && <meta property="article:author" content="Sam Elsherif" />}

            {graph.length > 0 && (
                <script type="application/ld+json">
                    {JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}
                </script>
            )}
        </Helmet>
    );
}
