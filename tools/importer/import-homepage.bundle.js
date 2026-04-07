var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const cells = [];
    const bgImage = element.querySelector(".hero__bg img, .hero__bg picture img");
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentWrapper = document.createElement("div");
    const label = element.querySelector(".hero__content .label");
    if (label) contentWrapper.append(label);
    const heading = element.querySelector(".hero__content h1, .hero__content h2");
    if (heading) contentWrapper.append(heading);
    const body = element.querySelector(".hero__content .hero__body, .hero__content p:not(.label)");
    if (body) contentWrapper.append(body);
    const cta = element.querySelector('.hero__content a.btn, .hero__content a[class*="btn"]');
    if (cta) contentWrapper.append(cta);
    if (contentWrapper.childNodes.length > 0) {
      cells.push([contentWrapper]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-collection.js
  function parse2(element, { document }) {
    const cells = [];
    const tiles = element.querySelectorAll("article.line-tile, .line-tile");
    tiles.forEach((tile) => {
      const image = tile.querySelector(".line-tile__bg img");
      const textWrapper = document.createElement("div");
      const tag = tile.querySelector(".line-tile__tag");
      if (tag) textWrapper.append(tag);
      const name = tile.querySelector("h3.line-tile__name, .line-tile__name");
      if (name) textWrapper.append(name);
      const desc = tile.querySelector("p.line-tile__desc, .line-tile__desc");
      if (desc) textWrapper.append(desc);
      const cta = tile.querySelector("a.line-tile__cta, .line-tile__cta");
      if (cta) textWrapper.append(cta);
      if (image && textWrapper.childNodes.length > 0) {
        cells.push([image, textWrapper]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-collection", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse3(element, { document }) {
    const cells = [];
    const cards = element.querySelectorAll(".product-card");
    cards.forEach((card) => {
      const image = card.querySelector(".product-card__image-wrap img");
      const textWrapper = document.createElement("div");
      const badge = card.querySelector(".product-card__badge");
      if (badge) textWrapper.append(badge);
      const name = card.querySelector(".product-card__name");
      if (name) textWrapper.append(name);
      const price = card.querySelector(".product-card__price");
      if (price) textWrapper.append(price);
      if (image && textWrapper.childNodes.length > 0) {
        cells.push([image, textWrapper]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-editorial.js
  function parse4(element, { document }) {
    const cells = [];
    const image = element.querySelector(".editorial-feature__image img");
    const textWrapper = document.createElement("div");
    const label = element.querySelector(".editorial-feature__copy .label");
    if (label) textWrapper.append(label);
    const heading = element.querySelector(".editorial-feature__copy h2, .editorial-feature__copy h1");
    if (heading) textWrapper.append(heading);
    const byline = element.querySelector(".editorial-feature__copy .editorial-feature__byline");
    if (byline) textWrapper.append(byline);
    const body = element.querySelector(".editorial-feature__copy .editorial-feature__body");
    if (body) textWrapper.append(body);
    const cta = element.querySelector('.editorial-feature__copy a.text-cta, .editorial-feature__copy a[class*="cta"]');
    if (cta) textWrapper.append(cta);
    if (image && textWrapper.childNodes.length > 0) {
      cells.push([image, textWrapper]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-editorial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-campaign.js
  function parse5(element, { document }) {
    const cells = [];
    const bgImage = element.querySelector(".campaign-band__bg img");
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentWrapper = document.createElement("div");
    const label = element.querySelector(".campaign-band__content .label");
    if (label) contentWrapper.append(label);
    const heading = element.querySelector(".campaign-band__content h2, .campaign-band__content h1");
    if (heading) contentWrapper.append(heading);
    const cta = element.querySelector('.campaign-band__content a.btn, .campaign-band__content a[class*="btn"]');
    if (cta) contentWrapper.append(cta);
    if (contentWrapper.childNodes.length > 0) {
      cells.push([contentWrapper]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-campaign", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-band.js
  function parse6(element, { document }) {
    const cells = [];
    const bgImage = element.querySelector(".trail-band__bg img");
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentWrapper = document.createElement("div");
    const heading = element.querySelector(".trail-band__content h2, .trail-band__content h1");
    if (heading) contentWrapper.append(heading);
    const subtitle = element.querySelector(".trail-band__content .trail-band__sub, .trail-band__content p");
    if (subtitle) contentWrapper.append(subtitle);
    if (contentWrapper.childNodes.length > 0) {
      cells.push([contentWrapper]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-band", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/altus-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["#cart-drawer", ".cart-drawer"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "nav.nav",
        "footer.footer",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/altus-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      const document = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectorList) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadataBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadataBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-banner": parse,
    "cards-collection": parse2,
    "cards-product": parse3,
    "columns-editorial": parse4,
    "hero-campaign": parse5,
    "hero-band": parse6
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Homepage template for Altus C2N site",
    urls: ["https://altus-c2n.pages.dev/"],
    blocks: [
      { name: "hero-banner", instances: ["section.hero"] },
      { name: "cards-collection", instances: [".product-lines__grid"] },
      { name: "cards-product", instances: [".summit-grid__products"] },
      { name: "columns-editorial", instances: ["section.editorial-feature"] },
      { name: "hero-campaign", instances: ["section.campaign-band"] },
      { name: "hero-band", instances: ["section.trail-band"] }
    ],
    sections: [
      { id: "section-1", name: "Hero", selector: "section.hero", style: null, blocks: ["hero-banner"], defaultContent: [] },
      { id: "section-2", name: "Product Lines", selector: "section.product-lines", style: null, blocks: ["cards-collection"], defaultContent: [".product-lines__header"] },
      { id: "section-3", name: "Summit Product Grid", selector: "section.summit-grid", style: null, blocks: ["cards-product"], defaultContent: [".summit-grid__header"] },
      { id: "section-4", name: "Editorial Feature", selector: "section.editorial-feature", style: null, blocks: ["columns-editorial"], defaultContent: [] },
      { id: "section-5", name: "Campaign Band", selector: "section.campaign-band", style: null, blocks: ["hero-campaign"], defaultContent: [] },
      { id: "section-6", name: "Origin Drop", selector: "section.origin-drop", style: "dark", blocks: [], defaultContent: [".origin-drop__inner"] },
      { id: "section-7", name: "Trail Band", selector: "section.trail-band", style: null, blocks: ["hero-band"], defaultContent: [] },
      { id: "section-8", name: "Manifesto", selector: "section.manifesto", style: "dark", blocks: [], defaultContent: [".manifesto__text"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element
          });
        });
      });
    });
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
