const slidesContainer = document.getElementById('slides');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const bulletsContainer = document.getElementById('bullets');
const canvas = document.getElementById('particles');
const slider = document.querySelector('.slider');
const ctx = canvas.getContext('2d');

const imageSets = {
  desktop: ['1', '2', '3', '4', '5', '6', '7'],
  mobile: ['a', 'b', 'c', 'd', 'e', 'f']
};

const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
let usingMobileSet = mobileMediaQuery.matches;
let slides = [];
let currentIndex = 0;

function isMobileViewport() {
  return mobileMediaQuery.matches;
}

function getCurrentImageSet() {
  return usingMobileSet ? imageSets.mobile : imageSets.desktop;
}

function buildSlides() {
  const imageNames = getCurrentImageSet();
  slidesContainer.innerHTML = '';

  imageNames.forEach((imageName, index) => {
    const section = document.createElement('section');
    section.className = `slide ${index === currentIndex ? 'is-active' : ''}`;
    section.setAttribute('aria-label', `Slide ${index + 1}`);

    const img = document.createElement('img');
    img.src = `./src/images/${imageName}.png`;
    img.alt = `Imagem ${imageName.toUpperCase()}`;
    img.loading = index === 0 ? 'eager' : 'lazy';

    section.appendChild(img);
    slidesContainer.appendChild(section);
  });

  slides = Array.from(document.querySelectorAll('.slide'));
}

function adaptIndexToNewSet(previousLength, previousIndex) {
  if (!previousLength || !slides.length) {
    currentIndex = 0;
    return;
  }

  if (previousLength === 1) {
    currentIndex = 0;
    return;
  }

  const ratio = previousIndex / (previousLength - 1);
  currentIndex = Math.round(ratio * (slides.length - 1));
}

function rebuildSlidesForViewport(force = false) {
  const nextUseMobileSet = isMobileViewport();

  if (!force && nextUseMobileSet === usingMobileSet) {
    return;
  }

  const previousLength = slides.length;
  const previousIndex = currentIndex;

  usingMobileSet = nextUseMobileSet;
  buildSlides();
  adaptIndexToNewSet(previousLength, previousIndex);
  goToSlide(currentIndex);
}

function renderBullets() {
  bulletsContainer.innerHTML = '';

  slides.forEach((_, index) => {
    const bullet = document.createElement('button');
    bullet.className = `bullet ${index === currentIndex ? 'is-active' : ''}`;
    bullet.type = 'button';
    bullet.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
    bullet.setAttribute('role', 'tab');
    bullet.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');

    bullet.addEventListener('click', () => {
      goToSlide(index);
    });

    bulletsContainer.appendChild(bullet);
  });
}

function goToSlide(index) {
  if (!slides.length) return;
  currentIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === currentIndex);
    slide.style.transform = '';
    slide.style.opacity = '';
    slide.style.transition = '';
  });

  renderBullets();
}

prevBtn.addEventListener('click', () => {
  if (slides.length > 1) goToSlide(currentIndex - 1);
});

nextBtn.addEventListener('click', () => {
  if (slides.length > 1) goToSlide(currentIndex + 1);
});

let touchStartX = 0;
let touchCurrentX = 0;
let touchRawDeltaX = 0;
let touchPreviewDeltaX = 0;
let isTouchDragging = false;
let swipeInProgress = false;
let previewTargetIndex = -1;

function getWrappedIndex(index) {
  if (!slides.length) return 0;
  return (index + slides.length) % slides.length;
}

function clearSlideInlineState() {
  slides.forEach((slide) => {
    slide.style.transition = '';
    slide.style.transform = '';
    slide.style.opacity = '';
  });
}

function applySwipeResistance(deltaX) {
  const sliderWidth = Math.max(slider.clientWidth, 1);
  const softLimit = Math.max(90, sliderWidth * 0.18);
  const absDelta = Math.abs(deltaX);

  if (absDelta <= softLimit) {
    return deltaX;
  }

  // Depois do limite, o deslocamento visual cresce mais devagar para dar efeito de resistência.
  const resistedDelta = softLimit + (absDelta - softLimit) * 0.35;
  return Math.sign(deltaX) * resistedDelta;
}

function updateTouchPreview(deltaX) {
  const direction = deltaX < 0 ? 1 : -1;
  const sliderWidth = Math.max(slider.clientWidth, 1);
  const activeSlide = slides[currentIndex];
  const targetIndex = getWrappedIndex(currentIndex + direction);
  const targetSlide = slides[targetIndex];

  previewTargetIndex = targetIndex;
  targetSlide.classList.add('is-active');

  activeSlide.style.transition = 'none';
  targetSlide.style.transition = 'none';
  activeSlide.style.opacity = '1';
  targetSlide.style.opacity = '1';
  activeSlide.style.transform = `translateX(${deltaX}px) scale(1)`;

  const startOffset = direction > 0 ? sliderWidth : -sliderWidth;
  targetSlide.style.transform = `translateX(${startOffset + deltaX}px) scale(1)`;
}

