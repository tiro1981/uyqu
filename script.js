document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("playBtn");
  const volumeSlider = document.getElementById("volumeSlider");

  let isPlaying = false;
  let timerId = null;

  // Boshlang‘ich ovoz
  audio.volume = 0.5;
  volumeSlider.value = 0.5;

  playBtn.addEventListener("click", async () => {
    try {
      if (!isPlaying) {
        await audio.play(); // MUHIM
        playBtn.textContent = "⏸ Pause";
        isPlaying = true;
      } else {
        audio.pause();
        playBtn.textContent = "▶️ Play";
        isPlaying = false;
      }
    } catch (e) {
      alert("🔇 Musiqa ishga tushmadi. Yana bir bor Play bosing.");
    }
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  window.changeSound = async function (file) {
    audio.pause();
    audio.src = file;
    audio.load();
    try {
      await audio.play();
      playBtn.textContent = "⏸ Pause";
      isPlaying = true;
    } catch (e) {
      alert("🔇 Tovushni ishga tushirish uchun Play bosing");
    }
  };

  window.setTimer = function (minutes) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      audio.pause();
      playBtn.textContent = "▶️ Play";
      isPlaying = false;
      alert("⏱️ Taymer tugadi");
    }, minutes * 60000);
  };

  window.cancelTimer = function () {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
      alert("⛔ Taymer bekor qilindi");
    }
  };
});
