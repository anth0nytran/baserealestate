import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { publishCutoff, readAllPosts } from "./lib/scheduled-posts.mjs";

/**
 * Static prerenderer.
 *
 * Renders every route to real HTML at build time. This is the single most
 * important SEO/AEO mechanism in this project: AI answer engines (GPTBot,
 * PerplexityBot, ClaudeBot, OAI-SearchBot) generally do NOT execute
 * JavaScript, so a client-rendered SPA is an empty page to them. After this
 * script runs, every route ships complete, readable markup plus its
 * page-specific metadata and JSON-LD.
 *
 * Run via `npm run build` (vite build -> vite build --ssr -> this script).
 */

const root = process.cwd();
const distDir = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const STATIC_ROUTES = ["/", "/services", "/contact"];

async function blogRoutes() {
    const cutoff = publishCutoff();
    const all = await readAllPosts(cutoff);

    if (!all.length) {
        console.warn("[prerender] No blog content found — skipping blog routes.");
        return [];
    }

    const queued = all.filter((post) => !post.published);
    if (queued.length) {
        console.log(
            `[prerender] ${queued.length} post(s) scheduled for later, not built as of ${cutoff}:`
        );
        for (const post of queued) {
            console.log(`[prerender]   ${post.datePublished}  ${post.slug}`);
        }
    }

    return all.filter((post) => post.published).map((post) => `/blog/${post.slug}`);
}

/** Writes "/" to dist/index.html and "/x/y" to dist/x/y/index.html. */
function outputPathFor(route) {
    if (route === "/") return path.join(distDir, "index.html");
    return path.join(distDir, route.replace(/^\//, ""), "index.html");
}

/**
 * React 19 hoists document metadata to the very front of the render stream, so
 * a rendered page begins with a contiguous run of <title>, <meta>, and <link>
 * tags before any app markup. Those belong in <head>, not inside #root.
 *
 * JSON-LD is deliberately left where React put it: <script type="application/
 * ld+json"> is valid in the body and every consumer that matters parses it
 * there, so there's no reason to risk extracting it out of the middle.
 */
function splitHoistedHead(rendered) {
    const head = [];
    let body = rendered;

    for (;;) {
        const match = /^\s*<(title|meta|link)\b[^>]*>/i.exec(body);
        if (!match) break;

        if (match[1].toLowerCase() === "title") {
            const close = body.indexOf("</title>");
            if (close === -1) break;
            head.push(body.slice(body.indexOf("<title"), close + "</title>".length));
            body = body.slice(close + "</title>".length);
        } else {
            head.push(match[0].trim());
            body = body.slice(match[0].length);
        }
    }

    // Tagged so src/main.tsx can drop them just before hydration; without that,
    // React re-emits its own copies and every meta tag ends up duplicated.
    const marked = head.map((tag) => tag.replace(/^<(title|meta|link)\b/i, '<$1 data-prerendered'));

    return { head: marked.join("\n  "), body };
}

function inject(template, rendered) {
    if (!template.includes("<!--app-head-->") || !template.includes("<!--app-html-->")) {
        throw new Error(
            "index.html is missing the app-head or app-html placeholder; prerendering cannot inject content."
        );
    }

    const { head, body } = splitHoistedHead(rendered);

    if (!/<title[\s>]/i.test(head)) {
        throw new Error(
            "Rendered output contained no <title> tag — the page is missing its SEO component."
        );
    }

    return template.replace("<!--app-head-->", head).replace("<!--app-html-->", body);
}

async function main() {
    const template = await readFile(path.join(distDir, "index.html"), "utf8");

    const entryPath = path.join(ssrDir, "entry-server.js");
    const { render } = await import(pathToFileURL(entryPath).href);

    const routes = [...STATIC_ROUTES, "/blog", ...(await blogRoutes())];

    for (const route of routes) {
        const rendered = await render(route);

        if (!rendered || rendered.trim().length < 200) {
            throw new Error(
                `Route "${route}" rendered ${rendered?.length ?? 0} characters — expected a full page. ` +
                    "Prerendering aborted so a broken build is not published."
            );
        }

        const outPath = outputPathFor(route);
        await mkdir(path.dirname(outPath), { recursive: true });
        await writeFile(outPath, inject(template, rendered), "utf8");

        console.log(`[prerender] ${route.padEnd(46)} ${(rendered.length / 1024).toFixed(1)} KB`);
    }

    // A real 404 document so unknown URLs return a hard 404 instead of a soft
    // 200 — Vercel serves /404.html from the output root for unmatched paths.
    const notFound = await render("/__not-found__");
    await writeFile(path.join(distDir, "404.html"), inject(template, notFound), "utf8");
    console.log(`[prerender] ${"404.html".padEnd(46)} ${(notFound.length / 1024).toFixed(1)} KB`);

    // The SSR bundle is a build artifact only; keep it out of the deploy.
    await rm(ssrDir, { recursive: true, force: true });

    console.log(`\n[prerender] Done — ${routes.length + 1} static documents written to dist/.`);
}

main().catch((error) => {
    console.error("\n[prerender] FAILED:", error);
    process.exit(1);
});