function finalizeSwipe(commitMove, direction, deltaX) {
  if (previewTargetIndex < 0) return;

  const sliderWidth = Math.max(slider.clientWidth, 1);
  const activeSlide = slides[currentIndex];
  const targetSlide = slides[previewTargetIndex];
  const activeFinalX = commitMove ? (direction > 0 ? -sliderWidth : sliderWidth) : 0;
  const targetStartX = direction > 0 ? sliderWidth + deltaX : -sliderWidth + deltaX;
  const targetFinalX = commitMove ? 0 : targetStartX;

  activeSlide.style.transition = 'transform 0.32s ease, opacity 0.32s ease';
  targetSlide.style.transition = 'transform 0.32s ease, opacity 0.32s ease';

  requestAnimationFrame(() => {
    activeSlide.style.transform = `translateX(${activeFinalX}px) scale(1)`;
    targetSlide.style.transform = `translateX(${targetFinalX}px) scale(1)`;
  });

  const finish = () => {
    if (commitMove) {
      currentIndex = previewTargetIndex;
    }

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === currentIndex);
    });

    clearSlideInlineState();
    renderBullets();
    previewTargetIndex = -1;
    swipeInProgress = false;
  };

  let didFinish = false;
  const safeFinish = () => {
    if (didFinish) return;
    didFinish = true;
    finish();
  };

  activeSlide.addEventListener('transitionend', safeFinish, { once: true });
  window.setTimeout(safeFinish, 380);
}

slider.addEventListener('touchstart', (event) => {
  if (!isMobileViewport() || slides.length < 2 || swipeInProgress || !event.touches.length) return;
  touchStartX = event.touches[0].clientX;
  touchCurrentX = touchStartX;
  touchRawDeltaX = 0;
  touchPreviewDeltaX = 0;
  isTouchDragging = true;
}, { passive: true });

slider.addEventListener('touchmove', (event) => {
  if (!isTouchDragging || slides.length < 2 || !isMobileViewport() || !event.touches.length) return;

  touchCurrentX = event.touches[0].clientX;
  touchRawDeltaX = touchCurrentX - touchStartX;
  if (Math.abs(touchRawDeltaX) < 5) return;

  touchPreviewDeltaX = applySwipeResistance(touchRawDeltaX);
  updateTouchPreview(touchPreviewDeltaX);
}, { passive: true });

slider.addEventListener('touchend', () => {
  if (!isTouchDragging || slides.length < 2 || !isMobileViewport() || swipeInProgress) return;

  const sliderWidth = Math.max(slider.clientWidth, 1);
  const threshold = Math.min(120, sliderWidth * 0.2);

  isTouchDragging = false;

  if (Math.abs(touchRawDeltaX) < 5) {
    previewTargetIndex = -1;
    clearSlideInlineState();
    return;
  }

  const direction = touchRawDeltaX < 0 ? 1 : -1;
  const commitMove = Math.abs(touchRawDeltaX) >= threshold;
  swipeInProgress = true;
  finalizeSwipe(commitMove, direction, touchPreviewDeltaX);
});

document.addEventListener('keydown', (event) => {
  if (slides.length < 2) return;
  if (event.key === 'ArrowLeft') goToSlide(currentIndex - 1);
  if (event.key === 'ArrowRight') goToSlide(currentIndex + 1);
});

rebuildSlidesForViewport(true);

if (typeof mobileMediaQuery.addEventListener === 'function') {
  mobileMediaQuery.addEventListener('change', () => {
    rebuildSlidesForViewport();
  });
} else if (typeof mobileMediaQuery.addListener === 'function') {
  mobileMediaQuery.addListener(() => {
    rebuildSlidesForViewport();
  });
}

const pointer = {
  x: -1000,
  y: -1000,
  radius: 120
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const particleCount = prefersReducedMotion ? 30 : Math.min(90, Math.max(45, Math.floor(window.innerWidth / 14)));
const particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles.length = 0;

  for (let i = 0; i < particleCount; i += 1) {
    const baseVx = (Math.random() - 0.5) * 0.5;
    const baseVy = (Math.random() - 0.5) * 0.5;

    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.25 + 0.2
    });
  }
}

function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0 && distance < pointer.radius) {
      const force = (pointer.radius - distance) / pointer.radius;
      p.vx += (dx / distance) * force * 0.08;
      p.vy += (dy / distance) * force * 0.08;
    }

    // Mantem movimento contínuo, puxando suavemente para a velocidade-base.
    p.vx += (p.baseVx - p.vx) * 0.02 + (Math.random() - 0.5) * 0.01;
    p.vy += (p.baseVy - p.vy) * 0.02 + (Math.random() - 0.5) * 0.01;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = canvas.width + 20;
    if (p.x > canvas.width + 20) p.x = -20;
    if (p.y < -20) p.y = canvas.height + 20;
    if (p.y > canvas.height + 20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(43, 140, 255, ${p.alpha})`;
    ctx.fill();
  });

  requestAnimationFrame(updateParticles);
}

canvas.addEventListener('mousemove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

canvas.addEventListener('mouseleave', () => {
  pointer.x = -1000;
  pointer.y = -1000;
});

canvas.addEventListener('touchmove', (event) => {
  if (!event.touches.length) return;
  pointer.x = event.touches[0].clientX;
  pointer.y = event.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', () => {
  pointer.x = -1000;
  pointer.y = -1000;
});

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

resizeCanvas();
createParticles();
updateParticles();
