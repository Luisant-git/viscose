/* Floating WhatsApp widget markup + behaviour (matches the original site). */
(function () {
  'use strict';

  if (document.getElementById('wa')) return;

  var members = [
    { name: 'Support1', duty: 'Support', phone: '917094609666', text: 'Hi' },
    { name: 'Support2', duty: 'Support', phone: '917094609777', text: '' }
  ];

  var items = members.map(function (member) {
    var query = 'phone=' + member.phone + (member.text ? '&text=' + member.text : '');
    return '' +
      '<div class="wa__popup_content_item">' +
        '<a target="_blank" rel="nofollow noopener noreferrer" class="wa__stt wa__stt_online" ' +
          'href="https://api.whatsapp.com/send?' + query + '">' +
          '<div class="wa__popup_avatar"><img src="assets/whatsapp-avatar.svg" alt="" width="48" height="48"></div>' +
          '<div class="wa__popup_txt">' +
            '<div class="wa__member_name">' + member.name + '</div>' +
            '<div class="wa__member_duty">' + member.duty + '</div>' +
          '</div>' +
        '</a>' +
      '</div>';
  }).join('');

  var widget = '' +
    '<div id="wa" class="wa__widget_container">' +
      '<div class="wa__btn_popup" role="button" tabindex="0" aria-label="Chat with us on WhatsApp" aria-expanded="false">' +
        '<div class="wa__btn_popup_icon"></div>' +
      '</div>' +
      '<div class="wa__popup_chat_box">' +
        '<div class="wa__popup_heading">' +
          '<div class="wa__popup_title">Start a Conversation</div>' +
          '<div class="wa__popup_intro">Hi! Click one of our member below to chat on <strong>WhatsApp</strong></div>' +
        '</div>' +
        '<div class="wa__popup_content wa__popup_content_left">' +
          '<div class="wa__popup_notice">The team typically replies in a few minutes.</div>' +
          '<div class="wa__popup_content_list">' + items + '</div>' +
        '</div>' +
        '<div class="wa__popup_powered">' +
          '<div class="wa__popup_powered_content">' +
            '<a target="_blank" rel="nofollow noopener noreferrer" href="https://ninjateam.org/whatsapp-chat-wordpress/" aria-label="Powered by NinjaTeam">' +
              '<img class="wa__popup_icon-ninja" src="assets/whatsapp-ninja.svg" alt="" width="20" height="20">' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', widget);

  var button = document.querySelector('.wa__btn_popup');
  var box = document.querySelector('.wa__popup_chat_box');
  var timer;

  function toggle() {
    var opening = !button.classList.contains('wa__active');

    button.classList.toggle('wa__active', opening);
    box.classList.toggle('wa__active', opening);
    button.setAttribute('aria-expanded', opening ? 'true' : 'false');

    clearTimeout(timer);

    if (opening) {
      box.classList.add('wa__pending');
      box.classList.remove('wa__lauch');
      timer = setTimeout(function () {
        box.classList.add('wa__lauch');
        box.classList.remove('wa__pending');
      }, 100);
    } else {
      box.classList.remove('wa__lauch', 'wa__pending');
    }
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    toggle();
  });

  button.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
})();
