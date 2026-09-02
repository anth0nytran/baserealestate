import { Writable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
// React Router v7 dropped the react-router-dom/server subpath; StaticRouter
// is exported from the core react-router package.
import { StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";

/**
 * Renders a route to an HTML string for the prerenderer.
 *
 * Two behaviours worth knowing about:
 *
 * 1. renderToPipeableStream with onAllReady (rather than renderToString) lets
 *    React fully resolve the lazy() route components before we capture output.
 *    With renderToString every page would contain only the Suspense spinner.
 *
 * 2. Under React 19, document metadata (<title>, <meta>, <link>) rendered by
 *    react-helmet-async is hoisted to the front of this stream rather than
 *    exposed via a Helmet context object. scripts/prerender.mjs splits those
 *    leading tags off and relocates them into <head>.
 */
export function render(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let settled = false;

        const sink = new Writable({
            write(chunk: Buffer | string, _encoding: unknown, callback: () => void) {
                chunks.push(Buffer.from(chunk));
                callback();
            },
        });

        sink.on("finish", () => {
            if (settled) return;
            settled = true;
            resolve(Buffer.concat(chunks).toString("utf8"));
        });

        const { pipe, abort } = renderToPipeableStream(
            <HelmetProvider>
                <StaticRouter location={url}>
                    <App />
                </StaticRouter>
            </HelmetProvider>,
            {
                onAllReady() {
                    pipe(sink);
                },
                onError(error) {
                    if (settled) return;
                    settled = true;
                    abort();
                    reject(error);
                },
            }
        );
    });
}
