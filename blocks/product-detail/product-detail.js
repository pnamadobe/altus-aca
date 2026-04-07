/* global ALTUS_PRODUCTS */

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'summit-shell';
}

function buildGallery(product, document) {
  const gallery = document.createElement('div');
  gallery.className = 'pdp-gallery';

  const mainImg = document.createElement('div');
  mainImg.className = 'pdp-gallery-main';
  const img = document.createElement('img');
  img.src = `https://altus-c2n.pages.dev/${product.colors[0].image}`;
  img.alt = `${product.name} — ${product.colors[0].name}`;
  mainImg.append(img);
  gallery.append(mainImg);

  const thumbs = document.createElement('div');
  thumbs.className = 'pdp-gallery-thumbs';
  product.colors.forEach((color, idx) => {
    const thumb = document.createElement('img');
    thumb.src = `https://altus-c2n.pages.dev/${color.image}`;
    thumb.alt = color.name;
    thumb.className = idx === 0 ? 'pdp-thumb active' : 'pdp-thumb';
    thumb.addEventListener('click', () => {
      img.src = `https://altus-c2n.pages.dev/${color.image}`;
      img.alt = `${product.name} — ${color.name}`;
      thumbs.querySelectorAll('.pdp-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      // Also update color swatches
      const swatches = gallery.closest('.product-detail')?.querySelectorAll('.pdp-swatch');
      if (swatches) {
        swatches.forEach((s) => s.classList.remove('active'));
        swatches[idx]?.classList.add('active');
      }
      const colorLabel = gallery.closest('.product-detail')?.querySelector('.pdp-color-label');
      if (colorLabel) colorLabel.textContent = `Color — ${color.name}`;
    });
    thumbs.append(thumb);
  });
  gallery.append(thumbs);

  return gallery;
}

function buildInfo(product, document) {
  const info = document.createElement('div');
  info.className = 'pdp-info';

  // Badge
  const badge = document.createElement('span');
  badge.className = 'pdp-badge';
  badge.textContent = product.collectionLabel;
  info.append(badge);

  // Name
  const h1 = document.createElement('h1');
  h1.textContent = product.name;
  info.append(h1);

  // Price
  const price = document.createElement('p');
  price.className = 'pdp-price';
  price.textContent = product.price;
  info.append(price);

  // Tagline
  const tagline = document.createElement('p');
  tagline.className = 'pdp-tagline';
  tagline.textContent = product.tagline;
  info.append(tagline);

  // Color selector
  const colorLabel = document.createElement('p');
  colorLabel.className = 'pdp-color-label';
  colorLabel.textContent = `Color — ${product.colors[0].name}`;
  info.append(colorLabel);

  const swatches = document.createElement('div');
  swatches.className = 'pdp-swatches';
  product.colors.forEach((color, idx) => {
    const dot = document.createElement('button');
    dot.className = idx === 0 ? 'pdp-swatch active' : 'pdp-swatch';
    dot.style.backgroundColor = color.hex;
    dot.setAttribute('aria-label', color.name);
    dot.addEventListener('click', () => {
      // Click the corresponding thumbnail
      const thumbs = info.closest('.product-detail')?.querySelectorAll('.pdp-thumb');
      thumbs?.[idx]?.click();
    });
    swatches.append(dot);
  });
  info.append(swatches);

  // Size selector
  if (product.sizes && product.sizes.length > 0) {
    const sizeLabel = document.createElement('p');
    sizeLabel.className = 'pdp-size-label';
    sizeLabel.textContent = 'Size';
    info.append(sizeLabel);

    const sizeGrid = document.createElement('div');
    sizeGrid.className = 'pdp-size-grid';
    product.sizes.forEach((size) => {
      const btn = document.createElement('button');
      btn.className = 'pdp-size-btn';
      btn.textContent = size;
      btn.addEventListener('click', () => {
        sizeGrid.querySelectorAll('.pdp-size-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      sizeGrid.append(btn);
    });
    info.append(sizeGrid);
  }

  // Add to Bag
  const addBtn = document.createElement('button');
  addBtn.className = 'pdp-add-to-bag';
  addBtn.textContent = 'Add to Bag';
  info.append(addBtn);

  // Accordion
  if (product.details && product.details.length > 0) {
    const accordion = document.createElement('div');
    accordion.className = 'pdp-accordion';
    product.details.forEach((detail, idx) => {
      const item = document.createElement('div');
      item.className = 'pdp-accordion-item';
      if (idx === 0) item.classList.add('open');

      const btn = document.createElement('button');
      btn.className = 'pdp-accordion-btn';
      btn.textContent = detail.title;
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        accordion.querySelectorAll('.pdp-accordion-item').forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
      item.append(btn);

      const content = document.createElement('div');
      content.className = 'pdp-accordion-content';
      content.innerHTML = detail.html;
      item.append(content);

      accordion.append(item);
    });
    info.append(accordion);
  }

  return info;
}

function buildDesignedFor(product, document) {
  if (!product.designedFor) return null;
  const section = document.createElement('div');
  section.className = 'pdp-designed-for';

  const h2 = document.createElement('h2');
  h2.textContent = product.designedFor.headline;
  section.append(h2);

  const grid = document.createElement('div');
  grid.className = 'pdp-designed-for-grid';
  product.designedFor.cases.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'pdp-designed-for-card';
    const h4 = document.createElement('h4');
    h4.textContent = c.title;
    card.append(h4);
    const p = document.createElement('p');
    p.textContent = c.body;
    card.append(p);
    grid.append(card);
  });
  section.append(grid);

  return section;
}

function buildRelated(product, allProducts, document) {
  if (!product.related || product.related.length === 0) return null;
  const section = document.createElement('div');
  section.className = 'pdp-related';

  const h2 = document.createElement('h2');
  h2.textContent = product.relatedHeading || 'Complete the system.';
  section.append(h2);

  const grid = document.createElement('div');
  grid.className = 'pdp-related-grid';
  product.related.forEach((relId) => {
    const rel = allProducts[relId];
    if (!rel) return;
    const card = document.createElement('a');
    card.className = 'pdp-related-card';
    card.href = `/product?id=${relId}`;

    const imgWrap = document.createElement('div');
    imgWrap.className = 'pdp-related-img';
    const badge = document.createElement('span');
    badge.className = 'pdp-related-badge';
    badge.textContent = rel.collectionLabel;
    imgWrap.append(badge);
    const img = document.createElement('img');
    img.src = `https://altus-c2n.pages.dev/${rel.colors[0].image}`;
    img.alt = rel.name;
    imgWrap.append(img);
    card.append(imgWrap);

    const name = document.createElement('div');
    name.className = 'pdp-related-name';
    name.textContent = rel.name;
    card.append(name);

    const price = document.createElement('div');
    price.className = 'pdp-related-price';
    price.textContent = rel.price;
    card.append(price);

    grid.append(card);
  });
  section.append(grid);

  return section;
}

function buildEditorial(product, document) {
  if (!product.editorial) return null;
  const section = document.createElement('div');
  section.className = 'pdp-editorial';

  const label = document.createElement('p');
  label.className = 'pdp-editorial-label';
  label.textContent = product.editorial.label;
  section.append(label);

  const h2 = document.createElement('h2');
  h2.textContent = product.editorial.headline;
  section.append(h2);

  const body = document.createElement('p');
  body.textContent = product.editorial.body;
  section.append(body);

  const cta = document.createElement('a');
  cta.className = 'pdp-editorial-cta';
  cta.href = '/content/stories';
  cta.textContent = product.editorial.ctaText;
  section.append(cta);

  return section;
}

export default async function decorate(block) {
  const productId = getProductId();
  if (!productId) {
    block.textContent = 'Product not found.';
    return;
  }

  // Load product data
  await import(`${window.hlx.codeBasePath}/scripts/products.js`);
  // eslint-disable-next-line no-undef
  const products = window.ALTUS_PRODUCTS || ALTUS_PRODUCTS;
  const product = products[productId];

  if (!product) {
    block.textContent = 'Product not found.';
    return;
  }

  // Update page title
  document.title = `${product.name.toUpperCase()} — ALTUS`;

  block.textContent = '';

  // Product hero: gallery + info
  const hero = document.createElement('div');
  hero.className = 'pdp-hero';
  hero.append(buildGallery(product, document));
  hero.append(buildInfo(product, document));
  block.append(hero);

  // Designed for section
  const designedFor = buildDesignedFor(product, document);
  if (designedFor) block.append(designedFor);

  // Related products
  const related = buildRelated(product, products, document);
  if (related) block.append(related);

  // Editorial CTA
  const editorial = buildEditorial(product, document);
  if (editorial) block.append(editorial);
}
