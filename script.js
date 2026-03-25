const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const bulletsContainer = document.getElementById('bullets');
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let currentIndex = 0;

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
  currentIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === currentIndex);
  });

  renderBullets();
}

prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goToSlide(currentIndex - 1);
  if (event.key === 'ArrowRight') goToSlide(currentIndex + 1);
});

renderBullets();

const pointer = {
  x: -1000,
  y: -1000,
  radius: 120
};

const particleCount = 90;
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

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

resizeCanvas();
createParticles();
updateParticles();
