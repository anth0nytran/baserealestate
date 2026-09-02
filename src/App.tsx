import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/*
        Vercel Web Analytics. The React entry point is the right one here — this
        is a Vite + React Router SPA, not Next, so `@vercel/analytics/next` does
        not apply. It renders nothing during prerendering and injects the script
        on the client, where it patches history and reports SPA route changes on
        its own.

        In production the script and its event endpoint are both first-party
        (/_vercel/insights/*), so the strict CSP in vercel.json already allows
        them and needs no widening.
      */}
      <Analytics />
    </Layout>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-6 h-6 border border-navy/15 border-t-gold rounded-full animate-spin" />
    </div>
  );
}

export default App;
