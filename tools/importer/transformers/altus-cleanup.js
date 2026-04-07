/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Altus C2N cleanup.
 * Selectors from captured DOM at https://altus-c2n.pages.dev/
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cart drawer overlay (can interfere with block parsing)
    // Found in captured HTML: <div class="cart-drawer" id="cart-drawer">
    WebImporter.DOMUtils.remove(element, ['#cart-drawer', '.cart-drawer']);
  }
  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome
    // Found in captured HTML: <nav class="nav nav--scrolled">
    // Found in captured HTML: <footer class="footer">
    WebImporter.DOMUtils.remove(element, [
      'nav.nav',
      'footer.footer',
      'noscript',
      'link',
    ]);
  }
}
