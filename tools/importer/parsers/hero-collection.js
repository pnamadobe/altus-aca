/* eslint-disable */
/* global WebImporter */
/** Parser for hero-collection. Base: hero. Source: https://altus-c2n.pages.dev/collection-summit */
export default function parse(element, { document }) {
  // Hero collection: Row 1 = background image/video, Row 2 = heading + subtitle (single cell)
  // Source DOM: section.collection-hero > .collection-hero__bg (video+img), .collection-hero__content (h1, p)

  const cells = [];

  // Row 1: Background image (video poster)
  const bgImage = element.querySelector('.collection-hero__bg img, .collection-hero__bg picture img');
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Title and subtitle in a single cell
  const contentWrapper = document.createElement('div');

  const heading = element.querySelector('.collection-hero__content h1, .collection-hero__content h2');
  if (heading) contentWrapper.append(heading);

  const subtitle = element.querySelector('.collection-hero__content p, .collection-hero__sub');
  if (subtitle) contentWrapper.append(subtitle);

  if (contentWrapper.childNodes.length > 0) {
    cells.push([contentWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-collection', cells });
  element.replaceWith(block);
}
