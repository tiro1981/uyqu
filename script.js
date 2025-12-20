/*********************************
 🔹 AUDIO RO‘YXATI
 🔹 YANGI AUDIO FAQAT SHU YERDA
**********************************/
const AUDIO_LIST = [
  { file: "audios/rain.mp3", name: "🌧️ Yomg‘ir" },
  { file: "audios/ocean.mp3", name: "🌊 Dengiz" },


  // ➕ yangi audio:
  // { file: "audios/qushlar.mp3", name: "🐦 Qushlar" }
];

/*********************************/

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

const home = document.getElementById("home");
const audioScreen = document.getElementById("audioScreen");
const audioGrid = document.getElementById("audioGrid");
const audioControls = document.getElementById("audioControls");
const masterVolumeBox = document.getElementById("masterVolumeBox");
const countdown = document.getElementById("countdown");
const playBtn = document.getElementById("playToggle");

let selected = [];
let audios = {};
let timer = null;
let isPlaying = false;

/* NAV */
function openAudio() {
  home.classList.remove("active");
  audioScreen.classList.add("active");
}
function goHome() {
  stopAll();
  audioScreen.classList.remove("active");
  home.classList.add("active");
}

/* AUDIO BUTTONLAR */
AUDIO_LIST.forEach(item => {
  const btn = document.createElement("button");
  btn.className = "audio-btn";
  btn.textContent = item.name;
  btn.onclick = () => toggleAudio(item.file, btn);
  audioGrid.appendChild(btn);
});

/* TOGGLE AUDIO */
function toggleAudio(file, btn) {
  const idx = selected.indexOf(file);

  if (idx === -1) {
    if (selected.length >= 3) return;
    selected.push(file);
    btn.classList.add("active");

    if (!audios[file]) {
      const audio = new Audio(file);
      audio.loop = true;
      audio.volume = 0.5;
      audio.load();
      audios[file] = audio;
    }
  } else {
    selected.splice(idx, 1);
    btn.classList.remove("active");
    audios[file].pause();
    delete audios[file];
  }

  renderMiddle();
}

/* O‘RTA QISM */
function renderMiddle() {
  audioControls.innerHTML = "";

  selected.forEach(file => {
    const audio = audios[file];

    const div = document.createElement("div");
    div.className = "middle-item";

    const name = document.createElement("span");
    name.textContent =
      AUDIO_LIST.find(a => a.file === file)?.name || "Audio";

    div.appendChild(name);

    if (!isIOS) {
      const vol = document.createElement("input");
      vol.type = "range";
      vol.min = 0;
      vol.max = 1;
      vol.step = 0.01;
      vol.value = audio.volume;
      vol.oninput = () => audio.volume = vol.value;
      div.appendChild(vol);
    }

    audioControls.appendChild(div);
  });

  masterVolumeBox.style.display = isIOS ? "block" : "none";
}

/* MASTER VOLUME (iPhone) */
function setMasterVolume(v) {
  Object.values(audios).forEach(a => {
    a.volume = v;
  });
}

/* PLAY / PAUSE */
function globalPlay() {
  if (selected.length === 0) {
    alert("Avval audio tanlang");
    return;
  }

  if (!isPlaying) {
    selected.forEach(file => audios[file].play());
    playBtn.textContent = "⏸ Pause";
    isPlaying = true;
  } else {
    stopAll();
    playBtn.textContent = "▶️ Play";
    isPlaying = false;
  }
}

/* TIMER */
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

/* STOP */
function stopAll() {
  Object.values(audios).forEach(a => a.pause());
}


