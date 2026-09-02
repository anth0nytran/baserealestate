import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync } from 'node:fs'
import path from "path"
import { isPublished, publishCutoff } from './scripts/lib/scheduled-posts.mjs'

const VIRTUAL_ID = 'virtual:blog-posts'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/**
 * Serves the blog content as a virtual module containing only posts whose
 * datePublished has arrived.
 *
 * This deliberately replaces an `import.meta.glob` over the content directory.
 * A glob is resolved at compile time and bakes the full file map into the
 * bundle, so even with each future post's body blanked out, every scheduled
 * slug — the entire content calendar — stayed readable in the shipped
 * JavaScript. Building the map here means unreleased posts leave no trace:
 * no body, no slug, no route.
 */
function scheduledPosts(): Plugin {
  const cutoff = publishCutoff()
  const blogDir = path.resolve(__dirname, 'src/content/blog')

  return {
    name: 'base:scheduled-posts',

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },

    load(id) {
      if (id !== RESOLVED_ID) return null

      const published: Record<string, string> = {}
      let held = 0

      for (const file of readdirSync(blogDir).filter((f) => f.endsWith('.md'))) {
        const raw = readFileSync(path.join(blogDir, file), 'utf8')
        if (isPublished(raw, cutoff)) {
          published[file.replace(/\.md$/, '')] = raw
        } else {
          held += 1
        }
      }

      this.info?.(
        `${Object.keys(published).length} post(s) live as of ${cutoff}` +
          (held ? `, ${held} scheduled` : '')
      )

      return `export default ${JSON.stringify(published)}`
    },

    // Editing Markdown should refresh the dev server even though the content
    // now lives behind a virtual module the watcher doesn't associate with it.
    configureServer(server) {
      server.watcher.add(blogDir)
      server.watcher.on('all', (_event, file) => {
        if (!file.endsWith('.md') || !file.startsWith(blogDir)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

/**
 * Injects the Google Search Console verification meta tag from the
 * GOOGLE_SITE_VERIFICATION environment variable.
 *
 * This replaces a commented-out placeholder in index.html that could never
 * have worked — verification has to be in the served markup, and a comment
 * isn't. Set the variable in Vercel → Settings → Environment Variables and
 * redeploy; leave it unset and nothing is emitted, which is the correct
 * behaviour for a site verified by DNS or an HTML file instead.
 */
function searchConsoleVerification(): Plugin {
  const token = process.env.GOOGLE_SITE_VERIFICATION?.trim()

  return {
    name: 'base:search-console-verification',
    transformIndexHtml(html) {
      if (!token) return html
      return html.replace(
        '</head>',
        `  <meta name="google-site-verification" content="${token.replace(/"/g, '&quot;')}" />\n</head>`
      )
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), scheduledPosts(), searchConsoleVerification()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ssr: {
    // react-helmet-async ships a CJS build whose named exports don't resolve
    // cleanly under Node ESM, so bundle it. react-router-dom must stay
    // external: bundling it rewrites its `react-router/dom` import into a
    // default import, which that ESM-only module doesn't provide.
    noExternal: ["react-helmet-async"],
  },
})
