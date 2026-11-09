
'use strict';

/* =================================
   SELECTORS
================================= */

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  [...context.querySelectorAll(selector)];

/* =================================
   PAGE LOADER
================================= */

window.addEventListener('load', () => {
  const loader = $('#loader');

  if (loader) {
    setTimeout(() => {
      loader.classList.add('done');
    }, 350);
  }
});

/* =================================
   COPYRIGHT YEAR
================================= */

const year = $('#yr');

if (year) {
  year.textContent = new Date().getFullYear();
}

/* =================================
   MOBILE NAVIGATION
================================= */

const burger = $('.burger');
const nav = $('#nav');

function setNav(open) {
  if (!burger || !nav) return;

  nav.classList.toggle('open', open);

  burger.setAttribute('aria-expanded', String(open));

  burger.setAttribute(
    'aria-label',
    open ? 'Close menu' : 'Open menu'
  );
}

if (burger && nav) {

  burger.addEventListener('click', () => {
    setNav(!nav.classList.contains('open'));
  });

  $$('a', nav).forEach(link => {
    link.addEventListener('click', () => {
      setNav(false);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setNav(false);
    }
  });

}

/* =================================
   HEADER SCROLL EFFECT
================================= */

const header = $('.site-header');
const up = $('.up');

function onScroll() {

  if (header) {
    header.classList.toggle(
      'scrolled',
      window.scrollY > 10
    );
  }

  if (up) {
    up.classList.toggle(
      'show',
      window.scrollY > 600
    );
  }

}

window.addEventListener('scroll', onScroll, {
  passive: true
});

onScroll();

/* =================================
   BACK TO TOP
================================= */

if (up) {
  up.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* =================================
   ACTIVE NAVIGATION
================================= */

const links = $$('nav a[href^="#"]:not(.btn)');

const sections = links
  .map(link => $(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {

  const spy = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        links.forEach(link => {

          const active =
            link.getAttribute('href') ===
            '#' + entry.target.id;

          link.classList.toggle('active', active);

        });

      }

    });

  }, {
    rootMargin: '-45% 0px -50% 0px'
  });

  sections.forEach(section => {
    spy.observe(section);
  });

  /* =================================
     SCROLL REVEAL ANIMATION
  ================================= */

  const revealObserver = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add('in');

          revealObserver.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12
    }
  );

  $$('.head, .grid, .about-grid, .contact-grid, .team-grid')
    .forEach(element => {

      element.classList.add('reveal');

      revealObserver.observe(element);

    });

}

/* =================================
   CONTACT FORM (OPTIONAL)
================================= */

const form = $('#enquiry');
const status = $('#status');

if (form && status) {

  const FORM_ENDPOINT =
    'https://formspree.io/f/YOUR_FORM_ID';

  const rules = {

    name: value =>
      value.trim().length >= 2 ||
      'Enter your full name.',

    email: value =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ||
      'Enter a valid email address.',

    phone: value =>
      /^[+()\d\s-]{7,18}$/.test(value) ||
      'Enter a valid phone number.',

    service: value =>
      !!value ||
      'Choose the service you need.',

    message: value =>
      value.trim().length >= 10 ||
      'Write at least 10 characters.'

  };

  function check(field) {

    const result = rules[field.name](field.value);

    const error = field.parentElement.querySelector('.err');

    const invalid = result !== true;

    field.classList.toggle('invalid', invalid);

    field.setAttribute(
      'aria-invalid',
      String(invalid)
    );

    if (error) {
      error.textContent = invalid ? result : '';
    }

    return !invalid;
  }

  Object.keys(rules).forEach(name => {

    const field = form.elements[name];

    if (!field) return;

    field.addEventListener('blur', () => {
      check(field);
    });

    field.addEventListener('input', () => {

      if (field.classList.contains('invalid')) {
        check(field);
      }

    });

  });

  form.addEventListener('submit', async event => {

    event.preventDefault();

    status.className = '';
    status.textContent = '';

    const valid = Object.keys(rules)
      .map(name => {
        const field = form.elements[name];
        return field ? check(field) : false;
      })
      .every(Boolean);

    const consent = $('#consent');
    const consentError = $('#consent-err');

    if (consent && consentError) {

      consentError.textContent = consent.checked
        ? ''
        : 'Please agree so we can respond to your enquiry.';

    }

    if (!valid || (consent && !consent.checked)) {

      const invalidField = form.querySelector('.invalid');

      (invalidField || consent)?.focus();

      return;

    }

    if (form.elements._gotcha?.value) return;

    const button = form.querySelector(
      'button[type="submit"]'
    );

    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }

    try {

      const response = await fetch(FORM_ENDPOINT, {

        method: 'POST',

        headers: {
          Accept: 'application/json'
        },

        body: new FormData(form)

      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      form.reset();

      status.className = 'ok';

      status.textContent =
        'Thank you. Your enquiry has been sent.';

    } catch (error) {

      status.className = 'bad';

      status.textContent =
        'Unable to send your enquiry. Please email or call us.';

    } finally {

      if (button) {
        button.disabled = false;
        button.textContent = 'Send Enquiry';
      }

    }

  });

}

/* =================================
   TEAM PROFILE IMAGE FALLBACK
================================= */

$$('.team-photo img').forEach(img => {

  img.addEventListener('error', () => {

    img.style.display = 'none';

    img.parentElement.style.background =
      'linear-gradient(135deg, #e6edf6, #d3deec)';

  });

});
