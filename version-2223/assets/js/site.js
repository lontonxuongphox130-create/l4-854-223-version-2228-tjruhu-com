(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupImages() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  function setupHero() {
    var root = document.querySelector('.hero-slider');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupCategoryControls() {
    var grid = document.querySelector('[data-movie-grid]');
    if (!grid) {
      return;
    }
    var select = document.querySelector('[data-sort-select]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    if (select) {
      select.addEventListener('change', function () {
        var sorted = cards.slice();
        if (select.value === 'popular') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          });
        } else if (select.value === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          });
        } else {
          sorted.sort(function (a, b) {
            return Number(a.dataset.id || 0) - Number(b.dataset.id || 0);
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    }
    document.querySelectorAll('[data-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-view]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        grid.classList.toggle('movies-list-view', button.dataset.view === 'list');
        cards.forEach(function (card) {
          card.classList.toggle('movie-card-list', button.dataset.view === 'list');
        });
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var result = document.querySelector('[data-search-result]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
    if (!form || !input || !result || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function apply() {
      var query = input.value.trim().toLowerCase();
      var count = 0;
      cards.forEach(function (card) {
        var matched = !query || (card.dataset.index || '').indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          count += 1;
        }
      });
      result.textContent = query ? '找到 ' + count + ' 个相关影片' : '输入关键词搜索影片';
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      apply();
    });
    input.addEventListener('input', apply);
    apply();
  }

  function setupPlayer() {
    var video = document.querySelector('#movie-player');
    if (!video) {
      return;
    }
    var stage = document.querySelector('.player-stage');
    var overlay = document.querySelector('.player-overlay');
    var button = document.querySelector('.player-button');
    var stream = video.getAttribute('data-stream') || '';
    var prepared = false;
    var instance = null;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(stream);
        instance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    if (stage) {
      stage.addEventListener('click', function (event) {
        if (event.target !== video) {
          start();
        }
      });
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupCategoryControls();
    setupSearchPage();
    setupPlayer();
  });
})();
