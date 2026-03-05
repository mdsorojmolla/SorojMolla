/* =========================================================
   Soroj Molla — Glass Portfolio JS
   - Mobile menu (hamburger)
   - Smooth active nav highlight
   - Reveal animations on scroll
   - Animated skill progress bars on scroll
   - Projects modal (glass dialog)
   - Simple particles background (performance-friendly)
========================================================= */

/* ---------- Helpers ---------- */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Mobile menu ---------- */
const hamburger = $("#hamburger");
const mobileMenu = $("#mobileMenu");
const mobileClose = $("#mobileClose");
const menuBackdrop = $("#menuBackdrop");

function openMenu() {
  mobileMenu.classList.add("open");
  menuBackdrop.classList.add("show");
  hamburger.setAttribute("aria-expanded", "true");
  mobileMenu.setAttribute("aria-hidden", "false");

  // Focus first link for accessibility
  const firstLink = $(".mobile-link", mobileMenu);
  firstLink && firstLink.focus();
}

function closeMenu() {
  mobileMenu.classList.remove("open");
  menuBackdrop.classList.remove("show");
  hamburger.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  hamburger.focus();

}

hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.contains("open");
  isOpen ? closeMenu() : openMenu();
});

mobileClose.addEventListener("click", closeMenu);
menuBackdrop.addEventListener("click", closeMenu);

// Close mobile menu when clicking a menu item
$$(".mobile-link").forEach(link => {
  link.addEventListener("click", () => closeMenu());
});

// ESC closes mobile menu
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("open")) closeMenu();
});

/* ---------- Reveal on scroll ---------- */
const revealItems = $$(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

revealItems.forEach(el => revealObserver.observe(el));

/* ---------- Skill bars (animate on scroll) ---------- */
const bars = $$(".bar");
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const bar = entry.target;
    const val = Number(bar.dataset.progress || 0);
    bar.style.width = `${val}%`;
    barObserver.unobserve(bar);
  });
}, { threshold: 0.35 });

bars.forEach(bar => barObserver.observe(bar));

/* ---------- Active nav highlight while scrolling ---------- */
const sections = $$("main section[id]");
const navLinks = $$(".nav-link");
const mobileLinks = $$(".mobile-link");

function setActiveLink(id) {
  navLinks.forEach(a => {
    const isMatch = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("active", isMatch);
  });
  mobileLinks.forEach(a => {
    const isMatch = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("active", isMatch);
  });
}

const sectionObserver = new IntersectionObserver((entries) => {
  // pick the most visible section
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (visible) setActiveLink(visible.target.id);
}, { threshold: [0.25, 0.4, 0.55, 0.7] });

sections.forEach(sec => sectionObserver.observe(sec));

/* ---------- Projects Modal ---------- */
const modal = $("#projectModal");
const modalBackdrop = $("#modalBackdrop");
const modalClose = $("#modalClose");

const modalTitle = $("#modalTitle");
const modalDesc = $("#modalDesc");
const modalFull = $("#modalFull");
const modalTech = $("#modalTech");
const modalDemo = $("#modalDemo");
const modalGithub = $("#modalGithub");
const modalImage = $("#modalImage");

let lastFocusedEl = null;

function openProjectModal(card) {
  lastFocusedEl = document.activeElement;

  modalTitle.textContent = card.dataset.title || "Project";
  modalDesc.textContent = card.dataset.desc || "";
  modalFull.textContent = card.dataset.full || "";
  modalTech.textContent = card.dataset.tech || "";

  modalDemo.href = card.dataset.demo || "#";
  modalGithub.href = card.dataset.github || "#";

  const img = card.dataset.image || "";
  modalImage.src = img;
  modalImage.alt = `${modalTitle.textContent} preview`;

  modalBackdrop.classList.add("show");

  // Use <dialog> properly (with fallback)
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "true");
  }

  // Focus close button
  modalClose.focus();
}

function closeProjectModal() {
  modalBackdrop.classList.remove("show");

  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }

  // restore focus
  if (lastFocusedEl) lastFocusedEl.focus();
}

$$(".project-card").forEach(card => {
  card.addEventListener("click", () => openProjectModal(card));
  card.addEventListener("keydown", (e) => {
    // Make cards keyboard-usable
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProjectModal(card);
    }
  });
  // make focusable
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Open project: ${card.dataset.title || "project"}`);
});

modalClose.addEventListener("click", closeProjectModal);

// Clicking backdrop closes modal
modalBackdrop.addEventListener("click", closeProjectModal);

// ESC closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // only close if modal open
    const isOpen = modal.hasAttribute("open");
    if (isOpen) closeProjectModal();
  }
});

// Clicking outside the dialog content closes it (when click lands on dialog itself)
modal.addEventListener("click", (e) => {
  const rect = modal.getBoundingClientRect();
  const isInDialog =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  // If click happened on <dialog> backdrop area (some browsers), close.
  // In practice, our custom backdrop handles most cases.
  if (!isInDialog) closeProjectModal();
});

// If the dialog emits "cancel" (e.g., ESC), prevent default and close with our UI
modal.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeProjectModal();
});

/* ---------- Contact form ---------- */

const contactForm = document.querySelector("#contactForm");
const formNote = document.querySelector("#formNote");

const FORM_ENDPOINT = "https://formspree.io/f/mdawnyrb"; // your formspree link

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      formNote.textContent = "✅ Message sent successfully!";
      contactForm.reset();
    } else {
      formNote.textContent = "❌ Failed to send message.";
    }
  } catch (error) {
    formNote.textContent = "⚠️ Network error. Try again.";
  }

  setTimeout(() => {
    formNote.textContent = "";
  }, 4000);
});








/* ---------- Light Particles Background (Canvas) ---------- */
/*
  Minimal, subtle, performance-friendly particles.
  - Auto disables on small/low-end with prefers-reduced-motion
  - Also reduces particle count on mobile widths
*/
(function particles() {
  const canvas = $("#particles");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  let w, h, dpr;
  let particles = [];
  let mouse = { x: null, y: null };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function createParticles() {
    const isMobile = window.innerWidth < 780;
    const count = isMobile ? 34 : 56;

    particles = Array.from({ length: count }, () => {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 2.2 + 0.9) * dpr,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: (Math.random() - 0.5) * 0.35 * dpr,
        a: Math.random() * 0.55 + 0.18
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Soft glow dots
    for (const p of particles) {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < -50) p.x = w + 50;
      if (p.x > w + 50) p.x = -50;
      if (p.y < -50) p.y = h + 50;
      if (p.y > h + 50) p.y = -50;

      // Mouse interaction (gentle)
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 * dpr) {
          p.x += (dx / (dist || 1)) * 0.25 * dpr;
          p.y += (dy / (dist || 1)) * 0.25 * dpr;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

      // white-ish particles (no hard colors)
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }

    // Subtle lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = 150 * dpr;

        if (dist < max) {
          const alpha = (1 - dist / max) * 0.16;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX * dpr;
    mouse.y = e.clientY * dpr;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  draw();
})();

