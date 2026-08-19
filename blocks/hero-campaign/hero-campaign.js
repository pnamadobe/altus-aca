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
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  if (window.self !== window.top) {
    // Positional label styling (first <p>) breaks under ProseMirror wrapping.
    const contentCol = block.querySelector(':scope > div:last-child > div');
    markForEditor(contentCol && contentCol.querySelector('p'), 'hero-campaign-eyebrow');
  }
}
