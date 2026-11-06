import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { Band, BandHead } from "./Section";
import { AGENT, AREA, HOME_FINDER, areaSearchUrl, homeSearchUrl } from "../config/site";
import { trackCtaClick } from "../lib/analytics";

/**
 * Every service area as a way into live listings.
 *
 * Each city opens Sam's own home search (HOME_FINDER) filtered to that
 * city, so an account or an inquiry made there reaches him. The photographed
 * cities get tiles; the rest of the county is a row of plain links, with the
 * whole county as the last one, and the open search closes the section for a
 * buyer who would rather search by ZIP, neighborhood, or school.
 */
export default function CitySearch({ source }: { source: string }) {
    const others = [...AREA.alsoServing, AREA.primary];

    return (
        <Band tone="navy" density="md">
            <BandHead
                tone="navy"
                layout="stacked"
                heading="Search homes by city."
                lede={`Live listings on ${AGENT.firstName}'s home search. Find one you like, and bring it to the consultation.`}
            >
                <ul className="grid grid-cols-2 gap-px bg-cream/14 lg:grid-cols-4">
                    {AREA.cities.map((city, i) => (
                        <Reveal
                            key={city.slug}
                            as="li"
                            variant="row"
                            index={i}
                            className="group relative aspect-[4/3] overflow-hidden bg-navy"
                        >
                            {city.photo && (
                                <img
                                    src={`/neighborhoods/tiles/${city.photo}.webp`}
                                    alt=""
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-[1400ms] ease-brand group-hover:scale-105 group-hover:opacity-90"
                                />
                            )}
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/55 to-navy/10"
                            />
                            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                                <span className="font-display text-d-item leading-tight text-cream">{city.name}</span>
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="mb-1 h-4 w-4 flex-shrink-0 text-gold-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                    strokeWidth={1.25}
                                />
                            </span>
                            <a
                                href={homeSearchUrl({ city: city.name })}
                                target="_blank"
                                rel="noopener"
                                onClick={() => trackCtaClick(`Search homes — ${city.name}`, source)}
                                aria-label={`Search homes for sale in ${city.name} (opens Sam's home search)`}
                                className="absolute inset-0 z-10"
                            />
                        </Reveal>
                    ))}
                </ul>

                <Reveal className="mt-10">
                    <h3 className="label text-cream/60">More of Orange County</h3>
                    <ul className="mt-5 flex flex-wrap gap-3">
                        {others.map((name) => (
                            <li key={name}>
                                <a
                                    href={areaSearchUrl(name)}
                                    target="_blank"
                                    rel="noopener"
                                    onClick={() => trackCtaClick(`Search homes — ${name}`, source)}
                                    className="inline-flex items-center gap-2 border border-cream/25 px-4 py-2.5 text-body-sm text-cream/90 transition-colors hover:border-gold hover:text-cream"
                                >
                                    {name === AREA.primary ? `All of ${name}` : name}
                                    <ArrowUpRight className="h-3.5 w-3.5 text-gold-300" strokeWidth={1.25} />
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-10 flex flex-col gap-5 border-t border-cream/14 pt-10 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-measure text-body-sm text-cream/75">
                            Prefer to search by ZIP, neighborhood, or school? Open the full search and save the homes
                            you like to a free account.
                        </p>
                        <a
                            href={HOME_FINDER}
                            target="_blank"
                            rel="noopener"
                            onClick={() => trackCtaClick("Search every listing", source)}
                            className="btn-cream group flex-shrink-0"
                        >
                            Search every listing
                            <ArrowUpRight
                                className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                strokeWidth={1.25}
                            />
                        </a>
                    </div>
                </Reveal>
            </BandHead>
        </Band>
    );
}
