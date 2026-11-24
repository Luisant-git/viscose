/* Enhances every native language <select> into a searchable dropdown. */
(function () {
  'use strict';

  var LANG_CODES = {
    'Arabic': 'ar',
    'Bengali': 'bn',
    'Chinese (Simplified)': 'zh-CN',
    'Chinese (Traditional)': 'zh-TW',
    'English': 'en',
    'Gujarati': 'gu',
    'Hindi': 'hi',
    'Kannada': 'kn',
    'Malay': 'ms',
    'Malayalam': 'ml',
    'Marathi': 'mr',
    'Russian': 'ru',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Urdu': 'ur'
  };

  var TRANSLATE_HOST_ID = 'google_translate_element';

  function ensureTranslateHost() {
    var host = document.getElementById(TRANSLATE_HOST_ID);
    if (!host) {
      host = document.createElement('div');
      host.id = TRANSLATE_HOST_ID;
      host.className = 'translate-host';
      document.body.appendChild(host);
    }
    return host;
  }

  window.googleTranslateElementInit = function () {
    var host = ensureTranslateHost();
    if (!window.google || !window.google.translate ||
        !window.google.translate.TranslateElement || host.querySelector('select')) return;

    var codes = Object.keys(LANG_CODES).map(function (name) {
      return LANG_CODES[name];
    }).join(',');

    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: codes,
      autoDisplay: false
    }, TRANSLATE_HOST_ID);
  };

  function loadGoogleTranslate() {
    if (document.querySelector('script[data-google-translate]')) return;
    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.setAttribute('data-google-translate', '1');
    document.head.appendChild(script);
  }

  function applyTranslation(languageName) {
    var code = LANG_CODES[languageName];
    if (!code) return;

    var host = ensureTranslateHost();
    var tries = 0;

    function attempt() {
      var nativeSelect = host.querySelector('select');
      if (nativeSelect) {
        nativeSelect.value = code;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (tries < 50) {
        tries += 1;
        window.setTimeout(attempt, 120);
      }
    }

    attempt();
  }

  ensureTranslateHost();
  loadGoogleTranslate();

  var globeIcon = '<svg class="lang-picker__globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9"></circle>' +
    '<path d="M3 12h18M12 3c2.4 2.5 3.7 5.6 3.7 9S14.4 18.5 12 21c-2.4-2.5-3.7-5.6-3.7-9S9.6 5.5 12 3z"></path>' +
    '</svg>';

  var searchIcon = '<svg class="lang-picker__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="7"></circle><path d="m16 16 4 4"></path>' +
    '</svg>';

  function enhance(select) {
    if (!select || select.dataset.langPickerReady) return;
    select.dataset.langPickerReady = '1';

    var options = Array.prototype.map.call(select.options, function (opt) {
      return { value: opt.value, text: opt.textContent.trim(), selected: opt.selected };
    }).filter(function (opt) { return opt.text && opt.text.toLowerCase() !== 'select language'; });

    if (!options.length) return;

    var current = options.filter(function (opt) { return opt.selected; })[0] || options[0];

    var wrap = document.createElement('div');
    wrap.className = 'lang-picker notranslate';
    wrap.setAttribute('translate', 'no');
    select.setAttribute('translate', 'no');
    wrap.innerHTML =
      '<button type="button" class="lang-picker__trigger" aria-haspopup="listbox" aria-expanded="false">' +
        globeIcon +
        '<span class="lang-picker__label"></span>' +
        '<span class="lang-picker__chevron" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="lang-picker__panel" hidden>' +
        '<div class="lang-picker__search-wrap">' + searchIcon +
          '<input class="lang-picker__search" type="search" placeholder="Search language..." aria-label="Search language" autocomplete="off">' +
        '</div>' +
        '<ul class="lang-picker__list" role="listbox" aria-label="Languages"></ul>' +
        '<p class="lang-picker__empty" hidden>No languages found</p>' +
      '</div>';

    select.parentNode.insertBefore(wrap, select);
    select.classList.add('lang-select--native');

    var trigger = wrap.querySelector('.lang-picker__trigger');
    var label = wrap.querySelector('.lang-picker__label');
    var panel = wrap.querySelector('.lang-picker__panel');
    var search = wrap.querySelector('.lang-picker__search');
    var list = wrap.querySelector('.lang-picker__list');
    var empty = wrap.querySelector('.lang-picker__empty');
    var keyIndex = -1;

    options.forEach(function (opt, i) {
      var li = document.createElement('li');
      li.className = 'lang-picker__option notranslate';
      li.setAttribute('translate', 'no');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', opt === current ? 'true' : 'false');
      li.dataset.index = i;
      li.textContent = opt.text;
      list.appendChild(li);
    });

    var items = Array.prototype.slice.call(list.children);

    function choose(i, silent) {
      current = options[i];
      select.value = current.value;
      label.textContent = current.text;
      items.forEach(function (item, idx) {
        item.setAttribute('aria-selected', idx === i ? 'true' : 'false');
        item.classList.remove('is-key');
      });
      keyIndex = i;
      if (!silent) applyTranslation(current.text);
    }

    function filter(query) {
      var q = query.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item, i) {
        var match = options[i].text.toLowerCase().indexOf(q) !== -1;
        item.hidden = !match;
        if (match) shown += 1;
      });
      empty.hidden = shown !== 0;
      keyIndex = -1;
    }

    function visibleItems() {
      return items.filter(function (item) { return !item.hidden; });
    }

    function open() {
      panel.hidden = false;
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      search.value = '';
      filter('');
      search.focus();
    }

    function close() {
      panel.hidden = true;
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      search.value = '';
      filter('');
    }

    function moveKey(delta) {
      var visible = visibleItems();
      if (!visible.length) return;
      if (keyIndex < 0) keyIndex = delta > 0 ? 0 : visible.length - 1;
      else keyIndex = (keyIndex + delta + visible.length) % visible.length;
      visible.forEach(function (item) { item.classList.remove('is-key'); });
      visible[keyIndex].classList.add('is-key');
      visible[keyIndex].scrollIntoView({ block: 'nearest' });
    }

    choose(options.indexOf(current), true);

    trigger.addEventListener('click', function () {
      if (panel.hidden) open(); else close();
    });

    search.addEventListener('input', function () { filter(search.value); });

    search.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); moveKey(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); moveKey(-1); }
      else if (event.key === 'Enter') {
        var active = list.querySelector('.is-key');
        if (active) { event.preventDefault(); active.click(); }
      }
    });

    list.addEventListener('click', function (event) {
      var item = event.target.closest('.lang-picker__option');
      if (!item) return;
      choose(Number(item.dataset.index));
      close();
      trigger.focus();
    });

    document.addEventListener('click', function (event) {
      if (!wrap.contains(event.target)) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        close();
        trigger.focus();
      }
    });
  }

  document.querySelectorAll('.lang-select').forEach(enhance);
})();
