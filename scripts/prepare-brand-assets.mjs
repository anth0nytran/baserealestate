/**
 * Derives every image the site ships from the originals in /assets.
 *
 * Run with `npm run images:brand`. Idempotent — safe to re-run after better
 * source files arrive (notably the headshots, which came in at ~240x300 and
 * are the one asset upscaling cannot rescue).
 *
 * Nothing under /assets is deployed. Everything written to /public is.
 */
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(process.cwd(), "assets");
const RENDERS = path.join(SRC, "renders");
const BRAND = path.resolve(process.cwd(), "public/base");
const PUBLIC = path.resolve(process.cwd(), "public");

const NAVY = { r: 0x1b, g: 0x2a, b: 0x41 };
const CREAM = { r: 0xfa, g: 0xf7, b: 0xf0 };

const brandSrc = (name) => path.join(SRC, "base logo and branding", name);

/* Working sources cut from assets/full_logo.png by extractFullLogo(). */
const FULL_LOCKUP = "base_real_estate_group_lockup.png";
const FULL_LETTERS = "base_real_estate_group_letters.png";

/**
 * Cities with a licensed photograph of that actual place.
 *
 * Must stay in sync with the non-null `photo` entries in AREA.cities
 * (src/config/site.ts). A slug only belongs here once a real photograph of
 * that city exists — see the note on City.photo for why a stand-in is not an
 * acceptable substitute.
 */
const CITY_SLUGS = [
    "newport-beach",
    "laguna-beach",
    "dana-point",
    "laguna-niguel",
    "huntington-beach",
    "costa-mesa",
    "irvine",
    "san-clemente",
];

/** Base names of the property photography in assets/renders/photography/services. */
const PROPERTY_PHOTOS = ["hero", "buy", "sell", "cta", "aerial"];

/**
 * Interior and architectural detail shots used as section imagery.
 *
 * Keep in sync with EDITORIAL in src/config/site.ts.
 */
const EDITORIAL_PHOTOS = [
    "entry",
    "living",
    "kitchen",
    "facade",
    "bluff",
    "terrace",
    "water",
    "coastline",
];

const PHOTO_SRC = path.join(RENDERS, "photography");

/**
 * Resolves a source photograph regardless of the extension it arrived with.
 *
 * Stock originals come down as JPEG, earlier renders were PNG, and curated
 * exports were WebP. The pipeline does not care which — it re-encodes
 * everything — so it should not force the source to be renamed.
 */
