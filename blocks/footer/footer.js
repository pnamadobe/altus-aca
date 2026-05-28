import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Groups a flat run of <h2> + <ul> pairs into per-column divs so the link grid
 * can lay them out as columns. DA authors the footer links as a flat list
 * (h2, ul, h2, ul, ...) with no wrapping div per column, so we build them here.
 * @param {Element} section The link-columns section
 */
function buildLinkColumns(section) {
  const firstHeading = section.querySelector('h2');
  if (!firstHeading) return;
  const container = firstHeading.parentElement;
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  let column = null;
  [...container.children].forEach((el) => {
    if (el.tagName === 'H2') {
      column = document.createElement('div');
      column.className = 'footer-column';
      columns.append(column);
    }
    if (column) column.append(el);
  });
  container.append(columns);
}

/**
 * Splits the bottom-bar paragraphs into a brand group (wordmark + tagline) and
 * a legal group (links + copyright). The split point is the first paragraph
 * that contains a link.
 * @param {Element} section The bottom-bar section
 */
function buildBottomBar(section) {
  const firstPara = section.querySelector('p');
  if (!firstPara) return;
  const container = firstPara.parentElement;
  const paras = [...container.children].filter((el) => el.tagName === 'P');
  if (!paras.length) return;
  const firstLink = paras.findIndex((p) => p.querySelector('a'));
  const brandCount = firstLink === -1 ? paras.length : firstLink;

  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  const brand = document.createElement('div');
  brand.className = 'footer-brand';
  const legal = document.createElement('div');
  legal.className = 'footer-legal';
  paras.forEach((p, i) => (i < brandCount ? brand : legal).append(p));
  bottom.append(brand, legal);
  container.append(bottom);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // DA authors flat content; rebuild the structure the CSS expects.
  const sections = footer.querySelectorAll(':scope > div');
  if (sections[0]) buildLinkColumns(sections[0]);
  if (sections[1]) buildBottomBar(sections[1]);

  block.append(footer);
}
