import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root')!

/*
 * The prerenderer relocates React 19's hoisted document metadata into <head>
 * and marks each tag with data-prerendered. React has no knowledge of those
 * relocated nodes, so on hydration it emits its own copies — leaving two of
 * every <title>, canonical link, and meta tag in the DOM.
 *
 * Dropping them immediately before hydration keeps exactly one set: the
 * prerendered tags serve crawlers that never run JavaScript, and React owns
 * them from hydration onward.
 */
document.querySelectorAll('head [data-prerendered]').forEach((el) => el.remove())

const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

// Prerendered documents ship real markup inside #root; hydrate it rather than
// throwing it away and re-rendering from scratch.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
