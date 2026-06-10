# Altus (altus-aca) — Session Handoff

> Working notes for continuing in a fresh session. This repo is an **AEM Edge
> Delivery Services** site authored in **DA (Document Authoring)**
> (`fstab.yaml` → `content.da.live/pnamadobe/altus-aca`). Preview/live:
> `https://main--altus-aca--pnamadobe.aem.page/` · `…aem.live/`.
> DA org/site: `pnamadobe` / `altus-aca`. AEM Assets repo (DM):
> `author-p153659-e1614585.adobeaemcloud.com`; DM delivery host seen:
> `delivery-p153659-e1620914.adobeaemcloud.com`. Also `*.scene7.com`.

## What was done this session (all on `origin/main`)

Dynamic Media (DM) / external image + video support across blocks:

- **hero-banner** — renders DM/Scene7/extension-less image URLs as `<img>`;
  plays DM **video**: `/play` URLs are an HTML player, real stream is HLS
  (`…/manifest.m3u8`). Plays via native HLS (Safari) or **vendored hls.js**
  (`scripts/hls.min.js`, loaded lazily). Poster auto-derived from the DM frame
  (`…/as/poster.jpg?width=960`, PNG only — DM has no webp poster). Playback
  **pinned to highest rendition** so loops stay sharp. **100vh editor cap**:
  in an editor iframe (`window.self !== window.top`) the hero is capped at
  600px to avoid the auto-canvas feedback loop; live keeps full `100vh`.
- **cards-collection / cards-product** — detect an absolute external image link
  in the image cell and render as `<img>` (DM URL kept intact).
- **footer** — fixed flat DA-authored markup (h2+ul collapse / bottom bar) →
  rebuilt into `.footer-columns`/`.footer-column` + `.footer-bottom`.
- **GLOBAL external-image handling** (the important one):
  - `scripts/scripts.js` → `decorateExternalImages(main)` in `decorateMain`
    converts **autolinked** external image URLs (DM/Scene7) → `<picture>` before
    blocks decorate, so **every block + default content + fragments** render
    them. Bare autolinked URLs only (text === href); video URLs skipped.
  - `scripts/aem.js` → `createOptimizedPicture()` passes external (non-same-
    origin) URLs through untouched (it was rewriting them with `?width/format`).

Key commits (newest first): `868d970` global external images · `9091145`
cards-product DM · `ce54317` cards-collection DM · `bf433b2` hero-banner 100vh
editor cap · `6dbee15` video block balloon guard · `5b942f2`/`852d4be`/`c38f855`/
`c4ce745`/`83aa679` hero-banner DM video (HLS, quality, startup) · `5b9d5e6`
footer · `248fc6c`/`621524f`/`13d7415` hero-banner DM images.

## Known constraints / decisions

- **DA thumbnail vs DM URL is mutually exclusive** for images. Asset Selector +
  `aem.asset.dm.delivery=on` → DM URL as a link, no DA thumbnail. Content
  Advisor → `<img>` tag, but Media Bus re-ingests it → DM URL lost
  (becomes `./media_…`). No config gives both; reported to the DA team.
- **DM video** only offers adaptive HLS/DASH (no direct mp4). The standalone
  `video` block does NOT support HLS (only YouTube/Vimeo/mp4) — a DM `/play`
  URL there fails to load and (combined with 100vh-less layout) ballooned in
  UE; a CSS guard was added to that block. Use **hero-banner** for DM video, or
  port hero-banner's HLS into the `video` block (see follow-ups).
- DM **video poster** is PNG-only (webp/avif ignored); `width` is honored.

## NEXT TASK — make custom blocks editable in Universal Editor (UE)

Custom blocks (`hero-banner`, `cards-collection`, `cards-product`,
`cards-immersive`, and the other `hero-*` variants) show **"(no definition)"**
in UE: they're absent from `component-filters.json`'s `section` list and have no
model. (Also note: this is a DA-first repo; confirm the team actually wants UE
editing for these vs. DA-only.)

### Pipeline
Root `component-definition.json` / `component-models.json` /
`component-filters.json` are **built** from `ue/models/*` via
`npm run build:json` (merge-json-cli; see package.json). Edit the `ue/models/*`
sources, then rebuild. CI also builds (`.github/workflows/main.yaml`).

### Per-block steps (mirror `ue/models/blocks/video.json` as the template)
1. Author the block on a DA test page → open in UE → inspect the `/details`
   network call to see its DOM structure (per `ue/README.md`).
2. Create `ue/models/blocks/<block>.json` with:
   - `definitions`: component `{ id, model, plugins.da: { name, fields:
     [{name, selector}] } }` mapping DOM cells → fields.
   - `models`: editable fields — `text`/`richtext`/`reference` (media)/
     `aem-content` (links); use `classes` or `classes_<suffix>` for variants
     (e.g. hero-banner has no-image / dark options).
   - `filters`: only for container blocks that nest repeatable items.
3. Add the block id to the `section` components list in
   `ue/models/component-filters.json`. For cards-style blocks, add a child
   item component (e.g. `cards-collection-card`) and a matching filter, like the
   existing `cards` → `card` pattern.
4. `npm run build:json` → regenerate root JSONs → commit `ue/models/*` + roots.

### Instrumentation gotcha (critical for the cards blocks)
All cards blocks do `block.textContent = ''` then rebuild into `ul/li`, which
**destroys UE's `data-aue-*` instrumentation** → fields won't be editable.
Fix with `moveInstrumentation(from, to)` from `ue/scripts/ue-utils.js` when
moving/replacing elements, and/or extend the `MutationObserver` in
`ue/scripts/ue.js` (`setupObservers` currently handles only
`div.cards, div.carousel, div.accordion`). hero-banner doesn't rebuild as
heavily but still needs field instrumentation preserved.

### Suggested per-block field models
- **hero-banner**: background media (image or video URL — `reference`/`text`),
  label (text), heading (text/h1), paragraph (richtext), CTA (`aem-content` +
  text), variant `classes` select.
- **cards-collection / cards-product / cards-immersive**: container with a
  repeatable card item; card fields: image (`reference`), eyebrow/label, title,
  description, CTA. cards-product also has colorway swatches (currently derived
  from filename slug — see follow-up; not a UE field yet).

## Other open follow-ups
- **video block**: port hero-banner's HLS handling so DM `/play` plays there too
  (would also fully fix its UE growth). The vendored lib lives at
  `blocks/hero-banner/hls.min.js`; move it to `scripts/` to share across blocks
  and update hero-banner's loader path.
- **cards-product colorway swap**: only works for filename-slug images
  (`…-obsidian.png`), not DM URLs — needs a different mechanism (one DM URL per
  colorway, or DM smart-crop/variants).
- **alt text**: Content Advisor / DM-link images come in with empty `alt`
  (e.g. the Traverse card) — authors must set it via DA's Alt text control.
- **video.css** has a defensive guard added while mis-diagnosing the hero-banner
  growth — harmless, optional to revert.
- Same DM-image handling now covers all blocks globally; the per-block image-
  link branches in hero-banner/cards-collection/cards-product are a fallback for
  custom-text links and can stay.

## Verify changes
Hard-refresh `…aem.page` (edge caches block JS/CSS). Chrome MCP was unavailable
this session, so live rendering wasn't visually confirmed — worth a real check.
Lint: `npx eslint@8.57.0 …` needs `airbnb-base` installed (`npm i`); deps were
not installed this session. `node --check` was used for JS syntax;
`*.min.js` is in `.eslintignore`.
