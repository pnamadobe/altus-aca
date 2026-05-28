/**
 * Returns the pathname of a URL, ignoring any query string, or '' if invalid.
 * Lets us match file extensions on AEM Dynamic Media delivery URLs such as
 * `.../iconoftheseas-wide.avif?preset=Responsive`.
 */
function getPathname(href) {
  try {
    return new URL(href, window.location.href).pathname;
  } catch {
    return '';
  }
}

/** True if the URL points to a video, ignoring any query string. */
function isVideoUrl(href) {
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(getPathname(href));
}

/** True if the URL points to an image, ignoring any query string. */
function isImageUrl(href) {
  return /\.(avif|jpe?g|png|webp|gif|svg)$/i.test(getPathname(href));
}

export default function decorate(block) {
  const firstRow = block.querySelector(':scope > div:first-child');
  if (!firstRow) return;

  // Check for a video link in the first row. Match on the URL pathname so
  // Dynamic Media delivery URLs with a query string (e.g. `.../clip.mp4?...`)
  // are still recognised.
  const videoLink = [...firstRow.querySelectorAll('a')].find((a) => isVideoUrl(a.href));
  if (videoLink) {
    const video = document.createElement('video');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.muted = true;

    const source = document.createElement('source');
    source.src = videoLink.href;
    const isWebm = getPathname(videoLink.href).toLowerCase().endsWith('.webm');
    source.type = isWebm ? 'video/webm' : 'video/mp4';
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
