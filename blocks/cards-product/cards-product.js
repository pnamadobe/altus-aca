import { createOptimizedPicture } from '../../scripts/aem.js';

const COLORWAYS = [
  { name: 'Obsidian', color: '#1c1c1e', slug: 'obsidian' },
  { name: 'Glacier White', color: '#e8e5df', slug: 'glacier' },
  { name: 'Ember', color: '#c4622d', slug: 'ember' },
];

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

    // Move badge ("Summit") from body into image area as overlay
    const body = li.querySelector('.cards-product-card-body');
    const imageWrap = li.querySelector('.cards-product-card-image');
    if (body && imageWrap) {
      const firstP = body.querySelector('p:first-child');
      if (firstP && firstP.textContent.trim().toLowerCase() === 'summit') {
        const badge = document.createElement('span');
        badge.className = 'cards-product-badge';
        badge.textContent = firstP.textContent.trim();
        imageWrap.append(badge);
        firstP.remove();
      }
    }

    // Derive base URL pattern for colorway switching from the original img src
    const origImg = imageWrap?.querySelector('img');
    const origSrc = origImg?.getAttribute('src') || '';
    // Match e.g. ".../shell-obsidian.png" → base=".../", product="shell-", ext=".png"
    const srcMatch = origSrc.match(/^(.+\/)([a-z]+-)(obsidian|glacier|ember)\.(png|jpg|webp)$/i);

    // Add colorway swatches with click-to-swap
    if (body) {
      const swatchContainer = document.createElement('div');
      swatchContainer.className = 'cards-product-swatches';
      COLORWAYS.forEach((cw, idx) => {
        const dot = document.createElement('button');
        dot.className = idx === 0 ? 'cards-product-swatch active' : 'cards-product-swatch';
        dot.setAttribute('aria-label', cw.name);
        dot.style.backgroundColor = cw.color;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          // Update active state
          swatchContainer.querySelectorAll('.cards-product-swatch').forEach((s) => s.classList.remove('active'));
          dot.classList.add('active');
          // Swap image — find img fresh from the DOM (not stale reference)
          if (srcMatch) {
            const currentImg = li.querySelector('.cards-product-card-image img');
            if (currentImg) {
              const newSrc = `${srcMatch[1]}${srcMatch[2]}${cw.slug}.${srcMatch[4]}`;
              currentImg.src = newSrc;
              // Also update srcset on source elements
              const sources = li.querySelectorAll('.cards-product-card-image source');
              sources.forEach((source) => {
                const oldSrcset = source.getAttribute('srcset') || '';
                const newSrcset = oldSrcset.replace(/\/[a-z]+-(?:obsidian|glacier|ember)\./i, `/${srcMatch[2]}${cw.slug}.`);
                source.setAttribute('srcset', newSrcset);
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
