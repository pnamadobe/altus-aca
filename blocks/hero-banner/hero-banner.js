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
    // The first row holds the background media. EDS only auto-converts
    // pipeline images into <picture>; external media URLs stay as plain
    // anchors — AEM Dynamic Media delivery URLs (with a ?preset query),
    // Scene7 `/is/image/...` URLs (no file extension), or plain CDN links.
    // Since this row is the media cell, treat any non-video link as the image.
    const imageLink = [...firstRow.querySelectorAll('a')]
      .find((a) => /^https?:/i.test(a.href) && !isVideoUrl(a.href));
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
