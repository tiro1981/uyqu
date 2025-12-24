
// --- 1. MA'LUMOTLAR ---
const CATEGORIES_DATA = [
    { name: "Yomg'ir", icon: "cloudy_snowing" },
    { name: "Dengiz", icon: "tsunami" },
    { name: "Olov", icon: "whatshot" },
    { name: "Qushlar", icon: "flutter_dash" },
    { name: "O'rmon", icon: "forest" },
    { name: "Tun", icon: "bedtime" },
    { name: "Chaqmoq", icon: "thunderstorm" }
];

const SOUNDS = [
    { id: 1, category: "Yomg'ir", file: "audios/rain.mp3", name: "Yengil yomg'ir", icon: "water_drop" },
    { id: 2, category: "Yomg'ir", file: "audios/rain1.mp3", name: "Kuchli yomg'ir", icon: "water_drop" },
    { id: 3, category: "Yomg'ir", file: "audios/rain2.mp3", name: "Darcha ortida", icon: "water_drop" },
    { id: 4, category: "Yomg'ir", file: "audios/rain3.mp3", name: "Momaqaldiroq", icon: "water_drop" },
    { id: 5, category: "Yomg'ir", file: "audios/rain4.mp3", name: "Tomchi", icon: "water_drop" },
    { id: 6, category: "Yomg'ir", file: "audios/rain5.mp3", name: "Yomg'ir 6", icon: "water_drop" },
    { id: 7, category: "Yomg'ir", file: "audios/rain6.mp3", name: "Yomg'ir 7", icon: "water_drop" },
    { id: 8, category: "Yomg'ir", file: "audios/rain7.mp3", name: "Yomg'ir 8", icon: "water_drop" },

    { id: 9, category: "Dengiz", file: "audios/ocean.mp3", name: "Sokin dengiz", icon: "tsunami" },
    { id: 10, category: "Dengiz", file: "audios/ocean1.mp3", name: "To'lqinlar", icon: "tsunami" },
    { id: 11, category: "Dengiz", file: "audios/ocean2.mp3", name: "Okean bag'ri", icon: "tsunami" },
    { id: 12, category: "Dengiz", file: "audios/ocean3.mp3", name: "Sohil", icon: "tsunami" },
    { id: 13, category: "Dengiz", file: "audios/ocean4.mp3", name: "Shovqin", icon: "tsunami" },
    { id: 14, category: "Dengiz", file: "audios/ocean5.mp3", name: "Chuqurlik", icon: "tsunami" },
    { id: 15, category: "Dengiz", file: "audios/ocean6.mp3", name: "Dengiz 7", icon: "tsunami" },
    
    { id: 16, category: "Olov", file: "audios/olov.mp3", name: "Kamin", icon: "fireplace" },
    { id: 17, category: "Olov", file: "audios/olov1.mp3", name: "Gultay", icon: "fireplace" },
    { id: 18, category: "Olov", file: "audios/olov2.mp3", name: "Katta olov", icon: "fireplace" },
    { id: 19, category: "Olov", file: "audios/olov3.mp3", name: "O'rmon olovi", icon: "fireplace" },
    { id: 20, category: "Olov", file: "audios/olov4.mp3", name: "Kichik olov", icon: "fireplace" },
    { id: 21, category: "Olov", file: "audios/olov5.mp3", name: "Kamin 2", icon: "fireplace" },
    
    { id: 22, category: "Qushlar", file: "audios/qush.mp3", name: "Tonggi sayrash", icon: "flutter_dash" },
    { id: 23, category: "Qushlar", file: "audios/qush1.mp3", name: "Buldurug'", icon: "flutter_dash" },
    { id: 24, category: "Qushlar", file: "audios/qush2.mp3", name: "Kukubara", icon: "flutter_dash" },
    { id: 25, category: "Qushlar", file: "audios/qush3.mp3", name: "Tropik", icon: "flutter_dash" },
    { id: 26, category: "Qushlar", file: "audios/qush4.mp3", name: "O'rmon qushi", icon: "flutter_dash" },
    { id: 27, category: "Qushlar", file: "audios/qush5.mp3", name: "Sayroqi qush", icon: "flutter_dash" },

    { id: 28, category: "O'rmon", file: "audios/ormon.mp3", name: "O'rmon ovozi", icon: "forest" },
    { id: 29, category: "O'rmon", file: "audios/ormon1.mp3", name: "Sokin bog'", icon: "forest" },
    { id: 30, category: "O'rmon", file: "audios/ormon2.mp3", name: "Yozgi kecha", icon: "forest" },
    { id: 31, category: "O'rmon", file: "audios/ormon3.mp3", name: "Yovvoyi tabiat", icon: "forest" },
    { id: 32, category: "O'rmon", file: "audios/ormon4.mp3", name: "Daraxtlar", icon: "forest" },

    { id: 33, category: "Tun", file: "audios/crickets.mp3", name: "Chigirtkalar", icon: "bug_report" },
    { id: 34, category: "Tun", file: "audios/night_ambience.mp3", name: "Tun sukunati", icon: "nights_stay" },
    { id: 35, category: "Chaqmoq", file: "audios/thunder_distant.mp3", name: "Uzoq guldurak", icon: "flash_on" },
];

