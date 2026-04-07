/* eslint-disable */
/* global WebImporter */
/** Parser for hero-banner. Base: hero. Source: https://altus-c2n.pages.dev/ */
export default function parse(element, { document }) {
  // Hero block structure: Row 1 = background image, Row 2 = heading + text + CTA (single cell)
  // Source DOM: section.hero > .hero__bg (video+img), .hero__content (span.label, h1, p, a.btn)

  const cells = [];

  // Row 1: Background image
  const bgImage = element.querySelector('.hero__bg img, .hero__bg picture img');
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: All text content in a single cell wrapped in a div
  const contentWrapper = document.createElement('div');

  const label = element.querySelector('.hero__content .label');
  if (label) contentWrapper.append(label);

  const heading = element.querySelector('.hero__content h1, .hero__content h2');
  if (heading) contentWrapper.append(heading);

  const body = element.querySelector('.hero__content .hero__body, .hero__content p:not(.label)');
  if (body) contentWrapper.append(body);

  const cta = element.querySelector('.hero__content a.btn, .hero__content a[class*="btn"]');
  if (cta) contentWrapper.append(cta);

  if (contentWrapper.childNodes.length > 0) {
    cells.push([contentWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
