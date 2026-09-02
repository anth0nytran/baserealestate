import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

export const config = { runtime: "nodejs" };

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const dupeStore = new Map<string, { count: number; resetAt: number }>();

/* Brand constants. Mirrors src/config/site.ts — update both together. */
const BRAND_NAME = "Base Real Estate";
const AGENT_NAME = "Sam Elsherif";
const AGENT_FIRST = "Sam";
const AGENT_PHONE_DISPLAY = "(949) 945-8225";
const AGENT_PHONE_E164 = "+19499458225";
const NAVY = "#1B2A41";
const GOLD = "#B08D57";
const CREAM = "#FAF7F0";

const esc = (v: string) =>
    v.replace(/[&<>"']/g, (c) =>
        c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
    );

const norm = (v: unknown) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "");

/*
 * Allow-lists. These are the contract with the <select> options in
 * src/pages/Contact.tsx; a value arriving here that isn't in the matching map
 * is either a stale client or a hand-rolled POST, and is rejected rather than
 * echoed into an email.
 */
const ALLOWED_SERVICES: Record<string, string> = {
    knowledge: "Knowledge Transfer",
    consulting: "Real Estate Consulting",
    buying: "Home Purchase",
    selling: "Home Sale",
    investing: "Investor Assistance",
};

const ALLOWED_URGENCY: Record<string, string> = {
    immediately: "Right away — this week",
    "2-4-weeks": "In the next 2–4 weeks",
    "1-3-months": "1–3 months out",
    "3-6-months": "3–6 months out",
    researching: "Still researching",
};

/** Urgency values that should visibly flag the lead as hot in the inbox. */
const HOT_URGENCY = new Set(["immediately", "2-4-weeks"]);

const ALLOWED_MARKETS: Record<string, string> = {
    "newport-beach": "Newport Beach",
    "laguna-beach": "Laguna Beach",
    "dana-point": "Dana Point",
    "laguna-niguel": "Laguna Niguel",
    "huntington-beach": "Huntington Beach",
    "costa-mesa": "Costa Mesa",
    irvine: "Irvine",
    "san-clemente": "San Clemente",
    "corona-del-mar": "Corona Del Mar",
    "san-juan-capistrano": "San Juan Capistrano",
    "aliso-viejo": "Aliso Viejo",
    "mission-viejo": "Mission Viejo",
    tustin: "Tustin",
    orange: "Orange",
    "santa-ana": "Santa Ana",
    anaheim: "Anaheim",
    "elsewhere-oc": "Elsewhere in Orange County",
    undecided: "Not sure yet — needs guidance",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ ok: false, error: "Method not allowed." });
    }

    // Rate limit
    const ip =
        (Array.isArray(req.headers["x-forwarded-for"])
            ? req.headers["x-forwarded-for"][0]
            : req.headers["x-forwarded-for"]?.split(",")[0]?.trim()) ||
        req.socket?.remoteAddress ||
        "unknown";
    const now = Date.now();
    const rl = rateLimitStore.get(ip);
    if (rl && rl.resetAt > now && rl.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({ ok: false, error: "Too many requests. Please try again shortly." });
    }
    rateLimitStore.set(ip, {
        count: (rl && rl.resetAt > now ? rl.count : 0) + 1,
        resetAt: rl && rl.resetAt > now ? rl.resetAt : now + RATE_LIMIT_WINDOW_MS,
    });

    // Parse body
    let data: Record<string, unknown> = {};
    if (typeof req.body === "string") {
        try {
            data = JSON.parse(req.body);
        } catch {
            return res.status(400).json({ ok: false, error: "Invalid JSON." });
        }
    } else if (typeof req.body === "object" && req.body) {
        data = req.body as Record<string, unknown>;
    }

    // Honeypot — answer 200 so the bot believes it succeeded.
    if (norm(data.website) || norm(data.fax) || norm(data.company_url)) {
        return res.status(200).json({ ok: true });
    }

    // Timing check: a human cannot complete six fields in under three seconds.
    const ts = parseInt(norm(data._ts), 10);
    if (!Number.isNaN(ts) && Date.now() - ts < 3000) {
        return res.status(200).json({ ok: true });
    }

    const fullName = norm(data.fullName);
    const email = norm(data.email);
    const phone = norm(data.phone);
    const urgency = norm(data.urgency);
    const market = norm(data.market);
    const service = norm(data.service);

    // Validation — mirrors the client-side rules in src/pages/Contact.tsx.
    if (!fullName || fullName.length < 2 || fullName.length > 80) {
        return res.status(400).json({ ok: false, error: "Please enter your full name." });
    }
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
        return res.status(400).json({ ok: false, error: "Please enter a valid phone number." });
    }
    if (!urgency || !ALLOWED_URGENCY[urgency]) {
        return res.status(400).json({ ok: false, error: "Please choose how soon you'd like to hear back." });
    }
    if (!market || !ALLOWED_MARKETS[market]) {
        return res.status(400).json({ ok: false, error: "Please choose the area you're interested in." });
    }
    // Service is optional, but a value that was sent must be a known one.
    if (service && !ALLOWED_SERVICES[service]) {
        return res.status(400).json({ ok: false, error: "Please choose a valid service." });
    }

    // Duplicate suppression
    const dupeKey = `${email.toLowerCase()}|${phoneDigits}|${market}`;
    const dupe = dupeStore.get(dupeKey);
    if (dupe && dupe.resetAt > now && dupe.count > 2) {
        return res.status(200).json({ ok: true });
    }
    dupeStore.set(dupeKey, {
        count: (dupe && dupe.resetAt > now ? dupe.count : 0) + 1,
        resetAt: dupe && dupe.resetAt > now ? dupe.resetAt : now + 6 * 60 * 60 * 1000,
    });

    // Spam check
    const combined = `${fullName} ${email}`.toLowerCase();
    const spamWords = ["crypto", "bitcoin", "casino", "viagra", "seo services", "backlinks", "web traffic", "lottery winner"];
    if (spamWords.some((w) => combined.includes(w))) {
        return res.status(200).json({ ok: true });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEAD_TO_EMAIL;
    if (!resendApiKey || !toEmail) {
        return res.status(500).json({ ok: false, error: "Server misconfigured." });
    }

    const resend = new Resend(resendApiKey);
    const urgencyLabel = ALLOWED_URGENCY[urgency];
    const marketLabel = ALLOWED_MARKETS[market];
    const serviceLabel = service ? ALLOWED_SERVICES[service] : "Not specified";
    const isHot = HOT_URGENCY.has(urgency);

    const timestamp = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
    }).format(new Date());

    const phoneLink =
        phoneDigits.length === 10
            ? `+1${phoneDigits}`
            : phoneDigits.length === 11 && phoneDigits.startsWith("1")
              ? `+${phoneDigits}`
              : phoneDigits;

    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:12px 0;color:#7386A3;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;width:150px;vertical-align:top;">${esc(label)}</td>
        <td style="padding:12px 0;color:${NAVY};font-size:15px;">${value}</td>
      </tr>`;

    // ---- INTERNAL LEAD EMAIL ----
    const leadHtml = `
