# Base Real Estate

Marketing site for **Base Real Estate** — Bassam "Sam" Elsherif, Orange County, California.

Vite + React 19 + TypeScript + Tailwind, statically prerendered at build time so
every route ships complete HTML for crawlers and AI answer engines that never
run JavaScript.

---

## Before this can launch

Four things are unresolved. The first is a legal blocker in California; the
rest are correctness. Every one of them is a single edit in
`src/config/site.ts` — search that file for `TODO(client)`.

| # | What's missing | Where | Why it matters |
|---|---|---|---|
| 1 | **Sam's DRE licence number** | `LICENSE.dreLicense`, then set `dreConfirmed: true` | California requires an agent's licence number on marketing material. The site currently renders no number rather than a wrong one, and every licence line is gated behind `dreConfirmed`. |
| 2 | **Which brokerage** | `LICENSE.brokerage` | The brand assets Sam supplied include a *WERE Real Estate* logo; a note during intake said "same as Regina's", which is *Nest Real Estate*. These conflict. Set `name`, then `confirmed: true`, and `showMark: true` once a high-resolution logo arrives. |
| 3 | **Real client reviews** | `REVIEWS`, then set `PROOF.hasReviews: true` | Sam named reviews as his proof but supplied none. Nothing is invented: the homepage renders an honest "reviews are being collected" panel until real, attributable reviews are pasted in. The same applies to `STATS` / `PROOF.hasStats` — no sale count, average price, or star rating is published without verifiable figures. |
| 4 | **The domain** | `SITE_URL` **and** the `@id` values in `index.html` | Drives canonical tags, OG tags, `sitemap.xml`, `robots.txt`, `llms.txt`, and the JSON-LD entity graph. Currently a placeholder: `https://www.baserealestate.com`. Also set `SITE_URL` in the Vercel environment, and restore the apex → www redirect in `vercel.json` (removed because it named a domain that no longer applies). |

### Also worth replacing

**The headshots.** The supplied files are roughly 240 × 300 px. They are
upscaled in `scripts/prepare-brand-assets.mjs` and used at small render sizes,
but no resampler invents detail. Drop a high-resolution portrait over
`assets/IMG_5509.jpeg` and re-run `npm run images:brand`.

---

## Where the content lives

`src/config/site.ts` is the single source of truth for every client-specific
fact — name, phone, email, hours, services, service areas, promises, process
steps, form options, reviews. Pages import from it rather than hard-coding
anything, so a change of phone number or a reordered service list is one edit.

Two places intentionally duplicate a handful of those values, because they run
outside the bundle and cannot import from it:

- `api/send.ts` — the lead-form handler. Its `ALLOWED_SERVICES`,
  `ALLOWED_URGENCY`, and `ALLOWED_MARKETS` maps are the server-side contract
  with the `<select>` options in `src/pages/Contact.tsx`. **Change both together.**
- `index.html` — the site-wide JSON-LD entity graph.

Blog posts are Markdown in `src/content/blog/`. A scheduling system exists: a
post is invisible — no route, no sitemap entry, no trace in the shipped
JavaScript — until its `datePublished` arrives. All six live posts are past
their date, so all six are published. See "Article scheduling is paused" below.

---

## Brand

Sampled directly from the client's logo files:

| Role | Value |
|---|---|
| Navy (ink) | `#1B2A41` |
| Gold (accent) | `#B08D57` |
| Cream | `#FAF7F0` |

Display face is **Bodoni Moda**, chosen to match the high-contrast didone in the
BASE wordmark; body and UI are **Jost**. Both load from Google Fonts, which the
CSP in `vercel.json` already allows.

`npm run images:brand` regenerates every derived brand image from `/assets`:
wordmark recolours, optically-corrected nav variants, the monogram, favicons,
headshot crops, and the OG social card. It is idempotent — re-run it whenever a
source asset changes.

> The nav wordmark is a separate, optically-corrected asset. The full logo is
> 3000 px wide and the navigation renders it near 250 px, which puts a didone's
> hairlines under one device pixel and turns the mark grey. See `navWordmark()`
> in `scripts/prepare-brand-assets.mjs`.

---

## Commands

```bash
npm install
npm run dev            # dev server on :5173
npm run build          # SEO files -> client -> SSR -> prerender to dist/
npm run preview        # serve the built site
npm run lint

npm run seo:generate   # regenerate sitemap.xml, robots.txt, llms.txt
npm run images:brand   # regenerate every derived image (see note below)
```

> `images:brand` reads the high-resolution originals in `assets/renders/`,
> which are **not in the repo** — Vercel never runs this script. Everything
> the site serves is already derived into `public/` and is tracked. Copy
> `assets/renders/` from the design machine before running it.
>
> Photograph credits, the source of every frame, and how to swap one are in
> [PHOTOGRAPHY.md](PHOTOGRAPHY.md).

`npm run build` runs `seo:generate`, the client build, an SSR build, and then
`scripts/prerender.mjs`, which renders every route to static HTML and fails the
build if any route comes back empty or without a `<title>`.

---

## Environment

Copy `.env.example`. `RESEND_API_KEY` and `LEAD_TO_EMAIL` are required for the
lead form; without them `/api/send` returns a 500 rather than silently dropping
a lead.

`GOOGLE_SITE_VERIFICATION` is optional and injected into `<head>` at build time
by a Vite plugin — do not hard-code it in `index.html`.

---

## Deploying

Vercel, with no configuration beyond the defaults — it detects Vite, runs
`npm run build`, and serves `dist/`.

Set these in **Project Settings → Environment Variables** before the lead form
will work:

| Variable | Required | Value |
|---|---|---|
| `RESEND_API_KEY` | yes | From the Resend dashboard |
| `LEAD_TO_EMAIL` | yes | `sam.elsherif@gmail.com` |
| `LEADS_BCC_EMAIL` | no | Comma-separated BCC list |
| `SITE_URL` | recommended | The real domain, once chosen |
| `GOOGLE_SITE_VERIFICATION` | no | Injected into `<head>` at build time |

Without `RESEND_API_KEY` and `LEAD_TO_EMAIL`, `/api/send` returns a 500 rather
than silently dropping a lead — that is deliberate.

`vercel.json` carries the security headers (including a strict CSP that already
allows Google Fonts), the cache policy, and `trailingSlash: false`. The
`/api/send` function declares its own Node runtime.

The build fails loudly if any route prerenders empty or without a `<title>`, so
a broken deploy will not go live silently.

After the first deploy, work through `docs/PRODUCTION_SEO_CHECKLIST.md`.

## Article scheduling is paused

All eleven inherited draft articles are parked outside the build in
`src/content/drafts/` (untracked — they live on the working machine only), and
the monthly publish workflow has been removed. Nothing publishes on its own.

The six live starter articles in `src/content/blog/` are original, sourced, and
dated. To resume scheduling later, restore a GitHub Action pointing at a Vercel
deploy hook; the date filter in `vite.config.ts` still holds future-dated posts
until their day arrives.
