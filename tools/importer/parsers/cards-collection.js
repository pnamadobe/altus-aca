/* eslint-disable */
/* global WebImporter */
/** Parser for cards-collection. Base: cards. Source: https://altus-c2n.pages.dev/ */
export default function parse(element, { document }) {
  // Cards block structure: Each row = [image | text content (heading + description + CTA)]
  // Source DOM: .product-lines__grid > article.line-tile, each with:
  //   .line-tile__bg img, .line-tile__content (.line-tile__tag, h3.line-tile__name, p.line-tile__desc, a.line-tile__cta)

  const cells = [];
  const tiles = element.querySelectorAll('article.line-tile, .line-tile');

  tiles.forEach((tile) => {
    // Column 1: Image
    const image = tile.querySelector('.line-tile__bg img');

    // Column 2: Text content
    const textWrapper = document.createElement('div');

    const tag = tile.querySelector('.line-tile__tag');
    if (tag) textWrapper.append(tag);

    const name = tile.querySelector('h3.line-tile__name, .line-tile__name');
    if (name) textWrapper.append(name);

    const desc = tile.querySelector('p.line-tile__desc, .line-tile__desc');
    if (desc) textWrapper.append(desc);

    const cta = tile.querySelector('a.line-tile__cta, .line-tile__cta');
    if (cta) textWrapper.append(cta);

    if (image && textWrapper.childNodes.length > 0) {
      cells.push([image, textWrapper]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-collection', cells });
  element.replaceWith(block);
}
