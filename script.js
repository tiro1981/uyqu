// Ovozlar ro'yxati (Fayl nomlari 'audios/' papkasida bo'lishi kerak)
const SOUNDS = [
    { id: 1, file: "audios/rain.mp3", name: "Yomg‘ir", icon: "cloudy_snowing" },
    { id: 2, file: "audios/ocean.mp3", name: "Dengiz", icon: "waves" },
    { id: 3, file: "audios/qushlar.mp3", name: "Qushlar", icon: "birds" },
    { id: 4, file: "audios/daryo.mp3", name: "Daryo", icon: "river" },
    { id: 5, file: "audios/fire.mp3", name: "Olov", icon: "local_fire_department" },
    { id: 6, file: "audios/bird.mp3", name: "Qushlar", icon: "flutter_dash" },
    { id: 7, file: "audios/night.mp3", name: "Tun", icon: "nights_stay" },
    { id: 8, file: "audios/forest.mp3", name: "O'rmon", icon: "forest" },
    { id: 9, file: "audios/thunder.mp3", name: "Guldurak", icon: "thunderstorm" },
    { id: 10, file: "audios/cafe.mp3", name: "Kafe", icon: "coffee" }
];

let saved = [];                // Mix uchun saqlangan ovozlar
let directPlayers = new Map(); // Eshitib ko'rish (Preview) playerlari
let mixPlayers = new Map();    // Mix playerlari
let isMixPlaying = false;      // Mix holati
let timer = null;

// --- NAVIGATSIYA ---
function showTab(id, element) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    element.classList.add("active");

    if (id === "mix") renderMix();
}

// --- OVOZLARNI CHIZISH ---
function renderSounds() {
    const list = document.getElementById("soundList");
    const query = document.getElementById("search").value.toLowerCase();
    list.innerHTML = "";

    SOUNDS.filter(s => s.name.toLowerCase().includes(query)).forEach(s => {
        const isSaved = saved.some(item => item.id === s.id);
        const isPlaying = directPlayers.has(s.id);
        
        const card = document.createElement("div");
        card.className = `sound-card ${isPlaying ? 'playing' : ''}`;
        
        card.innerHTML = `
            <button class="like-btn ${isSaved ? 'active' : ''}" onclick="toggleSave(event, ${s.id})">
                <span class="material-icons-round">${isSaved ? 'favorite' : 'favorite_border'}</span>
            </button>
            <span class="material-icons-round icon-main">${s.icon}</span>
            <p>${s.name}</p>
        `;
        
        // Karta bosilganda ovozni eshitib ko'rish
        card.onclick = () => playDirect(s);
        list.appendChild(card);
    });
}

// 1. PREVIEW (ESHITIB KO'RISH)
function playDirect(s) {
    if (directPlayers.has(s.id)) {
        directPlayers.get(s.id).pause();
        directPlayers.delete(s.id);
    } else {
        const audio = new Audio(s.file);
        audio.loop = true;
        audio.play().catch(e => console.log("Audio play error:", e));
        directPlayers.set(s.id, audio);
    }
    renderSounds();
}

// 2. MIXGA SAQLASH (YURAKCHA)
function toggleSave(e, id) {
    e.stopPropagation(); // Kartani bosilishini to'xtatadi
    const sound = SOUNDS.find(s => s.id === id);
    const index = saved.findIndex(s => s.id === id);

    if (index > -1) {
        // O'chirish
        saved.splice(index, 1);
        if (mixPlayers.has(sound.file)) {
            mixPlayers.get(sound.file).pause();
            mixPlayers.delete(sound.file);
        }
    } else {
        // Qo'shish
        saved.push(sound);
        if (isMixPlaying) startMixAudio(sound.file);
    }
    
    renderSounds();
    // Agar mix oynasi ochiq bo'lsa yangilash
    if(document.getElementById('mix').classList.contains('active')) renderMix();
    updatePlayButtonUI();
}