// --- 2. GLOBAL O'ZGARUVCHILAR ---
let saved = [];
let directPlayers = new Map();
let mixPlayers = new Map();
let volumes = {};
let isMixPlaying = false;
let timer = null;
let currentCategory = null;
let totalSecondsPlayed = 0; 
let statsInterval = null;

// --- 3. DASTUR BOSHLANISHI ---
window.onload = function() {
    loadConfig();
    setupTelegram();
    renderCategories();
    startStatsTracking();
    
    document.getElementById('search').addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length > 0) {
            performGlobalSearch(query);
        } else {
            renderCategories();
        }
    });
};

// --- 4. FUNKSIYALAR ---
function performGlobalSearch(query) {
    document.getElementById("categoriesGrid").style.display = "none";
    document.getElementById("soundList").style.display = "grid";
    document.getElementById("backBtn").style.display = "flex"; 
    document.getElementById("libraryTitle").innerText = "Qidiruv natijalari";

    const list = document.getElementById("soundList");
    list.innerHTML = "";

    const results = SOUNDS.filter(s => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query));

    if (results.length === 0) {
        list.innerHTML = "<p style='grid-column: 1/-1; opacity:0.6; text-align:center; margin-top:20px;'>Hech narsa topilmadi</p>";
        return;
    }

    results.forEach(s => createSoundCard(s, list));
}

function renderCategories() {
    const grid = document.getElementById("categoriesGrid");
    grid.innerHTML = "";
    
    document.getElementById("categoriesGrid").style.display = "grid";
    document.getElementById("soundList").style.display = "none";
    document.getElementById("backBtn").style.display = "none"; 
    document.getElementById("libraryTitle").innerText = "Kutubxona";
    
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

function openCategory(catName) {
    haptic('light');
    currentCategory = catName;
    document.getElementById("categoriesGrid").style.display = "none";
    document.getElementById("soundList").style.display = "grid";
    document.getElementById("backBtn").style.display = "flex";
    document.getElementById("libraryTitle").innerText = catName;
    renderSoundsInsideCategory(catName);
}

function createSoundCard(s, container) {
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
    card.onclick = (e) => { if (!e.target.closest('.like-btn')) playDirect(s); };
    container.appendChild(card);
}

function playDirect(s) {
    haptic('light');
    if (directPlayers.has(s.id)) {
        directPlayers.get(s.id).pause();
        directPlayers.delete(s.id);
    } else {
        // Avvalgi barcha bir martalik ovozlarni to'xtatish
        directPlayers.forEach(p => p.pause());
        directPlayers.clear();

        const audio = new Audio(s.file);
        audio.loop = true;
        audio.volume = volumes[s.file] || 1.0; 
        audio.play().catch(e => console.log("Audio xatosi:", e));
        directPlayers.set(s.id, audio);
    }
    refreshUI();
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
    } else {
        saved.push(sound);
        if (!volumes[sound.file]) volumes[sound.file] = 0.5;
    }
    saveConfig();
    refreshUI();
    if(document.getElementById('mix').classList.contains('active')) renderMix();
}

