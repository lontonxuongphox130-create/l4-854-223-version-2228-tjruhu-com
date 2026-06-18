(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSiteSearch() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var q = normalize(input && input.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    if (!players.length) {
      return;
    }

    players.forEach(function (video) {
      var source = video.getAttribute("data-video-src");
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.ErrorTypes) {
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }

      var frame = video.closest(".player-frame");
      var button = frame ? frame.querySelector(".video-play-button") : null;
      if (button) {
        button.addEventListener("click", function () {
          button.classList.add("is-hidden");
          video.play().catch(function () {
            button.classList.remove("is-hidden");
            video.controls = true;
          });
        });
        video.addEventListener("play", function () {
          button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            button.classList.remove("is-hidden");
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