// --- MIX BO'LIMI FUNKSIYALARI ---
function renderMix() {
    const box = document.getElementById("mixList");
    if (saved.length === 0) {
        box.innerHTML = "<div style='text-align:center; color:#64748b; margin-top:50px; display:flex; flex-direction:column; align-items:center;'><span class='material-icons-round' style='font-size:40px; margin-bottom:10px; opacity:0.5'>playlist_add</span><p>Ovozlar bo'sh. Kutubxonadan qo'shing.</p></div>";
        return;
    }
    box.innerHTML = "";

    saved.forEach(s => {
        const item = document.createElement("div");
        item.className = "mix-item-card";
        item.innerHTML = `
            <div class="mix-head">
                <div style="display:flex; align-items:center; gap:10px">
                    <span class="material-icons-round" style="color:#818cf8">${s.icon}</span>
                    <span style="font-weight:500">${s.name}</span>
                </div>
                <button class="icon-btn" onclick="toggleVolumeBar(this)" style="background:none; border:none; color:#cbd5e1; cursor:pointer;">
                    <span class="material-icons-round">tune</span>
                </button>
            </div>
            <div class="mix-settings">
                <span class="material-icons-round" style="font-size:18px; color:#64748b">volume_down</span>
                <input type="range" min="0" max="1" step="0.01" value="0.5" oninput="setMixVolume('${s.file}', this.value)">
                <span class="material-icons-round" style="font-size:18px; color:#64748b">volume_up</span>
            </div>
        `;
        box.appendChild(item);
    });
}

function toggleVolumeBar(btn) {
    const settings = btn.closest('.mix-item-card').querySelector('.mix-settings');
    settings.classList.toggle('active');
    btn.style.color = settings.classList.contains('active') ? '#818cf8' : '#cbd5e1';
}

// Mix Audio mantiqi
function startMixAudio(file) {
    if (!mixPlayers.has(file)) {
        const audio = new Audio(file);
        audio.loop = true;
        audio.volume = 0.5; // Standart ovoz
        audio.play().catch(e => console.log("Mix play error:", e));
        mixPlayers.set(file, audio);
    }
}

function setMixVolume(file, val) {
    if (mixPlayers.has(file)) mixPlayers.get(file).volume = val;
}

function togglePlayAllMix() {
    if (saved.length === 0) return alert("Avval ro'yxatga ovoz qo'shing!");
    
    if (isMixPlaying) {
        // To'xtatish
        mixPlayers.forEach(p => p.pause());
        isMixPlaying = false;
    } else {
        // Boshlash
        saved.forEach(s => startMixAudio(s.file));
        isMixPlaying = true;
    }
    updatePlayButtonUI();
}

function updatePlayButtonUI() {
    const btn = document.getElementById("mainPlayBtn");
    if (isMixPlaying && saved.length > 0) {
        btn.style.background = "#f43f5e"; // Qizil (Stop)
        btn.innerHTML = '<span class="material-icons-round">pause</span> To\'xtatish';
    } else {
        btn.style.background = "linear-gradient(135deg, #818cf8, #6366f1)"; // Asosiy rang
        btn.innerHTML = '<span class="material-icons-round">play_arrow</span> Mixni tinglash';
    }
}

// --- TIMER (FADE OUT EFFEKTI BILAN) ---
function setTimer(min) {
    if (timer) clearInterval(timer);
    let sec = min * 60;
    const cd = document.getElementById("countdown");
    cd.style.opacity = "1";

    timer = setInterval(() => {
        sec--;
        // Vaqt formatlash
        cd.textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;

        // Oxirgi 5 soniyada ovoz pasayishi
        if (sec <= 5 && sec > 0) {
            const vol = sec / 5;
            mixPlayers.forEach(a => { if(a.volume > 0.1) a.volume = vol * 0.5; });
            directPlayers.forEach(a => a.volume = vol);
        }

        if (sec <= 0) {
            clearInterval(timer);
            stopAllSounds();
            cd.textContent = "";
        }
    }, 1000);
}

function stopAllSounds() {
    mixPlayers.forEach(p => { p.pause(); p.currentTime = 0; p.volume = 0.5; });
    directPlayers.forEach(p => { p.pause(); p.currentTime = 0; });
    directPlayers.clear();
    isMixPlaying = false;
    renderSounds();
    updatePlayButtonUI();
}

// Ilovani ishga tushirish
renderSounds();