function refreshUI() {
    const searchVal = document.getElementById("search").value.trim();
    if (searchVal.length > 0 && !currentCategory) {
        performGlobalSearch(searchVal.toLowerCase());
    } else if (currentCategory) {
        renderSoundsInsideCategory(currentCategory);
    }
}

function renderSoundsInsideCategory(category) {
    const list = document.getElementById("soundList");
    list.innerHTML = "";
    SOUNDS.filter(s => s.category === category).forEach(s => createSoundCard(s, list));
}

// --- MIX VA TAYMER MANTIQI ---
function renderMix() {
    const box = document.getElementById("mixList");
    if (saved.length === 0) {
        box.innerHTML = "<p style='text-align:center; opacity:0.5; margin-top:50px;'>Tanlangan ovozlar yo'q.</p>";
        updatePlayButtonUI();
        return;
    }
    box.innerHTML = "";
    saved.forEach(s => {
        const isPlaying = mixPlayers.has(s.file);
        const item = document.createElement("div");
        item.className = `mix-item-card ${isPlaying ? 'active-mix' : ''}`;
        item.innerHTML = `
            <div class="mix-head" onclick="playOne('${s.file}')">
                <div style="display:flex; align-items:center; gap:10px; flex:1; justify-content:center;">
                    <span class="material-icons-round">${s.icon}</span>
                    <span>${s.name}</span>
                </div>
                 <button class="icon-btn" onclick="toggleVolumeBar(event, this)">
                    <span class="material-icons-round">tune</span>
                </button>
            </div>
            <div class="mix-settings ${isPlaying ? 'active' : ''}">
                <input type="range" min="0" max="1" step="0.01" value="${volumes[s.file] || 0.5}" oninput="setMixVolume('${s.file}', this.value)"> 
            </div>
        `;
        box.appendChild(item);
    });
    updatePlayButtonUI();
}

function togglePlayAll() {
    haptic('medium');
    if (saved.length === 0) return;
    if (isMixPlaying) {
        mixPlayers.forEach(p => p.pause());
        mixPlayers.clear();
        isMixPlaying = false;
    } else {
        saved.forEach(s => {
            if (!mixPlayers.has(s.file)) {
                const audio = new Audio(s.file);
                audio.loop = true;
                audio.volume = volumes[s.file] || 0.5;
                audio.play();
                mixPlayers.set(s.file, audio);
            }
        });
        isMixPlaying = true;
    }
    renderMix();
}

function stopAllSounds() {
    mixPlayers.forEach(p => p.pause());
    mixPlayers.clear();
    directPlayers.forEach(p => p.pause());
    directPlayers.clear();
    isMixPlaying = false;
    if (timer) clearInterval(timer);
    document.getElementById("countdown").textContent = "";
    renderMix();
    updatePlayButtonUI();
}

// --- QOLGAN YORDAMCHI FUNKSIYALAR ---
function haptic(style = 'light') {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
}

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
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
    }
}

function startStatsTracking() {
    const storedTime = localStorage.getItem('relax_total_time');
    if (storedTime) totalSecondsPlayed = parseInt(storedTime);
    setInterval(() => {
        if (isMixPlaying || directPlayers.size > 0) {
            totalSecondsPlayed++;
            localStorage.setItem('relax_total_time', totalSecondsPlayed);
            updateStatsUI();
        }
    }, 1000);
}
