(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Count-up stats: <span class="timer" data-target="60000">0</span> */
  var timers = document.querySelectorAll('.timer[data-target]');

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;

    if (reduceMotion || !window.requestAnimationFrame) {
      el.textContent = target;
      return;
    }

    var duration = 2000;
    var startTime = null;

    function frame(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = String(target);
      }
    }

    window.requestAnimationFrame(frame);
  }

  if (timers.length) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });

      timers.forEach(function (timer) { observer.observe(timer); });
    } else {
      timers.forEach(runCounter);
    }
  }

  /* Autoplay for the radio-driven testimonial sliders. */
  document.querySelectorAll('.testi-slider').forEach(function (slider) {
    var inputs = slider.querySelectorAll('.testi-input');
    if (inputs.length < 2) return;

    var index = 0;
    var intervalId = null;

    inputs.forEach(function (input, i) {
      if (input.checked) index = i;
      input.addEventListener('change', function () {
        index = i;
        restart();
      });
    });

    function advance() {
      index = (index + 1) % inputs.length;
      inputs[index].checked = true;
    }

    function stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function start() {
      if (!reduceMotion && !intervalId) intervalId = setInterval(advance, 4500);
    }

    function restart() {
      stop();
      start();
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    start();
  });

  /* Gallery carousel: two 525px slides, 30px gap, auto-advance + dots. */
  document.querySelectorAll('.gallery-carousel').forEach(function (carousel) {
    var track = carousel.querySelector('.gallery-track');
    var slides = track ? track.children : null;
    if (!slides || slides.length < 2) return;

    var realCount = slides.length;
    var dotsWrap = carousel.parentElement ? carousel.parentElement.querySelector('.gallery-dots') : null;
    var dots = [];

    /* Clone the first two slides so the final position still fills the viewport. */
    for (var c = 0; c < Math.min(2, realCount); c += 1) {
      var clone = slides[c].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }

    var step = 555;
    var index = 0;
    var intervalId = null;

    if (dotsWrap) {
      for (var d = 0; d < realCount; d += 1) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot' + (d === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Go to slide ' + (d + 1));
        dot.setAttribute('aria-selected', d === 0 ? 'true' : 'false');
        (function (dotIndex) {
          dot.addEventListener('click', function () {
            stop();
            index = dotIndex;
            render();
          });
        })(d);
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
    }

    function measure() {
      if (slides[0]) step = slides[0].getBoundingClientRect().width + 30;
    }

    function maxIndex() {
      var visible = Math.max(1, Math.floor((carousel.clientWidth + 30) / step));
      return Math.max(0, slides.length - visible);
    }

    function updateDots() {
      var active = index % realCount;
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
        dot.setAttribute('aria-selected', i === active ? 'true' : 'false');
      });
    }

    function render() {
      track.style.transform = 'translateX(' + (-index * step) + 'px)';
      updateDots();
    }

    function move() {
      index += 1;
      if (index > maxIndex()) index = 0;
      render();
    }

    function stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function start() {
      if (!reduceMotion && !intervalId) intervalId = setInterval(move, 3500);
    }

    measure();
    render();

    window.addEventListener('resize', function () {
      measure();
      render();
    });

    /* Keep the caption visible even if the track is mid-transition. */
    Array.prototype.forEach.call(slides, function (slide) {
      function show() {
        slide.classList.add('is-hovered');
        stop();
      }
      function hide() {
        slide.classList.remove('is-hovered');
      }
      slide.addEventListener('mouseenter', show);
      slide.addEventListener('pointerenter', show);
      slide.addEventListener('mouseleave', hide);
      slide.addEventListener('pointerleave', hide);
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mousemove', stop);
    carousel.addEventListener('pointerenter', stop);
    carousel.addEventListener('pointermove', stop);

    function leave() {
      Array.prototype.forEach.call(slides, function (slide) {
        slide.classList.remove('is-hovered');
      });
      start();
    }

    carousel.addEventListener('mouseleave', leave);
    carousel.addEventListener('pointerleave', leave);

    start();
  });
})();
