(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector(".player-overlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      loadSource();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var play = video.play();

      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