const findSource = (dir, name) => {
    for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
        const candidate = path.join(dir, `${name}${ext}`);
        if (existsSync(candidate)) return candidate;
    }
    return null;
};

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)}MB`;

/* ==========================================================================
   Logotype
   ========================================================================== */

/**
 * Recolors a two-tone logo (navy letterforms + gold rule) by hue.
 *
 * A flat `tint()` would flatten the gold rule into the letter colour, so each
 * opaque pixel is classified instead: warm pixels keep the gold, everything
 * else becomes `ink`. Alpha is preserved untouched, which is what keeps the
 * hairline serifs from developing a fringe.
 */
async function recolorWordmark(srcFile, outFile, ink, { keepGold = true } = {}) {
    const { data, info } = await sharp(srcFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const isGold = (i) => data[i + 3] > 0 && data[i] > data[i + 2] + 25 && data[i] > 120;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        if (keepGold && isGold(i)) continue;
        data[i] = ink.r;
        data[i + 1] = ink.g;
        data[i + 2] = ink.b;
    }

    if (keepGold) extendRule(data, info.width, info.height, isGold);

    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(outFile);

    console.log(`  ${path.basename(outFile)}  ${info.width}x${info.height}`);
}

/**
 * Lifts the client's full lockup off its navy plate.
 *
 * assets/full_logo.png is the approved artwork — "BASE REAL ESTATE GROUP"
 * as one piece, cream lettering over a full-width gold rule — but it ships
 * flattened onto navy, with no alpha. Each pixel is unmixed against that
 * navy: warm pixels are rule, the rest are lettering, and alpha is how far
 * the pixel has travelled from the plate toward its ink. That keeps the
 * didone hairlines anti-aliased instead of cutting them out with a hard key.
 *
 * Writes the two working sources the rest of this script reads: the lockup
 * with its rule, and the lettering alone for the nav variants.
 */
async function extractFullLogo() {
    const GOLD = { r: 0xb0, g: 0x8d, b: 0x57 };
    const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const bgLum = lum(NAVY.r, NAVY.g, NAVY.b);
    const creamLum = lum(CREAM.r, CREAM.g, CREAM.b);
    const goldLum = lum(GOLD.r, GOLD.g, GOLD.b);

    const { data, info } = await sharp(path.join(SRC, "full_logo.png"))
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const n = info.width * info.height;
    const full = Buffer.alloc(n * 4);
    const letters = Buffer.alloc(n * 4);

    for (let i = 0, j = 0; i < n * 3; i += 3, j += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const lift = lum(r, g, b) - bgLum;
        if (lift <= 4) continue;
        // Warmth gained per unit of brightness: ~0.23 toward cream, ~1.2 toward gold.
        const gold = (r - b - (NAVY.r - NAVY.b)) / lift > 0.6;
        const a = Math.round(Math.min(1, lift / ((gold ? goldLum : creamLum) - bgLum)) * 255);
        const ink = gold ? GOLD : NAVY;
        full[j] = ink.r;
        full[j + 1] = ink.g;
        full[j + 2] = ink.b;
        full[j + 3] = a;
        if (!gold) {
            letters[j] = NAVY.r;
            letters[j + 1] = NAVY.g;
            letters[j + 2] = NAVY.b;
            letters[j + 3] = a;
        }
    }

    const raw = { raw: { width: info.width, height: info.height, channels: 4 } };
    await sharp(full, raw).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(brandSrc(FULL_LOCKUP));
    await sharp(letters, raw).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(brandSrc(FULL_LETTERS));
    console.log(`  ${FULL_LOCKUP}, ${FULL_LETTERS}  from full_logo.png ${info.width}x${info.height}`);
}

/**
 * Runs the gold rule the full width of the logotype.
 *
 * The supplied artwork stops the rule short at both ends (under the S through
 * the T); the client wants it under the whole word. The rule's own column at
 * its midpoint is copied outward to the first and last inked columns, which
 * keeps its anti-aliased top and bottom edges rather than drawing a hard bar.
 */
function extendRule(data, width, height, isGold) {
    const at = (x, y) => (y * width + x) * 4;
    let gx0 = width, gx1 = -1, gy0 = height, gy1 = -1, ix0 = width, ix1 = -1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = at(x, y);
            if (data[i + 3] === 0) continue;
            if (isGold(i)) {
                gx0 = Math.min(gx0, x); gx1 = Math.max(gx1, x);
                gy0 = Math.min(gy0, y); gy1 = Math.max(gy1, y);
            } else {
                ix0 = Math.min(ix0, x); ix1 = Math.max(ix1, x);
            }
        }
    }
    if (gx1 < 0 || ix1 < 0) return;

    const mid = Math.round((gx0 + gx1) / 2);
    for (let y = gy0; y <= gy1; y++) {
        const src = at(mid, y);
        for (let x = ix0; x <= ix1; x++) {
            const dst = at(x, y);
            if (data[dst + 3] >= data[src + 3]) continue;
            data[dst] = data[src];
            data[dst + 1] = data[src + 1];
            data[dst + 2] = data[src + 2];
            data[dst + 3] = data[src + 3];
        }
    }
}

/**
 * The responsible brokerage's mark, in both site inks.
 *
 * Sam is a salesperson under Nest Real Estate, and "Base Real Estate Group" on
 * its own reads like a brokerage — so the Nest mark sits beside his name
 * wherever the site identifies him. Source is Nest's official white artwork,
 * recolored by alpha so the origami crane's hairlines keep their edges.
 */
async function brokerageMark() {
    for (const [ink, name] of [
        [NAVY, "navy"],
        [CREAM, "cream"],
    ]) {
        const { data, info } = await sharp(brandSrc("nest_real_estate_white.png"))
            .trim()
            .resize({ width: 960 })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        for (let i = 0; i < data.length; i += 4) {
            data[i] = ink.r;
            data[i + 1] = ink.g;
            data[i + 2] = ink.b;
        }
        const out = path.join(BRAND, `nest-${name}.png`);
        await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
            .png({ compressionLevel: 9 })
            .toFile(out);
        console.log(`  ${path.basename(out)}  ${info.width}x${info.height}`);
    }
}

/**
 * Produces a nav-scale wordmark whose hairlines survive the downscale.
 *
 * The source wordmark is 3000px wide; the navigation renders it near 250px. A
 * didone's thin strokes are ~6px at source, which lands under one device pixel
 * after that reduction, and the letterforms go grey and washed out.
 *
 * So the mark is rebuilt from its alpha channel alone: the coverage mask is
 * blurred and then contrast-stretched, which optically thickens the thin
 * strokes without visibly fattening the thick ones, and the RGB is flat-filled
 * with the ink colour so no halo can pick up a stray source pixel. This is the
 * same trade an optical-size cut of a display face makes by hand.
 *
 * Built from the rule-less wordmark: the gold hairline under the logotype is a
 * single pixel at nav scale and only muddies the letterforms.
 */
async function navWordmark(srcFile, outFile, ink, width) {
    const src = sharp(srcFile).ensureAlpha();
    const { width: w, height: h } = await src.metadata();

    const alpha = await src.clone().extractChannel(3).blur(2.0).linear(2.4, -12).raw().toBuffer();

    const rgba = Buffer.alloc(w * h * 4);
    for (let i = 0, j = 0; i < w * h; i++, j += 4) {
        rgba[j] = ink.r;
        rgba[j + 1] = ink.g;
        rgba[j + 2] = ink.b;
        rgba[j + 3] = alpha[i];
    }

    await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
        .resize({ width, kernel: sharp.kernel.lanczos3 })
        .trim({ threshold: 1 })
        .png({ compressionLevel: 9 })
        .toFile(outFile);

    const meta = await sharp(outFile).metadata();
    console.log(`  ${path.basename(outFile)}  ${meta.width}x${meta.height}`);
}

/* ==========================================================================
   Photography
   ========================================================================== */

/** Square-crops toward the top of the frame so a portrait keeps its head. */
async function portrait(srcFile, base, size) {
    const pipeline = sharp(srcFile).resize(size, size, {
        fit: "cover",
        position: "top",
        kernel: sharp.kernel.lanczos3,
    });
    await pipeline.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(`${base}.jpg`);
    await pipeline.clone().webp({ quality: 90 }).toFile(`${base}.webp`);
    console.log(`  ${path.basename(base)}.{jpg,webp}  ${size}x${size}`);
}

/**
 * Rebuilds the rotating hero photography as a genuine responsive set.
 *
 * The inherited files were mis-generated: <slug>-1600.webp and
 * <slug>-2560.webp were byte-identical, so the srcset chose between two copies
 * of one image and the homepage hero — which auto-advances through eight
 * cities — shipped up to 1.2 MB per slide.
 *
 * The curated photographs live in assets/renders/, deliberately outside
 * public/: they used to sit under public/neighborhoods/ beside the derived
 * files, which put ~100 MB of source imagery into the production deploy.
 */
/**
 * Full-bleed 16:9 slides for the homepage hero rotation.
 *
 * Cropped to an explicit aspect rather than resized to a width, because the
 * sources are a mix of portrait and landscape frames. Resizing by width alone
 * let a portrait original become a 2560x3800 slide — several megabytes to
 * deliver a band the layout crops to 16:9 anyway.
 *
 * Cropping is per-slug, because the automatic strategies both fail here in
 * opposite ways. `attention` chases visual busyness — on the Dana Point
 * frame it picked a wall of moored hulls with no horizon, which reads as
 * clutter rather than a harbour. `centre` on the same portrait frame lands in
 * empty sky. So a slug may instead give `focus`, the fraction of the source
 * height the crop band should be centred on, and the band is extracted
 * explicitly before resizing.
 */
const HERO_CROP = {
    "newport-beach": { position: sharp.strategy.attention },
    // Horizon sits at ~0.62 in this frame; centring there keeps the
    // breakwater and open water above the marina.
    "dana-point": { focus: 0.72 },
    // A 2560x3840 portrait. A 16:9 band is only 0.375 of that height, so the
    // default centre lands on bare paving; 0.55 puts the wall along the top
    // of the band and keeps the sculpture whole.
    "costa-mesa": { focus: 0.55 },
};

/**
 * Crops `source` to `width`x`height`, honouring an explicit vertical focus.
 *
 * With `focus`, a full-width band of the target aspect is extracted around
 * that fraction of the source height (clamped to the image) and then resized.
 * Without it this is an ordinary cover resize.
 */
async function cropTo(source, width, height, crop = {}) {
    const pipeline = sharp(source);

    if (typeof crop.focus === "number") {
        const meta = await pipeline.metadata();
        const bandHeight = Math.min(meta.height, Math.round((meta.width * height) / width));
        const top = Math.max(0, Math.min(meta.height - bandHeight, Math.round(meta.height * crop.focus - bandHeight / 2)));
        pipeline.extract({ left: 0, top, width: meta.width, height: bandHeight });
    }

    return pipeline.resize(width, height, {
        fit: "cover",
        position: crop.position ?? "centre",
        kernel: sharp.kernel.lanczos3,
    });
}

async function heroPhotos() {
    const sourceDir = path.join(PHOTO_SRC, "cities");
    const outDir = path.join(PUBLIC, "neighborhoods/hero");
    await mkdir(outDir, { recursive: true });

    let total = 0;

    for (const slug of CITY_SLUGS) {
        const source = findSource(sourceDir, slug);
        if (!source) {
            console.warn(`  ${slug}: no photograph — skipped`);
            continue;
        }

        const sizes = [];
        for (const [width, height] of [
            [1600, 900],
            [2560, 1440],
        ]) {
            const out = path.join(outDir, `${slug}-${width}.webp`);
            const cropped = await cropTo(source, width, height, HERO_CROP[slug]);
            await cropped.webp({ quality: 78, effort: 5 }).toFile(out);
            const { size } = await stat(out);
            sizes.push(size);
            total += size;
        }

        console.log(`  ${slug.padEnd(20)} ${sizes.map(kb).join(" / ")}`);
    }

    console.log(`  hero total ${mb(total)}`);
}

/**
 * Tiles for the 4:5 neighbourhood grid cells.
 *
 * Same originals as the heroes — one photograph per city, cropped two ways —
 * so there is a single file to replace when better photography arrives.
 */
async function heroTiles() {
    const sourceDir = path.join(PHOTO_SRC, "cities");
    const outDir = path.join(PUBLIC, "neighborhoods/tiles");
    await mkdir(outDir, { recursive: true });

    let total = 0;
    for (const slug of CITY_SLUGS) {
        const source = findSource(sourceDir, slug);
        if (!source) continue;

        const out = path.join(outDir, `${slug}.webp`);
        await sharp(source)
            .resize(800, 1000, { fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
            .webp({ quality: 78, effort: 5 })
            .toFile(out);
        total += (await stat(out)).size;
    }
    console.log(`  tiles 800x1000, total ${mb(total)}`);
}

/**
 * Interior and architectural detail photography used as section imagery.
 *
 * Two widths, no fixed aspect: these are placed in varied slots (a tall
 * portrait cell, a wide band, a square detail) and each call site crops with
 * object-fit. Forcing an aspect here would crop twice.
 */
async function editorialPhotos() {
    const sourceDir = path.join(PHOTO_SRC, "editorial");
    const outDir = path.join(PUBLIC, "editorial");
    await mkdir(outDir, { recursive: true });

    let total = 0;
    for (const name of EDITORIAL_PHOTOS) {
        const source = findSource(sourceDir, name);
        if (!source) {
            console.warn(`  ${name}: no source photograph — skipped`);
            continue;
        }

        const sizes = [];
        for (const width of [1200, 2000]) {
            const out = path.join(outDir, `${name}-${width}.webp`);
            await sharp(source)
                .resize({ width, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
                .webp({ quality: 78, effort: 5 })
                .toFile(out);
            const { size } = await stat(out);
            sizes.push(size);
            total += size;
        }

        console.log(`  ${name.padEnd(20)} ${sizes.map(kb).join(" / ")}`);
    }
    console.log(`  editorial total ${mb(total)}`);
}

/**
 * Re-encodes the property photography as responsive WebP.
 *
 * The services page loads all five at once, so both widths are kept lean —
 * WebP at these display sizes costs a fraction of the originals with no
 * visible difference.
 */
async function propertyPhotos() {
    const sourceDir = path.join(PHOTO_SRC, "services");
    const outDir = path.join(PUBLIC, "services");
    await mkdir(outDir, { recursive: true });

    let total = 0;
    for (const name of PROPERTY_PHOTOS) {
        const source = findSource(sourceDir, name);
        if (!source) {
            console.warn(`  ${name}: no source photograph — skipped`);
            continue;
        }

        const sizes = [];
        for (const width of [1280, 2400]) {
            const out = path.join(outDir, `${name}-${width}.webp`);
            await sharp(source)
                .resize({ width, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
                .webp({ quality: 80, effort: 5 })
                .toFile(out);
            const { size } = await stat(out);
            sizes.push(size);
            total += size;
        }

        console.log(`  ${name.padEnd(20)} ${sizes.map(kb).join(" / ")}`);
    }
    console.log(`  property total ${mb(total)}`);
}

/**
 * Builds the 1200x630 social share card.
 *
 * Composited here rather than hand-designed so it stays in sync with the
 * wordmark: re-run this script after any logo change and the card follows.
 */
async function ogCard() {
    const W = 1200;
    const H = 630;
    const MARK_W = 720;

    const photo = await sharp(path.join(PUBLIC, "neighborhoods/hero/newport-beach-2560.webp"))
        .resize(W, H, { fit: "cover", position: "centre" })
        .toBuffer();

    // Navy veil, dark enough that the cream wordmark holds at thumbnail size.
    const veil = await sharp({
        create: { width: W, height: H, channels: 4, background: { ...NAVY, alpha: 0.82 } },
    })
        .png()
        .toBuffer();

    const mark = await sharp(path.join(BRAND, "wordmark-cream-nav-900.png"))
        .resize({ width: MARK_W, kernel: sharp.kernel.lanczos3 })
        .toBuffer();
    const markMeta = await sharp(mark).metadata();

    const rule = await sharp({
        create: { width: 120, height: 1, channels: 4, background: { r: 0xb0, g: 0x8d, b: 0x57, alpha: 1 } },
    })
        .png()
        .toBuffer();

    await mkdir(path.join(PUBLIC, "og"), { recursive: true });
    await sharp(photo)
        .composite([
            { input: veil, top: 0, left: 0 },
            { input: mark, top: Math.round(H / 2 - markMeta.height / 2 - 40), left: Math.round((W - MARK_W) / 2) },
            { input: rule, top: Math.round(H / 2 + 46), left: Math.round((W - 120) / 2) },
        ])
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(path.join(PUBLIC, "og/base-og.jpg"));

    console.log(`  og/base-og.jpg  ${W}x${H}`);
}

/* ========================================================================== */

async function main() {
    await mkdir(BRAND, { recursive: true });

    console.log("Full lockup");
    await extractFullLogo();

    console.log("Wordmarks");
    await recolorWordmark(brandSrc(FULL_LOCKUP), path.join(BRAND, "wordmark-navy.png"), NAVY);
    await recolorWordmark(brandSrc(FULL_LOCKUP), path.join(BRAND, "wordmark-cream.png"), CREAM);

    console.log("Nav wordmarks (optically corrected)");
    for (const [ink, name] of [
        [NAVY, "navy"],
        [CREAM, "cream"],
    ]) {
        for (const width of [600, 900]) {
            await navWordmark(
                brandSrc(FULL_LETTERS),
                path.join(BRAND, `wordmark-${name}-nav-${width}.png`),
                ink,
                width
            );
        }
    }

    console.log("Monogram");
    for (const [file, out] of [
        ["base_real_estate_icon_navy.png", "monogram-navy.png"],
        ["base_real_estate_icon_cream.png", "monogram-cream.png"],
    ]) {
        await sharp(brandSrc(file))
            .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(BRAND, out));
        console.log(`  ${out}  512x512`);
    }

    /*
     * Favicons are the navy disc — the circle logo — on a transparent square.
     *
     * The source names describe the disc, not the glyph: *_icon_navy is a navy
     * disc carrying a cream monogram. These were once cut from the cream disc
     * flattened onto cream, which showed the bare S with no circle; the client
     * wants the circle itself in the tab. The 16px size loses most of the
     * hairline S, which is the accepted cost of that.
     */
    console.log("Favicons");
    for (const [size, out] of [
        [16, "favicon-16x16.png"],
        [32, "favicon-32x32.png"],
        [180, "apple-touch-icon.png"],
        [192, "icon-192.png"],
        [512, "icon-512.png"],
    ]) {
        const icon = sharp(brandSrc("base_real_estate_icon_navy.png")).resize(size, size, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            kernel: sharp.kernel.lanczos3,
        });
        // iOS fills transparency on a home-screen icon with black, so that one size keeps a cream plate.
        if (out === "apple-touch-icon.png") icon.flatten({ background: "#faf7f0" });
        await icon
            .png()
            .toFile(path.join(PUBLIC, out));
        console.log(`  ${out}  ${size}x${size}`);
    }

    console.log("Brokerage mark");
    await brokerageMark();

    console.log("Social card");
    await ogCard();

    // `--logos` stops here: everything below reads assets/renders, which only
    // the design machine has.
    if (process.argv.includes("--logos")) return;

    console.log("Headshots");
    /*
     * Source frames are ~240x300. They are upscaled here because the layouts
     * need retina density at small render sizes, but no resampler invents
     * detail — replace assets/IMG_5509.jpeg with a real high-resolution file
     * and re-run this script when the client sends one.
     */
    await portrait(path.join(SRC, "IMG_5509.jpeg"), path.join(BRAND, "sam-portrait"), 720);
    await portrait(path.join(SRC, "DBC09B54-6E96-4647-B12B-1179A0BDA9ED.jpeg"), path.join(BRAND, "sam-office"), 720);
    await portrait(path.join(SRC, "IMG_5517.jpeg"), path.join(BRAND, "sam-outdoor"), 720);

    console.log("Neighbourhood photography");
    await heroPhotos();
    await heroTiles();

    console.log("Property photography");
    await propertyPhotos();

    console.log("Editorial photography");
    await editorialPhotos();

}

main().catch((error) => {
    console.error("[brand] FAILED:", error);
    process.exit(1);
});
