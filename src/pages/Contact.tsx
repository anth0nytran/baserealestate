import { useState, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import SEO from "../hooks/useSEO";
import { cn } from "../lib/utils";
import {
    AGENT,
    AREA,
    BRAND,
    CONTACT,
    LICENSE,
    MARKET_OPTIONS,
    PRIMARY_CTA,
    PROMISES,
    SERVICES,
    URGENCY_OPTIONS,
} from "../config/site";
import { trackEmailClick, trackLeadFailed, trackLeadSubmitted, trackPhoneClick } from "../lib/analytics";

const ease = [0.22, 1, 0.36, 1] as const;

const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.8, ease, delay },
});

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface FormState {
    fullName: string;
    email: string;
    phone: string;
    urgency: string;
    market: string;
    service: string;
    /* Honeypots — see api/send.ts. */
    website: string;
    fax: string;
    company_url: string;
}

const EMPTY: FormState = {
    fullName: "", email: "", phone: "", urgency: "", market: "", service: "",
    website: "", fax: "", company_url: "",
};

/** Field label + gold-underlined control. Shared by inputs and selects. */
const Field = ({
    label,
    required,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div>
        <label className="eyebrow text-navy-400 block mb-3">
            {label}
            {required && <span className="text-gold ml-1">*</span>}
        </label>
        {children}
        {error ? (
            <p className="text-[12px] font-light text-red-500 mt-2">{error}</p>
        ) : hint ? (
            <p className="text-[12px] font-light text-navy-400 mt-2">{hint}</p>
        ) : null}
    </div>
);

/** Native select with the OS chevron replaced by a hairline one. */
const Select = ({
    value,
    onChange,
    invalid,
    placeholder,
    options,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    invalid?: boolean;
    placeholder: string;
    options: readonly { value: string; label: string }[];
}) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className={cn("field field-select", invalid && "field-error", !value && "text-navy-400/70")}
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 bottom-3.5 w-4 h-4 text-gold" strokeWidth={1.25} />
    </div>
);

