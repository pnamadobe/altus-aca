export default async function decorate(block) {
  // Load cart module
  await import(`${window.hlx.codeBasePath}/scripts/cart.js`);
  const cart = window.AltusCart ? window.AltusCart.getCart() : [];
  const total = window.AltusCart ? window.AltusCart.getCartTotal() : 0;

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'checkout-layout';

  // LEFT COLUMN: Shipping form
  const formCol = document.createElement('div');
  formCol.className = 'checkout-form';

  formCol.innerHTML = `
    <h2>Shipping Information</h2>
    <div class="checkout-field-row">
      <div class="checkout-field">
        <label for="first-name">First Name</label>
        <input type="text" id="first-name" placeholder="First name" />
      </div>
      <div class="checkout-field">
        <label for="last-name">Last Name</label>
        <input type="text" id="last-name" placeholder="Last name" />
      </div>
    </div>
    <div class="checkout-field">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="your@email.com" />
    </div>
    <div class="checkout-field">
      <label for="address">Address</label>
      <input type="text" id="address" placeholder="Street address" />
    </div>
    <div class="checkout-field-row">
      <div class="checkout-field">
        <label for="city">City</label>
        <input type="text" id="city" placeholder="City" />
      </div>
      <div class="checkout-field">
        <label for="state">State / Province</label>
        <input type="text" id="state" placeholder="State" />
      </div>
    </div>
    <div class="checkout-field-row">
      <div class="checkout-field">
        <label for="zip">Zip / Postal Code</label>
        <input type="text" id="zip" placeholder="Zip code" />
      </div>
      <div class="checkout-field">
        <label for="country">Country</label>
        <select id="country">
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="AU">Australia</option>
          <option value="JP">Japan</option>
        </select>
      </div>
    </div>

    <h2>Payment</h2>
    <div class="checkout-field">
      <label for="card">Card Number</label>
      <input type="text" id="card" placeholder="1234 5678 9012 3456" />
    </div>
    <div class="checkout-field-row">
      <div class="checkout-field">
        <label for="expiry">Expiry</label>
        <input type="text" id="expiry" placeholder="MM / YY" />
      </div>
      <div class="checkout-field">
        <label for="cvv">CVV</label>
        <input type="text" id="cvv" placeholder="123" />
      </div>
    </div>
  `;
  wrapper.append(formCol);

  // RIGHT COLUMN: Order summary
  const summaryCol = document.createElement('div');
  summaryCol.className = 'checkout-summary';

  const summaryHeader = document.createElement('h2');
  summaryHeader.textContent = 'Order Summary';
  summaryCol.append(summaryHeader);

  if (cart.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'checkout-empty';
    empty.innerHTML = '<p>Your bag is empty.</p><p><a href="/collections">Browse Collections</a></p>';
    summaryCol.append(empty);
  } else {
    const items = document.createElement('div');
    items.className = 'checkout-items';

    cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'checkout-item';

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      row.append(img);

      const info = document.createElement('div');
      info.className = 'checkout-item-info';
      info.innerHTML = `
        <div class="checkout-item-name">${item.name.toUpperCase()}</div>
        <div class="checkout-item-variant">${item.color}${item.size ? ` / ${item.size}` : ''}</div>
        <div class="checkout-item-qty">Qty: ${item.qty}</div>
      `;
      row.append(info);

      const linePrice = parseFloat(item.price.replace(/[$,]/g, '')) * item.qty;
      const price = document.createElement('div');
      price.className = 'checkout-item-price';
      price.textContent = `$${linePrice.toLocaleString('en-US')}`;
      row.append(price);

      items.append(row);
    });
    summaryCol.append(items);

    const totals = document.createElement('div');
    totals.className = 'checkout-totals';
    totals.innerHTML = `
      <div class="checkout-totals-row">
        <span>Subtotal</span>
        <span>$${total.toLocaleString('en-US')}</span>
      </div>
      <div class="checkout-totals-row">
        <span>Shipping</span>
        <span>Calculated at next step</span>
      </div>
      <div class="checkout-totals-row checkout-totals-total">
        <span>Total</span>
        <span>$${total.toLocaleString('en-US')}</span>
      </div>
    `;
    summaryCol.append(totals);
  }

  const placeOrder = document.createElement('button');
  placeOrder.className = 'checkout-place-order';
  placeOrder.textContent = 'Place Order';
  placeOrder.addEventListener('click', () => {
    // eslint-disable-next-line no-alert
    alert('Thank you for your order! This is a demo — no payment was processed.');
    sessionStorage.removeItem('altus-cart');
    if (window.AltusCart) window.AltusCart.updateBagCounter();
    window.location.href = '/';
  });
  summaryCol.append(placeOrder);

  wrapper.append(summaryCol);
  block.append(wrapper);
}
