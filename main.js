// Build dropdown, restore saved language (default: en)
buildDropdown();
const savedLang = localStorage.getItem('preferred-lang') || 'en';
applyLang(savedLang);

// Modal
const overlay   = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const dontShow  = document.getElementById('dontShowAgain');

if (localStorage.getItem('skip-modal') === 'true') {
  overlay.classList.add('hidden');
}

modalClose.addEventListener('click', () => {
  if (dontShow.checked) localStorage.setItem('skip-modal', 'true');
  overlay.classList.add('hidden');
});

// Close on backdrop click
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    if (dontShow.checked) localStorage.setItem('skip-modal', 'true');
    overlay.classList.add('hidden');
  }
});

// Dropdown toggle
const switcher = document.getElementById('langSwitcher');
const toggle   = document.getElementById('langToggle');

toggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = switcher.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', () => closeDropdown());
document.getElementById('langMenu').addEventListener('click', e => e.stopPropagation());

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    triggerReveal();
  });
});

// Typewriter on subtitle
const subtitle = document.querySelector('.subtitle');
const fullText = subtitle.textContent.trim();
subtitle.textContent = '';
let i = 0;
setTimeout(() => {
  const iv = setInterval(() => {
    subtitle.textContent += fullText[i++];
    if (i >= fullText.length) clearInterval(iv);
  }, 28);
}, 400);

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      e.target.dataset.revealed = 'true';
    }
  });
}, { threshold: 0.08 });

function triggerReveal() {
  document.querySelectorAll('.entry, .q-card').forEach(el => {
    if (!el.dataset.revealed) observer.observe(el);
  });
}

document.querySelectorAll('.entry, .q-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(14px)';
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s';
  observer.observe(el);
});

// Conway's Game of Life
(function initGoL() {
  const canvas = document.getElementById('golCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CELL = 5;
  let cols, rows, grid, nextGrid, rafId;
  let running = false;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols = Math.floor(canvas.width  / CELL);
    rows = Math.floor(canvas.height / CELL);
    grid = randomGrid();
    nextGrid = emptyGrid();
  }

  function emptyGrid() {
    return Array.from({ length: rows }, () => new Uint8Array(cols));
  }

  function randomGrid() {
    return Array.from({ length: rows }, () =>
      Uint8Array.from({ length: cols }, () => Math.random() < 0.3 ? 1 : 0)
    );
  }

  function step() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            n += grid[(r + dr + rows) % rows][(c + dc + cols) % cols];
          }
        const alive = grid[r][c];
        nextGrid[r][c] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
      }
    }
    [grid, nextGrid] = [nextGrid, grid];
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#7c6af7';
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (grid[r][c])
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 1, CELL - 1);
  }

  let frame = 0;
  function loop() {
    if (!running) return;
    if (frame++ % 4 === 0) { step(); draw(); }
    rafId = requestAnimationFrame(loop);
  }

  // Only run when the fragments tab is visible
  const fragTab   = document.querySelector('[data-tab="fragments"]');
  const fragSection = document.getElementById('fragments');

  function startGoL() {
    if (running) return;
    resize();
    running = true;
    loop();
  }

  function stopGoL() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  fragTab && fragTab.addEventListener('click', () => setTimeout(startGoL, 50));

  // If fragments tab is active on load, start immediately
  if (fragSection && fragSection.classList.contains('active')) startGoL();

  window.addEventListener('resize', () => { if (running) resize(); });
})();
