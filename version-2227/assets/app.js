
(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length === 0) return;
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var category = document.querySelector('[data-filter-category]');
    var year = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
    if (!input && !category && !year) return;
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var c = category ? category.value : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardCategory = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var visible = (!q || text.indexOf(q) !== -1) && (!c || cardCategory === c) && (!y || cardYear === y);
        card.classList.toggle('hidden-card', !visible);
      });
    }
    [input, category, year].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });
  }

  function loadHlsLibrary(done) {
    if (window.Hls) {
      done();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = done;
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('.play-overlay');
    if (!video || !sourceUrl) return;
    var loaded = false;
    function play() {
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    }
    function attach() {
      if (loaded) {
        play();
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', play, { once: true });
      } else {
        loadHlsLibrary(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, play);
          } else {
            video.src = sourceUrl;
            play();
          }
        });
      }
      if (button) button.classList.add('hidden');
    }
    if (button) button.addEventListener('click', attach);
    video.addEventListener('click', function () {
      if (!loaded) attach();
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
