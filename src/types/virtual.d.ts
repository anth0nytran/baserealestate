/**
 * Blog content injected by the `base:scheduled-posts` plugin in vite.config.ts.
 * Keys are post slugs, values are raw Markdown. Only posts whose datePublished
 * has arrived are present — scheduled posts are absent from the bundle entirely.
 */
declare module "virtual:blog-posts" {
  const posts: Record<string, string>;
  export default posts;
}
