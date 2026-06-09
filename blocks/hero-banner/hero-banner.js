/**
 * Returns the pathname of a URL, ignoring any query string, or '' if invalid.
 */
function getPathname(href) {
  try {
    return new URL(href, window.location.href).pathname;
  } catch {
    return '';
  }
}

/**
 * True for an AEM Dynamic Media adaptive video: the `/play` HTML player URL or
 * an HLS/DASH manifest. These are streams (no direct file) and need HLS playback.
 */
function isAdaptiveVideoUrl(href) {
  return /\/play$|\/manifest\.m3u8$|\/manifest\.mpd$/i.test(getPathname(href));
}

/** True if the URL points to a video — a progressive file or a DM adaptive stream. */
function isVideoUrl(href) {
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(getPathname(href)) || isAdaptiveVideoUrl(href);
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

/**
 * Derives the HLS manifest URL from a DM `/play` (or `.mpd`) URL, preserving
 * any query string (e.g. delivery token).
 */
function toHlsManifest(href) {
  try {
    const url = new URL(href, window.location.href);
    if (/\/play$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/play$/i, '/manifest.m3u8');
    } else if (/\/manifest\.mpd$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/manifest\.mpd$/i, '/manifest.m3u8');
    }
    return url.href;
  } catch {
    return href;
  }
}

/** Warms the connection to an asset origin so the manifest/segments load sooner. */
function preconnect(href) {
  try {
    const { origin } = new URL(href, window.location.href);
    if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.append(link);
  } catch {
    // ignore invalid URLs
  }
}

// Lazily loads the vendored hls.js once, resolving to the global Hls constructor.
let hlsLibPromise;
function loadHlsLib() {
  if (window.Hls) return Promise.resolve(window.Hls);
  if (!hlsLibPromise) {
    hlsLibPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${window.hlx.codeBasePath}/blocks/hero-banner/hls.min.js`;
      script.onload = () => resolve(window.Hls);
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return hlsLibPromise;
}

/**
 * Plays an HLS stream in the given <video>: native HLS where supported
 * (Safari/iOS), otherwise via hls.js. Falls back to setting src directly.
 */
async function playHls(video, hlsUrl) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = hlsUrl;
    return;
  }
  try {
    const Hls = await loadHlsLib();
    if (Hls && Hls.isSupported()) {
      // startLevel:0 → fast first frame; ABR then climbs to the best rendition
      // the connection allows (no player-size cap, so 1080p is reachable).
      const hls = new Hls({ startLevel: 0 });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
    } else {
      video.src = hlsUrl;
    }
  } catch {
    video.src = hlsUrl;
  }
}

export default function decorate(block) {
  const firstRow = block.querySelector(':scope > div:first-child');
  if (!firstRow) return;

  // Match on the URL pathname so Dynamic Media URLs (query strings, `/play`
  // streams) are recognised, not just plain `.mp4` links.
  const videoLink = [...firstRow.querySelectorAll('a')].find((a) => isVideoUrl(a.href));
  if (videoLink) {
    const video = document.createElement('video');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.muted = true;

    if (isAdaptiveVideoUrl(videoLink.href)) {
      // DM video delivery only offers adaptive streaming, so play the HLS manifest.
      preconnect(videoLink.href);
      playHls(video, toHlsManifest(videoLink.href));
    } else {
      const source = document.createElement('source');
      source.src = videoLink.href;
      const isWebm = getPathname(videoLink.href).toLowerCase().endsWith('.webm');
      source.type = isWebm ? 'video/webm' : 'video/mp4';
      video.append(source);
    }

    // Poster / fallback image: paints instantly and stays visible until the
    // video plays — and remains if autoplay is blocked or the video fails.
    // Accept an EDS <picture> or an external image link authored in the same cell.
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
