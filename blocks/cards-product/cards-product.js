import { createOptimizedPicture } from '../../scripts/aem.js';
import { isAboveTheFold } from '../../scripts/scripts.js';

const COLORWAY_SETS = {
  summit: [
    { name: 'Obsidian', color: '#1c1c1e', slug: 'obsidian' },
    { name: 'Glacier White', color: '#e8e5df', slug: 'glacier' },
    { name: 'Ember', color: '#c4622d', slug: 'ember' },
  ],
  traverse: [
    { name: 'Dusk', color: '#8b7355', slug: 'dusk' },
    { name: 'Glacier White', color: '#e8e5df', slug: 'glacier' },
    { name: 'Pine', color: '#2d4a3a', slug: 'pine' },
    { name: 'Slate', color: '#8a8a8e', slug: 'slate' },
  ],
  studio: [
    { name: 'Obsidian', color: '#1c1c1e', slug: 'obsidian' },
    { name: 'Glacier', color: '#e8e5df', slug: 'glacier' },
    { name: 'Blush', color: '#c4a3a0', slug: 'blush' },
    { name: 'Navy', color: '#1c2b4a', slug: 'navy' },
  ],
  foundation: [
    { name: 'Obsidian', color: '#1c1c1e', slug: 'obsidian' },
    { name: 'Glacier White', color: '#e8e5df', slug: 'glacier' },
    { name: 'Slate', color: '#8a8a8e', slug: 'slate' },
    { name: 'Bone', color: '#e5ddd0', slug: 'bone' },
  ],
  origin: [
    { name: 'Glacier', color: '#e8e5df', slug: 'glacier' },
    { name: 'Burgundy', color: '#6b2a3a', slug: 'burgundy' },
    { name: 'Obsidian', color: '#1c1c1e', slug: 'obsidian' },
  ],
};

// Build regex from all known colorway slugs
const ALL_SLUGS = [...new Set(Object.values(COLORWAY_SETS).flat().map((c) => c.slug))];
const SLUG_PATTERN = ALL_SLUGS.join('|');

/**
 * True for an absolute external link to an image — an AEM Dynamic Media
 * delivery URL, a Scene7 `/is/image/...` URL, or any URL with an image
 * extension. EDS leaves these as plain anchors instead of <picture>, so the
 * block must render them as <img>. Relative links and video URLs are excluded.
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

/**
 * In the DA/Universal Editor canvas, ProseMirror wraps every editable text
 * element, breaking CSS that targets a text node by direct-child (`>`) or
 * position. Wrapping the element in a classed div gives CSS a stable hook that
 * survives. Editor-only, so the published DOM is untouched. Runs pre-ProseMirror.
 */
function markForEditor(el, className) {
  if (!el) return;
  const wrapper = document.createElement('div');
  wrapper.className = className;
  el.replaceWith(wrapper);
  wrapper.append(el);
}

