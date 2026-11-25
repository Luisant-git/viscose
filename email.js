/* Submits the enquiry form through EmailJS. */
(function () {
  'use strict';

  var PUBLIC_KEY = 'Bpa-gDeNW38dY15vh';
  var SERVICE_ID = 'service_vbcspqa';
  var TEMPLATE_ID = 'template_mnmvlgi';

  var form = document.querySelector('form.enquiry-form');
  if (!form || typeof emailjs === 'undefined') return;

  emailjs.init({ publicKey: PUBLIC_KEY });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    var params = {
      name: form.querySelector('#your-name').value.trim(),
      email: form.querySelector('#your-email').value.trim() || '-',
      phone: form.querySelector('#your-phone').value.trim(),
      service: form.querySelector('#your-service').value.trim(),
      district: form.querySelector('#your-district').value.trim(),
      taluk: form.querySelector('#your-taluk').value.trim(),
      village: form.querySelector('#your-village').value.trim(),
      message: form.querySelector('#your-message').value.trim() || '-'
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
      .then(function () {
        window.location.href = 'enquiry.html?sent=1';
      })
      .catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        window.location.href = 'enquiry.html?error=' + encodeURIComponent('Sorry, the message could not be sent. Please try again.');
      });
  });
})();
