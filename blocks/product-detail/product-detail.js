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
  addBtn.addEventListener('click', () => {
    const selectedColor = info.querySelector('.pdp-swatch.active')?.getAttribute('aria-label') || product.colors[0].name;
    const selectedSize = info.querySelector('.pdp-size-btn.active')?.textContent || '';
    const colorImg = product.colors.find((c) => c.name === selectedColor);
    const productId = getProductId();
    // Add to cart
    if (window.AltusCart) {
      window.AltusCart.addToCart({
        id: productId,
        name: product.name,
        color: selectedColor,
        size: selectedSize,
        price: product.price,
        image: colorImg ? `https://altus-c2n.pages.dev/${colorImg.image}` : '',
      });
    }
    // eslint-disable-next-line no-use-before-define
    openCartDrawer(document);
  });
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

function closeDrawer() {
  const drawer = document.querySelector('.cart-drawer');
  const backdrop = document.querySelector('.cart-drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  setTimeout(() => { drawer?.remove(); backdrop?.remove(); }, 300);
}

function renderCartDrawer() {
  const doc = document;
  const cart = window.AltusCart ? window.AltusCart.getCart() : [];
  const totalCount = window.AltusCart ? window.AltusCart.getCartCount() : 0;
  const totalPrice = window.AltusCart ? window.AltusCart.getCartTotal() : 0;

  // Remove existing
  doc.querySelector('.cart-drawer')?.remove();
  doc.querySelector('.cart-drawer-backdrop')?.remove();

  const backdrop = doc.createElement('div');
  backdrop.className = 'cart-drawer-backdrop';
  backdrop.addEventListener('click', closeDrawer);

  const drawer = doc.createElement('div');
  drawer.className = 'cart-drawer';

  // Header
  const header = doc.createElement('div');
  header.className = 'cart-drawer-header';
  header.innerHTML = `<h3>YOUR BAG (${totalCount})</h3>`;
  const closeBtn = doc.createElement('button');
  closeBtn.className = 'cart-drawer-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeDrawer);
  header.append(closeBtn);
  drawer.append(header);

  // Items
  const itemsContainer = doc.createElement('div');
  itemsContainer.className = 'cart-drawer-items';

  if (cart.length === 0) {
    const empty = doc.createElement('p');
    empty.className = 'cart-drawer-empty';
    empty.textContent = 'Your bag is empty.';
    itemsContainer.append(empty);
  } else {
    cart.forEach((cartItem, idx) => {
      const item = doc.createElement('div');
      item.className = 'cart-drawer-item';

      const itemImg = doc.createElement('img');
      itemImg.src = cartItem.image;
      itemImg.alt = cartItem.name;
      item.append(itemImg);

      const itemInfo = doc.createElement('div');
      itemInfo.className = 'cart-drawer-item-info';

      const itemName = doc.createElement('div');
      itemName.className = 'cart-drawer-item-name';
      itemName.textContent = cartItem.name.toUpperCase();
      itemInfo.append(itemName);

      const itemVariant = doc.createElement('div');
      itemVariant.className = 'cart-drawer-item-variant';
      itemVariant.textContent = `${cartItem.color}${cartItem.size ? ` / ${cartItem.size}` : ''}`;
      itemInfo.append(itemVariant);

      const qtyWrap = doc.createElement('div');
      qtyWrap.className = 'cart-drawer-item-qty';
      const minusBtn = doc.createElement('button');
      minusBtn.className = 'cart-qty-btn';
      minusBtn.textContent = '−';
      minusBtn.addEventListener('click', () => {
        window.AltusCart.updateQty(idx, -1);
        renderCartDrawer();
        // Reopen immediately
        requestAnimationFrame(() => {
          doc.querySelector('.cart-drawer-backdrop')?.classList.add('open');
          doc.querySelector('.cart-drawer')?.classList.add('open');
        });
      });
      const qtyNum = doc.createElement('span');
      qtyNum.textContent = cartItem.qty;
      const plusBtn = doc.createElement('button');
      plusBtn.className = 'cart-qty-btn';
      plusBtn.textContent = '+';
      plusBtn.addEventListener('click', () => {
        window.AltusCart.updateQty(idx, 1);
        renderCartDrawer();
        requestAnimationFrame(() => {
          doc.querySelector('.cart-drawer-backdrop')?.classList.add('open');
          doc.querySelector('.cart-drawer')?.classList.add('open');
        });
      });
      qtyWrap.append(minusBtn, qtyNum, plusBtn);
      itemInfo.append(qtyWrap);
      item.append(itemInfo);

      const linePrice = parseFloat(cartItem.price.replace(/[$,]/g, '')) * cartItem.qty;
      const itemPrice = doc.createElement('div');
      itemPrice.className = 'cart-drawer-item-price';
      itemPrice.textContent = `$${linePrice.toLocaleString('en-US')}`;
      item.append(itemPrice);

      const removeBtn = doc.createElement('button');
      removeBtn.className = 'cart-drawer-item-remove';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        window.AltusCart.removeFromCart(idx);
        renderCartDrawer();
        requestAnimationFrame(() => {
          doc.querySelector('.cart-drawer-backdrop')?.classList.add('open');
          doc.querySelector('.cart-drawer')?.classList.add('open');
        });
      });
      item.append(removeBtn);

      itemsContainer.append(item);
    });
  }
  drawer.append(itemsContainer);

  // Footer
  const footer = doc.createElement('div');
  footer.className = 'cart-drawer-footer';
  footer.innerHTML = `
    <div class="cart-drawer-subtotal">
      <div><strong>Subtotal</strong><br><span class="cart-drawer-shipping">Shipping calculated at checkout.</span></div>
      <div class="cart-drawer-total">$${totalPrice.toLocaleString('en-US')}</div>
    </div>
    <button class="cart-drawer-checkout">Proceed to Checkout</button>
    <button class="cart-drawer-continue">Continue Shopping</button>
  `;
  footer.querySelector('.cart-drawer-checkout').addEventListener('click', () => {
    window.location.href = '/checkout';
  });
  footer.querySelector('.cart-drawer-continue').addEventListener('click', closeDrawer);
  drawer.append(footer);

  doc.body.append(backdrop);
  doc.body.append(drawer);

  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    drawer.classList.add('open');
  });
}

function openCartDrawer() {
  renderCartDrawer();
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
