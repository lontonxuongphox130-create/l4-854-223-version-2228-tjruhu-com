(function () {
  function attachPlayer(video, sourceUrl) {
    if (!video || !sourceUrl) {
      return;
    }

    const shell = video.closest('.video-shell');
    const startButton = shell ? shell.querySelector('.player-start') : null;
    let loaded = false;
    let pendingPlay = false;
    let hlsInstance = null;

    function markReady() {
      if (shell) {
        shell.classList.add('is-ready');
      }
    }

    function attemptPlay() {
      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(sourceUrl);
        });
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          markReady();
          if (pendingPlay) {
            attemptPlay();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        markReady();
      } else {
        video.src = sourceUrl;
        markReady();
      }
    }

    function startPlayback() {
      pendingPlay = true;
      loadSource();

      if (!hlsInstance) {
        attemptPlay();
      }
    }

    if (startButton) {
      startButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.initializePlayer = function (videoId, sourceUrl) {
    attachPlayer(document.getElementById(videoId), sourceUrl);
  };
})();
