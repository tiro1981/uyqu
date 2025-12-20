/*********************************
 🔹 1. AUDIO RO‘YXATI (ADMIN O‘RNIGA)
 🔹 YANGI AUDIO QO‘SHISH FAFAQAT SHU YERDA
**********************************/

const AUDIO_LIST = [
  { file: "audios/rain.mp3", name: "🌧️ Yomg‘ir" },

  // 🔽 YANGI AUDIO QO‘SHISH NAMUNASI:
  // { file: "audios/qushlar.mp3", name: "🐦 Qushlar" }
];

/*********************************/

const home = document.getElementById("home");
const audioScreen = document.getElementById("audioScreen");
const audioGrid = document.getElementById("audioGrid");
const audioControls = document.getElementById("audioControls");
const countdown = document.getElementById("countdown");
const playBtn = document.getElementById("playToggle");

let selected = [];     // tanlangan audiolar
let audios = {};       // file -> Audio object
let timer = null;
let isPlaying = false;

/* =============================
   NAVIGATION
============================= */
function openAudio() {
  home.classList.remove("active");
  audioScreen.classList.add("active");
}

function goHome() {
  stopAll();
  audioScreen.classList.remove("active");
  home.classList.add("active");
}

/* =============================
   AUDIO BUTTONLARNI AVTO YARATISH
============================= */
AUDIO_LIST.forEach(item => {
  const btn = document.createElement("button");
  btn.className = "audio-btn";
  btn.textContent = item.name;
  btn.onclick = () => toggleAudio(item.file, btn);
  audioGrid.appendChild(btn);
});

/* =============================
   AUDIO TANLASH / O‘CHIRISH
   (MAX 3 TA)
============================= */
function toggleAudio(file, btn) {
  const idx = selected.indexOf(file);

  if (idx === -1) {
    if (selected.length >= 3) return;

    selected.push(file);
    btn.classList.add("active");

    // 🔴 AUDIO FAQAT BIR MARTA YARATILADI
    if (!audios[file]) {
      const audio = new Audio(file);
      audio.loop = true;
      audio.volume = 0.5;

      // 🔴 iOS UCHUN MUHIM
      audio.load();

      audios[file] = audio;
    }

  } else {
    selected.splice(idx, 1);
    btn.classList.remove("active");

    if (audios[file]) {
      audios[file].pause();
      delete audios[file];
    }
  }

  renderMiddle();
}

/* =============================
   O‘RTA QISM (VOLUME CONTROL)
   iOS MOS WORKAROUND BILAN
============================= */
function renderMiddle() {
  audioControls.innerHTML = "";

  selected.forEach(file => {
    const audio = audios[file];

    const div = document.createElement("div");
    div.className = "middle-item";

    const name = document.createElement("span");
    name.textContent =
      AUDIO_LIST.find(a => a.file === file)?.name || "Audio";

    const vol = document.createElement("input");
    vol.type = "range";
    vol.min = 0;
    vol.max = 1;
    vol.step = 0.01;
    vol.value = audio.volume;

    // 🔴 iOS UCHUN ASOSIY TUZATISH
    vol.oninput = () => {
      const v = vol.value;

      // Agar audio pauzada bo‘lsa (iOS cheklovi)
      if (audio.paused) {
        audio.play().then(() => {
          audio.volume = v;
          audio.pause();
        }).catch(() => {});
      } else {
        audio.volume = v;
      }
    };

    div.appendChild(name);
    div.appendChild(vol);
    audioControls.appendChild(div);
  });
}

/* =============================
   ▶️ PLAY / ⏸ PAUSE
============================= */
function globalPlay() {
  if (selected.length === 0) {
    alert("Avval audio tanlang");
    return;
  }

  if (!isPlaying) {
    selected.forEach(file => {
      audios[file].play().catch(() => {});
    });
    playBtn.textContent = "⏸ Pause";
    isPlaying = true;
  } else {
    Object.values(audios).forEach(a => a.pause());
    playBtn.textContent = "▶️ Play";
    isPlaying = false;
  }
}

/* =============================
   ⏱ TIMER (15 / 30 / 60)
============================= */
function setTimer(min) {
  clearInterval(timer);
  let sec = min * 60;
  countdown.textContent = "";

  timer = setInterval(() => {
    sec--;
    countdown.textContent =
      `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

    if (sec <= 0) {
      clearInterval(timer);
      stopAll();
      playBtn.textContent = "▶️ Play";
      isPlaying = false;
    }
  }, 1000);
}

/* =============================
   STOP HAMMASI
============================= */
function stopAll() {
  Object.values(audios).forEach(a => a.pause());
}
