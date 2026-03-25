const slideImage = document.getElementById('slideImage');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const imageSets = {
  desktop: ['1', '2', '3', '4', '5', '6', '7'],
  mobile: ['a', 'b', 'c', 'd', 'e', 'f']
};

const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
let activeSet = mobileMediaQuery.matches ? imageSets.mobile : imageSets.desktop;
let currentIndex = 0;

function updateSlide() {
  const imageName = activeSet[currentIndex];
  slideImage.src = `../src/images/${imageName}.png`;
  slideImage.alt = `Imagem ${imageName.toUpperCase()}`;
  counter.textContent = `${currentIndex + 1} / ${activeSet.length}`;
}

function goToNext() {
  currentIndex = (currentIndex + 1) % activeSet.length;
  updateSlide();
}

function goToPrev() {
  currentIndex = (currentIndex - 1 + activeSet.length) % activeSet.length;
  updateSlide();
}

function refreshSetByViewport() {
  activeSet = mobileMediaQuery.matches ? imageSets.mobile : imageSets.desktop;
  currentIndex = 0;
  updateSlide();
}

prevBtn.addEventListener('click', goToPrev);
nextBtn.addEventListener('click', goToNext);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goToPrev();
  if (event.key === 'ArrowRight') goToNext();
});

if (typeof mobileMediaQuery.addEventListener === 'function') {
  mobileMediaQuery.addEventListener('change', refreshSetByViewport);
} else if (typeof mobileMediaQuery.addListener === 'function') {
  mobileMediaQuery.addListener(refreshSetByViewport);
}

updateSlide();
