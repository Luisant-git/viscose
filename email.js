/* Submits the enquiry form through EmailJS. */
(function () {
  'use strict';

  var PUBLIC_KEY = 'Bpa-gDeNW38dY15vh';
  var SERVICE_ID = 'service_vbcspqa';
  var TEMPLATE_ID = 'template_mnmvlgi';

  var form = document.querySelector('form.enquiry-form');
  if (!form) return;

  function sendViaEmailJS(params) {
    if (typeof emailjs !== 'undefined') {
      emailjs.init({ publicKey: PUBLIC_KEY });
      return emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
    }

    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: params
      })
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          throw new Error(text || 'EmailJS request failed (' + response.status + ')');
        });
      }
      return response;
    });
  }

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

    sendViaEmailJS(params)
      .then(function () {
        window.location.href = 'enquiry.html?sent=1';
      })
      .catch(function (error) {
        console.error('EmailJS error:', error);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        window.location.href = 'enquiry.html?error=' + encodeURIComponent('Sorry, the message could not be sent. Please try again.');
      });
  });
})();
