/* eslint-disable */

/**
 * Simple client-side cart using sessionStorage.
 * Cart items: [{ id, name, color, size, price, image, qty }]
 */

const CART_KEY = 'altus-cart';

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateBagCounter();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(
    (i) => i.id === item.id && i.color === item.color && i.size === item.size,
  );
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  return cart;
}

function updateQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return cart;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  return cart;
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  return cart;
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[$,]/g, '')) || 0;
    return sum + price * item.qty;
  }, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function formatPrice(cents) {
  return `$${cents.toLocaleString('en-US')}`;
}

function updateBagCounter() {
  const count = getCartCount();
  // Only update the nav bag link — not any other element containing "Bag"
  const navTools = document.querySelector('.nav-tools');
  if (navTools) {
    const bagLink = navTools.querySelector('a');
    if (bagLink && bagLink.textContent.includes('Bag')) {
      bagLink.textContent = `Bag (${count})`;
    }
  }
}

// Initialize counter on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(updateBagCounter, 1000));
} else {
  setTimeout(updateBagCounter, 1000);
}

window.AltusCart = {
  getCart,
  addToCart,
  updateQty,
  removeFromCart,
  getCartTotal,
  getCartCount,
  formatPrice,
  updateBagCounter,
};
