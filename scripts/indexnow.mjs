/*
 * IndexNow — tells Bing (and Yandex, Seznam, Naver) that pages changed, so
 * they recrawl in minutes instead of weeks. It matters more for AI search
 * than for classic search: Bing's index is what Copilot and much of ChatGPT's
 * web search read from.
 *
 * Run after a deploy, once SITE_URL is the real, public domain:
 *   SITE_URL=https://www.example.com npm run indexnow
 *
 * The key file public/beac933bf8b0d4e59f91216648af7cda.txt must be served from the site root; that is
 * how the search engines verify the ping came from the site's owner.
 */
import { readFile } from "node:fs/promises";

const KEY = "beac933bf8b0d4e59f91216648af7cda";
const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");
if (!SITE_URL) {
    console.error("[indexnow] Set SITE_URL to the live, public domain explicitly — there is no default.");
    process.exit(1);
}

const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => u.startsWith("http") && !u.match(/\.(png|jpe?g|webp)$/));

const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList: urls }),
});
console.log(`[indexnow] ${res.status} ${res.statusText} — submitted ${urls.length} URLs for ${SITE_URL}`);
