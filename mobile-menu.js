/* Mobile drawer: Services submenu opens only when its parent is clicked. */
(function () {
  'use strict';

  var toggle = document.getElementById('nav-toggle');
  var parents = document.querySelectorAll('.primary-nav .nav-item.has-dropdown > a');

  function closeAll() {
    document.querySelectorAll('.primary-nav .nav-item.has-dropdown.is-open').forEach(function (item) {
      item.classList.remove('is-open');
    });
  }

  parents.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (window.innerWidth > 1024) return;

      event.preventDefault();
      event.stopPropagation();

      var item = link.parentElement;
      var wasOpen = item.classList.contains('is-open');
      closeAll();
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  if (toggle) {
    toggle.addEventListener('change', function () {
      if (!toggle.checked) closeAll();
    });
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.primary-nav')) closeAll();
  });

  /* Mobile-only scroll-to-top button. */
  var topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.className = 'scroll-to-top';
  topButton.setAttribute('aria-label', 'Scroll to top');
  topButton.innerHTML = '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04L12.686 358.81c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"/></svg>';
  document.body.appendChild(topButton);

  function updateTopButton() {
    topButton.classList.toggle('is-visible', window.scrollY > 250);
  }

  topButton.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
})();
