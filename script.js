// --- 1. MA'LUMOTLAR ---
const CATEGORIES_DATA = [
    { name: "Yomg'ir", icon: "cloudy_snowing" },
    { name: "Dengiz", icon: "tsunami" },
    { name: "Shamol", icon: "air" },
    { name: "Olov", icon: "whatshot" },
    { name: "Qushlar", icon: "flutter_dash" },
    { name: "O'rmon", icon: "forest" },
    { name: "Tun", icon: "bedtime" },
    { name: "Chaqmoq", icon: "thunderstorm" }
];

const SOUNDS = [
    { id: 1, category: "Yomg'ir", file: "audios/rain_light.mp3", name: "Yengil yomg'ir", icon: "water_drop" },
    { id: 2, category: "Yomg'ir", file: "audios/rain_heavy.mp3", name: "Jala", icon: "umbrella" },
    { id: 4, category: "Dengiz", file: "audios/ocean_waves.mp3", name: "Sohil to'lqini", icon: "waves" },
    { id: 5, category: "Dengiz", file: "audios/underwater.mp3", name: "Suv osti", icon: "scuba_diving" },
    { id: 6, category: "Shamol", file: "audios/wind_soft.mp3", name: "Mayin shamol", icon: "air" },
    { id: 8, category: "Olov", file: "audios/fireplace.mp3", name: "Kamin", icon: "fireplace" },
    { id: 9, category: "Olov", file: "audios/bonfire.mp3", name: "Gulxan", icon: "local_fire_department" },
    { id: 10, category: "Qushlar", file: "audios/birds_morning.mp3", name: "Tonggi qushlar", icon: "flutter_dash" },
    { id: 12, category: "O'rmon", file: "audios/forest_day.mp3", name: "Yozgi o'rmon", icon: "forest" },
    { id: 14, category: "Tun", file: "audios/crickets.mp3", name: "Chigirtkalar", icon: "bug_report" },
    { id: 15, category: "Tun", file: "audios/night_ambience.mp3", name: "Tun sukunati", icon: "nights_stay" },
    { id: 16, category: "Chaqmoq", file: "audios/thunder_distant.mp3", name: "Uzoq guldurak", icon: "flash_on" },
];

// --- 2. GLOBAL O'ZGARUVCHILAR ---
let saved = [];
let directPlayers = new Map();
let mixPlayers = new Map();
let volumes = {};
let isMixPlaying = false;
let timer = null;
let currentCategory = null;

// Statistika uchun
let totalSecondsPlayed = 0; 
let statsInterval = null;

// --- 3. DASTUR BOSHLANISHI ---
window.onload = function() {
    loadConfig();
    setupTelegram();
    renderCategories(); // Dastur ochilganda kategoriyalar chiqadi
    startStatsTracking();
    
    // Qidiruv faqat bosh sahifada ishlaydi endi
    document.getElementById('search').addEventListener('input', (e) => {
        // Agar kategoriyalar ko'rinib turgan bo'lsa, qidiruv natijalarini qanday chiqarishni 
        // hal qilish kerak. Hozircha oddiy qoldiramiz.
    });
};

// --- 4. VAQT STATISTIKASI ---
function startStatsTracking() {
    const storedTime = localStorage.getItem('relax_total_time');
    if (storedTime) totalSecondsPlayed = parseInt(storedTime);
    updateStatsUI();

    statsInterval = setInterval(() => {
        if (isMixPlaying || directPlayers.size > 0) {
            totalSecondsPlayed++;
            if (totalSecondsPlayed % 5 === 0) {
                localStorage.setItem('relax_total_time', totalSecondsPlayed);
            }
            updateStatsUI();
        }
    }, 1000);
}

function updateStatsUI() {
    const el = document.getElementById('totalTimeDisplay');
    if (!el) return;

    const d = Math.floor(totalSecondsPlayed / (3600 * 24));
    const h = Math.floor((totalSecondsPlayed % (3600 * 24)) / 3600);
    const m = Math.floor((totalSecondsPlayed % 3600) / 60);
    const s = totalSecondsPlayed % 60;

    let text = "";
    if (d > 0) text += `${d} kun<br>`;
    if (h > 0) text += `${h} soat `;
    if (m > 0) text += `${m} daqiqa `;
    text += `${s} soniya`;

    el.innerHTML = text;
}

