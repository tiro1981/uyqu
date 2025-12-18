document.addEventListener("DOMContentLoaded", () => {
  let tg = null;
  if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.expand();
  }

  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("playBtn");
  const volumeSlider = document.getElementById("volumeSlider");

  audio.volume = volumeSlider.value;

  let isPlaying = false;

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
});

