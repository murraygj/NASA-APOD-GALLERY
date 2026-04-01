// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// --- Constants ---
const API_KEY = 'GyTgn2sDbVGfOPSahDUhSS2RRYmyR9atIG9l5Wmg';
const BASE_URL = 'https://api.nasa.gov/planetary/apod';

// --- State ---
let galleryData = [];

// --- DOM References ---
const fetchBtn = document.getElementById('fetchBtn');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalCopyright = document.getElementById('modalCopyright');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.querySelector('.modal-close');

// --- Space Facts (Extra Credit) ---
const spaceFacts = [
  "A day on Venus is longer than its year — it takes 243 Earth days to rotate once.",
  "Neutron stars are so dense that a teaspoon would weigh about 6 billion tons.",
  "There are more stars in the universe than grains of sand on all of Earth's beaches.",
  "The Great Red Spot on Jupiter has been raging for at least 350 years.",
  "Space is completely silent — there's no medium for sound to travel through.",
  "The footprints on the Moon will remain for 100 million years.",
  "One million Earths could fit inside the Sun.",
  "A year on Mercury is just 88 Earth days.",
  "The Milky Way galaxy is moving through space at about 1.3 million miles per hour.",
  "There is a planet made largely of diamond — 55 Cancri e.",
  "The largest known star, UY Scuti, could fit nearly 5 billion of our Sun inside it.",
  "Olympus Mons on Mars is the tallest known mountain in the solar system at 72,000 feet."
];

function showRandomFact() {
  const factEl = document.getElementById('spaceFact');
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factEl.innerHTML = `<span class="fact-label">🌌 Did You Know?</span> <span class="fact-text">${fact}</span>`;
}
showRandomFact();

// --- API Fetch ---
async function fetchAPOD(startDate, endDate) {
  const url = `${BASE_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}

// --- Gallery Rendering ---
function renderGallery(items) {
  gallery.innerHTML = '';
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.dataset.index = index;

    let imgSrc = '';
    let isVideo = item.media_type === 'video';

    if (isVideo) {
      imgSrc = item.thumbnail_url || '';
    } else {
      imgSrc = item.url;
    }

    if (imgSrc) {
      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${imgSrc}" alt="${item.title}" loading="lazy">
          ${isVideo ? '<div class="play-overlay">&#9654;</div>' : ''}
        </div>
        <div class="card-info">
          <h3 class="card-title">${item.title}</h3>
          <p class="card-date">${item.date}</p>
        </div>`;
    } else {
      card.innerHTML = `
        <div class="card-image-wrapper card-video-placeholder">
          <div class="video-placeholder-content">
            <span class="play-icon-large">&#9654;</span>
            <span>Video</span>
          </div>
        </div>
        <div class="card-info">
          <h3 class="card-title">${item.title}</h3>
          <p class="card-date">${item.date}</p>
        </div>`;
    }

    card.addEventListener('click', () => openModal(index));
    gallery.appendChild(card);
  });
}

// --- Modal ---
function openModal(index) {
  const item = galleryData[index];
  if (!item) return;

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalCopyright.textContent = item.copyright ? `© ${item.copyright}` : '';

  modalExplanation.textContent = item.explanation;

  if (item.media_type === 'video') {
    const isYouTube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
    if (isYouTube) {
      modalMedia.innerHTML = `<iframe src="${item.url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="modal-video"></iframe>`;
    } else {
      modalMedia.innerHTML = `<video src="${item.url}" controls autoplay class="modal-video"></video>`;
    }
  } else {
    const src = item.hdurl || item.url;
    modalMedia.innerHTML = `<img src="${src}" alt="${item.title}" class="modal-image">`;
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalMedia.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// --- Fetch Button Handler ---
fetchBtn.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.innerHTML = '<div class="placeholder"><p>Please select both a start and end date.</p></div>';
    return;
  }

  gallery.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading space photos…</p></div>';

  try {
    galleryData = await fetchAPOD(startDate, endDate);
    renderGallery(galleryData);
  } catch (err) {
    gallery.innerHTML = `<div class="placeholder"><p>Error fetching images: ${err.message}</p></div>`;
  }
});
