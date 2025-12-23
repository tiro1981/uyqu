// --- MA'LUMOTLAR BAZASI ---
const SOUNDS = [
    { id: 1, file: "audios/rain.mp3", name: "Yomg‘ir", icon: "cloudy_snowing" },
    { id: 2, file: "audios/ocean.mp3", name: "Dengiz", icon: "waves" },
    { id: 3, file: "audios/wind.mp3", name: "Shamol", icon: "air" },
    { id: 4, file: "audios/noise.mp3", name: "Shovqin", icon: "graphic_eq" },
    { id: 5, file: "audios/fire.mp3", name: "Olov", icon: "local_fire_department" },
    { id: 6, file: "audios/bird.mp3", name: "Qushlar", icon: "flutter_dash" },
    { id: 7, file: "audios/night.mp3", name: "Tun", icon: "nights_stay" },
    { id: 8, file: "audios/forest.mp3", name: "O'rmon", icon: "forest" },
    { id: 9, file: "audios/thunder.mp3", name: "Guldurak", icon: "thunderstorm" },
    { id: 10, file: "audios/cafe.mp3", name: "Kafe", icon: "coffee" }
];

// --- GLOBAL O'ZGARUVCHILAR ---
let saved = [];                
let directPlayers = new Map(); 
let mixPlayers = new Map();    
let volumes = {}; 
let isMixPlaying = false;      
let timer = null;

// --- DASTUR YUKLANGANDA ---
window.onload = function() {
    loadConfig(); // Xotiradan o'qish
    setupTelegram(); // Telegram ma'lumotlari
    renderSounds();
    
    // Qidiruv funksiyasini ulash
    document.getElementById('search').addEventListener('input', renderSounds);
};

// --- NAVIGATSIYA (Tuzatildi: switchTab) ---
function switchTab(screenId, btnElement) {
    // 1. Barcha ekranlarni yashirish
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    
    // 2. Kerakli ekranni ko'rsatish
    const targetScreen = document.getElementById(screenId);
    if(targetScreen) targetScreen.classList.add("active");
    
    // 3. Tugmalar stilini yangilash
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    if(btnElement) btnElement.classList.add("active");

    // 4. Agar Mix bo'limiga o'tilsa, ro'yxatni yangilash
    if (screenId === "mix") renderMix();
    
    haptic(); // Vibratsiya
}

// --- OVOZLAR KUTUBXONASI ---
function renderSounds() {
    const list = document.getElementById("soundList");
    const query = document.getElementById("search").value.toLowerCase();
    list.innerHTML = "";

    SOUNDS.filter(s => s.name.toLowerCase().includes(query)).forEach(s => {
        // Ob'ektni to'g'ri solishtirish uchun ID ishlatamiz
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
        
        // Karta bosilganda ijro etish
        card.onclick = (e) => {
            // Agar like tugmasi bosilmagan bo'lsa
            if (!e.target.closest('.like-btn')) {
                playDirect(s);
            }
        };
        list.appendChild(card);
    });
}

function playDirect(s) {
    haptic('light');
    if (directPlayers.has(s.id)) {
        directPlayers.get(s.id).pause();
        directPlayers.delete(s.id);
    } else {
        // Boshqa barcha yakkama-yakka ovozlarni o'chirish (ixtiyoriy)
        // directPlayers.forEach(p => p.pause());
        // directPlayers.clear();

        const audio = new Audio(s.file);
        audio.loop = true;
        audio.volume = volumes[s.file] || 1.0; 
        audio.play().catch(e => console.log(e));
        directPlayers.set(s.id, audio);
    }
    renderSounds();
}

function toggleSave(e, id) {
    e.stopPropagation(); 
    haptic('medium');
    
    const sound = SOUNDS.find(s => s.id === id);
    const index = saved.findIndex(s => s.id === id);

    if (index > -1) {
        // O'chirish
        saved.splice(index, 1);
        if (mixPlayers.has(sound.file)) {
            mixPlayers.get(sound.file).pause();
            mixPlayers.delete(sound.file);
        }
        // Agar mix bo'shab qolsa
        if (saved.length === 0) {
            isMixPlaying = false;
            stopAllSounds();
        }
    } else {
        // Qo'shish
        saved.push(sound);
        if (!volumes[sound.file]) volumes[sound.file] = 0.5;
        
        // Agar mix hozir o'ynayotgan bo'lsa, yangisini ham qo'shib yuboramiz
        if (isMixPlaying) startMixAudio(sound.file);
    }
    
    saveConfig(); // Xotiraga yozish
    renderSounds();
    if(document.getElementById('mix').classList.contains('active')) renderMix();
    updatePlayButtonUI();
}

// --- MIX BO'LIMI ---
function renderMix() {
    const box = document.getElementById("mixList");
    if (saved.length === 0) {
        box.innerHTML = "<p style='text-align:center; opacity:0.5; margin-top:50px;'>Hozircha tanlangan ovozlar yo'q.<br>Kutubxonadan ❤ bosib qo'shing.</p>";
        updatePlayButtonUI();
        return;
    }
    box.innerHTML = "";

    saved.forEach(s => {
        const isPlaying = mixPlayers.has(s.file);
        const currentVol = volumes[s.file] !== undefined ? volumes[s.file] : 0.5;

        const item = document.createElement("div");
        item.className = `mix-item-card ${isPlaying ? 'active-mix' : ''}`;
        
        item.innerHTML = `
            <div class="mix-head" onclick="playOne('${s.file}')">
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                    <span class="material-icons-round" style="color:${isPlaying?'white':'#818cf8'}">${s.icon}</span>
                    <span style="font-weight:500; ${isPlaying ? 'color:white':''}">${s.name}</span>
                </div>
                 <button class="icon-btn" onclick="toggleVolumeBar(event, this)" style="background:none; border:none; color:${isPlaying?'white':'#cbd5e1'};">
                    <span class="material-icons-round">tune</span>
                </button>
            </div>
            
            <div class="mix-settings ${isPlaying ? 'active' : ''}">
                <input type="range" min="0" max="1" step="0.01" 
                       value="${currentVol}" 
                       oninput="setMixVolume('${s.file}', this.value)"
                       onclick="event.stopPropagation()"
                       ontouchstart="event.stopPropagation()"> 
            </div>
        `;
        box.appendChild(item);
    });
    updatePlayButtonUI();
}