export default function decorate(block) {
  const isEditor = window.self !== window.top;
  // Above/near the fold on the homepage — load these images eagerly so they
  // start downloading immediately instead of being deferred until scroll.
  const eager = isAboveTheFold(block);
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const imageLink = div.children.length === 1
        ? [...div.querySelectorAll('a')].find(isImageLink) : null;
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-product-card-image';
      } else if (imageLink) {
        // DM/external image URL placed as a link — render it as an <img> with
        // the URL kept intact (skip createOptimizedPicture, which would break
        // the delivery URL). Colorway swatches still render; src-swap is a
        // no-op for DM URLs since they don't match the slug pattern.
        const img = document.createElement('img');
        img.src = imageLink.href;
        const text = imageLink.textContent.trim();
        img.alt = text && !/^https?:/i.test(text) ? text : '';
        img.loading = eager ? 'eager' : 'lazy';
        div.replaceChildren(img);
        div.className = 'cards-product-card-image';
      } else {
        div.className = 'cards-product-card-body';
      }
    });

    // Move badge from body into image area as overlay and detect collection
    const body = li.querySelector('.cards-product-card-body');
    const imageWrap = li.querySelector('.cards-product-card-image');
    let collectionKey = 'summit'; // default

    if (body && imageWrap) {
      const firstP = body.querySelector('p:first-child');
      if (firstP) {
        const badgeText = firstP.textContent.trim();
        collectionKey = badgeText.toLowerCase();
        const badge = document.createElement('span');
        badge.className = 'cards-product-badge';
        badge.textContent = badgeText;
        imageWrap.append(badge);
        firstP.remove();
      }
    }

    const colorways = COLORWAY_SETS[collectionKey] || COLORWAY_SETS.summit;

    // Derive base URL pattern for colorway switching
    const origImg = imageWrap?.querySelector('img');
    const origSrc = origImg?.getAttribute('src') || '';
    const slugRegex = new RegExp(`^(.+/)(.+[-_])(${SLUG_PATTERN})\\.(png|jpg|webp)$`, 'i');
    const srcMatch = origSrc.match(slugRegex);

    // Add colorway swatches with click-to-swap
    const currentSlug = srcMatch ? srcMatch[3].toLowerCase() : '';
    if (body) {
      const swatchContainer = document.createElement('div');
      swatchContainer.className = 'cards-product-swatches';
      colorways.forEach((cw) => {
        const dot = document.createElement('button');
        dot.className = cw.slug === currentSlug ? 'cards-product-swatch active' : 'cards-product-swatch';
        dot.setAttribute('aria-label', cw.name);
        dot.style.backgroundColor = cw.color;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          swatchContainer.querySelectorAll('.cards-product-swatch').forEach((s) => s.classList.remove('active'));
          dot.classList.add('active');
          if (srcMatch) {
            const currentImg = li.querySelector('.cards-product-card-image img');
            if (currentImg) {
              const newSrc = `${srcMatch[1]}${srcMatch[2]}${cw.slug}.${srcMatch[4]}`;
              currentImg.src = newSrc;
              const replaceRegex = new RegExp(`/${srcMatch[2]}(?:${SLUG_PATTERN})\\.`, 'i');
              li.querySelectorAll('.cards-product-card-image source').forEach((source) => {
                const oldSrcset = source.getAttribute('srcset') || '';
                source.setAttribute('srcset', oldSrcset.replace(replaceRegex, `/${srcMatch[2]}${cw.slug}.`));
              });
            }
          }
        });
        swatchContainer.append(dot);
      });
      body.append(swatchContainer);
    }

    // Make card clickable — derive product slug from name
    if (body) {
      const nameP = body.querySelector('p:first-child');
      if (nameP) {
        const productName = nameP.textContent.trim();
        const slug = productName.toLowerCase().replace(/\s+/g, '-');
        li.dataset.href = `/product?id=${slug}`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', (e) => {
          if (e.target.closest('.cards-product-swatch')) return;
          window.location.href = li.dataset.href;
        });
      }
    }

    // Detect locked/mystery cards — no image in the image cell
    const hasImage = imageWrap?.querySelector('picture, img');
    if (!hasImage && imageWrap) {
      li.classList.add('cards-product-locked');
      imageWrap.textContent = '';
      const lockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      lockSvg.setAttribute('viewBox', '0 0 24 30');
      lockSvg.setAttribute('class', 'cards-product-lock-icon');
      lockSvg.innerHTML = '<rect x="2" y="14" width="20" height="14" rx="2"/><path d="M7 14V9a5 5 0 0 1 10 0v5"/>';
      imageWrap.append(lockSvg);
    }

    if (isEditor && body) {
      // Name (first <p>) and price (second <p>) are styled by sibling position,
      // which ProseMirror wrapping breaks — hook them with stable divs. Done last
      // so the earlier position-based queries (badge, swatches) run on clean DOM.
      const paragraphs = [...body.children].filter((el) => el.tagName === 'P');
      markForEditor(paragraphs[0], 'cards-product-name');
      markForEditor(paragraphs[1], 'cards-product-price');
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((imgEl) => {
    const optimizedPic = createOptimizedPicture(imgEl.src, imgEl.alt, eager, [{ width: '750' }]);
    imgEl.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
