export default async function decorate(block) {
  await import(`${window.hlx.codeBasePath}/scripts/cart.js`);

  let order;
  try {
    order = JSON.parse(sessionStorage.getItem('altus-order'));
  } catch {
    order = null;
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'confirmation-content';

  // Checkmark icon
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 48 48');
  icon.setAttribute('class', 'confirmation-check');
  icon.innerHTML = '<circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 24l7 7 13-13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  wrapper.append(icon);

  // Heading
  const h1 = document.createElement('h1');
  h1.textContent = 'Thank you.';
  wrapper.append(h1);

  // Order number
  const orderNum = document.createElement('p');
  orderNum.className = 'confirmation-order-num';
  orderNum.textContent = order ? `Order ${order.orderNumber}` : 'Order confirmed';
  wrapper.append(orderNum);

  // Message
  const msg = document.createElement('p');
  msg.className = 'confirmation-message';
  msg.textContent = 'Your order has been placed. A confirmation email is on its way. We\'ll notify you when your items ship.';
  wrapper.append(msg);

  // Order items
  if (order && order.items && order.items.length > 0) {
    const itemsSection = document.createElement('div');
    itemsSection.className = 'confirmation-items';

    const itemsHeading = document.createElement('h3');
    itemsHeading.textContent = 'Items Ordered';
    itemsSection.append(itemsHeading);

    order.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'confirmation-item';

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      row.append(img);

      const info = document.createElement('div');
      info.className = 'confirmation-item-info';

      const name = document.createElement('div');
      name.className = 'confirmation-item-name';
      name.textContent = item.name.toUpperCase();
      info.append(name);

      const variant = document.createElement('div');
      variant.className = 'confirmation-item-variant';
      variant.textContent = `${item.color}${item.size ? ` / ${item.size}` : ''} — Qty: ${item.qty}`;
      info.append(variant);

      row.append(info);

      const linePrice = parseFloat(item.price.replace(/[$,]/g, '')) * item.qty;
      const price = document.createElement('div');
      price.className = 'confirmation-item-price';
      price.textContent = `$${linePrice.toLocaleString('en-US')}`;
      row.append(price);

      itemsSection.append(row);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'confirmation-total';
    totalRow.innerHTML = `<span>Total</span><span>$${order.total.toLocaleString('en-US')}</span>`;
    itemsSection.append(totalRow);

    wrapper.append(itemsSection);
  }

  // Continue shopping
  const cta = document.createElement('a');
  cta.className = 'confirmation-cta';
  cta.href = '/';
  cta.textContent = 'Continue Shopping';
  wrapper.append(cta);

  block.append(wrapper);

  // Clear order data and cart
  sessionStorage.removeItem('altus-order');
  sessionStorage.removeItem('altus-cart');
  if (window.AltusCart) window.AltusCart.updateBagCounter();
}
