/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCollectionParser from './parsers/hero-collection.js';
import cardsProductParser from './parsers/cards-product.js';

// TRANSFORMER IMPORTS
import altusCleanupTransformer from './transformers/altus-cleanup.js';
import altusSectionsTransformer from './transformers/altus-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-collection': heroCollectionParser,
  'cards-product': cardsProductParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'collection-page',
  description: 'Product collection page with hero, product grid, and editorial content',
  urls: ['https://altus-c2n.pages.dev/collection-summit'],
  blocks: [
    { name: 'hero-collection', instances: ['section.collection-hero'] },
    { name: 'cards-product', instances: ['.collection-grid'] },
  ],
  sections: [
    { id: 'section-1', name: 'Collection Hero', selector: 'section.collection-hero', style: null, blocks: ['hero-collection'], defaultContent: [] },
    { id: 'section-2', name: 'Collection Grid', selector: 'section.collection-main', style: null, blocks: ['cards-product'], defaultContent: ['.collection-count'] },
    { id: 'section-3', name: 'Manifesto', selector: 'section.manifesto', style: 'dark', blocks: [], defaultContent: ['.manifesto__text'] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  altusCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [altusSectionsTransformer] : []),
];

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

    // 3. Execute afterTransform transformers
    executeTransformers('afterTransform', main, payload);

    // 4. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/collection-summit'
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
