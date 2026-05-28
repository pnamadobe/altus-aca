/**
 * Returns true if the URL points to an image, ignoring any query string.
 * Handles AEM Dynamic Media delivery URLs such as
 * `.../iconoftheseas-wide.avif?preset=Responsive`.
 */
function isImageUrl(href) {
  try {
    const { pathname } = new URL(href, window.location.href);
    return /\.(avif|jpe?g|png|webp|gif|svg)$/i.test(pathname);
  } catch {
    return false;
  }
}

export default function decorate(block) {
  const firstRow = block.querySelector(':scope > div:first-child');
  if (!firstRow) return;

  // Check for a video link in the first row
  const videoLink = firstRow.querySelector('a[href$=".mp4"], a[href$=".webm"]');
  if (videoLink) {
    const video = document.createElement('video');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.muted = true;

    const source = document.createElement('source');
    source.src = videoLink.href;
    source.type = videoLink.href.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    video.append(source);

    // Use existing picture as poster fallback
    const pic = firstRow.querySelector('picture');
    const posterImg = pic ? pic.querySelector('img') : null;
    if (posterImg) {
      video.poster = posterImg.src;
    }

    // Replace content of first row with the video
    const wrapper = firstRow.querySelector(':scope > div') || firstRow;
    wrapper.textContent = '';
    wrapper.append(video);
  } else if (!firstRow.querySelector('picture')) {
    // EDS doesn't auto-convert absolute/external image URLs (e.g. an AEM
    // Dynamic Media delivery URL) into a <picture>; it leaves them as plain
    // anchors. Detect such an image link and render it as an <img>.
    const imageLink = [...firstRow.querySelectorAll('a')].find((a) => isImageUrl(a.href));
    if (imageLink) {
      const img = document.createElement('img');
      img.src = imageLink.href;
      img.alt = imageLink.getAttribute('title') || '';
      img.loading = 'eager';

      const wrapper = imageLink.closest('.hero-banner > div:first-child > div')
        || firstRow.querySelector(':scope > div')
        || firstRow;
      wrapper.textContent = '';
      wrapper.append(img);
    } else {
      block.classList.add('no-image');
    }
  }
}
