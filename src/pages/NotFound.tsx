import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SEO from "../hooks/useSEO";
import { BRAND, PRIMARY_CTA } from "@/config/site";

const ease = [0.22, 1, 0.36, 1] as const;

export default function NotFound() {
    return (
        <div className="bg-navy text-cream w-full min-h-screen flex items-center justify-center">
            <SEO
                title="Page Not Found"
                description={`The page you're looking for doesn't exist. Return to ${BRAND.name} for Orange County real estate guidance.`}
                path="/404"
                noindex
            />

            <div className="text-center px-6 py-40 max-w-xl">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-4 mb-10"
                >
                    <span className="block h-px w-10 bg-gold-400" />
                    <span className="eyebrow text-cream/60">Page not found</span>
                    <span className="block h-px w-10 bg-gold-400" />
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.1 }}
                    className="font-display text-cream leading-none mb-8"
                    style={{ fontSize: "clamp(4.5rem, 16vw, 9rem)" }}
                >
                    404
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.2 }}
                    className="text-[17px] font-light leading-[1.85] text-cream/60 mb-12"
                >
                    This page has moved or never existed. Everything else is where you left it.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        to="/"
                        className="group inline-flex items-center justify-center gap-3 bg-cream text-navy px-9 py-4 eyebrow transition-all duration-500 ease-brand hover:bg-white"
                    >
                        Back to home
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.25} />
                    </Link>
                    <Link to={PRIMARY_CTA.href} className="btn-outline-light">
                        {PRIMARY_CTA.shortLabel}
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
