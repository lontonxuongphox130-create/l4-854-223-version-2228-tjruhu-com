(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const opened = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!opened));
      mobilePanel.hidden = opened;
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let slideIndex = 0;
  let slideTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === slideIndex);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === slideIndex);
    });
  }

  function beginSlider() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      setSlide(slideIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
      if (slideTimer) {
        window.clearInterval(slideTimer);
        beginSlider();
      }
    });
  });

  setSlide(0);
  beginSlider();

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const keywordInput = filterPanel.querySelector('[data-card-search]');
    const yearSelect = filterPanel.querySelector('[data-card-year]');
    const typeSelect = filterPanel.querySelector('[data-card-type]');
    const result = document.querySelector('[data-filter-result]');
    const empty = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';

    if (keywordInput && initial) {
      keywordInput.value = initial;
    }

    function normalize(text) {
      return String(text || '').trim().toLowerCase();
    }

    function applyFilters() {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.type
        ].join(' '));
        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchYear = !year || card.dataset.year === year;
        const matchType = !type || card.dataset.type === type;
        const show = matchKeyword && matchYear && matchType;

        card.classList.toggle('hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visible + ' 部影片';
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
