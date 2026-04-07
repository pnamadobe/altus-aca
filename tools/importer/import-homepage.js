/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsCollectionParser from './parsers/cards-collection.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsEditorialParser from './parsers/columns-editorial.js';
import heroCampaignParser from './parsers/hero-campaign.js';
import heroBandParser from './parsers/hero-band.js';

// TRANSFORMER IMPORTS
import altusCleanupTransformer from './transformers/altus-cleanup.js';
import altusSectionsTransformer from './transformers/altus-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-collection': cardsCollectionParser,
  'cards-product': cardsProductParser,
  'columns-editorial': columnsEditorialParser,
  'hero-campaign': heroCampaignParser,
  'hero-band': heroBandParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Homepage template for Altus C2N site',
  urls: ['https://altus-c2n.pages.dev/'],
  blocks: [
    { name: 'hero-banner', instances: ['section.hero'] },
    { name: 'cards-collection', instances: ['.product-lines__grid'] },
    { name: 'cards-product', instances: ['.summit-grid__products'] },
    { name: 'columns-editorial', instances: ['section.editorial-feature'] },
    { name: 'hero-campaign', instances: ['section.campaign-band'] },
    { name: 'hero-band', instances: ['section.trail-band'] },
  ],
  sections: [
    { id: 'section-1', name: 'Hero', selector: 'section.hero', style: null, blocks: ['hero-banner'], defaultContent: [] },
    { id: 'section-2', name: 'Product Lines', selector: 'section.product-lines', style: null, blocks: ['cards-collection'], defaultContent: ['.product-lines__header'] },
    { id: 'section-3', name: 'Summit Product Grid', selector: 'section.summit-grid', style: null, blocks: ['cards-product'], defaultContent: ['.summit-grid__header'] },
    { id: 'section-4', name: 'Editorial Feature', selector: 'section.editorial-feature', style: null, blocks: ['columns-editorial'], defaultContent: [] },
    { id: 'section-5', name: 'Campaign Band', selector: 'section.campaign-band', style: null, blocks: ['hero-campaign'], defaultContent: [] },
    { id: 'section-6', name: 'Origin Drop', selector: 'section.origin-drop', style: 'dark', blocks: [], defaultContent: ['.origin-drop__inner'] },
    { id: 'section-7', name: 'Trail Band', selector: 'section.trail-band', style: null, blocks: ['hero-band'], defaultContent: [] },
    { id: 'section-8', name: 'Manifesto', selector: 'section.manifesto', style: 'dark', blocks: [], defaultContent: ['.manifesto__text'] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  altusCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [altusSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
        });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find and parse blocks
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

    // 3. Execute afterTransform transformers (cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 4. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
