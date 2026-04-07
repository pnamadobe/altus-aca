import { createOptimizedPicture } from '../../scripts/aem.js';

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
    { name: 'Obsidian', color: '#1c1c1e', slug: 'obsidian' },
    { name: 'Burgundy', color: '#6b2a3a', slug: 'burgundy' },
    { name: 'Glacier', color: '#e8e5df', slug: 'glacier' },
    { name: 'Olive', color: '#4a4a2a', slug: 'olive' },
    { name: 'Red', color: '#c43a2d', slug: 'red' },
  ],
};

// Build regex from all known colorway slugs
const ALL_SLUGS = [...new Set(Object.values(COLORWAY_SETS).flat().map((c) => c.slug))];
const SLUG_PATTERN = ALL_SLUGS.join('|');

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
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

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((imgEl) => {
    const optimizedPic = createOptimizedPicture(imgEl.src, imgEl.alt, false, [{ width: '750' }]);
    imgEl.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
