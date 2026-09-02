import { marked } from "marked";
import publishedMarkdown from "virtual:blog-posts";
import type { FaqItem } from "@/hooks/useSEO";
import { SITE_URL } from "@/config/site";

/**
 * Blog content pipeline.
 *
 * Posts are authored as Markdown in src/content/blog/*.md with YAML-ish
 * frontmatter. Everything below runs identically in the browser and in the
 * Node prerenderer, so a post's HTML is baked into the static build and is
 * readable by crawlers that never execute JavaScript.
 *
 * FAQ schema is DERIVED from the visible "Frequently Asked Questions" section
 * of each post rather than declared separately. That makes it structurally
 * impossible for the FAQPage markup to describe content a reader can't see.
 */

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    /** Snippet-target direct answer, kept to ~55 words. Rendered under the H1. */
    answer: string;
    category: string;
    datePublished: string;
    dateModified: string;
    readingTime: string;
    image: string;
    imageAlt: string;
    tags: string[];
    featured: boolean;
    /** Rendered article HTML. */
    html: string;
    /**
     * Contextual mid-article call to action. Written per post so the prompt
     * speaks to what the reader has just been reading, rather than dropping
     * the same generic banner into every article.
     */
    ctaPrompt: string;
    /** Extracted from the visible FAQ section — feeds FAQPage schema. */
    faqs: FaqItem[];
    /** H2 headings, for the on-page table of contents. */
    toc: { id: string; text: string }[];
}

type Frontmatter = Record<string, string | string[]>;

function unquote(value: string): string {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length > 1)
    ) {
        return trimmed.slice(1, -1).replace(/\\"/g, '"');
    }
    return trimmed;
}

/**
 * Minimal frontmatter parser covering the subset we author: scalar values and
 * lists of scalars. Deliberately not a full YAML implementation — keeping the
 * supported surface small means a malformed post fails loudly at build time
 * instead of silently producing wrong metadata.
 */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
    if (!match) return { data: {}, body: raw };

    const [, block, body] = match;
    const data: Frontmatter = {};
    let listKey: string | null = null;

    for (const line of block.split(/\r?\n/)) {
        if (!line.trim() || /^\s*#/.test(line)) continue;

        const listItem = /^\s+-\s+(.*)$/.exec(line);
        if (listItem && listKey) {
            (data[listKey] as string[]).push(unquote(listItem[1]));
            continue;
        }

        const pair = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
        if (pair) {
            const [, key, value] = pair;
            if (value.trim() === "") {
                data[key] = [];
                listKey = key;
            } else {
                data[key] = unquote(value);
                listKey = null;
            }
        }
    }

    return { data, body };
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

/**
 * Walks the Markdown body and pulls Q&A pairs out of the FAQ section:
 * an `## Frequently Asked Questions` H2, then one `### Question` H3 per entry
 * followed by its answer paragraphs.
 */
function extractFaqs(body: string): FaqItem[] {
    const lines = body.split(/\r?\n/);
    const faqs: FaqItem[] = [];

    let inSection = false;
    let question: string | null = null;
    let answer: string[] = [];

    const flush = () => {
        if (question && answer.length) {
            faqs.push({ q: question, a: answer.join(" ").replace(/\s+/g, " ").trim() });
        }
        question = null;
        answer = [];
    };

    for (const line of lines) {
        const h2 = /^##\s+(.*)$/.exec(line);
        if (h2) {
            flush();
            inSection = /frequently asked questions/i.test(h2[1]);
            continue;
        }
        if (!inSection) continue;

        const h3 = /^###\s+(.*)$/.exec(line);
        if (h3) {
            flush();
            question = h3[1].trim();
            continue;
        }
        if (question && line.trim()) {
            // Strip inline Markdown emphasis/links so schema carries clean prose.
            answer.push(
                line
                    .trim()
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                    .replace(/\*\*([^*]+)\*\*/g, "$1")
                    .replace(/\*([^*]+)\*/g, "$1")
            );
        }
    }
    flush();

    return faqs;
}

function buildToc(body: string): { id: string; text: string }[] {
    const toc: { id: string; text: string }[] = [];
    for (const line of body.split(/\r?\n/)) {
        const h2 = /^##\s+(.*)$/.exec(line);
        if (h2) {
            const text = h2[1].trim().replace(/\*\*/g, "");
            toc.push({ id: slugify(text), text });
        }
    }
    return toc;
}

/** Post-processing that marked's defaults don't give us, applied to the output HTML. */
function enhanceHtml(html: string): string {
    return (
        html
            // Anchor targets for the table of contents and for deep links from AI answers.
            .replace(/<h([234])>([\s\S]*?)<\/h\1>/g, (_full, level: string, inner: string) => {
                const text = inner.replace(/<[^>]+>/g, "");
                return `<h${level} id="${slugify(text)}">${inner}</h${level}>`;
            })
            // Wide data tables must scroll inside their own container on mobile.
            .replace(/<table>/g, '<div class="prose-table-wrap"><table>')
            .replace(/<\/table>/g, "</table></div>")
            /*
             * Outbound citations open in a new tab without leaking the referrer
             * chain. The site's own absolute links are excluded so they are not
             * marked nofollow — the host is read from SITE_URL rather than
             * hard-coded, so this keeps working when the domain is chosen.
             */
            .replace(/<a href="(https?:\/\/[^"]+)"/g, (full, href: string) =>
                href.startsWith(SITE_URL)
                    ? full
                    : `<a href="${href}" target="_blank" rel="noopener nofollow"`
            )
            .replace(/<img /g, '<img loading="lazy" decoding="async" ')
    );
}