// --- 5. NAVIGATSIYA (MUHIM O'ZGARISH SHU YERDA) ---

// 5.1. Bosh sahifa (Kategoriyalar)
function renderCategories() {
    const grid = document.getElementById("categoriesGrid");
    grid.innerHTML = "";
    
    // UI Elementlarini boshqarish
    document.getElementById("categoriesGrid").style.display = "grid";
    document.getElementById("soundList").style.display = "none";
    document.getElementById("backBtn").style.display = "none"; // Orqaga tugmasi yo'q
    document.getElementById("libraryTitle").innerText = "Kutubxona";
    
    // QIDIRUVNI YOQISH (Bosh sahifada ko'rinadi)
    // .search-box klassiga ega elementni topamiz
    const searchBox = document.querySelector('.search-box');
    if(searchBox) searchBox.style.display = "flex";

    currentCategory = null;

    CATEGORIES_DATA.forEach(cat => {
        const count = SOUNDS.filter(s => s.category === cat.name).length;
        
        const card = document.createElement("div");
        card.className = "category-card";
        card.onclick = () => openCategory(cat.name);
        
        card.innerHTML = `
            <span class="material-icons-round cat-icon">${cat.icon}</span>
            <span class="cat-name">${cat.name}</span>
            <span class="cat-count">${count} ovoz</span>
        `;
        grid.appendChild(card);
    });
}

// 5.2. Kategoriya ichiga kirish
function openCategory(catName) {
    haptic('light');
    currentCategory = catName;
    
    // UI Elementlarini boshqarish
    document.getElementById("categoriesGrid").style.display = "none";
    document.getElementById("soundList").style.display = "grid";
    document.getElementById("backBtn").style.display = "flex"; // Orqaga tugmasi chiqadi
    document.getElementById("libraryTitle").innerText = catName;

    // QIDIRUVNI YASHIRISH (Ichki sahifada ko'rinmaydi)
    const searchBox = document.querySelector('.search-box');
    if(searchBox) searchBox.style.display = "none";
    
    // Inputni tozalab qo'yamiz, qaytib chiqqanda xalaqit bermasligi uchun
    document.getElementById("search").value = ""; 

    renderSounds(catName);
}

// 5.3. Orqaga qaytish
function goBack() {
    haptic('light');
    renderCategories();
}

// --- 6. OVOZLARNI CHIZISH ---
function renderSounds(category, query = "") {
    const list = document.getElementById("soundList");
    list.innerHTML = "";
    
    const filtered = SOUNDS.filter(s => 
        s.category === category && 
        s.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        list.innerHTML = "<p style='width:200%; opacity:0.6; text-align:center'>Ovozlar topilmadi</p>";
        return;
    }

    filtered.forEach(s => {
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
        
        card.onclick = (e) => {
            if (!e.target.closest('.like-btn')) playDirect(s);
        };
        list.appendChild(card);
    });
}

// --- 7. TABLAR (Pastki menyu) ---
function switchTab(screenId, btnElement) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
    
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    if(btnElement) btnElement.classList.add("active");

    if (screenId === "mix") renderMix();
    haptic();
}

// --- 8. PLAYER MANTIQI ---
function playDirect(s) {
    haptic('light');
    if (directPlayers.has(s.id)) {
        directPlayers.get(s.id).pause();
        directPlayers.delete(s.id);
    } else {
        directPlayers.forEach(p => p.pause());
        directPlayers.clear();

        const audio = new Audio(s.file);
        audio.loop = true;
        audio.volume = volumes[s.file] || 1.0; 
        audio.play().catch(e => console.log(e));
        directPlayers.set(s.id, audio);
    }
    renderSounds(currentCategory);
}

