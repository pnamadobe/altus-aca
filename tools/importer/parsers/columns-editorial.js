/* eslint-disable */
/* global WebImporter */
/** Parser for columns-editorial. Base: columns. Source: https://altus-c2n.pages.dev/ */
export default function parse(element, { document }) {
  // Columns block structure: 1 row with 2 columns [image | text content]
  // Source DOM: section.editorial-feature > .editorial-feature__image (img),
  //   .editorial-feature__copy (.editorial-feature__copy-inner with span.label, h2, p.byline, p.body, a.text-cta)

  const cells = [];

  // Column 1: Image
  const image = element.querySelector('.editorial-feature__image img');

  // Column 2: Text content
  const textWrapper = document.createElement('div');

  const label = element.querySelector('.editorial-feature__copy .label');
  if (label) textWrapper.append(label);

  const heading = element.querySelector('.editorial-feature__copy h2, .editorial-feature__copy h1');
  if (heading) textWrapper.append(heading);

  const byline = element.querySelector('.editorial-feature__copy .editorial-feature__byline');
  if (byline) textWrapper.append(byline);

  const body = element.querySelector('.editorial-feature__copy .editorial-feature__body');
  if (body) textWrapper.append(body);

  const cta = element.querySelector('.editorial-feature__copy a.text-cta, .editorial-feature__copy a[class*="cta"]');
  if (cta) textWrapper.append(cta);

  if (image && textWrapper.childNodes.length > 0) {
    cells.push([image, textWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-editorial', cells });
  element.replaceWith(block);
}
