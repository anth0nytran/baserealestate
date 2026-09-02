import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Scheduled publishing.
 *
 * A post goes live when its `datePublished` is on or before the build date.
 * Future-dated posts are excluded from the bundle, the prerendered routes, the
 * sitemap, and llms.txt — so the content is not merely hidden, it is never
 * shipped. Releasing them is therefore just a matter of rebuilding on a
 * schedule; see .github/workflows/publish-scheduled-post.yml.
 *
 * Set PUBLISH_AS_OF=YYYY-MM-DD to build as if it were another date. Useful for
 * previewing the queue without waiting for the calendar.
 */

export const BLOG_DIR = path.resolve(process.cwd(), "src", "content", "blog");

export function publishCutoff() {
  const override = process.env.PUBLISH_AS_OF;
  if (override) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(override)) {
      throw new Error(`PUBLISH_AS_OF must be YYYY-MM-DD, received "${override}".`);
    }
    return override;
  }
  return new Date().toISOString().slice(0, 10);
}

/** Reads a scalar frontmatter field without a full YAML parse. */
export function frontmatterField(raw, key) {
  const match = new RegExp(`^${key}:\\s*(.*)$`, "m").exec(raw);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

/**
 * ISO dates compare correctly as strings, so no Date parsing is needed.
 * A post with no datePublished is treated as published so that the explicit
 * error in src/lib/blog.ts fires instead of the post silently vanishing.
 */
export function isPublished(raw, cutoff) {
  const date = frontmatterField(raw, "datePublished");
  if (!date) return true;
  return date <= cutoff;
}

/** All posts on disk, each tagged with whether it is live yet. */
export async function readAllPosts(cutoff = publishCutoff()) {
  let files = [];
  try {
    files = await readdir(BLOG_DIR);
  } catch {
    return [];
  }

  const posts = [];
  for (const file of files.filter((f) => f.endsWith(".md"))) {
    const raw = await readFile(path.join(BLOG_DIR, file), "utf8");
    posts.push({
      slug: file.replace(/\.md$/, ""),
      title: frontmatterField(raw, "title") || file,
      description: frontmatterField(raw, "description") || "",
      datePublished: frontmatterField(raw, "datePublished") || cutoff,
      dateModified:
        frontmatterField(raw, "dateModified") ||
        frontmatterField(raw, "datePublished") ||
        cutoff,
      published: isPublished(raw, cutoff),
    });
  }

  return posts.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));
}

export async function readPublishedPosts(cutoff = publishCutoff()) {
  return (await readAllPosts(cutoff)).filter((post) => post.published);
}