function toPost(slug: string, raw: string): BlogPost {
    const { data, body } = parseFrontmatter(raw);

    const str = (key: string, fallback = ""): string => {
        const value = data[key];
        return typeof value === "string" ? value : fallback;
    };
    const list = (key: string): string[] => {
        const value = data[key];
        return Array.isArray(value) ? value : [];
    };

    const title = str("title");
    if (!title) throw new Error(`Blog post "${slug}" is missing a title in its frontmatter.`);

    const datePublished = str("datePublished");
    if (!datePublished) throw new Error(`Blog post "${slug}" is missing datePublished.`);

    return {
        slug,
        title,
        description: str("description"),
        answer: str("answer"),
        category: str("category", "Market Insight"),
        datePublished,
        dateModified: str("dateModified", datePublished),
        readingTime: str("readingTime", "5 min read"),
        image: str("image", "/og/base-og.jpg"),
        imageAlt: str("imageAlt", title),
        ctaPrompt: str("ctaPrompt"),
        tags: list("tags"),
        featured: str("featured") === "true",
        html: enhanceHtml(marked.parse(body, { async: false, gfm: true }) as string),
        faqs: extractFaqs(body),
        toc: buildToc(body),
    };
}

/**
 * All published posts, newest first.
 *
 * The virtual module contains only posts whose datePublished has arrived, so
 * scheduled drafts are absent from the bundle rather than filtered out of it.
 */
export const posts: BlogPost[] = Object.entries(publishedMarkdown)
    .map(([slug, raw]) => toPost(slug, raw))
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));

export function getPost(slug: string | undefined): BlogPost | undefined {
    return posts.find((post) => post.slug === slug);
}

/** Same category first, then most recent, excluding the current post. */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
    const current = getPost(slug);
    if (!current) return posts.slice(0, limit);

    return [...posts]
        .filter((post) => post.slug !== slug)
        .sort((a, b) => {
            const aMatch = a.category === current.category ? 0 : 1;
            const bMatch = b.category === current.category ? 0 : 1;
            if (aMatch !== bMatch) return aMatch - bMatch;
            return a.datePublished < b.datePublished ? 1 : -1;
        })
        .slice(0, limit);
}

export function formatDate(iso: string): string {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}
