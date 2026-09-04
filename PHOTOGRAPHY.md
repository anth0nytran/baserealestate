# Photography

Every photograph on the site is a licensed stock photograph from
[Unsplash](https://unsplash.com), used under the
[Unsplash License](https://unsplash.com/license) — free for commercial use,
no attribution required. Credit is recorded here anyway, because knowing which
frame is which is what makes them replaceable.

The originals live in `assets/renders/photography/` and are **not** deployed —
see `.gitignore`. `npm run images:brand` derives everything in `/public` from
them.

## The rule that governs this list

A photograph captioned with a city must have been taken in that city. A
coastal frame shot in Newport is not "Dana Point" because it looks like it
could be. Cities without a verified photograph render a typographic tile
instead — that is a deliberate choice, not a gap waiting to be filled with the
nearest similar image.

This is why `AREA.cities` in `src/config/site.ts` carries `photo: null` for
Laguna Niguel, Costa Mesa, Irvine, and San Clemente.

## Neighbourhood photography

`assets/renders/photography/cities/` → `/neighborhoods/hero/` and
`/neighborhoods/tiles/`

| City | Photographer | Unsplash ID | What it shows |
| --- | --- | --- | --- |
| Newport Beach | Derek Liang | `5omxFzOMIJc` | Balboa Pier, the peninsula, and moored sailboats in the harbour |
| Laguna Beach | Jeffrey Eisen | `CGWykKN59bk` | Treasure Island cove, bluff-top resort, and the coastal hills |
| Dana Point | James Lee | `xAazjDc2JX4` | Dana Point Harbour marina, breakwater, and open water |
| Huntington Beach | — | `6vbOIvavPYU` | Huntington Beach Pier and surfers on a clear day |

## Property photography

`assets/renders/photography/services/` → `/public/services/`

| Slot | Used by | Unsplash ID | What it shows |
| --- | --- | --- | --- |
| `hero` | Knowledge Transfer; Services page hero | `EAfbC8J8CpM` | Salt Creek / Monarch Beach from the air, Dana Point |
| `aerial` | Real Estate Consulting | `T38QxgsDQOs` | Dana Point Harbour and headlands from the bluff |
| `buy` | Home Purchase | `Id7u0EkTjBE` | White modernist villa and pool in daylight |
| `sell` | Home Sale | `yQvGZRrnk30` | Bright white living room prepared for market |
| `cta` | Investor Assistance; homepage closing CTA | `ZvP3BACL8bg` | Ocean-view dining room in cream and tan |

## Editorial photography

`assets/renders/photography/editorial/` → `/public/editorial/`

Section imagery. These make no claim about location and must never be
captioned with a city name. See `EDITORIAL` in `src/config/site.ts`.

| Name | Unsplash ID | What it shows |
| --- | --- | --- |
| `entry` | `jaz2BueLsEc` | Entry hall in white oak and brass, opening to an ocean view |
| `living` | `zLMlEl0_vXI` | Bright living room in cream and sand tones |
| `kitchen` | `aoMmn5tDLLA` | White and gold marble island with brass stools |
| `facade` | `4ojhpgKpS68` | White modernist facade against a clear sky |
| `bluff` | `8GWLbgkCK48` | White coastal homes on a bluff above the Pacific |
| `terrace` | `b_79nOqf95I` | Glass-walled house opening onto a pool terrace |
| `water` | `q3ORuj5Pd1c` | Paddleboarders on deep navy water, from above |
| `coastline` | `ZvSDIln9yK0` | Coastline curving past a hillside town |

`facade`, `bluff`, `water`, and `coastline` are generated but not yet placed
in a section. They are a curated bench to draw from as pages grow. They add
about 2 MB to the deployed bundle and **nothing** to page weight, since a
browser never requests an image no page references — but that is a real 2 MB,
not free. If the bench stops earning its place, drop the names from
`EDITORIAL_PHOTOS` in the pipeline script and re-run it; the originals stay
put and adding one back is a one-line change.

## What was replaced, and why

The build inherited its entire image library from the Cuervo Homes template.
All of it is gone. Three separate reasons, any one of which was sufficient:

1. **A competitor's branding was in frame.** The `buy` photograph — used for
   Home Purchase, one of the five service cards — contained a lawn sign
   reading "CUERVO" with a SOLD rider. It was published on Sam's services page.
2. **They were AI-generated, and said so.** All five property renders carried
   a visible Gemini watermark in the lower-right corner. On a site whose entire
   competitive argument is sourcing and verifiability, generated imagery of
   houses that do not exist is the wrong material.
3. **Every frame was shot at dusk.** Sunset skies, blue hour, warm interior
   glow, in all thirteen images. The client's brief was explicit that the site
   should not be dark. The photography was quietly working against the
   palette the rest of the build was tuned to.

The retired originals are kept at `assets/renders/_retired-cuervo-ai/`
(untracked) rather than deleted, in case a frame needs to be referred back to.

## Replacing a photograph

1. Drop the new file into the matching `assets/renders/photography/` folder,
   named for the slug or slot it replaces. Any of `.jpg`, `.jpeg`, `.png`, or
   `.webp` works — the pipeline re-encodes regardless.
2. Run `npm run images:brand`.
3. If it is a new city, add it to `CITY_SLUGS` in
   `scripts/prepare-brand-assets.mjs` **and** set `photo` on that entry in
   `AREA.cities`. Both, or the tile and the hero rotation disagree.
4. Update the table above.

Hero frames are cropped to 16:9. If the automatic crop lands badly, add the
slug to `HERO_CROP` in the pipeline script — `focus` takes a fraction of the
source height to centre the crop band on, which is how the Dana Point frame
keeps its horizon.
