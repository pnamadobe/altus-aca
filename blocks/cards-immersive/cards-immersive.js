import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-immersive-card-image';
      } else {
        div.className = 'cards-immersive-card-body';
      }
    });

    // Check for video link in the image cell and convert to video element
    const imageCell = li.querySelector('.cards-immersive-card-image');
    if (imageCell) {
      const videoLink = imageCell.querySelector('a[href$=".mp4"], a[href$=".webm"]');
      if (videoLink) {
        const video = document.createElement('video');
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('loop', '');
        video.setAttribute('playsinline', '');
        video.muted = true;
        const source = document.createElement('source');
        source.src = videoLink.href;
        source.type = 'video/mp4';
        video.append(source);

        // Use picture as poster if present
        const pic = imageCell.querySelector('picture img');
        if (pic) video.poster = pic.src;

        imageCell.textContent = '';
        imageCell.append(video);
      }
    }

    // Wrap the whole card in a link if the body has a CTA link
    const body = li.querySelector('.cards-immersive-card-body');
    if (body) {
      const lastP = body.querySelector('p:last-of-type a');
      if (lastP) {
        li.dataset.href = lastP.href;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => { window.location.href = li.dataset.href; });
      }
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
