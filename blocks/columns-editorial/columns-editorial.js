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
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-editorial-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-editorial-img-col');
        }
      }
    });
  });

  if (window.self !== window.top) {
    // Label / byline / body are styled by sibling position (p:nth-child), which
    // ProseMirror wrapping breaks. Give each a stable div hook. Order within the
    // text column: [label, byline, body, cta]; the cta (a button) is left alone.
    block.querySelectorAll(':scope > div > div:not(.columns-editorial-img-col)').forEach((textCol) => {
      const paragraphs = [...textCol.children].filter((el) => el.tagName === 'P');
      markForEditor(paragraphs[0], 'columns-editorial-label');
      markForEditor(paragraphs[1], 'columns-editorial-byline');
      markForEditor(paragraphs[2], 'columns-editorial-body');
    });
  }
}
