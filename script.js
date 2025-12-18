document.addEventListener("DOMContentLoaded", () => {
  let tg = null;
  if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.expand();
  }

  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("playBtn");
  const volumeSlider = document.getElementById("volumeSlider");

  let isPlaying = false;
  let timerId = null;

  audio.volume = volumeSlider.value;

  playBtn.addEventListener("click", () => {
    if (!isPlaying) {
      audio.play();
      playBtn.textContent = "⏸ Pause";
    } else {
      audio.pause();
      playBtn.textContent = "▶️ Play";
    }
    isPlaying = !isPlaying;
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  window.changeSound = function (file) {
    audio.pause();
    audio.src = file;
    audio.load();
    audio.play();
    playBtn.textContent = "⏸ Pause";
    isPlaying = true;
  };

  window.setTimer = function (minutes) {
    cancelTimer();
    timerId = setTimeout(() => {
      audio.pause();
      playBtn.textContent = "▶️ Play";
      isPlaying = false;
      if (tg) tg.showAlert("⏱️ Taymer tugadi");
    }, minutes * 60000);

    if (tg) tg.showAlert(`⏱️ ${minutes} daqiqaga o‘rnatildi`);
  };

  window.cancelTimer = function () {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
      if (tg) tg.showAlert("⛔ Taymer bekor qilindi");
    }
  };
});
