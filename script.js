document.addEventListener("DOMContentLoaded", () => {
  let tg = null;

  if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.expand();
  }

  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("playBtn");

  let isPlaying = false;
  let timerTimeout = null;

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

  window.setTimer = function (minutes) {
    if (timerTimeout) clearTimeout(timerTimeout);

    timerTimeout = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      playBtn.textContent = "▶️ Play";
      isPlaying = false;
    }, minutes * 60 * 1000);

    if (tg) {
      tg.showAlert(`Music will stop after ${minutes} minutes`);
    } else {
      alert(`Music will stop after ${minutes} minutes`);
    }
  };
});
