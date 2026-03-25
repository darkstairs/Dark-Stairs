const openCatalogBtn = document.getElementById('openCatalogBtn');
const homeSection = document.getElementById('home');
const catalogSection = document.getElementById('catalog');
const slideImage = document.getElementById('slideImage');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const catalogStage = document.querySelector('.catalog__stage');
const particlesCanvas = document.getElementById('catalogParticles');
const particlesCtx = particlesCanvas.getContext('2d');

const imageSets = {
  desktop: ['2', '3', '4', '5', '6', '7'],
  mobile: ['b', 'c', 'd', 'e', 'f']
};

const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
let usingMobileSet = mobileMediaQuery.matches;
let activeSet = usingMobileSet ? imageSets.mobile : imageSets.desktop;
let currentIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchDeltaX = 0;
let touchDeltaY = 0;
let isTouchTracking = false;
let isHorizontalSwipe = false;

function updateSlide(direction = 0) {
  const imageName = activeSet[currentIndex];
  slideImage.src = `./src/images/${imageName}.png`;
  slideImage.alt = `Imagem ${imageName.toUpperCase()}`;
  counter.textContent = `${currentIndex + 1} / ${activeSet.length}`;

  slideImage.classList.remove('slide-in-right', 'slide-in-left');
  void slideImage.offsetWidth;

  if (direction > 0) {
    slideImage.classList.add('slide-in-right');
  } else if (direction < 0) {
    slideImage.classList.add('slide-in-left');
  }
}

function goToNext() {
  currentIndex = (currentIndex + 1) % activeSet.length;
  updateSlide(1);
}

function goToPrev() {
  currentIndex = (currentIndex - 1 + activeSet.length) % activeSet.length;
  updateSlide(-1);
}

function switchSetForViewport() {
  const nextUsingMobile = mobileMediaQuery.matches;
  if (nextUsingMobile === usingMobileSet) return;

  const previousLength = activeSet.length;
  const previousIndex = currentIndex;

  usingMobileSet = nextUsingMobile;
  activeSet = usingMobileSet ? imageSets.mobile : imageSets.desktop;

  if (previousLength <= 1 || activeSet.length <= 1) {
    currentIndex = 0;
  } else {
    const ratio = previousIndex / (previousLength - 1);
    currentIndex = Math.round(ratio * (activeSet.length - 1));
  }

  updateSlide(0);
}

openCatalogBtn.addEventListener('click', () => {
  homeSection.classList.add('is-leaving');

  window.setTimeout(() => {
    homeSection.classList.add('is-hidden');
    catalogSection.classList.add('is-active');
  }, 560);
});

backBtn.addEventListener('click', () => {
  catalogSection.classList.remove('is-active');
  homeSection.classList.remove('is-hidden');

  requestAnimationFrame(() => {
    homeSection.classList.remove('is-leaving');
  });
});

prevBtn.addEventListener('click', goToPrev);
nextBtn.addEventListener('click', goToNext);

document.addEventListener('keydown', (event) => {
  if (!catalogSection.classList.contains('is-active')) return;
  if (event.key === 'ArrowLeft') goToPrev();
  if (event.key === 'ArrowRight') goToNext();
});

catalogStage.addEventListener('touchstart', (event) => {
  if (!catalogSection.classList.contains('is-active') || !mobileMediaQuery.matches || !event.touches.length) return;

  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  touchDeltaX = 0;
  touchDeltaY = 0;
  isHorizontalSwipe = false;
  isTouchTracking = true;
}, { passive: true });

catalogStage.addEventListener('touchmove', (event) => {
  if (!isTouchTracking || !mobileMediaQuery.matches || !event.touches.length) return;

  touchDeltaX = event.touches[0].clientX - touchStartX;
  touchDeltaY = event.touches[0].clientY - touchStartY;

  if (!isHorizontalSwipe) {
    const absX = Math.abs(touchDeltaX);
    const absY = Math.abs(touchDeltaY);

    if (absX < 8 && absY < 8) return;
    if (absX <= absY) return;

    isHorizontalSwipe = true;
  }

  event.preventDefault();
}, { passive: false });

catalogStage.addEventListener('touchend', () => {
  if (!isTouchTracking || !mobileMediaQuery.matches) return;

  isTouchTracking = false;

  if (!isHorizontalSwipe) return;

  const swipeThreshold = Math.min(95, Math.max(45, window.innerWidth * 0.12));

  if (Math.abs(touchDeltaX) < swipeThreshold) return;

  if (touchDeltaX < 0) {
    goToNext();
  } else {
    goToPrev();
  }
});

catalogStage.addEventListener('touchcancel', () => {
  isTouchTracking = false;
  isHorizontalSwipe = false;
});

if (typeof mobileMediaQuery.addEventListener === 'function') {
  mobileMediaQuery.addEventListener('change', switchSetForViewport);
} else if (typeof mobileMediaQuery.addListener === 'function') {
  mobileMediaQuery.addListener(switchSetForViewport);
}

const pointer = {
  x: -1000,
  y: -1000,
  radius: 130
};

const particles = [];

function getParticleCount() {
  const area = Math.max(1, particlesCanvas.width * particlesCanvas.height);
  return Math.min(90, Math.max(34, Math.floor(area / 24000)));
}

function resizeParticleCanvas() {
  const rect = catalogStage.getBoundingClientRect();
  particlesCanvas.width = Math.max(1, Math.floor(rect.width));
  particlesCanvas.height = Math.max(1, Math.floor(rect.height));
}

function createParticles() {
  particles.length = 0;
  const count = getParticleCount();

  for (let i = 0; i < count; i += 1) {
    const baseVx = (Math.random() - 0.5) * 0.42;
    const baseVy = (Math.random() - 0.5) * 0.42;

    particles.push({
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      size: Math.random() * 2.6 + 0.8,
      alpha: Math.random() * 0.45 + 0.3
    });
  }
}

function updateParticles() {
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

  particles.forEach((p) => {
    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0 && distance < pointer.radius) {
      const force = (pointer.radius - distance) / pointer.radius;
      p.vx += (dx / distance) * force * 0.13;
      p.vy += (dy / distance) * force * 0.13;
    }

    p.vx += (p.baseVx - p.vx) * 0.03;
    p.vy += (p.baseVy - p.vy) * 0.03;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -16) p.x = particlesCanvas.width + 16;
    if (p.x > particlesCanvas.width + 16) p.x = -16;
    if (p.y < -16) p.y = particlesCanvas.height + 16;
    if (p.y > particlesCanvas.height + 16) p.y = -16;

    particlesCtx.beginPath();
    particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    particlesCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    particlesCtx.fill();
  });

  requestAnimationFrame(updateParticles);
}

function movePointerWithEvent(clientX, clientY) {
  const rect = particlesCanvas.getBoundingClientRect();
  pointer.x = clientX - rect.left;
  pointer.y = clientY - rect.top;
}

catalogStage.addEventListener('mousemove', (event) => {
  movePointerWithEvent(event.clientX, event.clientY);
});

catalogStage.addEventListener('mouseleave', () => {
  pointer.x = -1000;
  pointer.y = -1000;
});

catalogStage.addEventListener('touchmove', (event) => {
  if (!event.touches.length) return;
  movePointerWithEvent(event.touches[0].clientX, event.touches[0].clientY);
}, { passive: true });

catalogStage.addEventListener('touchend', () => {
  pointer.x = -1000;
  pointer.y = -1000;
});

window.addEventListener('resize', () => {
  resizeParticleCanvas();
  createParticles();
});

resizeParticleCanvas();
createParticles();
updateParticles();

updateSlide();
