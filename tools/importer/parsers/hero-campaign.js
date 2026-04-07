/* eslint-disable */
/* global WebImporter */
/** Parser for hero-campaign. Base: hero. Source: https://altus-c2n.pages.dev/ */
export default function parse(element, { document }) {
  // Hero block structure: Row 1 = background image, Row 2 = heading + text + CTA (single cell)
  // Source DOM: section.campaign-band > .campaign-band__bg (img), .campaign-band__content (span.label, h2, a.btn)

  const cells = [];

  // Row 1: Background image
  const bgImage = element.querySelector('.campaign-band__bg img');
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: All text content in a single cell
  const contentWrapper = document.createElement('div');

  const label = element.querySelector('.campaign-band__content .label');
  if (label) contentWrapper.append(label);

  const heading = element.querySelector('.campaign-band__content h2, .campaign-band__content h1');
  if (heading) contentWrapper.append(heading);

  const cta = element.querySelector('.campaign-band__content a.btn, .campaign-band__content a[class*="btn"]');
  if (cta) contentWrapper.append(cta);

  if (contentWrapper.childNodes.length > 0) {
    cells.push([contentWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-campaign', cells });
  element.replaceWith(block);
}
