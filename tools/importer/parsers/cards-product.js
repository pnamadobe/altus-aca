/* eslint-disable */
/* global WebImporter */
/** Parser for cards-product. Base: cards. Source: https://altus-c2n.pages.dev/ */
export default function parse(element, { document }) {
  // Cards block structure: Each row = [image | text content (heading + description)]
  // Source DOM: .summit-grid__products > .product-card, each with:
  //   .product-card__image-wrap (.product-card__badge, img), .product-card__name, .product-card__price

  const cells = [];
  const cards = element.querySelectorAll('.product-card');

  cards.forEach((card) => {
    // Column 1: Product image
    const image = card.querySelector('.product-card__image-wrap img');

    // Column 2: Text content (name + price)
    const textWrapper = document.createElement('div');

    const badge = card.querySelector('.product-card__badge');
    if (badge) textWrapper.append(badge);

    const name = card.querySelector('.product-card__name');
    if (name) textWrapper.append(name);

    const price = card.querySelector('.product-card__price');
    if (price) textWrapper.append(price);

    if (image && textWrapper.childNodes.length > 0) {
      cells.push([image, textWrapper]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
