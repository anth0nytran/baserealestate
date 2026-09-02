import { track } from "@vercel/analytics";

/**
 * Custom event tracking for Vercel Web Analytics.
 *
 * Everything funnels through this module rather than calling `track()` inline
 * so the event names stay a closed set. Vercel's dashboard groups by exact
 * string, so a stray "Lead Submit" alongside "Lead Submitted" silently splits
 * one funnel into two and neither number is right.
 *
 * Every page here is prerendered, so these run during SSR too — `track()` is a
 * no-op without a browser, but the guard keeps that explicit rather than
 * relying on the library's internals.
 *
 * Properties must stay flat: Vercel accepts string, number, boolean, and null
 * only, and silently drops nested objects.
 */

export const EVENTS = {
    /** Contact form accepted by /api/send. The conversion that matters. */
    leadSubmitted: "Lead Submitted",
    /** Contact form attempted but rejected (validation or API error). */
    leadFailed: "Lead Failed",
    /** Tap/click on a tel: link. */
    phoneClick: "Phone Click",
    /** Tap/click on a mailto: link. */
    emailClick: "Email Click",
    /** Any CTA that routes to the contact page. */
    ctaClick: "CTA Click",
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];
type Props = Record<string, string | number | boolean | null>;

function emit(name: EventName, properties?: Props) {
    if (typeof window === "undefined") return;
    try {
        track(name, properties);
    } catch {
        // Analytics must never take a page down with it.
    }
}

/** `service` and `urgency` are the two fields that tell Sam lead quality. */
export function trackLeadSubmitted(service: string, urgency: string) {
    emit(EVENTS.leadSubmitted, { service: service || "unspecified", urgency: urgency || "unspecified" });
}

export function trackLeadFailed(reason: "validation" | "api" | "network") {
    emit(EVENTS.leadFailed, { reason });
}

/** `location` is where on the site the click happened, e.g. "footer", "mobile-menu". */
export function trackPhoneClick(location: string) {
    emit(EVENTS.phoneClick, { location });
}

export function trackEmailClick(location: string) {
    emit(EVENTS.emailClick, { location });
}

export function trackCtaClick(label: string, location: string) {
    emit(EVENTS.ctaClick, { label, location });
}