function toggleSave(e, id) {
    e.stopPropagation(); 
    haptic('medium');
    
    const sound = SOUNDS.find(s => s.id === id);
    const index = saved.findIndex(s => s.id === id);

    if (index > -1) {
        saved.splice(index, 1);
        if (mixPlayers.has(sound.file)) {
            mixPlayers.get(sound.file).pause();
            mixPlayers.delete(sound.file);
        }
        if (saved.length === 0) { isMixPlaying = false; stopAllSounds(); }
    } else {
        saved.push(sound);
        if (!volumes[sound.file]) volumes[sound.file] = 0.5;
        if (isMixPlaying) startMixAudio(sound.file);
    }
    
    saveConfig();
    if(currentCategory) renderSounds(currentCategory);
    if(document.getElementById('mix').classList.contains('active')) renderMix();
    updatePlayButtonUI();
}

// --- 9. MIX VA TAYMER ---
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
                <div style="display:flex; align-items:center; gap:10px; flex:1; justify-content:center;">
                    <span class="material-icons-round" style="color:${isPlaying?'white':'#818cf8'}">${s.icon}</span>
                    <span style="font-weight:500; ${isPlaying ? 'color:white':''}">${s.name}</span>
                </div>
                 <button class="icon-btn" onclick="toggleVolumeBar(event, this)" style="background:none; border:none; color:${isPlaying?'white':'#cbd5e1'}; width:30px; height:30px;">
                    <span class="material-icons-round">tune</span>
                </button>
            </div>
            <div class="mix-settings ${isPlaying ? 'active' : ''}">
                <input type="range" min="0" max="1" step="0.01" value="${currentVol}" oninput="setMixVolume('${s.file}', this.value)" onclick="event.stopPropagation()" ontouchstart="event.stopPropagation()"> 
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
    if (mixPlayers.has(file)) mixPlayers.get(file).volume = val;
    saveConfig();
}

function playOne(file) {
    haptic('light');
    if (mixPlayers.has(file)) {
        mixPlayers.get(file).pause();
        mixPlayers.delete(file);
    } else {
        startMixAudio(file);
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

function togglePlayAll() {
    haptic('medium');
    if (saved.length === 0) return alert("Avval ro'yxatga ovoz qo'shing!");
    if (isMixPlaying) {
        mixPlayers.forEach(p => p.pause());
        mixPlayers.clear();
        isMixPlaying = false;
    } else {
        saved.forEach(s => startMixAudio(s.file));
        isMixPlaying = true;
    }
    renderMix();
    updatePlayButtonUI();
}

function updatePlayButtonUI() {
    const btn = document.getElementById("mainPlayBtn");
    if (mixPlayers.size > 0) {
        isMixPlaying = true;
        btn.style.background = "#f43f5e";
        btn.innerHTML = '<span class="material-icons-round">pause</span> To\'xtatish';
    } else {
        isMixPlaying = false;
        btn.style.background = "linear-gradient(135deg, #818cf8, #6366f1)";
        btn.innerHTML = '<span class="material-icons-round">play_arrow</span> Mixni tinglash';
    }
}

function setTimer(min) {
    haptic();
    if (timer) clearInterval(timer);
    let sec = min * 60;
    const cd = document.getElementById("countdown");
    cd.style.opacity = "1";
    timer = setInterval(() => {
        sec--;
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        cd.textContent = `${m}:${String(s).padStart(2,'0')}`;
        if (sec <= 10 && sec > 0) {
            const fadeFactor = sec / 10;
            mixPlayers.forEach((a, file) => { a.volume = (volumes[file] || 0.5) * fadeFactor; });
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
    renderCategories(); 
    renderMix();
    updatePlayButtonUI();
}

// --- 10. SYSTEM ---
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
    tg.expand();
    document.documentElement.style.setProperty('--bg-dark', tg.themeParams.bg_color || '#0f172a');
    const user = tg.initDataUnsafe.user;
    const nameEl = document.getElementById('userName');
    if (user && nameEl) nameEl.innerText = user.first_name;
}

function haptic(style = 'light') {
    if (window.Telegram.WebApp.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
}