<div style="background:${CREAM};margin:0;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${NAVY};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid rgba(27,42,65,0.12);">
    <tr><td style="background:${NAVY};padding:22px 28px;">
      <table role="presentation" width="100%"><tr>
        <td style="color:${CREAM};font-size:13px;letter-spacing:0.24em;text-transform:uppercase;">${esc(BRAND_NAME)}</td>
        <td align="right"><span style="color:${isHot ? NAVY : CREAM};background:${isHot ? GOLD : "transparent"};border:1px solid ${GOLD};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:6px 12px;">${isHot ? "Hot Lead" : "New Lead"}</span></td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:32px 28px 8px;">
      <div style="font-size:28px;font-weight:400;margin:0 0 8px;">${esc(fullName)}</div>
      <div style="font-size:13px;color:#7386A3;letter-spacing:0.12em;text-transform:uppercase;">${esc(timestamp)}</div>
      <div style="height:1px;width:48px;background:${GOLD};margin:20px 0 0;"></div>
    </td></tr>

    <tr><td style="padding:20px 28px 24px;">
      <a href="tel:${esc(phoneLink)}" style="display:block;background:${NAVY};color:${CREAM};text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-align:center;padding:16px;margin-bottom:10px;">Call ${esc(fullName.split(" ")[0])}</a>
      <a href="mailto:${esc(email)}" style="display:block;color:${NAVY};text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-align:center;padding:16px;border:1px solid rgba(27,42,65,0.22);">Email lead</a>
    </td></tr>

    <tr><td style="padding:0 28px 32px;">
      <table role="presentation" width="100%" style="border-top:1px solid rgba(27,42,65,0.12);">
        ${row("Name", esc(fullName))}
        ${row("Phone", `<a href="tel:${esc(phoneLink)}" style="color:${NAVY};text-decoration:none;">${esc(phone)}</a>`)}
        ${row("Email", `<a href="mailto:${esc(email)}" style="color:${NAVY};text-decoration:none;">${esc(email)}</a>`)}
        ${row("Urgency", `<strong style="color:${isHot ? GOLD : NAVY};">${esc(urgencyLabel)}</strong>`)}
        ${row("Market / area", esc(marketLabel))}
        ${row("Service", esc(serviceLabel))}
      </table>
    </td></tr>

    <tr><td style="padding:0 28px 28px;">
      <div style="border-left:1px solid ${GOLD};padding:12px 16px;background:${CREAM};font-size:12px;color:#7386A3;">
        Submitted through the ${esc(BRAND_NAME)} website.
        <span style="display:block;margin-top:6px;">Website by <a href="https://quicklaunchweb.us" style="color:#7386A3;">QuickLaunchWeb</a></span>
      </div>
    </td></tr>
  </table>