function toggleVolumeBar(e, btn) {
    e.stopPropagation();
    const settings = btn.closest('.mix-item-card').querySelector('.mix-settings');
    settings.classList.toggle('active');
}

function setMixVolume(file, val) {
    volumes[file] = val;
    if (mixPlayers.has(file)) {
        mixPlayers.get(file).volume = val;
    }
    saveConfig();
}

function playOne(file) {
    haptic('light');
    if (mixPlayers.has(file)) {
        mixPlayers.get(file).pause();
        mixPlayers.delete(file);
    } else {
        startMixAudio(file);
        // Agar bitta bo'lsa ham o'ynasa, umumiy statusni true qilamiz
        isMixPlaying = true;
    }
    renderMix();
    updatePlayButtonUI();
}

function startMixAudio(file) {
    if (!mixPlayers.has(file)) {
        const audio = new Audio(file);
        audio.loop = true;
        audio.volume = volumes[file] !== undefined ? volumes[file] : 0.5;
        audio.play().catch(e => console.log(e));
        mixPlayers.set(file, audio);
    }
}

// --- ASOSIY PLAY TUGMASI (Tuzatildi: togglePlayAll) ---
function togglePlayAll() {
    haptic('medium');
    if (saved.length === 0) return alert("Avval ro'yxatga ovoz qo'shing!");
    
    if (isMixPlaying) {
        // Hamma mixlarni to'xtatish
        mixPlayers.forEach(p => p.pause());
        mixPlayers.clear();
        isMixPlaying = false;
    } else {
        // Hammasini yoqish
        saved.forEach(s => startMixAudio(s.file));
        isMixPlaying = true;
    }
    renderMix();
    updatePlayButtonUI();
}

function updatePlayButtonUI() {
    const btn = document.getElementById("mainPlayBtn");
    
    // Agar mix o'ynayotgan bo'lsa yoki qisman o'ynayotgan bo'lsa (mixPlayers bo'sh bo'lmasa)
    if (mixPlayers.size > 0) {
        isMixPlaying = true;
        btn.style.background = "#f43f5e"; // Qizil rang
        btn.innerHTML = '<span class="material-icons-round">pause</span> To\'xtatish';
        document.getElementById("playText").innerText = "To'xtatish";
        document.getElementById("playIcon").innerText = "pause";
    } else {
        isMixPlaying = false;
        btn.style.background = "linear-gradient(135deg, #818cf8, #6366f1)";
        btn.innerHTML = '<span class="material-icons-round">play_arrow</span> Mixni tinglash';
        document.getElementById("playText").innerText = "Mixni tinglash";
        document.getElementById("playIcon").innerText = "play_arrow";
    }
}

// --- TIMER VA SOKINLASHTIRISH ---
function setTimer(min) {
    haptic();
    if (timer) clearInterval(timer);
    
    let sec = min * 60;
    const cd = document.getElementById("countdown");
    cd.style.opacity = "1";

    timer = setInterval(() => {
        sec--;
        // Vaqt formatlash
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        cd.textContent = `${m}:${String(s).padStart(2,'0')}`;

        // Oxirgi 10 soniyada ovoz sekin pasayadi
        if (sec <= 10 && sec > 0) {
            const fadeFactor = sec / 10;
            mixPlayers.forEach((a, file) => { 
                const baseVol = volumes[file] || 0.5;
                a.volume = baseVol * fadeFactor; 
            });
        }

        if (sec <= 0) {
            clearInterval(timer);
            stopAllSounds();
            cd.textContent = "";
            haptic('heavy');
        }
    }, 1000);
}

function stopAllSounds() {
    mixPlayers.forEach(p => p.pause());
    mixPlayers.clear();
    directPlayers.forEach(p => p.pause());
    directPlayers.clear();
    isMixPlaying = false;
    
    renderSounds();
    renderMix();
    updatePlayButtonUI();
}

// --- XOTIRA VA TELEGRAM ---
function saveConfig() {
    localStorage.setItem('relax_saved', JSON.stringify(saved));
    localStorage.setItem('relax_volumes', JSON.stringify(volumes));
}

function loadConfig() {
    const s = localStorage.getItem('relax_saved');
    const v = localStorage.getItem('relax_volumes');
    if (s) saved = JSON.parse(s);
    if (v) volumes = JSON.parse(v);
}

function setupTelegram() {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand(); // Ilovani to'liq ekranga yoyish

    // Ranglarni telefonga moslash
    document.documentElement.style.setProperty('--bg-dark', tg.themeParams.bg_color || '#0f172a');

    // User ma'lumotlari (Tuzatildi: ID "userName")
    const user = tg.initDataUnsafe.user;
    const nameEl = document.getElementById('userName');
    
    if (user && nameEl) {
        nameEl.innerText = user.first_name + (user.last_name ? " " + user.last_name : "");
    }
}

// Vibratsiya funksiyasi
function haptic(style = 'light') {
    if (window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
}
