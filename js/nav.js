'use strict';

/* ==========================================================================
   VELORA KITCHEN — NAVIGATION
   Mobile menu toggle. Shared across all pages.
   ========================================================================== */

const IS_DEV = false;

const devWarn = (...args) => {
  if (IS_DEV) console.warn(...args);
};

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initNavToggle = () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (!toggle || !links) {
    devWarn('[nav] toggle or links element not found on this page.');
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('nav-links--open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.classList.toggle('nav-toggle--active', isOpen);
  });

  // Close the mobile menu when a link is chosen.
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('nav-links--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('nav-toggle--active');
    });
  });

  // Close on Escape for keyboard users.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && links.classList.contains('nav-links--open')) {
      links.classList.remove('nav-links--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('nav-toggle--active');
      toggle.focus();
    }
  });
};

const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
};

const initHeaderShadowOnScroll = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle('site-header--scrolled', window.scrollY > 12);
  };

  window.addEventListener('scroll', rafThrottle(handleScroll), { passive: true });
  handleScroll();
};

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initHeaderShadowOnScroll();
});