</div>`;

    // ---- PROSPECT CONFIRMATION EMAIL ----
    const firstName = fullName.split(" ")[0] || fullName;
    const prospectHtml = `
<div style="background:${CREAM};margin:0;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${NAVY};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid rgba(27,42,65,0.12);">
    <tr><td style="background:${NAVY};padding:34px 28px;text-align:center;">
      <div style="font-size:17px;letter-spacing:0.3em;text-transform:uppercase;color:${CREAM};">${esc(BRAND_NAME)}</div>
      <div style="height:1px;width:44px;background:${GOLD};margin:16px auto 0;"></div>
      <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(250,247,240,0.55);margin-top:16px;">Orange County, California</div>
    </td></tr>

    <tr><td style="padding:36px 28px;">
      <div style="font-size:26px;margin:0 0 20px;">Thank you, ${esc(firstName)}.</div>

      <p style="font-size:15px;color:#3D5273;line-height:1.85;margin:0 0 18px;">
        Your request has reached ${esc(AGENT_FIRST)} directly. He reviews every enquiry himself
        and will reach out on the timeline you chose — <strong style="color:${NAVY};">${esc(urgencyLabel.toLowerCase())}</strong>.
      </p>
      <p style="font-size:15px;color:#3D5273;line-height:1.85;margin:0 0 28px;">
        There is nothing to prepare and nothing to sign. Bring your questions; the harder the better.
      </p>

      <table role="presentation" width="100%" style="border-top:1px solid rgba(27,42,65,0.12);margin-bottom:28px;">
        ${row("Area of interest", esc(marketLabel))}
        ${row("Service", esc(serviceLabel))}
        ${row("Timeline", esc(urgencyLabel))}
      </table>

      <p style="font-size:14px;color:#3D5273;line-height:1.85;margin:0 0 6px;">Need to reach ${esc(AGENT_FIRST)} sooner?</p>
      <p style="font-size:20px;margin:0 0 32px;">
        <a href="tel:${AGENT_PHONE_E164}" style="color:${NAVY};text-decoration:none;">${esc(AGENT_PHONE_DISPLAY)}</a>
      </p>

      <div style="border-top:1px solid rgba(27,42,65,0.12);padding-top:24px;text-align:center;">
        <div style="font-size:15px;color:${NAVY};">${esc(AGENT_NAME)}, REALTOR&reg;</div>
        <div style="font-size:12px;color:#7386A3;margin-top:6px;letter-spacing:0.12em;text-transform:uppercase;">${esc(BRAND_NAME)}</div>
      </div>
    </td></tr>
  </table>
</div>`;

    try {
        const bcc = process.env.LEADS_BCC_EMAIL?.split(",").map((e) => e.trim()).filter(Boolean) || undefined;

        const { error: leadErr } = await resend.emails.send({
            from: `${BRAND_NAME} | New Lead <leads@quicklaunchweb.us>`,
            to: [toEmail],
            bcc,
            replyTo: email,
            subject: `${isHot ? "HOT — " : ""}New Lead | ${marketLabel} | ${fullName}`,
            html: leadHtml,
            text: `New Lead: ${fullName}\nPhone: ${phone}\nEmail: ${email}\nUrgency: ${urgencyLabel}\nMarket/Area: ${marketLabel}\nService: ${serviceLabel}\nReceived: ${timestamp}`,
        });

        if (leadErr) {
            console.error("Resend lead error:", leadErr);
            return res.status(500).json({ ok: false, error: "Failed to send. Please try again." });
        }

        // Confirmation to the prospect. Non-blocking: the lead is already safe.
        await resend.emails
            .send({
                from: `${AGENT_NAME} · ${BRAND_NAME} <leads@quicklaunchweb.us>`,
                to: [email],
                replyTo: toEmail,
                subject: `Thank you, ${firstName} — ${AGENT_FIRST} will be in touch`,
                html: prospectHtml,
                text: `Thank you, ${firstName}.\n\nYour request has reached ${AGENT_FIRST} directly. He will reach out on the timeline you chose: ${urgencyLabel}.\n\nArea of interest: ${marketLabel}\nService: ${serviceLabel}\n\nNeed to reach him sooner? ${AGENT_PHONE_DISPLAY}\n\n${AGENT_NAME}, REALTOR(R)\n${BRAND_NAME}`,
            })
            .catch((err) => console.error("Prospect email failed (non-blocking):", err));
    } catch (error) {
        console.error("Unhandled exception:", error);
        return res.status(500).json({ ok: false, error: "Failed to send. Please try again." });
    }

    return res.status(200).json({ ok: true });
}
