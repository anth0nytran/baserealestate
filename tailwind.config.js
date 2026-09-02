/** @type {import('tailwindcss').Config} */

/*
 * Type roles.
 *
 * Five display steps, three prose steps, two label steps — each with a job.
 * The previous build gave nearly every section heading the same clamp, so the
 * page had one heading size pretending to be a hierarchy. These steps are far
 * enough apart to read as different roles at a glance.
 *
 * Each clamp interpolates linearly between a 400px and a 1600px viewport;
 * the middle term is written out rather than computed by a helper so the
 * numbers stay auditable.
 *
 * Bodoni wants negative tracking as it scales up — the counters open and word
 * spacing grows faster than the letterforms do.
 */

export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                /* High-contrast didone — matches the BASE wordmark. Display only. */
                display: ['"Bodoni Moda"', "Didot", '"Bodoni MT"', "Georgia", "serif"],
                /* Geometric sans for prose, UI, and labels. */
                sans: ['"Jost"', "ui-sans-serif", "system-ui", "sans-serif"],
                serif: ['"Bodoni Moda"', "Didot", "Georgia", "serif"],
            },

            fontSize: {
                /* --- Display roles (Bodoni). 48→92, 38→64, 30→46, 22→28px. --- */
                "d-hero": ["clamp(3rem, 3.67vw + 2.08rem, 5.75rem)", { lineHeight: "0.98", letterSpacing: "-0.025em" }],
                "d-page": ["clamp(2.375rem, 2.17vw + 1.83rem, 4rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
                "d-section": ["clamp(1.875rem, 1.33vw + 1.54rem, 2.875rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
                "d-block": ["clamp(1.375rem, 0.5vw + 1.25rem, 1.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
                "d-item": ["1.1875rem", { lineHeight: "1.3", letterSpacing: "-0.005em" }],

                /* --- Prose roles (Jost). 17→21px lead. --- */
                lead: ["clamp(1.0625rem, 0.33vw + 0.98rem, 1.3125rem)", { lineHeight: "1.75", letterSpacing: "0.002em" }],
                body: ["1.0625rem", { lineHeight: "1.8", letterSpacing: "0.004em" }],
                "body-sm": ["0.9375rem", { lineHeight: "1.75", letterSpacing: "0.006em" }],

                /* --- Label roles (Jost, tracked). Controls and metadata only. --- */
                label: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.2em" }],
                micro: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.02em" }],
            },

            colors: {
                /* Sampled directly from the client's logo files. */
                navy: {
                    DEFAULT: "#1B2A41",
                    950: "#0D1420",
                    900: "#111C2C",
                    800: "#1B2A41",
                    700: "#2A3D59",
                    600: "#3D5273",
                    500: "#54698A",
                    400: "#7386A3",
                    300: "#9AA9C0",
                    200: "#C3CCDA",
                    100: "#DFE5ED",
                    50: "#EEF1F6",
                },
                gold: {
                    DEFAULT: "#B08D57",
                    700: "#7E6238",
                    600: "#967542",
                    500: "#A5814B",
                    400: "#C6A579",
                    300: "#D6BC9B",
                    200: "#E4D5BC",
                    100: "#F0E7D8",
                    50: "#F6F0E6",
                },
                cream: {
                    DEFAULT: "#FAF7F0",
                    100: "#F6F2E9",
                    200: "#F1ECE1",
                    300: "#E7E0D0",
                },
                /* Semantic aliases so components read by role, not by hue. */
                ink: "#1B2A41",
                accent: { DEFAULT: "#B08D57", foreground: "#FFFFFF" },
                border: "rgba(27, 42, 65, 0.12)",
                background: "#FFFFFF",
                foreground: "#1B2A41",
                muted: { DEFAULT: "#FAF7F0", foreground: "#54698A" },
            },

            letterSpacing: {
                brand: "0.3em",
                label: "0.2em",
                tight: "-0.015em",
                tighter: "-0.025em",
            },

            /*
             * Section rhythm. Using named steps rather than repeating py-36
             * everywhere is what lets the scroll breathe unevenly on purpose —
             * a dense section against an airy one reads as cadence.
             */
            spacing: {
                "sec-xs": "clamp(2.5rem, 4vw, 4rem)",
                "sec-sm": "clamp(3.5rem, 6vw, 6rem)",
                "sec-md": "clamp(5rem, 8vw, 8.5rem)",
                "sec-lg": "clamp(6.5rem, 11vw, 12rem)",
                "sec-xl": "clamp(8rem, 15vw, 16rem)",
                gutter: "clamp(1.5rem, 5vw, 4rem)",
            },

            maxWidth: {
                /* 65ch at the body role — the measure prose is tuned for. */
                measure: "34rem",
                "measure-lg": "42rem",
                shell: "1600px",
            },

            borderRadius: {
                /* Near-sharp: elegant rather than blocky, never bubbly. */
                lg: "2px",
                md: "2px",
                sm: "1px",
            },

            boxShadow: {
                /* Offset + soft blur. A zero-offset halo is decoration. */
                lift: "0 18px 48px -24px rgba(27, 42, 65, 0.32)",
                raise: "0 32px 80px -40px rgba(27, 42, 65, 0.45)",
            },

            transitionTimingFunction: {
                /* Confident arrival. The one easing the whole surface uses. */
                brand: "cubic-bezier(0.16, 1, 0.3, 1)",
                exit: "cubic-bezier(0.4, 0, 1, 1)",
            },

            transitionDuration: {
                feedback: "140ms",
                state: "260ms",
                view: "440ms",
                focal: "760ms",
            },

            keyframes: {
                /* The gold rule drawing itself — the brand's signature device. */
                "rule-draw": {
                    from: { transform: "scaleX(0)" },
                    to: { transform: "scaleX(1)" },
                },
                marquee: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-50%)" },
                },
            },

            animation: {
                "rule-draw": "rule-draw 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
                marquee: "marquee 150s linear infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
