import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * True for an absolute external link to an image — an AEM Dynamic Media
 * delivery URL, a Scene7 `/is/image/...` URL, or any URL with an image
 * extension. EDS leaves these as plain anchors instead of <picture>, so the
 * block must render them as <img>. Relative links (e.g. a card's
 * "/collection-x" CTA) and video URLs are excluded.
 */
function isImageLink(a) {
  const authored = a.getAttribute('href') || '';
  if (!/^https?:/i.test(authored)) return false;
  let url;
  try {
    url = new URL(a.href);
  } catch {
    return false;
  }
  const { hostname, pathname } = url;
  if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(pathname)) return false;
  if (/\/play$|\/manifest\.(m3u8|mpd)$/i.test(pathname)) return false;
  return /\.(avif|jpe?g|png|webp|gif|svg)$/i.test(pathname)
    || /(^|\.)adobeaemcloud\.com$/i.test(hostname)
    || /(^|\.)scene7\.com$/i.test(hostname);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const imageLink = div.children.length === 1
        ? [...div.querySelectorAll('a')].find(isImageLink) : null;
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-collection-card-image';
      } else if (imageLink) {
        // DM/external image URL placed as a link — render it as an <img> with
        // the URL kept intact (do NOT run it through createOptimizedPicture,
        // which would append EDS params and break the delivery URL).
        const img = document.createElement('img');
        img.src = imageLink.href;
        const text = imageLink.textContent.trim();
        img.alt = text && !/^https?:/i.test(text) ? text : '';
        img.loading = 'lazy';
        div.replaceChildren(img);
        div.className = 'cards-collection-card-image';
      } else {
        div.className = 'cards-collection-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
