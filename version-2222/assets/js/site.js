(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var nextButton = slider.querySelector("[data-hero-next]");
    var prevButton = slider.querySelector("[data-hero-prev]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === activeIndex);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === activeIndex);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var cardList = document.querySelector(".js-card-list");
  var keywordInput = document.querySelector(".js-card-filter");
  var regionSelect = document.querySelector(".js-region-filter");
  var yearSelect = document.querySelector(".js-year-filter");

  function filterCards() {
    if (!cardList) {
      return;
    }

    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
    var region = regionSelect ? regionSelect.value : "";
    var year = yearSelect ? yearSelect.value : "";
    var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));

    cards.forEach(function (card) {
      var search = (card.getAttribute("data-search") || "").toLowerCase();
      var cardRegion = card.getAttribute("data-region") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var visible = true;

      if (keyword && search.indexOf(keyword) === -1) {
        visible = false;
      }

      if (region && cardRegion !== region) {
        visible = false;
      }

      if (year && cardYear !== year) {
        visible = false;
      }

      card.classList.toggle("is-hidden-by-filter", !visible);
    });
  }

  [keywordInput, regionSelect, yearSelect].forEach(function (element) {
    if (element) {
      element.addEventListener("input", filterCards);
      element.addEventListener("change", filterCards);
    }
  });

  var searchInput = document.getElementById("siteSearchInput");
  var searchResults = document.getElementById("searchResults");
  var searchStatus = document.getElementById("searchStatus");
  var searchRegion = document.getElementById("searchRegion");
  var searchYear = document.getElementById("searchYear");
  var searchType = document.getElementById("searchType");

  function uniqueValues(items, key) {
    var map = {};

    items.forEach(function (item) {
      if (item[key]) {
        map[item[key]] = true;
      }
    });

    return Object.keys(map).sort().reverse();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function searchCard(movie) {
    var tagHtml = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "<a href=\"./" + escapeHtml(movie.file) + "\" class=\"movie-card-link\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<span class=\"poster-shell\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
      "</span>",
      "<span class=\"movie-card-body\">",
      "<strong>" + escapeHtml(movie.title) + "</strong>",
      "<small>" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</small>",
      "<span class=\"line-clamp\">" + escapeHtml(movie.oneLine) + "</span>",
      "<span class=\"tag-row\">" + tagHtml + "</span>",
      "</span>",
      "</a>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function renderSearch() {
    if (!searchResults || !window.searchMovies) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var region = searchRegion ? searchRegion.value : "";
    var year = searchYear ? searchYear.value : "";
    var type = searchType ? searchType.value : "";
    var results = window.searchMovies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.oneLine,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(" ")
      ].join(" ").toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (region && movie.region !== region) {
        return false;
      }

      if (year && movie.year !== year) {
        return false;
      }

      if (type && movie.type !== type) {
        return false;
      }

      return true;
    }).slice(0, 120);

    if (searchStatus) {
      searchStatus.textContent = results.length ? "已匹配到相关影片" : "未找到相关影片";
    }

    searchResults.innerHTML = results.map(searchCard).join("");
  }

  if (window.searchMovies && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (searchInput) {
      searchInput.value = query;
    }

    fillSelect(searchRegion, uniqueValues(window.searchMovies, "region"));
    fillSelect(searchYear, uniqueValues(window.searchMovies, "year"));
    fillSelect(searchType, uniqueValues(window.searchMovies, "type"));

    [searchInput, searchRegion, searchYear, searchType].forEach(function (element) {
      if (element) {
        element.addEventListener("input", renderSearch);
        element.addEventListener("change", renderSearch);
      }
    });

    renderSearch();
  }
})();
