/* Shows a neat thank-you popup after send-enquiry.php redirects back. */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var sent = params.get('sent');
  var error = params.get('error');

  var form = document.querySelector('form.enquiry-form');
  if (!form || (!sent && !error)) return;

  if (sent) form.reset();

  var modal = document.createElement('div');
  modal.className = 'form-modal' + (sent ? '' : ' is-error');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'form-modal-title');
  modal.hidden = true;
  modal.innerHTML = '' +
    '<div class="form-modal__backdrop"></div>' +
    '<div class="form-modal__box">' +
      '<button type="button" class="form-modal__close" aria-label="Close">&times;</button>' +
      '<div class="form-modal__icon"></div>' +
      '<h3 id="form-modal-title"></h3>' +
      '<p></p>' +
      '<button type="button" class="form-modal__ok">Close</button>' +
    '</div>';

  document.body.appendChild(modal);

  modal.querySelector('.form-modal__icon').textContent = sent ? '\u2713' : '!';
  modal.querySelector('h3').textContent = sent
    ? 'Thank you for contacting us!'
    : 'Something went wrong';
  modal.querySelector('p').textContent = sent
    ? 'Your enquiry has been sent to harithashree3047@gmail.com. Our team will get back to you shortly.'
    : (error || 'Please try again or email us directly.');

  var ok = modal.querySelector('.form-modal__ok');

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function open() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    ok.focus();
  }

  modal.querySelector('.form-modal__close').addEventListener('click', close);
  ok.addEventListener('click', close);
  modal.querySelector('.form-modal__backdrop').addEventListener('click', close);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) close();
  });

  try {
    history.replaceState(null, '', location.pathname);
  } catch (e) {
    /* file:// preview may block this — the popup still works. */
  }

  open();
})();
