(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', mobileNav.classList.contains('open') ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    [input, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var url = shell.getAttribute('data-video-url');
    var loaded = false;
    var hlsInstance = null;

    function loadAndPlay() {
      if (!video || !url) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }

      video.controls = true;
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var form = searchRoot.querySelector('form');
    var input = searchRoot.querySelector('input[name="q"]');
    var results = searchRoot.querySelector('[data-search-results]');
    var empty = searchRoot.querySelector('[data-empty-state]');

    function render(query) {
      var q = query.trim().toLowerCase();
      var items = window.SEARCH_DATA.filter(function (item) {
        return !q || item.search.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 80);

      results.innerHTML = items.map(function (item) {
        return [
          '<a class="movie-card" href="' + item.url + '">',
          '  <div class="poster-wrap">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
          '    <span class="card-badge">' + escapeHtml(item.genre) + '</span>',
          '    <span class="play-float"><span>▶</span></span>',
          '  </div>',
          '  <div class="card-body">',
          '    <h2 class="card-title">' + escapeHtml(item.title) + '</h2>',
          '    <p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
          '    <div class="card-meta"><span>' + escapeHtml(item.year) + '年</span><span>' + escapeHtml(item.region) + '</span></div>',
          '  </div>',
          '</a>'
        ].join('\n');
      }).join('\n');

      if (empty) {
        empty.classList.toggle('visible', items.length === 0);
      }
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    render(initial);

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var q = input.value.trim();
        var nextUrl = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
        window.history.replaceState(null, '', nextUrl);
        render(q);
      });
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }
})();
