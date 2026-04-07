/* eslint-disable */
/* global WebImporter */
/** Parser for hero-band. Base: hero. Source: https://altus-c2n.pages.dev/ */
export default function parse(element, { document }) {
  // Hero block structure: Row 1 = background image, Row 2 = heading + subtitle (single cell)
  // Source DOM: section.trail-band > .trail-band__bg (img), .trail-band__content (h2, p)

  const cells = [];

  // Row 1: Background image
  const bgImage = element.querySelector('.trail-band__bg img');
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Heading and subtitle in a single cell
  const contentWrapper = document.createElement('div');

  const heading = element.querySelector('.trail-band__content h2, .trail-band__content h1');
  if (heading) contentWrapper.append(heading);

  const subtitle = element.querySelector('.trail-band__content .trail-band__sub, .trail-band__content p');
  if (subtitle) contentWrapper.append(subtitle);

  if (contentWrapper.childNodes.length > 0) {
    cells.push([contentWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-band', cells });
  element.replaceWith(block);
}