export default function Contact() {
    const [searchParams] = useSearchParams();

    /* A service link from /services preselects the matching option. */
    const presetService = useMemo(() => {
        const raw = searchParams.get("service");
        return SERVICES.some((s) => s.value === raw) ? (raw as string) : "";
    }, [searchParams]);

    const [form, setForm] = useState<FormState>({ ...EMPTY, service: presetService });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [apiError, setApiError] = useState("");
    const tsRef = useRef(Date.now());

    const formatPhone = (raw: string) => {
        const d = raw.replace(/\D/g, "").slice(0, 10);
        if (d.length <= 3) return d;
        if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
        return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    };

    const set = (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value = field === "phone" ? formatPhone(e.target.value) : e.target.value;
            setForm((f) => ({ ...f, [field]: value }));
            if (errors[field]) {
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });
            }
        };

    const validate = () => {
        const e: Record<string, string> = {};
        if (form.fullName.trim().length < 2) e.fullName = "Please enter your full name.";
        if (!EMAIL_RE.test(form.email.trim())) e.email = "Please enter a valid email address.";
        if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Please enter a 10-digit phone number.";
        if (!form.urgency) e.urgency = "Let Sam know how soon to reach out.";
        if (!form.market) e.market = "Choose the area you're interested in.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setApiError("");

        if (!validate()) {
            trackLeadFailed("validation");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    urgency: form.urgency,
                    market: form.market,
                    service: form.service,
                    website: form.website,
                    fax: form.fax,
                    company_url: form.company_url,
                    _ts: String(tsRef.current),
                }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setApiError(data?.error || "Something went wrong. Please try again.");
                trackLeadFailed("api");
            } else {
                setSubmitted(true);
                trackLeadSubmitted(form.service || "unspecified", form.urgency);
            }
        } catch {
            setApiError("Something went wrong. Please try again, or call directly.");
            trackLeadFailed("network");
        } finally {
            setSubmitting(false);
        }
    };

    const phoneDigits = form.phone.replace(/\D/g, "");

    return (
        <div className="w-full overflow-x-clip">
            <SEO
                title={`Book a Consultation with ${AGENT.shortDisplayName}`}
                description={`Book a no-pressure real estate consultation with ${AGENT.displayName} in Orange County. Call ${CONTACT.phone} or send a few details and Sam will reach out.`}
                path="/contact"
                breadcrumbs={[{ name: "Contact", path: "/contact" }]}
            />

            <section className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* ---------------------- Left: the invitation ---------------------- */}
                <div className="bg-navy text-cream flex flex-col justify-center px-6 md:px-12 lg:px-16 pt-32 pb-16 lg:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15, ease }}
                        className="max-w-lg"
                    >
                        <span className="inline-flex items-center gap-4 mb-8">
                            <span className="block h-px w-10 bg-gold-400" />
                            <span className="eyebrow text-cream/70">{PRIMARY_CTA.label}</span>
                        </span>

                        <h1 className="font-display text-cream leading-[1.08] mb-8" style={{ fontSize: "clamp(2.3rem, 4.6vw, 3.9rem)" }}>
                            Let’s start with
                            <br />
                            <em className="italic text-gold-400">your questions</em>.
                        </h1>

                        <p className="text-[17px] font-light leading-[1.85] text-cream/65 mb-12">
                            {PRIMARY_CTA.promise} Tell {AGENT.firstName} how soon you want to hear
                            back and which part of Orange County you have in mind, and he will take
                            it from there.
                        </p>

                        {/* Advisor card */}
                        <div className="flex items-center gap-5 pb-10 mb-10 border-b border-cream/12">
                            <img
                                src="/base/sam-portrait.jpg"
                                alt={`${AGENT.displayName}, ${AGENT.title}`}
                                width={720}
                                height={720}
                                loading="lazy"
                                className="w-16 h-16 object-cover flex-shrink-0"
                            />
                            <div>
                                <p className="font-display text-[1.15rem] text-cream leading-tight">{AGENT.displayName}</p>
                                <p className="eyebrow text-cream/45 mt-1.5">{AGENT.title} · {BRAND.name}</p>
                            </div>
                        </div>

                        <div className="space-y-5 mb-10">
                            {PROMISES.map((promise) => (
                                <div key={promise.title} className="flex items-center gap-4">
                                    <span className="block h-px w-4 bg-gold flex-shrink-0" />
                                    <span className="text-[15px] font-light text-cream/80">{promise.title}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-cream/12">
                            <a
                                href={`tel:${CONTACT.phoneHref}`}
                                onClick={() => trackPhoneClick("contact-panel")}
                                className="flex items-center gap-4 font-display text-[1.5rem] text-cream hover:text-gold-400 transition-colors"
                            >
                                <Phone className="w-4 h-4 text-gold flex-shrink-0" strokeWidth={1.25} />
                                {CONTACT.phone}
                            </a>
                            <a
                                href={`mailto:${CONTACT.email}`}
                                onClick={() => trackEmailClick("contact-panel")}
                                className="flex items-center gap-4 text-[15px] font-light text-cream/65 hover:text-cream transition-colors break-all"
                            >
                                <Mail className="w-4 h-4 text-gold flex-shrink-0" strokeWidth={1.25} />
                                {CONTACT.email}
                            </a>
                            <p className="flex items-center gap-4 text-[15px] font-light text-cream/65">
                                <Clock className="w-4 h-4 text-gold flex-shrink-0" strokeWidth={1.25} />
                                {CONTACT.hours} · {CONTACT.hoursNote}
                            </p>
                            <p className="flex items-center gap-4 text-[15px] font-light text-cream/65">
                                <MapPin className="w-4 h-4 text-gold flex-shrink-0" strokeWidth={1.25} />
                                {AREA.primaryFull}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* ------------------------- Right: the form ------------------------- */}
                <div className="bg-white flex items-center px-6 md:px-12 lg:px-16 py-20 lg:py-24">
                    <div className="w-full max-w-xl mx-auto">
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, ease }}
                                >
                                    <span className="inline-flex items-center justify-center w-14 h-14 border border-gold/50 mb-8">
                                        <Check className="w-6 h-6 text-gold" strokeWidth={1.25} />
                                    </span>
                                    <h2 className="font-display text-ink leading-[1.15] mb-6" style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.7rem)" }}>
                                        Thank you, {form.fullName.trim().split(" ")[0]}.
                                    </h2>
                                    <p className="text-[17px] font-light leading-[1.85] text-navy-600 mb-4">
                                        Your request is with {AGENT.firstName}. He reviews every enquiry
                                        himself and will reach out on the timeline you selected.
                                    </p>
                                    <p className="text-[15px] font-light leading-[1.85] text-navy-400 mb-10">
                                        A confirmation has been sent to <span className="text-ink">{form.email.trim()}</span>.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <a
                                            href={`tel:${CONTACT.phoneHref}`}
                                            onClick={() => trackPhoneClick("contact-success")}
                                            className="btn-primary group"
                                        >
                                            Call {AGENT.firstName} now
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.25} />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSubmitted(false);
                                                setForm({ ...EMPTY, service: presetService });
                                                tsRef.current = Date.now();
                                            }}
                                            className="btn-outline"
                                        >
                                            Send another
                                        </button>
                                    </div>

                                    <p className="text-[15px] font-light text-navy-400 mt-10 pt-8 border-t border-navy/10">
                                        While you wait — the{" "}
                                        <Link to="/blog" className="text-ink underline decoration-gold underline-offset-4">
                                            journal
                                        </Link>{" "}
                                        covers how Orange County pricing, financing, and contracts actually work.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, y: 22 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.9, delay: 0.25, ease }}
                                >
                                    <span className="eyebrow text-navy-400 block mb-4">Six questions</span>
                                    <h2 className="font-display text-ink leading-[1.12] mb-4" style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.7rem)" }}>
                                        Request a consultation
                                    </h2>
                                    <p className="text-[16px] font-light leading-[1.8] text-navy-600 mb-12">
                                        Enough for {AGENT.firstName} to prepare properly before you speak — nothing more.
                                    </p>

                                    {apiError && (
                                        <div className="border-l-2 border-red-400 bg-red-50 px-5 py-4 mb-8">
                                            <p className="text-[14px] font-light text-red-700">{apiError}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} noValidate autoComplete="on" className="space-y-9">
                                        {/* Honeypots — invisible to people, irresistible to bots. */}
                                        <div className="absolute -left-[9999px]" aria-hidden="true">
                                            <input type="text" name="website" tabIndex={-1} value={form.website} onChange={set("website")} />
                                            <input type="text" name="fax" tabIndex={-1} value={form.fax} onChange={set("fax")} />
                                            <input type="text" name="company_url" tabIndex={-1} value={form.company_url} onChange={set("company_url")} />
                                        </div>

                                        <Field label="Full name" required error={errors.fullName}>
                                            <input
                                                type="text"
                                                name="name"
                                                autoComplete="name"
                                                value={form.fullName}
                                                onChange={set("fullName")}
                                                placeholder="Your name"
                                                className={cn("field", errors.fullName && "field-error")}
                                            />
                                        </Field>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-9">
                                            <Field label="Email" required error={errors.email}>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    autoComplete="email"
                                                    value={form.email}
                                                    onChange={set("email")}
                                                    placeholder="you@email.com"
                                                    className={cn("field", errors.email && "field-error")}
                                                />
                                            </Field>

                                            <Field
                                                label="Phone"
                                                required
                                                error={errors.phone}
                                                hint={
                                                    phoneDigits.length > 0 && phoneDigits.length < 10
                                                        ? `${phoneDigits.length} of 10 digits`
                                                        : undefined
                                                }
                                            >
                                                <input
                                                    type="tel"
                                                    name="tel"
                                                    autoComplete="tel"
                                                    value={form.phone}
                                                    onChange={set("phone")}
                                                    placeholder="(949) 555-0142"
                                                    className={cn("field", errors.phone && "field-error")}
                                                />
                                            </Field>
                                        </div>

                                        <Field label="How soon should Sam reach out?" required error={errors.urgency}>
                                            <Select
                                                value={form.urgency}
                                                onChange={set("urgency")}
                                                invalid={Boolean(errors.urgency)}
                                                placeholder="Choose a timeline"
                                                options={URGENCY_OPTIONS}
                                            />
                                        </Field>

                                        <Field label="Which market or area interests you?" required error={errors.market}>
                                            <Select
                                                value={form.market}
                                                onChange={set("market")}
                                                invalid={Boolean(errors.market)}
                                                placeholder="Choose an area"
                                                options={MARKET_OPTIONS}
                                            />
                                        </Field>

                                        <Field label="What can Sam help with?">
                                            <Select
                                                value={form.service}
                                                onChange={set("service")}
                                                placeholder="Optional — choose a service"
                                                options={SERVICES.map((s) => ({ value: s.value, label: s.name }))}
                                            />
                                        </Field>

                                        <button type="submit" disabled={submitting} className="btn-primary group w-full py-5 disabled:opacity-55 disabled:cursor-not-allowed">
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                                                    Sending
                                                </>
                                            ) : (
                                                <>
                                                    {PRIMARY_CTA.label}
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.25} />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* TCPA / SMS consent. Required wherever a phone number is collected. */}
                                    <p className="text-[11px] font-light leading-[1.75] text-navy-400 mt-8">
                                        By submitting this form you consent to receive calls, text messages
                                        (including via automated technology), and emails from {BRAND.name}
                                        {LICENSE.brokerage.confirmed ? ` / ${LICENSE.brokerage.name}` : ""} at the
                                        number and email provided, including for marketing purposes. Consent is
                                        not a condition of any purchase. Message and data rates may apply;
                                        message frequency varies. Reply STOP to opt out at any time.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ------------------------- Reassurance strip ------------------------- */}
            <section className="bg-cream texture-linen border-t border-navy/10">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                        {[
                            { title: "No obligation", body: "The consultation is a conversation. Nothing is signed and nothing is decided." },
                            { title: "One advisor", body: `The person you meet is the person who negotiates your contract — ${AGENT.firstName}, start to finish.` },
                            { title: "Straight answers", body: "Including when the honest answer is that this is not the right year to move." },
                        ].map((item, i) => (
                            <motion.div key={item.title} {...rise(0.06 * i)} className="border-t border-navy/15 pt-7">
                                <h3 className="font-display text-[1.5rem] text-ink leading-tight mb-3">{item.title}</h3>
                                <p className="text-[15px] font-light leading-[1.85] text-navy-600">{item.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
