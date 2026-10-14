import { Fragment, type ReactNode } from "react";

/**
 * The backward S.
 *
 * The BASE logotype sets its S reversed, and the client wants every visible
 * "Base" to carry it — in headings, labels, and running copy alike. The
 * letter is mirrored with CSS rather than swapped for a look-alike glyph
 * (Ƨ / ƨ), so the DOM still reads "Base": search engines, screen readers,
 * copy-paste, and find-in-page all see the real name.
 *
 * Only the brand is touched — "Base Real Estate…" and the all-caps mark.
 * Lowercase "base" ("California's base rate") is ordinary English and stays.
 */
const BRAND_WORD = /\b(Ba)(s)(e)(?= Real Estate)|\b(BA)(S)(E)\b/g;

export function brandify(text: string): ReactNode {
    const parts: ReactNode[] = [];
    let last = 0;
    for (const match of text.matchAll(BRAND_WORD)) {
        const [head, s, tail] = match[1] ? match.slice(1, 4) : match.slice(4, 7);
        parts.push(text.slice(last, match.index), head, <span key={match.index} className="brand-s">{s}</span>, tail);
        last = match.index + match[0].length;
    }
    if (parts.length === 0) return text;
    parts.push(text.slice(last));
    return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

/** The same treatment for an HTML string — text between tags only, never attributes. */
export function brandifyHtml(html: string): string {
    return html.replace(/>([^<]+)</g, (_segment, text: string) =>
        `>${text.replace(BRAND_WORD, (_m, a, s, e, A, S, E) => `${a ?? A}<span class="brand-s">${s ?? S}</span>${e ?? E}`)}<`
    );
}
