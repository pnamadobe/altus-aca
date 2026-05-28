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

/**
 * Finds the background-image link in a media row. The media cell only holds
 * media, so any non-video http(s) link is treated as the image — covers AEM
 * Dynamic Media delivery URLs, Scene7 `/is/image/...` URLs (no extension)
 * and plain CDN links.
 */
function findImageLink(row) {
  return [...row.querySelectorAll('a')]
    .find((a) => /^https?:/i.test(a.href) && !isVideoUrl(a.href));
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

    // Poster / fallback image: paints instantly and stays visible until the
    // video plays — and remains if autoplay is blocked or the video fails.
    // Accept an EDS <picture> or an external image link (Scene7 / DM delivery)
    // authored in the same media cell as the video.
    const posterImg = firstRow.querySelector('picture img');
    const posterLink = findImageLink(firstRow);
    if (posterImg) {
      video.poster = posterImg.src;
    } else if (posterLink) {
      video.poster = posterLink.href;
    }

    // Replace content of first row with the video
    const wrapper = firstRow.querySelector(':scope > div') || firstRow;
    wrapper.textContent = '';
    wrapper.append(video);
  } else if (!firstRow.querySelector('picture')) {
    // No video: render the external image link as the background <img>.
    // (EDS leaves external image URLs as plain anchors instead of <picture>.)
    const imageLink = findImageLink(firstRow);
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
