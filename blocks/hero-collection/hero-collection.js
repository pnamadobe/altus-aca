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

    const wrapper = firstRow.querySelector(':scope > div') || firstRow;
    wrapper.textContent = '';
    wrapper.append(video);
  } else if (!firstRow.querySelector('picture')) {
    block.classList.add('no-image');
  }
}
